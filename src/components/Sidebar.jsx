import { useStore, CATEGORIES } from '../store';

/* ── SVG Icons ── */
const IcDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
  </svg>
);
const IcUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
  </svg>
);
const IcList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IcExport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

export default function Sidebar({ isOpen, onClose }) {
  const { state, dispatch } = useStore();
  const { currentPage, selectedCategory, records } = state;

  const nav = (page) => { dispatch({ type: 'SET_PAGE', payload: page }); onClose(); };
  const navCat = (cat) => { dispatch({ type: 'SET_CATEGORY', payload: cat }); onClose(); };

  const catCounts = {};
  Object.keys(CATEGORIES).forEach(k => { catCounts[k] = records.filter(r => r.category === k).length; });

  return (
    <>
      {isOpen && <div className="sb-overlay" onClick={onClose} />}
      <aside className={`sb${isOpen ? ' open' : ''}`}>
        <style>{`
/* ═══ Premium Sidebar ═══ */
.sb{
  width:260px;position:fixed;top:0;left:0;height:100vh;z-index:100;
  background:linear-gradient(180deg,#0f172a 0%,#1a1040 40%,#0f172a 100%);
  color:#fff;transition:transform .35s cubic-bezier(.4,0,.2,1);
  overflow-y:auto;overflow-x:hidden;
  box-shadow:4px 0 24px rgba(0,0,0,.3);
}
.sb::-webkit-scrollbar{width:4px}
.sb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}

/* Logo */
.sb-logo{
  padding:24px 22px 20px;display:flex;align-items:center;gap:14px;
  position:relative;
}
.sb-logo::after{
  content:'';position:absolute;bottom:0;left:22px;right:22px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(129,140,248,.3),transparent);
}
.sb-logo-icon{
  width:40px;height:40px;border-radius:12px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  display:flex;align-items:center;justify-content:center;
  font-size:17px;font-weight:800;letter-spacing:-.5px;
  box-shadow:0 4px 14px rgba(99,102,241,.4);
  position:relative;overflow:hidden;
}
.sb-logo-icon::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);
}
.sb-logo-text h1{font-size:15px;font-weight:700;letter-spacing:.3px;line-height:1.2}
.sb-logo-text .sb-sub{font-size:10px;color:#818cf8;font-weight:500;letter-spacing:.5px}

/* Section title */
.sb-section{
  padding:20px 22px 8px;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:1.5px;color:#4b5563;
  display:flex;align-items:center;gap:8px;
}
.sb-section::after{
  content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(75,85,99,.3),transparent);
}

/* Nav */
.sb-nav{padding:4px 12px;display:flex;flex-direction:column;gap:2px}
.sb-link{
  display:flex;align-items:center;gap:12px;
  padding:10px 12px;color:#9ca3af;text-decoration:none;
  border-radius:10px;font-size:13.5px;font-weight:500;
  transition:all .25s cubic-bezier(.4,0,.2,1);
  position:relative;overflow:hidden;
  border:1px solid transparent;
}
.sb-link::before{
  content:'';position:absolute;inset:0;border-radius:10px;
  background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05));
  opacity:0;transition:opacity .25s;
}
.sb-link:hover{
  color:#e2e8f0;border-color:rgba(99,102,241,.15);
}
.sb-link:hover::before{opacity:1}

.sb-link.active{
  color:#fff;
  background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.12));
  border-color:rgba(129,140,248,.25);
  box-shadow:0 0 20px rgba(99,102,241,.1),inset 0 1px 0 rgba(255,255,255,.05);
}
.sb-link.active::before{opacity:0}
.sb-link.active::after{
  content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
  width:3px;height:20px;border-radius:0 3px 3px 0;
  background:linear-gradient(180deg,#818cf8,#6366f1);
  box-shadow:0 0 8px rgba(129,140,248,.5);
  animation:sb-bar-in .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes sb-bar-in{from{height:0;opacity:0}to{height:20px;opacity:1}}

/* Icon wrap */
.sb-icon{
  width:32px;height:32px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.04);
  transition:all .25s;flex-shrink:0;
  color:currentColor;
}
.sb-link:hover .sb-icon{background:rgba(255,255,255,.08)}
.sb-link.active .sb-icon{
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff;
  box-shadow:0 2px 8px rgba(99,102,241,.3);
}

/* Badge */
.sb-badge{
  margin-left:auto;font-size:11px;font-weight:700;
  padding:2px 9px;border-radius:10px;
  background:rgba(255,255,255,.06);color:#6b7280;
  transition:all .25s;min-width:24px;text-align:center;
  border:1px solid rgba(255,255,255,.04);
}
.sb-link:hover .sb-badge{background:rgba(255,255,255,.1);color:#9ca3af}
.sb-link.active .sb-badge{
  background:rgba(129,140,248,.2);color:#a5b4fc;
  border-color:rgba(129,140,248,.15);
}

/* Category color dot */
.sb-dot{
  width:8px;height:8px;border-radius:50%;flex-shrink:0;
  transition:all .3s;box-shadow:0 0 0 0 transparent;
}
.sb-link:hover .sb-dot{transform:scale(1.3);box-shadow:0 0 6px currentColor}
.sb-link.active .sb-dot{transform:scale(1.4);box-shadow:0 0 10px currentColor}

/* Cat icon inside dot area */
.sb-cat-icon{
  width:32px;height:32px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .25s;
  font-size:12px;font-weight:800;
  border:1.5px solid rgba(255,255,255,.08);
}
.sb-link:hover .sb-cat-icon{border-color:rgba(255,255,255,.15)}
.sb-link.active .sb-cat-icon{
  border-color:transparent;
  box-shadow:0 2px 10px rgba(0,0,0,.2);
}

/* Sidebar bottom glow */
.sb-glow{
  position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);
  width:200px;height:80px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(99,102,241,.08),transparent);
  pointer-events:none;
}

/* Mobile */
@media(max-width:768px){
  .sb{transform:translateX(-100%)}
  .sb.open{transform:translateX(0)}
  .sb-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.6);
    backdrop-filter:blur(4px);z-index:99;
    animation:sb-ov-in .2s ease;
  }
  @keyframes sb-ov-in{from{opacity:0}to{opacity:1}}
}
        `}</style>

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">CLH</div>
          <div className="sb-logo-text">
            <h1>売上管理</h1>
            <span className="sb-sub">CAR LOCK HOLMES</span>
          </div>
        </div>

        {/* Menu */}
        <div className="sb-section">メニュー</div>
        <nav className="sb-nav">
          <a href="#" className={`sb-link${currentPage === 'dashboard' ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); nav('dashboard'); }}>
            <span className="sb-icon"><IcDashboard /></span>
            ダッシュボード
          </a>
          <a href="#" className={`sb-link${currentPage === 'upload' ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); nav('upload'); }}>
            <span className="sb-icon"><IcUpload /></span>
            PDF登録
          </a>
          <a href="#" className={`sb-link${currentPage === 'records' ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); nav('records'); }}>
            <span className="sb-icon"><IcList /></span>
            全伝票一覧
            <span className="sb-badge">{records.length}</span>
          </a>
        </nav>

        {/* Sections */}
        <div className="sb-section">セクション別</div>
        <nav className="sb-nav">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <a key={key} href="#"
              className={`sb-link${selectedCategory === key ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); navCat(key); }}>
              <span className="sb-cat-icon" style={{
                background: selectedCategory === key
                  ? cat.color
                  : `${cat.color}18`,
                color: selectedCategory === key ? '#fff' : cat.color,
              }}>
                {cat.icon}
              </span>
              {cat.name}
              <span className="sb-badge">{catCounts[key]}</span>
            </a>
          ))}
        </nav>

        {/* Export */}
        <div className="sb-section">エクスポート</div>
        <nav className="sb-nav" style={{ paddingBottom: 32 }}>
          <a href="#" className={`sb-link${currentPage === 'export' ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); nav('export'); }}>
            <span className="sb-icon"><IcExport /></span>
            データ出力
          </a>
        </nav>

        <div className="sb-glow" />
      </aside>
    </>
  );
}
