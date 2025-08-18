import React, { useMemo, useState } from "react";
import { Box, Stack, IconButton } from "@mui/material";
import { ThumbUp, ThumbDown, ContentCopy } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import FeedbackModal from "./FeedbackModal";
import MarkdownRenderer from "./MarkdownRenderer";

const UltraCompactChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  background: '#F4F7FB',
}));

const UltraCompactChatTrack = styled(Stack)(({ theme }) => ({
  maxWidth: '1090px',
  margin: '0 auto',
  padding: '8px 16px 20px', // Drastically reduced from 16px 24px 60px
  gap: '4px', // Reduced from 8px
  [theme.breakpoints.down('sm')]: {
    padding: '6px 12px 16px', // Further reduced for mobile
    gap: '3px',
  },
}));

const UltraCompactMessageRow = styled(Stack)(({ theme, role }) => ({
  alignItems: role === 'user' ? 'flex-end' : 'flex-start',
  gap: '1px', // Minimal gap between bubble and reactions
}));

const UltraCompactMessageBubble = styled(Box)(({ theme, role, isTyping }) => ({
  maxWidth: '75%',
  padding: '6px 10px', // Reduced from 10px 14px
  borderRadius: '16px', // Reduced from 20px
  boxShadow: '0 1px 6px rgba(16,24,40,.08)', // Reduced shadow
  whiteSpace: 'pre-wrap',
  fontSize: '14px', // Reduced from 15px
  lineHeight: 1.4, // Tighter line height
  ...(role === 'user' && {
    background: '#1F7507',
    color: '#fff',
    borderBottomRightRadius: '4px',
  }),
  ...(role === 'bot' && !isTyping && {
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #E5E9F2',
    borderBottomLeftRadius: '4px',
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
    fontSize: '13px',
    padding: isTyping ? 0 : '5px 8px', // Further reduced
  },
}));

const UltraCompactTypingDot = styled('span')(({ theme, delay }) => ({
  width: '6px', // Reduced from 8px
  height: '6px',
  backgroundColor: '#1C8208',
  borderRadius: '50%',
  animation: 'bounce 1.4s infinite ease-in-out',
  animationDelay: delay,
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-4px)', // Reduced bounce
    },
  },
}));

const UltraCompactReactionBar = styled(Stack)(({ theme, role }) => ({
  direction: 'row',
  gap: '3px', // Reduced from 6px
  marginTop: '1px', // Minimal margin
  opacity: 0.9,
  justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
}));

const UltraCompactReactionButton = styled(IconButton)(({ theme, active, variant }) => ({
  background: 'transparent',
  border: 'none',
  color: active ? (variant === 'up' ? '#16a34a' : variant === 'down' ? '#dc2626' : '#10b981') : '#97A3B6',
  cursor: 'pointer',
  padding: '2px', // Reduced from 4px
  borderRadius: '6px',
  transition: 'color .18s ease',
  width: '24px', // Smaller buttons
  height: '24px',
  minWidth: '24px',
  '&:hover': {
    color: '#475569',
    background: 'rgba(0,0,0,0.04)',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: 'none',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '14px', // Smaller icons
  },
}));

export default function UltraCompactChatWindow({ messages, onFeedback }) {
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
    <UltraCompactChatContainer>
      <UltraCompactChatTrack>
        {rows.map((m, i) => {
          const id = m.id ?? i;
          return (
            <UltraCompactMessageRow key={id} role={m.role}>
              <UltraCompactMessageBubble role={m.role} isTyping={m.isTyping}>
                {m.isTyping ? (
                  <>
                    Generating
                    <UltraCompactTypingDot delay="-0.32s" />
                    <UltraCompactTypingDot delay="-0.16s" />
                    <UltraCompactTypingDot delay="0s" />
                  </>
                ) : (
                  <MarkdownRenderer text={m.text} />
                )}
              </UltraCompactMessageBubble>

              {/* Reactions */}
              <UltraCompactReactionBar role={m.role}>
                {m.role === "bot" ? (
                  <>
                    <UltraCompactReactionButton
                      active={reactions[id] === "up"}
                      variant="up"
                      title="Helpful"
                      onClick={() => handleThumbUp(id)}
                      size="small"
                    >
                      <ThumbUp />
                    </UltraCompactReactionButton>
                    <UltraCompactReactionButton
                      active={reactions[id] === "down"}
                      variant="down"
                      title="Not helpful"
                      onClick={() => handleThumbDown(id)}
                      size="small"
                    >
                      <ThumbDown />
                    </UltraCompactReactionButton>
                    <UltraCompactReactionButton
                      active={copiedId === id}
                      variant="copy"
                      title="Copy"
                      onClick={() => copyText(m.text, id)}
                      size="small"
                    >
                      <ContentCopy />
                    </UltraCompactReactionButton>
                  </>
                ) : (
                  <UltraCompactReactionButton
                    active={copiedId === id}
                    variant="copy"
                    title="Copy"
                    onClick={() => copyText(m.text, id)}
                    size="small"
                  >
                    <ContentCopy />
                  </UltraCompactReactionButton>
                )}
              </UltraCompactReactionBar>
            </UltraCompactMessageRow>
          );
        })}
      </UltraCompactChatTrack>

      <FeedbackModal
        open={modal.open}
        thumb={modal.thumb}
        onClose={closeModal}
        onSubmit={handleSubmitFeedback}
      />
    </UltraCompactChatContainer>
  );
}