import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Heart, 
  Sparkles, 
  Mic, 
  Palette, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  Plus, 
  Trash2, 
  Music, 
  Utensils, 
  Flower2, 
  Gift, 
  MapPin, 
  Quote, 
  Square, 
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Memorial } from '../../types';

interface MemorialWizardProps {
  onComplete: (memorial: Memorial) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'siempre_wizard_draft_v1';

export const MemorialWizard: React.FC<MemorialWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Person Info
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [remembranceDate, setRemembranceDate] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);

  // Step 2: Written Memories
  const [memories, setMemories] = useState<Array<{ id: string; prompt: string; text: string }>>([
    { id: '1', prompt: 'What is something they always did that made people smile?', text: '' }
  ]);

  // Step 3: Favorites
  const [favorites, setFavorites] = useState<Array<{ id: string; type: string; title: string; note: string; link?: string }>>([
    { id: '1', type: 'food', title: '', note: '' }
  ]);

  // Step 4: Stories & Audio
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [storyTeller, setStoryTeller] = useState('');
  const [storyText, setStoryText] = useState('');
  const [audioFile, setAudioFile] = useState<File | Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  
  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Step 5: Altar styling
  const [palette, setPalette] = useState('warm-marigold');
  const [paperStyle, setPaperStyle] = useState('warm-paper');
  const [layout, setLayout] = useState('traditional-ofrenda');
  const [styleVariant, setStyleVariant] = useState<'diadelosmuertos' | 'general'>('diadelosmuertos');
  const [showPapelPicado, setShowPapelPicado] = useState(true);
  const [showCandles, setShowCandles] = useState(true);
  const [showMarigolds, setShowMarigolds] = useState(true);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.relationship) setRelationship(d.relationship);
        if (d.birthDate) setBirthDate(d.birthDate);
        if (d.remembranceDate) setRemembranceDate(d.remembranceDate);
        if (d.pronouns) setPronouns(d.pronouns);
        if (d.shortDescription) setShortDescription(d.shortDescription);
        if (d.memories && d.memories.length > 0) setMemories(d.memories);
        if (d.favorites && d.favorites.length > 0) setFavorites(d.favorites);
        if (d.storyTitle) setStoryTitle(d.storyTitle);
        if (d.storyDescription) setStoryDescription(d.storyDescription);
        if (d.storyText) setStoryText(d.storyText);
        if (d.palette) setPalette(d.palette);
        if (d.paperStyle) setPaperStyle(d.paperStyle);
        if (d.styleVariant) setStyleVariant(d.styleVariant);
      }
    } catch (e) {
      console.warn('Could not load draft from localStorage', e);
    }
  }, []);

  // Save draft to localStorage on changes
  useEffect(() => {
    const draftData = {
      name, relationship, birthDate, remembranceDate, pronouns, shortDescription,
      memories, favorites, storyTitle, storyDescription, storyText,
      palette, paperStyle, layout, styleVariant
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    } catch {}
  }, [
    name, relationship, birthDate, remembranceDate, pronouns, shortDescription,
    memories, favorites, storyTitle, storyDescription, storyText,
    palette, paperStyle, layout, styleVariant
  ]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handlePortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPortraitFile(file);
      setPortraitPreview(URL.createObjectURL(file));
    }
  };

  // Recording controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable in this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAudioDuration(recordingSeconds);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      // Rough estimate duration from audio element
      const audioEl = new Audio(URL.createObjectURL(file));
      audioEl.onloadedmetadata = () => {
        setAudioDuration(Math.round(audioEl.duration));
      };
    }
  };

  // Submit complete memorial
  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a name for the remembrance.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create Memorial record
      const memorial = await api.createMemorial({
        name: name.trim(),
        relationship_type: relationship.trim() || undefined,
        birth_date: birthDate.trim() || undefined,
        remembrance_date: remembranceDate.trim() || undefined,
        pronouns: pronouns.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        theme_settings: {
          palette,
          paper_style: paperStyle,
          layout,
          style_variant: styleVariant,
          show_papel_picado: showPapelPicado,
          show_candles: showCandles,
          show_marigolds: showMarigolds,
        }
      });

      // 2. Upload Portrait if provided
      if (portraitFile) {
        try {
          await api.uploadPortrait(memorial.id, portraitFile);
        } catch (e) {
          console.warn('Portrait upload notice:', e);
        }
      }

      // 3. Add default candle & marigold items to Altar
      if (showCandles) {
        await api.createItem(memorial.id, {
          item_type: 'candle',
          title: 'Veladora de Esperanza',
          description: 'A glowing vigil candle to illuminate memory and bring peaceful warmth.',
          tier: 'top',
          position_x: 76,
          position_y: 12,
          sort_order: 1
        });
      }

      if (showMarigolds) {
        await api.createItem(memorial.id, {
          item_type: 'flower',
          title: 'Golden Cempasúchil',
          description: 'Traditional marigolds whose radiant color and scent guide memories home.',
          tier: 'base',
          position_x: 50,
          position_y: 84,
          sort_order: 2
        });
      }

      // 4. Add written memories as items
      let sortIdx = 3;
      for (const m of memories) {
        if (m.text.trim()) {
          await api.createItem(memorial.id, {
            item_type: 'written_memory',
            title: m.prompt || 'Cherished Memory',
            description: m.text.trim(),
            tier: 'base',
            position_x: 20 + (sortIdx * 15) % 60,
            position_y: 75,
            sort_order: sortIdx++,
            rotation: (sortIdx % 2 === 0 ? 2 : -2)
          });
        }
      }

      // 5. Add favorites as items
      for (const f of favorites) {
        if (f.title.trim()) {
          await api.createItem(memorial.id, {
            item_type: f.type as any,
            title: f.title.trim(),
            description: f.note.trim() || undefined,
            external_link: f.link?.trim() || undefined,
            tier: 'middle',
            position_x: 25 + (sortIdx * 20) % 55,
            position_y: 45,
            sort_order: sortIdx++,
            rotation: (sortIdx % 2 === 0 ? -1.5 : 1.5)
          });
        }
      }

      // 6. Add story if provided
      if (storyTitle.trim() || storyText.trim() || audioFile) {
        const story = await api.createStory(memorial.id, {
          title: storyTitle.trim() || `Memories of ${name}`,
          description: storyDescription.trim() || undefined,
          teller_name: storyTeller.trim() || undefined,
          transcript: storyText.trim() || undefined,
          audio_duration: audioDuration || undefined
        });

        // Upload audio if recorded
        if (audioFile) {
          try {
            await api.uploadAudio(story.id, audioFile, audioDuration || undefined);
          } catch (e) {
            console.warn('Audio upload notice:', e);
          }
        }
      }

      // Clear draft storage
      localStorage.removeItem(STORAGE_KEY);

      // Fetch fresh complete memorial
      const fresh = await api.getMemorial(memorial.id);
      onComplete(fresh);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save memorial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'The Person', icon: User },
    { num: 2, label: 'Memories', icon: Heart },
    { num: 3, label: 'Their Favorites', icon: Gift },
    { num: 4, label: 'Voice & Stories', icon: Mic },
    { num: 5, label: 'The Altar', icon: Palette },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 text-[#F7EFE2]">
      
      {/* Header & Steps Progress Bar */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-[#F7EFE2]">
          Create a Remembrance
        </h2>
        <p className="text-sm font-serif italic text-[#FFB733] mt-1">
          Draft saved locally in the quiet night. Take your time—every memory matters.
        </p>

        {/* Step Indicators */}
        <div className="flex items-center justify-between max-w-xl mx-auto mt-6 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-[#35283A] -z-0" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className="relative z-10 flex flex-col items-center group cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-[#2E8560] text-white shadow-sm' 
                      : isCurrent 
                        ? 'bg-[#F5A623] text-[#1A0F00] ring-4 ring-[#F5A623]/25 shadow-[0_0_15px_rgba(245,166,35,0.4)] font-bold' 
                        : 'bg-[#18131D] text-[#7E6C7D] border border-[#382C3D]'
                  }`}
                >
                  {isDone ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[11px] font-medium mt-1.5 hidden sm:block ${isCurrent ? 'text-[#FFB733] font-bold' : 'text-[#7E6C7D]'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#E64264]/20 border border-[#E64264] text-[#FFA3B5] rounded-xl p-3.5 mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Body */}
      <div className="paper-card p-6 sm:p-8 bg-[#151119] border-2 border-[#382C3D] rounded-2xl shadow-2xl">
        
        {/* STEP 1: THE PERSON */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#35283A] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
                Step 1: The Person You Are Remembering
              </h3>
              <p className="text-xs text-[#B8A6B6] mt-0.5">
                Exact dates are optional. Enter whatever feels meaningful to you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Portrait Upload / Preview Frame */}
              <div className="w-full sm:w-44 shrink-0 flex flex-col items-center">
                <div className="w-36 h-48 bg-[#120D17] border-2 border-dashed border-[#3D2E42] rounded-lg overflow-hidden flex flex-col items-center justify-center relative shadow-sm group">
                  {portraitPreview ? (
                    <img src={portraitPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3 text-[#7E6C7D]">
                      <Upload size={28} className="mx-auto mb-1 opacity-70" />
                      <span className="text-[11px] font-serif block">Upload Portrait</span>
                      <span className="text-[9px] block text-[#7E6C7D]">(JPG, PNG, WebP)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload photograph"
                  />
                </div>
                {portraitPreview && (
                  <button 
                    type="button" 
                    onClick={() => { setPortraitFile(null); setPortraitPreview(null); }}
                    className="text-[11px] text-[#FFA3B5] hover:text-[#E64264] underline mt-1.5 cursor-pointer"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Personal Fields */}
              <div className="flex-1 space-y-4 w-full">
                <div className="form-group">
                  <label className="form-label">
                    Name or Preferred Name <span className="text-[#DC6073]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Elena Rosales, Papa Joe, Aunt Carmen"
                    className="form-input text-base font-serif"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Relationship (Optional)</label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g., Grandmother, Father, Dear Friend"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pronouns / Address</label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g., she/her, he/him, they/them"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Birth Date or Year</label>
                    <input
                      type="text"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      placeholder="e.g., June 14, 1938 or 1938"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remembrance Date or Year</label>
                    <input
                      type="text"
                      value={remembranceDate}
                      onChange={(e) => setRemembranceDate(e.target.value)}
                      placeholder="e.g., November 2, 2021 or 2021"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">A Few Words Describing Them</label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g., Gardener of marigolds, master of pan de muerto, laughter louder than church bells..."
                    className="form-textarea text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: THE MEMORIES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#382C3D] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
                Step 2: Cherished Memories & Notes
              </h3>
              <p className="text-xs text-[#B8A6B6] mt-0.5">
                Capture the little details: their warmth, sayings, laughter, and lessons.
              </p>
            </div>

            {/* Prompt Selector Pills */}
            <div className="bg-[#1A1420] p-3.5 rounded-xl border border-[#382C3D]">
              <span className="text-xs font-semibold text-[#F5A623] block mb-2">
                Click a prompt to add a new memory note:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'What made people smile?',
                  'A memory you return to often',
                  'What did they teach you?',
                  'What should future generations know?',
                  'A funny habit or phrase they had'
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => {
                      setMemories([...memories, { id: Date.now().toString(), prompt: promptText, text: '' }]);
                    }}
                    className="text-xs bg-[#241B2C] hover:bg-[#F5A623] hover:text-[#0C0A0E] text-[#D8C7D8] border border-[#3D2E44] px-3 py-1.5 rounded-full transition-colors font-serif cursor-pointer"
                  >
                    + {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Memories List */}
            <div className="space-y-4">
              {memories.map((m, idx) => (
                <div key={m.id} className="bg-[#18131E] p-4 rounded-xl border border-[#382C3D] shadow-sm relative group">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={m.prompt}
                      onChange={(e) => {
                        const updated = [...memories];
                        updated[idx].prompt = e.target.value;
                        setMemories(updated);
                      }}
                      placeholder="Prompt / Memory Title"
                      className="font-serif text-sm font-semibold text-[#FFB733] bg-transparent border-b border-transparent hover:border-[#382C3D] focus:border-[#F5A623] outline-none w-3/4"
                    />
                    {memories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMemories(memories.filter(item => item.id !== m.id))}
                        className="text-[#8E7C8E] hover:text-[#E64264] p-1 cursor-pointer transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={m.text}
                    onChange={(e) => {
                      const updated = [...memories];
                      updated[idx].text = e.target.value;
                      setMemories(updated);
                    }}
                    placeholder="Write in your own words..."
                    className="form-textarea text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMemories([...memories, { id: Date.now().toString(), prompt: 'Memory', text: '' }])}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Plus size={15} /> Add Another Memory Note
            </button>
          </div>
        )}

        {/* STEP 3: THEIR FAVORITES */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#382C3D] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
                Step 3: Their Favorites & Keepsakes
              </h3>
              <p className="text-xs text-[#B8A6B6] mt-0.5">
                Every ofrenda includes the things they loved in life—foods, songs, places, and objects.
              </p>
            </div>

            {/* Quick add category buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'food', label: 'Favorite Food', icon: Utensils },
                { type: 'song', label: 'Favorite Song', icon: Music },
                { type: 'flower', label: 'Flower / Plant', icon: Flower2 },
                { type: 'object', label: 'Belonging / Heirloom', icon: Gift },
                { type: 'quote', label: 'Favorite Saying', icon: Quote }
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => {
                      setFavorites([...favorites, { id: Date.now().toString(), type: cat.type, title: '', note: '' }]);
                    }}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Icon size={14} className="text-[#F5A623]" />
                    <span>+ {cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Favorites List */}
            <div className="space-y-4">
              {favorites.map((fav, idx) => (
                <div key={fav.id} className="bg-[#18131E] p-4 rounded-xl border border-[#382C3D] shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <select
                      value={fav.type}
                      onChange={(e) => {
                        const updated = [...favorites];
                        updated[idx].type = e.target.value;
                        setFavorites(updated);
                      }}
                      className="text-xs font-semibold bg-[#241B2C] border border-[#3D2E44] rounded-md px-2.5 py-1 text-[#FFB733]"
                    >
                      <option value="food">🍲 Favorite Food</option>
                      <option value="song">🎵 Favorite Song / Music</option>
                      <option value="flower">🌼 Flower / Botanical</option>
                      <option value="object">🎁 Meaningful Belonging</option>
                      <option value="quote">💬 Sayings / Expressions</option>
                    </select>

                    {favorites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFavorites(favorites.filter(item => item.id !== fav.id))}
                        className="text-[#8E7C8E] hover:text-[#E64264] p-1 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <input
                      type="text"
                      value={fav.title}
                      onChange={(e) => {
                        const updated = [...favorites];
                        updated[idx].title = e.target.value;
                        setFavorites(updated);
                      }}
                      placeholder={fav.type === 'food' ? 'e.g., Mole Poblano, Lemon Pie' : fav.type === 'song' ? 'e.g., Amor Eterno — Juan Gabriel' : 'Title / Item name'}
                      className="form-input text-sm"
                    />
                    {fav.type === 'song' && (
                      <input
                        type="url"
                        value={fav.link || ''}
                        onChange={(e) => {
                          const updated = [...favorites];
                          updated[idx].link = e.target.value;
                          setFavorites(updated);
                        }}
                        placeholder="Music / YouTube link (optional)"
                        className="form-input text-sm"
                      />
                    )}
                  </div>

                  <input
                    type="text"
                    value={fav.note}
                    onChange={(e) => {
                      const updated = [...favorites];
                      updated[idx].note = e.target.value;
                      setFavorites(updated);
                    }}
                    placeholder="Why did this matter to them? (e.g. baked every holiday, sang while driving...)"
                    className="form-input text-xs text-[#B8A6B6]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: STORIES & AUDIO */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#382C3D] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
                Step 4: Spoken Story & Family Voice
              </h3>
              <p className="text-xs text-[#B8A6B6] mt-0.5">
                Record a story using your browser microphone or upload an audio file. You can also write it out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Story Title</label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g., Sunday Afternoons in the Courtyard"
                  className="form-input text-sm"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teller / Narrator</label>
                <input
                  type="text"
                  value={storyTeller}
                  onChange={(e) => setStoryTeller(e.target.value)}
                  placeholder="e.g., Grandson Mateo, Daughter Sofia"
                  className="form-input text-sm"
                />
              </div>
            </div>

            {/* Audio Recording or Upload Box */}
            <div className="bg-[#18131E] border border-[#382C3D] rounded-xl p-5 shadow-sm">
              <span className="text-sm font-semibold text-[#F7EFE2] block mb-3">
                Original Audio Recording
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Live Microphone Recording Button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn btn-secondary flex items-center gap-2 border-[#382C3D] hover:border-[#E64264] hover:text-[#E64264]"
                  >
                    <Mic size={17} className="text-[#E64264]" />
                    <span>Record Voice Note</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn bg-[#DC6073] text-white flex items-center gap-2 animate-pulse"
                    >
                      <Square size={16} fill="white" />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </button>
                    <span className="text-xs text-[#DC6073] font-mono animate-pulse">● Recording active</span>
                  </div>
                )}

                <span className="text-xs text-[#8E7C8E]">— or —</span>

                {/* File Upload Input */}
                <label className="btn btn-outline btn-sm cursor-pointer flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>Upload Audio File (WAV, MP3, M4A)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {audioFile && (
                <div className="mt-3.5 pt-3 border-t border-[#382C3D] flex items-center justify-between text-xs text-[#4ECA96]">
                  <span className="font-medium">
                    ✓ Audio attached {audioDuration ? `(${audioDuration}s)` : ''}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setAudioFile(null); setAudioDuration(null); }}
                    className="text-[#E64264] underline cursor-pointer"
                  >
                    Remove audio
                  </button>
                </div>
              )}
            </div>

            {/* Written Transcript / Story Text */}
            <div className="form-group">
              <label className="form-label">
                Story Text / Transcript (Optional)
              </label>
              <textarea
                rows={4}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Type the story or memory here, or transcribe audio later..."
                className="form-textarea text-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 5: THE ALTAR STYLING */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[#382C3D] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
                Step 5: Altar Style & Traditions
              </h3>
              <p className="text-xs text-[#B8A6B6] mt-0.5">
                Customize the aesthetic of your ofrenda. You can choose traditional Día de los Muertos elements or a serene personal layout.
              </p>
            </div>

            {/* Cultural Style Variant */}
            <div className="form-group">
              <label className="form-label">Remembrance Tradition</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStyleVariant('diadelosmuertos')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    styleVariant === 'diadelosmuertos'
                      ? 'border-[#F5A623] bg-[#241818] shadow-[0_0_15px_rgba(245,166,35,0.15)] ring-1 ring-[#F5A623]'
                      : 'border-[#382C3D] bg-[#18131E] hover:border-[#382C3D]/80'
                  }`}
                >
                  <span className="font-serif font-bold text-sm text-[#F7EFE2] block">
                    🌼 Día de los Muertos Ofrenda
                  </span>
                  <span className="text-xs text-[#B8A6B6] block mt-1">
                    Warm marigolds, papel picado garland, vigils, pan de muerto, and festive vibrant honoring of the journey home.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleVariant('general')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    styleVariant === 'general'
                      ? 'border-[#38A9A0] bg-[#142322] shadow-[0_0_15px_rgba(56,169,160,0.15)] ring-1 ring-[#38A9A0]'
                      : 'border-[#382C3D] bg-[#18131E] hover:border-[#382C3D]/80'
                  }`}
                >
                  <span className="font-serif font-bold text-sm text-[#F7EFE2] block">
                    🕊️ Serene Personal Memorial
                  </span>
                  <span className="text-xs text-[#B8A6B6] block mt-1">
                    Quiet, botanical, and minimalist remembrance focused purely on photographs, quiet candlelight, and written stories.
                  </span>
                </button>
              </div>
            </div>

            {/* Color Palette Selection */}
            <div className="form-group">
              <label className="form-label">Color Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'warm-marigold', label: 'Warm Marigold', hex: '#F5A623' },
                  { id: 'aged-parchment', label: 'Mystic Obsidian', hex: '#3D2E44' },
                  { id: 'night-vigil', label: 'Night Vigil (Berry)', hex: '#9B2D62' },
                  { id: 'botanical-sage', label: 'Spirit Turquoise', hex: '#38A9A0' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.id)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                      palette === p.id 
                        ? 'border-[#F5A623] bg-[#241B2C] shadow-sm font-bold ring-2 ring-[#F5A623]' 
                        : 'border-[#382C3D] bg-[#18131E]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1.5 border border-white/20" style={{ backgroundColor: p.hex }} />
                    <span className="text-xs text-[#F7EFE2]">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Decorative Toggles */}
            <div className="bg-[#18131E] p-4 rounded-xl border border-[#382C3D] space-y-3">
              <span className="text-xs font-semibold text-[#FFB733] block">
                Decorative Altar Elements
              </span>
              <div className="flex flex-wrap gap-4 text-xs text-[#F7EFE2]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPapelPicado}
                    onChange={(e) => setShowPapelPicado(e.target.checked)}
                    className="accent-[#F5A623]"
                  />
                  <span>Papel Picado Banners</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCandles}
                    onChange={(e) => setShowCandles(e.target.checked)}
                    className="accent-[#F5A623]"
                  />
                  <span>Flickering Vigil Candles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMarigolds}
                    onChange={(e) => setShowMarigolds(e.target.checked)}
                    className="accent-[#F5A623]"
                  />
                  <span>Marigold Flowers</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#382C3D]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(s => s - 1)}
              className="btn btn-secondary flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline text-xs"
            >
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !name.trim()) {
                  setErrorMsg('Please provide a name before continuing.');
                  return;
                }
                setErrorMsg(null);
                setCurrentStep(s => s + 1);
              }}
              className="btn btn-primary flex items-center gap-1.5"
            >
              <span>Next</span> <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="btn btn-primary btn-lg shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-[#151119] border-t-transparent rounded-full animate-spin" />
                  <span>Creating Ofrenda...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Enter the Living Altar</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

