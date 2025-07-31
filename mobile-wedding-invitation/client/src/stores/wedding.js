import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const useWeddingStore = defineStore('wedding', () => {
  const weddingInfo = ref({})
  const guests = ref([])
  const guestbook = ref([])
  const stats = ref({})
  const loading = ref(false)
  const error = ref(null)

  const getWeddingInfo = async () => {
    try {
      loading.value = true
      const response = await api.get('/wedding-info')
      weddingInfo.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWeddingInfo = async (data) => {
    try {
      loading.value = true
      const response = await api.put('/wedding-info', data)
      await getWeddingInfo()
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getGuests = async () => {
    try {
      loading.value = true
      const response = await api.get('/guests')
      guests.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addGuest = async (guestData) => {
    try {
      loading.value = true
      const response = await api.post('/guests', guestData)
      await getGuests()
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateGuest = async (id, guestData) => {
    try {
      loading.value = true
      const response = await api.put(`/guests/${id}`, guestData)
      await getGuests()
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getGuestbook = async () => {
    try {
      loading.value = true
      const response = await api.get('/guestbook')
      guestbook.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addGuestbookEntry = async (entry) => {
    try {
      loading.value = true
      const response = await api.post('/guestbook', entry)
      await getGuestbook()
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStats = async () => {
    try {
      loading.value = true
      const response = await api.get('/stats')
      stats.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const weddingDate = computed(() => {
    if (!weddingInfo.value.wedding_date) return null
    return new Date(weddingInfo.value.wedding_date)
  })

  const daysUntilWedding = computed(() => {
    if (!weddingDate.value) return null
    const today = new Date()
    const diffTime = weddingDate.value - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  })

  const formatWeddingDate = computed(() => {
    if (!weddingDate.value) return ''
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }
    return weddingDate.value.toLocaleDateString('ko-KR', options)
  })

  return {
    weddingInfo,
    guests,
    guestbook,
    stats,
    loading,
    error,
    weddingDate,
    daysUntilWedding,
    formatWeddingDate,
    getWeddingInfo,
    updateWeddingInfo,
    getGuests,
    addGuest,
    updateGuest,
    getGuestbook,
    addGuestbookEntry,
    getStats
  }
})