/**
 * BIDFLOW Google Sheets API Client
 *
 * 입찰 데이터를 Google Sheets로 내보내기/가져오기
 * - 서비스 계정 인증 (Service Account)
 * - 실시간 양방향 동기화 지원
 */

import { google, sheets_v4 } from 'googleapis';

// ============================================================================
// Configuration
// ============================================================================

export interface GoogleSheetsConfig {
  // 서비스 계정 인증 (JSON 키 파일 내용)
  credentials?: {
    client_email: string;
    private_key: string;
  };
  // 또는 API 키 (읽기 전용)
  apiKey?: string;
  // 스프레드시트 ID
  spreadsheetId?: string;
}

const DEFAULT_CONFIG: GoogleSheetsConfig = {
  credentials:
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
      ? {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
      : undefined,
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
};

// ============================================================================
// Types
// ============================================================================

export interface BidRow {
  id: string;
  source: string;
  externalId: string;
  title: string;
  organization: string;
  deadline: string | null;
  estimatedAmount: number | null;
  currency: string;
  country: string;
  status: string;
  priority: string;
  matchScore: number | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SheetSyncResult {
  success: boolean;
  rowsWritten: number;
  spreadsheetUrl: string | null;
  error?: string;
}

// ============================================================================
// Google Sheets Client
// ============================================================================

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets | null = null;
  private config: GoogleSheetsConfig;
  private initialized: boolean = false;

  constructor(config?: Partial<GoogleSheetsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 클라이언트 초기화
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.credentials) {
      // 서비스 계정 인증 (쓰기 가능)
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: this.config.credentials.client_email,
          private_key: this.config.credentials.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    } else if (this.config.apiKey) {
      // API 키 인증 (읽기 전용)
      this.sheets = google.sheets({
        version: 'v4',
        auth: this.config.apiKey,
      });
    } else {
      throw new Error(
        '[GoogleSheets] No authentication configured. ' +
          'Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY or GOOGLE_SHEETS_API_KEY'
      );
    }

    this.initialized = true;
    console.log('[GoogleSheets] Client initialized');
  }

  /**
   * 스프레드시트 생성
   */
  async createSpreadsheet(title: string): Promise<string> {
    await this.initialize();

    if (!this.sheets) {
      throw new Error('[GoogleSheets] Client not initialized');
    }

    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [
          {
            properties: {
              title: '입찰 목록',
              gridProperties: { frozenRowCount: 1 },
            },
          },
          {
            properties: { title: 'TED (EU)' },
          },
          {
            properties: { title: 'SAM.gov (US)' },
          },
          {
            properties: { title: 'G2B (한국)' },
          },
        ],
      },
    });

    const spreadsheetId = response.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('[GoogleSheets] Failed to create spreadsheet');
    }

    console.log(`[GoogleSheets] Created spreadsheet: ${spreadsheetId}`);
    return spreadsheetId;
  }

  /**
   * 입찰 데이터를 스프레드시트에 쓰기
   */
  async writeBids(bids: BidRow[], sheetName: string = '입찰 목록'): Promise<SheetSyncResult> {
    await this.initialize();

    if (!this.sheets || !this.config.spreadsheetId) {
      return {
        success: false,
        rowsWritten: 0,
        spreadsheetUrl: null,
        error: 'Spreadsheet ID not configured',
      };
    }

    try {
      // 헤더 행
      const headers = [
        'ID',
        '소스',
        '외부ID',
        '제목',
        '발주기관',
        '마감일',
        '예상금액',
        '통화',
        '국가',
        '상태',
        '우선순위',
        '매칭점수',
        'URL',
        '등록일',
        '수정일',
      ];

      // 데이터 행
      const rows = bids.map((bid) => [
        bid.id,
        bid.source,
        bid.externalId,
        bid.title,
        bid.organization,
        bid.deadline || '',
        bid.estimatedAmount?.toString() || '',
        bid.currency,
        bid.country,
        bid.status,
        bid.priority,
        bid.matchScore?.toString() || '',
        bid.url || '',
        bid.createdAt,
        bid.updatedAt,
      ]);

      // 기존 데이터 클리어
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.config.spreadsheetId,
        range: `${sheetName}!A:O`,
      });

      // 헤더 + 데이터 쓰기
      const values = [headers, ...rows];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      // 헤더 스타일링 (볼드, 배경색)
      await this.formatHeader(sheetName);

      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}`;

      console.log(`[GoogleSheets] Written ${rows.length} bids to ${sheetName}`);

      return {
        success: true,
        rowsWritten: rows.length,
        spreadsheetUrl,
      };
    } catch (error) {
      console.error('[GoogleSheets] Write error:', error);
      return {
        success: false,
        rowsWritten: 0,
        spreadsheetUrl: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 소스별로 분리하여 쓰기
   */
  async writeBidsBySource(
    g2bBids: BidRow[],
    tedBids: BidRow[],
    samBids: BidRow[]
  ): Promise<{
    all: SheetSyncResult;
    g2b: SheetSyncResult;
    ted: SheetSyncResult;
    sam: SheetSyncResult;
  }> {
    const allBids = [...g2bBids, ...tedBids, ...samBids];

    const [all, g2b, ted, sam] = await Promise.all([
      this.writeBids(allBids, '입찰 목록'),
      this.writeBids(g2bBids, 'G2B (한국)'),
      this.writeBids(tedBids, 'TED (EU)'),
      this.writeBids(samBids, 'SAM.gov (US)'),
    ]);

    return { all, g2b, ted, sam };
  }

  /**
   * 스프레드시트에서 입찰 데이터 읽기
   */
  async readBids(sheetName: string = '입찰 목록'): Promise<BidRow[]> {
    await this.initialize();

    if (!this.sheets || !this.config.spreadsheetId) {
      console.warn('[GoogleSheets] Spreadsheet ID not configured');
      return [];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${sheetName}!A2:O`, // 헤더 제외
      });

      const rows = response.data.values || [];

      return rows.map((row) => ({
        id: row[0] || '',
        source: row[1] || '',
        externalId: row[2] || '',
        title: row[3] || '',
        organization: row[4] || '',
        deadline: row[5] || null,
        estimatedAmount: row[6] ? parseFloat(row[6]) : null,
        currency: row[7] || 'KRW',
        country: row[8] || '',
        status: row[9] || 'new',
        priority: row[10] || 'medium',
        matchScore: row[11] ? parseFloat(row[11]) : null,
        url: row[12] || null,
        createdAt: row[13] || new Date().toISOString(),
        updatedAt: row[14] || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('[GoogleSheets] Read error:', error);
      return [];
    }
  }

  /**
   * 특정 셀 업데이트
   */
  async updateCell(
    sheetName: string,
    row: number,
    column: string,
    value: string
  ): Promise<boolean> {
    await this.initialize();

    if (!this.sheets || !this.config.spreadsheetId) {
      return false;
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${sheetName}!${column}${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[value]] },
      });
      return true;
    } catch (error) {
      console.error('[GoogleSheets] Update cell error:', error);
      return false;
    }
  }

  /**
   * 헤더 포맷팅 (볼드, 배경색)
   */
  private async formatHeader(sheetName: string): Promise<void> {
    if (!this.sheets || !this.config.spreadsheetId) return;

    try {
      // 먼저 시트 ID 가져오기
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === sheetName);

      if (!sheet?.properties?.sheetId) return;

      const sheetId = sheet.properties.sheetId;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.config.spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.09, green: 0.09, blue: 0.09 }, // neutral-900
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                    },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              updateSheetProperties: {
                properties: {
                  sheetId,
                  gridProperties: { frozenRowCount: 1 },
                },
                fields: 'gridProperties.frozenRowCount',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.warn('[GoogleSheets] Format header warning:', error);
    }
  }

  /**
   * 스프레드시트 URL 반환
   */
  getSpreadsheetUrl(): string | null {
    if (!this.config.spreadsheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${this.config.spreadsheetId}`;
  }

  /**
   * 연결 상태 확인
   */
  async healthCheck(): Promise<{ connected: boolean; spreadsheetId: string | null }> {
    try {
      await this.initialize();

      if (!this.sheets || !this.config.spreadsheetId) {
        return { connected: false, spreadsheetId: null };
      }

      // 스프레드시트 메타데이터 가져오기로 연결 확인
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      return {
        connected: true,
        spreadsheetId: this.config.spreadsheetId,
      };
    } catch (error) {
      console.error('[GoogleSheets] Health check failed:', error);
      return { connected: false, spreadsheetId: null };
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const googleSheetsClient = new GoogleSheetsClient();
