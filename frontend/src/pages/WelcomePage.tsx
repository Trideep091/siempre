import React from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  Heart, 
  Mic, 
  ArrowRight, 
  Eye, 
  Trash2, 
  Flame,
  Skull
} from 'lucide-react';
import { MemorialSummary } from '../types';

interface WelcomePageProps {
  onStartWizard: () => void;
  onExploreDemo: () => void;
  memorials: MemorialSummary[];
  onSelectMemorial: (id: string) => void;
  onDeleteMemorial: (id: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartWizard,
  onExploreDemo,
  memorials,
  onSelectMemorial,
  onDeleteMemorial
}) => {
  const handleDeleteClick = (e: React.MouseEvent, m: MemorialSummary) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove "${m.name}" from your archive? All associated photos and recordings will be deleted.`)) {
      onDeleteMemorial(m.id);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24 bg-[#0C0A0E] text-[#F7EFE2]">
      
      {/* Mystical Background Atmospheric Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F5A623]/10 via-[#9B2D62]/10 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Decorative Papel Picado Banner Header (Glow in the dark) */}
      <div className="w-full relative overflow-hidden pointer-events-none opacity-85 select-none z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
        <img 
          src="/artwork/papel-picado.svg" 
          alt="Papel Picado Garland" 
          className="w-full h-auto min-h-[90px] max-h-[140px] object-cover" 
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 relative z-10">
        
        {/* Botanical Sprigs & Central Glowing Blossom */}
        <div className="flex justify-center items-center gap-3 mb-4">
          <img src="/artwork/botanical-sprig.svg" alt="" className="w-10 h-10 transform -scale-x-100 opacity-60 filter brightness-125" />
          <img 
            src="/artwork/marigold.svg" 
            alt="Golden Cempasúchil" 
            className="w-14 h-14 drop-shadow-[0_0_18px_rgba(245,166,35,0.7)]" 
          />
          <img src="/artwork/botanical-sprig.svg" alt="" className="w-10 h-10 opacity-60 filter brightness-125" />
        </div>

        {/* Hero Identity */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F7EFE2] mb-3 drop-shadow-[0_2px_15px_rgba(245,166,35,0.2)]">
            Siempre
          </h1>
          <p className="font-serif text-2xl sm:text-3xl text-[#FFB733] italic mb-3">
            Some stories deserve to stay.
          </p>
          <p className="text-base sm:text-lg text-[#B8A6B6] max-w-xl mx-auto leading-relaxed mb-8 font-serif">
            A little sanctuary in the quiet dark for the people who will always be with us. A private, living digital ofrenda preserving memories, photographs, recipes, songs, and spoken voices.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={onStartWizard}
              className="btn btn-primary btn-lg shadow-[0_0_20px_rgba(245,166,35,0.4)] flex items-center gap-2.5 w-full sm:w-auto"
            >
              <PlusCircle size={20} />
              <span>Create a Remembrance</span>
            </button>
            <button
              onClick={onExploreDemo}
              className="btn btn-secondary btn-lg flex items-center gap-2 w-full sm:w-auto border-[#3D2E42] hover:border-[#F5A623] hover:text-[#FFB733]"
            >
              <Eye size={19} className="text-[#F5A623]" />
              <span>Explore Sample Memorial</span>
            </button>
          </div>

          {/* Fictional Sample Notice */}
          <p className="text-xs text-[#7E6C7D] italic mb-12">
            * The sample memorial features fictional demo data for "Abuela Elena Rosales" honoring Día de los Muertos ofrenda traditions.
          </p>
        </div>

        {/* Art-Directed Interactive Altar Preview Card (Dark Velvet & Candlelight) */}
        <div className="paper-card p-6 sm:p-10 mb-14 relative bg-[#151119] border-2 border-[#3D2E42] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Subtle Ambient Glowing Marigolds */}
          <img src="/artwork/marigold.svg" alt="" className="absolute -top-6 -left-6 w-20 h-20 opacity-40 pointer-events-none drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]" />
          <img src="/artwork/marigold.svg" alt="" className="absolute -bottom-6 -right-6 w-20 h-20 opacity-40 pointer-events-none drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Visual Altar Centerpiece Teaser */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative group cursor-pointer" onClick={onExploreDemo}>
                <div className="absolute -inset-4 bg-radial from-[#F5A623]/25 via-transparent to-transparent rounded-full filter blur-xl pointer-events-none" />
                <img 
                  src="/artwork/demo-portrait-elena.svg" 
                  alt="Abuela Elena Memorial Portrait" 
                  className="w-56 sm:w-64 h-auto rounded-lg shadow-2xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300 relative z-10"
                />
                
                {/* Candle Overlay */}
                <div className="absolute -bottom-4 -left-4 w-16 h-24 z-20">
                  <img src="/artwork/candle.svg" alt="Candle" className="w-full h-full drop-shadow-[0_0_15px_rgba(245,166,35,0.6)]" />
                </div>

                {/* Food Bowl Overlay */}
                <div className="absolute -bottom-4 -right-4 w-24 h-18 z-20">
                  <img src="/artwork/item-mole-bowl.svg" alt="Mole Poblano" className="w-full h-full drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Feature Description Cards in Dark Velvet */}
            <div className="w-full md:w-1/2 space-y-3.5 text-left">
              <div className="bg-[#1C1622] border border-[#35283A] hover:border-[#F5A623]/50 transition-colors rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] shrink-0 mt-0.5 shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7EFE2]">
                    Every Object Has a Story
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8A6B6] mt-0.5 leading-relaxed">
                    Clicking a photo reveals memories. A clay cazuela reveals a family recipe. A song card plays their favorite melody in the night.
                  </p>
                </div>
              </div>

              <div className="bg-[#1C1622] border border-[#35283A] hover:border-[#2E8560]/50 transition-colors rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#2E8560]/15 border border-[#2E8560]/30 flex items-center justify-center text-[#6FE0AC] shrink-0 mt-0.5 shadow-[0_0_10px_rgba(46,133,96,0.2)]">
                  <Mic size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7EFE2]">
                    Spoken Family Voice Archive
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8A6B6] mt-0.5 leading-relaxed">
                    Record stories in the browser or upload audio. Transcribe locally so authentic laughter and voices are kept alive.
                  </p>
                </div>
              </div>

              <div className="bg-[#1C1622] border border-[#35283A] hover:border-[#9B2D62]/50 transition-colors rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#9B2D62]/15 border border-[#9B2D62]/30 flex items-center justify-center text-[#FFA3CF] shrink-0 mt-0.5 shadow-[0_0_10px_rgba(155,45,98,0.2)]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F7EFE2]">
                    Ethical AI Remembrance Studio
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8A6B6] mt-0.5 leading-relaxed">
                    Powered by local open-weight models (Ollama). AI polishes your tribute but never fabricates quotes or fake memories.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SAVED REMEMBRANCES SECTION (WITH REMOVE OPTION) */}
        {memorials.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame size={18} className="text-[#F5A623]" />
              <h2 className="font-serif text-2xl font-bold text-[#F7EFE2] text-center">
                Saved Remembrances in Your Archive
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memorials.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => onSelectMemorial(m.id)}
                  className="paper-card p-5 cursor-pointer bg-[#17131C] border border-[#382C3D] hover:border-[#F5A623] hover:shadow-[0_8px_24px_rgba(0,0,0,0.8),0_0_20px_rgba(245,166,35,0.15)] transition-all flex flex-col justify-between group rounded-xl relative"
                >
                  <div>
                    {/* Header: Photo, Name & Delete Button */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-16 bg-[#211A27] rounded border border-[#3D2E42] overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                          {m.portrait_path ? (
                            <img src={m.portrait_path} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <img src="/artwork/marigold.svg" alt="" className="w-8 h-8 opacity-70" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#F7EFE2] group-hover:text-[#FFB733] transition-colors leading-tight">
                            {m.name}
                          </h3>
                          {m.relationship_type && (
                            <p className="text-xs text-[#FFB733] font-serif italic mt-0.5">
                              {m.relationship_type}
                            </p>
                          )}
                          {(m.birth_date || m.remembrance_date) && (
                            <p className="text-[11px] text-[#7E6C7D] mt-0.5 font-mono">
                              {m.birth_date || '—'} – {m.remembrance_date || 'Present'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Direct Remove / Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, m)}
                        className="text-[#7E6C7D] hover:text-[#E64264] hover:bg-[#38131C] p-2 rounded-lg transition-colors cursor-pointer"
                        title={`Remove "${m.name}" from archive`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {m.short_description && (
                      <p className="text-xs text-[#B8A6B6] line-clamp-2 mb-3 font-serif leading-relaxed">
                        {m.short_description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7E6C7D] pt-3 border-t border-[#35283A]">
                    <span>{m.item_count} altar items • {m.story_count} stories</span>
                    <span className="flex items-center gap-1 text-[#FFB733] font-medium group-hover:translate-x-1 transition-transform">
                      Open Altar <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local-First Privacy Statement Box in Midnight Velvet */}
        <div className="bg-[#151119] border border-[#35283A] rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-[#2E8560]/20 border border-[#2E8560]/40 flex items-center justify-center text-[#6FE0AC] shrink-0 shadow-[0_0_15px_rgba(46,133,96,0.3)]">
            <ShieldCheck size={26} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-base text-[#F7EFE2]">
              Private, Local-First, and Controlled by You
            </h4>
            <p className="text-xs sm:text-sm text-[#B8A6B6] mt-1 leading-relaxed">
              Your family photos, voice recordings, and memories are kept on your own computer in local storage. 
              No third-party trackers, no cloud surveillance. When local AI models run, inference stays on your machine.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
