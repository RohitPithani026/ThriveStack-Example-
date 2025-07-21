// lib/global.d.ts (or somewhere appropriate in your project)
declare global {
  interface Window {
  gtag: (...args: any[]) => void;
  amplitude: any;
  sessionReplay: any;
  thrivestack: any;
  ThriveStack: any;
  __THRIVE_API_KEY__?: string;
  __THRIVE_SOURCE__?: string;
}

}

export {};
