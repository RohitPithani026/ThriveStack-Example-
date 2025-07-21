// lib/thrivestack.ts

export function loadThriveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="thrivestack.js"]');

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/libs/thrivestack.js'; // served from public/
    script.async = true;

    script.onload = () => {
      try {
        // Wait until global is assigned
        const interval = setInterval(() => {
          if (window.thrivestack) {
            clearInterval(interval);

            // Manual init (no auto-init possible)
            const instance = new window.thrivestack({
              apiKey: '/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A=',
              source: 'product',
              trackClicks: true,
            });

            window.thrivestack = instance;
            resolve();
          }
        }, 50);

        // Timeout fallback
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('ThriveStack global constructor not found'));
        }, 3000);
      } catch (e) {
        reject(new Error('ThriveStack failed to initialize manually'));
      }
    };

    script.onerror = () => reject(new Error('Failed to load ThriveStack.js from /libs'));

    document.head.appendChild(script);
  });
}
