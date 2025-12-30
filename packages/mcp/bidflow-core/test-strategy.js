#!/usr/bin/env node
/**
 * 입찰 전략 엔진 v2.0 테스트
 * 2025년 공공조달 실제 로직 기반
 */

import { spawn } from 'child_process';

const SUPABASE_URL = 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXlycmVuYmh3ZGZkZ25ubG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2Njc4NywiZXhwIjoyMDgxNzQyNzg3fQ._4XXwSYDm8JCFAwN6XyuUJyV6Ri2Og9pLCuBEbFM8tc';

const CMNTECH_TENANT_ID = '11111111-1111-1111-1111-111111111111';

// 실제 DB에서 조회한 제품 ID
const PRODUCT_IDS = {
  'UR-1000PLUS': '47dbf9b0-8804-4b6c-b754-38b56a96212a',  // 다회선 초음파유량계
  'MF-1000C': '05e1491d-7673-47e8-b5b3-c3813fdf7000',     // 일체형 전자유량계
  'UR-1010PLUS': '68ec95d0-39e8-42fa-a00d-14bb1cd6bcc9',  // 비만관형 초음파유량계
  'SL-3000PLUS': 'ff9f484b-dfbd-4384-b4fb-2248c3d5ae51',  // 개수로 유량계
  'EnerRay': '088c8e67-92ae-498b-ab88-d6a4ddc86310',      // 초음파 열량계
};

// 테스트 케이스
const TEST_CASES = [
  {
    name: '서울시 4.5억 초음파유량계 (적격심사)',
    bidId: '7d049fe8-c0a6-4be2-b1cc-e565123b632a',
    productId: PRODUCT_IDS['UR-1000PLUS'],
    strategy: 'balanced',
    bidType: 'goods',
    contractType: 'qualification_review',
  },
  {
    name: 'K-water 2.8억 전자유량계 (공격적)',
    bidId: 'fc25e524-f892-4f18-93cf-c449259cdb8b',
    productId: PRODUCT_IDS['MF-1000C'],
    strategy: 'aggressive',
    bidType: 'goods',
    contractType: 'sme_competition',
  },
  {
    name: '지역난방 3.2억 열량계 (보수적)',
    bidId: '0dce30d3-d60d-4aa6-a274-4df6c99721d6',
    productId: PRODUCT_IDS['EnerRay'],
    strategy: 'conservative',
    bidType: 'goods',
    contractType: 'qualification_review',
  },
];

let messageId = 0;
function mcpRequest(method, params = {}) {
  return JSON.stringify({ jsonrpc: '2.0', id: ++messageId, method, params });
}

async function test() {
  console.log('🎯 입찰 전략 엔진 v2.0 테스트\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2025년 공공조달 실제 로직 기반:');
  console.log('  • 예정가격 예측 (15개 예비가격 + 사정률)');
  console.log('  • 낙찰하한율 (물품 84.245%, 중기경쟁 87.995%)');
  console.log('  • 적격심사 점수 (납품실적/신용등급/가격점수)');
  console.log('  • 낙찰 확률 (정규분포 모델)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

  // 각 테스트 케이스 실행
  for (const tc of TEST_CASES) {
    console.log(`\n━━━ ${tc.name} ━━━`);
    server.stdin.write(mcpRequest('tools/call', {
      name: 'get_stofo_prediction',
      arguments: {
        bid_id: tc.bidId,
        product_id: tc.productId,
        tenant_id: CMNTECH_TENANT_ID,
        strategy: tc.strategy,
        bid_type: tc.bidType,
        contract_type: tc.contractType,
        credit_rating: 'A0', // 씨엠엔텍 신용등급 가정
      },
    }) + '\n');
    await new Promise(r => setTimeout(r, 2000));
  }

  server.stdin.end();

  await new Promise(r => {
    server.on('close', () => {
      console.log('\n\n📊 전략 분석 결과:\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      let testIdx = 0;
      for (const resp of responses) {
        if (resp.result?.content?.[0]?.text) {
          try {
            const data = JSON.parse(resp.result.content[0].text);

            if (data.prediction) {
              const p = data.prediction;
              const tc = TEST_CASES[testIdx];

              console.log(`\n📋 ${tc?.name || p.bid_title}`);
              console.log(`   추정가격: ${(p.estimated_price / 100000000).toFixed(1)}억원`);
              console.log(`   기관: ${p.organization}`);

              console.log(`\n   ⭐ 추천: ${getRecommendationEmoji(p.recommendation)} ${p.recommendation}`);
              console.log(`   📈 낙찰확률: ${p.win_probability_percent} (위험도: ${p.risk_level})`);

              console.log(`\n   💰 최적 투찰가: ${p.optimal_bid_price?.toLocaleString()}원 (${p.optimal_bid_rate})`);
              if (p.bid_price_range) {
                console.log(`      공격적: ${p.bid_price_range.aggressive?.toLocaleString()}원`);
                console.log(`      균형형: ${p.bid_price_range.balanced?.toLocaleString()}원`);
                console.log(`      보수적: ${p.bid_price_range.conservative?.toLocaleString()}원`);
              }

              if (p.qualification_score) {
                const qs = p.qualification_score;
                console.log(`\n   📝 적격심사: ${qs.total}점 (${qs.will_pass ? '✅ 통과' : '❌ 미달'})`);
                console.log(`      납품실적: ${qs.deliveryRecord}점 / 25`);
                console.log(`      기술능력: ${qs.techCapability}점 / 5`);
                console.log(`      신용등급: ${qs.financialStatus}점 / 15`);
                console.log(`      가격점수: ${qs.priceScore}점 / 50`);
                console.log(`      신인도: ${qs.reliability >= 0 ? '+' : ''}${qs.reliability}점`);
              }

              console.log(`\n   📊 예상 사정률: ${p.expected_assessment_rate}`);

              if (p.reasoning?.length) {
                console.log(`\n   💡 분석 근거:`);
                p.reasoning.forEach(r => console.log(`      • ${r}`));
              }

              console.log('\n   ' + '─'.repeat(50));
              testIdx++;
            }
          } catch (e) {
            console.log('Parse error:', e.message);
          }
        }
      }

      console.log('\n✅ 테스트 완료!');
      r();
    });
  });
}

function getRecommendationEmoji(rec) {
  switch (rec) {
    case 'STRONG_BID': return '🟢🟢';
    case 'BID': return '🟢';
    case 'REVIEW': return '🟡';
    case 'SKIP': return '⚪';
    default: return '❓';
  }
}

test().catch(console.error);
