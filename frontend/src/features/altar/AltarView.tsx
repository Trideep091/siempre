import React, { useState } from 'react';
import { 
  Plus, 
  Flame, 
  Eye, 
  EyeOff, 
  Music, 
  Utensils, 
  Flower2, 
  Gift, 
  Quote, 
  Camera, 
  FileText, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  Printer,
  Sparkles
} from 'lucide-react';
import { Memorial, MemoryItem, AltarTier } from '../../types';
import { ItemDetailModal } from './ItemDetailModal';
import { ItemFormModal } from './ItemFormModal';
import { api } from '../../services/api';

interface AltarViewProps {
  memorial: Memorial;
  onUpdateMemorial: (updated: Memorial) => void;
  onOpenStory: (storyId: string) => void;
  onNavigateToRemembrance: () => void;
}

export const AltarView: React.FC<AltarViewProps> = ({
  memorial,
  onUpdateMemorial,
  onOpenStory,
  onNavigateToRemembrance
}) => {
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCustomizingTheme, setIsCustomizingTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const theme = memorial.theme_settings;

  // Filter items by tier
  const topItems = memorial.items.filter(i => i.tier === 'top');
  const middleItems = memorial.items.filter(i => i.tier === 'middle');
  const baseItems = memorial.items.filter(i => i.tier === 'base' || !i.tier);

  // Handle item deletion
  const handleDeleteItem = async (item: MemoryItem) => {
    if (!confirm(`Remove "${item.title}" from the altar?`)) return;
    try {
      setSaveStatus('saving');
      await api.deleteItem(item.id);
      const updatedItems = memorial.items.filter(i => i.id !== item.id);
      onUpdateMemorial({ ...memorial, items: updatedItems });
      setSelectedItem(null);
      setSaveStatus('saved');
    } catch (e) {
      alert('Failed to delete item.');
      setSaveStatus('unsaved');
    }
  };

  // Handle item save (create or update)
  const handleSaveItem = async (itemData: Partial<MemoryItem>, assetFile?: File) => {
    setSaveStatus('saving');
    try {
      if (editingItem) {
        let updated = await api.updateItem(editingItem.id, itemData);
        if (assetFile) {
          const res = await api.uploadItemAsset(editingItem.id, assetFile);
          updated.asset_path = res.asset_path;
        }
        const updatedItems = memorial.items.map(i => i.id === updated.id ? updated : i);
        onUpdateMemorial({ ...memorial, items: updatedItems });
      } else {
        let created = await api.createItem(memorial.id, itemData);
        if (assetFile) {
          const res = await api.uploadItemAsset(created.id, assetFile);
          created.asset_path = res.asset_path;
        }
        onUpdateMemorial({ ...memorial, items: [...memorial.items, created] });
      }
      setSaveStatus('saved');
      setEditingItem(null);
      setIsAddingItem(false);
    } catch (e: any) {
      alert(e.message || 'Error saving item.');
      setSaveStatus('unsaved');
    }
  };

  // Handle tier shift for accessible layout reorganization
  const handleShiftTier = async (item: MemoryItem, direction: 'up' | 'down') => {
    const tierOrder: AltarTier[] = ['top', 'middle', 'base'];
    const currentIdx = tierOrder.indexOf(item.tier || 'middle');
    const newIdx = direction === 'up' ? Math.max(0, currentIdx - 1) : Math.min(2, currentIdx + 1);
    if (newIdx === currentIdx) return;

    const newTier = tierOrder[newIdx];
    try {
      setSaveStatus('saving');
      const updated = await api.updateItem(item.id, { tier: newTier });
      const updatedItems = memorial.items.map(i => i.id === updated.id ? updated : i);
      onUpdateMemorial({ ...memorial, items: updatedItems });
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('unsaved');
    }
  };

  // Handle theme changes
  const handleUpdateTheme = async (partialTheme: Partial<typeof memorial.theme_settings>) => {
    setSaveStatus('saving');
    try {
      const newSettings = { ...memorial.theme_settings, ...partialTheme };
      const updated = await api.updateMemorial(memorial.id, { theme_settings: newSettings });
      onUpdateMemorial(updated);
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('unsaved');
    }
  };

  const getItemVisual = (item: MemoryItem) => {
    switch (item.item_type) {
      case 'candle':
        return (
          <div className="flex flex-col items-center p-3 cursor-pointer group">
            <div className="w-16 h-24 transform group-hover:scale-105 transition-transform">
              <img src="/artwork/candle.svg" alt="Candle" className="w-full h-full drop-shadow-md" />
            </div>
            <span className="text-xs font-serif font-bold text-[#713B55] mt-1 text-center leading-tight">
              {item.title}
            </span>
          </div>
        );

      case 'flower':
        return (
          <div className="flex flex-col items-center p-3 cursor-pointer group">
            <div className="w-16 h-16 transform group-hover:rotate-12 transition-transform">
              <img src="/artwork/marigold.svg" alt="Marigold" className="w-full h-full drop-shadow-sm" />
            </div>
            <span className="text-xs font-serif font-bold text-[#D35400] mt-1 text-center">
              {item.title}
            </span>
          </div>
        );

      case 'photograph':
        return (
          <div 
            className="polaroid-card max-w-[200px] cursor-pointer group"
            style={{ transform: `rotate(${item.rotation || 0}deg)` }}
          >
            <div className="w-full h-32 bg-[#E8D3AC]/30 rounded overflow-hidden flex items-center justify-center border border-[#E8D3AC]/50">
              {item.asset_path ? (
                <img src={item.asset_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
              ) : (
                <Camera size={32} className="text-[#9C8E87]" />
              )}
            </div>
            <p className="font-hand text-base text-[#332A27] mt-2 text-center line-clamp-1">
              {item.title}
            </p>
          </div>
        );

      case 'food':
        return (
          <div 
            className="paper-card p-3 max-w-[210px] bg-[#FFFDF9] cursor-pointer group border-[#E8D3AC] hover:border-[#ED7047]"
            style={{ transform: `rotate(${item.rotation || 0}deg)` }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Utensils size={15} className="text-[#ED7047]" />
              <span className="text-[10px] uppercase font-bold text-[#ED7047] tracking-wider">Favorite Dish</span>
            </div>
            {item.asset_path ? (
              <div className="w-full h-24 mb-2 rounded overflow-hidden bg-[#FFF8E7] border border-[#E8D3AC]/40 flex items-center justify-center">
                <img src={item.asset_path} alt={item.title} className="max-h-full object-contain" />
              </div>
            ) : null}
            <h4 className="font-serif font-bold text-sm text-[#332A27] group-hover:text-[#ED7047] transition-colors leading-tight">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-[#6B5D57] font-serif italic mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        );

      case 'song':
        return (
          <div 
            className="paper-card p-3 max-w-[210px] bg-[#FFFDF9] cursor-pointer group border-[#E8D3AC] hover:border-[#4A9C96]"
            style={{ transform: `rotate(${item.rotation || 0}deg)` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#4A9C96] tracking-wider">
                <Music size={14} />
                <span>Song</span>
              </div>
              {item.external_link && <ExternalLink size={12} className="text-[#4A9C96]" />}
            </div>
            <h4 className="font-serif font-bold text-sm text-[#332A27] group-hover:text-[#4A9C96] transition-colors leading-tight">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-[#6B5D57] mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        );

      case 'written_memory':
      case 'quote':
        return (
          <div 
            className="paper-card p-4 max-w-[220px] bg-[#FFF9E6] border-dashed border-[#E8D3AC] cursor-pointer group shadow-sm"
            style={{ transform: `rotate(${item.rotation || 0}deg)` }}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#713B55] tracking-wider mb-1">
              <Quote size={12} />
              <span>{item.item_type === 'quote' ? 'Saying' : 'Memory Slip'}</span>
            </div>
            <h4 className="font-serif font-bold text-sm text-[#332A27] mb-1">
              {item.title}
            </h4>
            <p className="font-hand text-base text-[#4A3B32] line-clamp-3 leading-snug">
              "{item.description}"
            </p>
          </div>
        );

      default:
        return (
          <div 
            className="paper-card p-3 max-w-[200px] bg-[#FFFDF9] cursor-pointer group"
            style={{ transform: `rotate(${item.rotation || 0}deg)` }}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#713B55] tracking-wider mb-1">
              <Gift size={13} />
              <span>Keepsake</span>
            </div>
            {item.asset_path && (
              <div className="w-full h-20 mb-2 rounded overflow-hidden bg-[#FFF8E7] flex items-center justify-center">
                <img src={item.asset_path} alt={item.title} className="max-h-full object-contain" />
              </div>
            )}
            <h4 className="font-serif font-bold text-sm text-[#332A27]">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-[#6B5D57] mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen relative pb-24 transition-colors duration-500 ${
      theme.palette === 'night-vigil' ? 'bg-[#2A1E24] text-[#FFF3D8]' : 'bg-[#FFF3D8]'
    }`}>
      
      {/* Papel Picado Garland on Top */}
      {theme.show_papel_picado && (
        <div className="w-full relative overflow-hidden pointer-events-none opacity-90 select-none no-print">
          <img 
            src="/artwork/papel-picado.svg" 
            alt="Papel Picado Garland" 
            className="w-full h-auto min-h-[80px] max-h-[130px] object-cover" 
          />
        </div>
      )}

      {/* Altar Control Bar (hidden in preview mode and print) */}
      {!isPreviewMode && (
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8D3AC]/70 mb-6 no-print">
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-serif text-[#713B55] italic">
              Digital Ofrenda Canvas
            </span>
            
            {/* Autosave Status */}
            <div className="flex items-center gap-1.5 text-xs text-[#6B5D57]">
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={13} className="animate-spin text-[#F3A623]" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Custom Theme Settings Button */}
            <button
              onClick={() => setIsCustomizingTheme(!isCustomizingTheme)}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
            >
              <SlidersHorizontal size={14} />
              <span>Altar Theme</span>
            </button>

            {/* Print View */}
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
              title="Print ofrenda"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            {/* Preview / Vigil Mode */}
            <button
              onClick={() => setIsPreviewMode(true)}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 bg-[#FFFDF9] border-[#E8D3AC] hover:bg-[#FFF3D8]"
            >
              <Eye size={14} className="text-[#F3A623]" />
              <span>Vigil Mode</span>
            </button>

            {/* Add Item Button */}
            <button
              onClick={() => setIsAddingItem(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} />
              <span>Add Object</span>
            </button>

          </div>

        </div>
      )}

      {/* Theme Customizer Drawer */}
      {isCustomizingTheme && !isPreviewMode && (
        <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
          <div className="paper-card p-4 sm:p-6 bg-[#FFFAEE] border border-[#E8D3AC] rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8D3AC]">
              <h4 className="font-serif font-bold text-sm text-[#332A27]">
                Altar Styling & Traditions
              </h4>
              <button 
                onClick={() => setIsCustomizingTheme(false)}
                className="text-xs text-[#713B55] underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#713B55] block mb-1.5">Tradition</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTheme({ style_variant: 'diadelosmuertos' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif ${
                      theme.style_variant === 'diadelosmuertos' ? 'bg-[#F3A623] text-[#332A27] font-bold' : 'bg-white border'
                    }`}
                  >
                    Día de los Muertos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTheme({ style_variant: 'general' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif ${
                      theme.style_variant === 'general' ? 'bg-[#713B55] text-white font-bold' : 'bg-white border'
                    }`}
                  >
                    Serene
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#713B55] block mb-1.5">Palette</label>
                <select
                  value={theme.palette}
                  onChange={(e) => handleUpdateTheme({ palette: e.target.value })}
                  className="form-select text-xs py-1"
                >
                  <option value="warm-marigold">Warm Marigold</option>
                  <option value="aged-parchment">Aged Parchment</option>
                  <option value="night-vigil">Night Vigil (Dark Berry)</option>
                  <option value="botanical-sage">Botanical Sage</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#713B55] block mb-1.5">Elements</label>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.show_papel_picado}
                      onChange={(e) => handleUpdateTheme({ show_papel_picado: e.target.checked })}
                      className="accent-[#F3A623]"
                    />
                    <span>Banners</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.show_candles}
                      onChange={(e) => handleUpdateTheme({ show_candles: e.target.checked })}
                      className="accent-[#F3A623]"
                    />
                    <span>Candles</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN ALTAR COMPOSITION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* TOP TIER: Central Portrait, Sacred Space, & Candles */}
        <div className="relative pt-4 pb-8 flex flex-col items-center">
          
          {/* Altar Arch & Flourishes */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <img src="/artwork/botanical-sprig.svg" alt="" className="w-12 h-12 transform -scale-x-100 opacity-70" />
            <span className="font-serif text-sm tracking-widest uppercase font-semibold text-[#713B55]">
              En Memoria
            </span>
            <img src="/artwork/botanical-sprig.svg" alt="" className="w-12 h-12 opacity-70" />
          </div>

          {/* Central Portrait Frame with Candle Lighting */}
          <div className="relative group max-w-xs sm:max-w-sm mb-4">
            
            {/* Golden Vigil Candle Glow */}
            <div className="absolute -inset-4 bg-radial from-[#F3A623]/25 via-transparent to-transparent rounded-full filter blur-xl pointer-events-none" />

            <div className="relative z-10">
              {memorial.portrait_path ? (
                <div className="polaroid-card p-3 sm:p-4 bg-[#FFFCF7] shadow-xl border-2 border-[#E8D3AC] rounded-lg">
                  <div className="w-64 sm:w-72 h-80 sm:h-92 bg-[#E8D3AC]/20 rounded overflow-hidden border border-[#E8D3AC] flex items-center justify-center">
                    <img 
                      src={memorial.portrait_path} 
                      alt={memorial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 pb-1 text-center">
                    <h2 className="font-serif text-2xl font-bold text-[#332A27]">
                      {memorial.name}
                    </h2>
                    {memorial.relationship_type && (
                      <p className="text-xs text-[#713B55] font-serif italic">
                        {memorial.relationship_type}
                      </p>
                    )}
                    {(memorial.birth_date || memorial.remembrance_date) && (
                      <p className="text-[11px] text-[#9C8E87] mt-0.5">
                        {memorial.birth_date || '—'} – {memorial.remembrance_date || 'Present'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="polaroid-card p-4 bg-[#FFFCF7] shadow-xl border-2 border-[#E8D3AC] rounded-lg text-center w-64">
                  <div className="w-full h-64 bg-[#FFF3D8] rounded flex items-center justify-center mb-2">
                    <img src="/artwork/marigold.svg" alt="" className="w-20 h-20" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#332A27]">
                    {memorial.name}
                  </h2>
                </div>
              )}
            </div>

            {/* Flanking Candles for Vigil Atmosphere */}
            <div className="absolute -bottom-6 -left-10 w-20 h-28 hidden sm:block pointer-events-none">
              <img src="/artwork/candle.svg" alt="Candle" className="w-full h-full" />
            </div>
            <div className="absolute -bottom-6 -right-10 w-20 h-28 hidden sm:block pointer-events-none">
              <img src="/artwork/candle.svg" alt="Candle" className="w-full h-full" />
            </div>
          </div>

          {/* Remembrance Tribute Inscription Text */}
          {memorial.remembrance_text && (
            <div className="max-w-2xl text-center bg-[#FFFAEE]/90 border border-[#E8D3AC] rounded-2xl p-5 sm:p-6 shadow-sm my-4">
              <p className="font-serif text-sm sm:text-base text-[#332A27] italic leading-relaxed">
                "{memorial.remembrance_text}"
              </p>
              {!isPreviewMode && (
                <button
                  onClick={onNavigateToRemembrance}
                  className="mt-3 text-xs text-[#713B55] font-semibold underline hover:text-[#332A27] flex items-center gap-1 mx-auto"
                >
                  <Sparkles size={13} /> Open AI Remembrance Studio to Polish Tribute
                </button>
              )}
            </div>
          )}

          {/* Top Tier Items (Other Photos & Vigils) */}
          {topItems.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-6 mt-4 w-full">
              {topItems.map((item) => (
                <div key={item.id} className="relative group" onClick={() => setSelectedItem(item)}>
                  {getItemVisual(item)}
                  {!isPreviewMode && (
                    <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-full p-1 shadow border border-[#E8D3AC]">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShiftTier(item, 'down'); }}
                        className="p-1 hover:text-[#F3A623]"
                        title="Move to middle tier"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIER STEP DIVIDER 1 */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#E8D3AC]/80 to-transparent rounded-full shadow-inner" />
          <span className="absolute px-4 bg-[#FFF3D8] text-[11px] font-serif uppercase tracking-widest text-[#713B55] font-semibold">
            Their Favorites & Traditions
          </span>
        </div>

        {/* MIDDLE TIER: Foods, Songs, Books, Objects */}
        <div className="py-6">
          {middleItems.length === 0 ? (
            <div className="text-center py-8 text-[#9C8E87] font-serif text-sm italic">
              No favorite foods or songs added yet.
              {!isPreviewMode && (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="block mx-auto mt-2 text-xs font-sans text-[#F3A623] font-semibold underline"
                >
                  + Place a favorite dish or song on the altar
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {middleItems.map((item) => (
                <div key={item.id} className="relative group" onClick={() => setSelectedItem(item)}>
                  {getItemVisual(item)}
                  {!isPreviewMode && (
                    <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-full p-1 shadow border border-[#E8D3AC]">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShiftTier(item, 'up'); }}
                        className="p-1 hover:text-[#F3A623]"
                        title="Move to top tier"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShiftTier(item, 'down'); }}
                        className="p-1 hover:text-[#F3A623]"
                        title="Move to base tier"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIER STEP DIVIDER 2 */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#E8D3AC]/80 to-transparent rounded-full shadow-inner" />
          <span className="absolute px-4 bg-[#FFF3D8] text-[11px] font-serif uppercase tracking-widest text-[#713B55] font-semibold">
            Flowers & Written Memories
          </span>
        </div>

        {/* BASE TIER: Flowers, Written Memory Slips, Large Keepsakes */}
        <div className="py-6">
          {baseItems.length === 0 ? (
            <div className="text-center py-6 text-[#9C8E87] font-serif text-sm italic">
              Base tier is empty. Add marigold flowers, lemon drops, or memory slips.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-6">
              {baseItems.map((item) => (
                <div key={item.id} className="relative group" onClick={() => setSelectedItem(item)}>
                  {getItemVisual(item)}
                  {!isPreviewMode && (
                    <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 bg-white/95 rounded-full p-1 shadow border border-[#E8D3AC]">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShiftTier(item, 'up'); }}
                        className="p-1 hover:text-[#F3A623]"
                        title="Move to middle tier"
                      >
                        <ChevronUp size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Floating Exit Vigil Mode Button (when in Preview Mode) */}
      {isPreviewMode && (
        <div className="fixed bottom-6 right-6 z-50 no-print">
          <button
            onClick={() => setIsPreviewMode(false)}
            className="btn btn-primary shadow-xl flex items-center gap-2 rounded-full px-5 py-2.5 font-serif"
          >
            <EyeOff size={16} /> Exit Vigil Mode
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          story={memorial.stories.find(s => s.id === selectedItem.story_id)}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => {
            setSelectedItem(null);
            setEditingItem(item);
          }}
          onDelete={handleDeleteItem}
          onOpenStory={onOpenStory}
        />
      )}

      {/* Item Form Modal (Add / Edit) */}
      {(isAddingItem || editingItem) && (
        <ItemFormModal
          memorialId={memorial.id}
          item={editingItem}
          stories={memorial.stories}
          onSave={handleSaveItem}
          onClose={() => {
            setIsAddingItem(false);
            setEditingItem(null);
          }}
        />
      )}

    </div>
  );
};

