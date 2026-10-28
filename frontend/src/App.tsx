import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Memorial, MemorialSummary, AIStatus } from './types';
import { api } from './services/api';
import { Navigation } from './components/Navigation';
import { WelcomePage } from './pages/WelcomePage';
import { MemorialWizard } from './features/memorial/MemorialWizard';
import { AltarView } from './features/altar/AltarView';
import { RemembranceStudio } from './features/remembrance/RemembranceStudio';
import { StoryArchive } from './features/stories/StoryArchive';
import { SearchPage } from './features/search/SearchPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [memorials, setMemorials] = useState<MemorialSummary[]>([]);
  const [activeMemorialId, setActiveMemorialId] = useState<string | null>(null);
  const [activeMemorial, setActiveMemorial] = useState<Memorial | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Load Memorials and AI Status on Mount
  const loadData = async () => {
    try {
      const [mems, status] = await Promise.all([
        api.getMemorials(),
        api.getAIStatus().catch(() => null)
      ]);
      setMemorials(mems);
      setAIStatus(status);

      // Default active memorial if exists and none selected
      if (mems.length > 0 && !activeMemorialId) {
        setActiveMemorialId(mems[0].id);
        const detail = await api.getMemorial(mems[0].id);
        setActiveMemorial(detail);
      }
    } catch (e) {
      console.warn('Initial load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When activeMemorialId changes, fetch fresh details
  const selectMemorial = async (id: string, targetView: string = 'altar') => {
    try {
      setIsLoading(true);
      const detail = await api.getMemorial(id);
      setActiveMemorial(detail);
      setActiveMemorialId(id);
      setCurrentView(targetView);
    } catch (e) {
      console.warn('Error loading memorial detail:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Launch celebratory marigold petal confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F3A623', '#ED7047', '#FFF3D8', '#DC6073', '#36775B']
    });
  };

  // Explore Fictional Demo
  const handleExploreDemo = async () => {
    try {
      setIsLoading(true);
      const demoMem = await api.seedDemo();
      await loadData();
      setActiveMemorial(demoMem);
      setActiveMemorialId(demoMem.id);
      setCurrentView('altar');
      triggerCelebration();
    } catch (e) {
      alert('Error loading sample memorial');
    } finally {
      setIsLoading(false);
    }
  };

  // Wizard Completion
  const handleWizardComplete = (newMemorial: Memorial) => {
    setActiveMemorial(newMemorial);
    setActiveMemorialId(newMemorial.id);
    loadData();
    setCurrentView('altar');
    triggerCelebration();
  };

  // Delete memorial
  const handleDeleteMemorial = async (id: string) => {
    try {
      await api.deleteMemorial(id);
      const remaining = memorials.filter(m => m.id !== id);
      setMemorials(remaining);
      if (currentView === 'welcome') {
        if (activeMemorialId === id) {
          setActiveMemorial(null);
          setActiveMemorialId(remaining[0]?.id || null);
        }
        return;
      }
      if (remaining.length > 0) {
        selectMemorial(remaining[0].id, 'altar');
      } else {
        setActiveMemorial(null);
        setActiveMemorialId(null);
        setCurrentView('welcome');
      }
    } catch (e) {
      alert('Failed to delete memorial');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0A0E] text-[#F7EFE2]">
      
      {/* Global Navigation Header */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        memorials={memorials}
        activeMemorialId={activeMemorialId}
        onSelectMemorial={(id) => selectMemorial(id, currentView === 'welcome' ? 'altar' : currentView)}
        onNewMemorial={() => setCurrentView('wizard')}
        aiStatus={aiStatus}
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode(false)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {isLoading && currentView !== 'welcome' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <img src="/artwork/marigold.svg" alt="Loading" className="w-14 h-14 animate-spin opacity-80" />
            <span className="font-serif italic text-sm text-[#713B55]">
              Lighting candles & gathering memories...
            </span>
          </div>
        )}

        {/* 1. Welcome Landing View */}
        {currentView === 'welcome' && (
          <WelcomePage
            onStartWizard={() => setCurrentView('wizard')}
            onExploreDemo={handleExploreDemo}
            memorials={memorials}
            onSelectMemorial={(id) => selectMemorial(id, 'altar')}
            onDeleteMemorial={handleDeleteMemorial}
          />
        )}

        {/* 2. Memorial Creation Wizard */}
        {currentView === 'wizard' && (
          <MemorialWizard
            onComplete={handleWizardComplete}
            onCancel={() => setCurrentView(memorials.length > 0 ? 'altar' : 'welcome')}
          />
        )}

        {/* 3. The Interactive Altar */}
        {currentView === 'altar' && activeMemorial && (
          <AltarView
            memorial={activeMemorial}
            onUpdateMemorial={(updated) => {
              setActiveMemorial(updated);
              setMemorials(memorials.map(m => m.id === updated.id ? { ...m, name: updated.name, theme_settings: updated.theme_settings } : m));
            }}
            onOpenStory={(storyId) => {
              setSelectedStoryId(storyId);
              setCurrentView('stories');
            }}
            onNavigateToRemembrance={() => setCurrentView('remembrance')}
          />
        )}

        {/* 4. AI Remembrance Studio */}
        {currentView === 'remembrance' && activeMemorial && (
          <RemembranceStudio
            memorial={activeMemorial}
            aiStatus={aiStatus}
            onUpdateMemorial={(updated) => {
              setActiveMemorial(updated);
            }}
            onNavigateToSettings={() => setCurrentView('settings')}
          />
        )}

        {/* 5. Family Audio Archive */}
        {currentView === 'stories' && activeMemorial && (
          <StoryArchive
            memorial={activeMemorial}
            selectedStoryId={selectedStoryId}
            onUpdateMemorial={(updated) => {
              setActiveMemorial(updated);
            }}
          />
        )}

        {/* 6. Search & Rediscovery */}
        {currentView === 'search' && (
          <SearchPage
            memorials={memorials}
            activeMemorialId={activeMemorialId}
            onNavigateToItem={(memId, itemId) => {
              selectMemorial(memId, 'altar');
            }}
            onNavigateToStory={(memId, storyId) => {
              setSelectedStoryId(storyId);
              selectMemorial(memId, 'stories');
            }}
          />
        )}

        {/* 7. Settings, Privacy & Model Setup */}
        {currentView === 'settings' && (
          <SettingsPage
            memorial={activeMemorial}
            memorials={memorials}
            aiStatus={aiStatus}
            onRefreshAIStatus={loadData}
            onSelectMemorial={(id) => selectMemorial(id, 'settings')}
            onDeleteMemorial={handleDeleteMemorial}
            onSeedDemo={handleExploreDemo}
          />
        )}
      </main>

      {/* Cultural Respect & Editorial Footer */}
      <footer className="bg-[#100C13] border-t border-[#35283A] py-6 text-center text-xs text-[#9C8E87] no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/artwork/marigold.svg" alt="" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
            <span className="font-serif font-bold text-[#F7EFE2]">Siempre</span>
            <span className="text-[#B8A6B6]">— A Living Digital Ofrenda</span>
          </div>
          <div className="font-serif italic text-[#FFB733]">
            "Some stories deserve to stay."
          </div>
          <div className="text-[#8E7C8E]">
            Private • Local-First • Open-Source AI
          </div>
        </div>
      </footer>

    </div>
  );
};

