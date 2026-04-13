import { useState, useRef, useEffect, useCallback } from "react";
import "../chatbot-styles.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string; // ISO string for localStorage serialization
  isError?: boolean;
}

// ─── Pre-built question bank (always shown) ───────────────────────────────────
const QUESTION_BANK = [
  "How to place an order?",
  "What TMT bars do you sell?",
  "What are your steel grades?",
  "What is the delivery time?",
  "What are the payment options?",
  "What is the minimum order quantity?",
  "Do you offer bulk discounts?",
  "How do I track my order?",
  "What services do you offer?",
  "What is the pricing for TMT bars?",
  "Do you sell MS pipes?",
  "Can you cut steel to custom sizes?",
  "Do you provide IS-certified steel?",
  "What is your return policy?",
  "How do I contact you?",
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "skw_chat_history";

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Message[]) {
  try {
    // Keep last 50 messages only
    const toSave = msgs.slice(-50);
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full — silently skip
  }
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code style='background:rgba(74,144,217,0.12);padding:0.1em 0.35em;border-radius:3px;font-size:0.88em;'>$1</code>")
    .replace(/^[-•·] (.+)/gm, '<span style="display:block;padding-left:0.5em">· $1</span>')
    .replace(/\n/g, "<br />");
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
  </svg>
);
const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
  </svg>
);
const StopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
);
const ChatIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const BotIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V6"/>
    <circle cx="12" cy="4" r="2"/><path d="M8 15h.01M16 15h.01"/>
  </svg>
);
const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const QIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]           = useState(false);
  const [isClosing, setIsClosing]     = useState(false);
  const [messages, setMessages]       = useState<Message[]>(loadHistory);
  const [input, setInput]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showUnread, setShowUnread]   = useState(() => loadHistory().length === 0);
  const [showQBank, setShowQBank]     = useState(false);
  const [copied, setCopied]           = useState<number | null>(null);

  const endRef      = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recogRef    = useRef<SpeechRecognition | null>(null);

  // Dev uses 127.0.0.1 (fixes IPv6 localhost issues on Windows); production uses env URL
  const API_URL = import.meta.env.DEV
    ? "http://127.0.0.1:5000"
    : (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000");

  // ── Persist to localStorage whenever messages change ────────────────────────
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "38px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [input]);

  // ── Open / Close ─────────────────────────────────────────────────────────────
  const open = () => { setIsOpen(true); setShowUnread(false); };
  const close = () => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); setShowQBank(false); }, 220);
  };

  // ── Clear chat ───────────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(LS_KEY);
    setShowUnread(true);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const send = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;

    setShowQBank(false); // hide Q bank when sending

    const userMsg: Message = { role: "user", text, timestamp: new Date().toISOString() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text })),
        }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Server is not reachable. Is the backend running on port 5000?");
      }

      const data = await res.json();
      const reply = data.reply || "No response received. Please try again.";

      setMessages(prev => [...prev, {
        role: "model",
        text: reply,
        timestamp: new Date().toISOString(),
        isError: !res.ok,
      }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error.";
      setMessages(prev => [...prev, {
        role: "model",
        text: `Connection issue: ${msg}\n\nPlease ensure the backend server is running, or visit our **Contact page** for direct assistance.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, API_URL]);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────────
  const copyMsg = async (text: string, idx: number) => {
    try { await navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(null), 1800); }
    catch { /* skip */ }
  };

  // ── Voice input ──────────────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Chrome or Edge."); return; }
    if (isListening) { recogRef.current?.stop(); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = r.onend = () => setIsListening(false);
    r.start();
    recogRef.current = r;
    setIsListening(true);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── FAB ── */}
      <button
        id="skw-chat-fab"
        className={`skw-chat-fab${isOpen ? " open" : ""}`}
        onClick={isOpen ? close : open}
        title={isOpen ? "Close chat" : "Chat with us"}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
        {showUnread && !isOpen && <span className="skw-chat-unread" />}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          id="skw-chat-panel"
          className={`skw-chat-panel${isClosing ? " closing" : ""}`}
          role="dialog"
          aria-label="Chat window"
        >
          {/* ── Header ── */}
          <div className="skw-chat-header">
            <div className="skw-chat-header-icon"><BotIcon /></div>
            <div className="skw-chat-header-info">
              <div className="skw-chat-header-name">SKW Assistant</div>
              <div className="skw-chat-header-status">
                <span className="skw-status-dot" />
                Online · Steel Expert
              </div>
            </div>
            <div className="skw-chat-header-btns">
              {/* Toggle question bank */}
              <button
                className={`skw-chat-hbtn${showQBank ? " active" : ""}`}
                onClick={() => setShowQBank(q => !q)}
                title="Question bank"
                aria-label="Show question bank"
                id="skw-qbank-btn"
                style={showQBank ? { borderColor: "rgba(74,144,217,0.6)", color: "#4A90D9" } : {}}
              >
                <QIcon />
              </button>
              <button className="skw-chat-hbtn" onClick={clearChat} title="Clear conversation" aria-label="Clear chat" id="skw-chat-clear">
                <TrashIcon />
              </button>
              <button className="skw-chat-hbtn" onClick={close} title="Close" aria-label="Close chat" id="skw-chat-close">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* ── Question Bank Panel (always-accessible) ── */}
          {showQBank && (
            <div className="skw-qbank-panel" id="skw-qbank-panel">
              <div className="skw-qbank-title">Common Questions</div>
              <div className="skw-qbank-list">
                {QUESTION_BANK.map((q, i) => (
                  <button
                    key={i}
                    className="skw-qbank-item"
                    id={`skw-qbank-${i}`}
                    onClick={() => { send(q); setShowQBank(false); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {!showQBank && (
            <div className="skw-chat-messages" id="skw-chat-messages">
              {messages.length === 0 ? (
                <div className="skw-chat-welcome">
                  <div className="skw-chat-welcome-icon"><BotIcon /></div>
                  <h4>How can we help you?</h4>
                  <p>Ask about steel products, pricing, delivery, or orders. Tap the <strong>?</strong> button above to browse common questions.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`skw-chat-row ${msg.role === "user" ? "user" : "bot"}`}>
                    <div className="skw-chat-row-avatar">
                      {msg.role === "user" ? <UserIcon /> : <BotIcon />}
                    </div>
                    <div className="skw-chat-bubble-wrap">
                      <div
                        className={`skw-chat-bubble${msg.isError ? " error" : ""}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span className="skw-bubble-time">{fmt(msg.timestamp)}</span>
                        {msg.role === "model" && (
                          <button
                            className="skw-bubble-copy-inline"
                            onClick={() => copyMsg(msg.text, i)}
                            title="Copy"
                            id={`skw-copy-${i}`}
                          >
                            {copied === i ? "✓" : <CopyIcon />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="skw-chat-typing">
                  <div className="skw-chat-row-avatar" style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: "linear-gradient(135deg,#4A90D9,#5BA3EE)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", flexShrink: 0, marginTop: "auto"
                  }}><BotIcon /></div>
                  <div className="skw-chat-typing-bubble">
                    <div className="skw-tdot" /><div className="skw-tdot" /><div className="skw-tdot" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}

          {/* ── Input ── */}
          <div className="skw-chat-input-row" id="skw-chat-input-row">
            <button
              className={`skw-chat-mic${isListening ? " listening" : ""}`}
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Voice input"}
              aria-label="Voice input"
              id="skw-chat-mic"
            >
              {isListening ? <StopIcon /> : <MicIcon />}
            </button>
            <textarea
              ref={textareaRef}
              id="skw-chat-input"
              className="skw-chat-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={isListening ? "Listening..." : "Ask about steel, orders, delivery..."}
              rows={1}
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              className="skw-chat-send"
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
              title="Send"
              aria-label="Send message"
              id="skw-chat-send"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
