import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Send, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { AppSidebar } from "@/components/app-sidebar";
import { MessagesService } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import type { Message, Thread } from "@/types";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — CodeWithRP" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activePeer, setActivePeer] = useState<{ id: string; name: string } | null>(null);
  const [chat, setChat] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll intervals
  useEffect(() => {
    if (isAdmin) {
      const fetchThreads = () => MessagesService.getThreads().then(setThreads).catch(console.error);
      fetchThreads();
      const int = setInterval(fetchThreads, 5000);
      return () => clearInterval(int);
    } else {
      // Student: find admin peer
      MessagesService.getAdminPeer()
        .then((res) => setActivePeer({ id: res.adminId, name: "Admin Inbox" }))
        .catch(() => toast.error("Could not locate admin inbox"));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!activePeer) return;
    const fetchChat = () => MessagesService.getChat(activePeer.id).then(setChat).catch(console.error);
    fetchChat();
    const int = setInterval(fetchChat, 3000);
    return () => clearInterval(int);
  }, [activePeer]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activePeer) return;
    setSending(true);
    try {
      const newMsg = await MessagesService.send(activePeer.id, content);
      setChat(prev => [...prev, newMsg]);
      setContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex h-screen overflow-hidden">
      <AppSidebar variant={isAdmin ? "admin" : "student"} />
      
      <main className="flex-1 flex min-w-0">
        {/* Admin Threads Sidebar */}
        {isAdmin && (
          <div className="w-80 border-r border-border bg-card/40 flex flex-col">
            <div className="p-4 border-b border-border font-semibold">Conversations</div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {threads.map(t => (
                <button
                  key={t.user_id}
                  onClick={() => setActivePeer({ id: t.user_id, name: t.user_name })}
                  className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-accent/40 ${activePeer?.id === t.user_id ? "bg-accent/60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{t.user_name}</span>
                    {Number(t.unread_count) > 0 && (
                      <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs grid place-items-center">
                        {t.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {t.last_message || "No messages yet"}
                  </div>
                </button>
              ))}
              {threads.length === 0 && <div className="p-4 text-sm text-muted-foreground">No students found.</div>}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative">
          {activePeer ? (
            <>
              <header className="h-16 border-b border-border bg-card/60 backdrop-blur flex items-center px-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent grid place-items-center"><UserIcon className="h-5 w-5" /></div>
                  <span className="font-semibold">{activePeer.name}</span>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin" ref={scrollRef}>
                {chat.map(m => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent text-foreground rounded-bl-sm"}`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/40 flex gap-2 items-center">
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-12 rounded-full border border-border bg-background px-5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send className="h-5 w-5 ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
