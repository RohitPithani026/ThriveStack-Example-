// lib/thrivestack.ts

export function waitForThriveStack(callback: () => void, delay = 100) {
  if (typeof window === 'undefined') return;

  const poll = () => {
    if (window.thrivestack) {
      callback();
    } else {
      setTimeout(poll, delay);
    }
  };

  poll();
}
