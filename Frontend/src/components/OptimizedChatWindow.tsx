import React, { useMemo, useState } from "react";
import { Box, Stack, IconButton, Chip } from "@mui/material";
import { ThumbUp, ThumbDown, ContentCopy } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import FeedbackModal from "./FeedbackModal";
import MarkdownRenderer from "./MarkdownRenderer";

const CompactChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  background: '#F4F7FB',
}));

const CompactChatTrack = styled(Stack)(({ theme }) => ({
  maxWidth: '1090px',
  margin: '0 auto',
  padding: '16px 24px 60px', // Reduced bottom padding from 140px to 60px
  gap: '8px', // Reduced from default spacing
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px 40px', // Further reduced for mobile
    gap: '6px',
  },
}));

const MessageRow = styled(Stack)(({ theme, role }) => ({
  alignItems: role === 'user' ? 'flex-end' : 'flex-start',
  gap: '4px', // Reduced gap between bubble and reactions
}));

const MessageBubble = styled(Box)(({ theme, role, isTyping }) => ({
  maxWidth: '75%',
  padding: '10px 14px',
  borderRadius: '20px',
  boxShadow: '0 2px 12px rgba(16,24,40,.1)',
  whiteSpace: 'pre-wrap',
  fontSize: '15px',
  lineHeight: 1.5,
  ...(role === 'user' && {
    background: '#1F7507',
    color: '#fff',
    borderBottomRightRadius: '6px',
  }),
  ...(role === 'bot' && !isTyping && {
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #E5E9F2',
    borderBottomLeftRadius: '6px',
  }),
  ...(isTyping && {
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    borderRadius: 0,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  }),
  [theme.breakpoints.down('sm')]: {
    maxWidth: '88vw',
    fontSize: '14px',
    padding: isTyping ? 0 : '8px 12px',
  },
}));

const TypingDot = styled('span')(({ theme, delay }) => ({
  width: '8px',
  height: '8px',
  backgroundColor: '#1C8208',
  borderRadius: '50%',
  animation: 'bounce 1.4s infinite ease-in-out',
  animationDelay: delay,
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-6px)',
    },
  },
}));

const ReactionBar = styled(Stack)(({ theme, role }) => ({
  direction: 'row',
  gap: '6px',
  marginTop: '2px', // Reduced from 4px
  opacity: 0.9,
  justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
}));

const ReactionButton = styled(IconButton)(({ theme, active, variant }) => ({
  background: 'transparent',
  border: 'none',
  color: active ? (variant === 'up' ? '#16a34a' : variant === 'down' ? '#dc2626' : '#10b981') : '#97A3B6',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '8px',
  transition: 'color .18s ease',
  '&:hover': {
    color: '#475569',
    background: 'rgba(0,0,0,0.04)',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
  },
}));

export default function OptimizedChatWindow({ messages, onFeedback }) {
  const [reactions, setReactions] = useState({});
  const [modal, setModal] = useState({ open: false, messageId: null, thumb: null });
  const [copiedId, setCopiedId] = useState(null);

  const rows = useMemo(() => messages, [messages]);

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

  const copyText = async (txt, id) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };

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
    <CompactChatContainer>
      <CompactChatTrack>
        {rows.map((m, i) => {
          const id = m.id ?? i;
          return (
            <MessageRow key={id} role={m.role}>
              <MessageBubble role={m.role} isTyping={m.isTyping}>
                {m.isTyping ? (
                  <>
                    Generating
                    <TypingDot delay="-0.32s" />
                    <TypingDot delay="-0.16s" />
                    <TypingDot delay="0s" />
                  </>
                ) : (
                  <MarkdownRenderer text={m.text} />
                )}
              </MessageBubble>

              {/* Reactions */}
              <ReactionBar role={m.role}>
                {m.role === "bot" ? (
                  <>
                    <ReactionButton
                      active={reactions[id] === "up"}
                      variant="up"
                      title="Helpful"
                      onClick={() => handleThumbUp(id)}
                      size="small"
                    >
                      <ThumbUp fontSize="small" />
                    </ReactionButton>
                    <ReactionButton
                      active={reactions[id] === "down"}
                      variant="down"
                      title="Not helpful"
                      onClick={() => handleThumbDown(id)}
                      size="small"
                    >
                      <ThumbDown fontSize="small" />
                    </ReactionButton>
                    <ReactionButton
                      active={copiedId === id}
                      variant="copy"
                      title="Copy"
                      onClick={() => copyText(m.text, id)}
                      size="small"
                    >
                      <ContentCopy fontSize="small" />
                    </ReactionButton>
                  </>
                ) : (
                  <ReactionButton
                    active={copiedId === id}
                    variant="copy"
                    title="Copy"
                    onClick={() => copyText(m.text, id)}
                    size="small"
                  >
                    <ContentCopy fontSize="small" />
                  </ReactionButton>
                )}
              </ReactionBar>
            </MessageRow>
          );
        })}
      </CompactChatTrack>

      <FeedbackModal
        open={modal.open}
        thumb={modal.thumb}
        onClose={closeModal}
        onSubmit={handleSubmitFeedback}
      />
    </CompactChatContainer>
  );
}