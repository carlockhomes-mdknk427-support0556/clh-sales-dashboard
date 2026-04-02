import { useStore, CATEGORIES } from '../store';

export default function Sidebar({ isOpen, onClose }) {
  const { state, dispatch } = useStore();
  const { currentPage, selectedCategory, records } = state;

  const nav = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    onClose();
  };
  const navCat = (cat) => {
    dispatch({ type: 'SET_CATEGORY', payload: cat });
    onClose();
  };

  const catCounts = {};
  Object.keys(CATEGORIES).forEach(k => {
    catCounts[k] = records.filter(r => r.category === k).length;
  });

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">C</div>
          <div>
            <h1>CLH 売上管理</h1>
            <span className="sub">カーロックホームズ</span>
          </div>
        </div>

        <div className="sidebar-section-title">メニュー</div>
        <nav className="sidebar-nav">
          <a
            href="#"
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={e => { e.preventDefault(); nav('dashboard'); }}
          >
            <span className="nav-icon">📊</span>
            ダッシュボード
          </a>
          <a
            href="#"
            className={currentPage === 'upload' ? 'active' : ''}
            onClick={e => { e.preventDefault(); nav('upload'); }}
          >
            <span className="nav-icon">📄</span>
            PDF登録
          </a>
          <a
            href="#"
            className={currentPage === 'records' ? 'active' : ''}
            onClick={e => { e.preventDefault(); nav('records'); }}
          >
            <span className="nav-icon">📋</span>
            全伝票一覧
            <span className="nav-badge">{records.length}</span>
          </a>
        </nav>

        <div className="sidebar-section-title">セクション別</div>
        <nav className="sidebar-nav">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <a
              key={key}
              href="#"
              className={selectedCategory === key ? 'active' : ''}
              onClick={e => { e.preventDefault(); navCat(key); }}
            >
              <span className="color-indicator" style={{ background: cat.color }} />
              {cat.name}
              <span className="nav-badge">{catCounts[key]}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-section-title">エクスポート</div>
        <nav className="sidebar-nav">
          <a
            href="#"
            className={currentPage === 'export' ? 'active' : ''}
            onClick={e => { e.preventDefault(); nav('export'); }}
          >
            <span className="nav-icon">📥</span>
            データ出力
          </a>
        </nav>
      </aside>
    </>
  );
}
