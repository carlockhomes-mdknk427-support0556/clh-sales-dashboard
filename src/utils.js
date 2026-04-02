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

  if (text.includes('御請求書') || text.includes('請求書')) result.docType = '請求書';
  else if (text.includes('納品書')) result.docType = '納品書';
  else if (text.includes('注文書')) result.docType = '注文書';

  const invMatch = text.match(/(INV-\d+|DEL-\d+|\d{6}T\d{3})/);
  if (invMatch) result.docNumber = invMatch[1];

  const dateMatch = text.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
  if (dateMatch) result.date = dateMatch[1].replace(/\//g, '-');

  if (text.includes('美和') || text.includes('MIWA') || text.includes('ミワ')) result.category = 'miwa';
  else if (text.includes('ゴール') || text.includes('GOAL')) result.category = 'goal';
  else if (text.includes('シブタニ')) result.category = 'shibutani';
  else result.category = 'kanri';

  const clientMatch = text.match(/(株式会社[^\s\n御]+|[^\s\n]+株式会社)/);
  if (clientMatch) result.client = clientMatch[0];

  const subjectMatch = text.match(/件名[:\s]*([^\n]+)/);
  if (subjectMatch) result.subject = subjectMatch[1].trim();
  if (!result.subject) {
    const workMatch = text.match(/工事名[:\s]*([^\n]+)/);
    if (workMatch) result.subject = workMatch[1].trim();
  }

  const totalMatch = text.match(/(?:請求金額|合計金額|合計)[:\s]*[¥\\]?([\d,]+)/);
  if (totalMatch) result.total = parseInt(totalMatch[1].replace(/,/g, ''));

  const subtotalMatch = text.match(/(?:小計|10%対象\(税抜\))[:\s]*[¥\\]?([\d,]+)/);
  if (subtotalMatch) result.subtotal = parseInt(subtotalMatch[1].replace(/,/g, ''));

  const taxMatch = text.match(/(?:消費税|10%消費税)[:\s]*[¥\\]?([\d,]+)/);
  if (taxMatch) result.tax = parseInt(taxMatch[1].replace(/,/g, ''));

  if (result.subtotal && !result.tax) result.tax = Math.floor(result.subtotal * 0.1);
  if (result.subtotal && !result.total) result.total = result.subtotal + result.tax;
  if (result.total && !result.subtotal) {
    result.subtotal = Math.floor(result.total / 1.1);
    result.tax = result.total - result.subtotal;
  }

  const budgetMatch = text.match(/予算金額[（(]税抜[)）][:\s]*[¥\\]?([\d,]+)/);
  if (budgetMatch && !result.subtotal) {
    result.subtotal = parseInt(budgetMatch[1].replace(/,/g, ''));
    result.tax = Math.floor(result.subtotal * 0.1);
    result.total = result.subtotal + result.tax;
  }

  return result;
}
