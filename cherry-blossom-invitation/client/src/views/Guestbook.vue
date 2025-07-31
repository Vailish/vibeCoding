<template>
  <div class="guestbook-container">
    <!-- 헤더 섹션 -->
    <section class="guestbook-header fade-in">
      <div class="cherry-card">
        <h1 class="cherry-title heart-decoration" style="font-size: 2.5rem; text-align: center;">
          축하 메시지
        </h1>
        <p class="cherry-text" style="text-align: center; font-size: 1.1rem;">
          저희의 특별한 날을 더욱 의미있게 만들어 주세요.<br>
          따뜻한 마음을 담은 축하 메시지를 남겨주시면 감사하겠습니다.
        </p>
      </div>
    </section>

    <!-- 메시지 작성 폼 -->
    <section class="message-form-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title">메시지 남기기</h2>
        <form @submit.prevent="submitMessage" class="message-form">
          <div class="form-group">
            <label for="name">이름 *</label>
            <input 
              type="text" 
              id="name"
              v-model="newMessage.name"
              class="cherry-input"
              placeholder="축하해주시는 분의 성함을 입력해주세요"
              required
              maxlength="20"
            >
          </div>
          
          <div class="form-group">
            <label for="message">축하 메시지 *</label>
            <textarea 
              id="message"
              v-model="newMessage.message"
              class="cherry-textarea"
              placeholder="따뜻한 축하 메시지를 남겨주세요...&#10;&#10;예시:&#10;• 결혼을 진심으로 축하드립니다!&#10;• 행복한 가정 꾸리시길 바랍니다.&#10;• 사랑이 가득한 새 출발을 응원합니다."
              required
              maxlength="500"
              rows="6"
            ></textarea>
            <div class="character-count">
              {{ newMessage.message.length }}/500
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="cherry-btn submit-btn"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="cherry-loading"></span>
              <i v-else class="fas fa-heart"></i>
              {{ isSubmitting ? '등록 중...' : '축하 메시지 등록' }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- 통계 정보 -->
    <section class="stats-section slide-in-up">
      <div class="cherry-card">
        <div class="stats-grid">
          <div class="stat-item">
            <i class="fas fa-comments icon"></i>
            <div class="stat-content">
              <span class="stat-number">{{ messages.length }}</span>
              <span class="stat-label">개의 축하 메시지</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-users icon"></i>
            <div class="stat-content">
              <span class="stat-number">{{ uniqueVisitors }}</span>
              <span class="stat-label">명이 축하해주셨어요</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-heart icon"></i>
            <div class="stat-content">
              <span class="stat-number">{{ totalHearts }}</span>
              <span class="stat-label">개의 마음</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 메시지 목록 -->
    <section class="messages-section slide-in-up">
      <div class="cherry-card">
        <div class="messages-header">
          <h2 class="section-title cherry-title">전체 축하 메시지</h2>
          <div class="sort-options">
            <select v-model="sortOrder" @change="sortMessages" class="sort-select">
              <option value="newest">최신순</option>
              <option value="oldest">오래된 순</option>
            </select>
          </div>
        </div>
        
        <!-- 메시지가 있을 때 -->
        <div v-if="sortedMessages.length > 0" class="messages-list">
          <transition-group name="message" tag="div">
            <div 
              v-for="(message, index) in paginatedMessages" 
              :key="message.id"
              class="message-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="message-header">
                <div class="message-author">
                  <i class="fas fa-user-circle"></i>
                  <span class="author-name">{{ message.name }}</span>
                </div>
                <div class="message-meta">
                  <span class="message-date">
                    <i class="fas fa-clock"></i>
                    {{ formatDate(message.created_at) }}
                  </span>
                  <button 
                    @click="likeMessage(message.id)" 
                    class="like-btn"
                    :class="{ liked: likedMessages.includes(message.id) }"
                  >
                    <i class="fas fa-heart"></i>
                    <span>{{ message.likes || 0 }}</span>
                  </button>
                </div>
              </div>
              <div class="message-content">
                <p>{{ message.message }}</p>
              </div>
              <div class="message-decoration">
                <span class="decoration-flower">🌸</span>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- 메시지가 없을 때 -->
        <div v-else class="empty-messages">
          <div class="empty-content">
            <i class="fas fa-comments empty-icon"></i>
            <h3>아직 축하 메시지가 없습니다</h3>
            <p>첫 번째 축하 메시지를 남겨주세요!</p>
            <button @click="scrollToForm" class="cherry-btn">
              <i class="fas fa-pen"></i>
              메시지 작성하기
            </button>
          </div>
        </div>
        
        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- 성공 메시지 토스트 -->
    <transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <i class="fas fa-check-circle"></i>
        <span>축하 메시지가 성공적으로 등록되었습니다!</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Guestbook',
  data() {
    return {
      messages: [],
      newMessage: {
        name: '',
        message: ''
      },
      isSubmitting: false,
      showSuccessToast: false,
      sortOrder: 'newest',
      currentPage: 1,
      messagesPerPage: 10,
      likedMessages: JSON.parse(localStorage.getItem('likedMessages') || '[]')
    }
  },
  computed: {
    sortedMessages() {
      const sorted = [...this.messages];
      if (this.sortOrder === 'newest') {
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    },
    
    totalPages() {
      return Math.ceil(this.sortedMessages.length / this.messagesPerPage);
    },
    
    paginatedMessages() {
      const start = (this.currentPage - 1) * this.messagesPerPage;
      const end = start + this.messagesPerPage;
      return this.sortedMessages.slice(start, end);
    },
    
    uniqueVisitors() {
      const uniqueNames = new Set(this.messages.map(msg => msg.name.toLowerCase()));
      return uniqueNames.size;
    },
    
    totalHearts() {
      return this.messages.reduce((total, msg) => total + (msg.likes || 0), 0);
    }
  },
  async mounted() {
    await this.loadMessages();
    this.initScrollAnimations();
  },
  methods: {
    async loadMessages() {
      try {
        const response = await this.$http.get('/api/guestbook');
        this.messages = response.data || [];
      } catch (error) {
        console.error('방명록 로드 실패:', error);
        this.showErrorToast('방명록을 불러오는 중 오류가 발생했습니다.');
      }
    },
    
    async submitMessage() {
      if (!this.newMessage.name.trim() || !this.newMessage.message.trim()) {
        alert('이름과 메시지를 모두 입력해주세요.');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        const response = await this.$http.post('/api/guestbook', {
          name: this.newMessage.name.trim(),
          message: this.newMessage.message.trim()
        });
        
        if (response.data.id) {
          // 새 메시지를 목록에 추가
          const newMsg = {
            id: response.data.id,
            name: this.newMessage.name.trim(),
            message: this.newMessage.message.trim(),
            created_at: new Date().toISOString(),
            likes: 0
          };
          
          this.messages.unshift(newMsg);
          
          // 폼 초기화
          this.newMessage = { name: '', message: '' };
          
          // 성공 토스트 표시
          this.showSuccessToast = true;
          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);
          
          // 첫 페이지로 이동
          this.currentPage = 1;
        }
      } catch (error) {
        console.error('메시지 등록 실패:', error);
        alert('메시지 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    likeMessage(messageId) {
      const index = this.likedMessages.indexOf(messageId);
      if (index === -1) {
        // 좋아요 추가
        this.likedMessages.push(messageId);
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
          message.likes = (message.likes || 0) + 1;
        }
      } else {
        // 좋아요 취소
        this.likedMessages.splice(index, 1);
        const message = this.messages.find(msg => msg.id === messageId);
        if (message && message.likes > 0) {
          message.likes -= 1;
        }
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem('likedMessages', JSON.stringify(this.likedMessages));
    },
    
    sortMessages() {
      this.currentPage = 1;
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.scrollToTop();
      }
    },
    
    scrollToForm() {
      const formSection = document.querySelector('.message-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    scrollToTop() {
      const messagesSection = document.querySelector('.messages-section');
      if (messagesSection) {
        messagesSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return '오늘 ' + date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays === 2) {
        return '어제 ' + date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    
    initScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('slide-in-up');
          }
        });
      }, observerOptions);
      
      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    }
  }
}
</script>

<style scoped>
.guestbook-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 섹션 제목 */
.section-title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 2rem;
}

/* 메시지 작성 폼 */
.message-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--cherry-brown);
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.form-actions {
  text-align: center;
}

.submit-btn {
  min-width: 200px;
  font-size: 1.1rem;
  padding: 15px 30px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 통계 섹션 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--cherry-gradient-soft);
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-item .icon {
  font-size: 2rem;
  color: var(--cherry-pink);
  margin-right: 1rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--cherry-deep-pink);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--cherry-brown);
  margin-top: 0.25rem;
}

/* 메시지 목록 헤더 */
.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--cherry-light-pink);
  border-radius: 10px;
  background: white;
  font-family: 'Noto Serif KR', serif;
  color: var(--cherry-brown);
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: var(--cherry-pink);
}

/* 메시지 카드 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 183, 197, 0.2);
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.message-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--cherry-shadow);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.message-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message-author i {
  color: var(--cherry-pink);
  font-size: 1.2rem;
}

.author-name {
  font-weight: 500;
  color: var(--cherry-deep-pink);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.message-date {
  font-size: 0.85rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.like-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.like-btn:hover {
  background: rgba(255, 183, 197, 0.2);
  color: var(--cherry-pink);
}

.like-btn.liked {
  color: var(--cherry-deep-pink);
  animation: heartBeat 0.5s ease;
}

.message-content {
  line-height: 1.7;
  color: #555;
  margin-bottom: 0.5rem;
}

.message-decoration {
  position: absolute;
  bottom: 10px;
  right: 15px;
  opacity: 0.6;
  font-size: 1.2rem;
}

/* 빈 메시지 상태 */
.empty-messages {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  color: var(--cherry-light-pink);
  margin-bottom: 1rem;
}

.empty-content h3 {
  color: var(--cherry-brown);
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: #999;
  margin-bottom: 2rem;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background: var(--cherry-gradient);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: var(--cherry-shadow-light);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: var(--cherry-brown);
  min-width: 60px;
  text-align: center;
}

/* 성공 토스트 */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--cherry-green);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--cherry-shadow);
  z-index: 1000;
}

/* 애니메이션 */
.message-enter-active, .message-leave-active {
  transition: all 0.5s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .messages-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .sort-select {
    align-self: center;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .message-meta {
    align-self: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .success-toast {
    right: 10px;
    left: 10px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .message-card {
    padding: 1rem;
  }
  
  .submit-btn {
    min-width: 100%;
  }
  
  .pagination {
    gap: 0.5rem;
  }
  
  .page-btn {
    width: 35px;
    height: 35px;
  }
}
</style>