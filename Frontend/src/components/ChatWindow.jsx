// -------------------------
// File: src/components/ChatWindow.jsx
// -------------------------
// -------------------------
// File: src/components/ChatWindow.jsx
// -------------------------
import React, { useMemo, useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import MarkdownRenderer from "./MarkdownRenderer";
import ScrollToBottomButton from "./ScrollToBottomButton";
import useAutoScroll from "../hooks/useAutoScroll";

export default function ChatWindow({ messages, onFeedback, loading }) {
  // Track reactions per message id: { [id]: 'up' | 'down' }
  const [reactions, setReactions] = useState({});
  const [modal, setModal] = useState({ open: false, messageId: null, thumb: null });
  const [copiedId, setCopiedId] = useState(null);

  const rows = useMemo(() => messages, [messages]);

  // Auto-scroll when messages change or when loading state changes
  const { containerRef, scrollToBottom } = useAutoScroll([messages.length, loading], {
    smooth: true,
    delay: 50, // Reduced delay for faster scrolling
    force: false // Don't force scroll if user has scrolled up
  });

  // Scroll to bottom when component first mounts with messages or when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true); // Immediate scroll on mount
    }
  }, []);

  // Additional effect to ensure last message is always visible
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom(false); // Smooth scroll for new messages
      }, 10);
    }
  }, [messages.length]);

  // 👍 Toggle: first click => green + POST; second click => clear (no POST)
  const handleThumbUp = async (id) => {
    const isActive = reactions[id] === "up";
    if (isActive) {
      setReactions((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      });
      return;
    }
    setReactions((r) => ({ ...r, [id]: "up" }));
    try {
      await onFeedback?.({ messageId: id, thumb: "up", text: "" });
    } catch {}
  };

  // 👎 Toggle: first click => red + OPEN modal; second click => clear (no modal)
  const handleThumbDown = (id) => {
    const isActive = reactions[id] === "down";
    if (isActive) {
      setReactions((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      });
      setModal({ open: false, messageId: null, thumb: null });
      return;
    }
    setReactions((r) => ({ ...r, [id]: "down" }));
    setModal({ open: true, messageId: id, thumb: "down" });
  };

  // 📋 Copy flash (green briefly)
  const copyText = async (txt, id) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };

  // Modal submit only for 👎
  const handleSubmitFeedback = async (text) => {
    if (!modal.messageId) return;
    try {
      await onFeedback?.({ messageId: modal.messageId, thumb: "down", text });
    } finally {
      setModal({ open: false, messageId: null, thumb: null });
    }
  };

  const closeModal = () => setModal({ open: false, messageId: null, thumb: null });

  return (
    <div className="chat-window" ref={containerRef}>
      <div className="chat-track">
        {rows.map((m, i) => {
          const id = m.id ?? i; // fallback if backend didn't supply id (only used for local UI state)
          return (
            <div key={id} className={`row ${m.role}`}>
              <div className={`bubble ${m.role} ${m.isTyping ? 'typing-bubble' : ''}`}>
                {m.isTyping ? (
                  <>
                    Generating<span className="dot one"></span><span className="dot two"></span><span className="dot three"></span>
                  </>
                ) : (
                  <MarkdownRenderer text={m.text} />
                )}
              </div>

              {/* Reactions */}
              <div className={`reactions ${m.role}`}>
                {m.role === "bot" ? (
                  <>
                    <button
                      className={`r-btn up ${reactions[id] === "up" ? "active" : ""}`}
                      title="Helpful"
                      onClick={() => handleThumbUp(id)}
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button
                      className={`r-btn down ${reactions[id] === "down" ? "active" : ""}`}
                      title="Not helpful"
                      onClick={() => handleThumbDown(id)}
                    >
                      <ThumbsDown size={14} />
                    </button>
                    <button
                      className={`r-btn ${copiedId === id ? "copied" : ""}`}
                      title="Copy"
                      onClick={() => copyText(m.text, id)}
                    >
                      <Copy size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className={`r-btn ${copiedId === id ? "copied" : ""}`}
                    title="Copy"
                    onClick={() => copyText(m.text, id)}
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ScrollToBottomButton containerRef={containerRef} />

      <FeedbackModal
        open={modal.open}
        thumb={modal.thumb}
        onClose={closeModal}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
}