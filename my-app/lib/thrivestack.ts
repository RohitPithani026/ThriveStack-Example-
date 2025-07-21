// lib/thrivestack.ts
export function waitForThriveStack(callback: () => void, retryDelay = 100) {
  if (typeof window === "undefined") return;

  const wait = () => {
    if (window.thrivestack) {
      callback();
    } else {
      setTimeout(wait, retryDelay);
    }
  };

  wait();
}
