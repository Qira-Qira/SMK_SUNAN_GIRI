type ToastPayload = { type: 'success' | 'error' | 'info'; message: string };

let handler: ((t: ToastPayload) => void) | null = null;

export function registerToast(fn: (t: ToastPayload) => void) {
  handler = fn;
}

export function unregisterToast() {
  handler = null;
}

export const toast = {
  success: (message: string) => handler && handler({ type: 'success', message }),
  error: (message: string) => handler && handler({ type: 'error', message }),
  info: (message: string) => handler && handler({ type: 'info', message }),
};

export default toast;
