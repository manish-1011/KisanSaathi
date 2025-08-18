import React, { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Stack } from '@mui/material';
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { Menu } from "lucide-react";
import { api, API_BASE } from "./api";
import { STRINGS, GREETINGS } from "./strings";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import UltraCompactChatWindow from "./components/UltraCompactChatWindow";
import UltraCompactBigPrompt from "./components/UltraCompactBigPrompt";
import UltraCompactInputBox from "./components/UltraCompactInputBox";
import OnboardingModal from "./components/OnboardingModal";
import SearchModal from "./components/SearchModal";
import ShareModal from "./components/ShareModal";
import InitialSetupModal from "./components/InitialSetupModal";
import LanguageChangeHandler from "./components/LanguageChangeHandler";
import { useImagePreload } from "./hooks/useImagePreload";
import { useSessionPagination } from "./hooks/useSessionPagination";
import theme from "./theme";
import "./styles.css";

const createEmotionCache = () => {
  return createCache({
    key: "mui",
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

export default function SessionPaginationApp() {
  const { isPreloading, stats } = useImagePreload();
  const [brandName] = useState("KisanSaathi");
  const [lang, setLang] = useState(localStorage.getItem("ks_lang") || "hi");
  const [mode, setMode] = useState(localStorage.getItem("ks_mode") || "personal");
  const [pincode, setPincode] = useState(localStorage.getItem("ks_pin") || "");
  const [email] = useState("TeamKisanSaathi@gmail.com");
  const [showInitialSetup, setShowInitialSetup] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reset_setup')) {
      sessionStorage.removeItem("ks_initial_setup");
      return true;
    }
    return !sessionStorage.getItem("ks_initial_setup");
  });

  const [sessionId, setSessionId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSessionId, setShareSessionId] = useState(null);

  // Use the session pagination hook
  const {
    sessionsByBucket,
    isLoading: isLoadingSessions,
    isLoadingMore,
    hasMoreSessions,
    loadInitialSessions,
    loadMoreSessions,
    resetPagination,
    updateSessionsByBucket
  } = useSessionPagination(email, lang);

  // cache and race-protection
  const historyCacheRef = useRef(new Map());
  const sessionFetchTokenRef = useRef(0);
  const debounceRef = useRef(null);

  const t = STRINGS[lang] || STRINGS.en;
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);
  const firstName = useMemo(() => {
    if (!email) return "Farmer";
    const local = email.split("@")[0] || "Farmer";
    return local.split(".")[0].replace(/[^a-zA-Z]/g, "") || local;
  }, [email]);

  // persist prefs
  useEffect(() => { localStorage.setItem("ks_lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("ks_mode", mode); }, [mode]);
  useEffect(() => {
    pincode ? localStorage.setItem("ks_pin", pincode) : localStorage.removeItem("ks_pin");
  }, [pincode]);
  useEffect(() => {
    email ? localStorage.setItem("ks_email", email) : localStorage.removeItem("ks_email");
  }, [email]);

  // URL helpers
  const setUrlToSession = (sid) => { if (sid) window.history.replaceState(null, "", `/s/${sid}`); };
  const setUrlToRoot = () => { window.history.replaceState(null, "", `/`); };

  // Load sessions on mount and when email/lang changes
  useEffect(() => {
    if (email) {
      loadInitialSessions(email);
      const m = window.location.pathname.match(/^\/s\/([a-f0-9-]+)$/i);
      if (m) {
        selectSession(m[1]);
      }
    }
  }, [email, loadInitialSessions]);

  // Reset pagination when language changes
  useEffect(() => {
    if (email) {
      resetPagination();
      loadInitialSessions(email);
    }
  }, [lang, email, resetPagination, loadInitialSessions]);

  const selectSession = async (sid) => {
    if (!email || !sid) return;
    
    const cachedMessages = historyCacheRef.current.get(sid);
    if (cachedMessages) {
      setSelectedSessionId(sid);
      setUrlToSession(sid);
      setMessages(cachedMessages);
      setSessionId(sid);
      setDrawerOpen(false);
      return;
    }

    setSelectedSessionId(sid);
    setUrlToSession(sid);
    setMessages([]);
    setLoading(true);

    const token = ++sessionFetchTokenRef.current;
    try {
      const res = await api.history({
        domain: "session-chat",
        user_email: email,
        session_id: sid,
        language: lang,
      });
      if (token !== sessionFetchTokenRef.current) return;

      const msgs = [];
      (res?.data || []).forEach((row) => {
        if (row.user_query) msgs.push({ role: "user", text: row.user_query, id: row.message_id });
        if (row.bot_message) msgs.push({ role: "bot", text: row.bot_message, id: row.message_id });
      });

      historyCacheRef.current.set(sid, msgs);
      setMessages(msgs);
      setSessionId(sid);
      setDrawerOpen(false);
    } catch (e) {
      console.error("selectSession:", e);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setSelectedSessionId(null);
    setUrlToRoot();
  };

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const created = await api.createSession({ user_email: email });
    const sid = created.session_id;
    setSessionId(sid);
    setSelectedSessionId(sid);
    setUrlToSession(sid);

    await loadInitialSessions(email);
    return sid;
  };

  const sendMessage = async (text) => {
    if (!email) return;
    const userMsg = { role: "user", text };
    const typingIndicatorMsg = { role: "bot", text: "Generating", isTyping: true, id: "temp-typing-indicator" };

    setMessages((m) => [...m, userMsg, typingIndicatorMsg]);
    setLoading(true);

    const isFirstMessage = !sessionId;

    try {
      const sid = await ensureSession();
      const res = await api.chat({
        session_id: sid,
        user_email: email,
        user_msg: text,
      });
      const botMsg = { role: "bot", text: res.bot_msg, id: res.message_id };

      setMessages((m) => {
        const newMessages = m.filter(msg => msg.id !== "temp-typing-indicator");
        return [...newMessages, botMsg];
      });

      const prev = historyCacheRef.current.get(sid) || [];
      historyCacheRef.current.set(sid, [...prev, userMsg, botMsg]);

      if (isFirstMessage) {
        const generatedName = api.generateSessionNameFromQuery(text);
        if (generatedName) {
          try {
            await api.manageSession({
              domain: "rename-session",
              user_email: email,
              session_id: sid,
              session_name: generatedName,
            });
          } catch (nameError) {
            console.warn("Failed to update session name:", nameError);
          }
        }
      }

      loadInitialSessions(email);
    } catch (e) {
      console.error("sendMessage:", e);
      setMessages((m) => {
        const newMessages = m.filter(msg => msg.id !== "temp-typing-indicator");
        return [...newMessages, { role: "bot", text: `⚠️ Could not reach server at ${API_BASE}. (${e.message})` }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (s, name) => {
    try {
      await api.manageSession({
        domain: "rename-session",
        user_email: email,
        session_id: s.session_id,
        session_name: name,
      });
      await loadInitialSessions(email);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (s) => {
    try {
      await api.manageSession({
        domain: "delete-session",
        user_email: email,
        session_id: s.session_id,
      });
    } catch (e) { console.error(e); }
    if (selectedSessionId === s.session_id) startNewChat();
    await loadInitialSessions(email);
  };

  const handleInitialSetupComplete = ({ language, pincode, mode }) => {
    setLang(language);
    setPincode(pincode);
    setMode(mode);
    setShowInitialSetup(false);
    sessionStorage.setItem("ks_initial_setup", "1");
  };

  const handleSessionShare = (session) => {
    setShareSessionId(session.session_id);
    setIsShareModalOpen(true);
  };

  const handleUpdatePincode = async (newPincode) => {
    if (!email || !newPincode.trim()) {
      throw new Error("Invalid pincode or email");
    }

    try {
      await api.updateUserInfo({
        user_email: email,
        pincode: newPincode.trim(),
      });
      setPincode(newPincode.trim());
      loadInitialSessions(email);
    } catch (error) {
      console.error("Failed to update pincode:", error);
      throw error;
    }
  };

  const prevModeRef = useRef(mode);

  useEffect(() => {
    const modeChanged = prevModeRef.current !== mode;

    if (email && modeChanged) {
      api.updateUserInfo({
        user_email: email,
        mode: mode,
      }).then(() => {
        loadInitialSessions(email);
      }).catch((e) => console.warn("sync mode failed", e));
    }

    prevModeRef.current = mode;
  }, [mode, email, loadInitialSessions]);

  const openSidebar = () => {
    if (window.innerWidth <= 768) setDrawerOpen(true);
    else setSidebarOpen(true);
  };

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageChangeHandler
          lang={lang}
          email={email}
          selectedSessionId={selectedSessionId}
          onSessionsUpdate={updateSessionsByBucket}
          onSessionChatUpdate={(msgs) => {
            setMessages(msgs);
            if (selectedSessionId) {
              historyCacheRef.current.set(selectedSessionId, msgs);
            }
          }}
        >
          <Box className="app" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopBar
              brand={brandName}
              lang={lang}
              setLang={setLang}
              onUpdatePincode={handleUpdatePincode}
              pincode={pincode}
              t={t}
            />

            <Box className="layout" sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 72px)' }}>
              {isSidebarOpen && (
                <Box component="aside" className="sidebar desktop" sx={{ width: 300, background: '#fff', borderRight: '1px solid #E5E9F2' }}>
                  <SideBar
                    t={t}
                    sessionsByBucket={sessionsByBucket}
                    onNewChat={startNewChat}
                    onSelectSession={selectSession}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onShare={handleSessionShare}
                    selectedId={selectedSessionId}
                    onClose={() => setSidebarOpen(false)}
                    onOpenSearch={() => setIsSearchModalOpen(true)}
                    onLoadMoreSessions={loadMoreSessions}
                    isLoadingMoreSessions={isLoadingMore}
                    hasMoreSessions={hasMoreSessions}
                  />
                </Box>
              )}

              {!isSidebarOpen && (
                <button className="side-rail" onClick={openSidebar} title="Open sidebar">
                  <Menu size={18} />
                </button>
              )}

              {/* Mobile drawer */}
              <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
                <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
                <aside className="sidebar drawer-panel">
                  <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
                  <SideBar
                    t={t}
                    sessionsByBucket={sessionsByBucket}
                    onNewChat={() => { startNewChat(); setDrawerOpen(false); }}
                    onSelectSession={selectSession}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onShare={handleSessionShare}
                    selectedId={selectedSessionId}
                    onClose={() => setDrawerOpen(false)}
                    onOpenSearch={() => setIsSearchModalOpen(true)}
                    onLoadMoreSessions={loadMoreSessions}
                    isLoadingMoreSessions={isLoadingMore}
                    hasMoreSessions={hasMoreSessions}
                  />
                </aside>
              </div>

              <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Loading sessions */}
                {isLoadingSessions && Object.keys(sessionsByBucket).length === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>Loading sessions...</p>
                  </Box>
                )}

                {/* Case 1: We are switching sessions and fetching history */}
                {loading && messages.length === 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>Loading chat...</p>
                  </Box>
                )}

                {/* Case 2: No messages, initial state */}
                {!loading && !isLoadingSessions && messages.length === 0 && (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    p: 0.5,
                    minHeight: 0 
                  }}>
                    <UltraCompactBigPrompt
                      title={t.welcome(firstName)}
                      placeholder={t.askPlaceholder}
                      mode={mode}
                      setMode={setMode}
                      onSend={sendMessage}
                      t={t}
                      email={email}
                    />
                  </Box>
                )}

                {/* Case 3: We have messages to display */}
                {messages.length > 0 && (
                  <Stack sx={{ flex: 1, height: '100%', spacing: 0 }}>
                    <UltraCompactChatWindow
                      messages={messages}
                      onFeedback={({ messageId, thumb, text }) =>
                        api.feedback({
                          user_email: email,
                          session_id: sessionId,
                          thumb,
                          text,
                        })
                      }
                      email={email}
                      sessionId={sessionId}
                      loading={loading}
                    />
                    <UltraCompactInputBox
                      placeholder={t.messagePlaceholder}
                      mode={mode}
                      setMode={setMode}
                      onSend={sendMessage}
                      disabled={loading}
                      t={t}
                      email={email}
                    />
                  </Stack>
                )}
              </Box>
            </Box>

            <SearchModal
              isOpen={isSearchModalOpen}
              onClose={() => setIsSearchModalOpen(false)}
              sessionsByBucket={sessionsByBucket}
              onSelectSession={(sid) => {
                selectSession(sid);
                setIsSearchModalOpen(false);
              }}
              t={t}
            />

            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              sessionId={shareSessionId}
              t={t}
            />

            <InitialSetupModal
              open={showInitialSetup}
              onComplete={handleInitialSetupComplete}
              initialLang={lang}
            />

            <button className="side-rail mobile" onClick={openSidebar} title="Open sidebar">
              <Menu size={18} />
            </button>

            {/* Image preload indicator */}
            {isPreloading && (
              <div className="image-preload-indicator">
                <div className="preload-spinner"></div>
                <span>Optimizing images...</span>
              </div>
            )}
          </Box>
        </LanguageChangeHandler>
      </ThemeProvider>
    </CacheProvider>
  );
}