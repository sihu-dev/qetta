#!/usr/bin/env node
/**
 * Qetta 2026 Pivot 마이그레이션
 * 보증 연계 플랫폼용 테이블 추가
 */

const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = 'sbp_19c81537257044f10cc4de81d0b1cf014f53a222';
const PROJECT_REF = 'srmyrrenbhwdfdgnnlnn';

const MIGRATIONS = [
  '20251230000001_pivot_guarantee_tables.sql',
  '20251230000002_pivot_company_extensions.sql',
  '20251230000003_pivot_cmntech_update.sql',
];

async function runSQL(sql, name) {
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    const result = await response.text();

    if (response.ok) {
      console.log(`   ✅ ${name} 성공`);
      return true;
    } else {
      console.log(`   ❌ ${name} 실패: ${response.status}`);
      console.log(`      ${result.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name} 오류: ${error.message}`);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Qetta 2026 Pivot 마이그레이션 시작...\n');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  let successCount = 0;

  for (const fileName of MIGRATIONS) {
    const filePath = path.join(migrationsDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️ ${fileName} 파일 없음, 스킵`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`📋 실행 중: ${fileName} (${sql.length} bytes)`);

    const success = await runSQL(sql, fileName);
    if (success) successCount++;

    // 각 마이그레이션 사이 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 결과: ${successCount}/${MIGRATIONS.length} 마이그레이션 성공\n`);

  // 테이블 확인
  console.log('📋 전체 테이블 목록:');
  const checkResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
      }),
    }
  );

  const tables = await checkResponse.json();
  if (Array.isArray(tables)) {
    tables.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });
  } else {
    console.log(JSON.stringify(tables, null, 2));
  }

  console.log('\n✅ 마이그레이션 완료!');
}

runMigrations().catch(console.error);
