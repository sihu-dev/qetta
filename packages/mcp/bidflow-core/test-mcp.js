#!/usr/bin/env node
/**
 * BIDFLOW MCP Server Test Script
 * MCP 도구 기능 테스트
 */

import { spawn } from 'child_process';
import readline from 'readline';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://srmyrrenbhwdfdgnnlnn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// MCP 메시지 ID
let messageId = 0;

function createMCPRequest(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: ++messageId,
    method,
    params,
  });
}

async function testMCPServer() {
  console.log('🚀 BIDFLOW MCP Server 테스트 시작...\n');

  const server = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const rl = readline.createInterface({
    input: server.stdout,
    crlfDelay: Infinity,
  });

  const responses = [];

  rl.on('line', (line) => {
    try {
      const response = JSON.parse(line);
      responses.push(response);
      console.log('📥 Response:', JSON.stringify(response, null, 2).slice(0, 500));
    } catch {
      // Not JSON, probably stderr
    }
  });

  server.stderr.on('data', (data) => {
    console.log('📝 Server:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 1: Initialize
  console.log('\n--- Test 1: Initialize ---');
  server.stdin.write(createMCPRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 2: List tools
  console.log('\n--- Test 2: List Tools ---');
  server.stdin.write(createMCPRequest('tools/list') + '\n');
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test 3: Call search_bids
  console.log('\n--- Test 3: search_bids ---');
  server.stdin.write(createMCPRequest('tools/call', {
    name: 'search_bids',
    arguments: {
      keywords: ['유량계'],
      limit: 5,
    },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 4: Get stats
  console.log('\n--- Test 4: get_stats ---');
  server.stdin.write(createMCPRequest('tools/call', {
    name: 'get_stats',
    arguments: {
      tenant_id: '11111111-1111-1111-1111-111111111111', // 씨엠엔텍
      period: 'week',
    },
  }) + '\n');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 5: List resources
  console.log('\n--- Test 5: List Resources ---');
  server.stdin.write(createMCPRequest('resources/list') + '\n');
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Cleanup
  server.stdin.end();

  await new Promise((resolve) => {
    server.on('close', () => {
      console.log('\n✅ MCP 서버 테스트 완료');
      console.log(`📊 총 ${responses.length}개 응답 수신`);
      resolve();
    });
  });
}

testMCPServer().catch(console.error);
