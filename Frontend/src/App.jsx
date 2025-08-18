import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, API_BASE } from "./api";
import { STRINGS, GREETINGS } from "./strings";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";
import BigPrompt from "./components/BigPrompt";
import InputBox from "./components/InputBox";
import OnboardingModal from "./components/OnboardingModal";
import SearchModal from "./components/SearchModal";
import ShareModal from "./components/ShareModal";
import InitialSetupModal from "./components/InitialSetupModal";
import LanguageChangeHandler from "./components/LanguageChangeHandler";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Menu } from "lucide-react";
import "./styles.css";

export default function App() {
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
  const [sessionsByBucket, setSessionsByBucket] = useState({});

  // cache and race-protection
  const historyCacheRef = useRef(new Map()); // sid -> msgs
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

  // debounce helper with better performance
  const debounce = (fn, ms=500) => (...args) => { // Increased from 300ms to 500ms
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fn(...args), ms);
  };

  // URL helpers
  const setUrlToSession = (sid) => { if (sid) window.history.replaceState(null, "", `/s/${sid}`); };
  const setUrlToRoot = () => { window.history.replaceState(null, "", `/`); };

  // --- sessions loader (debounced) ---
  const _loadSessionsCore = async (emailArg = email) => {
    if (!emailArg) return;
    try {
      const res = await api.history({ domain: "list-session", user_email: emailArg, language: lang });
      if (res?.data) {
        const filtered = {};
        Object.keys(res.data).forEach((k) => {
          if (Array.isArray(res.data[k]) && res.data[k].length > 0) filtered[k] = res.data[k];
        });
        if (Object.keys(filtered).length === 0 && Array.isArray(res.data["Today"])) {
          filtered["Today"] = res.data["Today"];
        }
        setSessionsByBucket(filtered);
      }
    } catch (e) {
      console.error("loadSessions:", e);
    }
  };
  const loadSessions = useMemo(() => debounce(_loadSessionsCore, 500), [lang, email]); // Increased debounce


  // Load once on mount (if email already known)
  useEffect(() => {
    if (email) loadSessions(email);
    // Parse /s/<id> and open it on first load (if email exists)
    const m = window.location.pathname.match(/^\/s\/([a-f0-9-]+)$/i);
    if (m && email) {
      selectSession(m[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Also reload whenever email changes (but avoid duplicate calls)
  useEffect(() => { 
    if (email && prevModeRef.current) { // Only reload if not initial load
      loadSessions(email); 
    }
  }, [email, loadSessions]);

  const selectSession = async (sid) => {
    if (!email || !sid) return;
    
    // Always set the selected session immediately for UI feedback
    setSelectedSessionId(sid);
    setUrlToSession(sid);
    setDrawerOpen(false);

    // If this is the same session that's already loaded, don't reload
    if (sessionId === sid && messages.length > 0) {
      return;
    }

    // Clear messages and show loading for all sessions
    setMessages([]);
    setLoading(true);

    const token = ++sessionFetchTokenRef.current;
    try {
      // Always make API call to ensure fresh data
      const res = await api.history({
        domain: "session-chat",
        user_email: email,
        session_id: sid,
        language: lang,
      });
      
      if (token !== sessionFetchTokenRef.current) return; // race protection

      const msgs = [];
      (res?.data || []).forEach((row) => {
        if (row.user_query) msgs.push({ role: "user", text: row.user_query, id: row.message_id });
        if (row.bot_message) msgs.push({ role: "bot", text: row.bot_message, id: row.message_id });
      });

      // Update cache with fresh data
      historyCacheRef.current.set(sid, msgs);
      setMessages(msgs);
      setSessionId(sid);
    } catch (e) {
      console.error("selectSession:", e);
      // On error, try to use cached data as fallback
      const cachedMessages = historyCacheRef.current.get(sid);
      if (cachedMessages) {
        setMessages(cachedMessages);
        setSessionId(sid);
      }
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setSelectedSessionId(null);
    setUrlToRoot(); // show plain site URL like GPT
    // Clear any stale cache when starting new chat
    historyCacheRef.current.clear();
  };

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const created = await api.createSession({ user_email: email });
    const sid = created.session_id;
    setSessionId(sid);
    setSelectedSessionId(sid);
    setUrlToSession(sid); // switch to /s/<id> immediately

    // Immediately refresh session list to show new session
    await loadSessions(email);
    return sid;
  };

  const sendMessage = async (text) => {
    if (!email) return;
    const userMsg = { role: "user", text };
    const typingIndicatorMsg = { role: "bot", text: "Generating", isTyping: true, id: "temp-typing-indicator" };

    setMessages((m) => [...m, userMsg, typingIndicatorMsg]); // Add user message and typing indicator
    setLoading(true);

    // Check if this is the first message (no existing sessionId)
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
        // Remove the typing indicator and add the actual bot message
        const newMessages = m.filter(msg => msg.id !== "temp-typing-indicator");
        return [...newMessages, botMsg];
      });

      // update cache
      const prev = historyCacheRef.current.get(sid) || [];
      historyCacheRef.current.set(sid, [...prev, userMsg, botMsg]);

      // If this is the first meaningful message, update session name
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

      // Refresh session list to show updated session
      loadSessions(email);
    } catch (e) {
      console.error("sendMessage:", e);
      setMessages((m) => {
        // Remove the typing indicator and add an error message
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
      // Immediately refresh session list to show updated name
      await loadSessions(email);
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
    
    // Clear cache for deleted session
    historyCacheRef.current.delete(s.session_id);
    
    if (selectedSessionId === s.session_id) startNewChat();
    // Immediately refresh session list to remove deleted session
    await loadSessions(email);
  };

  const handleInitialSetupComplete = ({ language, pincode, mode }) => {
    setLang(language);
    setPincode(pincode);
    setMode(mode);
    setShowInitialSetup(false);
    sessionStorage.setItem("ks_initial_setup", "1");
  };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); alert("Share link copied!"); }
    catch { alert("Could not copy link"); }
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
      loadSessions(email);
    } catch (error) {
      console.error("Failed to update pincode:", error);
      throw error;
    }
  };

  const prevModeRef = useRef(mode);

  useEffect(() => {
    const modeChanged = prevModeRef.current !== mode && prevModeRef.current !== null;

    if (email && modeChanged) {
      // Debounce mode updates to prevent rapid API calls
      const timeoutId = setTimeout(() => {
        api.updateUserInfo({
          user_email: email,
          mode: mode,
        }).then(() => {
          loadSessions(email); // Refresh sidebar if mode changed
        }).catch((e) => console.warn("sync mode failed", e));
      }, 800); // Increased from 300ms to 800ms

      return () => clearTimeout(timeoutId);
    }

    prevModeRef.current = mode;
  }, [mode, email, loadSessions]);

  const openSidebar = () => {
    if (window.innerWidth <= 768) {
      setDrawerOpen(true);
    } else {
      setSidebarOpen(true);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setDrawerOpen(!isDrawerOpen);
    } else {
      setSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <ThemeProvider>
      <LanguageChangeHandler
        lang={lang}
        email={email}
        selectedSessionId={selectedSessionId}
        onSessionsUpdate={setSessionsByBucket}
        onSessionChatUpdate={(msgs) => {
          setMessages(msgs);
          if (selectedSessionId) {
            historyCacheRef.current.set(selectedSessionId, msgs);
          }
        }}
      >
      <div className="app">
        <TopBar
          brand={brandName}
          lang={lang}
          setLang={setLang}
          onUpdatePincode={handleUpdatePincode}
          pincode={pincode}
          t={t}
        />

        <div className="layout">
        {isSidebarOpen && (
          <aside className="sidebar desktop">
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
            />
          </aside>
        )}

        {!isSidebarOpen && (
          <button className="side-rail" onClick={toggleSidebar} title="Open sidebar">
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
            />
          </aside>
        </div>

        <main className="main">
          {/* Case 1: We are switching sessions and fetching history */}
          {loading && messages.length === 0 && (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <p>Loading chat...</p>
            </div>
          )}

          {/* Case 2: No messages, initial state */}
          {!loading && messages.length === 0 && (
            <div className="empty-viewport">
              <BigPrompt
                title={t.welcome(firstName)}
                placeholder={t.askPlaceholder}
                mode={mode}
                setMode={setMode}
                onSend={sendMessage}
                t={t}
                email={email}
              />
            </div>
          )}

          {/* Case 3: We have messages to display */}
          {messages.length > 0 && (
            <>
              <ChatWindow
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
              <InputBox
                placeholder={t.messagePlaceholder}
                mode={mode}
                setMode={setMode}
                onSend={sendMessage}
                disabled={loading}
                t={t}
                email={email}
              />
            </>
          )}
        </main>
        </div>

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

        <button className="side-rail mobile" onClick={toggleSidebar} title="Open sidebar">
          <Menu size={18} />
        </button>

      </div>
      </LanguageChangeHandler>
    </ThemeProvider>
  );
}