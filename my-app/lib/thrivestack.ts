export function waitForThriveStack(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (typeof window !== 'undefined' && window.thrivestack) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}
