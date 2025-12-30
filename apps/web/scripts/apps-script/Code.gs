/**
 * BIDFLOW Google Sheets AI Functions
 * Apps Script Custom Functions for AI-powered bid analysis
 *
 * Setup:
 * 1. Open Google Sheets > Extensions > Apps Script
 * 2. Copy this entire file to Code.gs
 * 3. Set Script Properties: BIDFLOW_API_URL, BIDFLOW_API_KEY
 * 4. Save and refresh the spreadsheet
 *
 * Available Functions:
 * - =AI_SCORE(title, keywords) - 175점 체계 매칭 점수
 * - =STOFO_WIN_RATE(bid_amount, estimated_price) - 낙찰 확률 예측
 * - =AI_RECOMMEND(title, deadline, amount) - 입찰 추천 (BID/REVIEW/SKIP)
 * - =AI_KEYWORDS(title) - 키워드 자동 추출
 * - =GUARANTEE_FEE(amount, provider) - 보증료 계산
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  API_URL: PropertiesService.getScriptProperties().getProperty('BIDFLOW_API_URL') || 'https://bidflow.qetta.io/api/v1',
  API_KEY: PropertiesService.getScriptProperties().getProperty('BIDFLOW_API_KEY') || '',
  CACHE_TTL: 3600, // 1 hour cache

  // CMNTech default keywords (can be customized per tenant)
  DEFAULT_PRIMARY_KEYWORDS: ['유량계', '초음파유량계', '전자유량계', '열량계', '계측기'],
  DEFAULT_SECONDARY_KEYWORDS: ['배관', '상수도', '하수도', '정수장', '취수장', '수도미터', '유량측정'],
  DEFAULT_EXCLUDE_KEYWORDS: ['설계용역', '감리', '측량', '철거', '해체'],
};

// ============================================================================
// AI_SCORE: 175점 체계 매칭 점수 계산
// ============================================================================

/**
 * Calculate match score using 175-point Enhanced Matcher system
 * @param {string} title - Bid title
 * @param {string} keywords - Comma-separated keywords (optional, uses default if empty)
 * @param {string} organization - Ordering organization name (optional, for org bonus)
 * @return {number} Match score (0-175)
 * @customfunction
 */
function AI_SCORE(title, keywords, organization) {
  if (!title) return 0;

  const titleLower = title.toLowerCase();

  // Parse keywords or use defaults
  let primaryKeywords, secondaryKeywords, excludeKeywords;

  if (keywords && keywords.length > 0) {
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
    primaryKeywords = keywordList.slice(0, 5);
    secondaryKeywords = keywordList.slice(5, 10);
    excludeKeywords = [];
  } else {
    primaryKeywords = CONFIG.DEFAULT_PRIMARY_KEYWORDS;
    secondaryKeywords = CONFIG.DEFAULT_SECONDARY_KEYWORDS;
    excludeKeywords = CONFIG.DEFAULT_EXCLUDE_KEYWORDS;
  }

  // 1. Check exclude keywords (immediate disqualification)
  for (const exclude of excludeKeywords) {
    if (titleLower.includes(exclude.toLowerCase())) {
      return 0;
    }
  }

  // 2. Keyword score (0-100)
  let keywordScore = 0;

  for (const keyword of primaryKeywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      keywordScore += 20; // 5 primary keywords * 20 = max 100
    }
  }

  for (const keyword of secondaryKeywords) {
    if (titleLower.includes(keyword.toLowerCase()) && keywordScore < 100) {
      keywordScore += 5; // Additional secondary matches
    }
  }

  keywordScore = Math.min(keywordScore, 100);

  // 3. Spec score (0-25) - Detect specifications in title
  let specScore = 0;
  const specPatterns = [
    /\d+mm/i,          // Pipe size
    /DN\d+/i,          // DN size
    /\d+A/i,           // A size
    /KS\s*[A-Z]/i,     // Korean Standard
    /ISO\s*\d+/i,      // ISO standard
  ];

  for (const pattern of specPatterns) {
    if (pattern.test(title)) {
      specScore += 5;
    }
  }
  specScore = Math.min(specScore, 25);

  // 4. Organization score (0-50) - Based on known favorable orgs
  let orgScore = 0;

  if (organization) {
    const favorableOrgs = [
      { pattern: /한국수자원|k-?water/i, score: 50 },
      { pattern: /한국환경공단/i, score: 45 },
      { pattern: /상수도사업본부/i, score: 40 },
      { pattern: /한국전력|KEPCO/i, score: 35 },
      { pattern: /지역난방/i, score: 30 },
      { pattern: /정수장|취수장/i, score: 25 },
      { pattern: /환경시설관리/i, score: 20 },
    ];

    for (const org of favorableOrgs) {
      if (org.pattern.test(organization)) {
        orgScore = Math.max(orgScore, org.score);
      }
    }
  }

  return keywordScore + specScore + orgScore;
}

// ============================================================================
// STOFO_WIN_RATE: 낙찰 확률 예측 (StoFo Engine Lite)
// ============================================================================

/**
 * Predict bid win probability using StoFo Engine algorithm
 * @param {number} bid_amount - Your proposed bid amount
 * @param {number} estimated_price - Estimated/Budget price
 * @param {number} competitors - Expected number of competitors (default: 8)
 * @return {string} Win probability percentage with recommendation
 * @customfunction
 */
function STOFO_WIN_RATE(bid_amount, estimated_price, competitors) {
  if (!bid_amount || !estimated_price || estimated_price <= 0) {
    return "N/A";
  }

  const numCompetitors = competitors || 8;
  const bidRatio = bid_amount / estimated_price;

  // StoFo Engine simplified probability model
  // Optimal ratio is around 87-88% for Korean government bids
  let probability;

  if (bidRatio < 0.80) {
    // Too low - likely rejected or suspicious
    probability = 0.05;
  } else if (bidRatio >= 0.80 && bidRatio < 0.85) {
    // Low but valid
    probability = 0.15 + (bidRatio - 0.80) * 2;
  } else if (bidRatio >= 0.85 && bidRatio < 0.87) {
    // Good range
    probability = 0.25 + (bidRatio - 0.85) * 5;
  } else if (bidRatio >= 0.87 && bidRatio <= 0.88) {
    // Optimal range (sweet spot)
    probability = 0.35 + (bidRatio - 0.87) * 15;
  } else if (bidRatio > 0.88 && bidRatio <= 0.90) {
    // Slightly high but good
    probability = 0.40 - (bidRatio - 0.88) * 5;
  } else if (bidRatio > 0.90 && bidRatio <= 0.95) {
    // High - lower probability
    probability = 0.30 - (bidRatio - 0.90) * 4;
  } else {
    // Too high
    probability = 0.10;
  }

  // Adjust for competition level
  const competitionFactor = Math.max(0.5, 1 - (numCompetitors - 5) * 0.03);
  probability *= competitionFactor;

  // Cap at reasonable limits
  probability = Math.max(0.02, Math.min(0.50, probability));

  const percentage = (probability * 100).toFixed(1);
  const emoji = probability >= 0.30 ? "🟢" : probability >= 0.20 ? "🟡" : "🔴";

  return `${emoji} ${percentage}%`;
}

// ============================================================================
// AI_RECOMMEND: 입찰 추천 액션
// ============================================================================

/**
 * Get AI recommendation for bid action
 * @param {string} title - Bid title
 * @param {string} deadline - Deadline date
 * @param {number} amount - Estimated amount
 * @param {string} keywords - Custom keywords (optional)
 * @return {string} Recommendation: BID / REVIEW / SKIP
 * @customfunction
 */
function AI_RECOMMEND(title, deadline, amount, keywords) {
  if (!title) return "SKIP";

  // Calculate score
  const score = AI_SCORE(title, keywords || "", "");

  // Check deadline urgency
  let deadlineUrgent = false;
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
    deadlineUrgent = daysLeft <= 3;
  }

  // Check amount threshold (minimum 50M KRW for CMNTech)
  const minAmount = 50000000; // 5천만원
  const hasMinAmount = amount >= minAmount;

  // Decision logic
  if (score >= 120 && hasMinAmount) {
    return deadlineUrgent ? "BID ⚡" : "BID ✓";
  } else if (score >= 70 && hasMinAmount) {
    return "REVIEW 👀";
  } else if (score >= 50) {
    return "REVIEW";
  } else {
    return "SKIP ✗";
  }
}

// ============================================================================
// AI_KEYWORDS: 키워드 자동 추출
// ============================================================================

/**
 * Extract keywords from bid title
 * @param {string} title - Bid title
 * @return {string} Comma-separated keywords found in title
 * @customfunction
 */
function AI_KEYWORDS(title) {
  if (!title) return "";

  const titleLower = title.toLowerCase();

  const allKeywords = [
    // Equipment types
    '유량계', '초음파유량계', '전자유량계', '열량계', '계측기',
    '수도미터', '유량측정기', '압력계', '레벨계', '온도계',
    // Applications
    '상수도', '하수도', '정수장', '취수장', '배수지',
    '난방', '에너지', '공업용수', '농업용수',
    // Specifications
    '초음파', '전자식', '비만관', '클램프온', '다회선',
    // Actions
    '설치', '교체', '유지보수', '구매', '납품',
  ];

  const found = allKeywords.filter(kw => titleLower.includes(kw.toLowerCase()));

  return found.join(', ');
}

// ============================================================================
// GUARANTEE_FEE: 보증료 계산
// ============================================================================

/**
 * Calculate guarantee fee estimate
 * @param {number} amount - Guarantee amount
 * @param {string} provider - Provider: SGI, KODIT, KIBO, etc. (default: SGI)
 * @param {string} type - Type: performance, advance, defect (default: performance)
 * @return {string} Estimated fee range
 * @customfunction
 */
function GUARANTEE_FEE(amount, provider, type) {
  if (!amount || amount <= 0) return "N/A";

  const providerRates = {
    'SGI': { min: 0.008, max: 0.020, name: 'SGI서울보증' },
    'KODIT': { min: 0.005, max: 0.025, name: '신용보증기금' },
    'KIBO': { min: 0.005, max: 0.020, name: '기술보증기금' },
    'CONSTRUCTION': { min: 0.003, max: 0.015, name: '건설공제조합' },
    'SPECIALTY': { min: 0.003, max: 0.015, name: '전문건설공제' },
  };

  const selectedProvider = providerRates[provider?.toUpperCase()] || providerRates['SGI'];

  // Type adjustments
  let typeMultiplier = 1.0;
  const guaranteeType = (type || 'performance').toLowerCase();

  switch (guaranteeType) {
    case 'advance':
      typeMultiplier = 1.2; // Advance payment bonds are slightly higher
      break;
    case 'defect':
      typeMultiplier = 0.8; // Defect bonds are lower
      break;
    default:
      typeMultiplier = 1.0;
  }

  const minFee = Math.round(amount * selectedProvider.min * typeMultiplier);
  const maxFee = Math.round(amount * selectedProvider.max * typeMultiplier);

  // Format with Korean won
  const formatWon = (n) => {
    if (n >= 10000) {
      return Math.round(n / 10000) + '만원';
    }
    return n.toLocaleString() + '원';
  };

  return `${formatWon(minFee)} ~ ${formatWon(maxFee)} (${selectedProvider.name})`;
}

// ============================================================================
// Menu & UI Functions
// ============================================================================

/**
 * Create custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BIDFLOW AI')
    .addItem('🔄 Sync with BIDFLOW', 'syncWithBidflow')
    .addItem('📊 Calculate All Scores', 'calculateAllScores')
    .addItem('📥 Import Today\'s Bids', 'importTodaysBids')
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addItem('ℹ️ Help', 'showHelp')
    .addToUi();
}

/**
 * Show settings dialog
 */
function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <h2>BIDFLOW Settings</h2>
    <p>Configure your BIDFLOW API connection:</p>
    <label>API URL:</label><br>
    <input type="text" id="apiUrl" value="${CONFIG.API_URL}" style="width:300px"><br><br>
    <label>API Key:</label><br>
    <input type="password" id="apiKey" value="${CONFIG.API_KEY ? '********' : ''}" style="width:300px"><br><br>
    <button onclick="google.script.host.close()">Close</button>
  `)
    .setWidth(400)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'BIDFLOW Settings');
}

/**
 * Show help dialog
 */
function showHelp() {
  const html = HtmlService.createHtmlOutput(`
    <h2>BIDFLOW AI Functions</h2>
    <h3>Available Functions:</h3>
    <ul>
      <li><b>=AI_SCORE(title, keywords)</b><br>
        Calculate 175-point match score</li>
      <li><b>=STOFO_WIN_RATE(bid_amount, estimated_price)</b><br>
        Predict win probability using StoFo Engine</li>
      <li><b>=AI_RECOMMEND(title, deadline, amount)</b><br>
        Get BID/REVIEW/SKIP recommendation</li>
      <li><b>=AI_KEYWORDS(title)</b><br>
        Extract relevant keywords from title</li>
      <li><b>=GUARANTEE_FEE(amount, provider)</b><br>
        Calculate guarantee fee estimate</li>
    </ul>
    <p>For more info: <a href="https://bidflow.qetta.io/docs">BIDFLOW Docs</a></p>
  `)
    .setWidth(500)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'BIDFLOW Help');
}

/**
 * Calculate scores for all rows
 */
function calculateAllScores() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // Find title column (assume column A or header says "제목" or "title")
  const headers = values[0];
  let titleCol = 0;
  let scoreCol = -1;

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toString().toLowerCase();
    if (header.includes('제목') || header.includes('title')) {
      titleCol = i;
    }
    if (header.includes('점수') || header.includes('score')) {
      scoreCol = i;
    }
  }

  // If no score column, add one
  if (scoreCol === -1) {
    scoreCol = headers.length;
    sheet.getRange(1, scoreCol + 1).setValue('AI Score');
  }

  // Calculate scores for each row
  for (let row = 1; row < values.length; row++) {
    const title = values[row][titleCol];
    if (title) {
      const score = AI_SCORE(title, '', '');
      sheet.getRange(row + 1, scoreCol + 1).setValue(score);
    }
  }

  SpreadsheetApp.getUi().alert(`Calculated scores for ${values.length - 1} rows`);
}

/**
 * Sync data with BIDFLOW API
 */
function syncWithBidflow() {
  const ui = SpreadsheetApp.getUi();

  if (!CONFIG.API_KEY) {
    ui.alert('Please configure BIDFLOW API Key in Settings');
    return;
  }

  try {
    const response = UrlFetchApp.fetch(CONFIG.API_URL + '/bids', {
      headers: {
        'Authorization': 'Bearer ' + CONFIG.API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = JSON.parse(response.getContentText());
    ui.alert(`Synced ${data.length || 0} bids from BIDFLOW`);
  } catch (error) {
    ui.alert('Sync failed: ' + error.message);
  }
}

/**
 * Import today's bids from G2B
 */
function importTodaysBids() {
  const ui = SpreadsheetApp.getUi();

  if (!CONFIG.API_KEY) {
    ui.alert('Please configure BIDFLOW API Key in Settings');
    return;
  }

  try {
    const response = UrlFetchApp.fetch(CONFIG.API_URL + '/bids/crawl', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CONFIG.API_KEY,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({ days: 1 })
    });

    const result = JSON.parse(response.getContentText());
    ui.alert(`Imported ${result.saved_count || 0} new bids`);
  } catch (error) {
    ui.alert('Import failed: ' + error.message);
  }
}
