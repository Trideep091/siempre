export type AltarItemType = 
  | 'photograph'
  | 'food'
  | 'song'
  | 'flower'
  | 'object'
  | 'written_memory'
  | 'quote'
  | 'candle';

export type AltarTier = 'top' | 'middle' | 'base';

export interface ThemeSettings {
  palette: string; // 'warm-marigold', 'aged-parchment', 'night-vigil', 'botanical-sage'
  paper_style: string; // 'warm-paper', 'aged-parchment', 'soft-cream', 'dark-velvet'
  layout: string; // 'traditional-ofrenda', 'serene-memorial', 'salon-gallery'
  style_variant: 'diadelosmuertos' | 'general';
  show_papel_picado: boolean;
  show_candles: boolean;
  show_marigolds: boolean;
}

export interface MemoryItem {
  id: string;
  memorial_id: string;
  item_type: AltarItemType;
  title: string;
  description?: string | null;
  asset_path?: string | null;
  external_link?: string | null;
  date_period?: string | null;
  tags: string[];
  tier: AltarTier;
  position_x?: number | null;
  position_y?: number | null;
  sort_order: number;
  rotation: number;
  story_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Story {
  id: string;
  memorial_id: string;
  title: string;
  description?: string | null;
  audio_path?: string | null;
  audio_duration?: number | null;
  transcript?: string | null;
  transcript_segments: TranscriptSegment[];
  ai_summary?: string | null;
  recording_date?: string | null;
  teller_name?: string | null;
  transcription_status: 'none' | 'pending' | 'completed' | 'failed' | 'unavailable';
  transcription_error?: string | null;
  linked_items_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Memorial {
  id: string;
  name: string;
  relationship_type?: string | null;
  birth_date?: string | null;
  remembrance_date?: string | null;
  pronouns?: string | null;
  portrait_path?: string | null;
  short_description?: string | null;
  remembrance_text?: string | null;
  theme_settings: ThemeSettings;
  created_at: string;
  updated_at: string;
  items: MemoryItem[];
  stories: Story[];
}

export interface MemorialSummary {
  id: string;
  name: string;
  relationship_type?: string | null;
  birth_date?: string | null;
  remembrance_date?: string | null;
  pronouns?: string | null;
  portrait_path?: string | null;
  short_description?: string | null;
  remembrance_text?: string | null;
  theme_settings: ThemeSettings;
  created_at: string;
  updated_at: string;
  item_count: number;
  story_count: number;
}

export interface AIStatus {
  ollama_available: boolean;
  ollama_url: string;
  configured_model: string;
  model_installed: boolean;
  available_models: string[];
  ollama_message: string;
  whisper_available: boolean;
  whisper_engine: string;
  whisper_model_size: string;
  whisper_status_detail: string;
  local_inference_ready: boolean;
  data_storage_path: string;
}

export interface SearchResultItem {
  result_type: 'item' | 'story' | 'memorial';
  id: string;
  memorial_id: string;
  memorial_name: string;
  title: string;
  snippet: string;
  item_type?: string;
  date_period?: string;
  tags: string[];
  score: number;
  matched_timestamp?: number | null;
  matched_timestamp_label?: string | null;
  extra: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResultItem[];
  search_mode: string;
}

