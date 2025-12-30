/**
 * Google Sheets API 엔드포인트
 *
 * - 스프레드시트 생성
 * - 데이터 내보내기/가져오기
 * - 연결 상태 확인
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { googleSheetsClient, type BidRow } from '@/lib/clients';
import { createClient } from '@/lib/supabase/server';

// 요청 스키마
const SheetsActionSchema = z.object({
  action: z.enum(['create', 'export', 'import', 'health']),
  title: z.string().optional(), // create 시 스프레드시트 제목
  sheetName: z.string().optional(), // export/import 시 시트 이름
});

// DB 데이터를 Sheets 형식으로 변환
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

function toBidRow(dbBid: DbBid): BidRow {
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
    const { action, title, sheetName } = SheetsActionSchema.parse(body);

    switch (action) {
      case 'create': {
        // 새 스프레드시트 생성
        const spreadsheetTitle =
          title || `BIDFLOW 입찰 관리 - ${new Date().toLocaleDateString('ko-KR')}`;
        const spreadsheetId = await googleSheetsClient.createSpreadsheet(spreadsheetTitle);

        return NextResponse.json({
          success: true,
          spreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
          message: '스프레드시트가 생성되었습니다.',
        });
      }

      case 'export': {
        // DB 데이터를 스프레드시트로 내보내기
        const supabase = await createClient();

        const { data: allBids } = await supabase
          .from('bids')
          .select(
            'id, bid_number, source, title, organization, deadline, budget, status, priority, match_score, source_url, created_at, updated_at'
          )
          .order('updated_at', { ascending: false });

        if (!allBids || allBids.length === 0) {
          return NextResponse.json({
            success: false,
            error: '내보낼 입찰 데이터가 없습니다.',
          });
        }

        const bidRows = (allBids as DbBid[]).map(toBidRow);
        const result = await googleSheetsClient.writeBids(bidRows, sheetName || '입찰 목록');

        return NextResponse.json({
          success: result.success,
          rowsWritten: result.rowsWritten,
          spreadsheetUrl: result.spreadsheetUrl,
          error: result.error,
        });
      }

      case 'import': {
        // 스프레드시트에서 데이터 가져오기
        const bids = await googleSheetsClient.readBids(sheetName || '입찰 목록');

        return NextResponse.json({
          success: true,
          bids,
          count: bids.length,
        });
      }

      case 'health': {
        // 연결 상태 확인
        const health = await googleSheetsClient.healthCheck();

        return NextResponse.json({
          success: true,
          ...health,
        });
      }

      default:
        return NextResponse.json({ success: false, error: '알 수 없는 액션' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Sheets API] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'API 오류' },
      { status: 500 }
    );
  }
}

// GET: 스프레드시트 연결 상태 확인
export async function GET() {
  try {
    const health = await googleSheetsClient.healthCheck();
    const spreadsheetUrl = googleSheetsClient.getSpreadsheetUrl();

    return NextResponse.json({
      success: true,
      connected: health.connected,
      spreadsheetId: health.spreadsheetId,
      spreadsheetUrl,
    });
  } catch (error) {
    console.error('[Sheets API] Health check error:', error);
    return NextResponse.json(
      { success: false, connected: false, error: '연결 확인 실패' },
      { status: 500 }
    );
  }
}
