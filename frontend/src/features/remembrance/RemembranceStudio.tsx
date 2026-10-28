import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw, 
  Save, 
  AlertCircle, 
  BookOpen, 
  Info, 
  CheckCircle2, 
  FileText, 
  Sliders, 
  Heart, 
  ExternalLink 
} from 'lucide-react';
import { Memorial, AIStatus } from '../../types';
import { api } from '../../services/api';

interface RemembranceStudioProps {
  memorial: Memorial;
  aiStatus: AIStatus | null;
  onUpdateMemorial: (updated: Memorial) => void;
  onNavigateToSettings: () => void;
}

export const RemembranceStudio: React.FC<RemembranceStudioProps> = ({
  memorial,
  aiStatus,
  onUpdateMemorial,
  onNavigateToSettings
}) => {
  // Selection states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    memorial.items.map(i => i.id)
  );
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>(
    memorial.stories.map(s => s.id)
  );
  const [tone, setTone] = useState<string>('warm');
  const [formatType, setFormatType] = useState<string>('short_remembrance');
  const [useWordsClosely, setUseWordsClosely] = useState<boolean>(false);
  const [additionalContext, setAdditionalContext] = useState<string>('');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>(memorial.remembrance_text || '');
  const [sourcesUsedInfo, setSourcesUsedInfo] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Toggle item selection
  const toggleItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  // Toggle story selection
  const toggleStory = (id: string) => {
    if (selectedStoryIds.includes(id)) {
      setSelectedStoryIds(selectedStoryIds.filter(s => s !== id));
    } else {
      setSelectedStoryIds([...selectedStoryIds, id]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const res = await api.generateRemembrance({
        memorial_id: memorial.id,
        tone,
        format_type: formatType,
        selected_item_ids: selectedItemIds,
        selected_story_ids: selectedStoryIds,
        use_words_closely: useWordsClosely,
        additional_context: additionalContext.trim() || undefined,
      });

      setGeneratedDraft(res.draft);
      setSourcesUsedInfo(res.grounding_notes || `Grounded in ${res.source_items_used.length} notes and ${res.source_stories_used.length} stories.`);
      setModelUsed(res.model_used);
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please check local AI model status.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToMemorial = async () => {
    if (!generatedDraft.trim()) return;
    try {
      const updated = await api.updateMemorial(memorial.id, {
        remembrance_text: generatedDraft.trim()
      });
      onUpdateMemorial(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save remembrance text.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 text-[#F7EFE2]">
      
      {/* Header */}
      <div className="border-b border-[#382C3D] pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#F5A623] mb-1">
              <Sparkles size={18} />
              <span className="font-serif font-bold text-sm tracking-wide uppercase">
                Ethical Remembrance Studio
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#F7EFE2]">
              Preserving Memories for {memorial.name}
            </h1>
            <p className="text-sm text-[#B8A6B6] font-serif italic mt-0.5">
              Drafted strictly from your own family memories. The model never fabricates quotes or pretends to speak for loved ones.
            </p>
          </div>

          {/* AI Connection Status Banner */}
          <div className="bg-[#18131E] border border-[#382C3D] rounded-xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${aiStatus?.local_inference_ready ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} />
            <div className="text-left text-xs">
              <span className="font-bold text-[#F7EFE2] block">
                {aiStatus?.local_inference_ready ? `Ollama (${aiStatus.configured_model}) Ready` : 'Local AI Offline'}
              </span>
              <button
                onClick={onNavigateToSettings}
                className="text-[11px] text-[#F5A623] underline hover:text-[#FFB733] cursor-pointer"
              >
                Model Settings & Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#DC6073]/15 border border-[#DC6073] rounded-xl p-4 mb-6 text-sm text-[#FFA3CF] flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-1">Local AI Engine Unavailable</span>
            <p className="text-xs leading-relaxed">{errorMsg}</p>
            <div className="mt-2 text-xs bg-[#18131E] border border-[#DC6073]/30 p-2.5 rounded font-mono text-[#F7EFE2]">
              Terminal command: <code>ollama run {aiStatus?.configured_model || 'llama3.2:3b'}</code>
            </div>
          </div>
        </div>
      )}

      {/* Studio Workspace: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Source Material & Prompt Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Format & Tone Selection */}
          <div className="paper-card p-5 bg-[#151119] border border-[#382C3D]">
            <h3 className="font-serif font-bold text-base text-[#F7EFE2] mb-3 flex items-center gap-2">
              <Sliders size={16} className="text-[#F5A623]" />
              <span>Format & Emotional Tone</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="form-label text-xs">Composition Type</label>
                <select
                  value={formatType}
                  onChange={(e) => setFormatType(e.target.value)}
                  className="form-select text-xs py-2"
                >
                  <option value="short_remembrance">Short Remembrance (1–2 paragraphs)</option>
                  <option value="tribute">Comprehensive Tribute (3–4 paragraphs)</option>
                  <option value="letter">Letter to the Loved One</option>
                  <option value="family_history">Family-History Narrative</option>
                  <option value="photo_caption">Poetic Photo Album Caption</option>
                  <option value="ceremony_reading">Día de los Muertos Ceremony Reading</option>
                  <option value="memorial_inscription">Concise Plaque Inscription</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Emotional Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'warm', label: 'Warm' },
                    { id: 'reflective', label: 'Reflective' },
                    { id: 'celebratory', label: 'Celebratory' },
                    { id: 'poetic', label: 'Poetic' },
                    { id: 'formal', label: 'Formal' },
                    { id: 'simple', label: 'Simple' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                        tone === t.id
                          ? 'bg-[#F5A623] text-[#0C0A0E] font-bold shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                          : 'bg-[#241B2C] border border-[#3D2E44] text-[#D8C7D8] hover:bg-[#2F233A]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Phrasing Toggle */}
              <div className="pt-2 border-t border-[#382C3D]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWordsClosely}
                    onChange={(e) => setUseWordsClosely(e.target.checked)}
                    className="accent-[#F5A623]"
                  />
                  <span className="text-xs text-[#F7EFE2] font-medium">
                    Use my words more closely (minimal stylistic rewriting)
                  </span>
                </label>
              </div>

              {/* Additional Guidance */}
              <div>
                <label className="form-label text-xs">Special Family Note / Guidance (Optional)</label>
                <input
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g., Focus especially on her cooking and kindness..."
                  className="form-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Source Memories Selection */}
          <div className="paper-card p-5 bg-[#151119] border border-[#382C3D]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-base text-[#F7EFE2] flex items-center gap-2">
                <Heart size={16} className="text-[#E64264]" />
                <span>Source Notes & Memories ({selectedItemIds.length + selectedStoryIds.length} selected)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (selectedItemIds.length > 0) {
                    setSelectedItemIds([]);
                    setSelectedStoryIds([]);
                  } else {
                    setSelectedItemIds(memorial.items.map(i => i.id));
                    setSelectedStoryIds(memorial.stories.map(s => s.id));
                  }
                }}
                className="text-[11px] text-[#F5A623] underline cursor-pointer"
              >
                {selectedItemIds.length > 0 ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <p className="text-xs text-[#B8A6B6] mb-3 leading-relaxed">
              Select which altar items, favorite foods, songs, and audio transcripts the model is allowed to ground into:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {/* Altar Items */}
              {memorial.items.map((it) => (
                <label
                  key={it.id}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedItemIds.includes(it.id)
                      ? 'bg-[#261E18] border-[#F5A623] text-[#F7EFE2]'
                      : 'bg-[#18131E] border-[#382C3D] text-[#8E7C8E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(it.id)}
                    onChange={() => toggleItem(it.id)}
                    className="accent-[#F5A623] mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-serif font-bold block text-[#FFB733]">
                      [{it.item_type}] {it.title}
                    </span>
                    {it.description && (
                      <span className="text-[11px] text-[#B8A6B6] line-clamp-1 block">
                        {it.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {/* Stories */}
              {memorial.stories.map((st) => (
                <label
                  key={st.id}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedStoryIds.includes(st.id)
                      ? 'bg-[#142322] border-[#38A9A0] text-[#71E6DA]'
                      : 'bg-[#18131E] border-[#382C3D] text-[#8E7C8E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStoryIds.includes(st.id)}
                    onChange={() => toggleStory(st.id)}
                    className="accent-[#38A9A0] mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-serif font-bold block text-[#38A9A0]">
                      [Spoken Story] {st.title}
                    </span>
                    {st.transcript && (
                      <span className="text-[11px] text-[#9EECE5] line-clamp-1 block">
                        "{st.transcript}"
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2 shadow-md"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-[#151119] border-t-transparent rounded-full animate-spin" />
                  <span>Weaving Remembrance...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Draft Remembrance</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Draft Editor & Grounding Transparency (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="paper-card p-6 bg-[#151119] border border-[#382C3D]">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#382C3D]">
              <div>
                <span className="badge badge-berry text-[10px]">
                  AI-Generated Remembrance Draft (Editable)
                </span>
                <h3 className="font-serif text-lg font-bold text-[#F7EFE2] mt-1">
                  Draft Composition
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                  title="Copy text"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToMemorial}
                  className="btn btn-primary btn-sm text-xs flex items-center gap-1"
                >
                  {savedSuccess ? <CheckCircle2 size={14} /> : <Save size={14} />}
                  <span>{savedSuccess ? 'Saved to Altar!' : 'Save to Altar'}</span>
                </button>
              </div>
            </div>

            {/* Draft Text Area */}
            <div className="relative">
              <textarea
                rows={14}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder="Click 'Draft Remembrance' on the left to generate a personalized tribute from selected memories, or type freely here..."
                className="form-textarea font-serif text-base text-[#F7EFE2] leading-relaxed p-4 bg-[#18131E] border border-[#382C3D] rounded-xl focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>

            {/* Source Grounding Notes */}
            {sourcesUsedInfo && (
              <div className="mt-3 p-3 rounded-lg bg-[#241B2C] border border-[#382C3D] text-xs text-[#FFB733] flex items-center gap-2">
                <Info size={16} className="shrink-0" />
                <span className="font-serif italic">{sourcesUsedInfo}</span>
                {modelUsed && <span className="ml-auto text-[10px] font-mono opacity-70 text-[#B8A6B6]">Model: {modelUsed}</span>}
              </div>
            )}

            {/* Transparency Guidance Footnote */}
            <p className="text-[11px] text-[#8E7C8E] mt-3 leading-relaxed">
              * Original memories remain safely preserved in the database. Saving updates the headline remembrance tribute displayed on the main altar. You can edit this text at any time.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

