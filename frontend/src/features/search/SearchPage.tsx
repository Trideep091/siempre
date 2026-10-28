import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Clock, 
  Tag, 
  Utensils, 
  Music, 
  Camera, 
  Mic, 
  FileText, 
  Gift, 
  Flame, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { MemorialSummary, SearchResultItem } from '../../types';
import { api } from '../../services/api';

interface SearchPageProps {
  memorials: MemorialSummary[];
  activeMemorialId: string | null;
  onNavigateToItem: (memorialId: string, itemId: string) => void;
  onNavigateToStory: (memorialId: string, storyId: string, timestamp?: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  memorials,
  activeMemorialId,
  onNavigateToItem,
  onNavigateToStory
}) => {
  const [query, setQuery] = useState('');
  const [selectedMemorialId, setSelectedMemorialId] = useState<string>(activeMemorialId || '');
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Perform search
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.search(searchTerm.trim(), {
        memorial_id: selectedMemorialId || undefined,
        item_type: selectedItemType || undefined,
      });
      setResults(res.results);
      setTotalCount(res.total_results);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedMemorialId, selectedItemType]);

  const getItemIcon = (type?: string, resultType?: string) => {
    if (resultType === 'story') return <Mic size={16} className="text-[#36775B]" />;
    if (resultType === 'memorial') return <FileText size={16} className="text-[#713B55]" />;
    switch (type) {
      case 'food': return <Utensils size={16} className="text-[#ED7047]" />;
      case 'song': return <Music size={16} className="text-[#4A9C96]" />;
      case 'photograph': return <Camera size={16} className="text-[#713B55]" />;
      case 'candle': return <Flame size={16} className="text-[#F3A623]" />;
      default: return <Gift size={16} className="text-[#713B55]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 text-[#F7EFE2]">
      
      {/* Header */}
      <div className="border-b border-[#382C3D] pb-4 mb-6">
        <div className="flex items-center gap-2 text-[#38A9A0] mb-1">
          <SearchIcon size={18} />
          <span className="font-serif font-bold text-sm tracking-wide uppercase">
            Archive Search & Rediscovery
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#F7EFE2]">
          Search Family Memories
        </h1>
        <p className="text-sm text-[#B8A6B6] font-serif italic mt-0.5">
          Find recipes, songs, spoken words, lemon drops, and courtyard stories across your archive.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="paper-card p-4 sm:p-5 bg-[#151119] border border-[#382C3D] mb-8 shadow-md">
        <div className="relative mb-3">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E7C8E]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type anything (e.g., mole, sewing, courtyard, amor eterno, cinnamon)..."
            className="form-input pl-12 text-base font-serif bg-[#18131E] border-[#382C3D] text-[#F7EFE2] placeholder-[#8E7C8E]"
            autoFocus
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8A6B6]">
          <div className="flex items-center gap-1.5 font-medium">
            <Filter size={14} className="text-[#FFB733]" />
            <span>Filters:</span>
          </div>

          {/* Memorial filter */}
          {memorials.length > 1 && (
            <select
              value={selectedMemorialId}
              onChange={(e) => setSelectedMemorialId(e.target.value)}
              className="bg-[#241B2C] border border-[#3D2E44] text-[#F7EFE2] rounded-lg text-xs py-1.5 px-2.5 max-w-[200px]"
            >
              <option value="">All Memorials</option>
              {memorials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* Type filter */}
          <select
            value={selectedItemType}
            onChange={(e) => setSelectedItemType(e.target.value)}
            className="bg-[#241B2C] border border-[#3D2E44] text-[#F7EFE2] rounded-lg text-xs py-1.5 px-2.5 max-w-[180px]"
          >
            <option value="">All Types (Food, Songs, Stories)</option>
            <option value="food">Foods & Recipes</option>
            <option value="song">Songs & Music</option>
            <option value="photograph">Photographs</option>
            <option value="written_memory">Written Memories</option>
            <option value="object">Keepsakes</option>
          </select>

          {/* Suggested Quick Searches */}
          <div className="flex items-center gap-1.5 ml-auto text-[11px]">
            <span className="text-[#8E7C8E]">Try:</span>
            {['mole', 'courtyard', 'song', 'sewing', 'garden'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="bg-[#241B2C] hover:bg-[#F5A623] hover:text-[#0C0A0E] px-2 py-0.5 rounded text-[#FFB733] border border-[#3D2E44] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FFB733]">
            {query.trim() ? `Search Results (${totalCount})` : 'Search Archive'}
          </span>
          {isLoading && <span className="text-xs text-[#8E7C8E] animate-pulse">Searching...</span>}
        </div>

        {query.trim() && results.length === 0 && !isLoading && (
          <div className="paper-card p-10 text-center bg-[#151119] border border-[#382C3D]">
            <p className="font-serif text-base text-[#B8A6B6] italic">
              No memories or stories matched "{query}".
            </p>
            <p className="text-xs text-[#8E7C8E] mt-1">
              Try broader keywords like "food", "story", or "garden".
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((r) => {
            const isStory = r.result_type === 'story';
            return (
              <div
                key={`${r.result_type}-${r.id}`}
                onClick={() => {
                  if (isStory) {
                    onNavigateToStory(r.memorial_id, r.id, r.matched_timestamp || undefined);
                  } else {
                    onNavigateToItem(r.memorial_id, r.id);
                  }
                }}
                className="paper-card p-5 bg-[#151119] border border-[#382C3D] hover:bg-[#1C1622] hover:border-[#F5A623] hover:shadow-[0_4px_20px_rgba(245,166,35,0.15)] cursor-pointer transition-all group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#241B2C] border border-[#3D2E44] flex items-center justify-center shrink-0">
                      {getItemIcon(r.item_type, r.result_type)}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#FFB733]">
                      {r.memorial_name} • {r.result_type === 'story' ? 'Spoken Story' : (r.item_type || r.result_type)}
                    </span>
                    {r.matched_timestamp_label && (
                      <span className="badge badge-botanical text-[10px] flex items-center gap-1 font-mono">
                        <Clock size={10} /> {r.matched_timestamp_label}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#F7EFE2] group-hover:text-[#FFB733] transition-colors leading-tight">
                    {r.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#B8A6B6] font-serif leading-relaxed line-clamp-2">
                    {r.snippet}
                  </p>

                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.tags.map(t => (
                        <span key={t} className="text-[10px] text-[#8E7C8E] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Tag size={9} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#FFB733] group-hover:translate-x-1 transition-transform shrink-0">
                  <span>{isStory ? 'Listen in Archive' : 'Open on Altar'}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

