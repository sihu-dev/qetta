/**
 * 데모용 제품 카탈로그
 * 랜딩 페이지 스프레드시트 데모에서 사용
 */

export interface DemoProduct {
  id: string;
  name: string;
  fullName: string;
  category: string;
  description: string;
  keywords: string[];
  targetOrganizations: string[];
  specifications: {
    pipeSize: { min: number; max: number } | null;
    accuracy: string;
    applications: string[];
  };
  icon: 'Waves' | 'Zap' | 'Droplets' | 'Flame' | 'Activity';
  priority: 1 | 2 | 3;
}

// 데모용 샘플 제품 (AI 매칭 데모 시연용)
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'PRODUCT-A',
    name: '제품 A',
    fullName: '산업용 측정장비 A형',
    category: '산업설비',
    description: '대규모 시설용 정밀 측정장비',
    keywords: ['산업용', '측정', '대형', '정밀'],
    targetOrganizations: ['공공기관', '대기업', '공단'],
    specifications: {
      pipeSize: { min: 100, max: 4000 },
      accuracy: '±0.5%',
      applications: ['산업시설', '공공시설'],
    },
    icon: 'Waves',
    priority: 1,
  },
  {
    id: 'PRODUCT-B',
    name: '제품 B',
    fullName: '소형 측정장비 B형',
    category: '상업용',
    description: '중소규모 시설용 측정장비',
    keywords: ['소형', '상업용', '일체형'],
    targetOrganizations: ['중소기업', '지자체'],
    specifications: {
      pipeSize: { min: 15, max: 2000 },
      accuracy: '±0.5%',
      applications: ['상업시설', '중소규모'],
    },
    icon: 'Zap',
    priority: 2,
  },
  {
    id: 'PRODUCT-C',
    name: '제품 C',
    fullName: '특수환경용 장비 C형',
    category: '특수환경',
    description: '특수환경 전용 측정장비',
    keywords: ['특수', '환경', '전용'],
    targetOrganizations: ['환경부', '공단'],
    specifications: {
      pipeSize: { min: 200, max: 3000 },
      accuracy: '±1.0%',
      applications: ['특수환경', '처리시설'],
    },
    icon: 'Droplets',
    priority: 1,
  },
];

/**
 * 제품 ID로 제품 정보 조회
 */
export function getProductById(id: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id);
}

/**
 * 카테고리별 제품 필터링
 */
export function getProductsByCategory(category: string): DemoProduct[] {
  return DEMO_PRODUCTS.filter((p) => p.category === category);
}

/**
 * 신뢰도 레벨 계산
 */
export function getConfidenceLevel(score: number): {
  level: 'very_high' | 'high' | 'medium' | 'low';
  label: string;
  emoji: string;
} {
  if (score >= 90) return { level: 'very_high', label: '매우 높음', emoji: '' };
  if (score >= 70) return { level: 'high', label: '높음', emoji: '' };
  if (score >= 50) return { level: 'medium', label: '보통', emoji: '' };
  return { level: 'low', label: '낮음', emoji: '' };
}
