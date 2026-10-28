import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Mic, 
  Folder, 
  HardDrive, 
  Check, 
  AlertTriangle,
  Info,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Memorial, MemorialSummary, AIStatus } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  memorial: Memorial | null;
  memorials: MemorialSummary[];
  aiStatus: AIStatus | null;
  onRefreshAIStatus: () => void;
  onSelectMemorial: (id: string) => void;
  onDeleteMemorial: (id: string) => void;
  onSeedDemo: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  memorial,
  memorials,
  aiStatus,
  onRefreshAIStatus,
  onSelectMemorial,
  onDeleteMemorial,
  onSeedDemo,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger JSON download
  const handleExportJSON = async () => {
    if (!memorial) return;
    setIsExporting(true);
    try {
      const data = await api.exportMemorial(memorial.id);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `siempre_memorial_${memorial.name.toLowerCase().replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Failed to export memorial JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!memorial) return;
    if (confirm(`Are you absolutely sure you want to delete the memorial for "${memorial.name}" and all its photos and audio recordings? This cannot be undone.`)) {
      onDeleteMemorial(memorial.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
      
      {/* Header */}
      <div className="border-b border-[#E8D3AC] pb-4 mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#332A27]">
          Privacy, Storage & AI Settings
        </h1>
        <p className="text-sm text-[#6B5D57] font-serif italic mt-0.5">
          Everything in Siempre is stored locally on your device. Control your models, backups, and data.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* 1. Open-Source AI Inference Status */}
        <div className="paper-card p-6 bg-[#FFFAEE]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8D3AC]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#713B55]" />
              <h2 className="font-serif font-bold text-lg text-[#332A27]">
                Local AI Model Transparency
              </h2>
            </div>
            <button
              onClick={onRefreshAIStatus}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
            >
              <RefreshCw size={13} /> Check Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ollama LLM Status */}
            <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E8D3AC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#332A27]">
                  Local LLM Engine (Ollama)
                </span>
                <span className={`badge ${aiStatus?.ollama_available ? 'badge-botanical' : 'badge-coral'}`}>
                  {aiStatus?.ollama_available ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              <p className="text-xs text-[#6B5D57] leading-relaxed">
                {aiStatus?.ollama_message || 'Checking local Ollama connection...'}
              </p>

              <div className="text-[11px] font-mono bg-[#FFF3D8] p-2.5 rounded text-[#332A27] space-y-1">
                <div>URL: {aiStatus?.ollama_url || 'http://localhost:11434'}</div>
                <div>Configured Model: {aiStatus?.configured_model || 'llama3.2:3b'}</div>
                <div>Model Installed: {aiStatus?.model_installed ? '✓ Yes' : '✗ Not pulled yet'}</div>
              </div>

              {!aiStatus?.ollama_available && (
                <div className="mt-2 text-xs text-[#713B55] bg-[#713B55]/10 p-2.5 rounded space-y-1">
                  <span className="font-bold flex items-center gap-1"><Terminal size={12} /> Setup Instructions:</span>
                  <p>1. Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline font-bold">ollama.com</a></p>
                  <p>2. Open your terminal and run: <code>ollama run {aiStatus?.configured_model || 'llama3.2:3b'}</code></p>
                  <p>3. Refresh status above. Siempre will detect it automatically.</p>
                </div>
              )}
            </div>

            {/* Whisper Speech Recognition Status */}
            <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E8D3AC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#332A27]">
                  Speech Recognition (faster-whisper)
                </span>
                <span className={`badge ${aiStatus?.whisper_available ? 'badge-botanical' : 'badge-coral'}`}>
                  {aiStatus?.whisper_available ? 'Ready' : 'Not Installed'}
                </span>
              </div>

              <p className="text-xs text-[#6B5D57] leading-relaxed">
                {aiStatus?.whisper_status_detail}
              </p>

              <div className="text-[11px] font-mono bg-[#FFF3D8] p-2.5 rounded text-[#332A27] space-y-1">
                <div>Engine: {aiStatus?.whisper_engine || 'faster-whisper'}</div>
                <div>Model Size: {aiStatus?.whisper_model_size || 'base'}</div>
                <div>Manual Transcript Editing: Always Enabled</div>
              </div>

              <div className="text-xs text-[#6B5D57] pt-1">
                <span className="font-semibold block text-[#332A27]">Note on audio privacy:</span>
                Audio files are always saved safely on your device regardless of whether whisper is installed. You can type transcripts manually or download recordings.
              </div>
            </div>

          </div>
        </div>

        {/* 2. Data Export & Print */}
        <div className="paper-card p-6 bg-[#FFFAEE]">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E8D3AC]">
            <Download size={18} className="text-[#36775B]" />
            <h2 className="font-serif font-bold text-lg text-[#332A27]">
              Preserve & Export Data
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#6B5D57] mb-6 leading-relaxed">
            Your family archive belongs to you. You can export complete structured JSON data containing all memories, altar positions, recipes, and transcripts, or print a formatted remembrance keepsake.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExportJSON}
              disabled={!memorial || isExporting}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export Complete Memorial JSON'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer size={16} />
              <span>Print or Save to PDF</span>
            </button>
          </div>
        </div>

        {/* 3. Storage Locations & Privacy Architecture */}
        <div className="paper-card p-6 bg-[#FFFAEE]">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E8D3AC]">
            <HardDrive size={18} className="text-[#4A9C96]" />
            <h2 className="font-serif font-bold text-lg text-[#332A27]">
              Local Storage Locations
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#6B5D57]">
            <div className="p-3 bg-[#FFFDF9] rounded-lg border border-[#E8D3AC] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#332A27] block">SQLite Database File</span>
                <span className="font-mono text-xs text-[#9C8E87]">backend/data/siempre.db</span>
              </div>
              <span className="text-[11px] font-semibold text-[#36775B]">Encapsulated Local</span>
            </div>

            <div className="p-3 bg-[#FFFDF9] rounded-lg border border-[#E8D3AC] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#332A27] block">Original Media Directory (Portraits, Audio, Photos)</span>
                <span className="font-mono text-xs text-[#9C8E87]">backend/data/media/</span>
              </div>
              <span className="text-[11px] font-semibold text-[#36775B]">Filesystem Stored</span>
            </div>
          </div>
        </div>

        {/* 4. Memorial Management & Fictional Demo */}
        <div className="paper-card p-6 bg-[#FFFAEE]">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E8D3AC]">
            <Info size={18} className="text-[#713B55]" />
            <h2 className="font-serif font-bold text-lg text-[#332A27]">
              Memorial Management
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FFFDF9] rounded-xl border border-[#E8D3AC]">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#332A27]">
                  Fictional Demonstration Ofrenda
                </h3>
                <p className="text-xs text-[#6B5D57] mt-0.5">
                  Reload the sample memorial for "Abuela Elena Rosales" with traditional mole, songs, and courtyard audio.
                </p>
              </div>
              <button
                onClick={onSeedDemo}
                className="btn btn-secondary btn-sm text-xs shrink-0"
              >
                Restore Demo Memorial
              </button>
            </div>

            {memorial && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#DC6073]/10 rounded-xl border border-[#DC6073]/30">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#9C2738]">
                    Delete Current Memorial ({memorial.name})
                  </h3>
                  <p className="text-xs text-[#6B5D57] mt-0.5">
                    Permanently deletes this memorial and cleans up its portraits, photos, and voice recordings from disk.
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="btn bg-[#DC6073] hover:bg-[#9C2738] text-white btn-sm text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete Memorial
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

