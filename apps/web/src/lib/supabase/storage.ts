/**
 * @module supabase/storage
 * @description Supabase Storage 유틸리티
 * @see https://supabase.com/docs/guides/storage
 */

import { supabaseAdmin } from './client';

// ============================================================================
// 상수
// ============================================================================

export const STORAGE_BUCKETS = {
  /** 입찰 공고 첨부파일 */
  BID_ATTACHMENTS: 'bid-attachments',
  /** 회사 문서 (사업자등록증, 인증서 등) */
  COMPANY_DOCUMENTS: 'company-documents',
  /** AI 생성 제안서 */
  PROPOSALS: 'proposals',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

// ============================================================================
// 타입 정의
// ============================================================================

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File | Blob | Buffer;
  contentType?: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  data?: Blob;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ListResult {
  success: boolean;
  files?: Array<{
    name: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

// ============================================================================
// 개발 모드 확인
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// Storage 함수
// ============================================================================

/**
 * 파일 업로드
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, contentType, upsert = false } = options;

  // 개발 모드에서 Supabase 미설정 시 시뮬레이션
  if (!supabaseAdmin) {
    if (isDevelopment) {
      console.log('[Storage DEV] 파일 업로드 (시뮬레이션):');
      console.log(`  버킷: ${bucket}`);
      console.log(`  경로: ${path}`);
      console.log(`  크기: ${file instanceof Blob ? file.size : 'N/A'} bytes`);
      return {
        success: true,
        path: path,
        url: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}`,
      };
    }
    return { success: false, error: 'Supabase 클라이언트가 설정되지 않았습니다' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
      contentType,
      upsert,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 업로드 중 오류 발생',
    };
  }
}

/**
 * 파일 다운로드
 */
export async function downloadFile(bucket: StorageBucket, path: string): Promise<DownloadResult> {
  if (!supabaseAdmin) {
    if (isDevelopment) {
      console.log('[Storage DEV] 파일 다운로드 (시뮬레이션):');
      console.log(`  버킷: ${bucket}`);
      console.log(`  경로: ${path}`);
      return { success: true, data: new Blob(['Mock file content']) };
    }
    return { success: false, error: 'Supabase 클라이언트가 설정되지 않았습니다' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 다운로드 중 오류 발생',
    };
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(
  bucket: StorageBucket,
  paths: string | string[]
): Promise<DeleteResult> {
  if (!supabaseAdmin) {
    if (isDevelopment) {
      console.log('[Storage DEV] 파일 삭제 (시뮬레이션):');
      console.log(`  버킷: ${bucket}`);
      console.log(`  경로: ${Array.isArray(paths) ? paths.join(', ') : paths}`);
      return { success: true };
    }
    return { success: false, error: 'Supabase 클라이언트가 설정되지 않았습니다' };
  }

  try {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    const { error } = await supabaseAdmin.storage.from(bucket).remove(pathArray);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 삭제 중 오류 발생',
    };
  }
}

/**
 * 파일 목록 조회
 */
export async function listFiles(bucket: StorageBucket, folder?: string): Promise<ListResult> {
  if (!supabaseAdmin) {
    if (isDevelopment) {
      console.log('[Storage DEV] 파일 목록 조회 (시뮬레이션):');
      console.log(`  버킷: ${bucket}`);
      console.log(`  폴더: ${folder || '(root)'}`);
      return {
        success: true,
        files: [
          {
            name: 'mock-file-1.pdf',
            size: 1024,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            name: 'mock-file-2.docx',
            size: 2048,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    }
    return { success: false, error: 'Supabase 클라이언트가 설정되지 않았습니다' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder || '');

    if (error) {
      return { success: false, error: error.message };
    }

    const files = data.map((file) => ({
      name: file.name,
      size: file.metadata?.size || 0,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '파일 목록 조회 중 오류 발생',
    };
  }
}

/**
 * 서명된 URL 생성 (private bucket용)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabaseAdmin) {
    if (isDevelopment) {
      console.log('[Storage DEV] 서명된 URL 생성 (시뮬레이션):');
      return {
        success: true,
        url: `https://demo.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=mock-token`,
      };
    }
    return { success: false, error: 'Supabase 클라이언트가 설정되지 않았습니다' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '서명된 URL 생성 중 오류 발생',
    };
  }
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 입찰 첨부파일 경로 생성
 */
export function getBidAttachmentPath(bidId: string, fileName: string): string {
  return `bids/${bidId}/${fileName}`;
}

/**
 * 회사 문서 경로 생성
 */
export function getCompanyDocumentPath(
  tenantId: string,
  docType: string,
  fileName: string
): string {
  return `tenants/${tenantId}/${docType}/${fileName}`;
}

/**
 * 제안서 경로 생성
 */
export function getProposalPath(bidId: string, version: number, fileName: string): string {
  return `proposals/${bidId}/v${version}/${fileName}`;
}

/**
 * 파일 확장자에서 Content-Type 추론
 */
export function inferContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    zip: 'application/zip',
  };
  return contentTypes[ext] || 'application/octet-stream';
}
