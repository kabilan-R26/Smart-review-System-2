import { useEffect, useMemo, useRef, useState } from "react";
import { getFaculty, getMessages, getStudents, setMessages, useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { Skeleton } from "@/components/Skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardState } from "@/contexts/DashboardStateContext";
import { MessageCircleMore, Paperclip, Search, Send, Smile, Zap } from "lucide-react";

const FACULTY_ONLINE: Record<string, boolean> = {
  f1: true,
  f2: false,
  f3: true,
};

export default function MessagingPageShell() {
  const { user } = useAuth();
  const { addNotification, refreshDashboardData, routeLoading } = useDashboardState();
  const [, setTick] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const facultyList = useMemo(() => getFaculty(), []);
  const studentList = useMemo(() => getStudents(), []);

  const defaultContactId = useMemo(() => {
    if (!user) return null;
    return user.role === "student" ? facultyList[0]?.id ?? null : studentList[0]?.id ?? null;
  }, [facultyList, studentList, user]);

  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const activeContactId = selectedContact ?? defaultContactId;

  const allMessages = getMessages();
  const myMessages = allMessages.filter(
    (message) => message.senderId === user?.id || message.receiverId === user?.id,
  );
  const allUsers = [...studentList, ...facultyList];

  const contacts =
    user?.role === "faculty"
      ? studentList.filter((student) =>
          search ? student.name.toLowerCase().includes(search.toLowerCase()) : true,
        )
      : facultyList.filter((faculty) =>
          search ? faculty.name.toLowerCase().includes(search.toLowerCase()) : true,
        );

  const selectedMessages =
    activeContactId != null
      ? myMessages
          .filter(
            (message) =>
              (message.senderId === user?.id && message.receiverId === activeContactId) ||
              (message.senderId === activeContactId && message.receiverId === user?.id),
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : [];

  const selectedUser = activeContactId ? allUsers.find((account) => account.id === activeContactId) : undefined;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId, selectedMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeContactId || !user) return;

    const store = getMessages();
    store.push({
      id: `m_${Date.now()}`,
      senderId: user.id,
      receiverId: activeContactId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    });
    setMessages(store);
    refreshDashboardData();
    addNotification({
      title: `Message sent to ${selectedUser?.name ?? "contact"}`,
      description: "Your latest conversation update is now available in the messages thread.",
      href: "/messages",
      kind: "message",
    });
    setNewMessage("");
    setTick((value) => value + 1);
  };

  const heroSlides: HeroSlide[] = [
    {
      title: "Real-time communication",
      subtitle: "Stay connected with your students and peers without leaving the dashboard flow.",
      ctaText: "Start Chatting",
      onCtaClick: () => document.getElementById("messaging-section")?.scrollIntoView({ behavior: "smooth" }),
      icon: <MessageCircleMore className="h-7 w-7" />,
    },
    {
      title: "Faster responses",
      subtitle: "Improve engagement with instant feedback, quick follow-ups, and clearer context.",
      icon: <Zap className="h-7 w-7" />,
    },
  ];

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-12 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mb-6 shrink-0">
        <HeroSlider slides={heroSlides} />
      </div>

      <div id="messaging-section" className="mt-2 flex-1 px-4 sm:px-6 lg:px-8">
        {routeLoading ? (
          <div className="mx-auto flex h-[700px] w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:flex-row">
            <div className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 lg:w-[350px] lg:border-b-0 lg:border-r">
              <Skeleton className="h-12 w-full rounded-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`contact-skeleton-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>

              <div className="flex-1 space-y-4 py-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`message-skeleton-${index}`} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <Skeleton className="h-20 w-full max-w-[380px] rounded-3xl" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-14 flex-1 rounded-full" />
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
        <div className="mx-auto flex h-[700px] w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:flex-row">
          <div className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 lg:w-[350px] lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search contacts..."
                  className="h-12 rounded-full border-slate-200 bg-white pl-11 text-slate-900 placeholder:text-slate-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {user.role === "student" ? "Faculty Connect" : "Student List"}
                </h3>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {contacts.length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              <AnimatePresence>
                {contacts.map((contact) => {
                  const thread = myMessages.filter(
                    (message) =>
                      (message.senderId === contact.id && message.receiverId === user.id) ||
                      (message.senderId === user.id && message.receiverId === contact.id),
                  );
                  const lastMessage = [...thread].sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                  )[0];
                  const unread = myMessages.filter(
                    (message) =>
                      message.senderId === contact.id &&
                      message.receiverId === user.id &&
                      !message.read,
                  ).length;
                  const isFacultyContact = contact.role === "faculty";
                  const online = isFacultyContact ? FACULTY_ONLINE[contact.id] ?? false : undefined;
                  const isActive = activeContactId === contact.id;

                  return (
                    <motion.button
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedContact(contact.id)}
                      className={`w-full cursor-pointer rounded-2xl border p-3 text-left transition-all duration-300 ${
                        isActive
                          ? "scale-[1.02] border-purple-200 bg-purple-50 shadow-md dark:border-purple-600/50 dark:bg-purple-900/40"
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <UserAvatar user={contact} className="h-12 w-12" fallbackClassName="text-xs" />
                          {user.role === "student" && isFacultyContact && (
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0F172A] ${
                                online ? "bg-emerald-500" : "bg-slate-500 dark:bg-slate-400"
                              }`}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm font-bold ${
                                isActive ? "text-purple-700 dark:text-purple-300" : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {contact.name}
                            </p>
                            {unread > 0 && (
                              <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-purple-600 px-2 text-xs font-bold text-white shadow-lg">
                                {unread}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p
                              className={`mt-1 truncate text-xs ${
                                unread
                                  ? "font-semibold text-slate-900 dark:text-white"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {lastMessage.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {contacts.length === 0 && (
                <div className="py-10 text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-300">No contacts found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col bg-white dark:bg-slate-900">
            {activeContactId && selectedUser ? (
              <>
                <div className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 p-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                  <UserAvatar user={selectedUser} className="h-12 w-12" fallbackClassName="text-xs" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{selectedUser.name}</p>
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedUser.department}
                      {user.role === "student" && selectedUser.role === "faculty" && (
                        <>
                          <span>•</span>
                          <span className={FACULTY_ONLINE[selectedUser.id] ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}>
                            {FACULTY_ONLINE[selectedUser.id] ? "Active Now" : "Offline"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950/50">
                  {selectedMessages.map((message, index) => {
                    const isMe = message.senderId === user.id;
                    const previousMessage = selectedMessages[index - 1];
                    const showTime =
                      !previousMessage ||
                      new Date(message.timestamp).getTime() - new Date(previousMessage.timestamp).getTime() > 300000;

                    return (
                      <div key={message.id} className="flex flex-col">
                        {showTime && (
                          <div className="mb-4 mt-2 text-center">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {new Date(message.timestamp).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <UserAvatar
                              user={selectedUser}
                              className="h-9 w-9 shrink-0"
                              fallbackClassName="text-[10px]"
                            />
                          )}
                          <div
                            className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm shadow-sm sm:max-w-[65%] ${
                              isMe
                                ? "rounded-br-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "rounded-bl-sm border border-slate-200 bg-white text-slate-900 shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:shadow-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                            <p
                              className={`mt-1.5 text-right text-[10px] font-medium ${
                                isMe ? "text-white/70" : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {isMe && (
                            <UserAvatar user={user} className="h-9 w-9 shrink-0" fallbackClassName="text-[10px]" />
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-full text-slate-500 hover:text-purple-500 dark:text-slate-400"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder="Type your message..."
                        className="h-14 rounded-full border-slate-200 bg-white pl-6 pr-12 text-lg text-slate-900 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                        onKeyDown={(event) => event.key === "Enter" && handleSend()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full text-slate-500 hover:text-purple-500 dark:text-slate-400"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSend}
                      className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:bg-purple-700 active:scale-95"
                    >
                      <Send className="ml-1 h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
                  <Smile className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Your Messages</h3>
                <p className="max-w-sm text-slate-700 dark:text-slate-300">
                  Select a contact from the sidebar to start a conversation or continue where you left off.
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
