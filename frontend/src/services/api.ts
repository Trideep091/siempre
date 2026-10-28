import { 
  Memorial, MemorialSummary, MemoryItem, Story, AIStatus, SearchResponse 
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    const message = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : errorData.detail?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Memorials
  getMemorials: () => request<MemorialSummary[]>('/memorials'),
  getMemorial: (id: string) => request<Memorial>(`/memorials/${id}`),
  createMemorial: (data: Partial<Memorial>) => request<Memorial>('/memorials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateMemorial: (id: string, data: Partial<Memorial>) => request<Memorial>(`/memorials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteMemorial: (id: string) => request<void>(`/memorials/${id}`, { method: 'DELETE' }),
  
  uploadPortrait: async (memorialId: string, file: File): Promise<{ portrait_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ portrait_path: string }>(`/memorials/${memorialId}/portrait`, {
      method: 'POST',
      body: formData,
    });
  },

  exportMemorial: (id: string) => request<any>(`/memorials/${id}/export`),

  // Altar Items
  createItem: (memorialId: string, data: Partial<MemoryItem>) => request<MemoryItem>(`/memorials/${memorialId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateItem: (id: string, data: Partial<MemoryItem>) => request<MemoryItem>(`/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteItem: (id: string) => request<void>(`/items/${id}`, { method: 'DELETE' }),
  uploadItemAsset: async (itemId: string, file: File): Promise<{ asset_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ asset_path: string }>(`/items/${itemId}/asset`, {
      method: 'POST',
      body: formData,
    });
  },
  reorderItems: (memorialId: string, positions: Array<{ id: string; tier?: string; position_x?: number; position_y?: number; sort_order: number; rotation?: number }>) => 
    request<{ status: string; count: number }>(`/memorials/${memorialId}/items/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(positions),
    }),

  // Stories & Audio Archive
  createStory: (memorialId: string, data: Partial<Story> & { linked_item_id?: string }) => request<Story>(`/memorials/${memorialId}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getStory: (id: string) => request<Story>(`/stories/${id}`),
  updateStory: (id: string, data: Partial<Story> & { linked_item_id?: string }) => request<Story>(`/stories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteStory: (id: string) => request<void>(`/stories/${id}`, { method: 'DELETE' }),
  uploadAudio: async (storyId: string, file: Blob | File, duration?: number): Promise<{ audio_path: string; audio_duration?: number; transcription_status: string }> => {
    const formData = new FormData();
    formData.append('file', file, 'recording.webm');
    const query = duration ? `?duration=${duration}` : '';
    return request<{ audio_path: string; audio_duration?: number; transcription_status: string }>(`/stories/${storyId}/audio${query}`, {
      method: 'POST',
      body: formData,
    });
  },
  transcribeStory: (storyId: string) => request<{ status: string; transcript: string; segments: any[] }>(`/stories/${storyId}/transcribe`, {
    method: 'POST',
  }),

  // Local AI Remembrance Studio & Status
  getAIStatus: () => request<AIStatus>('/ai/status'),
  generateRemembrance: (data: {
    memorial_id: string;
    tone: string;
    format_type: string;
    selected_item_ids: string[];
    selected_story_ids: string[];
    use_words_closely: boolean;
    additional_context?: string;
  }) => request<{
    draft: string;
    tone: string;
    format_type: string;
    source_items_used: any[];
    source_stories_used: any[];
    model_used: string;
    is_draft: boolean;
    grounding_notes?: string;
  }>('/ai/remembrance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  summarizeStory: (data: { story_id: string; transcript_override?: string }) => request<{
    summary: string;
    key_themes: string[];
    model_used: string;
  }>('/ai/summarize-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  // Search
  search: (query: string, params?: { memorial_id?: string; item_type?: string; tag?: string }) => {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.memorial_id) searchParams.append('memorial_id', params.memorial_id);
    if (params?.item_type) searchParams.append('item_type', params.item_type);
    if (params?.tag) searchParams.append('tag', params.tag);
    return request<SearchResponse>(`/search?${searchParams.toString()}`);
  },

  // Fictional Demo Seed
  seedDemo: () => request<Memorial>('/demo/seed', { method: 'POST' }),
};

