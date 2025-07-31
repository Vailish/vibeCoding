<template>
  <div class="rsvp">
    <div class="flower-decoration" style="top: 12%; right: 8%;">🌸</div>
    <div class="flower-decoration" style="top: 30%; left: 5%;">🌺</div>
    <div class="flower-decoration" style="bottom: 25%; right: 5%;">🌹</div>
    
    <div class="container">
      <header class="page-header" data-aos="fade-down">
        <router-link to="/" class="back-button">← 돌아가기</router-link>
        <h1 class="page-title gradient-text">💌 참석 여부 확인</h1>
        <p class="page-subtitle">소중한 자리에 함께해 주세요</p>
      </header>

      <section class="rsvp-form-section" data-aos="fade-up">
        <div class="card sparkle">
          <div class="form-header">
            <div class="form-icon">👰‍♀️🤵‍♂️</div>
            <h2 class="form-title">참석 정보 등록</h2>
            <p class="form-subtitle">귀한 걸음 해주시길 기다리겠습니다</p>
          </div>
          
          <form @submit.prevent="submitRSVP" class="rsvp-form">
            <div class="form-group">
              <label class="form-label">성함 *</label>
              <input 
                v-model="form.name" 
                type="text" 
                class="form-input" 
                placeholder="이름을 입력해주세요"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">연락처</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="form-input" 
                placeholder="010-0000-0000"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">참석 여부 *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input 
                    v-model="form.attendance" 
                    type="radio" 
                    value="참석"
                    class="radio-input"
                  >
                  <span class="radio-custom"></span>
                  <span class="radio-text">✅ 참석합니다</span>
                </label>
                
                <label class="radio-option">
                  <input 
                    v-model="form.attendance" 
                    type="radio" 
                    value="불참석"
                    class="radio-input"
                  >
                  <span class="radio-custom"></span>
                  <span class="radio-text">❌ 참석이 어렵습니다</span>
                </label>
                
                <label class="radio-option">
                  <input 
                    v-model="form.attendance" 
                    type="radio" 
                    value="미정"
                    class="radio-input"
                  >
                  <span class="radio-custom"></span>
                  <span class="radio-text">⏳ 아직 미정입니다</span>
                </label>
              </div>
            </div>
            
            <div v-if="form.attendance === '참석'" class="form-group" data-aos="fade-in">
              <label class="form-label">참석 인원 *</label>
              <div class="counter-group">
                <button 
                  type="button" 
                  @click="decrementCount" 
                  class="counter-btn"
                  :disabled="form.guest_count <= 1"
                >
                  -
                </button>
                <span class="counter-display">{{ form.guest_count }}명</span>
                <button 
                  type="button" 
                  @click="incrementCount" 
                  class="counter-btn"
                  :disabled="form.guest_count >= 10"
                >
                  +
                </button>
              </div>
              <small class="form-hint">동반하실 분의 수를 포함해서 입력해주세요</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">전하고 싶은 말씀</label>
              <textarea 
                v-model="form.message" 
                class="form-input form-textarea" 
                rows="3"
                placeholder="새로운 시작을 축하하는 마음을 전해주세요"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-submit" 
              :disabled="loading || !form.name || !form.attendance"
            >
              {{ loading ? '등록 중...' : '💝 등록하기' }}
            </button>
          </form>
        </div>
      </section>

      <section class="info-section section" data-aos="fade-up" data-aos-delay="200">
        <div class="info-cards">
          <div class="info-card">
            <div class="info-icon">📍</div>
            <h3>오시는 길</h3>
            <p>{{ weddingInfo.venue_name }}</p>
            <p class="address">{{ weddingInfo.venue_address }}</p>
            <button @click="openMap" class="map-btn">지도 보기</button>
          </div>
          
          <div class="info-card">
            <div class="info-icon">🚗</div>
            <h3>주차 안내</h3>
            <p>건물 지하 주차장 이용 가능</p>
            <p class="parking-info">2시간 무료 주차</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">📞</div>
            <h3>문의사항</h3>
            <p>{{ weddingInfo.venue_phone }}</p>
            <p class="contact-info">궁금한 점은 언제든 연락주세요</p>
          </div>
        </div>
      </section>

      <section class="action-section">
        <div class="action-buttons" data-aos="fade-up">
          <router-link to="/guestbook" class="btn btn-secondary">
            📝 방명록 작성하기
          </router-link>
          <router-link to="/" class="btn btn-primary">
            🏠 홈으로 돌아가기
          </router-link>
        </div>
      </section>
    </div>

    <div v-if="showConfirmation" class="confirmation-modal" @click="closeConfirmation">
      <div class="confirmation-content" @click.stop>
        <div class="confirmation-icon">
          <div v-if="form.attendance === '참석'" class="success-icon">🎉</div>
          <div v-else-if="form.attendance === '불참석'" class="regret-icon">😔</div>
          <div v-else class="pending-icon">⏳</div>
        </div>
        <h3>{{ getConfirmationTitle() }}</h3>
        <p>{{ getConfirmationMessage() }}</p>
        <button @click="closeConfirmation" class="btn btn-primary">확인</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useWeddingStore } from '../stores/wedding'

export default {
  name: 'RSVP',
  setup() {
    const weddingStore = useWeddingStore()
    const showConfirmation = ref(false)

    const form = ref({
      name: '',
      phone: '',
      attendance: '',
      guest_count: 1,
      message: ''
    })

    const submitRSVP = async () => {
      try {
        await weddingStore.addGuest(form.value)
        showConfirmation.value = true
        
        // 폼 초기화
        form.value = {
          name: '',
          phone: '',
          attendance: '',
          guest_count: 1,
          message: ''
        }
        
      } catch (error) {
        alert('등록 중 오류가 발생했습니다.')
        console.error(error)
      }
    }

    const incrementCount = () => {
      if (form.value.guest_count < 10) {
        form.value.guest_count++
      }
    }

    const decrementCount = () => {
      if (form.value.guest_count > 1) {
        form.value.guest_count--
      }
    }

    const openMap = () => {
      const address = encodeURIComponent(weddingStore.weddingInfo.venue_address || '')
      const mapUrl = `https://map.kakao.com/link/search/${address}`
      window.open(mapUrl, '_blank')
    }

    const closeConfirmation = () => {
      showConfirmation.value = false
    }

    const getConfirmationTitle = () => {
      switch (form.value.attendance) {
        case '참석': return '참석 확인 완료!'
        case '불참석': return '답변 감사합니다'
        default: return '답변이 등록되었습니다'
      }
    }

    const getConfirmationMessage = () => {
      switch (form.value.attendance) {
        case '참석': return '소중한 자리에 함께해 주셔서 감사합니다. 기쁜 마음으로 준비하겠습니다.'
        case '불참석': return '바쁘신 중에도 답변해 주셔서 감사합니다. 따뜻한 마음만으로도 충분합니다.'
        default: return '시간이 되시면 언제든 다시 알려주세요.'
      }
    }

    onMounted(async () => {
      await weddingStore.getWeddingInfo()
    })

    return {
      form,
      showConfirmation,
      weddingInfo: weddingStore.weddingInfo,
      loading: weddingStore.loading,
      submitRSVP,
      incrementCount,
      decrementCount,
      openMap,
      closeConfirmation,
      getConfirmationTitle,
      getConfirmationMessage
    }
  }
}
</script>

<style scoped>
.rsvp {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeef7 0%, #f8e8f0 50%, #ffd7e8 100%);
  position: relative;
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: var(--primary-color);
  color: white;
  transform: translateX(-5px);
}

.page-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  margin: 0;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.form-title {
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-subtitle {
  color: var(--text-light);
  margin: 0;
  font-size: 0.95rem;
}

.rsvp-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(248, 244, 230, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.radio-option:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
}

.radio-input {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-input:checked + .radio-custom {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radio-text {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 1rem;
}

.counter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background: rgba(248, 244, 230, 0.5);
  border-radius: 12px;
  margin-bottom: 10px;
}

.counter-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.counter-btn:hover:not(:disabled) {
  background: var(--accent-color);
  transform: scale(1.1);
}

.counter-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.counter-display {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 60px;
  text-align: center;
}

.form-hint {
  color: var(--text-light);
  font-size: 0.85rem;
  text-align: center;
}

.btn-submit {
  margin-top: 10px;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 30px;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
}

.info-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.info-card h3 {
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.info-card p {
  margin: 5px 0;
  color: var(--text-dark);
}

.address, .parking-info, .contact-info {
  color: var(--text-light) !important;
  font-size: 0.9rem;
}

.map-btn {
  background: var(--gradient-gold);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.map-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.action-section {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 2px dashed rgba(212, 175, 55, 0.3);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 280px;
  margin: 0 auto;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.confirmation-content {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 350px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: confirmationPop 0.5s ease-out;
}

@keyframes confirmationPop {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirmation-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-icon {
  animation: bounce 1s ease-out;
}

.regret-icon, .pending-icon {
  animation: gentle-bounce 0.8s ease-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-15px,0);
  }
  70% {
    transform: translate3d(0,-7px,0);
  }
  90% {
    transform: translate3d(0,-2px,0);
  }
}

@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.confirmation-content h3 {
  color: var(--primary-color);
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.confirmation-content p {
  color: var(--text-dark);
  margin: 0 0 25px 0;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .back-button {
    position: static;
    display: inline-block;
    margin-bottom: 20px;
  }
  
  .counter-group {
    gap: 15px;
  }
  
  .counter-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .info-cards {
    gap: 15px;
  }
  
  .info-card {
    padding: 20px;
  }
}

@media (min-width: 768px) {
  .info-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>