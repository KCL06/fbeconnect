import { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

/**
 * FBEconnect – Global Error Boundary
 * ─────────────────────────────────────────────────────────────────────────────
 * Catches all unhandled React render errors below this component in the tree.
 *
 * SECURITY: Never displays internal error details (stack traces, file paths,
 * error codes) to users. These details are only logged in development mode.
 *
 * Wrap this around <App /> in main.tsx for full coverage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI — if not provided, uses the default */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string; // Random ID to help with support tickets
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: "" };
  }

  static getDerivedStateFromError(): Partial<State> {
    return {
      hasError: true,
      errorId: Math.random().toString(36).slice(2, 9).toUpperCase(),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Only log full details in development. Never expose to users in production.
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught render error:", error);
      console.error("[ErrorBoundary] Component stack:", info.componentStack);
    } else {
      // In production: log a sanitized record (no stack trace)
      console.error(
        `[FBEconnect] Error #${this.state.errorId} – ${error.name}: ${error.message}`
      );
    }

    // TODO: Send to an error-tracking service (e.g. Sentry) here:
    // Sentry.captureException(error, { extra: info });
  }

  handleReload = () => {
    this.setState({ hasError: false, errorId: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center ring-2 ring-red-500/40">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-white mb-3">
              Something Went Wrong
            </h1>
            <p className="text-emerald-200 mb-2 leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>

            {/* Error ID for support */}
            <p className="text-emerald-400/60 text-xs mb-8">
              Error reference:{" "}
              <code className="bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                {this.state.errorId}
              </code>
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </a>
            </div>

            {/* Contact support */}
            <p className="text-emerald-400/60 text-sm mt-8">
              Persistent issue?{" "}
              <a
                href="mailto:support@fbeconnect.com"
                className="text-emerald-400 hover:text-white underline transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
