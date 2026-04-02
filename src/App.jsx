import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SectionPage from './components/SectionPage';
import PDFUpload from './components/PDFUpload';
import RecordsList from './components/RecordsList';
import ExportPage from './components/ExportPage';
import ToastContainer from './components/Toast';

function App() {
  const { state } = useStore();
  const { currentPage, selectedCategory } = state;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0);
  }, [currentPage, selectedCategory]);

  const renderPage = () => {
    if (currentPage === 'section' && selectedCategory) {
      return <SectionPage categoryId={selectedCategory} />;
    }
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'upload': return <PDFUpload />;
      case 'records': return <RecordsList />;
      case 'export': return <ExportPage />;
      default: return <Dashboard />;
    }
  };

  const pageTitle = () => {
    if (currentPage === 'section' && selectedCategory) {
      return state.categories[selectedCategory]?.name || '';
    }
    const map = {
      dashboard: 'ダッシュボード',
      upload: 'PDF登録',
      records: '全伝票一覧',
      export: 'データ出力',
    };
    return map[currentPage] || 'ダッシュボード';
  };

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content" ref={mainRef}>
        {/* Mobile header with menu toggle is handled inside each page's header */}
        <div style={{ display: 'none' }} className="mobile-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <span>{pageTitle()}</span>
        </div>
        {/* Inject menu toggle into page headers on mobile */}
        <style>{`
          @media (max-width: 768px) {
            .header .header-left::before {
              content: '☰';
              font-size: 20px;
              cursor: pointer;
              padding: 4px 8px;
              margin-right: 8px;
            }
            .header .header-left {
              cursor: pointer;
            }
          }
          /* Loading overlay */
          .app-loading{
            position:fixed;inset:0;z-index:9999;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            background:linear-gradient(135deg,#0f172a,#1a1040);
            color:#fff;gap:20px;
          }
          .app-loading-spinner{
            width:48px;height:48px;border-radius:50%;
            border:3px solid rgba(255,255,255,.1);
            border-top-color:#818cf8;
            animation:app-spin .8s linear infinite;
          }
          @keyframes app-spin{to{transform:rotate(360deg)}}
          .app-loading-text{font-size:14px;color:#9ca3af;letter-spacing:.5px}
          /* Sync indicator */
          .sync-indicator{
            position:fixed;top:12px;right:12px;z-index:200;
            display:flex;align-items:center;gap:8px;
            padding:8px 14px;border-radius:8px;
            background:rgba(99,102,241,.15);backdrop-filter:blur(8px);
            border:1px solid rgba(129,140,248,.2);
            font-size:12px;color:#a5b4fc;
            animation:sync-in .3s ease;
          }
          @keyframes sync-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
          .sync-dot{
            width:8px;height:8px;border-radius:50%;
            background:#818cf8;
            animation:sync-pulse 1s ease infinite;
          }
          @keyframes sync-pulse{0%,100%{opacity:.4}50%{opacity:1}}
          /* API status badge */
          .api-badge{
            position:fixed;bottom:12px;right:12px;z-index:200;
            display:flex;align-items:center;gap:6px;
            padding:6px 12px;border-radius:20px;
            font-size:11px;font-weight:600;letter-spacing:.3px;
            backdrop-filter:blur(8px);
            border:1px solid rgba(255,255,255,.08);
            transition:all .3s;
          }
          .api-badge.connected{
            background:rgba(16,185,129,.1);color:#6ee7b7;
            border-color:rgba(16,185,129,.2);
          }
          .api-badge.local{
            background:rgba(251,191,36,.1);color:#fcd34d;
            border-color:rgba(251,191,36,.2);
          }
          .api-badge-dot{
            width:6px;height:6px;border-radius:50%;
          }
          .api-badge.connected .api-badge-dot{background:#10b981}
          .api-badge.local .api-badge-dot{background:#f59e0b}
        `}</style>

        {/* Loading overlay */}
        {state.loading && (
          <div className="app-loading">
            <div className="app-loading-spinner" />
            <div className="app-loading-text">データを読み込んでいます...</div>
          </div>
        )}

        {/* Sync indicator */}
        {state.syncing && (
          <div className="sync-indicator">
            <span className="sync-dot" />
            スプレッドシートに同期中...
          </div>
        )}

        <div onClick={(e) => {
          if (window.innerWidth <= 768 && e.target.closest('.header-left')) {
            setSidebarOpen(true);
          }
        }}>
          {!state.loading && renderPage()}
        </div>

        {/* API connection badge */}
        {!state.loading && (
          <div className={`api-badge ${state.apiConnected ? 'connected' : 'local'}`}>
            <span className="api-badge-dot" />
            {state.apiConnected ? 'スプレッドシート接続中' : 'ローカルモード'}
          </div>
        )}
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
