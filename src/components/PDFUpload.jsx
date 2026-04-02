import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore, CATEGORIES } from '../store';
import { formatCurrency, parsePDFText } from '../utils';

/* ── SVG Icon Components ── */
const IconUpload = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconSearch = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconEdit = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFile = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconFileUp = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" />
  </svg>
);
const IconFolder = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const IconInvoice = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="6" y1="8" x2="18" y2="8" /><line x1="6" y1="12" x2="14" y2="12" /><line x1="6" y1="16" x2="10" y2="16" />
  </svg>
);
const IconPackage = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconClipboard = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const IconDatabase = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IconGrid = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconTrash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const STEPS = [
  { label: 'アップロード', desc: 'PDFファイルを選択', Icon: IconUpload },
  { label: 'AI解析', desc: 'データを自動抽出', Icon: IconSearch },
  { label: '確認・編集', desc: '内容を確認・修正', Icon: IconEdit },
  { label: '登録完了', desc: 'データベースに保存', Icon: IconCheck },
];

/* ── Sub-components (animations) ── */
function ParticleField() {
  return (
    <div className="pdf-particles">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="pdf-particle" style={{
          '--x': `${Math.random() * 100}%`, '--y': `${Math.random() * 100}%`,
          '--dur': `${4 + Math.random() * 5}s`, '--del': `${Math.random() * 4}s`,
          '--sz': `${2 + Math.random() * 5}px`, '--drift': `${-30 + Math.random() * 60}px`,
        }} />
      ))}
    </div>
  );
}

function OrbitDots() {
  return (
    <div className="pdf-orbit">
      {[0, 1, 2].map(i => (
        <div key={i} className="pdf-orbit-dot" style={{ '--orbit-delay': `${i * 0.4}s` }} />
      ))}
    </div>
  );
}

function CircularProgress({ value, label }) {
  const r = 52, c = 2 * Math.PI * r, offset = c - (value / 100) * c;
  return (
    <div className="pdf-circular-wrap">
      <OrbitDots />
      <svg className="pdf-circular-svg" viewBox="0 0 120 120" width="150" height="150">
        <defs>
          <linearGradient id="cpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" /><stop offset="50%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="cpGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" opacity="0.5" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" strokeDasharray="4 8" opacity="0.4" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#cpGrad)" strokeWidth="6" strokeLinecap="round" filter="url(#cpGlow)"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)', transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }} />
        <text x="60" y="55" textAnchor="middle" fontSize="26" fontWeight="800" fill="#1e293b">{Math.round(value)}</text>
        <text x="60" y="55" dx="22" dy="-6" textAnchor="start" fontSize="12" fontWeight="600" fill="#64748b">%</text>
        <text x="60" y="74" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="500" letterSpacing="1">{label || 'ANALYZING'}</text>
      </svg>
      <div className="pdf-circular-glow" />
    </div>
  );
}

function ScanEffect({ active }) {
  if (!active) return null;
  return (
    <div className="pdf-scan">
      <div className="pdf-scan-beam" />
      <div className="pdf-scan-rows">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="pdf-scan-row" style={{ '--ri': i }} />)}</div>
    </div>
  );
}

function AnimatedCheckmark() {
  return (
    <div className="pdf-ck-wrap">
      <svg className="pdf-ck-svg" viewBox="0 0 100 100" width="100" height="100">
        <circle className="pdf-ck-ring" cx="50" cy="50" r="42" /><circle className="pdf-ck-fill" cx="50" cy="50" r="42" />
        <path className="pdf-ck-path" d="M28 52 L42 66 L72 36" />
      </svg>
      <div className="pdf-ck-burst">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="pdf-ck-ray" style={{ '--ray-angle': `${i * 30}deg` }} />)}</div>
    </div>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  const colors = ['#4f46e5','#7c3aed','#10b981','#06b6d4','#f59e0b','#ec4899','#ef4444','#8b5cf6'];
  return (
    <div className="pdf-confetti">{Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="pdf-conf-piece" style={{
        '--cx': `${5 + Math.random() * 90}%`, '--cf-delay': `${Math.random() * 0.8}s`,
        '--cf-dur': `${1.8 + Math.random() * 1.5}s`, '--cf-drift': `${-60 + Math.random() * 120}px`,
        '--cf-rot': `${Math.random() * 1080}deg`, background: colors[i % colors.length],
        width: `${4 + Math.random() * 7}px`, height: `${4 + Math.random() * 7}px`,
        borderRadius: i % 3 === 0 ? '50%' : '2px',
      }} />
    ))}</div>
  );
}

/* ── PDF parser helper ── */
async function parsePDFFile(file) {
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  console.log(`=== PDF情報: ${file.name} ===`);
  console.log(`ページ数: ${pdf.numPages}`);

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const c = await pg.getTextContent();

    // デバッグ: テキストアイテムの詳細
    console.log(`--- ページ${i}: ${c.items.length}個のテキストアイテム ---`);
    if (c.items.length > 0) {
      console.log('最初の10アイテム:', c.items.slice(0, 10).map(it => ({
        str: it.str,
        fontName: it.fontName,
        width: it.width,
        hasEOL: it.hasEOL,
      })));
    }

    // テキスト抽出（空文字以外）
    const pageText = c.items.map(it => it.str).filter(s => s.trim()).join(' ');
    text += pageText + '\n';

    // アノテーション（フォームフィールド等）からもテキスト取得を試みる
    try {
      const annots = await pg.getAnnotations();
      if (annots.length > 0) {
        console.log(`ページ${i} アノテーション: ${annots.length}個`);
        for (const a of annots) {
          if (a.fieldValue) {
            text += ' ' + a.fieldValue;
            console.log(`フォームフィールド: ${a.fieldName} = ${a.fieldValue}`);
          }
          if (a.contentsObj?.str) text += ' ' + a.contentsObj.str;
        }
      }
    } catch (e) { /* ignore */ }

    // OperatorList から画像の有無を確認
    try {
      const ops = await pg.getOperatorList();
      const imgCount = ops.fnArray.filter(fn => fn === pdfjsLib.OPS?.paintImageXObject || fn === 82).length;
      if (imgCount > 0) console.log(`ページ${i}: ${imgCount}個の画像を検出（画像ベースPDFの可能性）`);
    } catch (e) { /* ignore */ }
  }

  console.log('=== 最終抽出テキスト ===\n', text || '（空）');

  const result = parsePDFText(text);
  result._rawText = text;
  // ファイル名から情報を推測
  if (!result.subject) {
    // ファイル名パターン: "282405T181　杉並区永福町３丁目計画.pdf"
    const fnMatch = file.name.replace(/\.pdf$/i, '').match(/(?:\d{6}T\d{3})?[　\s]*(.+)/);
    if (fnMatch) result.subject = fnMatch[1];
  }
  if (!result.docNumber) {
    const fnNum = file.name.match(/(\d{6}T\d{3})/);
    if (fnNum) result.docNumber = fnNum[1];
  }
  return result;
}

/* ══════════ MAIN COMPONENT ══════════ */
export default function PDFUpload() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileRef = useRef();
  const folderRef = useRef();

  // Batch state: array of { id, fileName, status:'pending'|'parsing'|'done'|'error', data, error }
  const [batch, setBatch] = useState([]);
  const [currentParse, setCurrentParse] = useState(-1);
  const [editIdx, setEditIdx] = useState(null); // which item is being edited in step 2

  const collectPDFs = (fileList) => {
    const pdfs = [];
    for (const f of fileList) {
      if (f.name.toLowerCase().endsWith('.pdf')) pdfs.push(f);
    }
    return pdfs;
  };

  const startBatch = useCallback(async (files) => {
    const pdfs = collectPDFs(files);
    if (pdfs.length === 0) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'PDFファイルが見つかりません' } });
      return;
    }

    const items = pdfs.map((f, i) => ({
      id: Date.now() + i,
      fileName: f.name,
      file: f,
      status: 'pending',
      data: null,
      error: null,
    }));
    setBatch(items);
    setStep(1);
    setProgress(0);
    setCurrentParse(0);

    // Parse all files sequentially
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      setCurrentParse(i);
      setProgress(Math.round((i / updated.length) * 100));
      updated[i] = { ...updated[i], status: 'parsing' };
      setBatch([...updated]);

      try {
        const result = await parsePDFFile(updated[i].file);
        updated[i] = { ...updated[i], status: 'done', data: { ...result, status: 'unpaid' } };
      } catch (err) {
        updated[i] = { ...updated[i], status: 'error', error: err.message };
      }
      setBatch([...updated]);
    }

    setProgress(100);
    setCurrentParse(-1);
    setTimeout(() => setStep(2), 600);
  }, [dispatch]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const items = e.dataTransfer.items;
    const files = [];
    // Collect from dataTransfer (supports folders in modern browsers)
    if (items) {
      for (const item of items) {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          // For simplicity, just use files directly
        }
      }
    }
    startBatch(e.dataTransfer.files);
  }, [startBatch]);

  const handleFileInput = (e) => {
    startBatch(e.target.files);
    e.target.value = '';
  };

  const handleRegisterAll = () => {
    const valid = batch.filter(b => b.status === 'done' && b.data);
    if (valid.length === 0) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: '登録できるデータがありません' } });
      return;
    }
    let count = 0;
    for (const b of valid) {
      const d = { ...b.data };
      delete d._rawText; // 生テキストは保存しない
      // 日付が空なら今日の日付をセット
      if (!d.date) d.date = new Date().toISOString().split('T')[0];
      dispatch({
        type: 'ADD_RECORD',
        payload: {
          ...d,
          items: d.items?.length > 0 ? d.items : [
            { description: d.subject || '作業一式', qty: 1, unit: '式', unitPrice: d.subtotal || 0, amount: d.subtotal || 0 }
          ],
        },
      });
      count++;
    }
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `${count}件の伝票を登録しました` } });
    setShowConfetti(true);
    setStep(3);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const removeBatchItem = (id) => {
    setBatch(prev => prev.filter(b => b.id !== id));
    if (editIdx !== null) setEditIdx(null);
  };

  const updateBatchField = (id, field, value) => {
    setBatch(prev => prev.map(b => {
      if (b.id !== id) return b;
      const d = { ...b.data, [field]: value };
      if (field === 'subtotal') {
        const s = parseInt(value) || 0;
        d.subtotal = s; d.tax = Math.floor(s * 0.1); d.total = s + d.tax;
      }
      return { ...b, data: d };
    }));
  };

  const reset = () => {
    setStep(0); setBatch([]); setProgress(0); setShowConfetti(false); setEditIdx(null); setCurrentParse(-1);
  };

  const doneCount = batch.filter(b => b.status === 'done').length;
  const errorCount = batch.filter(b => b.status === 'error').length;
  const totalBatch = batch.length;
  const batchTotal = batch.filter(b => b.data).reduce((s, b) => s + (b.data.total || 0), 0);

  const analysisSteps = [
    { label: 'テキスト抽出', threshold: 10 },
    { label: '伝票種別の識別', threshold: 30 },
    { label: '取引先・金額の解析', threshold: 55 },
    { label: 'データ構造化', threshold: 80 },
  ];

  return (
    <>
      <style>{`
/* ═══════════════ PREMIUM PDF UPLOAD STYLES ═══════════════ */
.pdf-steps{display:flex;align-items:flex-start;justify-content:center;padding:32px 32px 12px;gap:0}
.pdf-si{display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;min-width:80px}
.pdf-bubble{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#f8fafc;border:2.5px solid #e2e8f0;transition:all .6s cubic-bezier(.34,1.56,.64,1);position:relative;color:#94a3b8}
.pdf-bubble::before{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid transparent;transition:all .4s}
.pdf-si.active .pdf-bubble{background:linear-gradient(135deg,#4f46e5,#7c3aed);border-color:transparent;color:#fff;transform:scale(1.18);box-shadow:0 0 0 8px rgba(79,70,229,.12),0 8px 32px rgba(79,70,229,.3)}
.pdf-si.active .pdf-bubble::before{border-color:rgba(129,140,248,.3);animation:pdf-ring-spin 3s linear infinite}
@keyframes pdf-ring-spin{to{transform:rotate(360deg)}}
.pdf-si.done .pdf-bubble{background:linear-gradient(135deg,#10b981,#059669);border-color:transparent;color:#fff;box-shadow:0 0 0 5px rgba(16,185,129,.12);animation:pdf-done-pop .5s cubic-bezier(.34,1.56,.64,1)}
@keyframes pdf-done-pop{0%{transform:scale(.8)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
.pdf-slabel{margin-top:10px;font-size:12px;font-weight:600;color:#b0b8c8;transition:color .3s;text-align:center}
.pdf-si.active .pdf-slabel{color:#4f46e5}.pdf-si.done .pdf-slabel{color:#10b981}
.pdf-sdesc{font-size:10px;color:#d1d5db;margin-top:2px;text-align:center;transition:color .3s}.pdf-si.active .pdf-sdesc{color:#a5b4fc}
.pdf-conn{flex:1;height:3px;background:#e2e8f0;min-width:50px;position:relative;top:29px;border-radius:2px;overflow:hidden;margin:0 -2px}
.pdf-conn-fill{height:100%;width:0;border-radius:2px;background:linear-gradient(90deg,#10b981,#06b6d4);transition:width .9s cubic-bezier(.4,0,.2,1)}
.pdf-conn.filled .pdf-conn-fill{width:100%}

@keyframes pdf-enter{from{opacity:0;transform:translateY(36px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.pdf-card{background:#fff;border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);border:1px solid #e2e8f0;overflow:hidden;animation:pdf-enter .65s cubic-bezier(.34,1.56,.64,1)}

/* Upload Zone */
.pdf-zone{position:relative;margin:28px;border:2.5px dashed #c7d2e0;border-radius:18px;padding:56px 40px;text-align:center;cursor:pointer;background:linear-gradient(160deg,#fafaff 0%,#f0f2ff 50%,#f5f0ff 100%);transition:all .4s cubic-bezier(.4,0,.2,1);overflow:hidden}
.pdf-zone:hover{border-color:#a5b4fc;background:linear-gradient(160deg,#eef0ff 0%,#e8e0ff 100%);transform:translateY(-3px);box-shadow:0 12px 40px rgba(79,70,229,.1)}
.pdf-zone.drag{border-color:#6366f1;background:linear-gradient(160deg,#e0e7ff 0%,#ddd6fe 100%);transform:scale(1.03);box-shadow:0 16px 48px rgba(79,70,229,.18)}
.pdf-zone.drag .pdf-zicon{animation:pdf-bob 1s ease infinite}
@keyframes pdf-bob{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(-3deg)}}
.pdf-zicon{width:84px;height:84px;margin:0 auto 22px;background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#6366f1 100%);border-radius:22px;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 10px 28px rgba(79,70,229,.35);transition:all .4s cubic-bezier(.4,0,.2,1);position:relative}
.pdf-zicon::after{content:'';position:absolute;inset:0;border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.25),transparent)}
.pdf-zone:hover .pdf-zicon{transform:translateY(-6px) rotate(-6deg) scale(1.05);box-shadow:0 16px 36px rgba(79,70,229,.4)}
.pdf-ztitle{font-size:19px;font-weight:700;color:#1e293b;margin-bottom:6px}
.pdf-zsub{font-size:14px;color:#64748b;margin-bottom:20px}
.pdf-badges{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.pdf-badge-item{padding:7px 16px;border-radius:24px;font-size:12px;font-weight:600;background:#fff;border:1.5px solid #e2e8f0;color:#64748b;display:flex;align-items:center;gap:6px;transition:all .25s}
.pdf-badge-item:hover{border-color:#a5b4fc;color:#4f46e5;transform:translateY(-2px);box-shadow:0 4px 12px rgba(79,70,229,.1)}

/* Folder button */
.pdf-folder-row{display:flex;gap:12px;justify-content:center;margin-top:20px}
.pdf-folder-btn{padding:10px 22px;border-radius:12px;font-size:13px;font-weight:600;border:1.5px solid #e2e8f0;cursor:pointer;background:#fff;color:#64748b;font-family:inherit;display:flex;align-items:center;gap:8px;transition:all .25s}
.pdf-folder-btn:hover{border-color:#a5b4fc;color:#4f46e5;background:#f8f7ff;transform:translateY(-2px);box-shadow:0 4px 16px rgba(79,70,229,.1)}

.pdf-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.pdf-particle{position:absolute;left:var(--x);top:var(--y);width:var(--sz);height:var(--sz);border-radius:50%;background:linear-gradient(135deg,#818cf8,#a78bfa);opacity:.15;animation:pdf-pfloat var(--dur) var(--del) ease-in-out infinite}
@keyframes pdf-pfloat{0%,100%{transform:translate(0,0) scale(1);opacity:.12}25%{transform:translate(var(--drift),-18px) scale(1.4);opacity:.35}50%{transform:translate(calc(var(--drift)*-0.5),-30px) scale(1.1);opacity:.2}75%{transform:translate(calc(var(--drift)*0.3),-12px) scale(1.6);opacity:.3}}

/* Analysis */
.pdf-acard{background:#fff;border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #e2e8f0;padding:48px 40px;text-align:center;animation:pdf-enter .65s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden}
.pdf-circular-wrap{position:relative;display:inline-block;margin-bottom:28px}
.pdf-circular-svg{position:relative;z-index:1}
.pdf-circular-glow{position:absolute;inset:-16px;border-radius:50%;z-index:0;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 70%);animation:pdf-glow 2.5s ease infinite}
@keyframes pdf-glow{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:1}}
.pdf-orbit{position:absolute;inset:-12px;z-index:2;pointer-events:none}
.pdf-orbit-dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#818cf8;top:50%;left:50%;animation:pdf-orbit-move 2.4s var(--orbit-delay) linear infinite;box-shadow:0 0 8px rgba(129,140,248,.6)}
@keyframes pdf-orbit-move{0%{transform:translate(-50%,-50%) rotate(0deg) translateX(88px) scale(1);opacity:.8}50%{transform:translate(-50%,-50%) rotate(180deg) translateX(88px) scale(.5);opacity:.3}100%{transform:translate(-50%,-50%) rotate(360deg) translateX(88px) scale(1);opacity:.8}}
.pdf-atitle{font-size:20px;font-weight:800;margin-bottom:4px;background:linear-gradient(135deg,#4f46e5,#7c3aed,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pdf-afile{font-size:13px;color:#94a3b8;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:8px}
.pdf-afile-icon{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#fee2e2,#fecaca);display:flex;align-items:center;justify-content:center;color:#ef4444}
.pdf-batch-counter{font-size:14px;color:#64748b;margin-bottom:16px;font-weight:600}
.pdf-batch-counter span{color:#4f46e5}
.pdf-scan{position:absolute;inset:0;pointer-events:none}
.pdf-scan-beam{position:absolute;left:5%;right:5%;height:2px;background:linear-gradient(90deg,transparent 0%,#818cf8 30%,#a78bfa 50%,#818cf8 70%,transparent 100%);box-shadow:0 0 20px rgba(129,140,248,.5),0 0 60px rgba(129,140,248,.2);animation:pdf-beam 3s ease-in-out infinite}
@keyframes pdf-beam{0%{top:8%;opacity:0}8%{opacity:1}92%{opacity:1}100%{top:88%;opacity:0}}
.pdf-scan-rows{position:absolute;inset:30px 40px;display:flex;flex-direction:column;gap:10px}
.pdf-scan-row{height:8px;border-radius:4px;background:linear-gradient(90deg,rgba(129,140,248,.03),rgba(129,140,248,.08),rgba(129,140,248,.03));animation:pdf-rowfade .6s calc(var(--ri)*.15s) ease both}
@keyframes pdf-rowfade{from{opacity:0;transform:scaleX(.2)}to{opacity:1;transform:scaleX(1)}}

/* Batch file list during analysis */
.pdf-batch-list{max-width:420px;margin:16px auto 0;text-align:left;display:flex;flex-direction:column;gap:4px}
.pdf-batch-file{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;font-size:13px;transition:all .3s}
.pdf-batch-file.parsing{background:#eef2ff;color:#4f46e5;font-weight:500}
.pdf-batch-file.done{color:#10b981}
.pdf-batch-file.error{color:#ef4444}
.pdf-batch-file .bf-icon{width:18px;height:18px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px}
.pdf-batch-file.parsing .bf-icon{background:#4f46e5;border-color:#4f46e5;color:#fff;animation:pdf-as-pulse 1.6s ease infinite}
.pdf-batch-file.done .bf-icon{background:#10b981;border-color:#10b981;color:#fff}
.pdf-batch-file.error .bf-icon{background:#ef4444;border-color:#ef4444;color:#fff}
@keyframes pdf-as-pulse{0%,100%{box-shadow:0 0 0 4px rgba(79,70,229,.12)}50%{box-shadow:0 0 0 8px rgba(79,70,229,.06)}}

/* Confirm - batch list */
.pdf-ccard{background:#fff;border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #e2e8f0;overflow:hidden;animation:pdf-enter .65s cubic-bezier(.34,1.56,.64,1)}
.pdf-chdr{padding:20px 28px;background:linear-gradient(135deg,#f8fafc,#eef2ff);border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.pdf-chdr h3{font-size:17px;font-weight:700;display:flex;align-items:center;gap:10px;color:#1e293b}
.pdf-chdr-icon{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center}
.pdf-cstatus{display:flex;align-items:center;gap:8px;padding:6px 16px;border-radius:24px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#065f46;font-size:12px;font-weight:700;letter-spacing:.3px}
.pdf-cstatus-dot{width:7px;height:7px;border-radius:50%;background:#10b981;animation:pdf-blink 1.4s ease infinite}
@keyframes pdf-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.2;transform:scale(.7)}}

/* Batch item rows */
.pdf-batch-items{padding:16px 24px}
.pdf-bi{border:1.5px solid #e2e8f0;border-radius:12px;margin-bottom:12px;overflow:hidden;transition:all .3s;animation:pdf-enter .4s ease both}
.pdf-bi:hover{border-color:#cbd5e1;box-shadow:0 4px 12px rgba(0,0,0,.04)}
.pdf-bi-header{display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;transition:background .2s}
.pdf-bi-header:hover{background:#f8fafc}
.pdf-bi-file-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#fee2e2,#fecaca);color:#ef4444;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pdf-bi-info{flex:1;min-width:0}
.pdf-bi-name{font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdf-bi-meta{font-size:11px;color:#94a3b8;display:flex;gap:12px;margin-top:2px}
.pdf-bi-amount{font-size:16px;font-weight:700;color:#1e293b;font-variant-numeric:tabular-nums;white-space:nowrap}
.pdf-bi-actions{display:flex;gap:6px}
.pdf-bi-btn{width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#94a3b8;transition:all .2s}
.pdf-bi-btn:hover{border-color:#cbd5e1;color:#64748b;background:#f8fafc}
.pdf-bi-btn.del:hover{border-color:#fca5a5;color:#ef4444;background:#fef2f2}
.pdf-bi-expand{padding:0 18px 18px;animation:pdf-expand .3s ease}
@keyframes pdf-expand{from{opacity:0;max-height:0}to{opacity:1;max-height:600px}}
.pdf-bi-error{padding:12px 18px;background:#fef2f2;color:#991b1b;font-size:12px;display:flex;align-items:center;gap:8px}

/* Form fields in batch */
.pdf-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pdf-fg{position:relative}.pdf-fg.s2{grid-column:span 2}
.pdf-fg label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8;margin-bottom:5px}
.pdf-finput{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:inherit;transition:all .3s;background:#fff}
.pdf-finput:focus{outline:none;border-color:#818cf8;box-shadow:0 0 0 4px rgba(129,140,248,.1)}
select.pdf-finput{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px}

.pdf-total-bar{margin:0 24px 16px;padding:16px 20px;background:linear-gradient(135deg,#f8fafc,#eef2ff,#f5f0ff);border-radius:14px;border:1.5px solid #e0e7ff;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.pdf-total-lbl{font-size:14px;color:#64748b;font-weight:500;display:flex;align-items:center;gap:8px}
.pdf-total-val{font-size:28px;font-weight:900;letter-spacing:-.5px;background:linear-gradient(135deg,#4f46e5,#7c3aed,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pdf-cftr{padding:18px 28px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#fafbfc;flex-wrap:wrap}
.pdf-btn-reg{padding:13px 36px;border-radius:12px;font-size:15px;font-weight:700;border:none;cursor:pointer;color:#fff;font-family:inherit;background:linear-gradient(135deg,#10b981,#059669);transition:all .3s;box-shadow:0 4px 16px rgba(16,185,129,.25)}
.pdf-btn-reg::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2),transparent)}
.pdf-btn-reg:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(16,185,129,.35)}
.pdf-btn-x{padding:13px 28px;border-radius:12px;font-size:14px;font-weight:600;border:1.5px solid #e2e8f0;cursor:pointer;background:#fff;color:#64748b;font-family:inherit;transition:all .25s}
.pdf-btn-x:hover{border-color:#cbd5e1;background:#f8fafc}

/* Complete */
.pdf-dcard{background:#fff;border-radius:18px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #e2e8f0;padding:56px 40px;text-align:center;animation:pdf-enter .65s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden}
.pdf-ck-wrap{position:relative;display:inline-block;margin-bottom:28px}
.pdf-ck-svg{position:relative;z-index:2}
.pdf-ck-ring{fill:none;stroke:#d1fae5;stroke-width:4;stroke-dasharray:264;stroke-dashoffset:264;animation:pdf-ck-draw .7s .2s ease forwards}
.pdf-ck-fill{fill:#ecfdf5;opacity:0;animation:pdf-ck-fillin .4s .6s ease forwards}
@keyframes pdf-ck-fillin{to{opacity:1}}
.pdf-ck-path{fill:none;stroke:#10b981;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:80;stroke-dashoffset:80;animation:pdf-ck-draw .5s .7s ease forwards}
@keyframes pdf-ck-draw{to{stroke-dashoffset:0}}
.pdf-ck-burst{position:absolute;inset:-20px;z-index:1;pointer-events:none}
.pdf-ck-ray{position:absolute;top:50%;left:50%;width:3px;height:14px;background:linear-gradient(to bottom,#10b981,transparent);border-radius:2px;transform-origin:center 0;transform:rotate(var(--ray-angle)) translateY(-56px);opacity:0;animation:pdf-ray-burst .6s .8s ease forwards}
@keyframes pdf-ray-burst{0%{opacity:0;transform:rotate(var(--ray-angle)) translateY(-30px) scaleY(.3)}50%{opacity:1}100%{opacity:0;transform:rotate(var(--ray-angle)) translateY(-70px) scaleY(.1)}}
.pdf-dtitle{font-size:26px;font-weight:900;margin-bottom:8px;animation:pdf-dup .5s .6s ease both}
.pdf-ddesc{font-size:15px;color:#64748b;margin-bottom:36px;animation:pdf-dup .5s .8s ease both}
.pdf-dbtns{display:flex;gap:14px;justify-content:center;animation:pdf-dup .5s 1s ease both}
@keyframes pdf-dup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.pdf-btn-pri{padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;border:none;cursor:pointer;color:#fff;font-family:inherit;background:linear-gradient(135deg,#4f46e5,#7c3aed);transition:all .3s;box-shadow:0 6px 20px rgba(79,70,229,.3)}
.pdf-btn-pri:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(79,70,229,.4)}
.pdf-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10}
.pdf-conf-piece{position:absolute;left:var(--cx);top:-12px;animation:pdf-cfall var(--cf-dur) var(--cf-delay) cubic-bezier(.23,1,.32,1) forwards}
@keyframes pdf-cfall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}70%{opacity:1}100%{transform:translateY(420px) translateX(var(--cf-drift)) rotate(var(--cf-rot));opacity:0}}
@media(max-width:768px){
  .pdf-steps{padding:20px 12px 8px}.pdf-bubble{width:44px;height:44px}.pdf-conn{min-width:24px}.pdf-sdesc{display:none}
  .pdf-zone{padding:36px 16px;margin:16px}.pdf-fgrid{grid-template-columns:1fr}.pdf-fg.s2{grid-column:span 1}
  .pdf-acard{padding:32px 16px}.pdf-total-bar{flex-direction:column;text-align:center}
  .pdf-bi-header{flex-wrap:wrap}.pdf-batch-items{padding:12px 12px}
}
      `}</style>

      <div className="header">
        <div className="header-left"><h2>PDF登録</h2></div>
      </div>

      {/* Step Timeline */}
      <div className="pdf-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className={`pdf-conn ${i <= step ? 'filled' : ''}`}><div className="pdf-conn-fill" /></div>}
            <div className={`pdf-si ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <div className="pdf-bubble">{i < step ? <IconCheck size={22} /> : <s.Icon size={22} />}</div>
              <div className="pdf-slabel">{s.label}</div>
              <div className="pdf-sdesc">{s.desc}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="dashboard-grid grid-1">
        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="pdf-card">
            <div
              className={`pdf-zone ${dragging ? 'drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <ParticleField />
              <div className="pdf-zicon"><IconFileUp size={38} /></div>
              <div className="pdf-ztitle">PDFファイルをドラッグ＆ドロップ</div>
              <div className="pdf-zsub">複数ファイル・フォルダにも対応</div>
              <div className="pdf-badges">
                <span className="pdf-badge-item"><IconInvoice size={14} /> 請求書</span>
                <span className="pdf-badge-item"><IconPackage size={14} /> 納品書</span>
                <span className="pdf-badge-item"><IconClipboard size={14} /> 注文書</span>
              </div>
              <input ref={fileRef} type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={handleFileInput} />
            </div>
            <div className="pdf-folder-row" style={{ padding: '0 28px 24px' }}>
              <button className="pdf-folder-btn" onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }}>
                <IconFolder size={18} /> フォルダを選択
              </button>
              <input ref={folderRef} type="file" webkitdirectory="" multiple style={{ display: 'none' }} onChange={handleFileInput} />
              <button className="pdf-folder-btn" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                <IconFile size={18} /> ファイルを選択
              </button>
            </div>
          </div>
        )}

        {/* Step 1: AI Analysis (batch) */}
        {step === 1 && (
          <div className="pdf-acard">
            <ScanEffect active={progress < 100} />
            <CircularProgress value={progress} label={`${doneCount}/${totalBatch}`} />
            <div className="pdf-atitle">AI一括解析中</div>
            <div className="pdf-batch-counter">{totalBatch}件中 <span>{doneCount}件</span> 完了{errorCount > 0 && <span style={{ color: '#ef4444' }}> / {errorCount}件エラー</span>}</div>
            <div className="pdf-batch-list">
              {batch.map(b => (
                <div key={b.id} className={`pdf-batch-file ${b.status}`}>
                  <span className="bf-icon">{b.status === 'done' ? <IconCheck size={10} /> : b.status === 'error' ? '!' : ''}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.fileName}</span>
                  {b.status === 'done' && b.data && <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(b.data.total)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Confirm batch */}
        {step === 2 && (
          <div className="pdf-ccard">
            <div className="pdf-chdr">
              <h3><span className="pdf-chdr-icon"><IconGrid size={16} /></span> 解析結果の確認（{doneCount}件）</h3>
              <div className="pdf-cstatus"><span className="pdf-cstatus-dot" /> 解析完了</div>
            </div>

            <div className="pdf-batch-items">
              {batch.map((b, idx) => {
                if (b.status === 'error') {
                  return (
                    <div key={b.id} className="pdf-bi" style={{ borderColor: '#fca5a5' }}>
                      <div className="pdf-bi-error">
                        <IconFile size={14} />
                        <span style={{ flex: 1 }}>{b.fileName} - 解析エラー: {b.error}</span>
                        <button className="pdf-bi-btn del" onClick={() => removeBatchItem(b.id)}><IconTrash size={14} /></button>
                      </div>
                    </div>
                  );
                }
                if (!b.data) return null;
                const d = b.data;
                const isExpanded = editIdx === idx;
                return (
                  <div key={b.id} className="pdf-bi" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="pdf-bi-header" onClick={() => setEditIdx(isExpanded ? null : idx)}>
                      <div className="pdf-bi-file-icon"><IconFile size={16} /></div>
                      <div className="pdf-bi-info">
                        <div className="pdf-bi-name">{b.fileName}</div>
                        <div className="pdf-bi-meta">
                          <span>{d.docType || '未分類'}</span>
                          <span>{d.client || '不明'}</span>
                          <span>{d.date || '日付なし'}</span>
                          {d.category && <span className={`badge ${d.category}`} style={{ padding: '1px 8px', fontSize: 10 }}>{CATEGORIES[d.category]?.name}</span>}
                        </div>
                      </div>
                      <div className="pdf-bi-amount">{formatCurrency(d.total)}</div>
                      <div className="pdf-bi-actions">
                        <button className="pdf-bi-btn" title="編集" onClick={e => { e.stopPropagation(); setEditIdx(isExpanded ? null : idx); }}><IconEdit size={14} /></button>
                        <button className="pdf-bi-btn del" title="削除" onClick={e => { e.stopPropagation(); removeBatchItem(b.id); }}><IconTrash size={14} /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="pdf-bi-expand">
                        <div className="pdf-fgrid">
                          <div className="pdf-fg">
                            <label>伝票種別</label>
                            <select className="pdf-finput" value={d.docType} onChange={e => updateBatchField(b.id, 'docType', e.target.value)}>
                              <option value="">選択...</option>
                              <option value="請求書">請求書</option><option value="納品書">納品書</option><option value="注文書">注文書</option>
                            </select>
                          </div>
                          <div className="pdf-fg">
                            <label>伝票番号</label>
                            <input className="pdf-finput" value={d.docNumber} onChange={e => updateBatchField(b.id, 'docNumber', e.target.value)} />
                          </div>
                          <div className="pdf-fg">
                            <label>日付</label>
                            <input type="date" className="pdf-finput" value={d.date} onChange={e => updateBatchField(b.id, 'date', e.target.value)} />
                          </div>
                          <div className="pdf-fg">
                            <label>カテゴリ</label>
                            <select className="pdf-finput" value={d.category} onChange={e => updateBatchField(b.id, 'category', e.target.value)}>
                              <option value="">選択...</option>
                              {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="pdf-fg s2">
                            <label>取引先</label>
                            <input className="pdf-finput" value={d.client} onChange={e => updateBatchField(b.id, 'client', e.target.value)} />
                          </div>
                          <div className="pdf-fg s2">
                            <label>件名</label>
                            <input className="pdf-finput" value={d.subject} onChange={e => updateBatchField(b.id, 'subject', e.target.value)} />
                          </div>
                          <div className="pdf-fg">
                            <label>小計（税抜）</label>
                            <input type="number" className="pdf-finput" value={d.subtotal} onChange={e => updateBatchField(b.id, 'subtotal', e.target.value)} />
                          </div>
                          <div className="pdf-fg">
                            <label>消費税</label>
                            <input type="number" className="pdf-finput" value={d.tax} readOnly style={{ background: '#f8fafc', color: '#94a3b8' }} />
                          </div>
                          <div className="pdf-fg">
                            <label>ステータス</label>
                            <select className="pdf-finput" value={d.status} onChange={e => updateBatchField(b.id, 'status', e.target.value)}>
                              <option value="unpaid">未入金</option><option value="paid">入金済</option><option value="pending">処理中</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pdf-total-bar">
              <span className="pdf-total-lbl"><IconDatabase size={16} /> 合計金額（{doneCount}件）</span>
              <span className="pdf-total-val">{formatCurrency(batchTotal)}</span>
            </div>
            <div className="pdf-cftr">
              <button className="pdf-btn-x" onClick={reset}>キャンセル</button>
              <button className="pdf-btn-reg" onClick={handleRegisterAll} disabled={doneCount === 0}>
                {doneCount}件を一括登録
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="pdf-dcard">
            <Confetti show={showConfetti} />
            <AnimatedCheckmark />
            <div className="pdf-dtitle">登録完了</div>
            <div className="pdf-ddesc">伝票データがデータベースに正常に保存されました</div>
            <div className="pdf-dbtns">
              <button className="pdf-btn-pri" onClick={reset}>続けて登録</button>
              <button className="pdf-btn-x" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'dashboard' })}>ダッシュボードへ</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
