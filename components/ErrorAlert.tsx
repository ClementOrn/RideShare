'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ErrorAlertProps {
  error: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  const isOpen = !!error;

  return (
    <AlertDialog.Root open={isOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-panel max-w-md w-full p-6 animate-fade-in">
          <AlertDialog.Title className="h3 mb-4 text-error">
            Error Occurred
          </AlertDialog.Title>

          <AlertDialog.Description className="body-text mb-6">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </AlertDialog.Description>

          <div className="flex gap-3 justify-end">
            {onDismiss && (
              <AlertDialog.Cancel asChild>
                <button onClick={onDismiss} className="btn btn-ghost">
                  Dismiss
                </button>
              </AlertDialog.Cancel>
            )}

            {onRetry && (
              <AlertDialog.Action asChild>
                <button onClick={onRetry} className="btn btn-primary">
                  Retry
                </button>
              </AlertDialog.Action>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function ErrorBanner({ error, onRetry }: { error: Error | null; onRetry?: () => void }) {
  if (!error) return null;

  return (
    <div className="glass-card border-error bg-error/10 animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h4 className="font-semibold text-error mb-1">Error</h4>
          <p className="text-small text-muted">{error.message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-sm btn-ghost">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
