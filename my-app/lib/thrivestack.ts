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
    const existingScript = document.querySelector(
      'script[src*="ts-script.app.thrivestack.ai"]'
    );

    if (existingScript) {
      resolve(); // already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://ts-script.app.thrivestack.ai/latest/thrivestack.js';
    script.async = true;

    script.onload = () => {
      try {
        if (typeof window.thrivestack !== 'function') {
          return reject(new Error("ThriveStack global constructor not found"));
        }

        // Manually create instance
        const thriveInstance = new window.thrivestack({
          apiKey: '/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A=',
          source: 'product',
          trackClicks: true,
          trackForms: false,
        });

        window.thrivestack = thriveInstance;

        resolve();
      } catch (e) {
        reject(new Error("ThriveStack failed to initialize"));
      }
    };

    script.onerror = () => reject(new Error('Failed to load ThriveStack script'));

    document.head.appendChild(script);
  });
}
