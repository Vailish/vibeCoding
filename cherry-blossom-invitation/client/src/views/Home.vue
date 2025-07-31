<template>
  <div class="home-container">
    <!-- 메인 헤더 섹션 -->
    <section class="hero-section fade-in">
      <div class="hero-content">
        <div class="couple-names cherry-decoration">
          <h1 class="cherry-title" style="font-size: 3.5rem; margin-bottom: 0.5rem;">
            Ji-eun <span style="color: var(--cherry-gold);">♥</span> Min-su
          </h1>
          <p class="cherry-subtitle" style="font-size: 1.2rem;">
            지은 그리고 민수
          </p>
        </div>
        
        <div class="wedding-date sparkle">
          <p class="date-text">
            <i class="fas fa-calendar-heart"></i>
            {{ weddingInfo.wedding_date }} {{ weddingInfo.wedding_time }}
          </p>
        </div>
        
        <div class="invitation-message">
          <p class="cherry-text" style="font-size: 1.1rem; text-align: center; line-height: 1.8;">
            봄바람에 흩날리는 벚꽃처럼<br>
            아름다운 사랑이 피어난 저희가<br>
            하나의 꿈을 향해 걸어가려 합니다.<br><br>
            소중한 분들을 모시고<br>
            저희의 첫걸음을 시작하려 하오니<br>
            바쁘시더라도 참석하시어<br>
            축복해 주시면 감사하겠습니다.
          </p>
        </div>
      </div>
    </section>

    <!-- 가족 소개 섹션 -->
    <section class="family-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title heart-decoration">가족 소개</h2>
        <div class="family-info">
          <div class="family-side">
            <h3 class="family-title">신랑측</h3>
            <div class="family-details">
              <p><strong>김민수</strong></p>
              <p>김아버지 · 김어머니의 장남</p>
              <p class="contact-info">
                <i class="fas fa-phone"></i>
                {{ weddingInfo.contact_groom }}
              </p>
            </div>
          </div>
          
          <div class="family-divider">
            <span class="cherry-title" style="font-size: 2rem;">💕</span>
          </div>
          
          <div class="family-side">
            <h3 class="family-title">신부측</h3>
            <div class="family-details">
              <p><strong>박지은</strong></p>
              <p>박아버지 · 박어머니의 장녀</p>
              <p class="contact-info">
                <i class="fas fa-phone"></i>
                {{ weddingInfo.contact_bride }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 웨딩 정보 섹션 -->
    <section class="wedding-info-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title heart-decoration">결혼식 안내</h2>
        <div class="wedding-details">
          <div class="info-item">
            <i class="fas fa-calendar-check icon"></i>
            <div class="info-content">
              <h4>날짜 & 시간</h4>
              <p>{{ formatDate(weddingInfo.wedding_date) }}</p>
              <p>{{ weddingInfo.wedding_time }}</p>
            </div>
          </div>
          
          <div class="info-item">
            <i class="fas fa-map-marker-alt icon"></i>
            <div class="info-content">
              <h4>장소</h4>
              <p><strong>{{ weddingInfo.venue_name }}</strong></p>
              <p>{{ weddingInfo.venue_address }}</p>
            </div>
          </div>
          
          <div class="info-item">
            <i class="fas fa-utensils icon"></i>
            <div class="info-content">
              <h4>식사 안내</h4>
              <p>예식 직후 피로연이 있습니다</p>
              <p>맛있는 식사를 준비하였습니다</p>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/location" class="cherry-btn">
            <i class="fas fa-map"></i> 오시는 길
          </router-link>
          <a href="tel:010-1234-5678" class="cherry-btn">
            <i class="fas fa-phone"></i> 연락하기
          </a>
        </div>
      </div>
    </section>

    <!-- D-Day 카운터 -->
    <section class="countdown-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title">결혼까지</h2>
        <div class="countdown-display">
          <div class="countdown-item" v-if="daysLeft > 0">
            <span class="countdown-number">{{ daysLeft }}</span>
            <span class="countdown-label">일 남았습니다</span>
          </div>
          <div class="countdown-item" v-else-if="daysLeft === 0">
            <span class="countdown-number">🎉</span>
            <span class="countdown-label">오늘이 바로 그 날!</span>
          </div>
          <div class="countdown-item" v-else>
            <span class="countdown-number">💕</span>
            <span class="countdown-label">행복한 결혼생활 중</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 갤러리 미리보기 -->
    <section class="gallery-preview-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title heart-decoration">우리의 추억</h2>
        <div class="preview-gallery" v-if="galleryImages.length > 0">
          <div 
            class="preview-image" 
            v-for="(image, index) in galleryImages.slice(0, 6)" 
            :key="image.id"
            @click="openImageModal(image)"
          >
            <img :src="`/uploads/${image.filename}`" :alt="image.caption" />
            <div class="image-overlay">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
        </div>
        <div class="preview-empty" v-else>
          <p class="cherry-text">아직 사진이 없습니다</p>
          <i class="fas fa-camera" style="font-size: 3rem; color: var(--cherry-light-pink); margin-top: 1rem;"></i>
        </div>
        <router-link to="/gallery" class="cherry-btn" style="margin-top: 1rem;">
          <i class="fas fa-images"></i> 더 많은 사진 보기
        </router-link>
      </div>
    </section>

    <!-- 방명록 미리보기 -->
    <section class="guestbook-preview-section slide-in-up">
      <div class="cherry-card">
        <h2 class="section-title cherry-title heart-decoration">축하 메시지</h2>
        <div class="preview-messages" v-if="recentMessages.length > 0">
          <div 
            class="message-item" 
            v-for="message in recentMessages.slice(0, 3)" 
            :key="message.id"
          >
            <div class="message-header">
              <span class="message-author">{{ message.name }}</span>
              <span class="message-date">{{ formatMessageDate(message.created_at) }}</span>
            </div>
            <p class="message-content">{{ message.message }}</p>
          </div>
        </div>
        <div class="preview-empty" v-else>
          <p class="cherry-text">첫 번째 축하 메시지를 남겨주세요</p>
          <i class="fas fa-heart" style="font-size: 3rem; color: var(--cherry-light-pink); margin-top: 1rem;"></i>
        </div>
        <router-link to="/guestbook" class="cherry-btn" style="margin-top: 1rem;">
          <i class="fas fa-pen"></i> 축하 메시지 남기기
        </router-link>
      </div>
    </section>

    <!-- 이미지 모달 -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">
          <i class="fas fa-times"></i>
        </button>
        <img :src="`/uploads/${selectedImage.filename}`" :alt="selectedImage.caption" />
        <p v-if="selectedImage.caption" class="modal-caption">{{ selectedImage.caption }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      weddingInfo: {
        bride_name: '지은',
        groom_name: '민수',
        wedding_date: '2024-05-18',
        wedding_time: '오후 2시 30분',
        venue_name: '벚꽃가든 웨딩홀',
        venue_address: '서울시 서초구 벚꽃로 456',
        contact_bride: '010-1234-5678',
        contact_groom: '010-9876-5432'
      },
      galleryImages: [],
      recentMessages: [],
      daysLeft: 0,
      selectedImage: null
    }
  },
  async mounted() {
    await this.loadWeddingInfo();
    await this.loadGalleryPreview();
    await this.loadRecentMessages();
    this.calculateDaysLeft();
    
    // 스크롤 애니메이션 초기화
    this.initScrollAnimations();
  },
  methods: {
    async loadWeddingInfo() {
      try {
        const response = await this.$http.get('/api/wedding-info');
        if (response.data) {
          this.weddingInfo = response.data;
        }
      } catch (error) {
        console.error('결혼 정보 로드 실패:', error);
      }
    },
    
    async loadGalleryPreview() {
      try {
        const response = await this.$http.get('/api/gallery');
        this.galleryImages = response.data || [];
      } catch (error) {
        console.error('갤러리 미리보기 로드 실패:', error);
      }
    },
    
    async loadRecentMessages() {
      try {
        const response = await this.$http.get('/api/guestbook');
        this.recentMessages = response.data || [];
      } catch (error) {
        console.error('방명록 미리보기 로드 실패:', error);
      }
    },
    
    calculateDaysLeft() {
      const today = new Date();
      const weddingDate = new Date(this.weddingInfo.wedding_date);
      const timeDifference = weddingDate.getTime() - today.getTime();
      this.daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      };
      return date.toLocaleDateString('ko-KR', options);
    },
    
    formatMessageDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    openImageModal(image) {
      this.selectedImage = image;
      document.body.style.overflow = 'hidden';
    },
    
    closeImageModal() {
      this.selectedImage = null;
      document.body.style.overflow = 'auto';
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
      
      // 모든 섹션을 감시
      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 히어로 섹션 */
.hero-section {
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-content {
  position: relative;
}

.couple-names {
  margin-bottom: 2rem;
}

.wedding-date {
  margin-bottom: 3rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  display: inline-block;
}

.date-text {
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--cherry-deep-pink);
}

.date-text i {
  margin-right: 0.5rem;
  color: var(--cherry-pink);
}

.invitation-message {
  max-width: 600px;
  margin: 0 auto;
}

/* 섹션 공통 스타일 */
.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

/* 가족 소개 섹션 */
.family-info {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.family-title {
  font-size: 1.3rem;
  color: var(--cherry-deep-pink);
  margin-bottom: 1rem;
  font-family: 'Noto Serif KR', serif;
}

.family-details p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.contact-info {
  color: var(--cherry-brown);
  font-size: 0.9rem;
  margin-top: 1rem;
}

.contact-info i {
  margin-right: 0.5rem;
  color: var(--cherry-pink);
}

.family-divider {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 웨딩 정보 섹션 */
.wedding-details {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 183, 197, 0.1);
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.info-item:hover {
  transform: translateX(5px);
}

.info-item .icon {
  font-size: 1.5rem;
  color: var(--cherry-pink);
  margin-right: 1rem;
  width: 30px;
  text-align: center;
}

.info-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--cherry-deep-pink);
  font-size: 1.1rem;
}

.info-content p {
  margin: 0.2rem 0;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 카운트다운 섹션 */
.countdown-display {
  text-align: center;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.countdown-number {
  font-size: 4rem;
  font-weight: bold;
  color: var(--cherry-deep-pink);
  line-height: 1;
}

.countdown-label {
  font-size: 1.2rem;
  color: var(--cherry-brown);
  font-family: 'Noto Serif KR', serif;
}

/* 갤러리 미리보기 */
.preview-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preview-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 1.5rem;
}

.preview-image:hover .image-overlay {
  opacity: 1;
}

/* 방명록 미리보기 */
.preview-messages {
  margin-bottom: 1rem;
}

.message-item {
  background: rgba(255, 183, 197, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border-left: 4px solid var(--cherry-pink);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-author {
  font-weight: 500;
  color: var(--cherry-deep-pink);
}

.message-date {
  font-size: 0.8rem;
  color: #999;
}

.message-content {
  line-height: 1.6;
  color: #555;
}

/* 빈 상태 */
.preview-empty {
  text-align: center;
  padding: 2rem;
  color: #999;
}

/* 이미지 모달 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  text-align: center;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 10px;
}

.modal-close {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--cherry-pink);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: var(--cherry-deep-pink);
}

.modal-caption {
  color: white;
  margin-top: 1rem;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
  }
  
  .couple-names h1 {
    font-size: 2.5rem !important;
  }
  
  .family-info {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
  
  .family-divider {
    order: -1;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .countdown-number {
    font-size: 3rem;
  }
  
  .preview-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .couple-names h1 {
    font-size: 2rem !important;
  }
  
  .wedding-date {
    margin-bottom: 2rem;
  }
  
  .date-text {
    font-size: 1.1rem;
  }
  
  .info-item {
    flex-direction: column;
    text-align: center;
  }
  
  .info-item .icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .countdown-number {
    font-size: 2.5rem;
  }
  
  .preview-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>