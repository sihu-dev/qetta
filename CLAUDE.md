# Qetta - Claude Code 개발 가이드

> **Qetta** by uniLAB: AI-Powered B2B Automation Platform for SMEs
>
> 입찰 자동화 + 무역금융 + AI 분석 = 중소기업 경쟁력 강화
>
> 마지막 업데이트: 2025-12-30

---

## 프로젝트 개요

**Qetta**는 중소 수출기업을 위한 B2B 자동화 플랫폼입니다.

### 핵심 모듈

| 모듈 | 설명 | 상태 |
|------|------|------|
| **입찰 자동화** | G2B/TED/SAM.gov 통합 | 🔨 개발 중 |
| **175점 Matcher** | 하이브리드 AI 매칭 | 🔨 개발 중 |
| **AI 스마트 함수** | Google Sheets 연동 | 🔨 개발 중 |
| **이행보증** | 보증 발급/관리 자동화 | 📋 계획 |
| **환헤지** | 환율 시뮬레이션/자동 헤지 | 📋 계획 |

---

## 기술 스택

```yaml
Framework: Next.js 15 (App Router, React 19)
Language: TypeScript 5.7 (Strict Mode)
Styling: Tailwind CSS 3.4 + shadcn/ui
Database: Supabase (PostgreSQL + RLS)
Cache: Upstash Redis
Queue: Inngest (Serverless)
AI: Claude API (Anthropic)
Sheets: Google Sheets API
Monorepo: Turborepo + pnpm 9
Testing: Vitest + Playwright
Deploy: Vercel
```

---

## 프로젝트 구조

```
qetta/
├── apps/
│   └── web/                    # Next.js 메인 앱
│       ├── src/
│       │   ├── app/            # App Router
│       │   │   ├── (marketing)/  # 랜딩, 가격
│       │   │   ├── (auth)/       # 인증
│       │   │   ├── (dashboard)/  # 대시보드
│       │   │   │   ├── bids/     # 입찰 관리
│       │   │   │   └── finance/  # 무역금융
│       │   │   └── api/          # API Routes
│       │   ├── components/     # UI 컴포넌트
│       │   ├── lib/            # 핵심 로직
│       │   │   ├── matching/   # 175점 Matcher
│       │   │   ├── ai/         # AI 함수 5개
│       │   │   ├── crawlers/   # G2B/TED/SAM
│       │   │   ├── finance/    # 이행보증/환헤지
│       │   │   ├── sheets/     # Google Sheets API
│       │   │   └── claude/     # Claude API 연동
│       │   └── types/          # TypeScript 타입
│       └── supabase/
│           └── migrations/     # DB 스키마
├── packages/
│   ├── ui/                     # 공유 UI (@qetta/ui)
│   ├── types/                  # 공유 타입 (@qetta/types)
│   └── config/                 # ESLint, TS 설정
└── docs/                       # 문서
```

---

## 핵심 엔진

### 1. 175점 Matcher

```typescript
interface MatchResult {
  score: number;           // 0~175
  breakdown: {
    keywordScore: number;      // 최대 100점
    pipeSizeScore: number;     // 최대 25점
    organizationScore: number; // 최대 50점
  };
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
}
```

### 2. AI 스마트 함수 (Google Sheets 연동)

| 함수 | 설명 | 출력 |
|------|------|------|
| `=AI_SUMMARY()` | 공고 요약 | 2-3문장 |
| `=AI_SCORE()` | 낙찰 확률 | 0-100% |
| `=AI_MATCH()` | 최적 제품 | 제품 ID |
| `=AI_KEYWORDS()` | 핵심 키워드 | Top 3 |
| `=AI_DEADLINE()` | 마감 액션 | D-Day 권고 |

### 3. 크롤러

| 소스 | API | 상태 |
|------|-----|------|
| 나라장터 (G2B) | 공공데이터포털 | 🔨 |
| TED (EU) | Europa API | 🔨 |
| SAM.gov (US) | SAM API | 📋 |

---

## 개발 규칙

### 필수 (MUST)

1. **TypeScript Strict Mode** - any 금지
2. **Server/Client 분리** - 서버 컴포넌트 기본
3. **Zod 검증** - 모든 API 입력
4. **Error Boundary** - 에러 핸들링

### 권장 (SHOULD)

1. 함수형 프로그래밍
2. Early Return 패턴
3. Colocation (관련 파일 같은 폴더)

---

## 단축 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 (3000) |
| `pnpm build` | 빌드 |
| `pnpm typecheck` | 타입 체크 |
| `pnpm lint` | 린트 |

---

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
ANTHROPIC_API_KEY=

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# External APIs
G2B_API_KEY=
TED_API_KEY=
SAM_API_KEY=
```

---

## 커밋 컨벤션

```
feat: 새 기능
fix: 버그 수정
docs: 문서
refactor: 리팩토링
test: 테스트
chore: 기타
```

---

*Qetta by uniLAB - 중소기업 B2B 자동화의 새로운 기준*
