import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MainChatPanel, ChatMessageItem } from './components/MainChatPanel';
import { ProjectsSidebar, ProjectItem } from './components/ProjectsSidebar';
import { TemplatesView } from './components/TemplatesView';
import { DocumentsView } from './components/DocumentsView';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { UpgradeModal } from './components/UpgradeModal';
import { SearchModal } from './components/SearchModal';
import { SourceInspectorModal } from './components/SourceInspectorModal';
import { SourcesDrawer } from './components/SourcesDrawer';
import {
  FinalAnswer,
  Source,
  InvestigationStatus,
} from './types';
import {
  detectSourceType,
  uploadAndVerifySource,
} from './services/fileProcessing';
import { DEMO_SOURCES } from './demoDataFallback';

export default function App() {
  // Navigation & Workspace View
  const [activeTab, setActiveTab] = useState<MainNavTab>('chat');

  // Sidebar visibility states (matching desktop/tablet responsiveness)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);

  // Theme Management (Light / Dark - defaults to Light as in reference screenshot)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('max_ai_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // User Profile
  const [userName, setUserName] = useState<string>('Bhaskar Burada');
  const [userEmail, setUserEmail] = useState<string>('bhaskarburada141@gmail.com');
  const [dbMode, setDbMode] = useState<'mongodb' | 'memory_fallback'>('memory_fallback');
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Sources & Evidence State
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [inspectingSource, setInspectingSource] = useState<Source | null>(null);
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState<boolean>(false);

  // Projects & Conversation Threads State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('Investigation Workspace');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [investigationStatus, setInvestigationStatus] = useState<InvestigationStatus>('IDLE');
  const [latestAnswer, setLatestAnswer] = useState<FinalAnswer | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Hidden native file input reference permanently mounted in DOM
  const nativeFileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with documentElement and localStorage
  useEffect(() => {
    localStorage.setItem('max_ai_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. Initial Load: DB Health, User Profile, Documents, Conversations
  useEffect(() => {
    const initApp = async () => {
      // Health check
      try {
        const hRes = await fetch('/api/health');
        if (hRes.ok) {
          const hData = await hRes.json();
          if (hData.database) {
            setDbMode(hData.database.mode || 'memory_fallback');
            setDbConnected(hData.database.connected ?? true);
          }
        }
      } catch (e) {
        console.warn('[MAX AI] Health check:', e);
      }

      // User profile
      try {
        const uRes = await fetch('/api/user/profile');
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData.name) setUserName(uData.name);
          if (uData.email) setUserEmail(uData.email);
          if (uData.theme && (uData.theme === 'light' || uData.theme === 'dark')) {
            setTheme(uData.theme);
          }
        }
      } catch {
        // Ignored
      }

      // Documents from database
      try {
        const dRes = await fetch('/api/documents');
        if (dRes.ok) {
          const dData = await dRes.json();
          if (Array.isArray(dData.documents) && dData.documents.length > 0) {
            const mappedSources: Source[] = dData.documents.map((d: any) => ({
              id: d._id || d.id,
              fileName: d.fileName,
              type: d.type || 'pdf',
              fileSize: d.fileSize || 0,
              uploadedAt: d.uploadedAt || new Date().toISOString(),
              status: 'READY',
              statusMessage: 'Source verified',
              content: d.contentPreview || '',
              pageCount: d.pageCount || 1,
              characterCount: d.characterCount || 0,
              ocrUsed: d.ocrUsed || false,
              generatedSuggestions: d.generatedSuggestions || [],
            }));
            setSources(mappedSources);
          }
        }
      } catch {
        // Ignored
      }

      // Conversations & Projects list
      await refreshProjects();
    };

    initApp();
  }, []);

  // Refresh projects from backend conversations
  const refreshProjects = async () => {
    try {
      const cRes = await fetch('/api/conversations');
      if (cRes.ok) {
        const cData = await cRes.json();
        const convList = cData.conversations || [];

        const projectItems: ProjectItem[] = convList.map((c: any) => {
          const updatedDate = new Date(c.updatedAt || c.createdAt || Date.now());
          return {
            id: c.id,
            title: c.title || 'Untitled Project',
            description: c.summary || c.lastMessage || 'Evidence-grounded inquiry session',
            lastActive: updatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            docCount: c.activeDocIds?.length || 0,
          };
        });

        // Add starter projects if empty to showcase the reference layout
        if (projectItems.length === 0) {
          projectItems.push(
            {
              id: 'proj-sample-1',
              title: 'Titan Fleet Audit & Flight Log',
              description: 'Autonomous cargo drone commercial launch and quarterly ledger audit.',
              lastActive: 'Today',
              docCount: 1,
            },
            {
              id: 'proj-sample-2',
              title: 'Thermal Battery Telemetry Analysis',
              description: 'Sub-zero flight endurance, power spikes, and electrochemical wear.',
              lastActive: 'Yesterday',
              docCount: 2,
            }
          );
        }

        setProjects(projectItems);

        // Load first project if no active conversation
        if (!currentConversationId && projectItems.length > 0) {
          loadConversation(projectItems[0].id);
        }
      }
    } catch (e) {
      console.warn('[MAX AI] Projects refresh:', e);
    }
  };

  // Sync suggestions when sources change
  useEffect(() => {
    if (sources.length === 0) {
      setActiveSuggestions([]);
      return;
    }
    const readySources = sources.filter((s) => s.status === 'READY');
    const allSugs: string[] = [];
    readySources.forEach((s) => {
      if (s.generatedSuggestions && Array.isArray(s.generatedSuggestions)) {
        s.generatedSuggestions.forEach((q) => {
          if (!allSugs.includes(q)) allSugs.push(q);
        });
      }
    });
    setActiveSuggestions(allSugs.slice(0, 4));
  }, [sources]);

  // Open native file picker
  const openFilePicker = () => {
    if (nativeFileInputRef.current) {
      nativeFileInputRef.current.click();
    }
  };

  // Handle native file input change
  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // File upload state machine
  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      const sourceId = `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const fileType = detectSourceType(file.name, file.type);

      // 1. Initial UPLOADING state
      const initialSource: Source = {
        id: sourceId,
        fileName: file.name,
        type: fileType,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADING',
        statusMessage: 'Uploading to database...',
      };

      setSources((prev) => {
        const filtered = prev.filter((s) => s.fileName !== file.name);
        return [...filtered, initialSource];
      });

      // 2. Transition to PROCESSING state
      setTimeout(() => {
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? { ...s, status: 'PROCESSING', statusMessage: 'Extracting content & verifying...' }
              : s
          )
        );
      }, 50);

      // 3. Process & Extract on backend
      try {
        const uploadResult = await uploadAndVerifySource(file, sourceId);
        const diag = uploadResult.diagnostics;
        const suggestions = uploadResult.suggestions || [];

        // 4. Mark as READY
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  status: 'READY',
                  statusMessage: 'Source verified',
                  content: uploadResult.source.content,
                  pages: uploadResult.source.pages,
                  pageCount: diag?.pages || uploadResult.source.pageCount || 1,
                  characterCount:
                    diag?.extractedCharacters ||
                    uploadResult.source.characterCount ||
                    uploadResult.source.content?.length ||
                    0,
                  ocrUsed: diag?.ocrRequired === 'YES',
                  generatedSuggestions: suggestions,
                  metadata: uploadResult.source.metadata,
                }
              : s
          )
        );
      } catch (err: any) {
        console.error('[File Processing Error]:', err);
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  status: 'ERROR',
                  errorMessage: err.message || 'Could not read this file.',
                }
              : s
          )
        );
      }
    }
  };

  // Remove source
  const handleRemoveSource = async (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch {
      // Ignored
    }
  };

  // Load sample dataset
  const handleLoadDemoSample = async () => {
    try {
      const res = await fetch('/api/sources/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources);
      }
    } catch {
      setSources(DEMO_SOURCES);
    }
  };

  // Start new project / conversation
  const startNewProject = async () => {
    const newId = `proj-${Date.now()}`;
    const newTitle = `New Project ${projects.length + 1}`;
    setCurrentConversationId(newId);
    setConversationTitle(newTitle);
    setMessages([]);
    setLatestAnswer(null);
    setQuestion('');
    setActiveTab('chat');

    const newProjectItem: ProjectItem = {
      id: newId,
      title: newTitle,
      description: 'New evidence investigation workspace',
      lastActive: 'Just now',
      docCount: sources.length,
    };
    setProjects((prev) => [newProjectItem, ...prev]);

    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, title: newTitle }),
      });
    } catch {
      // Ignored
    }
  };

  // Load existing conversation
  const loadConversation = async (id: string) => {
    setCurrentConversationId(id);
    setActiveTab('chat');

    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const conv = data.conversation;
        if (conv) {
          setConversationTitle(conv.title || 'Investigation Session');
          if (Array.isArray(conv.messages)) {
            const mappedMessages: ChatMessageItem[] = conv.messages.map((m: any) => ({
              id: m.id || `msg-${Date.now()}-${Math.random()}`,
              sender: m.sender || 'assistant',
              content: m.content || '',
              timestamp: m.timestamp || new Date().toISOString(),
              status: m.status,
              headline: m.headline,
              evidenceCount: m.evidenceCount,
              sourcesUsed: m.sourcesUsed,
              investigationResult: m.investigationResult,
            }));
            setMessages(mappedMessages);
          } else {
            setMessages([]);
          }
        }
      }
    } catch (e) {
      console.warn('[MAX AI] Failed loading conversation:', e);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentConversationId === id) {
      setMessages([]);
      setCurrentConversationId(null);
    }
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    } catch {
      // Ignored
    }
  };

  // Trigger Investigation Pipeline
  const triggerInvestigation = async (customQuery?: string) => {
    const q = (customQuery || question).trim();
    if (!q || investigationStatus === 'INVESTIGATING') return;

    setInvestigationStatus('INVESTIGATING');

    // Add user message to conversation immediately
    const userMsg: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setActiveTab('chat');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        abortController.abort(new DOMException('Investigation timeout', 'AbortError'));
      } catch {
        abortController.abort();
      }
    }, 45000);

    try {
      const readySources = sources.filter((s) => s.status === 'READY');

      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          customSources: readySources,
          conversationId: currentConversationId,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Investigation failed with HTTP ${res.status}`);
      }

      const answer: FinalAnswer = await res.json();
      setLatestAnswer(answer);
      setInvestigationStatus('ANSWER_READY');

      // Add assistant message with grounded answer and verification details
      const assistantMsg: ChatMessageItem = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        content: answer.answer || answer.headline || 'Investigation completed.',
        timestamp: new Date().toISOString(),
        status: answer.status,
        headline: answer.headline,
        evidenceCount: answer.evidence?.length || 0,
        sourcesUsed: answer.evidence?.map((e: any) => e.sourceFileName) || [],
        investigationResult: answer,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update current project title & summary if new
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentConversationId
            ? {
                ...p,
                title: p.title.startsWith('New Project') ? q.slice(0, 36) + '...' : p.title,
                description: assistantMsg.content.slice(0, 90) + '...',
                lastActive: 'Just now',
              }
            : p
        )
      );

      // Persist to MongoDB conversation
      if (currentConversationId) {
        fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: q,
            assistantResponse: assistantMsg.content,
            status: answer.status,
            investigationResult: answer,
          }),
        }).catch(() => null);
      }
    } catch (err: any) {
      console.error('[MAX AI] Investigation error:', err);
      setInvestigationStatus('ERROR');

      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `Investigation could not be completed: ${err.message || 'Verification timeout or API error. Please refine your question or re-upload your document.'}`,
        timestamp: new Date().toISOString(),
        status: 'UNKNOWN',
        headline: 'Investigation Notice',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      clearTimeout(timeoutId);
      setInvestigationStatus((prev) => (prev === 'INVESTIGATING' ? 'IDLE' : prev));
    }
  };

  const isInvestigating = investigationStatus === 'INVESTIGATING';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Permanently mounted native file input for universal uploads */}
      <input
        ref={nativeFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
        multiple
        className="hidden"
        onChange={handleNativeFileChange}
      />

      {/* 1. LEFT SIDEBAR (Fixed Navigation) matching reference screenshot */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else if (tab === 'help') {
            setIsHelpOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        documentCount={sources.length}
        projectCount={projects.length}
        onOpenUpload={openFilePicker}
        theme={theme}
        onToggleTheme={toggleTheme}
        userName={userName}
        userEmail={userEmail}
        isCollapsed={isLeftSidebarCollapsed}
        onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 2. CENTER PANEL (Main Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[var(--bg-primary)]">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenPresets={handleLoadDemoSample}
          onToggleLeftSidebar={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          documentCount={sources.length}
          userName={userName}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' && (
            <MainChatPanel
              messages={messages}
              sources={sources}
              question={question}
              setQuestion={setQuestion}
              onInvestigate={triggerInvestigation}
              isInvestigating={isInvestigating}
              onOpenUpload={openFilePicker}
              onInspectSourceByFileName={(fileName) => {
                const src = sources.find((s) => s.fileName === fileName);
                if (src) setInspectingSource(src);
              }}
              onSelectSuggestion={(sug) => {
                setQuestion(sug);
                triggerInvestigation(sug);
              }}
              activeSuggestions={activeSuggestions}
              onOpenSourcesDrawer={() => setIsSourcesDrawerOpen(true)}
              onNewChat={startNewProject}
            />
          )}

          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <TemplatesView
                onUseTemplate={(prompt, title) => {
                  setQuestion(prompt);
                  if (title) setConversationTitle(title);
                  setActiveTab('chat');
                }}
                onOpenUpload={openFilePicker}
              />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <DocumentsView
                sources={sources}
                onOpenUpload={openFilePicker}
                onRemoveSource={handleRemoveSource}
                onInspectSource={(src) => setInspectingSource(src)}
                onAskAboutDocument={(src) => {
                  const prompt = src.generatedSuggestions?.[0] || `Summarize key findings in ${src.fileName}`;
                  setQuestion(prompt);
                  setActiveTab('chat');
                }}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <HistoryView
                onSelectConversation={(id) => loadConversation(id)}
                onNewChat={startNewProject}
                currentConversationId={currentConversationId}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                    All Projects ({projects.length})
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Manage your evidence investigations, active document scopes, and verified records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNewProject}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
                >
                  <span>New Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => loadConversation(proj.id)}
                    className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-500/40 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
                      <span>Updated {proj.lastActive}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">Open Project →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. RIGHT SIDEBAR (Projects Panel) matching reference screenshot */}
      <ProjectsSidebar
        projects={projects}
        selectedProjectId={currentConversationId}
        onSelectProject={(id) => loadConversation(id)}
        onNewProject={startNewProject}
        onDeleteProject={handleDeleteProject}
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        onOpenQuickPrompt={() => {
          setActiveTab('chat');
          setQuestion('What are the key conclusions in our loaded evidence?');
        }}
      />

      {/* 4. Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        userName={userName}
        setUserName={setUserName}
        dbMode={dbMode}
        dbConnected={dbConnected}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sources={sources}
        projects={projects}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectProject={(id) => loadConversation(id)}
        onSelectSource={(src) => setInspectingSource(src)}
        onQuickQuery={(q) => {
          setQuestion(q);
          triggerInvestigation(q);
        }}
      />

      <SourceInspectorModal
        source={inspectingSource}
        onClose={() => setInspectingSource(null)}
      />

      <SourcesDrawer
        isOpen={isSourcesDrawerOpen}
        onClose={() => setIsSourcesDrawerOpen(false)}
        sources={sources}
        onRemoveSource={handleRemoveSource}
        onClearAll={() => {
          setSources([]);
          setActiveSuggestions([]);
        }}
        onInspectSource={(src) => setInspectingSource(src)}
        onAddFiles={handleFilesSelected}
        onRestoreDemo={handleLoadDemoSample}
        isInvestigating={isInvestigating}
      />
    </div>
  );
}
