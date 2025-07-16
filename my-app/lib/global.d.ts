// lib/global.d.ts (or somewhere appropriate in your project)
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export {};
