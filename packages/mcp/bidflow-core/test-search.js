#!/usr/bin/env node
/**
 * MCP Server Search Test
 */

import { spawn } from 'child_process';

const SUPABASE_URL = 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXlycmVuYmh3ZGZkZ25ubG5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2Njc4NywiZXhwIjoyMDgxNzQyNzg3fQ._4XXwSYDm8JCFAwN6XyuUJyV6Ri2Og9pLCuBEbFM8tc';

let messageId = 0;
function mcpRequest(method, params = {}) {
  return JSON.stringify({ jsonrpc: '2.0', id: ++messageId, method, params });
}

async function test() {
  console.log('🚀 MCP 서버 검색 테스트\n');

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

  // Test 1: Search all
  console.log('--- 1. 전체 검색 ---');
  server.stdin.write(mcpRequest('tools/call', {
    name: 'search_bids',
    arguments: { limit: 10 },
  }) + '\n');
  await new Promise(r => setTimeout(r, 1000));

  // Test 2: Search with keyword
  console.log('--- 2. 키워드 검색 (유량계) ---');
  server.stdin.write(mcpRequest('tools/call', {
    name: 'search_bids',
    arguments: { keywords: ['유량계'], limit: 5 },
  }) + '\n');
  await new Promise(r => setTimeout(r, 1000));

  // Test 3: Get detail
  console.log('--- 3. 상세 조회 ---');
  server.stdin.write(mcpRequest('tools/call', {
    name: 'get_bid_detail',
    arguments: { bid_id: '7d049fe8-c0a6-4be2-b1cc-e565123b632a' },
  }) + '\n');
  await new Promise(r => setTimeout(r, 1000));

  server.stdin.end();

  await new Promise(r => {
    server.on('close', () => {
      console.log('\n📊 결과:\n');

      // Parse and display results
      for (const resp of responses) {
        if (resp.result?.content?.[0]?.text) {
          try {
            const data = JSON.parse(resp.result.content[0].text);

            if (data.count !== undefined) {
              console.log(`✅ 검색 결과: ${data.count}건`);
              if (data.bids) {
                data.bids.forEach((b, i) => {
                  console.log(`   ${i+1}. ${b.title?.slice(0, 50)}...`);
                  console.log(`      💰 ${(b.estimated_price / 100000000).toFixed(1)}억 | 📅 ${b.deadline?.split('T')[0]} | 🏢 ${b.organization}`);
                });
              }
              console.log('');
            } else if (data.title) {
              console.log(`✅ 상세: ${data.title}`);
              console.log(`   💰 ${(data.estimated_price / 100000000).toFixed(1)}억원`);
              console.log(`   🏢 ${data.organization}`);
              console.log(`   📅 마감: ${data.deadline?.split('T')[0]}`);
            }
          } catch {}
        }
      }

      r();
    });
  });
}

test().catch(console.error);
