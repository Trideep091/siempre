import React from 'react';
import { 
  X, 
  ExternalLink, 
  Mic, 
  Tag, 
  Calendar, 
  Pencil, 
  Trash2, 
  Utensils, 
  Music, 
  Flower2, 
  Gift, 
  Quote, 
  Flame, 
  Camera 
} from 'lucide-react';
import { MemoryItem, Story } from '../../types';

interface ItemDetailModalProps {
  item: MemoryItem;
  story?: Story | null;
  onClose: () => void;
  onEdit: (item: MemoryItem) => void;
  onDelete: (item: MemoryItem) => void;
  onOpenStory?: (storyId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  story,
  onClose,
  onEdit,
  onDelete,
  onOpenStory
}) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'food': return <Utensils size={18} className="text-[#FF5E36]" />;
      case 'song': return <Music size={18} className="text-[#38A9A0]" />;
      case 'flower': return <Flower2 size={18} className="text-[#F5A623]" />;
      case 'candle': return <Flame size={18} className="text-[#F5A623]" />;
      case 'photograph': return <Camera size={18} className="text-[#FFA3CF]" />;
      case 'quote': return <Quote size={18} className="text-[#6FE0AC]" />;
      default: return <Gift size={18} className="text-[#FFA3CF]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in no-print">
      <div 
        className="paper-card w-full max-w-lg bg-[#18131E] border-2 border-[#3D2E42] rounded-2xl shadow-2xl overflow-hidden relative text-[#F7EFE2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#1E1724] border-b border-[#35283A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#130F17] border border-[#3D2E42] flex items-center justify-center shadow-xs">
              {getItemIcon(item.item_type)}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFB733] block">
                {item.item_type.replace('_', ' ')}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#F7EFE2] leading-tight">
                {item.title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#7E6C7D] hover:text-[#F7EFE2] p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Asset Image if available */}
          {item.asset_path && (
            <div className="w-full rounded-xl overflow-hidden border border-[#35283A] bg-[#120E15] flex justify-center p-3 shadow-inner">
              <img 
                src={item.asset_path} 
                alt={item.title} 
                className="max-h-64 object-contain rounded shadow-lg"
              />
            </div>
          )}

          {/* Description / Story Text */}
          {item.description && (
            <div className="bg-[#120E16] p-4 rounded-xl border border-[#35283A] shadow-xs">
              <span className="text-xs font-semibold text-[#FFB733] block mb-1.5">
                The Memory Behind This
              </span>
              <p className="text-sm text-[#F7EFE2] leading-relaxed font-serif whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* External Link (for songs / recipes) */}
          {item.external_link && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#38A9A0]/10 border border-[#38A9A0]/30">
              <div className="flex items-center gap-2 text-xs font-medium text-[#7EE5DC]">
                <Music size={16} />
                <span>Listen to song / Open reference</span>
              </div>
              <a 
                href={item.external_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm text-xs flex items-center gap-1 text-[#7EE5DC] hover:border-[#38A9A0]"
              >
                <span>Open Link</span> <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Linked Family Story & Audio Card */}
          {story && (
            <div className="bg-[#1F1726] border border-[#382C3D] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic size={16} className="text-[#6FE0AC]" />
                  <span className="font-serif font-bold text-sm text-[#F7EFE2]">
                    Linked Spoken Story: {story.title}
                  </span>
                </div>
                {onOpenStory && (
                  <button 
                    onClick={() => onOpenStory(story.id)}
                    className="text-xs text-[#FFB733] font-semibold underline hover:text-white cursor-pointer"
                  >
                    View in Archive
                  </button>
                )}
              </div>

              {story.audio_path && (
                <div className="mt-3">
                  <audio controls className="w-full h-9 rounded" src={story.audio_path} />
                </div>
              )}

              {story.transcript && (
                <p className="text-xs text-[#B8A6B6] font-serif italic mt-2.5 line-clamp-3">
                  "{story.transcript}"
                </p>
              )}
            </div>
          )}

          {/* Tags and Meta */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#35283A]">
            {item.date_period && (
              <span className="inline-flex items-center gap-1 text-xs text-[#B8A6B6] bg-[#221A28] border border-[#3D2E42] px-2.5 py-1 rounded-md">
                <Calendar size={12} /> {item.date_period}
              </span>
            )}
            {item.tags?.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 text-[11px] text-[#FFA3CF] bg-[#9B2D62]/15 border border-[#9B2D62]/30 px-2.5 py-1 rounded-full font-medium">
                <Tag size={10} /> {t}
              </span>
            ))}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#1E1724] px-6 py-3.5 border-t border-[#35283A] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="text-xs text-[#FFA3B5] hover:text-[#E64264] flex items-center gap-1 cursor-pointer font-medium"
          >
            <Trash2 size={14} /> Delete from Altar
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <Pencil size={14} /> Edit Item
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
