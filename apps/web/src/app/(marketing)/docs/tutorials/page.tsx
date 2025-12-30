/**
 * 튜토리얼 페이지
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Play } from 'lucide-react';

export const metadata = {
  title: '튜토리얼 | Qetta',
  description: 'Qetta 사용법 튜토리얼 및 가이드',
};

const tutorials = [
  {
    category: '시작하기',
    items: [
      {
        title: '5분 만에 Qetta 시작하기',
        duration: '5분',
        level: '입문',
        description: '계정 생성부터 첫 입찰 공고 분석까지 빠르게 시작하세요.',
      },
      {
        title: '대시보드 둘러보기',
        duration: '10분',
        level: '입문',
        description: '스프레드시트 인터페이스와 주요 기능을 소개합니다.',
      },
    ],
  },
  {
    category: '공고 수집',
    items: [
      {
        title: '나라장터 연동 설정',
        duration: '15분',
        level: '기초',
        description: '나라장터 API 키 발급 및 자동 수집 설정 방법.',
      },
      {
        title: 'TED (EU) 공고 모니터링',
        duration: '10분',
        level: '기초',
        description: '유럽 공공입찰 사이트 TED 연동 가이드.',
      },
      {
        title: '키워드 필터 설정',
        duration: '8분',
        level: '기초',
        description: '관심 분야 키워드로 공고를 자동 필터링하세요.',
      },
    ],
  },
  {
    category: 'AI 활용',
    items: [
      {
        title: 'AI 매칭 점수 이해하기',
        duration: '12분',
        level: '중급',
        description: '제품과 공고의 매칭 점수가 어떻게 계산되는지 알아봅니다.',
      },
      {
        title: 'AI 제안서 초안 생성',
        duration: '20분',
        level: '중급',
        description: 'AI를 활용한 제안서 초안 작성 방법.',
      },
    ],
  },
  {
    category: '고급 기능',
    items: [
      {
        title: 'API 연동 가이드',
        duration: '30분',
        level: '고급',
        description: 'REST API를 활용한 커스텀 통합 개발.',
      },
      {
        title: '팀 협업 설정',
        duration: '15분',
        level: '고급',
        description: '팀원 초대, 권한 설정, 알림 관리.',
      },
    ],
  },
];

export default function TutorialsPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-6 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 text-[#7C8AEA]">
            학습
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-white">튜토리얼</h1>
          <p className="text-zinc-400 mb-12 text-xl">
            단계별 가이드로 Qetta를 마스터하세요.
          </p>

          {/* 튜토리얼 카테고리 */}
          {tutorials.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="mb-6 text-2xl font-semibold text-white">{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((tutorial, tutIndex) => (
                  <div
                    key={tutIndex}
                    className="group cursor-pointer rounded-lg border border-white/[0.06] bg-white/[0.04] p-6 transition-colors hover:border-[#5E6AD2]/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-semibold text-white transition-colors group-hover:text-[#7C8AEA]">
                            {tutorial.title}
                          </h3>
                          <Badge variant="outline" className="text-xs border-white/[0.06] text-zinc-400">
                            {tutorial.level}
                          </Badge>
                        </div>
                        <p className="text-zinc-400 mb-3 text-sm">{tutorial.description}</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5E6AD2]/10 transition-colors group-hover:bg-gradient-to-r group-hover:from-[#5E6AD2] group-hover:to-[#4B56C8] group-hover:text-white">
                          <Play className="h-4 w-4 text-[#7C8AEA] group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 도움이 필요하신가요? */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-lg p-8 text-center">
            <h3 className="mb-4 text-xl font-semibold text-white">도움이 필요하신가요?</h3>
            <p className="text-zinc-400 mb-6">
              튜토리얼에서 원하는 내용을 찾지 못하셨나요?
              <br />
              지원팀에 문의해 주세요.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/support">
                <Button className="bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] text-white hover:from-[#4B56C8] hover:to-[#3D48B0]">지원 센터</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/[0.06] text-white hover:bg-white/[0.06]">문의하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
