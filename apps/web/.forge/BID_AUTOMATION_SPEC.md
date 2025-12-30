# FORGEONE 입찰 자동화 시스템 설계

> **생성일**: 2025-12-19
> **타겟**: 제조업 중소기업 (HTCM, 유량계 회사 등)
> **핵심 Pain Point**: 입찰 놓침, 체계 없음, 서류 수작업

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **제품** | 입찰 관리 + AI 서류 자동화 웹앱 |
| **UI** | 구글시트형 스프레드시트 + AI 셀 함수 |
| **차별화** | =AI() 셀 함수로 서류 자동 생성 |
| **수익** | AI바우처 B2B (₩50-200M/건) |

---

## 1. 핵심 Pain Point

| Pain | 현재 | 자동화 후 |
|------|------|-----------|
| 입찰 놓침 | 수동 확인 | 자동 알림 |
| 체계 없음 | 엑셀/메일 분산 | 파이프라인 통합 |
| 서류 수작업 | 3-5일 | AI 30분 |

---

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGEONE 입찰 자동화                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │  입찰 발견   │ → │  입찰 관리   │ → │  서류 생성   │            │
│  │  (크롤링)   │   │ (파이프라인) │   │    (AI)     │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              구글시트형 스프레드시트 UI                   │    │
│  │         =AI() 셀 함수로 어디서든 AI 호출                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 기능 모듈

### 3.1 입찰 발견

| 기능 | 설명 |
|------|------|
| 자동 크롤링 | 나라장터, 조달청, 한전 등 |
| 키워드 필터 | 유량계, 계측기, 밸브 등 |
| 알림 | 카카오톡, 이메일, 슬랙 |
| AI 요약 | 공고 핵심 내용 요약 |

### 3.2 입찰 관리

| 기능 | 설명 |
|------|------|
| 파이프라인 | 발견→검토→준비→제출→결과 |
| D-Day 관리 | 마감일 자동 계산, 알림 |
| 통계 | 참여율, 낙찰률, 금액 분석 |
| 담당자 배정 | 팀원별 할당 |

### 3.3 서류 생성 (AI)

| 기능 | 설명 |
|------|------|
| 제안서 자동 생성 | 과거 자료 기반 |
| 가격제안서 | 경쟁 분석 기반 추천가 |
| 기술사양서 | 제품 정보 자동 구성 |
| 회사 자료 관리 | 사업자등록증, 인증서 등 |

---

## 4. AI 셀 함수

```
=AI(prompt)              → 자연어로 뭐든 생성
=AI_SUMMARY(range)       → 범위 요약
=AI_EXTRACT(file, field) → PDF에서 필드 추출
=AI_SCORE(bidId)         → 낙찰 확률 예측
=AI_PROPOSAL(bidId)      → 제안서 초안 생성
=AI_PRICE(bidId, margin) → 적정 가격 추천
```

---

## 5. 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15, React 19, TailwindCSS 4 |
| 스프레드시트 | Handsontable 또는 AG Grid |
| Backend | Next.js API Routes, Supabase |
| AI | Claude API (문서 생성/분석) |
| 크롤링 | Playwright, Cheerio, Inngest |
| 알림 | 카카오 알림톡, Resend, Slack |

---

## 6. 데이터 모델

### 핵심 테이블

```sql
bids              -- 입찰 공고
bid_pipeline      -- 파이프라인 상태
documents         -- 생성된 서류
company_assets    -- 회사 자료 (재사용)
sheet_data        -- 스프레드시트 데이터
```

---

## 7. MVP 우선순위

| 순위 | 기능 | 기간 |
|------|------|------|
| P0 | 입찰 수동 등록 + 시트뷰 | 1주 |
| P0 | 파이프라인 관리 | 1주 |
| P0 | 마감 알림 (카톡) | 3일 |
| P1 | AI 서류 생성 | 2주 |
| P1 | 나라장터 크롤링 | 1주 |
| P2 | AI 셀 함수 | 2주 |

**MVP 총 개발: 약 6-8주**

---

## 8. 엑셀 AI 트렌드 참조

### 벤치마크

| 서비스 | 특징 |
|--------|------|
| [MS Copilot =COPILOT()](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/bring-ai-to-your-formulas-with-the-copilot-function-in-excel/4443487) | 셀 내 AI 호출 |
| [Google Sheets =AI()](https://www.geekwire.com/2025/excel-formula-meets-ai-prompt-microsoft-brings-new-copilot-function-to-spreadsheet-cells/) | Gemini 통합 |
| [Rows.com](https://rows.com/ai) | =ASK_OPENAI() 함수 |
| [Paradigm](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/) | 셀마다 AI Agent |
| [AppSheet + Gemini](https://workspace.google.com/blog/ai-and-machine-learning/democratizing-app-development-using-appsheet-gemini) | PDF/이미지 자동 추출 |

### 적용 포인트

1. **=AI() 셀 함수**: 어디서든 AI 호출
2. **자동 갱신**: 데이터 변경 시 AI 결과 자동 업데이트
3. **PDF 추출**: 공고문에서 핵심 정보 자동 추출
4. **Agent Mode**: 멀티스텝 작업 자동화

---

## 9. 입찰 전략 엔진 v3.0

> **업데이트**: 2025-12-30
> **백테스트 F1 Score**: 0.889

### 9.1 핵심 성과

| 지표 | v2.0 | v3.0 | 개선 |
|------|------|------|------|
| F1 Score | 0.00 | **0.889** | +889% |
| 낙찰률 | 0% | **100%** | 완전 개선 |
| 사정률 MAPE | N/A | 0.14% | 신규 |
| 낙찰가 MAPE | N/A | 0.72% | 신규 |

### 9.2 적격심사 점수 체계 (95점)

```yaml
적격심사 배점:
  납품실적: 25점
    - 동종 실적: 25점 (해당 키워드 일치)
    - 유사 실적: 20점 (관련 카테고리)
    - 관련 실적: 15점 (일부 매칭)

  기술능력: 5점
    - ISO 인증: 2점 (9001, 14001, 45001)
    - 특허: 2점 (발명/실용신안)
    - 기타 인증: 1점 (KC, CE, NETP, NEP)

  신용등급: 15점
    - AAA~A0: 15점
    - A-~BBB: 12점
    - BB~B: 9점
    - CCC 이하: 5점

  가격점수: 50점
    - 공식: 50 × (하한가율 / 투찰률)
    - 하한가 84.245%로 투찰 시: 50점 만점
    - 85.5%로 투찰 시: 49.3점

  신인도: ±5점
    - 가점: 산재미발생, 고용우수 등
    - 감점: 부정당제재 등
```

### 9.3 낙찰하한율 (2025 기준)

| 분류 | 하한율 | 기준 |
|------|--------|------|
| **물품** (일반) | 84.245% | 추정가 3억 미만 |
| 물품 (소액) | 80.495% | 추정가 2,100만원 미만 |
| 물품 (대형) | 87.995% | 추정가 10억 이상 |
| **용역** (일반) | 87.745% | 추정가 2억 이상 |
| 용역 (소규모) | 84.825% | 추정가 2억 미만 |
| **공사** (일반) | 87.745% | 추정가 100억 미만 |
| 공사 (대형) | 86.745% | 추정가 300억 이상 |

### 9.4 투찰 전략

| 전략 | 투찰률 | 설명 | 리스크 |
|------|--------|------|--------|
| **aggressive** | 84.75% | 하한가 근접 | 고위험 고수익 |
| **balanced** | 85.5% | 평균 낙찰률 | 중간 |
| **conservative** | 86.5% | 안정적 | 저위험 저수익 |
| **optimal** | ROI 계산 | 기대수익 최대화 | 자동 계산 |

### 9.5 낙찰확률 계산

```
경쟁자 투찰률 분포:
  - 평균: 85.5%
  - 표준편차: 1.5%
  - 분포: 정규분포

낙찰확률 공식:
  P(win) = Φ((제안가격 - 경쟁자평균) / 경쟁자표준편차) × 적격통과율

  단, 적격통과율 = 0.7 (70% 가정)
  최대 상한 = 0.6 (60%, 현실성 유지)
```

### 9.6 ROI 기반 추천

```yaml
STRONG_BID:
  조건: 적격심사 85점+ AND 낙찰확률 25%+ AND ROI 15%+
  설명: 강력 추천

BID:
  조건: 적격심사 75점+ AND 낙찰확률 15%+ AND ROI 5%+
  설명: 입찰 권장

CONDITIONAL_BID:
  조건: 적격심사 70점+ AND 낙찰확률 10%+ AND ROI 0%+
  설명: 조건부 추천 (검토 후 결정)

REVIEW:
  조건: 적격심사 60점+ 또는 낙찰확률 5%+
  설명: 추가 검토 필요

SKIP:
  조건: 그 외
  설명: 입찰 비권장
```

### 9.7 백테스트 결과 (Confusion Matrix)

```
           ┌─────────────────────────────────┐
           │       예측 결과                 │
           │   BID 추천    │   SKIP 추천     │
┌──────────┼───────────────┼─────────────────┤
│실│ 낙찰  │   TP: 4건     │    FN: 1건      │
│제│       │ (정밀도 100%) │  (REVIEW 건)    │
│결│───────┼───────────────┼─────────────────┤
│과│ 미낙찰│   FP: 0건     │    TN: 3건      │
│  │       │  (0% 오탐)    │  (재현율 80%)   │
└──┴───────┴───────────────┴─────────────────┘

F1 Score = 2 × (정밀도 × 재현율) / (정밀도 + 재현율)
         = 2 × (1.0 × 0.8) / (1.0 + 0.8) = 0.889
```

---

## 10. 즉시 실행

| 순서 | 액션 | 기한 |
|------|------|------|
| 1 | HTCM 미팅 - Pain Point 상세 확인 | 이번 주 |
| 2 | 현재 입찰 프로세스 관찰 | D+7 |
| 3 | 서류 샘플 수집 | D+7 |
| 4 | Figma 목업 제작 | D+14 |
| 5 | MVP 개발 착수 | D+21 |

---

## Sources

- [MS Excel COPILOT Function](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/bring-ai-to-your-formulas-with-the-copilot-function-in-excel/4443487)
- [Google Sheets AI](https://www.geekwire.com/2025/excel-formula-meets-ai-prompt-microsoft-brings-new-copilot-function-to-spreadsheet-cells/)
- [Rows AI](https://rows.com/ai)
- [Paradigm $7M Raise](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/)
- [AppSheet Gemini](https://workspace.google.com/blog/ai-and-machine-learning/democratizing-app-development-using-appsheet-gemini)

---

*Generated by Claude 4.5 Opus*
*Version: 1.0*
