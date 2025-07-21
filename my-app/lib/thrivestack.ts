export function loadThriveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="thrivestack.js"]');
    if (existingScript) {
      resolve();
      return;
    }

    // 🛠️ Inject config BEFORE loading script
    window.__THRIVE_API_KEY__ = '/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A=';
    window.__THRIVE_SOURCE__ = 'product';

    const script = document.createElement('script');
    script.src = '/libs/thrivestack.js'; // served locally
    script.async = true;

    script.onload = () => {
      // Wait for window.ThriveStack to be defined
      const interval = setInterval(() => {
        if (window.ThriveStack) {
          clearInterval(interval);

          // 🧠 Manual init using constructor from global
          const instance = new window.ThriveStack({
            apiKey: window.__THRIVE_API_KEY__,
            source: window.__THRIVE_SOURCE__,
            trackClicks: true,
          });

          window.thrivestack = instance;
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('ThriveStack global constructor not found'));
      }, 3000);
    };

    script.onerror = () => reject(new Error('Failed to load ThriveStack.js from /libs'));

    document.head.appendChild(script);
  });
}
