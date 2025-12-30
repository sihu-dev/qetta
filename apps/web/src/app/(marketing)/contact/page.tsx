/**
 * 문의 페이지
 */
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const contactInfo = [
  {
    icon: Mail,
    label: '이메일',
    value: 'contact@qetta.io',
    description: '24시간 접수',
  },
  {
    icon: Phone,
    label: '전화',
    value: '02-1234-5678',
    description: '평일 9:00-18:00',
  },
  {
    icon: MapPin,
    label: '주소',
    value: '서울특별시 강남구 테헤란로 123',
    description: 'Qetta 빌딩 5층',
  },
  {
    icon: Clock,
    label: '영업 시간',
    value: '평일 9:00 - 18:00',
    description: '주말/공휴일 휴무',
  },
];

const inquiryTypes = [
  '제품 문의',
  'Enterprise 상담',
  '파트너십 제안',
  '연구 협력',
  '채용 문의',
  '기타',
];

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          inquiryType: '',
          message: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(result.error || '문의 접수에 실패했습니다.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              문의하기
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">무엇이든 물어보세요</h1>
            <p className="text-muted-foreground mt-6 text-lg">
              제품, 요금제, 파트너십 등 궁금한 점이 있으시면
              <br />
              언제든 문의해주세요. 빠르게 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form */}
              <div className="bg-card rounded-2xl border p-8">
                <h2 className="mb-6 text-2xl font-bold">문의 양식</h2>

                {status === 'success' ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-neutral-700" />
                    <h3 className="mb-2 text-xl font-semibold">문의가 접수되었습니다</h3>
                    <p className="text-muted-foreground mb-6">빠른 시일 내에 답변드리겠습니다.</p>
                    <Button onClick={() => setStatus('idle')}>새 문의하기</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          이름 <span className="text-neutral-600">*</span>
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="홍길동"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">회사명</label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="(주)예시회사"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        이메일 <span className="text-neutral-600">*</span>
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">전화번호</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        문의 유형 <span className="text-neutral-600">*</span>
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="bg-background w-full rounded-md border px-3 py-2"
                        required
                      >
                        <option value="">선택해주세요</option>
                        {inquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        문의 내용 <span className="text-neutral-600">*</span>
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="문의하실 내용을 자세히 작성해주세요."
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          접수 중...
                        </>
                      ) : (
                        '문의하기'
                      )}
                    </Button>
                    <p className="text-muted-foreground text-center text-xs">
                      제출 시{' '}
                      <Link href="/privacy" className="underline">
                        개인정보처리방침
                      </Link>
                      에 동의하는 것으로 간주됩니다.
                    </p>
                  </form>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="mb-6 text-2xl font-bold">연락처 정보</h2>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                        <p className="text-muted-foreground text-sm">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map placeholder */}
                <div className="bg-muted mt-8 flex aspect-video items-center justify-center rounded-xl">
                  <span className="text-muted-foreground">지도</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">자주 묻는 질문을 확인해보세요</h2>
          <p className="text-muted-foreground mb-6">
            이미 많은 분들이 궁금해하신 내용들을 정리해두었습니다.
          </p>
          <Button variant="outline" asChild>
            <Link href="/support">FAQ 보기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
