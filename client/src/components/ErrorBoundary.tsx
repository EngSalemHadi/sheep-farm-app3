// مشروع تربية الأغنام — Error Boundary

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: '#0f1a10', direction: 'rtl' }}
        >
          <div
            className="max-w-md w-full rounded-xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-5xl block mb-4">⚠️</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#e8f5e9', fontFamily: 'Cairo, sans-serif' }}>
              حدث خطأ غير متوقع
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(232,245,233,0.6)' }}>
              {this.state.error?.message || 'خطأ في التطبيق'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg text-white font-bold transition-colors"
              style={{ background: '#166534', fontFamily: 'Tajawal, sans-serif' }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
