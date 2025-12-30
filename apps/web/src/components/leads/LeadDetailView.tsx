/**
 * Lead Detail View
 * 리드 상세 정보 표시
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  // TrashIcon - unused, prefixed to indicate intentional
} from '@heroicons/react/24/outline';
import type { Json } from '@/lib/types/database.types';

interface Lead {
  id: string;
  name: string;
  email: string;
  title?: string;
  phone?: string;
  organization?: string;
  organization_domain?: string;
  department?: string;
  score: number;
  status: string;
  verified: boolean;
  source?: string;
  sequence_id?: string;
  notes?: string;
  metadata?: Json;
  enriched_at?: string;
  created_at: string;
  updated_at: string;
  // UI-specific fields (derived from metadata or CRM sync)
  crm_id?: string;
  crm_synced_at?: string;
  deal_id?: string;
  deal_created?: boolean;
  signals?: string[];
}

interface Activity {
  id: string;
  lead_id: string;
  type: string;
  description: string;
  metadata?: Json;
  created_at: string;
}

interface Bid {
  id: string;
  title: string;
  organization: string;
  deadline?: string;
  url?: string;
}

interface LeadDetailViewProps {
  lead: Lead;
  activities: Activity[];
  bid?: Bid | null;
  userId: string;
}

export function LeadDetailView({ lead, activities, bid, userId: _userId }: LeadDetailViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'contacted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'qualified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'converted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'lost':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: '신규',
      contacted: '접촉',
      qualified: '적격',
      converted: '전환',
      lost: '손실',
    };
    return labels[status] || status;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-zinc-400';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return SparklesIcon;
      case 'status_changed':
        return CheckBadgeIcon;
      case 'enriched':
        return DocumentTextIcon;
      case 'contacted':
        return PaperAirplaneIcon;
      case 'crm_synced':
        return BuildingOfficeIcon;
      default:
        return ClockIcon;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCRMSync = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/v1/crm/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [lead.id] }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to sync with CRM:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/dashboard/leads"
          className="mb-4 inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="text-sm">리드 목록으로</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
              {lead.verified && <CheckBadgeIcon className="h-6 w-6 text-emerald-400" />}
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(lead.status)}`}
              >
                {getStatusLabel(lead.status)}
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              {lead.title && `${lead.title} · `}
              {lead.organization}
              {lead.department && ` · ${lead.department}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!lead.crm_synced_at && (
              <button
                onClick={handleCRMSync}
                disabled={isUpdating}
                className="h-10 rounded bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                CRM 동기화
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메인 정보 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 기본 정보 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
            <h2 className="mb-4 text-base font-medium text-white">연락처 정보</h2>

            <div className="space-y-4">
              {/* 이메일 */}
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="mb-1 text-xs text-zinc-400">이메일</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>

              {/* 전화번호 */}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-zinc-500" />
                  <div>
                    <p className="mb-1 text-xs text-zinc-400">전화번호</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-white">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* 조직 */}
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="mb-1 text-xs text-zinc-400">조직</p>
                  <p className="text-sm text-white">{lead.organization}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 스코어 & 신호 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
            <h2 className="mb-4 text-base font-medium text-white">리드 스코어 & 신호</h2>

            {/* 스코어 */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-zinc-400">스코어</span>
                <span className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                  {lead.score}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                  style={{ width: `${lead.score}%` }}
                />
              </div>
            </div>

            {/* 구매 신호 */}
            {lead.signals && lead.signals.length > 0 && (
              <div>
                <p className="mb-3 text-sm text-zinc-400">구매 신호</p>
                <div className="flex flex-wrap gap-2">
                  {lead.signals.map((signal: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400"
                    >
                      <SparklesIcon className="h-3.5 w-3.5" />
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 입찰 정보 */}
          {bid && (
            <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
              <h2 className="mb-4 text-base font-medium text-white">관련 입찰 정보</h2>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs text-zinc-400">입찰 공고</p>
                  <p className="text-sm text-white">{bid.title}</p>
                </div>
                {bid.url && (
                  <a
                    href={bid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
                  >
                    공고 보기
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 활동 내역 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113]">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-base font-medium text-white">활동 내역</h2>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04]">
                          <Icon className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">{activity.description}</p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {new Date(activity.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <ClockIcon className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                  <p className="text-sm text-zinc-400">활동 내역이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 상태 변경 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
            <h2 className="mb-4 text-base font-medium text-white">상태 변경</h2>
            <div className="space-y-2">
              {['new', 'contacted', 'qualified', 'converted', 'lost'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || lead.status === status}
                  className={`h-10 w-full rounded px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
                    lead.status === status
                      ? getStatusColor(status) + ' border'
                      : 'border border-white/[0.06] bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          {/* CRM 정보 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
            <h2 className="mb-4 text-base font-medium text-white">CRM 정보</h2>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs text-zinc-400">동기화 상태</p>
                {lead.crm_synced_at ? (
                  <div className="flex items-center gap-2">
                    <CheckBadgeIcon className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">동기화됨</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-500">미동기화</span>
                )}
              </div>

              {lead.crm_id && (
                <div>
                  <p className="mb-1 text-xs text-zinc-400">CRM ID</p>
                  <p className="font-mono text-sm text-white">{lead.crm_id}</p>
                </div>
              )}

              {lead.deal_created && lead.deal_id && (
                <div>
                  <p className="mb-1 text-xs text-zinc-400">딜 ID</p>
                  <p className="font-mono text-sm text-white">{lead.deal_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-6">
            <h2 className="mb-4 text-base font-medium text-white">메타 정보</h2>
            <div className="space-y-3">
              {lead.source && (
                <div>
                  <p className="mb-1 text-xs text-zinc-400">출처</p>
                  <p className="text-sm text-white">{lead.source}</p>
                </div>
              )}
              <div>
                <p className="mb-1 text-xs text-zinc-400">생성일</p>
                <p className="text-sm text-white">
                  {new Date(lead.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-zinc-400">최종 수정일</p>
                <p className="text-sm text-white">
                  {new Date(lead.updated_at).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
