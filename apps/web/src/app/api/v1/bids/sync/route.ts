/**
 * 입찰 데이터 동기화 API
 * - G2B (나라장터), TED (EU), SAM.gov (US) API 연동
 * - Google Sheets 연동을 위한 데이터 수집
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { unifiedClient, type BidSource, googleSheetsClient, type BidRow } from '@/lib/clients';
import { createClient, type TypedSupabaseClient } from '@/lib/supabase/server';

// 요청 스키마
const SyncRequestSchema = z.object({
  source: z.enum(['all', 'g2b', 'ted', 'sam']).default('all'),
  options: z
    .object({
      exportToSheets: z.boolean().optional().default(false),
      notifyOnComplete: z.boolean().optional().default(true),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

// 동기화 통계 타입
interface SyncStats {
  g2b: number;
  ted: number;
  sam: number;
  inserted: number;
  updated: number;
  errors: string[];
  sheetsExport?: {
    success: boolean;
    rowsWritten: number;
    spreadsheetUrl: string | null;
  };
}

// DB 데이터를 Google Sheets 형식으로 변환
function toBidRow(dbBid: {
  id: string;
  bid_number: string;
  source: string;
  title: string;
  organization: string | null;
  deadline: string | null;
  budget: number | null;
  status: string;
  priority: string | null;
  match_score: number | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}): BidRow {
  return {
    id: dbBid.id,
    source: dbBid.source,
    externalId: dbBid.bid_number,
    title: dbBid.title,
    organization: dbBid.organization || '',
    deadline: dbBid.deadline,
    estimatedAmount: dbBid.budget,
    currency: 'KRW',
    country: dbBid.source === 'g2b' ? 'KR' : dbBid.source === 'ted' ? 'EU' : 'US',
    status: dbBid.status,
    priority: dbBid.priority || 'medium',
    matchScore: dbBid.match_score,
    url: dbBid.source_url,
    createdAt: dbBid.created_at,
    updatedAt: dbBid.updated_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, options } = SyncRequestSchema.parse(body);

    const supabase = await createClient();
    const stats: SyncStats = {
      g2b: 0,
      ted: 0,
      sam: 0,
      inserted: 0,
      updated: 0,
      errors: [],
    };

    console.log(`[Sync] Starting sync for source: ${source}`);

    // 소스별 데이터 수집
    if (source === 'all' || source === 'g2b') {
      try {
        const g2bBids = await unifiedClient.clients.g2b.fetchTodayBids();
        stats.g2b = g2bBids.length;

        for (const bid of g2bBids) {
          const result = await upsertBid(supabase, bid, 'g2b');
          if (result.inserted) stats.inserted++;
          if (result.updated) stats.updated++;
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : 'G2B sync failed';
        stats.errors.push(`G2B: ${error}`);
        console.error('[Sync] G2B error:', error);
      }
    }

    if (source === 'all' || source === 'ted') {
      try {
        const tedBids = await unifiedClient.clients.ted.searchManufacturing();
        stats.ted = tedBids.length;

        for (const bid of tedBids) {
          const result = await upsertBid(supabase, bid, 'ted');
          if (result.inserted) stats.inserted++;
          if (result.updated) stats.updated++;
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : 'TED sync failed';
        stats.errors.push(`TED: ${error}`);
        console.error('[Sync] TED error:', error);
      }
    }

    if (source === 'all' || source === 'sam') {
      try {
        const samBids = await unifiedClient.clients.sam.searchManufacturing();
        stats.sam = samBids.length;

        for (const bid of samBids) {
          const result = await upsertBid(supabase, bid, 'sam');
          if (result.inserted) stats.inserted++;
          if (result.updated) stats.updated++;
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : 'SAM sync failed';
        stats.errors.push(`SAM: ${error}`);
        console.error('[Sync] SAM error:', error);
      }
    }

    const total = stats.g2b + stats.ted + stats.sam;
    console.log(
      `[Sync] Complete: ${total} bids (G2B: ${stats.g2b}, TED: ${stats.ted}, SAM: ${stats.sam})`
    );

    // Google Sheets 내보내기
    if (options?.exportToSheets) {
      console.log('[Sync] Exporting to Google Sheets...');
      try {
        // DB에서 모든 입찰 데이터 조회
        type DbBid = {
          id: string;
          bid_number: string;
          source: string;
          title: string;
          organization: string | null;
          deadline: string | null;
          budget: number | null;
          status: string;
          priority: string | null;
          match_score: number | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        };

        const { data: allBids } = await supabase
          .from('bids')
          .select(
            'id, bid_number, source, title, organization, deadline, budget, status, priority, match_score, source_url, created_at, updated_at'
          )
          .order('updated_at', { ascending: false });

        if (allBids && allBids.length > 0) {
          const bidRows = (allBids as DbBid[]).map(toBidRow);

          // 소스별 분리
          const g2bRows = bidRows.filter((b) => b.source === 'g2b');
          const tedRows = bidRows.filter((b) => b.source === 'ted');
          const samRows = bidRows.filter((b) => b.source === 'sam');

          // Google Sheets에 쓰기
          const sheetsResult = await googleSheetsClient.writeBidsBySource(
            g2bRows,
            tedRows,
            samRows
          );

          stats.sheetsExport = {
            success: sheetsResult.all.success,
            rowsWritten: sheetsResult.all.rowsWritten,
            spreadsheetUrl: sheetsResult.all.spreadsheetUrl,
          };

          console.log(`[Sync] Sheets export: ${sheetsResult.all.rowsWritten} rows written`);
        }
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Sheets export failed';
        stats.errors.push(`Sheets: ${error}`);
        console.error('[Sync] Sheets error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      message: `${total}건 동기화 완료 (신규: ${stats.inserted}, 업데이트: ${stats.updated})`,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '동기화 실패' },
      { status: 500 }
    );
  }
}

// Supabase에 입찰 데이터 upsert
// DB 스키마에 맞게 변환하여 저장
async function upsertBid(
  supabase: TypedSupabaseClient,
  bid: {
    id: string;
    externalId: string;
    title: string;
    description: string | null;
    deadline: Date | null;
    budgetMin: number | null;
    budgetMax: number | null;
    currency: string;
    country: string;
    buyerName: string;
    originalUrl: string | null;
    rawData: unknown;
  },
  source: BidSource
): Promise<{ inserted: boolean; updated: boolean }> {
  // DB 스키마에 맞는 컬럼명 사용
  type BidIdResult = { id: string };
  const { data: existing } = await supabase
    .from('bids')
    .select('id')
    .eq('bid_number', bid.externalId)
    .eq('source', source)
    .single();

  // DB 스키마에 맞게 데이터 변환
  const bidData = {
    bid_number: bid.externalId,
    source: source as 'g2b' | 'ted' | 'sam' | 'custom',
    title: bid.title,
    description: bid.description,
    deadline: bid.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    organization: bid.buyerName,
    budget: bid.budgetMax || bid.budgetMin,
    source_url: bid.originalUrl,
    raw_data: bid.rawData as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const existingBid = existing as BidIdResult;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('bids') as any).update(bidData).eq('id', existingBid.id);
    return { inserted: false, updated: true };
  } else {
    // 새 데이터 삽입 시 필수 필드 추가
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('bids') as any).insert({
      ...bidData,
      user_id: '00000000-0000-0000-0000-000000000000', // 시스템 사용자 ID
      status: 'new',
      processing_status: 'pending',
      matched: false,
      leads_generated: 0,
    });

    if (error) {
      console.error('[Sync] Insert error:', error);
      return { inserted: false, updated: false };
    }
    return { inserted: true, updated: false };
  }
}

// GET: 동기화 상태 조회
export async function GET() {
  try {
    const supabase = await createClient();

    // 각 소스별 최신 동기화 시간 조회
    type BidRow = { source: string; updated_at: string };
    const { data: latestBids } = await supabase
      .from('bids')
      .select('source, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);

    const lastSync: Record<string, string | null> = {
      g2b: null,
      ted: null,
      sam: null,
    };

    if (latestBids) {
      for (const bid of latestBids as BidRow[]) {
        if (!lastSync[bid.source]) {
          lastSync[bid.source] = bid.updated_at;
        }
      }
    }

    // 총 입찰 건수
    const { count: totalCount } = await supabase
      .from('bids')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      status: {
        total: totalCount || 0,
        lastSync,
      },
    });
  } catch (error) {
    console.error('[Sync] Status error:', error);
    return NextResponse.json({ success: false, error: '상태 조회 실패' }, { status: 500 });
  }
}
