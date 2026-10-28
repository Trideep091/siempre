import React from 'react';
import { Sparkles, PlusCircle, ShieldCheck, Heart, Mic, ArrowRight, Eye } from 'lucide-react';
import { MemorialSummary } from '../types';

interface WelcomePageProps {
  onStartWizard: () => void;
  onExploreDemo: () => void;
  memorials: MemorialSummary[];
  onSelectMemorial: (id: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartWizard,
  onExploreDemo,
  memorials,
  onSelectMemorial,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      
      {/* Decorative Papel Picado Banner Header */}
      <div className="w-full relative overflow-hidden pointer-events-none opacity-90 select-none">
        <img 
          src="/artwork/papel-picado.svg" 
          alt="Papel Picado Garland" 
          className="w-full h-auto min-h-[90px] max-h-[140px] object-cover" 
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* Botanical Flourishes */}
        <div className="flex justify-center items-center gap-3 mb-4">
          <img src="/artwork/botanical-sprig.svg" alt="" className="w-10 h-10 transform -scale-x-100 opacity-80" />
          <img src="/artwork/marigold.svg" alt="" className="w-12 h-12" />
          <img src="/artwork/botanical-sprig.svg" alt="" className="w-10 h-10 opacity-80" />
        </div>

        {/* Hero Identity */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#332A27] mb-4">
            Siempre
          </h1>
          <p className="font-serif text-2xl sm:text-3xl text-[#713B55] italic mb-3">
            Some stories deserve to stay.
          </p>
          <p className="text-base sm:text-lg text-[#6B5D57] max-w-xl mx-auto leading-relaxed mb-8">
            A little place for the people who will always be with us. A private, living digital ofrenda preserving memories, photographs, family recipes, favorite songs, and spoken stories.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={onStartWizard}
              className="btn btn-primary btn-lg shadow-md flex items-center gap-2.5 w-full sm:w-auto"
            >
              <PlusCircle size={20} />
              <span>Create a Remembrance</span>
            </button>
            <button
              onClick={onExploreDemo}
              className="btn btn-secondary btn-lg shadow-sm flex items-center gap-2 w-full sm:w-auto border-[#E8D3AC] hover:bg-[#FFF3D8]"
            >
              <Eye size={19} className="text-[#F3A623]" />
              <span>Explore Sample Memorial</span>
            </button>
          </div>

          {/* Fictional Sample Notice */}
          <p className="text-xs text-[#9C8E87] italic mb-10">
            * The sample memorial features fictional demo data for "Abuela Elena Rosales" honoring Mexican ofrenda traditions.
          </p>
        </div>

        {/* Art-Directed Interactive Altar Preview Card */}
        <div className="paper-card p-6 sm:p-10 mb-14 relative bg-[#FFFAEE] border-2 border-[#E8D3AC] rounded-2xl shadow-xl overflow-hidden">
          
          {/* Subtle Corner Marigolds */}
          <img src="/artwork/marigold.svg" alt="" className="absolute -top-6 -left-6 w-20 h-20 opacity-80 pointer-events-none" />
          <img src="/artwork/marigold.svg" alt="" className="absolute -bottom-6 -right-6 w-20 h-20 opacity-80 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Visual Altar Centerpiece Teaser */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative group cursor-pointer" onClick={onExploreDemo}>
                <img 
                  src="/artwork/demo-portrait-elena.svg" 
                  alt="Abuela Elena Memorial Portrait" 
                  className="w-56 sm:w-64 h-auto rounded-lg shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform duration-300"
                />
                
                {/* Candle Overlay */}
                <div className="absolute -bottom-4 -left-4 w-16 h-24">
                  <img src="/artwork/candle.svg" alt="Candle" className="w-full h-full drop-shadow-md" />
                </div>

                {/* Food Bowl Overlay */}
                <div className="absolute -bottom-4 -right-4 w-24 h-18">
                  <img src="/artwork/item-mole-bowl.svg" alt="Mole Poblano" className="w-full h-full drop-shadow-md" />
                </div>
              </div>
            </div>

            {/* Feature Description Cards */}
            <div className="w-full md:w-1/2 space-y-4 text-left">
              <div className="bg-[#FFF3D8]/70 border border-[#E8D3AC] rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#F3A623]/20 flex items-center justify-center text-[#F3A623] shrink-0 mt-0.5">
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#332A27]">
                    Every Object Has a Story
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5D57] mt-0.5">
                    Clicking a photo reveals childhood memories. A bowl of food reveals a family recipe. A song card plays their favorite melody.
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF3D8]/70 border border-[#E8D3AC] rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#36775B]/20 flex items-center justify-center text-[#36775B] shrink-0 mt-0.5">
                  <Mic size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#332A27]">
                    Spoken Family Voice Archive
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5D57] mt-0.5">
                    Record stories directly in the browser or upload audio. Transcribe speech locally so original voices and laughter are never lost.
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF3D8]/70 border border-[#E8D3AC] rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#713B55]/20 flex items-center justify-center text-[#713B55] shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#332A27]">
                    Ethical AI Remembrance Studio
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5D57] mt-0.5">
                    Powered by local open-weight models (Ollama). AI assists your words but never invents fake memories or fabricates quotes.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Existing Saved Memorials (if user has created some) */}
        {memorials.length > 0 && (
          <div className="mb-14">
            <h2 className="font-serif text-2xl font-bold text-[#332A27] text-center mb-6">
              Saved Remembrances in Your Archive
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memorials.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => onSelectMemorial(m.id)}
                  className="paper-card p-5 cursor-pointer hover:border-[#F3A623] transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-14 h-16 bg-[#E8D3AC]/40 rounded border border-[#E8D3AC] overflow-hidden shrink-0 flex items-center justify-center">
                      {m.portrait_path ? (
                        <img src={m.portrait_path} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src="/artwork/marigold.svg" alt="" className="w-8 h-8 opacity-60" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#332A27] group-hover:text-[#713B55] transition-colors leading-tight">
                        {m.name}
                      </h3>
                      {m.relationship_type && (
                        <p className="text-xs text-[#713B55] font-serif italic mt-0.5">
                          {m.relationship_type}
                        </p>
                      )}
                      {(m.birth_date || m.remembrance_date) && (
                        <p className="text-[11px] text-[#9C8E87] mt-0.5">
                          {m.birth_date || '—'} – {m.remembrance_date || 'Present'}
                        </p>
                      )}
                    </div>
                  </div>

                  {m.short_description && (
                    <p className="text-xs text-[#6B5D57] line-clamp-2 mb-3">
                      {m.short_description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#9C8E87] pt-2 border-t border-[#E8D3AC]/50">
                    <span>{m.item_count} altar items • {m.story_count} stories</span>
                    <span className="flex items-center gap-1 text-[#713B55] font-medium group-hover:translate-x-0.5 transition-transform">
                      Open Altar <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local-First Privacy Statement Box */}
        <div className="bg-[#FFFDF9] border border-[#E8D3AC] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-[#36775B]/15 flex items-center justify-center text-[#36775B] shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-base text-[#332A27]">
              Private, Local-First, and Controlled by You
            </h4>
            <p className="text-xs sm:text-sm text-[#6B5D57] mt-1 leading-relaxed">
              Your family photos, voice recordings, and memories are saved on your own computer in local storage. 
              No third-party trackers, no cloud data harvesting. When local AI models are running, inference stays on your machine.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

