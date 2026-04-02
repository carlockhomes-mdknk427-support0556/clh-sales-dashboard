export function formatCurrency(num) {
  if (num == null) return '¥0';
  return '¥' + num.toLocaleString('ja-JP');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(key) {
  const [y, m] = key.split('-');
  return `${y}年${parseInt(m)}月`;
}

export function getCategoryTotals(records, categoryId) {
  const filtered = categoryId ? records.filter(r => r.category === categoryId) : records;
  return {
    count: filtered.length,
    subtotal: filtered.reduce((s, r) => s + r.subtotal, 0),
    tax: filtered.reduce((s, r) => s + r.tax, 0),
    total: filtered.reduce((s, r) => s + r.total, 0),
    paid: filtered.filter(r => r.status === 'paid').reduce((s, r) => s + r.total, 0),
    unpaid: filtered.filter(r => r.status !== 'paid').reduce((s, r) => s + r.total, 0),
    paidCount: filtered.filter(r => r.status === 'paid').length,
    unpaidCount: filtered.filter(r => r.status !== 'paid').length,
  };
}

export function getMonthlyData(records, categoryId) {
  const filtered = categoryId ? records.filter(r => r.category === categoryId) : records;
  const months = {};
  filtered.forEach(r => {
    const key = getMonthKey(r.date);
    if (!months[key]) months[key] = { month: key, total: 0, count: 0 };
    months[key].total += r.total;
    months[key].count += 1;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

export function docTypeLabel(type) {
  const map = { '請求書': 'invoice', '納品書': 'delivery', '注文書': 'order' };
  return map[type] || 'invoice';
}

export function statusLabel(status) {
  const map = { paid: '入金済', unpaid: '未入金', pending: '処理中' };
  return map[status] || status;
}

export function categoryName(categories, id) {
  return categories[id]?.name || id;
}

export function exportToExcel(records, filename) {
  import('xlsx').then(XLSX => {
    const data = records.map(r => ({
      '日付': r.date,
      '伝票種別': r.docType,
      '伝票番号': r.docNumber,
      '取引先': r.client,
      'カテゴリ': r.category === 'miwa' ? '美和ロック' : r.category === 'goal' ? 'ゴール' : r.category === 'shibutani' ? 'シブタニ' : '管理会社等',
      '件名': r.subject,
      '小計（税抜）': r.subtotal,
      '消費税': r.tax,
      '合計（税込）': r.total,
      'ステータス': statusLabel(r.status),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [
      { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 30 },
      { wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 10 },
    ];
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '売上データ');
    XLSX.writeFile(wb, filename || 'sales_data.xlsx');
  });
}

export function exportToCSV(records) {
  const headers = ['日付', '伝票種別', '伝票番号', '取引先', 'カテゴリ', '件名', '小計', '消費税', '合計', 'ステータス'];
  const rows = records.map(r => [
    r.date, r.docType, r.docNumber, r.client,
    r.category === 'miwa' ? '美和ロック' : r.category === 'goal' ? 'ゴール' : r.category === 'shibutani' ? 'シブタニ' : '管理会社等',
    r.subject, r.subtotal, r.tax, r.total, statusLabel(r.status),
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sales_data.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parsePDFText(text) {
  const result = {
    docType: '',
    docNumber: '',
    date: '',
    client: '',
    category: '',
    subject: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  // ── 全角数字を半角に変換 ──
  const norm = text.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
                    .replace(/，/g, ',').replace(/￥/g, '¥');

  // ── 伝票種別 ──
  if (norm.includes('御請求書') || norm.includes('請求書')) result.docType = '請求書';
  else if (norm.includes('御見積') || norm.includes('見積書')) result.docType = '見積書';
  else if (norm.includes('納品書')) result.docType = '納品書';
  else if (norm.includes('注文書') || norm.includes('発注書')) result.docType = '注文書';

  // ── 伝票番号（複数パターン対応） ──
  const numPatterns = [
    /(?:No|NO|no|伝票番号|書類番号|注文番号)[.:\s]*([A-Za-z0-9\-]+)/,
    /(INV-\d+|DEL-\d+)/,
    /(\d{6}T\d{3})/,
    /([A-Z]{2,}-\d{4,})/,
  ];
  for (const p of numPatterns) {
    const m = norm.match(p);
    if (m) { result.docNumber = m[1]; break; }
  }

  // ── 日付（多様な形式対応） ──
  const datePatterns = [
    /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/,           // 2024/05/01, 2024年5月1日
    /令和\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})/, // 令和6年5月1日
    /R\s*(\d{1,2})[./](\d{1,2})[./](\d{1,2})/,           // R6.5.1
  ];
  for (const p of datePatterns) {
    const m = norm.match(p);
    if (m) {
      if (p.source.includes('令和') || p.source.includes('R')) {
        const year = 2018 + parseInt(m[1]);
        result.date = `${year}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      } else {
        result.date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      }
      break;
    }
  }

  // ── カテゴリ ──
  if (norm.includes('美和') || norm.includes('MIWA') || norm.includes('ミワ') || norm.includes('カバサワ')) result.category = 'miwa';
  else if (norm.includes('ゴール') || norm.includes('GOAL')) result.category = 'goal';
  else if (norm.includes('シブタニ') || norm.includes('SHIBUTANI')) result.category = 'shibutani';
  else result.category = 'kanri';

  // ── 取引先 ──
  const clientPatterns = [
    /(?:御中|様)\s*$/m,  // "〇〇 御中" の前
    /((?:株式会社|㈱)[^\s\n御様]{2,20})/,
    /([^\s\n]{2,20}(?:株式会社|㈱))/,
    /((?:有限会社|合同会社)[^\s\n御様]{2,20})/,
  ];
  for (const p of clientPatterns) {
    const m = norm.match(p);
    if (m) {
      result.client = m[1] || m[0];
      result.client = result.client.replace(/\s*(御中|様)\s*$/, '').trim();
      if (result.client.length > 1) break;
    }
  }

  // ── 件名・工事名 ──
  const subjectPatterns = [
    /(?:件名|工事名|物件名|案件名|工事件名)[:\s：]*([^\n]{2,50})/,
    /(?:摘要|内容|品名)[:\s：]*([^\n]{2,50})/,
  ];
  for (const p of subjectPatterns) {
    const m = norm.match(p);
    if (m) { result.subject = m[1].trim(); break; }
  }
  // ファイル名から件名を推測
  if (!result.subject) {
    // ファイル名はparsePDFTextの外で処理
  }

  // ── 金額解析（多様なパターン） ──
  // 数値抽出ヘルパー
  const extractNum = (str) => parseInt((str || '').replace(/[,\s¥\\円]/g, '')) || 0;

  // 合計金額パターン（優先度順）
  const totalPatterns = [
    /(?:税込[合計]*|合計金額|御請求金額|請求金額|お支払[い]?金額|ご請求額)[（(税込)）]?\s*[¥\\]?\s*([\d,]+)/,
    /(?:合\s*計)\s*[¥\\]?\s*([\d,]+)/,
    /(?:TOTAL|Total)\s*[¥\\]?\s*([\d,]+)/,
    /[¥\\]\s*([\d,]{4,})\s*[-ー―]\s*$/m, // ¥520,000- のようなパターン
    /[¥\\]\s*([\d,]{4,})/,
  ];

  // 小計パターン
  const subtotalPatterns = [
    /(?:税抜[合計金額]*|小\s*計|税抜金額|10%対象[（(]税抜[)）])\s*[¥\\]?\s*([\d,]+)/,
    /(?:本体価格|本体金額|税抜価格)\s*[¥\\]?\s*([\d,]+)/,
    /(?:予算金額|請負金額|工事金額|契約金額|注文金額)[（(]?税抜?[)）]?\s*[¥\\]?\s*([\d,]+)/,
  ];

  // 消費税パターン
  const taxPatterns = [
    /(?:消費税[額等]*|(?:10|１０)\s*%\s*(?:消費税|対象税額))\s*[¥\\]?\s*([\d,]+)/,
    /(?:税\s*額|内\s*税)\s*[¥\\]?\s*([\d,]+)/,
  ];

  for (const p of totalPatterns) {
    const m = norm.match(p);
    if (m) { result.total = extractNum(m[1]); break; }
  }

  for (const p of subtotalPatterns) {
    const m = norm.match(p);
    if (m) { result.subtotal = extractNum(m[1]); break; }
  }

  for (const p of taxPatterns) {
    const m = norm.match(p);
    if (m) { result.tax = extractNum(m[1]); break; }
  }

  // ── 金額の相互補完 ──
  if (result.subtotal && !result.tax) result.tax = Math.floor(result.subtotal * 0.1);
  if (result.subtotal && !result.total) result.total = result.subtotal + result.tax;
  if (result.total && !result.subtotal) {
    result.subtotal = Math.floor(result.total / 1.1);
    result.tax = result.total - result.subtotal;
  }
  if (!result.total && !result.subtotal) {
    // 最後の手段: テキスト内の大きな数値を金額として推測
    const allNums = [...norm.matchAll(/(?:[\d,]{4,})/g)]
      .map(m => extractNum(m[0]))
      .filter(n => n >= 1000 && n < 100000000)
      .sort((a, b) => b - a);
    if (allNums.length > 0) {
      // 最大の数値を合計と推測
      result.total = allNums[0];
      result.subtotal = Math.floor(result.total / 1.1);
      result.tax = result.total - result.subtotal;
    }
  }

  return result;
}
