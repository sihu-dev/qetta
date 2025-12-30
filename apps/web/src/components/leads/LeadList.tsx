/**
 * Lead List Component
 * 리드 목록 테이블
 */

'use client';

import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  title?: string;
  phone?: string;
  organization: string;
  department?: string;
  score: number;
  status: string;
  verified: boolean;
  crm_synced_at?: string;
  created_at: string;
}

interface LeadListProps {
  leads: Lead[];
}

export function LeadList({ leads }: LeadListProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-zinc-400';
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

  const handleBulkAction = async (action: string, params?: Record<string, unknown>) => {
    if (selectedLeads.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeads,
          action,
          params,
        }),
      });

      if (response.ok) {
        setSelectedLeads([]);
        window.location.reload();
      } else {
        alert('작업 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('작업 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkCRMSync = () => {
    if (confirm(`선택한 ${selectedLeads.length}개 리드를 CRM에 동기화하시겠습니까?`)) {
      handleBulkAction('crm_sync', { provider: 'attio' });
    }
  };

  const handleBulkStatusChange = () => {
    const status = prompt('변경할 상태를 입력하세요 (new/contacted/qualified/converted/lost):');
    if (status && ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(status)) {
      handleBulkAction('update_status', { status });
    } else if (status) {
      alert('올바른 상태를 입력해주세요.');
    }
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `선택한 ${selectedLeads.length}개 리드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      handleBulkAction('delete');
    }
  };

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-12 text-center">
        <SparklesIcon className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
        <h3 className="mb-2 text-lg font-medium text-white">리드가 없습니다</h3>
        <p className="mb-6 text-sm text-zinc-400">입찰 공고를 분석하여 첫 리드를 생성해보세요</p>
        <Link
          href="/dashboard/bids"
          className="inline-flex h-10 items-center gap-2 rounded bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          입찰 공고 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#111113]">
      {/* 헤더 */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white">전체 리드 ({leads.length})</h3>

          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">{selectedLeads.length}개 선택</span>
              <button
                onClick={handleBulkCRMSync}
                disabled={isProcessing}
                className="h-8 rounded border border-white/[0.06] px-3 text-xs text-zinc-300 transition-colors hover:bg-white/[0.04] disabled:opacity-50"
              >
                CRM 동기화
              </button>
              <button
                onClick={handleBulkStatusChange}
                disabled={isProcessing}
                className="h-8 rounded border border-white/[0.06] px-3 text-xs text-zinc-300 transition-colors hover:bg-white/[0.04] disabled:opacity-50"
              >
                상태 변경
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="h-8 rounded border border-red-500/[0.2] px-3 text-xs text-red-400 transition-colors hover:bg-red-500/[0.1] disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/[0.12] bg-white/[0.04]"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeads(leads.map((l) => l.id));
                    } else {
                      setSelectedLeads([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                담당자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                조직
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                스코어
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                CRM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                생성일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {leads.map((lead) => (
              <tr key={lead.id} className="cursor-pointer transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/[0.12] bg-white/[0.04]"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads([...selectedLeads, lead.id]);
                      } else {
                        setSelectedLeads(selectedLeads.filter((id) => id !== lead.id));
                      }
                    }}
                  />
                </td>

                {/* 담당자 */}
                <td className="px-6 py-4">
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <span className="text-sm font-medium text-white">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-white">{lead.name}</p>
                          {lead.verified && (
                            <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="h-3 w-3 text-zinc-500" />
                              <span className="truncate text-xs text-zinc-400">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="h-3 w-3 text-zinc-500" />
                              <span className="text-xs text-zinc-400">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>

                {/* 조직 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{lead.organization}</p>
                      {lead.title && (
                        <p className="truncate text-xs text-zinc-400">
                          {lead.title}
                          {lead.department && ` · ${lead.department}`}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* 스코어 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="max-w-[100px] flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </div>
                </td>

                {/* 상태 */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(lead.status)}`}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </td>

                {/* CRM */}
                <td className="px-6 py-4">
                  {lead.crm_synced_at ? (
                    <CheckBadgeIcon className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <span className="text-xs text-zinc-500">미동기화</span>
                  )}
                </td>

                {/* 생성일 */}
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-400">
                    {new Date(lead.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
