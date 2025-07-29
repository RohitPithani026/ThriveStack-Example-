import { useEffect, useRef } from 'react';
import { ThriveStack } from 'thrivestack-analytics/browser';

export interface ThriveStackEvent {
    event_name: string;
    user_id: string;
    timestamp: string;
    properties: Record<string, any>;
    context: {
        group_id?: string;
        device_id?: string | null;
        session_id?: string;
        source?: string;
    };
}

// Initialize the script
let analytics: ThriveStack | null = null;

export function getAnalytics() {
  if (typeof window === "undefined") return null;
  if (!analytics) {
    analytics = new ThriveStack({
      apiKey: "/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A=",
      source: "marketing,product",
      trackClicks: true,
      trackForms: true,
    });
    analytics.init().catch(console.error);
  }
  return analytics;
}

export function thriveStackTrack(events: ThriveStackEvent[]) {
  const analytics = getAnalytics();
  if (analytics) {
    analytics.track(events);
  }
}

// Wrapper utility functions
export const thriveStackSetUser = async (
    userId: string,
    email: string,
    properties: Record<string, any> = {}
): Promise<any> => {
    const analytics = getAnalytics();
    if (!analytics?.setUser) throw new Error('ThriveStack not initialized');
    return analytics.setUser(userId, email, properties);
};

export const thriveStackIdentify = async (data: any): Promise<any> => {
    const analytics = getAnalytics();
    if (!analytics?.identify) throw new Error('ThriveStack not initialized');
    return analytics.identify(data);
};

export const thriveStackGroup = async (data: any): Promise<any> => {
    const analytics = getAnalytics();
    if (!analytics?.group) throw new Error('ThriveStack not initialized');
    return analytics.group(data);
};

export const thriveStackSetGroup = async (
    groupId: string,
    groupDomain: string,
    groupName: string,
    properties: Record<string, any> = {}
): Promise<any> => {
    const analytics = getAnalytics();
    if (!analytics?.setGroup) throw new Error('ThriveStack setGroup() not available');
    return analytics.setGroup(groupId, groupDomain, groupName, properties);
};

export const trackFeatureUsed = (
    userId: string,
    featureName: string,
    userRole: string,
    groupId?: string
): void => {
    const event: ThriveStackEvent = {
        event_name: "feature_used",
        user_id: userId,
        timestamp: new Date().toISOString(),
        properties: {
            feature_name: featureName,
            user_role: userRole,
        },
        context: {
            group_id: groupId,
        },
    };

    thriveStackTrack([event]);
};

export const trackInviteSent = (
    senderUserId: string,
    invitee: {
        email: string;
        role: string;
        roleId: string;
        teamId: string;
        teamName: string;
        userId: string;
    },
    groupId: string
) => {
    thriveStackTrack([
        {
            event_name: "invite_sent",
            user_id: senderUserId,
            timestamp: new Date().toISOString(),
            properties: {
                feature_name: "report",
                invitee_email: invitee.email,
                invitee_role: invitee.role,
                invitee_role_id: invitee.roleId,
                invitee_team_id: invitee.teamId,
                invitee_team: invitee.teamName,
                invitee_user_id: invitee.userId,
                sub_feature_name: "export_report",
                source_url: typeof window !== 'undefined' ? window.location.href : '',
            },
            context: {
                group_id: groupId,
            },
        },
    ]);
};

// Additional utility functions for common tracking patterns
export const trackPageView = (userId: string, pageName: string, groupId?: string) => {
    thriveStackTrack([
        {
            event_name: "page_view",
            user_id: userId,
            timestamp: new Date().toISOString(),
            properties: {
                page_name: pageName,
                page_url: typeof window !== 'undefined' ? window.location.href : '',
            },
            context: {
                group_id: groupId,
            },
        },
    ]);
};

export const trackButtonClick = (
    userId: string, 
    buttonName: string, 
    pageName: string, 
    groupId?: string
) => {
    thriveStackTrack([
        {
            event_name: "button_click",
            user_id: userId,
            timestamp: new Date().toISOString(),
            properties: {
                button_name: buttonName,
                page_name: pageName,
                page_url: typeof window !== 'undefined' ? window.location.href : '',
            },
            context: {
                group_id: groupId,
            },
        },
    ]);
};

export const trackFormSubmission = (
    userId: string,
    formName: string,
    formData: Record<string, any> = {},
    groupId?: string
) => {
    thriveStackTrack([
        {
            event_name: "form_submission",
            user_id: userId,
            timestamp: new Date().toISOString(),
            properties: {
                form_name: formName,
                form_data: formData,
                page_url: typeof window !== 'undefined' ? window.location.href : '',
            },
            context: {
                group_id: groupId,
            },
        },
    ]);
};

// React Hook for analytics
export const useAnalytics = () => {
  const analyticsRef = useRef<ThriveStack | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !analyticsRef.current) {
      analyticsRef.current = new ThriveStack({
        apiKey: process.env.NEXT_PUBLIC_THRIVESTACK_API_KEY!,
        source: process.env.NEXT_PUBLIC_THRIVESTACK_SOURCE || 'my-app',
        trackClicks: true,
        trackForms: true
      });

      analyticsRef.current.init().catch(console.error);
    }
  }, []);

  return analyticsRef.current;
};