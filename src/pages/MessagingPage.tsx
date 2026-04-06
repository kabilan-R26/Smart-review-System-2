import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth, getMessages, setMessages, getStudents, getFaculty } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Paperclip, Search, Send, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

const FACULTY_ONLINE: Record<string, boolean> = {
  f1: true,
  f2: false,
  f3: true,
};

export default function MessagingPage() {
  const { user } = useAuth();
  const [, setTick] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const facultyList = useMemo(() => getFaculty(), []);
  const studentList = useMemo(() => getStudents(), []);

  const defaultContactId = useMemo(() => {
    if (!user) return null;
    return user.role === "student" ? facultyList[0]?.id ?? null : studentList[0]?.id ?? null;
  }, [user, facultyList, studentList]);

  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const activeContactId = selectedContact ?? defaultContactId;

  const allMessages = getMessages();
  const myMessages = allMessages.filter(m => m.senderId === user?.id || m.receiverId === user?.id);
  const allUsers = [...studentList, ...facultyList];

  const contacts =
    user?.role === "faculty"
      ? studentList.filter(s => (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true))
      : facultyList.filter(f => (search ? f.name.toLowerCase().includes(search.toLowerCase()) : true));

  const selectedMessages =
    activeContactId != null
      ? myMessages
          .filter(
            m =>
              (m.senderId === user?.id && m.receiverId === activeContactId) ||
              (m.senderId === activeContactId && m.receiverId === user?.id)
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : [];

  const selectedUser = activeContactId ? allUsers.find(u => u.id === activeContactId) : undefined;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages.length, activeContactId]);

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
    setNewMessage("");
    setTick(t => t + 1);
  };

  const heroSlides: HeroSlide[] = [
    {
      title: "Real-time Communication 💬",
      subtitle: "Stay connected with your students and peers",
      ctaText: "Start Chatting",
      onCtaClick: () => document.getElementById("messaging-section")?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      title: "Faster Responses",
      subtitle: "Improve engagement with instant feedback",
    }
  ];

  if (!user) return null;

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#020617] min-h-screen text-[#0F172A] dark:text-[#F8FAFC] pb-12 flex flex-col">
      <div className="mb-6 shrink-0">
        <HeroSlider slides={heroSlides} />
      </div>

      <div id="messaging-section" className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[700px]">
          
          {/* Contacts Sidebar */}
          <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <div className="p-5 border-b border-gray-200 dark:border-white/10">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="pl-11 rounded-full h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-white placeholder:text-gray-400 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm tracking-widest text-gray-500 uppercase">
                  {user.role === "student" ? "Faculty Connect" : "Student List"}
                </h3>
                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-full">
                  {contacts.length}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {contacts.map(contact => {
                  const thread = myMessages.filter(
                    m =>
                      (m.senderId === contact.id && m.receiverId === user.id) ||
                      (m.senderId === user.id && m.receiverId === contact.id)
                  );
                  const lastMsg = thread.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                  const unread = myMessages.filter(m => m.senderId === contact.id && m.receiverId === user.id && !m.read).length;
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
                      className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-300 border ${
                        isActive
                          ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-600/50 shadow-md transform scale-[1.02]"
                          : "border-transparent hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <UserAvatar user={contact} className="h-12 w-12" fallbackClassName="text-xs" />
                        {user.role === "student" && isFacultyContact && (
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#0F172A] ${
                              online ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-bold truncate ${isActive ? "text-purple-700 dark:text-purple-300" : "text-gray-900 dark:text-white"}`}>
                            {contact.name}
                          </p>
                          {unread > 0 && (
                            <span className="shrink-0 h-5 px-2 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                              {unread}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={`text-xs truncate mt-1 ${unread ? "text-[#0F172A] dark:text-white font-semibold" : "text-gray-500 dark:text-gray-400"}`}>
                            {lastMsg.message}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              {contacts.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium">No contacts found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0F172A]">
            {activeContactId && selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center gap-4 shrink-0">
                  <UserAvatar user={selectedUser} className="h-12 w-12" fallbackClassName="text-xs" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-[#0F172A] dark:text-white truncate">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      {selectedUser.department}
                      {user.role === "student" && selectedUser.role === "faculty" && (
                        <>
                          <span>•</span>
                          <span className={FACULTY_ONLINE[selectedUser.id] ? "text-emerald-500" : "text-gray-400"}>
                            {FACULTY_ONLINE[selectedUser.id] ? "Active Now" : "Offline"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-black/10">
                  {selectedMessages.map((msg, i) => {
                    const isMe = msg.senderId === user.id;
                    const prevMsg = selectedMessages[i - 1];
                    const showTime = !prevMsg || (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 300000);
                    
                    return (
                      <div key={msg.id} className="flex flex-col">
                         {showTime && (
                           <div className="text-center mb-4 mt-2">
                             <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white dark:bg-[#0F172A] px-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                               {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
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
                            className={`max-w-[85%] sm:max-w-[65%] rounded-3xl px-5 py-3 text-sm shadow-sm ${
                              isMe
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm"
                                : "bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 text-[#0F172A] dark:text-[#F8FAFC] rounded-bl-sm shadow-gray-200/50 dark:shadow-none"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <p className={`text-[10px] mt-1.5 text-right font-medium ${isMe ? "text-white/70" : "text-gray-400"}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {isMe && (
                            <UserAvatar
                              user={user}
                              className="h-9 w-9 shrink-0"
                              fallbackClassName="text-[10px]"
                            />
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F172A] shrink-0">
                  <div className="flex gap-3 items-center">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-500 rounded-full h-12 w-12 shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="rounded-full h-14 pl-6 pr-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-lg text-[#0F172A] dark:text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                      />
                      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 rounded-full h-10 w-10">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSend}
                      className="rounded-full h-14 w-14 shrink-0 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    >
                      <Send className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6">
                  <Smile className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-sm">Select a contact from the sidebar to start a conversation or continue where you left off.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
