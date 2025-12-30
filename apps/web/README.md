# Qetta

> AI-powered global bid automation platform for manufacturing SMEs

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku%20%7C%20Sonnet-orange.svg)](https://anthropic.com/)

---

## Overview

Qetta automates the entire bid discovery and analysis workflow for manufacturing companies:

```
Data Collection → AI Analysis → Smart Matching → Notifications
      ↓              ↓              ↓              ↓
  G2B/TED/SAM    Claude AI     Product Match    Kakao/Email
```

### Key Features

- **Multi-Source Integration**: 나라장터, TED Europa, SAM.gov, World Bank APIs
- **AI-Powered Matching**: Claude Haiku (filtering) + Sonnet (analysis) pipeline
- **Spreadsheet UX**: Familiar Excel-like interface with AI functions
- **Real-time Alerts**: Kakao Alimtalk, Email, Slack notifications
- **Korean Translation**: Auto-translate foreign bids to Korean

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account
- Anthropic API key

### Installation

```bash
# Clone repository
git clone https://github.com/sihu-dev/forge-labs.git
cd forge-labs/apps/qetta

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

### Environment Variables

```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI
ANTHROPIC_API_KEY=your-anthropic-key

# Data Sources
G2B_API_KEY=your-g2b-key              # 공공데이터포털
TED_API_KEY=your-ted-key              # (optional)
SAM_API_KEY=your-sam-key              # SAM.gov

# Notifications
KAKAO_REST_API_KEY=your-kakao-key     # 카카오 알림톡
RESEND_API_KEY=your-resend-key        # Email
```

---

## Project Structure

```
apps/qetta/
├── src/
│   ├── app/
│   │   ├── api/v1/              # REST API endpoints
│   │   │   ├── bids/            # Bid CRUD
│   │   │   ├── matches/         # AI matching results
│   │   │   ├── notifications/   # Alert management
│   │   │   └── companies/       # Company profiles
│   │   ├── dashboard/           # Main dashboard
│   │   ├── spreadsheet/         # Spreadsheet view
│   │   └── settings/            # User settings
│   │
│   ├── lib/
│   │   ├── clients/             # External API clients
│   │   │   ├── g2b.ts           # 나라장터 API
│   │   │   ├── ted.ts           # TED Europa API
│   │   │   ├── sam.ts           # SAM.gov API
│   │   │   └── world-bank.ts    # World Bank API
│   │   │
│   │   ├── ai/                  # AI pipeline
│   │   │   ├── filter.ts        # Claude Haiku filtering
│   │   │   ├── analyze.ts       # Claude Sonnet analysis
│   │   │   └── translate.ts     # Korean translation
│   │   │
│   │   ├── security/            # Security modules
│   │   │   ├── auth-middleware.ts
│   │   │   ├── rate-limiter.ts
│   │   │   ├── csrf.ts
│   │   │   └── prompt-guard.ts
│   │   │
│   │   ├── validation/          # Zod schemas
│   │   └── domain/              # Repository pattern
│   │
│   ├── components/
│   │   ├── spreadsheet/         # Spreadsheet components
│   │   ├── dashboard/           # Dashboard widgets
│   │   └── ui/                  # Base UI components
│   │
│   └── types/                   # TypeScript types
│
├── supabase/
│   └── migrations/              # Database migrations
│
└── .forge/                      # Design documents
    ├── BUSINESS_PLAN.md
    ├── TECH_ARCHITECTURE.md
    └── UI_DESIGN_SPEC.md
```

---

## Database Schema

### Core Tables

```sql
-- 입찰 공고
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,              -- 'g2b' | 'ted' | 'sam' | 'wb'
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  budget_min NUMERIC,
  budget_max NUMERIC,
  currency TEXT DEFAULT 'KRW',
  country TEXT,
  cpv_codes TEXT[],                  -- EU CPV codes
  naics_codes TEXT[],                -- US NAICS codes
  original_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- AI 매칭 결과
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES bids(id),
  company_id UUID REFERENCES companies(id),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  reasons TEXT[],
  korean_summary TEXT,
  required_certs TEXT[],
  competition_level TEXT,           -- 'low' | 'medium' | 'high'
  ai_model TEXT,                    -- 'haiku' | 'sonnet'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 고객 제품 카탈로그
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  cpv_codes TEXT[],
  naics_codes TEXT[],
  certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Run Migrations

```bash
# Link Supabase project
npx supabase link --project-ref your-project-id

# Push migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > src/types/database.ts
```

---

## API Reference

### Bids API

```typescript
// GET /api/v1/bids
// Query params: source, status, limit, offset
const response = await fetch('/api/v1/bids?source=g2b&limit=50');

// GET /api/v1/bids/:id
const bid = await fetch('/api/v1/bids/uuid-here');

// POST /api/v1/bids/sync
// Trigger data sync from external sources
await fetch('/api/v1/bids/sync', { method: 'POST' });
```

### Matches API

```typescript
// GET /api/v1/matches
// Get AI matching results for a company
const matches = await fetch('/api/v1/matches?company_id=uuid');

// POST /api/v1/matches/analyze
// Trigger AI analysis for a specific bid
await fetch('/api/v1/matches/analyze', {
  method: 'POST',
  body: JSON.stringify({ bid_id: 'uuid', company_id: 'uuid' })
});
```

### Notifications API

```typescript
// POST /api/v1/notifications/send
// Send Kakao Alimtalk
await fetch('/api/v1/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'kakao',
    template: 'bid_match',
    recipient: '+821012345678',
    data: { bid_title: '...', match_score: 85 }
  })
});
```

---

## External API Integration

### 나라장터 (G2B) - Korea

```typescript
// lib/clients/g2b.ts
const G2B_CONFIG = {
  baseUrl: 'https://apis.data.go.kr/1230000',
  endpoints: {
    goodsBids: '/BidPublicInfoService04/getBidPblancListInfoThngPPSSrch',
    serviceBids: '/BidPublicInfoService04/getBidPblancListInfoServcPPSSrch',
    bidDetail: '/BidPublicInfoService04/getBidPblancDtlInfo'
  }
};

// Fetch today's bids
const bids = await g2bClient.fetchBids({
  startDate: '2025-01-01',
  endDate: '2025-01-01',
  numOfRows: 100
});
```

### TED Europa - EU

```typescript
// lib/clients/ted.ts
const TED_CONFIG = {
  baseUrl: 'https://ted.europa.eu/api/v3',
  endpoints: {
    search: '/notices/search'
  },
  manufacturingCPV: ['42*', '43*', '44*', '31*', '38*']
};

// Search manufacturing bids
const bids = await tedClient.search({
  cpv: TED_CONFIG.manufacturingCPV,
  deadline: 'gte:2025-01-01'
});
```

### SAM.gov - US

```typescript
// lib/clients/sam.ts
const SAM_CONFIG = {
  baseUrl: 'https://api.sam.gov/opportunities/v2',
  manufacturingNAICS: ['332*', '333*', '334*', '335*', '336*']
};

// Fetch opportunities
const bids = await samClient.getOpportunities({
  naics: SAM_CONFIG.manufacturingNAICS,
  postedFrom: '01/01/2025'
});
```

---

## AI Pipeline

### Stage 1: Filtering (Claude Haiku)

```typescript
// lib/ai/filter.ts
const filterPrompt = `
Analyze this bid and determine if it's relevant for a Korean manufacturing company.

Criteria:
1. Is this related to manufacturing/equipment/machinery?
2. Can Korean companies participate?
3. Is the deadline valid (> 7 days)?

Bid: ${bid.title}
Description: ${bid.description}

Respond with: { "pass": true/false, "reason": "..." }
`;

// Cost: ~$0.0001 per bid
const result = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 100,
  messages: [{ role: 'user', content: filterPrompt }]
});
```

### Stage 2: Analysis (Claude Sonnet)

```typescript
// lib/ai/analyze.ts
const analyzePrompt = `
Analyze this bid for product matching.

Company Products:
${products.map(p => `- ${p.name}: ${p.description}`).join('\n')}

Bid Information:
Title: ${bid.title}
Description: ${bid.description}
Requirements: ${bid.requirements}

Provide:
1. Match score (0-100)
2. Matching reasons
3. Korean summary (2-3 sentences)
4. Required certifications
5. Competition level estimate

Format: JSON
`;

// Cost: ~$0.003 per bid
const result = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  messages: [{ role: 'user', content: analyzePrompt }]
});
```

---

## Spreadsheet AI Functions

Qetta provides Excel-like AI functions in the spreadsheet view:

| Function | Description | Example |
|----------|-------------|---------|
| `=BIDMATCH(cell, "keyword")` | Calculate match score | `=BIDMATCH(A1, "flowmeter")` → `85%` |
| `=TRANSLATE(cell, "ko")` | Translate to Korean | `=TRANSLATE(B1, "ko")` |
| `=SUMMARIZE(cell)` | Generate summary | `=SUMMARIZE(C1)` |
| `=EXTRACT(cell, "deadline")` | Extract specific field | `=EXTRACT(D1, "deadline")` → `2025-03-15` |
| `=RECOMMEND(cell)` | Get recommendation | `=RECOMMEND(E1)` → `★★★★☆` |

---

## Development

### Commands

```bash
# Development
pnpm dev              # Start dev server (port 3010)
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm lint:fix         # Fix lint issues

# Database
pnpm db:push          # Push migrations
pnpm db:generate      # Generate types

# Testing
pnpm test             # Run tests
pnpm test:e2e         # E2E tests (Playwright)
```

### Design System

Qetta uses a monochrome design system:

```css
/* Primary Colors */
--primary: #171717;      /* neutral-900 */
--secondary: #262626;    /* neutral-800 */
--background: #fafafa;   /* neutral-50 */
--surface: #ffffff;      /* white */
--border: #e5e5e5;       /* neutral-200 */

/* Text */
--text-primary: #171717;
--text-secondary: #525252;
--text-muted: #a3a3a3;
```

See [.claude/rules/design-system-rules.md](./.claude/rules/design-system-rules.md) for details.

---

## Security

### Implemented

| Security Measure | File | Description |
|------------------|------|-------------|
| API Authentication | `lib/security/auth-middleware.ts` | JWT + Supabase Auth |
| Rate Limiting | `lib/security/rate-limiter.ts` | Upstash Redis |
| CSRF Protection | `lib/security/csrf.ts` | Double Submit Cookie |
| Prompt Injection Guard | `lib/security/prompt-guard.ts` | Input sanitization |

### Best Practices

- Never hardcode API keys
- Use environment variables
- Validate all user inputs with Zod
- Implement Row Level Security (RLS) in Supabase

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `G2B_API_KEY`
- `KAKAO_REST_API_KEY`

---

## Roadmap

### Q1 2026 (Current)

- [x] Supabase setup & migrations
- [x] Security middleware
- [x] Spreadsheet UI components
- [x] Landing page
- [ ] G2B API client
- [ ] TED/SAM API clients
- [ ] AI matching pipeline
- [ ] Kakao Alimtalk integration

### Q2 2026

- [ ] AI Voucher certification
- [ ] Pilot with 3 companies
- [ ] Dashboard analytics
- [ ] Excel export

### Q3 2026

- [ ] SaaS launch
- [ ] Mobile responsive
- [ ] Slack integration
- [ ] Auto bid document generation

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

---

## Documentation

| Document | Description |
|----------|-------------|
| [Business Plan](./.forge/BUSINESS_PLAN.md) | Business strategy and financials |
| [Tech Architecture](./.forge/TECH_ARCHITECTURE.md) | System architecture |
| [UI Design Spec](./.forge/UI_DESIGN_SPEC.md) | Design specifications |
| [API Guide](./.forge/API_INTEGRATION_GUIDE.md) | External API documentation |
| [Data Sources](./.forge/BID_DATA_SOURCES.md) | List of 45+ data sources |

---

## License

Proprietary - FORGE LABS

---

## Support

- GitHub Issues: [forge-labs/issues](https://github.com/sihu-dev/forge-labs/issues)
- Email: support@forgelabs.dev

---

*Qetta v2.0 - AI Bid Automation Platform*
*Built with Next.js 15, Supabase, Claude AI*
