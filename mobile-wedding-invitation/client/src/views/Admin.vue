<template>
  <div class="admin">
    <div class="container">
      <header class="admin-header" data-aos="fade-down">
        <h1 class="page-title">💼 관리자 페이지</h1>
        <router-link to="/" class="btn btn-secondary">🏠 홈으로</router-link>
      </header>

      <div class="admin-stats" data-aos="fade-up">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>총 참석자</h3>
            <p class="stat-number">{{ stats.guests?.total || 0 }}명</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>참석 확정</h3>
            <p class="stat-number">{{ stats.attending || 0 }}명</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>방명록</h3>
            <p class="stat-number">{{ stats.guestbook || 0 }}개</p>
          </div>
        </div>
      </div>

      <div class="admin-tabs" data-aos="fade-up" data-aos-delay="200">
        <button 
          @click="activeTab = 'wedding'" 
          :class="['tab-button', { active: activeTab === 'wedding' }]"
        >
          💒 결혼 정보
        </button>
        <button 
          @click="activeTab = 'guests'" 
          :class="['tab-button', { active: activeTab === 'guests' }]"
        >
          👥 참석자 관리
        </button>
        <button 
          @click="activeTab = 'guestbook'" 
          :class="['tab-button', { active: activeTab === 'guestbook' }]"
        >
          📖 방명록 관리
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'wedding'" class="wedding-form-section" data-aos="fade-up">
          <div class="card">
            <h2 class="section-title">결혼 정보 설정</h2>
            <form @submit.prevent="saveWeddingInfo" class="wedding-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">신랑 이름</label>
                  <input 
                    v-model="weddingForm.groom_name" 
                    type="text" 
                    class="form-input" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">신부 이름</label>
                  <input 
                    v-model="weddingForm.bride_name" 
                    type="text" 
                    class="form-input" 
                    required
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">결혼식 날짜</label>
                  <input 
                    v-model="weddingForm.wedding_date" 
                    type="date" 
                    class="form-input" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">결혼식 시간</label>
                  <input 
                    v-model="weddingForm.wedding_time" 
                    type="time" 
                    class="form-input" 
                    required
                  >
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">결혼식장 이름</label>
                <input 
                  v-model="weddingForm.venue_name" 
                  type="text" 
                  class="form-input" 
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label">결혼식장 주소</label>
                <input 
                  v-model="weddingForm.venue_address" 
                  type="text" 
                  class="form-input" 
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label">결혼식장 전화번호</label>
                <input 
                  v-model="weddingForm.venue_phone" 
                  type="tel" 
                  class="form-input"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">신랑 아버지</label>
                  <input 
                    v-model="weddingForm.groom_father" 
                    type="text" 
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">신랑 어머니</label>
                  <input 
                    v-model="weddingForm.groom_mother" 
                    type="text" 
                    class="form-input"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">신부 아버지</label>
                  <input 
                    v-model="weddingForm.bride_father" 
                    type="text" 
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">신부 어머니</label>
                  <input 
                    v-model="weddingForm.bride_mother" 
                    type="text" 
                    class="form-input"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">신랑 연락처</label>
                  <input 
                    v-model="weddingForm.groom_phone" 
                    type="tel" 
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">신부 연락처</label>
                  <input 
                    v-model="weddingForm.bride_phone" 
                    type="tel" 
                    class="form-input"
                  >
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">인사말</label>
                <textarea 
                  v-model="weddingForm.greeting_message" 
                  class="form-input form-textarea" 
                  rows="4"
                  placeholder="결혼식에 초대하는 따뜻한 인사말을 작성해주세요"
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? '저장 중...' : '💾 저장하기' }}
              </button>
            </form>
          </div>
        </div>

        <div v-if="activeTab === 'guests'" class="guests-section" data-aos="fade-up">
          <div class="card">
            <h2 class="section-title">참석자 관리</h2>
            <div class="guests-list">
              <div v-if="guests.length === 0" class="empty-state">
                <p>아직 등록된 참석자가 없습니다.</p>
              </div>
              <div v-else class="guest-item" v-for="guest in guests" :key="guest.id">
                <div class="guest-info">
                  <h4>{{ guest.name }}</h4>
                  <p>{{ guest.phone || '연락처 없음' }}</p>
                  <div class="guest-details">
                    <span :class="['attendance-badge', guest.attendance]">
                      {{ guest.attendance }}
                    </span>
                    <span class="guest-count">{{ guest.guest_count }}명</span>
                  </div>
                  <p v-if="guest.message" class="guest-message">{{ guest.message }}</p>
                </div>
                <div class="guest-actions">
                  <button @click="editGuest(guest)" class="btn-icon">✏️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'guestbook'" class="guestbook-section" data-aos="fade-up">
          <div class="card">
            <h2 class="section-title">방명록 관리</h2>
            <div class="guestbook-list">
              <div v-if="guestbook.length === 0" class="empty-state">
                <p>아직 등록된 방명록이 없습니다.</p>
              </div>
              <div v-else class="guestbook-item" v-for="entry in guestbook" :key="entry.id">
                <div class="guestbook-header">
                  <h4>{{ entry.name }}</h4>
                  <span class="guestbook-date">{{ formatDate(entry.created_at) }}</span>
                </div>
                <p class="guestbook-message">{{ entry.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <h3>참석자 정보 수정</h3>
        <form @submit.prevent="updateGuestInfo">
          <div class="form-group">
            <label class="form-label">이름</label>
            <input v-model="editForm.name" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">연락처</label>
            <input v-model="editForm.phone" type="tel" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">참석 여부</label>
            <select v-model="editForm.attendance" class="form-select">
              <option value="미정">미정</option>
              <option value="참석">참석</option>
              <option value="불참석">불참석</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">참석 인원</label>
            <input v-model.number="editForm.guest_count" type="number" class="form-input" min="1">
          </div>
          <div class="form-group">
            <label class="form-label">메시지</label>
            <textarea v-model="editForm.message" class="form-input form-textarea" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">취소</button>
            <button type="submit" class="btn btn-primary">수정</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useWeddingStore } from '../stores/wedding'

export default {
  name: 'Admin',
  setup() {
    const weddingStore = useWeddingStore()
    const activeTab = ref('wedding')
    const showEditModal = ref(false)
    const editingGuest = ref(null)

    const weddingForm = ref({
      groom_name: '',
      bride_name: '',
      wedding_date: '',
      wedding_time: '',
      venue_name: '',
      venue_address: '',
      venue_phone: '',
      groom_father: '',
      groom_mother: '',
      bride_father: '',
      bride_mother: '',
      groom_phone: '',
      bride_phone: '',
      greeting_message: ''
    })

    const editForm = ref({
      name: '',
      phone: '',
      attendance: '미정',
      guest_count: 1,
      message: ''
    })

    const loadData = async () => {
      await weddingStore.getWeddingInfo()
      await weddingStore.getGuests()
      await weddingStore.getGuestbook()
      await weddingStore.getStats()
    }

    const saveWeddingInfo = async () => {
      try {
        await weddingStore.updateWeddingInfo(weddingForm.value)
        showNotification('결혼 정보가 저장되었습니다!', 'success')
      } catch (error) {
        showNotification('저장 중 오류가 발생했습니다.', 'error')
      }
    }

    const editGuest = (guest) => {
      editingGuest.value = guest
      editForm.value = { ...guest }
      showEditModal.value = true
    }

    const updateGuestInfo = async () => {
      try {
        await weddingStore.updateGuest(editingGuest.value.id, editForm.value)
        showEditModal.value = false
        editingGuest.value = null
        showNotification('참석자 정보가 업데이트되었습니다!', 'success')
      } catch (error) {
        showNotification('업데이트 중 오류가 발생했습니다.', 'error')
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingGuest.value = null
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const showNotification = (message, type) => {
      console.log(`${type}: ${message}`)
    }

    watch(() => weddingStore.weddingInfo, (newInfo) => {
      if (newInfo) {
        Object.assign(weddingForm.value, newInfo)
      }
    }, { immediate: true, deep: true })

    onMounted(() => {
      loadData()
    })

    return {
      activeTab,
      weddingForm,
      editForm,
      showEditModal,
      editingGuest,
      weddingInfo: weddingStore.weddingInfo,
      guests: weddingStore.guests,
      guestbook: weddingStore.guestbook,
      stats: weddingStore.stats,
      loading: weddingStore.loading,
      saveWeddingInfo,
      editGuest,
      updateGuestInfo,
      closeEditModal,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px 0 40px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.page-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  color: var(--primary-color);
  margin: 0;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  border-left: 4px solid var(--primary-color);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

.stat-number {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.admin-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-light);
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button.active {
  background: var(--gradient-gold);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.tab-button:hover:not(.active) {
  background: rgba(212, 175, 55, 0.1);
  color: var(--primary-color);
}

.tab-content {
  min-height: 400px;
}

.wedding-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.guests-list, .guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.guest-item {
  background: rgba(248, 244, 230, 0.5);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 4px solid var(--primary-color);
}

.guest-info h4 {
  margin: 0 0 5px 0;
  color: var(--text-dark);
}

.guest-info p {
  margin: 3px 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.guest-details {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.attendance-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.attendance-badge.참석 {
  background: #e8f5e8;
  color: #2e7d32;
}

.attendance-badge.불참석 {
  background: #ffebee;
  color: #c62828;
}

.attendance-badge.미정 {
  background: #fff3e0;
  color: #ef6c00;
}

.guest-count {
  background: var(--primary-color);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.guest-message {
  font-style: italic;
  background: white;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px !important;
}

.guest-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.btn-icon:hover {
  background: rgba(212, 175, 55, 0.2);
}

.guestbook-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
}

.guestbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.guestbook-header h4 {
  margin: 0;
  color: var(--text-dark);
}

.guestbook-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.guestbook-message {
  margin: 0;
  line-height: 1.6;
  color: var(--text-dark);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 20px 0;
  color: var(--primary-color);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    font-size: 0.8rem;
    padding: 10px 15px;
  }
  
  .guest-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .guest-actions {
    align-self: flex-start;
  }
}
</style>