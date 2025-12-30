/**
 * 랜딩 페이지용 목업 입찰 데이터
 * 데모 시연을 위한 샘플 공고 데이터
 */

export interface MockBid {
  id: number;
  source: 'narajangto' | 'ted' | 'samgov' | 'kepco';
  sourceLabel: string;
  title: string;
  organization: string;
  estimatedAmount: number;
  deadline: string;
  status: 'new' | 'reviewing' | 'preparing' | 'submitted';
  statusLabel: string;
  priority: 'high' | 'medium' | 'low';
  matchScore: number;
  matchedProduct: string | null;
  keywords: string[];
  aiSummary: string | null;
  dday: string;
  ddayNum: number;
  isUrgent: boolean;
}

/**
 * D-Day 계산 헬퍼
 */
function calculateDday(deadline: string): { dday: string; ddayNum: number; isUrgent: boolean } {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    dday: diff > 0 ? `D-${diff}` : diff === 0 ? 'D-Day' : `D+${Math.abs(diff)}`,
    ddayNum: diff,
    isUrgent: diff <= 7 && diff >= 0,
  };
}

/**
 * 상태 라벨 매핑
 */
const STATUS_LABELS: Record<string, string> = {
  new: '신규',
  reviewing: '검토중',
  preparing: '준비중',
  submitted: '제출완료',
};

/**
 * 출처 라벨 매핑
 */
const SOURCE_LABELS: Record<string, string> = {
  narajangto: '나라장터',
  ted: 'TED(EU)',
  samgov: 'SAM.gov',
  kepco: '한전',
};

/**
 * 샘플 입찰 데이터
 */
const RAW_BIDS = [
  {
    id: 1,
    source: 'narajangto' as const,
    title: '[긴급] 서울시 산업설비 공급 및 설치 (대형, 25대)',
    organization: '서울특별시',
    estimatedAmount: 450000000,
    deadline: '2025-01-28',
    status: 'reviewing' as const,
    priority: 'high' as const,
    matchScore: 94,
    matchedProduct: 'PRODUCT-A',
    keywords: ['산업설비', '대형', '설치'],
    aiSummary: '제품 A 94% 매칭. 대형 규격 요구사항 충족.',
  },
  {
    id: 2,
    source: 'narajangto' as const,
    title: '경기도 중소기업 지원센터 장비 교체 공사',
    organization: '경기도청',
    estimatedAmount: 280000000,
    deadline: '2025-02-02',
    status: 'new' as const,
    priority: 'medium' as const,
    matchScore: 87,
    matchedProduct: 'PRODUCT-B',
    keywords: ['중소기업', '장비', '교체'],
    aiSummary: '제품 B 87% 매칭. 중소규모 요구사항 적합.',
  },
  {
    id: 3,
    source: 'ted' as const,
    title: 'Industrial Equipment Supply - Berlin Authority (Large Scale)',
    organization: 'Berliner Authority',
    estimatedAmount: 850000000,
    deadline: '2025-02-15',
    status: 'preparing' as const,
    priority: 'high' as const,
    matchScore: 91,
    matchedProduct: 'PRODUCT-A',
    keywords: ['EU', 'Industrial', 'Large Scale'],
    aiSummary: '제품 A 91% 매칭. EU 규격 인증 필요.',
  },
  {
    id: 4,
    source: 'kepco' as const,
    title: '한국전력 발전소 설비 납품',
    organization: '한국전력공사',
    estimatedAmount: 120000000,
    deadline: '2025-02-08',
    status: 'new' as const,
    priority: 'low' as const,
    matchScore: 72,
    matchedProduct: 'PRODUCT-C',
    keywords: ['발전소', '설비', '납품'],
    aiSummary: '제품 C 72% 매칭. 특수환경 요구사항 일부 충족.',
  },
  {
    id: 5,
    source: 'narajangto' as const,
    title: '부산시 환경시설 장비 설치 (특수환경)',
    organization: '부산환경공단',
    estimatedAmount: 95000000,
    deadline: '2025-01-24',
    status: 'submitted' as const,
    priority: 'high' as const,
    matchScore: 88,
    matchedProduct: 'PRODUCT-C',
    keywords: ['환경시설', '특수', '설치'],
    aiSummary: '제품 C 88% 매칭. 특수환경 전용 요구사항 충족.',
  },
  {
    id: 6,
    source: 'samgov' as const,
    title: 'Federal Agency Equipment Procurement (Medium)',
    organization: 'US Federal Agency',
    estimatedAmount: 180000000,
    deadline: '2025-02-20',
    status: 'new' as const,
    priority: 'medium' as const,
    matchScore: 79,
    matchedProduct: 'PRODUCT-B',
    keywords: ['US', 'Federal', 'Equipment'],
    aiSummary: '제품 B 79% 매칭. 미국 연방 규격 확인 필요.',
  },
];

/**
 * Mock 데이터 생성
 */
function createMockBids(): MockBid[] {
  return RAW_BIDS.map((raw) => ({
    ...raw,
    sourceLabel: SOURCE_LABELS[raw.source],
    statusLabel: STATUS_LABELS[raw.status],
    ...calculateDday(raw.deadline),
  }));
}

/**
 * 6개 목업 입찰 데이터
 */
export const MOCK_BIDS: MockBid[] = createMockBids();

/**
 * 금액 포맷팅 (억/만원 단위)
 */
export function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    const billions = amount / 100000000;
    return `${billions.toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
}

/**
 * 목업 통계 데이터
 */
export const MOCK_STATS = {
  total: MOCK_BIDS.length,
  new: MOCK_BIDS.filter((b) => b.status === 'new').length,
  reviewing: MOCK_BIDS.filter((b) => b.status === 'reviewing').length,
  urgent: MOCK_BIDS.filter((b) => b.isUrgent).length,
  highMatch: MOCK_BIDS.filter((b) => b.matchScore >= 80).length,
  totalAmount: MOCK_BIDS.reduce((sum, b) => sum + b.estimatedAmount, 0),
};
