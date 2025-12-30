# BIDFLOW Core MCP 서버

> **역할**: 입찰 자동화를 위한 MCP (Model Context Protocol) 서버
> **모델**: Opus 4.5 최적화
> **버전**: 3.0.0
> **최종 업데이트**: 2025-12-30

---

## 개요

BIDFLOW Core는 Claude Code와 연동되는 MCP 서버로, 8개의 입찰 관련 도구를 제공합니다.

```yaml
도구:
  - search_bids: 입찰 공고 검색
  - get_bid_detail: 공고 상세 조회
  - match_products: 제품-공고 매칭 (175점 체계)
  - set_bid_action: 입찰 액션 설정
  - get_matches: 매칭 결과 조회
  - get_stats: 통계 대시보드
  - crawl_g2b: 나라장터 크롤링
  - get_stofo_prediction: 입찰 전략 엔진 v3.0
```

---

## 입찰 전략 엔진 v3.0 (현실화 버전)

### v3.0 주요 개선

```yaml
백테스트 성과:
  F1 Score: 0.889 (기존 0 → 0.889)
  낙찰률: 100% (4/4 참여 건)
  사정률 MAPE: 0.14%
  낙찰가 MAPE: 0.72%

핵심 개선:
  1. 현실적 가격점수 공식: 50 × (하한가율 / 투찰률)
  2. 경쟁자 투찰률 분포: 평균 85.5%, 표준편차 1.5%
  3. ROI 기반 추천 알고리즘 (TP/FP/FN/TN 분석)
  4. 납품실적 키워드 매칭 강화
```

### 전략별 투찰률

| 전략 | 투찰률 | 설명 | 리스크 |
|------|--------|------|--------|
| **aggressive** | 84.75% | 하한가 근접 | 고위험 고수익 |
| **balanced** | 85.5% | 평균 낙찰률 | 중간 |
| **conservative** | 86.5% | 안정적 | 저위험 저수익 |
| **optimal** | ROI 최적화 | 기대수익 최대 | 자동 계산 |

### 핵심 기능

```yaml
예정가격 예측:
  - 사정률 예측 (정규분포)
  - 기관별 패턴 분석
  - 신뢰도 레벨 제공

낙찰하한율 (2025 기준):
  - 물품: 84.245% / 80.495% / 87.995%
  - 용역: 87.745% / 84.825%
  - 공사: 87.745% / 86.745%

적격심사 (95점 체계):
  - 납품실적: 25점 (동종/유사/관련 가중)
  - 기술능력: 5점 (ISO, 특허, 인증, 인력)
  - 신용등급: 15점 (AAA~CCC)
  - 가격점수: 50점 (하한가 기준 산정)
  - 신인도: ±5점 (가감점)

낙찰확률 계산:
  - 경쟁자 분포 기반 (정규분포)
  - 적격심사 통과율 70% 가정
  - 최대 60% 상한 (현실성 유지)

추천 시스템 (ROI 기반):
  - STRONG_BID: 높은 확률 + 좋은 ROI
  - BID: 적격심사 통과 + 양(+) ROI
  - CONDITIONAL_BID: 조건부 추천
  - REVIEW: 검토 필요 (낮은 확률/ROI)
  - SKIP: 입찰 비권장
```

### 백테스트 결과 상세

```yaml
Confusion Matrix:
  TP (True Positive): 4건 - BID 추천 → 실제 낙찰
  TN (True Negative): 3건 - SKIP 추천 → 실제 미낙찰
  FP (False Positive): 0건 - BID 추천 → 실제 미낙찰
  FN (False Negative): 1건 - REVIEW 추천 → 낙찰 가능했음

정밀도 (Precision): 100% (BID 추천 시 모두 낙찰)
재현율 (Recall): 80% (낙찰 가능한 입찰 중 80% 탐지)
F1 Score: 0.889
```

### 사용법

```typescript
// MCP 도구 호출 (v3)
{
  "name": "get_stofo_prediction",
  "arguments": {
    "bid_id": "UUID",
    "product_id": "UUID",
    "tenant_id": "UUID",
    "strategy": "optimal",  // optimal | aggressive | balanced | conservative
    "credit_rating": "A0"
  }
}

// 응답 구조 (v3)
{
  version: "3.0",
  optimalBidPrice: 127000000,
  optimalBidRate: 0.8475,
  winProbability: 0.35,
  qualificationScore: 90.5,
  recommendation: {
    action: "BID",
    confidence: 0.8,
    expectedROI: 0.12,
    riskLevel: "MEDIUM"
  },
  winAnalysis: {
    qualificationPassed: true,
    priceCompetitiveness: 0.72,
    estimatedRank: 2
  }
}
```

---

## Enhanced Matcher (175점)

### 배점 체계

```yaml
키워드 점수 (80점):
  - 제품 키워드 매칭
  - 한글 정규화 (초음파/ultrasonic)
  - 동의어 처리

규격 점수 (45점):
  - 구경 매칭
  - 정확도 등급
  - 재질 호환성

기관 점수 (50점):
  - 발주처별 가중치
  - 납품 실적 반영
  - 관계 점수
```

### 액션 결정

```yaml
BID (입찰 권장):
  - 총점 80점 이상
  - 주력 제품 매칭

REVIEW (검토 필요):
  - 총점 50~79점
  - 추가 분석 필요

SKIP (입찰 비권장):
  - 총점 50점 미만
  - 자동 제외
```

---

## 디렉토리 구조

```
bidflow-core/
├── src/
│   ├── index.ts              # MCP 서버 진입점
│   ├── bidding-engine.ts     # 입찰 전략 엔진 v2.0 (레거시)
│   ├── bidding-engine-v2.1.ts # 입찰 전략 엔진 v2.1
│   ├── bidding-engine-v3.ts  # 입찰 전략 엔진 v3.0 (현재)
│   ├── qualification-scorer.ts # 적격심사 점수 계산
│   ├── bid-optimizer.ts      # 투찰 최적화
│   ├── backtest-framework.ts # 백테스트 v2
│   └── backtest-framework-v3.ts # 백테스트 v3 (현실화)
├── dist/                     # 컴파일된 JavaScript
├── test-backtest-v3.js       # v3 백테스트 테스트
├── test-strategy.js          # 전략 엔진 테스트
├── test-match.js             # 매칭 테스트
├── package.json
└── .claude/
    ├── CLAUDE.md             # 이 파일
    └── settings.json         # Opus 4.5 설정
```

---

## 환경 변수

```env
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
G2B_API_KEY=공공데이터포털_API_키
```

---

## 빌드 및 실행

```bash
# 빌드
npm run build

# 테스트 (v3)
node test-backtest-v3.js

# 테스트 (v2 레거시)
node test-strategy.js
node test-match.js

# MCP 서버 실행 (stdio)
node dist/index.js
```

---

## Opus 4.5 연동

### 에이전트

| 에이전트 | 용도 | 모델 |
|----------|------|------|
| `@bid-strategy-opus` | 전략 최적화 | opus |
| `@stofo-predictor` | 낙찰 예측 | opus |
| `@market-analyzer` | 시장 분석 | opus |

### 스킬

| 스킬 | 트리거 | 설명 |
|------|--------|------|
| bid-strategy | `/strategy` | 입찰 전략 분석 |
| bid-batch | `/batch` | 배치 분석 |
| stofo-optimize | `/stofo` | 알고리즘 최적화 |

---

## DB 스키마 (Supabase)

```sql
-- 주요 테이블
bids              -- 입찰 공고
products          -- 제품 카탈로그
bid_matches       -- 매칭 결과
stofo_predictions -- 낙찰 예측 캐시
org_scores        -- 기관별 납품실적
```

---

## 개발 원칙

1. **TypeScript Strict Mode**
2. **Zod 입력 검증**
3. **에러 핸들링 필수**
4. **캐싱 활용 (1시간 TTL)**
5. **병렬 처리 (최대 5개)**

---

## 버전 히스토리

| 버전 | 날짜 | 주요 변경 |
|------|------|----------|
| v3.0.0 | 2025-12-30 | 현실화 엔진, F1 0.889, ROI 기반 추천 |
| v2.1.0 | 2025-12-29 | 백테스트 프레임워크, 최적화 |
| v2.0.0 | 2025-12-28 | 적격심사 계산기, 사정률 예측 |
| v1.0.0 | 2025-12-19 | 초기 MCP 서버 |

---

*BIDFLOW Core MCP Server v3.0.0*
*Opus 4.5 Optimized*
