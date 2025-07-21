export {};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    amplitude: any;
    sessionReplay: any;
    thriveStack?: {
      setUser: (userId: string, emailId: string, properties?: Record<string, any>) => Promise<any>;
      init: (userId?: string, source?: string) => Promise<void>;
      identify: (data: any) => Promise<any>;
      group: (data: any) => Promise<any>;
      [key: string]: any;
    };
  }
}
