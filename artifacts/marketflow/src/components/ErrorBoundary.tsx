import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center" dir="rtl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-1 max-w-md">
          {this.state.error?.message || 'تعذّر تحميل هذا القسم، يرجى المحاولة مرة أخرى.'}
        </p>
        {this.state.errorId && (
          <p className="text-xs text-slate-400 mb-6">
            رقم الخطأ: {this.state.errorId}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'}>
            <Home className="w-4 h-4 ml-2" />
            الرئيسية
          </Button>
        </div>
      </div>
    );
  }
}

export class GlobalErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            انقطع الاتصال بالتطبيق
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            حدث خطأ غير متوقع أدى إلى توقف التطبيق. يرجى تحديث الصفحة.
          </p>
          {this.state.errorId && (
            <p className="text-xs text-slate-400 mb-6">
              رقم الخطأ المرجعي: {this.state.errorId}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث الصفحة
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = '/'; }} className="w-full">
              <Home className="w-4 h-4 ml-2" />
              الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
