import { createContext, useContext, useReducer } from 'react';

const StoreContext = createContext();

const CATEGORIES = {
  miwa: { id: 'miwa', name: '美和ロック', color: '#008C4E', icon: 'M' },
  shibutani: { id: 'shibutani', name: 'シブタニ', color: '#B23030', icon: 'S' },
  goal: { id: 'goal', name: 'ゴール', color: '#0087C8', icon: 'G' },
  kanri: { id: 'kanri', name: '管理会社等', color: '#d97706', icon: 'K' },
};

const SAMPLE_DATA = [
  {
    id: '1',
    date: '2026-02-28',
    docType: '請求書',
    docNumber: 'INV-0000000298',
    client: '株式会社ゴール 東京支店',
    category: 'goal',
    subject: '2026年2月分',
    items: [
      { description: 'ザ・パークハウス大森905号室電気錠不具合メンテナンス', qty: 1, unit: '式', unitPrice: 25000, amount: 25000 },
      { description: 'TPH鷺沼ゴミ置場電気錠不具合対応', qty: 1, unit: '式', unitPrice: 15000, amount: 15000 },
      { description: '両国3丁目学生寮FRS/RCBシステム工事', qty: 1, unit: '式', unitPrice: 170000, amount: 170000 },
    ],
    subtotal: 210000,
    tax: 21000,
    total: 231000,
    status: 'paid',
  },
  {
    id: '2',
    date: '2026-03-11',
    docType: '注文書',
    docNumber: '282603T050',
    client: '美和ロック（株式会社カバサワ経由）',
    category: 'miwa',
    subject: 'クリオ不動前 システム工事一式',
    items: [
      { description: 'システム工事一式（機器取付結線・キーヘッド登録組付・検査立会・取説立会）', qty: 1, unit: '式', unitPrice: 520000, amount: 520000 },
    ],
    subtotal: 520000,
    tax: 52000,
    total: 572000,
    status: 'pending',
  },
  {
    id: '3',
    date: '2026-03-26',
    docType: '納品書',
    docNumber: 'DEL-0000000091',
    client: '株式会社シブタニ',
    category: 'shibutani',
    subject: 'プレシス蓮田不具合対応',
    items: [
      { description: '不具合対応費（3/26対応分）', qty: 1, unit: '式', unitPrice: 15000, amount: 15000 },
      { description: '出張費', qty: 1, unit: '式', unitPrice: 5000, amount: 5000 },
    ],
    subtotal: 20000,
    tax: 2000,
    total: 22000,
    status: 'unpaid',
  },
  {
    id: '4',
    date: '2026-01-15',
    docType: '請求書',
    docNumber: 'INV-0000000280',
    client: '美和ロック株式会社',
    category: 'miwa',
    subject: 'パークシティ武蔵小杉 電気錠交換工事',
    items: [
      { description: '電気錠交換工事一式', qty: 1, unit: '式', unitPrice: 380000, amount: 380000 },
    ],
    subtotal: 380000,
    tax: 38000,
    total: 418000,
    status: 'paid',
  },
  {
    id: '5',
    date: '2026-01-28',
    docType: '納品書',
    docNumber: 'DEL-0000000085',
    client: '株式会社ゴール 東京支店',
    category: 'goal',
    subject: 'ライオンズマンション門前仲町 電気錠メンテナンス',
    items: [
      { description: '電気錠メンテナンス作業', qty: 1, unit: '式', unitPrice: 35000, amount: 35000 },
      { description: '部品代', qty: 1, unit: '式', unitPrice: 12000, amount: 12000 },
    ],
    subtotal: 47000,
    tax: 4700,
    total: 51700,
    status: 'paid',
  },
  {
    id: '6',
    date: '2026-02-10',
    docType: '請求書',
    docNumber: 'INV-0000000290',
    client: '三井不動産レジデンシャル',
    category: 'kanri',
    subject: 'パークタワー晴海 定期メンテナンス',
    items: [
      { description: '電気錠システム定期メンテナンス', qty: 1, unit: '式', unitPrice: 180000, amount: 180000 },
    ],
    subtotal: 180000,
    tax: 18000,
    total: 198000,
    status: 'paid',
  },
  {
    id: '7',
    date: '2026-03-05',
    docType: '注文書',
    docNumber: '282603T042',
    client: '美和ロック（松下産業経由）',
    category: 'miwa',
    subject: 'ブリリアタワー池袋 システム設置',
    items: [
      { description: 'FRSシステム設置工事一式', qty: 1, unit: '式', unitPrice: 650000, amount: 650000 },
    ],
    subtotal: 650000,
    tax: 65000,
    total: 715000,
    status: 'pending',
  },
  {
    id: '8',
    date: '2026-02-20',
    docType: '請求書',
    docNumber: 'INV-0000000295',
    client: '野村不動産パートナーズ',
    category: 'kanri',
    subject: 'プラウドタワー東雲 緊急対応',
    items: [
      { description: '緊急出張対応費', qty: 1, unit: '式', unitPrice: 25000, amount: 25000 },
      { description: '電気錠修理', qty: 1, unit: '式', unitPrice: 45000, amount: 45000 },
    ],
    subtotal: 70000,
    tax: 7000,
    total: 77000,
    status: 'unpaid',
  },
  {
    id: '9',
    date: '2026-03-18',
    docType: '納品書',
    docNumber: 'DEL-0000000089',
    client: '株式会社シブタニ',
    category: 'shibutani',
    subject: 'レジデンシャル東京 錠前交換',
    items: [
      { description: '錠前交換工事', qty: 1, unit: '式', unitPrice: 85000, amount: 85000 },
      { description: '出張費', qty: 1, unit: '式', unitPrice: 5000, amount: 5000 },
    ],
    subtotal: 90000,
    tax: 9000,
    total: 99000,
    status: 'paid',
  },
  {
    id: '10',
    date: '2026-03-28',
    docType: '請求書',
    docNumber: 'INV-0000000302',
    client: '住友不動産建物サービス',
    category: 'kanri',
    subject: 'シティタワー品川 点検作業',
    items: [
      { description: '電気錠システム点検', qty: 1, unit: '式', unitPrice: 120000, amount: 120000 },
    ],
    subtotal: 120000,
    tax: 12000,
    total: 132000,
    status: 'pending',
  },
];

const initialState = {
  records: SAMPLE_DATA,
  categories: CATEGORIES,
  currentPage: 'dashboard',
  selectedCategory: null,
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, { ...action.payload, id: String(Date.now()) }] };
    case 'DELETE_RECORD':
      return { ...state, records: state.records.filter(r => r.id !== action.payload) };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload, selectedCategory: null };
    case 'SET_CATEGORY':
      return { ...state, currentPage: 'section', selectedCategory: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export { CATEGORIES };
