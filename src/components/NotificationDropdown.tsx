import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, ClipboardList, MessageSquare, Sparkles, Trophy, Upload, X } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDashboardState, type DashboardNotificationKind } from "@/contexts/DashboardStateContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";

function getNotificationIcon(kind: DashboardNotificationKind) {
  switch (kind) {
    case "review":
      return ClipboardList;
    case "message":
      return MessageSquare;
    case "upload":
      return Upload;
    case "leaderboard":
      return Trophy;
    default:
      return Sparkles;
  }
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    unreadCount,
    routeLoading,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    getRelativeNotificationTime,
  } = useDashboardState();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, () => setOpen(false), open);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleNavigate = (notificationId: string, href?: string) => {
    markNotificationRead(notificationId);
    setOpen(false);
    if (href) navigate(href);
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        className={`relative rounded-full text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 ${open ? "bg-slate-100 dark:bg-slate-800" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[360px] rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-center justify-between px-2 pt-1">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Notifications</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Live activity from reviews, uploads, and conversations.</p>
              </div>
              {notifications.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsRead}
                  className="cursor-pointer rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {routeLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`notification-skeleton-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))
              ) : notifications.length > 0 ? (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.kind);

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-4 shadow-sm transition ${
                        notification.read
                          ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                          : "border-purple-200 bg-white dark:border-purple-500/40 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleNavigate(notification.id, notification.href)}
                          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {notification.title}
                              </p>
                              {!notification.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {notification.description}
                            </p>
                            <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {getRelativeNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNotification(notification.id)}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No notifications right now.</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">New uploads, messages, and review activity will show up here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
