import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X, Send, Loader2, Trash2, Bot, User, Zap, Lock,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface CoachingChatProps {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
}

interface UsageData {
  used: number;
  limit: number | null;
  unlimited: boolean;
  allowed: boolean;
}

const STARTERS = [
  "How do I apply this lesson today?",
  "What's the key shift in thinking here?",
  "I'm struggling with this concept — can you help?",
  "Give me a specific action I can take right now.",
];

export default function CoachingChat({ lessonId, lessonTitle, lessonContent }: CoachingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  const { data: usage, refetch: refetchUsage } = useQuery<UsageData>({
    queryKey: ["/api/ai/usage"],
    queryFn: async () => {
      const res = await fetch("/api/ai/usage", { credentials: "include" });
      if (!res.ok) return { used: 0, limit: null, unlimited: true, allowed: true };
      return res.json();
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Start / fetch conversation when panel opens
  useEffect(() => {
    if (!isOpen || initialized) return;

    async function init() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch("/api/coaching/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lessonId, lessonTitle, lessonContent }),
        });
        if (!res.ok) throw new Error("Failed to start coaching session");
        const data = await res.json();
        setConversationId(data.conversation.id);
        setMessages(data.messages);
        setInitialized(true);
      } catch (err: any) {
        setError(err.message || "Could not connect to your coach");
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [isOpen, initialized, lessonId, lessonTitle, lessonContent]);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming || !conversationId) return;
    if (usage && !usage.unlimited && usage.used >= (usage.limit ?? 0)) {
      setLimitHit(true);
      return;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setError("");
    setLimitHit(false);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/coaching/${conversationId}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userMessage: text.trim() }),
        signal: abortRef.current.signal,
      });

      if (res.status === 429) {
        setLimitHit(true);
        setIsStreaming(false);
        setMessages((prev) => prev.filter((m) => m.role === "user" || m.content !== ""));
        refetchUsage();
        return;
      }
      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          try {
            const evt = JSON.parse(payload);
            if (evt.chunk) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + evt.chunk }
                    : m,
                ),
              );
              scrollToBottom();
            }
            if (evt.error) {
              setError(evt.error);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Something went wrong. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
      refetchUsage();
    }
  }

  async function clearChat() {
    if (!conversationId || isStreaming) return;
    try {
      await fetch(`/api/coaching/${conversationId}/clear`, {
        method: "DELETE",
        credentials: "include",
      });
      setMessages([]);
    } catch {
      setError("Could not clear the conversation");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function renderMessage(msg: Message) {
    const isUser = msg.role === "user";
    return (
      <div
        key={msg.id}
        className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-gradient-to-br from-brand-gold to-orange-600"
            : "bg-gradient-to-br from-brand-pink to-violet-600"
        }`}>
          {isUser
            ? <User className="h-3.5 w-3.5 text-white" />
            : <Bot className="h-3.5 w-3.5 text-white" />
          }
        </div>

        {/* Bubble */}
        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-brand-gold to-orange-600 text-white rounded-tr-sm"
            : "bg-gradient-to-br from-[#312e7a] to-[#27255a] border border-indigo-600/30 text-indigo-100 rounded-tl-sm"
        }`}>
          {msg.content ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <span className="flex items-center gap-1 text-indigo-300">
              <span className="animate-bounce delay-0">•</span>
              <span className="animate-bounce delay-100">•</span>
              <span className="animate-bounce delay-200">•</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full btn-gold shadow-orange-glow text-sm font-bold"
          aria-label="Open AI coach"
        >
          <Bot className="h-4 w-4" />
          Ask your Coach
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 flex flex-col w-full sm:w-[400px] h-[85vh] sm:h-[620px] rounded-none sm:rounded-2xl overflow-hidden border border-indigo-600/40 shadow-2xl bg-[#1a1840]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#312e7a] to-[#1e1b4b] border-b border-indigo-700/40 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-pink to-violet-600 flex items-center justify-center shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">AI Coach</p>
                <p className="text-[10px] text-indigo-400 leading-tight truncate max-w-[180px]">
                  {lessonTitle}
                </p>
              </div>
            </div>
            {usage && !usage.unlimited && (
              <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                (usage.limit! - usage.used) <= 2
                  ? "text-red-400 border-red-500/30 bg-red-500/10"
                  : "text-indigo-400 border-indigo-600/30 bg-indigo-500/10"
              }`}>
                <Zap className="h-2.5 w-2.5" />
                {Math.max(0, usage.limit! - usage.used)}/{usage.limit} left
              </div>
            )}
            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  onClick={clearChat}
                  disabled={isStreaming}
                  className="p-1.5 rounded-lg text-indigo-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 text-brand-gold animate-spin" />
              </div>
            ) : error && !hasMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => { setInitialized(false); setError(""); }}
                    className="mt-2 text-xs text-indigo-400 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !hasMessages ? (
              /* Welcome state */
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-pink to-violet-600 flex items-center justify-center shadow-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold mb-1">Your AI Coach is ready</p>
                  <p className="text-xs text-indigo-300 leading-relaxed max-w-[260px]">
                    I know this lesson inside and out. Ask me anything — about the concepts, how to apply them, or what's holding you back.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full mt-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-xs px-3 py-2.5 rounded-xl bg-white/5 border border-indigo-700/40 text-indigo-200 hover:bg-white/10 hover:border-indigo-500/50 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(renderMessage)}
                {error && (
                  <p className="text-xs text-red-400 text-center">{error}</p>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-indigo-700/40 px-3 py-3 bg-[#1a1840]">
            {limitHit ? (
              /* Upgrade CTA */
              <div className="rounded-xl bg-gradient-to-r from-orange-500/15 to-pink-500/15 border border-orange-500/30 p-4 text-center">
                <Lock className="h-5 w-5 text-orange-400 mx-auto mb-1.5" />
                <p className="text-sm font-bold text-white mb-0.5">Daily limit reached</p>
                <p className="text-xs text-indigo-300 mb-3">
                  {usage?.unlimited ? "" : `You've used all ${usage?.limit} messages for today.`}
                </p>
                <a
                  href="/billing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90 transition-opacity"
                >
                  <Zap className="h-3 w-3" />
                  Upgrade for more
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your coach anything..."
                    rows={1}
                    disabled={isStreaming || isLoading}
                    className="flex-1 resize-none rounded-xl bg-[#27255a] border border-indigo-700/50 text-white placeholder-indigo-500 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-pink/60 focus:ring-1 focus:ring-brand-pink/30 disabled:opacity-60 transition-all max-h-32 overflow-y-auto"
                    style={{ minHeight: "42px" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 128) + "px";
                    }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isStreaming || isLoading}
                    className="flex-shrink-0 h-[42px] w-[42px] rounded-xl bg-gradient-to-br from-brand-pink to-violet-600 flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                  >
                    {isStreaming
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Send className="h-4 w-4" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-indigo-500 mt-1.5 text-center">
                  Enter to send · Shift+Enter for new line
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
