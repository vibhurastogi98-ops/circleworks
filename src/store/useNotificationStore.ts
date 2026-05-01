import { create } from "zustand";

export type NotificationCategory = 
  | "ALL" 
  | "PAYROLL" 
  | "HR" 
  | "APPROVALS" 
  | "ATS" 
  | "ONBOARDING" 
  | "BENEFITS" 
  | "COMPLIANCE" 
  | "SYSTEM" 
  | "INFO";

export type NotificationStatus = "pending" | "approved" | "rejected";

export interface NotificationItem {
  id: string;
  type: NotificationCategory;
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
  link?: string;
  status?: NotificationStatus; // For Approval items
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, "id" | "timestamp" | "isRead">) => void;
  incrementUnreadCount: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  muteType: (type: NotificationCategory) => void;
  deleteNotification: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
}

// Generate realistic mock data using the comprehensive registry
const generateMockNotifications = (): NotificationItem[] => {
  const now = new Date();
  const subHours = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  
  const rawItems = [
    // PAYROLL
    { type: "PAYROLL", title: "Payroll run approved", description: "Finance Manager approved your payroll run → Run it now", h: 0.1, read: false },
    { type: "PAYROLL", title: "Payroll processed", description: "47 employees paid. $284,500 processed. View report.", h: 1.5, read: false },
    { type: "PAYROLL", title: "Payroll error", description: "3 employees had processing errors. Review and re-run.", h: 2.2, read: false },
    { type: "PAYROLL", title: "Employee verified pay", description: "Sarah Chen verified her upcoming paycheck.", h: 4, read: true },
    { type: "PAYROLL", title: "Employee flagged pay", description: "John Doe flagged an issue with his paycheck. Review.", h: 6.5, read: false },
    { type: "PAYROLL", title: "Tax filing completed", description: "941 Q2 filed successfully. Confirmation: #12345.", h: 22, read: true },
    { type: "PAYROLL", title: "Tax payment due", description: "Federal tax payment of $28,450 due in 3 days.", h: 26, read: false },
    { type: "PAYROLL", title: "Direct deposit failed", description: "Direct deposit for 2 employees returned. Action needed.", h: 30, read: false },

    // HR
    { type: "HR", title: "New employee added", description: "Sarah Chen (Engineer) added. Onboarding tasks created.", h: 0.8, read: false },
    { type: "HR", title: "Employee terminated", description: "John Doe terminated. Offboarding checklist started.", h: 5, read: true },
    { type: "HR", title: "I-9 expiring", description: "Maria Lopez's work authorization expires in 14 days.", h: 24, read: false },
    { type: "HR", title: "Work anniversary", description: "Tom Chen's 3-year anniversary is today. Send kudos?", h: 25, read: true },
    { type: "HR", title: "Birthday", description: "Today is Alice Kim's birthday. 🎂", h: 28, read: true },
    { type: "HR", title: "Job change pending approval", description: "Promotion request for Sarah Chen awaits your approval.", h: 48, read: false },

    // APPROVALS
    { type: "APPROVALS", title: "PTO request", description: "Mike Torres requested 3 days off (Jul 4-6). Approve / Deny", h: 0.5, read: false, status: "pending" as NotificationStatus },
    { type: "APPROVALS", title: "Timesheet submitted", description: "5 timesheets await your approval. Review now.", h: 3, read: false, status: "pending" as NotificationStatus },
    { type: "APPROVALS", title: "Expense report", description: "Alice Kim submitted $450 expense report. Review.", h: 8, read: false, status: "pending" as NotificationStatus },
    { type: "APPROVALS", title: "Job offer to approve", description: "Offer letter for Candidate #234 awaits your approval.", h: 32, read: true, status: "approved" as NotificationStatus },
    { type: "APPROVALS", title: "Payroll approval needed", description: "April 15 payroll run needs your approval. Review.", h: 54, read: false, status: "pending" as NotificationStatus },

    // ATS
    { type: "ATS", title: "New application", description: "15 new applications for Senior Engineer role.", h: 2.5, read: false },
    { type: "ATS", title: "Offer accepted", description: "David Lee accepted offer for Sales Manager. Start onboarding?", h: 7, read: true },
    { type: "ATS", title: "Offer declined", description: "Candidate declined offer for Engineer role.", h: 46, read: true },
    { type: "ATS", title: "Interview scheduled", description: "Interview with Sarah M. scheduled for tomorrow 2pm.", h: 72, read: true },

    // ONBOARDING
    { type: "ONBOARDING", title: "Pre-boarding incomplete", description: "Alex Chen has 3 tasks remaining. 2 days until start date.", h: 10, read: false },
    { type: "ONBOARDING", title: "Background check complete", description: "Background check for Tom Lee: Clear.", h: 23, read: true },
    { type: "ONBOARDING", title: "Background check flagged", description: "Background check for Maria J. returned issues. Review.", h: 27, read: false },
    { type: "ONBOARDING", title: "Onboarding overdue", description: "3 tasks overdue for Alex Chen's onboarding.", h: 60, read: false },

    // BENEFITS
    { type: "BENEFITS", title: "Open enrollment starting", description: "Benefits open enrollment starts in 3 days. Set it up.", h: 4.5, read: false },
    { type: "BENEFITS", title: "Enrollment deadline", description: "Open enrollment closes in 48 hours. 8 employees haven't enrolled.", h: 50, read: false },
    { type: "BENEFITS", title: "COBRA notice due", description: "COBRA notice for John Doe must be sent within 14 days.", h: 74, read: false },
    { type: "BENEFITS", title: "QLE submitted", description: "Sarah Chen submitted a qualifying life event. Review benefits.", h: 96, read: true },

    // COMPLIANCE
    { type: "COMPLIANCE", title: "ACA filing due", description: "1094-C + 1095-C due March 31. 90% complete.", h: 12, read: false },
    { type: "COMPLIANCE", title: "New hire report due", description: "New hire report for 3 employees due within 7 days.", h: 36, read: false },
    { type: "COMPLIANCE", title: "State law change", description: "California minimum wage increases Jan 1. 8 employees affected.", h: 80, read: true },
    { type: "COMPLIANCE", title: "Labor poster update", description: "Updated federal labor posters available. Download now.", h: 120, read: true },
    { type: "COMPLIANCE", title: "Handbook signature missing", description: "12 employees haven't signed the updated handbook.", h: 140, read: false },

    // SYSTEM
    { type: "SYSTEM", title: "Integration error", description: "QuickBooks sync failed. Check connection settings.", h: 1.2, read: false },
    { type: "SYSTEM", title: "Bank account updated", description: "Direct deposit banking info was updated for John Doe. Review.", h: 18, read: true },
    { type: "SYSTEM", title: "Large data export", description: "Your employee data export is ready to download.", h: 200, read: true },
    { type: "SYSTEM", title: "Plan upgraded", description: "Your account was upgraded to Pro. New features unlocked!", h: 300, read: true },
  ];

  const items: NotificationItem[] = rawItems.map((item, index) => ({
    id: `notif-${index + 1}`,
    type: item.type as NotificationCategory,
    title: item.title,
    description: item.description,
    timestamp: subHours(item.h),
    isRead: item.read,
    status: item.status,
    link: "#"
  }));

  // Sort them so recent comes first, though h logic already does that.
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: generateMockNotifications(),
  unreadCount: generateMockNotifications().filter(n => !n.isRead).length,

  addNotification: (notification) => set((state) => {
    const newNotif: NotificationItem = {
      ...notification,
      id: `live-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotif, ...state.notifications];
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  incrementUnreadCount: () => set((state) => ({
    unreadCount: state.unreadCount + 1,
  })),

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  muteType: (type) => set((state) => {
    const updated = state.notifications.filter(n => n.type !== type);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  deleteNotification: (id) => set((state) => {
    const updated = state.notifications.filter(n => n.id !== id);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  approveRequest: (id) => set((state) => {
    const updated = state.notifications.map(n => 
      (n.id === id && n.type === "APPROVALS") ? { ...n, status: "approved" as NotificationStatus, isRead: true } : n
    );
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  rejectRequest: (id) => set((state) => {
    const updated = state.notifications.map(n => 
      (n.id === id && n.type === "APPROVALS") ? { ...n, status: "rejected" as NotificationStatus, isRead: true } : n
    );
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),
}));
