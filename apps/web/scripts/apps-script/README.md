# Qetta Google Sheets AI Functions

> Google Sheets에서 AI 기반 입찰 분석 기능 사용하기

## 빠른 시작

### 1. Apps Script 설정

1. Google Sheets 열기
2. **확장 프로그램** > **Apps Script** 클릭
3. `Code.gs` 내용 전체 복사-붙여넣기
4. **프로젝트 설정** > **스크립트 속성** 추가:
   - `Qetta_API_URL`: `https://qetta.qetta.io/api/v1`
   - `Qetta_API_KEY`: (발급받은 API 키)
5. 저장 후 스프레드시트 새로고침

### 2. 커스텀 함수 사용

| 함수 | 설명 | 예시 |
|------|------|------|
| `=AI_SCORE()` | 175점 매칭 점수 | `=AI_SCORE(A2)` |
| `=STOFO_WIN_RATE()` | 낙찰 확률 예측 | `=STOFO_WIN_RATE(B2, C2)` |
| `=AI_RECOMMEND()` | 입찰 추천 | `=AI_RECOMMEND(A2, D2, C2)` |
| `=AI_KEYWORDS()` | 키워드 추출 | `=AI_KEYWORDS(A2)` |
| `=GUARANTEE_FEE()` | 보증료 계산 | `=GUARANTEE_FEE(C2, "SGI")` |

---

## 함수 상세

### =AI_SCORE(title, keywords, organization)

175점 체계 Enhanced Matcher 알고리즘으로 매칭 점수 계산

**파라미터:**
- `title` (필수): 입찰 공고 제목
- `keywords` (선택): 커스텀 키워드 (쉼표 구분)
- `organization` (선택): 발주기관명 (기관 보너스 적용)

**반환값:** 0-175 점수

**예시:**
```
=AI_SCORE(A2)                           // 기본 키워드로 점수 계산
=AI_SCORE(A2, "유량계,펌프,밸브")        // 커스텀 키워드
=AI_SCORE(A2, "", B2)                   // 기관 보너스 포함
```

**점수 구성:**
- 키워드 점수: 0-100점 (Primary 20점 × 5, Secondary 5점)
- 규격 점수: 0-25점 (DN, mm, KS, ISO 등)
- 기관 점수: 0-50점 (K-water 50점, 환경공단 45점 등)

---

### =STOFO_WIN_RATE(bid_amount, estimated_price, competitors)

StoFo Engine 기반 낙찰 확률 예측 (KAIST 알고리즘)

**파라미터:**
- `bid_amount` (필수): 제안 입찰가
- `estimated_price` (필수): 추정가격/예정가격
- `competitors` (선택): 예상 경쟁자 수 (기본 8)

**반환값:** 확률 + 이모지 (🟢/🟡/🔴)

**예시:**
```
=STOFO_WIN_RATE(87000000, 100000000)     // 87% 투찰률
=STOFO_WIN_RATE(B2, C2, 12)              // 12개사 경쟁 가정
```

**최적 투찰률:** 87-88% (한국 공공입찰 기준)

---

### =AI_RECOMMEND(title, deadline, amount, keywords)

입찰 여부 AI 추천

**파라미터:**
- `title` (필수): 공고 제목
- `deadline` (선택): 마감일
- `amount` (선택): 예상 금액
- `keywords` (선택): 커스텀 키워드

**반환값:**
- `BID ✓` / `BID ⚡`: 입찰 추천 (⚡ = 긴급)
- `REVIEW 👀`: 검토 필요
- `SKIP ✗`: 스킵 권장

**결정 기준:**
| 점수 | 금액 ≥ 5천만 | 금액 < 5천만 |
|------|-------------|-------------|
| ≥ 120점 | BID | REVIEW |
| 70-119점 | REVIEW | REVIEW |
| 50-69점 | REVIEW | SKIP |
| < 50점 | SKIP | SKIP |

---

### =AI_KEYWORDS(title)

공고 제목에서 관련 키워드 자동 추출

**파라미터:**
- `title` (필수): 공고 제목

**반환값:** 쉼표로 구분된 키워드 목록

**예시:**
```
=AI_KEYWORDS("K-water 정수장 초음파유량계 교체")
// 결과: "초음파유량계, 정수장, 교체"
```

---

### =GUARANTEE_FEE(amount, provider, type)

보증료 추정 계산

**파라미터:**
- `amount` (필수): 보증금액
- `provider` (선택): 보증기관 코드
  - `SGI`: SGI서울보증 (기본)
  - `KODIT`: 신용보증기금
  - `KIBO`: 기술보증기금
  - `CONSTRUCTION`: 건설공제조합
  - `SPECIALTY`: 전문건설공제
- `type` (선택): 보증 유형
  - `performance`: 이행보증 (기본)
  - `advance`: 선금보증
  - `defect`: 하자보증

**반환값:** 예상 보증료 범위 + 기관명

**예시:**
```
=GUARANTEE_FEE(100000000)                    // 1억원 이행보증 (SGI)
=GUARANTEE_FEE(50000000, "KODIT", "advance") // 5천만 선금보증 (신보)
```

---

## 메뉴 기능

스프레드시트 상단에 **Qetta AI** 메뉴가 추가됩니다:

- 🔄 **Sync with Qetta**: API 동기화
- 📊 **Calculate All Scores**: 전체 점수 일괄 계산
- 📥 **Import Today's Bids**: 오늘자 공고 가져오기
- ⚙️ **Settings**: API 설정
- ℹ️ **Help**: 도움말

---

## 스프레드시트 템플릿

권장 열 구성:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 제목 | 발주기관 | 추정가격 | 마감일 | AI 점수 | 추천 | 낙찰률 | 보증료 |

**수식 예시:**
- E2: `=AI_SCORE(A2, "", B2)`
- F2: `=AI_RECOMMEND(A2, D2, C2)`
- G2: `=STOFO_WIN_RATE(C2*0.87, C2)`
- H2: `=GUARANTEE_FEE(C2*0.1, "SGI")`

---

## 문제 해결

### "Unknown function" 오류
- Apps Script가 저장되었는지 확인
- 스프레드시트 새로고침 (F5)

### "Authorization required" 오류
- Apps Script에서 함수 실행 > 권한 승인

### API 연동 오류
- Script Properties에 API_KEY 설정 확인
- Qetta 대시보드에서 API 키 재발급

---

## 지원

- 문서: https://qetta.qetta.io/docs
- 이슈: https://github.com/qetta/qetta/issues
- 이메일: support@qetta.io
