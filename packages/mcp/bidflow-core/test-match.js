#!/usr/bin/env node
/**
 * MCP Server match_products Test
 * 175점 Enhanced Matcher 테스트
 */

import { spawn } from 'child_process';

const SUPABASE_URL = 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXlycmVuYmh3ZGZkZ25ubG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2Njc4NywiZXhwIjoyMDgxNzQyNzg3fQ._4XXwSYDm8JCFAwN6XyuUJyV6Ri2Og9pLCuBEbFM8tc';

// 테스트용 ID
const CMNTECH_TENANT_ID = '11111111-1111-1111-1111-111111111111';

// 실제 DB에서 조회한 입찰공고 ID
const BID_IDS = {
  '초음파유량계': '7d049fe8-c0a6-4be2-b1cc-e565123b632a',  // 서울시 상수도본부 4.5억
  '전자유량계': 'fc25e524-f892-4f18-93cf-c449259cdb8b',   // K-water 2.8억
  '비만관유량계': '9a1a8cd4-e4df-4cc9-850e-f5372b07713c', // 부산시 하수 1.8억
  '열량계': '0dce30d3-d60d-4aa6-a274-4df6c99721d6',       // 지역난방 3.2억
  '개수로유량계': 'dbe5393f-6d6c-4afd-b744-c1953b9a627d', // 농어촌공사 1.5억
};

// 실제 DB에서 조회한 제품 ID
const PRODUCT_IDS = {
  'UR-1000PLUS': '47dbf9b0-8804-4b6c-b754-38b56a96212a',  // 다회선 초음파유량계
  'MF-1000C': '05e1491d-7673-47e8-b5b3-c3813fdf7000',     // 일체형 전자유량계
  'UR-1010PLUS': '68ec95d0-39e8-42fa-a00d-14bb1cd6bcc9',  // 비만관형 초음파유량계
  'SL-3000PLUS': 'ff9f484b-dfbd-4384-b4fb-2248c3d5ae51',  // 개수로 유량계
  'EnerRay': '088c8e67-92ae-498b-ab88-d6a4ddc86310',      // 초음파 열량계
};

let messageId = 0;
function mcpRequest(method, params = {}) {
  return JSON.stringify({ jsonrpc: '2.0', id: ++messageId, method, params });
}

async function test() {
  console.log('🎯 Enhanced Matcher (175점) 테스트\n');
  console.log('📦 씨엠엔텍 제품 5개:');
  console.log('   1. UR-1000PLUS (다회선 초음파유량계)');
  console.log('   2. MF-1000C (일체형 전자유량계)');
  console.log('   3. UR-1010PLUS (비만관 초음파유량계)');
  console.log('   4. SL-3000PLUS (개수로 유량계)');
  console.log('   5. EnerRay (초음파 열량계)\n');

  const server = spawn('node', ['dist/index.js'], {
    env: { ...process.env, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SUPABASE_KEY },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stderr.on('data', (d) => console.log('📝', d.toString().trim()));

  const responses = [];
  let buffer = '';

  server.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        try { responses.push(JSON.parse(line)); } catch {}
      }
    }
  });

  await new Promise(r => setTimeout(r, 800));

  // Initialize
  server.stdin.write(mcpRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' },
  }) + '\n');
  await new Promise(r => setTimeout(r, 300));

  // Test each bid
  const tests = [
    { name: '서울시 초음파유량계', bidId: BID_IDS['초음파유량계'] },
    { name: 'K-water 전자유량계', bidId: BID_IDS['전자유량계'] },
    { name: '부산시 비만관유량계', bidId: BID_IDS['비만관유량계'] },
    { name: '지역난방 열량계', bidId: BID_IDS['열량계'] },
    { name: '농어촌공사 개수로', bidId: BID_IDS['개수로유량계'] },
  ];

  for (const test of tests) {
    console.log(`\n━━━ ${test.name} 매칭 ━━━`);
    server.stdin.write(mcpRequest('tools/call', {
      name: 'match_products',
      arguments: {
        bid_id: test.bidId,
        tenant_id: CMNTECH_TENANT_ID,
      },
    }) + '\n');
    await new Promise(r => setTimeout(r, 1500));
  }

  server.stdin.end();

  await new Promise(r => {
    server.on('close', () => {
      console.log('\n\n📊 매칭 결과 상세:\n');

      // Parse and display results
      let testIdx = 0;
      for (const resp of responses) {
        if (resp.result?.content?.[0]?.text) {
          try {
            const data = JSON.parse(resp.result.content[0].text);

            if (data.matches) {
              const bidTitle = data.bid_title?.slice(0, 40) || tests[testIdx]?.name;
              console.log(`📋 ${bidTitle}...`);

              // Sort by score
              const sorted = data.matches.sort((a, b) => b.total_score - a.total_score);

              sorted.forEach((m, i) => {
                const action = m.action === 'BID' ? '🟢 BID' :
                               m.action === 'REVIEW' ? '🟡 REVIEW' : '⚪ SKIP';
                const keywords = m.matched_keywords?.join(', ') || '-';

                console.log(`   ${i+1}. ${m.product_name}`);
                console.log(`      점수: ${m.total_score}점 (키워드:${m.keyword_score} 규격:${m.spec_score} 기관:${m.org_score})`);
                console.log(`      ${action} | 매칭 키워드: ${keywords}`);
              });

              console.log('');
              testIdx++;
            } else if (data.error) {
              console.log(`   ❌ 오류: ${data.message?.slice(0, 100)}`);
            }
          } catch {}
        }
      }

      r();
    });
  });
}

test().catch(console.error);
