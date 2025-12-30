/**
 * 비밀번호 찾기 폼 컴포넌트 - Dynamic Import용
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      // 개발 모드
      setIsSubmitted(true);
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <CheckCircle2 className="h-8 w-8 text-neutral-800" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">이메일을 확인하세요</h1>
        <p className="text-muted-foreground mb-6">
          <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다. 이메일을 확인하고 링크를
          클릭해주세요.
        </p>
        <p className="text-muted-foreground mb-6 text-sm">
          이메일이 보이지 않으면 스팸함을 확인해주세요.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          로그인 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        로그인으로 돌아가기
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="text-muted-foreground mt-2">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-neutral-300 bg-neutral-100 p-3">
          <p className="text-sm text-neutral-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '전송 중...' : '재설정 링크 보내기'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
