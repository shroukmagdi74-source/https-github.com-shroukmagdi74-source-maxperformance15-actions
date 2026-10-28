import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { trackStudioError } from "../analytics/beacon";

export interface StudioErrorBoundaryProps {
  sectionKey?: string;
  companyId?: string;
  pageKey?: string;
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface StudioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 🛡️ StudioErrorBoundary (PERF-1)
 *
 * Catches section-level and editor render errors gracefully:
 * - Prevents the entire Studio / canvas tree from crashing
 * - Automatically dispatches a privacy-preserving 'studio_error' event via AN-1 beacon layer
 * - Renders a localized recovery fallback UI
 */
export class StudioErrorBoundary extends Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  override state: StudioErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { sectionKey, companyId, pageKey = "home", onError } = this.props;

    // Dispatch error event via AN-1 beacon layer (zero external SDKs / zero PII)
    try {
      trackStudioError(
        pageKey,
        {
          message: error?.message || "Render Error",
          sectionKey,
        },
        { companyId }
      );
    } catch {
      // Suppress beacon dispatch errors silently
    }

    if (typeof onError === "function") {
      onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children, sectionKey } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback(error, this.handleReset);
      }
      if (fallback) {
        return fallback;
      }

      return (
        <div
          data-testid="studio-error-boundary-fallback"
          className="my-2 mx-1 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-start text-rose-900 select-none shadow-xs"
          role="alert"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-[11px] font-bold">
                !
              </span>
              <span className="text-xs font-bold text-rose-900">
                تعذر عرض هذا القسم لتجنب انهيار المحرر
              </span>
            </div>
            {sectionKey && (
              <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-700">
                {sectionKey}
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-rose-700 line-clamp-2">
            {error.message || "حدث خطأ غير متوقع أثناء معالجة عناصر القسم."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default StudioErrorBoundary;
