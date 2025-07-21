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

export function loadThriveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject("Window not available");

    // Already loaded?
    if (window.thrivestack) return resolve();

    const script = document.createElement('script');
    script.src = 'https://ts-script.app.thrivestack.ai/latest/thrivestack.js';
    script.async = true;
    script.setAttribute("data-api-key", "/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A=");
    script.setAttribute("data-source", "product");

    script.onload = () => {
      if (window.thrivestack) {
        resolve();
      } else {
        reject("ThriveStack failed to initialize");
      }
    };

    script.onerror = () => reject("Failed to load ThriveStack script");
    document.head.appendChild(script);
  });
}
