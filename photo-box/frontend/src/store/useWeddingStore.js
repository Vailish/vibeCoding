import { create } from 'zustand';

const useWeddingStore = create((set, get) => ({
      // Wedding info
      currentWedding: null,
      isAdmin: false,
      adminToken: null,

      // Media
      mediaList: [],
      mediaStats: null,
      isLoading: false,
      error: null,

      // Pagination
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,

      // Actions
      setWedding: (wedding) => set({ currentWedding: wedding }),
      
      setAdmin: (token, wedding) => set({ 
        isAdmin: true, 
        adminToken: token,
        currentWedding: wedding
      }),
      
      logout: () => set({ 
        isAdmin: false, 
        adminToken: null,
        currentWedding: null
      }),

      setMediaList: (media, pagination) => set({
        mediaList: media,
        currentPage: pagination?.currentPage || 1,
        totalPages: pagination?.totalPages || 1,
        totalCount: pagination?.totalCount || 0,
      }),

      addMedia: (newMedia) => set((state) => ({
        mediaList: [...newMedia, ...state.mediaList],
        totalCount: state.totalCount + newMedia.length
      })),

      updateMediaLikes: (mediaId, likesCount) => set((state) => ({
        mediaList: state.mediaList.map(media =>
          media.id === mediaId 
            ? { ...media, likes_count: likesCount }
            : media
        )
      })),

      removeMedia: (mediaId) => set((state) => ({
        mediaList: state.mediaList.filter(media => media.id !== mediaId),
        totalCount: state.totalCount - 1
      })),

      setMediaStats: (stats) => set({ mediaStats: stats }),

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
}));

export default useWeddingStore;