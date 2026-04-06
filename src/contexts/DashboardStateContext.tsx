import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";
import {
  getFiles,
  getMessages,
  getReviews,
  getStudents,
  getSubjects,
  type User,
  useAuth,
} from "@/contexts/AuthContext";

export type DashboardNotificationKind = "message" | "review" | "upload" | "leaderboard" | "activity";

export interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  href?: string;
  kind: DashboardNotificationKind;
  createdAt: string;
  read: boolean;
}

interface DashboardStateContextValue {
  notifications: DashboardNotification[];
  unreadCount: number;
  routeLoading: boolean;
  loadingStates: Record<string, boolean>;
  currentUser: User | null;
  addNotification: (notification: Omit<DashboardNotification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  setLoadingState: (key: string, value: boolean) => void;
  refreshDashboardData: () => void;
  getRelativeNotificationTime: (createdAt: string) => string;
}

const DashboardStateContext = createContext<DashboardStateContextValue | null>(null);

function getNowIso() {
  return new Date().toISOString();
}

function getSafeDate(createdAt: string) {
  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function buildSystemNotifications(user: User | null): DashboardNotification[] {
  if (!user) return [];

  const now = getNowIso();
  const reviews = getReviews();
  const messages = getMessages();
  const files = getFiles();
  const students = getStudents();

  if (user.role === "faculty") {
    const facultySubjects = getSubjects().filter((subject) => subject.facultyId === user.id);
    const facultySubjectIds = new Set(facultySubjects.map((subject) => subject.id));
    const pendingReviews = reviews.filter((review) => review.facultyId === user.id && review.status !== "completed");
    const unreadMessages = messages.filter((message) => message.receiverId === user.id && !message.read);
    const recentUpload = [...files]
      .filter((file) => file.subjectId && facultySubjectIds.has(file.subjectId))
      .sort((left, right) => getSafeDate(right.uploadDate).getTime() - getSafeDate(left.uploadDate).getTime())[0];
    const completedReviews = reviews.filter(
      (review) => review.facultyId === user.id && review.status === "completed" && typeof review.marks === "number",
    );

    const leaderboardTopStudent = completedReviews.length
      ? students
          .map((student) => {
            const studentReviews = completedReviews.filter((review) => review.studentId === student.id);
            const average =
              studentReviews.reduce((sum, review) => sum + (review.marks ?? 0), 0) / Math.max(studentReviews.length, 1);

            return {
              student,
              reviewCount: studentReviews.length,
              average: Math.round(average || 0),
            };
          })
          .filter((entry) => entry.reviewCount > 0)
          .sort((left, right) => right.average - left.average)[0]
      : undefined;

    return [
      {
        id: `system-review-${user.id}`,
        title: pendingReviews.length > 0 ? `${pendingReviews.length} reviews pending` : "Review queue clear",
        description:
          pendingReviews.length > 0
            ? "Open the review center to close the remaining evaluations."
            : "All currently assigned reviews have been completed.",
        href: "/reviews",
        kind: "review",
        createdAt: pendingReviews[0]?.date ?? now,
        read: false,
      },
      {
        id: `system-message-${user.id}`,
        title: unreadMessages.length > 0 ? `${unreadMessages.length} unread messages` : "Messages are up to date",
        description:
          unreadMessages.length > 0
            ? "Jump back into the latest conversations with students."
            : "No unread messages are waiting for a reply.",
        href: "/messages",
        kind: "message",
        createdAt: unreadMessages[0]?.timestamp ?? now,
        read: false,
      },
      {
        id: `system-upload-${user.id}`,
        title: recentUpload ? "New submission uploaded" : "No recent uploads",
        description: recentUpload
          ? `${recentUpload.fileName} was added and is ready for review.`
          : "Uploaded work will appear here as students submit files.",
        href: recentUpload ? "/reviews" : "/subjects",
        kind: "upload",
        createdAt: recentUpload?.uploadDate ?? now,
        read: false,
      },
      {
        id: `system-leaderboard-${user.id}`,
        title: leaderboardTopStudent ? `${leaderboardTopStudent.student.name} leads the leaderboard` : "Leaderboard ready",
        description: leaderboardTopStudent
          ? `Current top average: ${leaderboardTopStudent.average}/100 across reviewed subjects.`
          : "Visit the leaderboard to compare student performance once marks are available.",
        href: "/leaderboard",
        kind: "leaderboard",
        createdAt: now,
        read: false,
      },
    ];
  }

  const openTasks = reviews.filter((review) => review.studentId === user.id && review.status !== "completed");
  const unreadMessages = messages.filter((message) => message.receiverId === user.id && !message.read);
  const latestFeedback = [...reviews]
    .filter((review) => review.studentId === user.id && typeof review.feedback === "string" && review.feedback.trim())
    .sort((left, right) => getSafeDate(right.date).getTime() - getSafeDate(left.date).getTime())[0];

  return [
    {
      id: `system-student-review-${user.id}`,
      title: openTasks.length > 0 ? `${openTasks.length} subject tasks open` : "All subject tasks completed",
      description:
        openTasks.length > 0
          ? "Open your subjects page to continue pending review work."
          : "Your current subject queue is fully completed.",
      href: "/subjects",
      kind: "review",
      createdAt: openTasks[0]?.date ?? now,
      read: false,
    },
    {
      id: `system-student-message-${user.id}`,
      title: unreadMessages.length > 0 ? `${unreadMessages.length} unread messages` : "Messages are up to date",
      description:
        unreadMessages.length > 0
          ? "Continue your conversations with faculty from the messages page."
          : "No unread faculty messages at the moment.",
      href: "/messages",
      kind: "message",
      createdAt: unreadMessages[0]?.timestamp ?? now,
      read: false,
    },
    {
      id: `system-student-feedback-${user.id}`,
      title: latestFeedback ? "New faculty feedback available" : "No new feedback yet",
      description: latestFeedback
        ? latestFeedback.feedback ?? "Your latest faculty review is now available."
        : "Completed faculty comments will appear here once reviews are submitted.",
      href: "/subjects",
      kind: "activity",
      createdAt: latestFeedback?.date ?? now,
      read: false,
    },
  ];
}

export function DashboardStateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [manualNotifications, setManualNotifications] = useState<DashboardNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [removedNotificationIds, setRemovedNotificationIds] = useState<string[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    setRouteLoading(true);
    const timer = window.setTimeout(() => setRouteLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    setManualNotifications([]);
    setReadNotificationIds([]);
    setRemovedNotificationIds([]);
    setDataVersion((current) => current + 1);
  }, [user?.id]);

  const refreshDashboardData = useCallback(() => {
    setDataVersion((current) => current + 1);
  }, []);

  const systemNotifications = useMemo(() => {
    void dataVersion;
    return buildSystemNotifications(user);
  }, [user, dataVersion]);

  const addNotification = useCallback(
    (notification: Omit<DashboardNotification, "id" | "createdAt" | "read">) => {
      const nextNotification: DashboardNotification = {
        ...notification,
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: getNowIso(),
        read: false,
      };
      setManualNotifications((current) => [nextNotification, ...current].slice(0, 10));
      setRemovedNotificationIds((current) => current.filter((id) => id !== nextNotification.id));
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const ids = [...manualNotifications, ...systemNotifications].map((notification) => notification.id);
    setReadNotificationIds(ids);
  }, [manualNotifications, systemNotifications]);

  const removeNotification = useCallback((id: string) => {
    setRemovedNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const setLoadingState = useCallback((key: string, value: boolean) => {
    setLoadingStates((current) => ({ ...current, [key]: value }));
  }, []);

  const notifications = useMemo(() => {
    const merged = [...manualNotifications, ...systemNotifications]
      .filter((notification, index, array) => array.findIndex((item) => item.id === notification.id) === index)
      .filter((notification) => !removedNotificationIds.includes(notification.id))
      .map((notification) => ({
        ...notification,
        read: readNotificationIds.includes(notification.id),
      }))
      .sort((left, right) => getSafeDate(right.createdAt).getTime() - getSafeDate(left.createdAt).getTime());

    return merged;
  }, [manualNotifications, readNotificationIds, removedNotificationIds, systemNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const getRelativeNotificationTime = useCallback((createdAt: string) => {
    return formatDistanceToNow(getSafeDate(createdAt), { addSuffix: true });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      routeLoading,
      loadingStates,
      currentUser: user,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      removeNotification,
      setLoadingState,
      refreshDashboardData,
      getRelativeNotificationTime,
    }),
    [
      notifications,
      unreadCount,
      routeLoading,
      loadingStates,
      user,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      removeNotification,
      setLoadingState,
      refreshDashboardData,
      getRelativeNotificationTime,
    ],
  );

  return <DashboardStateContext.Provider value={value}>{children}</DashboardStateContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardState() {
  const context = useContext(DashboardStateContext);
  if (!context) throw new Error("useDashboardState must be used within DashboardStateProvider");
  return context;
}
