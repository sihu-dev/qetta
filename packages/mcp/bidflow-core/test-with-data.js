#!/usr/bin/env node
/**
 * BIDFLOW MCP Server Test with Real Data
 * 모의 데이터를 Supabase에 삽입 후 MCP 도구 테스트
 */

import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXlycmVuYmh3ZGZkZ25ubG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2Njc4NywiZXhwIjoyMDgxNzQyNzg3fQ._4XXwSYDm8JCFAwN6XyuUJyV6Ri2Og9pLCuBEbFM8tc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 씨엠엔텍 테넌트 ID
const CMNTECH_TENANT_ID = '11111111-1111-1111-1111-111111111111';

// 모의 입찰 데이터
const MOCK_BIDS = [
  {
    source_id: 'g2b',
    external_id: 'G2B-2025-001',
    title: '[긴급] 서울시 상수도본부 초음파유량계 설치 및 유지관리 (DN300-1000, 25대)',
    organization: '서울시 상수도사업본부',
    estimated_price: 450000000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // D-7
    status: 'new',
    url: 'https://www.g2b.go.kr/bid/001',
    raw_data: { bidNtceNo: '20250001', bidNtceOrd: '00' },
  },
  {
    source_id: 'g2b',
    external_id: 'G2B-2025-002',
    title: 'K-water 정수장 전자유량계 교체 공사 (DN50-150, 일체형)',
    organization: 'K-water 한국수자원공사',
    estimated_price: 280000000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // D-14
    status: 'new',
    url: 'https://www.g2b.go.kr/bid/002',
    raw_data: { bidNtceNo: '20250002', bidNtceOrd: '00' },
  },
  {
    source_id: 'g2b',
    external_id: 'G2B-2025-003',
    title: '부산시 하수처리장 비만관 유량계 구매 (DN200-500)',
    organization: '부산광역시 환경시설공단',
    estimated_price: 180000000,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    url: 'https://www.g2b.go.kr/bid/003',
    raw_data: { bidNtceNo: '20250003', bidNtceOrd: '00' },
  },
  {
    source_id: 'g2b',
    external_id: 'G2B-2025-004',
    title: '한국지역난방공사 열량계 납품 (DN25-100, 초음파식)',
    organization: '한국지역난방공사',
    estimated_price: 320000000,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    url: 'https://www.g2b.go.kr/bid/004',
    raw_data: { bidNtceNo: '20250004', bidNtceOrd: '00' },
  },
  {
    source_id: 'g2b',
    external_id: 'G2B-2025-005',
    title: '농어촌공사 농업용수 개수로 유량계 설치',
    organization: '한국농어촌공사',
    estimated_price: 150000000,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    url: 'https://www.g2b.go.kr/bid/005',
    raw_data: { bidNtceNo: '20250005', bidNtceOrd: '00' },
  },
];

// MCP 메시지 생성
let messageId = 0;
function createMCPRequest(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: ++messageId,
    method,
    params,
  });
}

async function insertMockData() {
  console.log('📥 모의 데이터 삽입 중...\n');

  // 1. 씨엠엔텍 테넌트 확인/생성
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'cmntech')
    .single();

  let tenantId = tenant?.id;

  if (!tenantId) {
    const { data: newTenant, error } = await supabase
      .from('tenants')
      .insert({
        name: '씨엠엔텍',
        slug: 'cmntech',
        plan: 'pro',
        settings: {
          notification: { email: true, slack: true },
          matching: { minScore: 70, autoAction: true },
          sources: { g2b: true, ted: false, sam_gov: false },
          industry: ['flowmeter', 'instrumentation'],
          region: ['KR'],
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('테넌트 생성 실패:', error.message);
      return null;
    }
    tenantId = newTenant.id;
    console.log('✅ 테넌트 생성됨:', tenantId);
  } else {
    console.log('✅ 기존 테넌트 사용:', tenantId);
  }

  // 2. 입찰 공고 삽입
  for (const bid of MOCK_BIDS) {
    const { error } = await supabase
      .from('bids')
      .upsert({
        ...bid,
        tenant_id: tenantId,
      }, { onConflict: 'tenant_id,external_id' });

    if (error) {
      console.log(`  ⚠️ ${bid.external_id}: ${error.message}`);
    } else {
      console.log(`  ✓ ${bid.external_id}: ${bid.title.slice(0, 40)}...`);
    }
  }

  return tenantId;
}

async function testMCPServer(tenantId) {
  console.log('\n🚀 MCP 서버 테스트 시작...\n');

  const server = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_KEY,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stderr.on('data', (data) => {
    console.log('📝 Server:', data.toString().trim());
  });

  let responses = [];
  let buffer = '';

  server.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          responses.push(response);
        } catch {}
      }
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Initialize
  server.stdin.write(createMCPRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Test 1: search_bids
  console.log('--- Test 1: search_bids (유량계 검색) ---');
  server.stdin.write(createMCPRequest('tools/call', {
    name: 'search_bids',
    arguments: { keywords: ['유량계'], limit: 10 },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Print results
  const searchResult = responses.find(r => r.id === 2);
  if (searchResult?.result?.content?.[0]?.text) {
    const data = JSON.parse(searchResult.result.content[0].text);
    console.log(`📊 검색 결과: ${data.count}건`);
    if (data.bids?.length > 0) {
      data.bids.slice(0, 3).forEach((bid, i) => {
        console.log(`   ${i + 1}. ${bid.title?.slice(0, 50)}...`);
        console.log(`      💰 ${(bid.estimated_price / 100000000).toFixed(1)}억 | 📅 ${bid.deadline?.split('T')[0]}`);
      });
    }
  }

  // Test 2: get_stats
  console.log('\n--- Test 2: get_stats (통계) ---');
  server.stdin.write(createMCPRequest('tools/call', {
    name: 'get_stats',
    arguments: { tenant_id: tenantId, period: 'week' },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const statsResult = responses.find(r => r.id === 3);
  if (statsResult?.result?.content?.[0]?.text) {
    const stats = JSON.parse(statsResult.result.content[0].text);
    console.log(`📊 통계:`, stats);
  }

  // Test 3: match_products (if products exist)
  console.log('\n--- Test 3: match_products (매칭) ---');

  // Get a bid ID first
  const { data: bids } = await supabase
    .from('bids')
    .select('id, title')
    .eq('tenant_id', tenantId)
    .limit(1);

  if (bids?.[0]) {
    server.stdin.write(createMCPRequest('tools/call', {
      name: 'match_products',
      arguments: {
        bid_id: bids[0].id,
        tenant_id: tenantId,
      },
    }) + '\n');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const matchResult = responses.find(r => r.id === 4);
    if (matchResult?.result?.content?.[0]?.text) {
      const data = JSON.parse(matchResult.result.content[0].text);
      console.log(`📊 매칭 결과: ${data.bid_title?.slice(0, 40)}...`);
      if (data.matches?.length > 0) {
        data.matches.forEach((m, i) => {
          console.log(`   ${i + 1}. ${m.product_name}: ${m.total_score}점 → ${m.action}`);
        });
      } else {
        console.log('   (제품 데이터 없음)');
      }
    }
  }

  server.stdin.end();

  await new Promise((resolve) => {
    server.on('close', () => {
      console.log('\n✅ 테스트 완료!');
      resolve();
    });
  });
}

async function main() {
  try {
    const tenantId = await insertMockData();
    if (tenantId) {
      await testMCPServer(tenantId);
    }
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

main();
