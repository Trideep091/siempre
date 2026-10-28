import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Mic, 
  Search, 
  Settings, 
  PlusCircle, 
  Flame, 
  HeartHandshake,
  Eye
} from 'lucide-react';
import { MemorialSummary, AIStatus } from '../types';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  memorials: MemorialSummary[];
  activeMemorialId: string | null;
  onSelectMemorial: (id: string) => void;
  onNewMemorial: () => void;
  aiStatus: AIStatus | null;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  memorials,
  activeMemorialId,
  onSelectMemorial,
  onNewMemorial,
  aiStatus,
  isPreviewMode,
  onTogglePreview
}) => {
  if (isPreviewMode) {
    return (
      <div className="fixed top-4 right-4 z-50 no-print">
        <button 
          onClick={onTogglePreview}
          className="btn btn-secondary shadow-lg flex items-center gap-2 bg-[#FFFDF9] border border-[#E8D3AC] px-4 py-2 rounded-full font-serif text-sm hover:bg-[#FFF3D8]"
        >
          <Eye size={16} /> Exit Altar View
        </button>
      </div>
    );
  }

  const activeMemorial = memorials.find(m => m.id === activeMemorialId);

  return (
    <header className="sticky top-0 z-40 bg-[#120E16]/95 backdrop-blur-md border-b border-[#35283A] shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('welcome')}
              className="flex items-center gap-2.5 text-left group bg-transparent border-0 cursor-pointer p-0"
              title="Return to Welcome"
            >
              <img 
                src="/artwork/marigold.svg" 
                alt="Siempre Marigold" 
                className="w-9 h-9 transform group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]" 
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#F7EFE2] block leading-none">
                  Siempre
                </span>
                <span className="text-[11px] font-medium text-[#FFB733] tracking-wide block font-serif italic mt-0.5">
                  Some stories deserve to stay.
                </span>
              </div>
            </button>

            {/* Memorial Selector Dropdown */}
            {memorials.length > 0 && (
              <div className="hidden md:flex items-center ml-4 pl-4 border-l border-[#35283A]">
                <select
                  value={activeMemorialId || ''}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      onNewMemorial();
                    } else {
                      onSelectMemorial(e.target.value);
                    }
                  }}
                  className="text-sm font-serif font-medium bg-[#1A1420] text-[#F7EFE2] border border-[#3D2E42] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F5A623] cursor-pointer"
                >
                  {memorials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.relationship_type ? `(${m.relationship_type})` : ''}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Remembrance...</option>
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('altar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'altar' 
                  ? 'bg-[#F5A623] text-[#1A0F00] font-bold shadow-[0_0_15px_rgba(245,166,35,0.4)]' 
                  : 'text-[#B8A6B6] hover:text-[#F7EFE2] hover:bg-[#1E1724]'
              }`}
            >
              <Flame size={16} className={currentView === 'altar' ? 'text-[#1A0F00]' : 'text-[#F5A623]'} />
              The Altar
            </button>

            <button
              onClick={() => onNavigate('remembrance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'remembrance' 
                  ? 'bg-[#9B2D62] text-white font-bold shadow-[0_0_15px_rgba(155,45,98,0.4)]' 
                  : 'text-[#B8A6B6] hover:text-[#F7EFE2] hover:bg-[#1E1724]'
              }`}
            >
              <Sparkles size={16} className={currentView === 'remembrance' ? 'text-white' : 'text-[#E64264]'} />
              Remembrance Studio
            </button>

            <button
              onClick={() => onNavigate('stories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'stories' 
                  ? 'bg-[#2E8560] text-white font-bold shadow-[0_0_15px_rgba(46,133,96,0.4)]' 
                  : 'text-[#B8A6B6] hover:text-[#F7EFE2] hover:bg-[#1E1724]'
              }`}
            >
              <Mic size={16} className={currentView === 'stories' ? 'text-white' : 'text-[#2E8560]'} />
              Audio Archive
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'search' 
                  ? 'bg-[#38A9A0] text-white font-bold shadow-[0_0_15px_rgba(56,169,160,0.4)]' 
                  : 'text-[#B8A6B6] hover:text-[#F7EFE2] hover:bg-[#1E1724]'
              }`}
            >
              <Search size={16} className={currentView === 'search' ? 'text-white' : 'text-[#38A9A0]'} />
              Search
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                currentView === 'settings' 
                  ? 'bg-[#35283A] text-[#F7EFE2] font-bold border border-[#523F5A]' 
                  : 'text-[#B8A6B6] hover:text-[#F7EFE2] hover:bg-[#1E1724]'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* AI Status Pill */}
            {aiStatus && (
              <button 
                onClick={() => onNavigate('settings')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif bg-[#18131D] border border-[#3D2E42] text-[#FFB733] hover:bg-[#251D2A] transition-colors"
                title={aiStatus.ollama_message}
              >
                <span className={`w-2 h-2 rounded-full ${aiStatus.local_inference_ready ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-sans font-medium text-[11px]">
                  {aiStatus.local_inference_ready ? `Ollama (${aiStatus.configured_model})` : 'AI: Offline'}
                </span>
              </button>
            )}

            {/* New Remembrance Button */}
            <button
              onClick={onNewMemorial}
              className="btn btn-primary btn-sm shadow-md"
            >
              <PlusCircle size={15} />
              <span>Create</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-[#35283A]">
          <button
            onClick={() => onNavigate('altar')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'altar' ? 'bg-[#F5A623] text-[#1A0F00] font-bold shadow-xs' : 'bg-transparent text-[#B8A6B6] hover:bg-[#1E1724]'
            }`}
          >
            Altar
          </button>
          <button
            onClick={() => onNavigate('remembrance')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'remembrance' ? 'bg-[#9B2D62] text-white font-bold shadow-xs' : 'bg-transparent text-[#B8A6B6] hover:bg-[#1E1724]'
            }`}
          >
            Remembrance
          </button>
          <button
            onClick={() => onNavigate('stories')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'stories' ? 'bg-[#2E8560] text-white font-bold shadow-xs' : 'bg-transparent text-[#B8A6B6] hover:bg-[#1E1724]'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'search' ? 'bg-[#38A9A0] text-white font-bold shadow-xs' : 'bg-transparent text-[#B8A6B6] hover:bg-[#1E1724]'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'settings' ? 'bg-[#35283A] text-[#F7EFE2] font-bold shadow-xs' : 'bg-transparent text-[#B8A6B6] hover:bg-[#1E1724]'
            }`}
          >
            Settings
          </button>
        </div>

      </div>
    </header>
  );
};

