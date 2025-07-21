export {};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    amplitude: any;
    sessionReplay: any;
    thriveStack?: {
      setUser: (
        userId: string,
        emailId: string,
        properties?: Record<string, any>
      ) => Promise<any>;

      setGroup?: (
        userId: string,
        accountId: string,
        accountName: string,
        properties?: Record<string, any>
      ) => Promise<any>;

      group?: (
        userId: string,
        accountId: string,
        accountName: string,
        properties?: Record<string, any>
      ) => Promise<any>;

      identify: (data: any) => Promise<any>;

      init: (
        userId?: string,
        source?: string
      ) => Promise<void>;

      track?: (
        events: {
          event_name: string;
          user_id: string;
          timestamp?: string;
          properties?: Record<string, any>;
          context?: Record<string, any>; // ✅ supports context like group_id
        }[]
      ) => void;

      [key: string]: any;
    };
  }
}
