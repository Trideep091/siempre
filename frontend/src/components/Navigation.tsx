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
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8D3AC]/70 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('welcome')}
              className="flex items-center gap-2.5 text-left group bg-transparent border-none cursor-pointer p-0"
              title="Return to Welcome"
            >
              <img 
                src="/artwork/marigold.svg" 
                alt="Siempre Marigold" 
                className="w-9 h-9 transform group-hover:rotate-12 transition-transform duration-300" 
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#332A27] block leading-none">
                  Siempre
                </span>
                <span className="text-[11px] font-medium text-[#713B55] tracking-wide block font-serif italic mt-0.5">
                  Some stories deserve to stay.
                </span>
              </div>
            </button>

            {/* Memorial Selector Dropdown */}
            {memorials.length > 0 && (
              <div className="hidden md:flex items-center ml-4 pl-4 border-l border-[#E8D3AC]">
                <select
                  value={activeMemorialId || ''}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      onNewMemorial();
                    } else {
                      onSelectMemorial(e.target.value);
                    }
                  }}
                  className="text-sm font-serif font-medium bg-[#FFF3D8]/60 text-[#332A27] border border-[#E8D3AC] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F3A623] cursor-pointer"
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
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('altar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                currentView === 'altar' 
                  ? 'bg-[#F3A623] text-[#332A27] font-semibold shadow-sm' 
                  : 'text-[#6B5D57] hover:text-[#332A27] hover:bg-[#FFF3D8]'
              }`}
            >
              <Flame size={16} className={currentView === 'altar' ? 'text-[#332A27]' : 'text-[#F3A623]'} />
              The Altar
            </button>

            <button
              onClick={() => onNavigate('remembrance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                currentView === 'remembrance' 
                  ? 'bg-[#713B55] text-white font-semibold shadow-sm' 
                  : 'text-[#6B5D57] hover:text-[#332A27] hover:bg-[#FFF3D8]'
              }`}
            >
              <Sparkles size={16} className={currentView === 'remembrance' ? 'text-white' : 'text-[#DC6073]'} />
              Remembrance Studio
            </button>

            <button
              onClick={() => onNavigate('stories')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                currentView === 'stories' 
                  ? 'bg-[#36775B] text-white font-semibold shadow-sm' 
                  : 'text-[#6B5D57] hover:text-[#332A27] hover:bg-[#FFF3D8]'
              }`}
            >
              <Mic size={16} className={currentView === 'stories' ? 'text-white' : 'text-[#36775B]'} />
              Audio Archive
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                currentView === 'search' 
                  ? 'bg-[#4A9C96] text-white font-semibold shadow-sm' 
                  : 'text-[#6B5D57] hover:text-[#332A27] hover:bg-[#FFF3D8]'
              }`}
            >
              <Search size={16} className={currentView === 'search' ? 'text-white' : 'text-[#4A9C96]'} />
              Search
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                currentView === 'settings' 
                  ? 'bg-[#E8D3AC] text-[#332A27] font-semibold shadow-sm' 
                  : 'text-[#6B5D57] hover:text-[#332A27] hover:bg-[#FFF3D8]'
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
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif bg-[#FFF3D8] border border-[#E8D3AC] text-[#713B55] hover:bg-[#E8D3AC]/50 transition-colors"
                title={aiStatus.ollama_message}
              >
                <span className={`w-2 h-2 rounded-full ${aiStatus.local_inference_ready ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-sans font-medium text-[11px]">
                  {aiStatus.local_inference_ready ? `Ollama (${aiStatus.configured_model})` : 'AI: Offline'}
                </span>
              </button>
            )}

            {/* New Remembrance Button */}
            <button
              onClick={onNewMemorial}
              className="btn btn-primary btn-sm shadow-sm"
            >
              <PlusCircle size={15} />
              <span>Create</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-[#E8D3AC]/50">
          <button
            onClick={() => onNavigate('altar')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'altar' ? 'bg-[#F3A623] text-[#332A27] font-semibold shadow-xs' : 'bg-transparent text-[#6B5D57] hover:bg-[#FFF3D8]'
            }`}
          >
            Altar
          </button>
          <button
            onClick={() => onNavigate('remembrance')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'remembrance' ? 'bg-[#713B55] text-white font-semibold shadow-xs' : 'bg-transparent text-[#6B5D57] hover:bg-[#FFF3D8]'
            }`}
          >
            Remembrance
          </button>
          <button
            onClick={() => onNavigate('stories')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'stories' ? 'bg-[#36775B] text-white font-semibold shadow-xs' : 'bg-transparent text-[#6B5D57] hover:bg-[#FFF3D8]'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'search' ? 'bg-[#4A9C96] text-white font-semibold shadow-xs' : 'bg-transparent text-[#6B5D57] hover:bg-[#FFF3D8]'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-0 ${
              currentView === 'settings' ? 'bg-[#E8D3AC] text-[#332A27] font-semibold shadow-xs' : 'bg-transparent text-[#6B5D57] hover:bg-[#FFF3D8]'
            }`}
          >
            Settings
          </button>
        </div>

      </div>
    </header>
  );
};

