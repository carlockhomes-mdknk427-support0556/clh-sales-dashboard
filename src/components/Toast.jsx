import { useEffect } from 'react';
import { useStore } from '../store';

export default function ToastContainer() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.toasts, dispatch]);

  return (
    <div className="toast-container">
      {state.toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          {t.type === 'success' && '✓ '}
          {t.type === 'error' && '✕ '}
          {t.message}
        </div>
      ))}
    </div>
  );
}
