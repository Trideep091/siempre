import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Utensils, 
  Music, 
  Flower2, 
  Gift, 
  Quote, 
  Flame, 
  Camera, 
  FileText 
} from 'lucide-react';
import { MemoryItem, AltarItemType, AltarTier, Story } from '../../types';

interface ItemFormModalProps {
  memorialId: string;
  item?: MemoryItem | null;
  stories: Story[];
  onSave: (itemData: Partial<MemoryItem>, assetFile?: File) => Promise<void>;
  onClose: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  memorialId,
  item,
  stories,
  onSave,
  onClose
}) => {
  const isEditing = !!item;

  const [itemType, setItemType] = useState<AltarItemType>(item?.item_type || 'food');
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [tier, setTier] = useState<AltarTier>(item?.tier || 'middle');
  const [externalLink, setExternalLink] = useState(item?.external_link || '');
  const [datePeriod, setDatePeriod] = useState(item?.date_period || '');
  const [tagsStr, setTagsStr] = useState(item?.tags ? item.tags.join(', ') : '');
  const [storyId, setStoryId] = useState(item?.story_id || '');
  
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(item?.asset_path || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAssetFile(file);
      setAssetPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this item.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await onSave({
        memorial_id: memorialId,
        item_type: itemType,
        title: title.trim(),
        description: description.trim() || undefined,
        tier,
        external_link: externalLink.trim() || undefined,
        date_period: datePeriod.trim() || undefined,
        tags,
        story_id: storyId || undefined,
      }, assetFile || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const types: Array<{ type: AltarItemType; label: string; icon: any }> = [
    { type: 'food', label: 'Favorite Food', icon: Utensils },
    { type: 'song', label: 'Song / Music', icon: Music },
    { type: 'photograph', label: 'Photograph', icon: Camera },
    { type: 'object', label: 'Keepsake / Belonging', icon: Gift },
    { type: 'written_memory', label: 'Written Memory', icon: FileText },
    { type: 'flower', label: 'Flower', icon: Flower2 },
    { type: 'candle', label: 'Vigil Candle', icon: Flame },
    { type: 'quote', label: 'Saying / Quote', icon: Quote },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in no-print">
      <div 
        className="paper-card w-full max-w-xl bg-[#18131E] border-2 border-[#3D2E42] rounded-2xl shadow-2xl overflow-hidden text-[#F7EFE2]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1E1724] border-b border-[#35283A] px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[#F7EFE2]">
            {isEditing ? 'Edit Altar Item' : 'Add an Item to the Ofrenda'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-[#7E6C7D] hover:text-[#F7EFE2] p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-[#E64264]/20 border border-[#E64264] text-[#FFA3B5] p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Item Type Picker */}
          <div>
            <label className="form-label">Item Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                const isSelected = itemType === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setItemType(t.type)}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F5A623] bg-[#2A1F13] text-[#FFB733] font-bold ring-2 ring-[#F5A623]/30 shadow-[0_0_12px_rgba(245,166,35,0.2)]'
                        : 'border-[#382C3D] bg-[#141018] text-[#B8A6B6] hover:bg-[#1E1724]'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-[#FF5E36]' : 'text-[#7E6C7D]'} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Title <span className="text-[#E64264]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Abuela's Mole Poblano, Amor Eterno, Singer Sewing Machine"
              className="form-input text-sm"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">The Story or Memory Behind It</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why was this meaningful? What did they say or do with this item?"
              className="form-textarea text-sm"
            />
          </div>

          {/* Tier and Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Altar Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as AltarTier)}
                className="form-select text-sm cursor-pointer"
              >
                <option value="top">Top Tier (Portraits & Vigils)</option>
                <option value="middle">Middle Tier (Foods, Songs, Objects)</option>
                <option value="base">Base Tier (Flowers & Memory Slips)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Date or Period (Optional)</label>
              <input
                type="text"
                value={datePeriod}
                onChange={(e) => setDatePeriod(e.target.value)}
                placeholder="e.g., Autumn 1964, Holidays"
                className="form-input text-sm"
              />
            </div>
          </div>

          {/* Image / Asset Upload */}
          <div className="form-group">
            <label className="form-label">Photograph or Artifact Image (Optional)</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#120D17] border border-[#382C3D] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                {assetPreview ? (
                  <img src={assetPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={22} className="text-[#7E6C7D]" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAssetChange}
                  className="text-xs text-[#B8A6B6] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#F5A623] file:text-[#1A0F00] file:font-semibold hover:file:bg-[#FFAE2B] cursor-pointer"
                />
                <span className="text-[11px] text-[#7E6C7D] block mt-1">
                  Upload an authentic photo of the food, object, or person.
                </span>
              </div>
            </div>
          </div>

          {/* External Link */}
          {itemType === 'song' && (
            <div className="form-group">
              <label className="form-label">Music / Audio Link (YouTube, Spotify, etc.)</label>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://..."
                className="form-input text-sm"
              />
            </div>
          )}

          {/* Linked Family Story */}
          {stories.length > 0 && (
            <div className="form-group">
              <label className="form-label">Link to a Spoken Voice Story (Optional)</label>
              <select
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                className="form-select text-sm cursor-pointer"
              >
                <option value="">— None —</option>
                {stories.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.title} {st.teller_name ? `(${st.teller_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g., recipe, garden, favorite, childhood"
              className="form-input text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#35283A]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add to Altar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
