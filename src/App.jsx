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
        `}</style>
        <div onClick={(e) => {
          if (window.innerWidth <= 768 && e.target.closest('.header-left')) {
            setSidebarOpen(true);
          }
        }}>
          {renderPage()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
