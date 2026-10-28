import React, { useState, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Pencil, 
  Sparkles, 
  Plus, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Check, 
  AlertCircle, 
  Upload, 
  Square,
  Link as LinkIcon
} from 'lucide-react';
import { Memorial, Story, MemoryItem } from '../../types';
import { api } from '../../services/api';

interface StoryArchiveProps {
  memorial: Memorial;
  onUpdateMemorial: (updated: Memorial) => void;
  selectedStoryId?: string | null;
}

export const StoryArchive: React.FC<StoryArchiveProps> = ({
  memorial,
  onUpdateMemorial,
  selectedStoryId: initialSelectedId
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(
    initialSelectedId || (memorial.stories.length > 0 ? memorial.stories[0].id : null)
  );

  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [transcribeNotice, setTranscribeNotice] = useState<string | null>(null);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTeller, setNewTeller] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTranscript, setNewTranscript] = useState('');
  const [newAudioFile, setNewAudioFile] = useState<File | Blob | null>(null);
  const [newLinkedItemId, setNewLinkedItemId] = useState('');
  
  // Microphone recording in modal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Audio Player element ref
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const activeStory = memorial.stories.find(s => s.id === selectedStoryId);

  // Handle timestamp click: seek audio player
  const handleSeek = (seconds: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = seconds;
      audioPlayerRef.current.play();
    }
  };

  // Start browser recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setNewAudioFile(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Submit new story
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createStory(memorial.id, {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        teller_name: newTeller.trim() || undefined,
        recording_date: newDate.trim() || undefined,
        transcript: newTranscript.trim() || undefined,
        linked_item_id: newLinkedItemId || undefined
      });

      if (newAudioFile) {
        await api.uploadAudio(created.id, newAudioFile, recordingSeconds || undefined);
      }

      const fresh = await api.getMemorial(memorial.id);
      onUpdateMemorial(fresh);
      setSelectedStoryId(created.id);
      setIsCreatingStory(false);

      // Reset
      setNewTitle('');
      setNewTeller('');
      setNewDate('');
      setNewDescription('');
      setNewTranscript('');
      setNewAudioFile(null);
    } catch (err: any) {
      alert(err.message || 'Error creating story');
    }
  };

  // Delete story
  const handleDeleteStory = async (id: string) => {
    if (!confirm('Permanently delete this story and its audio file?')) return;
    try {
      await api.deleteStory(id);
      const updatedStories = memorial.stories.filter(s => s.id !== id);
      onUpdateMemorial({ ...memorial, stories: updatedStories });
      setSelectedStoryId(updatedStories.length > 0 ? updatedStories[0].id : null);
    } catch (err: any) {
      alert(err.message || 'Error deleting story');
    }
  };

  // Trigger speech recognition
  const handleTranscribe = async (storyId: string) => {
    setIsTranscribing(true);
    setTranscribeNotice(null);
    try {
      const res = await api.transcribeStory(storyId);
      const updatedStories = memorial.stories.map(s => 
        s.id === storyId ? { ...s, transcript: res.transcript, transcript_segments: res.segments, transcription_status: 'completed' as const } : s
      );
      onUpdateMemorial({ ...memorial, stories: updatedStories });
      setTranscribeNotice('Transcription completed successfully.');
    } catch (err: any) {
      setTranscribeNotice(err.message || 'Local speech recognition requires faster-whisper. You can type or edit the transcript manually below.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Summarize transcript with local LLM
  const handleSummarize = async (storyId: string) => {
    setIsSummarizing(true);
    try {
      const res = await api.summarizeStory({ story_id: storyId });
      const updatedStories = memorial.stories.map(s => 
        s.id === storyId ? { ...s, ai_summary: res.summary } : s
      );
      onUpdateMemorial({ ...memorial, stories: updatedStories });
    } catch (err: any) {
      alert(err.message || 'Summarization failed. Check if local Ollama model is available.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Save manual transcript edits
  const handleSaveTranscript = async () => {
    if (!activeStory) return;
    try {
      const updated = await api.updateStory(activeStory.id, {
        transcript: transcriptDraft
      });
      const updatedStories = memorial.stories.map(s => s.id === updated.id ? { ...s, transcript: updated.transcript } : s);
      onUpdateMemorial({ ...memorial, stories: updatedStories });
      setEditingTranscript(false);
    } catch (err: any) {
      alert('Error updating transcript');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D3AC] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#36775B] mb-1">
            <Mic size={18} />
            <span className="font-serif font-bold text-sm tracking-wide uppercase">
              Family Spoken Voice Archive
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#332A27]">
            Stories of {memorial.name}
          </h1>
          <p className="text-sm text-[#6B5D57] font-serif italic mt-0.5">
            Preserving original voice recordings, spoken anecdotes, and timestamped transcripts.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingStory(true)}
          className="btn btn-primary btn-sm flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} /> Record or Add Story
        </button>
      </div>

      {memorial.stories.length === 0 ? (
        <div className="paper-card p-12 text-center bg-[#FFFAEE]">
          <Mic size={40} className="mx-auto text-[#36775B] mb-3 opacity-60" />
          <h3 className="font-serif text-xl font-bold text-[#332A27] mb-2">
            No Stories Recorded Yet
          </h3>
          <p className="text-sm text-[#6B5D57] max-w-md mx-auto mb-6">
            Spoken stories carry laughter, dialects, pauses, and love that text alone cannot capture. Record a memory now.
          </p>
          <button
            onClick={() => setIsCreatingStory(true)}
            className="btn btn-primary btn-sm"
          >
            Record First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Story List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#713B55] block mb-1">
              Archived Recordings ({memorial.stories.length})
            </span>

            {memorial.stories.map((s) => {
              const isSelected = s.id === selectedStoryId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStoryId(s.id);
                    setEditingTranscript(false);
                    setTranscribeNotice(null);
                  }}
                  className={`paper-card p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#36775B] bg-[#FFF3D8] shadow-md ring-2 ring-[#36775B]/20'
                      : 'border-[#E8D3AC] bg-[#FFFDF9] hover:bg-[#FFF3D8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#36775B] flex items-center gap-1">
                      <Mic size={12} />
                      {s.teller_name ? s.teller_name : 'Spoken Memory'}
                    </span>
                    {s.audio_duration && (
                      <span className="text-[10px] text-[#9C8E87] flex items-center gap-0.5">
                        <Clock size={10} /> {Math.round(s.audio_duration)}s
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#332A27] leading-snug">
                    {s.title}
                  </h4>

                  {s.description && (
                    <p className="text-xs text-[#6B5D57] line-clamp-2 mt-1">
                      {s.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E8D3AC]/50 text-[11px] text-[#9C8E87]">
                    <span>{s.recording_date || 'Date unrecorded'}</span>
                    <span className="font-medium text-[#713B55]">
                      {s.transcript ? '✓ Transcript' : 'Audio only'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Story Detail (8 cols) */}
          {activeStory && (
            <div className="lg:col-span-8 space-y-5">
              
              <div className="paper-card p-6 bg-[#FFFAEE]">
                
                {/* Story Title & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D3AC]">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#332A27]">
                      {activeStory.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5D57] mt-1 font-serif">
                      {activeStory.teller_name && (
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-[#36775B]" /> Narrator: {activeStory.teller_name}
                        </span>
                      )}
                      {activeStory.recording_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#36775B]" /> {activeStory.recording_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Audio & Transcript Downloads */}
                  <div className="flex items-center gap-2">
                    {activeStory.transcript && (
                      <a
                        href={`/api/stories/${activeStory.id}/download-transcript`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                        title="Download transcript markdown"
                      >
                        <Download size={13} />
                        <span>Transcript</span>
                      </a>
                    )}
                    {activeStory.audio_path && (
                      <a
                        href={`/api/stories/${activeStory.id}/download-audio`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                        title="Download original recording"
                      >
                        <Download size={13} />
                        <span>Audio</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteStory(activeStory.id)}
                      className="text-[#DC6073] hover:text-[#9C2738] p-1.5"
                      title="Delete story"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {activeStory.description && (
                  <p className="text-xs sm:text-sm text-[#6B5D57] italic my-3 leading-relaxed">
                    "{activeStory.description}"
                  </p>
                )}

                {/* Original Audio Player */}
                {activeStory.audio_path ? (
                  <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D3AC] my-4 shadow-xs">
                    <span className="text-xs font-semibold text-[#36775B] block mb-2">
                      Original Audio Player
                    </span>
                    <audio
                      ref={audioPlayerRef}
                      controls
                      src={activeStory.audio_path}
                      className="w-full h-10 rounded"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-[#FFF3D8] rounded-lg text-xs text-[#713B55] my-4">
                    No audio file uploaded for this story.
                  </div>
                )}

                {/* AI Story Summary */}
                {activeStory.ai_summary ? (
                  <div className="bg-[#FFF3D8]/80 border border-[#E8D3AC] p-4 rounded-xl my-4">
                    <span className="text-[11px] uppercase font-bold text-[#713B55] tracking-wider block mb-1">
                      Narrative Summary
                    </span>
                    <p className="text-xs sm:text-sm font-serif text-[#332A27] leading-relaxed">
                      {activeStory.ai_summary}
                    </p>
                  </div>
                ) : activeStory.transcript ? (
                  <button
                    onClick={() => handleSummarize(activeStory.id)}
                    disabled={isSummarizing}
                    className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 my-3"
                  >
                    <Sparkles size={13} className="text-[#713B55]" />
                    <span>{isSummarizing ? 'Generating summary...' : 'Generate AI Summary'}</span>
                  </button>
                ) : null}

                {/* Transcription Notice / Error Box */}
                {transcribeNotice && (
                  <div className="bg-[#FFF3D8] border border-[#E8D3AC] p-3 rounded-lg text-xs text-[#713B55] my-3">
                    {transcribeNotice}
                  </div>
                )}

                {/* Transcript Section */}
                <div className="mt-6 pt-4 border-t border-[#E8D3AC]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif font-bold text-base text-[#332A27] flex items-center gap-2">
                      <FileText size={16} className="text-[#36775B]" />
                      <span>Transcript</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      {activeStory.audio_path && !activeStory.transcript && (
                        <button
                          onClick={() => handleTranscribe(activeStory.id)}
                          disabled={isTranscribing}
                          className="btn btn-primary btn-sm text-xs flex items-center gap-1"
                        >
                          <Sparkles size={13} />
                          <span>{isTranscribing ? 'Transcribing...' : 'Run Local Speech-to-Text'}</span>
                        </button>
                      )}

                      {!editingTranscript ? (
                        <button
                          onClick={() => {
                            setTranscriptDraft(activeStory.transcript || '');
                            setEditingTranscript(true);
                          }}
                          className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTranscript(false)}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveTranscript}
                            className="btn btn-primary btn-sm text-xs flex items-center gap-1"
                          >
                            <Check size={13} /> Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingTranscript ? (
                    <textarea
                      rows={8}
                      value={transcriptDraft}
                      onChange={(e) => setTranscriptDraft(e.target.value)}
                      className="form-textarea font-serif text-sm leading-relaxed p-3"
                      placeholder="Type or paste the transcript here..."
                    />
                  ) : activeStory.transcript ? (
                    <div className="space-y-4">
                      {/* Timestamped Interactive Segments (if available) */}
                      {activeStory.transcript_segments && activeStory.transcript_segments.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[11px] text-[#9C8E87] italic block mb-1">
                            Click any timestamp to jump to that moment in the recording:
                          </span>
                          {activeStory.transcript_segments.map((seg, idx) => {
                            const min = Math.floor(seg.start / 60);
                            const sec = Math.floor(seg.start % 60);
                            const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                            return (
                              <div
                                key={idx}
                                onClick={() => handleSeek(seg.start)}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#FFF3D8] transition-colors cursor-pointer group"
                              >
                                <span className="font-mono text-xs font-bold text-[#36775B] bg-[#36775B]/10 px-2 py-0.5 rounded shrink-0 group-hover:bg-[#36775B] group-hover:text-white transition-colors">
                                  {timeStr}
                                </span>
                                <p className="text-xs sm:text-sm font-serif text-[#332A27] leading-relaxed">
                                  {seg.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E8D3AC] font-serif text-sm text-[#332A27] leading-relaxed whitespace-pre-line">
                          {activeStory.transcript}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#9C8E87] font-serif italic bg-[#FFFDF9] rounded-xl border border-dashed border-[#E8D3AC]">
                      No transcript yet. Click "Run Local Speech-to-Text" or "Edit" to type notes.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal: Record / Add New Story */}
      {isCreatingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in no-print">
          <div className="paper-card w-full max-w-lg bg-[#FFFAEE] border-2 border-[#E8D3AC] rounded-2xl shadow-2xl p-6">
            <h3 className="font-serif text-xl font-bold text-[#332A27] mb-4">
              Record or Add Family Story
            </h3>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="form-label">Story Title <span className="text-[#DC6073]">*</span></label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., The Story of the Lemon Drops"
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Teller / Narrator</label>
                  <input
                    type="text"
                    value={newTeller}
                    onChange={(e) => setNewTeller(e.target.value)}
                    placeholder="e.g., Carlos (Grandson)"
                    className="form-input text-sm"
                  />
                </div>
                <div>
                  <label className="form-label">Date Recorded</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g., October 2024"
                    className="form-input text-sm"
                  />
                </div>
              </div>

              {/* Audio Recording / Upload */}
              <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D3AC]">
                <span className="text-xs font-semibold text-[#36775B] block mb-2">
                  Voice Recording
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5 text-[#DC6073]"
                    >
                      <Mic size={14} /> Record Live
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn bg-[#DC6073] text-white btn-sm flex items-center gap-1.5 animate-pulse"
                    >
                      <Square size={13} fill="white" /> Stop ({recordingSeconds}s)
                    </button>
                  )}

                  <label className="btn btn-outline btn-sm text-xs cursor-pointer flex items-center gap-1">
                    <Upload size={13} /> Upload File
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewAudioFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {newAudioFile && (
                  <p className="text-xs text-[#36775B] mt-2 font-medium">
                    ✓ Audio file attached ready to save.
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Story Text / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={newTranscript}
                  onChange={(e) => setNewTranscript(e.target.value)}
                  placeholder="Type notes or transcription here..."
                  className="form-textarea text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8D3AC]">
                <button
                  type="button"
                  onClick={() => setIsCreatingStory(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save to Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

