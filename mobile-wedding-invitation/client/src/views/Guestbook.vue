<template>
  <div class="guestbook">
    <div class="flower-decoration" style="top: 15%; left: 8%;">🌸</div>
    <div class="flower-decoration" style="top: 25%; right: 10%;">🌺</div>
    <div class="flower-decoration" style="bottom: 20%; left: 5%;">🌹</div>
    
    <div class="container">
      <header class="page-header" data-aos="fade-down">
        <router-link to="/" class="back-button">← 돌아가기</router-link>
        <h1 class="page-title gradient-text">📖 방명록</h1>
        <p class="page-subtitle">소중한 마음을 전해주세요</p>
      </header>

      <section class="guestbook-form-section" data-aos="fade-up">
        <div class="card sparkle">
          <h2 class="form-title">💌 축하 메시지 남기기</h2>
          <form @submit.prevent="submitGuestbook" class="guestbook-form">
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
              <label class="form-label">축하 메시지 *</label>
              <textarea 
                v-model="form.message" 
                class="form-input form-textarea" 
                rows="4"
                placeholder="따뜻한 축하 메시지를 남겨주세요"
                required
              ></textarea>
              <div class="char-count">{{ form.message.length }}/200</div>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-submit" 
              :disabled="loading || !form.name || !form.message"
            >
              {{ loading ? '등록 중...' : '✨ 메시지 등록하기' }}
            </button>
          </form>
        </div>
      </section>

      <section class="guestbook-list-section section">
        <div class="list-header" data-aos="fade-up">
          <h2 class="section-title">💝 받은 축하 메시지</h2>
          <div class="message-count">총 {{ guestbook.length }}개의 메시지</div>
        </div>

        <div class="guestbook-list">
          <div v-if="guestbook.length === 0" class="empty-state" data-aos="fade-up">
            <div class="empty-icon">📝</div>
            <h3>아직 등록된 메시지가 없습니다</h3>
            <p>첫 번째 축하 메시지를 남겨주세요!</p>
          </div>
          
          <div 
            v-else 
            v-for="(entry, index) in guestbook" 
            :key="entry.id"
            class="guestbook-item"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <div class="message-header">
              <div class="author-info">
                <h4 class="author-name">{{ entry.name }}</h4>
                <span class="message-date">{{ formatDate(entry.created_at) }}</span>
              </div>
              <div class="message-icon">💌</div>
            </div>
            <div class="message-content">
              <p>{{ entry.message }}</p>
            </div>
            <div class="message-decoration">
              <div class="heart-animation">💖</div>
            </div>
          </div>
        </div>
      </section>

      <section class="action-section">
        <div class="action-buttons" data-aos="fade-up">
          <router-link to="/rsvp" class="btn btn-secondary">
            💌 참석 여부 알려주기
          </router-link>
          <router-link to="/" class="btn btn-primary">
            🏠 홈으로 돌아가기
          </router-link>
        </div>
      </section>
    </div>

    <div v-if="showThankYou" class="thank-you-modal" @click="closeThankYou">
      <div class="thank-you-content" @click.stop>
        <div class="thank-you-icon">🎉</div>
        <h3>감사합니다!</h3>
        <p>소중한 축하 메시지가 등록되었습니다.</p>
        <button @click="closeThankYou" class="btn btn-primary">확인</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useWeddingStore } from '../stores/wedding'

export default {
  name: 'Guestbook',
  setup() {
    const weddingStore = useWeddingStore()
    const showThankYou = ref(false)

    const form = ref({
      name: '',
      message: ''
    })

    const submitGuestbook = async () => {
      if (form.value.message.length > 200) {
        alert('메시지는 200자 이내로 작성해주세요.')
        return
      }

      try {
        await weddingStore.addGuestbookEntry(form.value)
        
        // 폼 초기화
        form.value = {
          name: '',
          message: ''
        }
        
        // 감사 메시지 모달 표시
        showThankYou.value = true
        
        // 3초 후 자동으로 모달 닫기
        setTimeout(() => {
          showThankYou.value = false
        }, 3000)
        
      } catch (error) {
        alert('메시지 등록 중 오류가 발생했습니다.')
        console.error(error)
      }
    }

    const closeThankYou = () => {
      showThankYou.value = false
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return '오늘'
      } else if (diffDays === 2) {
        return '어제'
      } else if (diffDays <= 7) {
        return `${diffDays - 1}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        })
      }
    }

    onMounted(async () => {
      await weddingStore.getGuestbook()
    })

    return {
      form,
      showThankYou,
      guestbook: weddingStore.guestbook,
      loading: weddingStore.loading,
      submitGuestbook,
      closeThankYou,
      formatDate
    }
  }
}
</script>

<style scoped>
.guestbook {
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

.guestbook-form-section {
  margin-bottom: 50px;
}

.form-title {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 1.5rem;
  font-weight: 600;
}

.guestbook-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 5px;
}

.btn-submit {
  margin-top: 10px;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.message-count {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  border: 2px dashed var(--primary-color);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.empty-state p {
  color: var(--text-light);
  margin: 0;
}

.guestbook-item {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.guestbook-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.guestbook-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-gold);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.author-info {
  flex: 1;
}

.author-name {
  margin: 0 0 5px 0;
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.message-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.message-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.message-content {
  line-height: 1.7;
  color: var(--text-dark);
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(248, 244, 230, 0.3);
  border-radius: 12px;
  border-left: 3px solid var(--primary-color);
}

.message-content p {
  margin: 0;
}

.message-decoration {
  display: flex;
  justify-content: flex-end;
}

.heart-animation {
  font-size: 1.2rem;
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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

.thank-you-modal {
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

.thank-you-content {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: thankYouPop 0.5s ease-out;
}

@keyframes thankYouPop {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.thank-you-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: confetti 1s ease-out;
}

@keyframes confetti {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.thank-you-content h3 {
  color: var(--primary-color);
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.thank-you-content p {
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
  
  .list-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .message-header {
    flex-direction: column;
    gap: 5px;
  }
  
  .author-info {
    text-align: center;
  }
  
  .message-icon {
    align-self: center;
  }
}
</style>