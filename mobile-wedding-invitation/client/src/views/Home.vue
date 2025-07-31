<template>
  <div class="home">
    <FloatingHearts :count="6" />
    <div class="flower-decoration" style="top: 10%; left: 10%;">🌸</div>
    <div class="flower-decoration" style="top: 20%; right: 15%;">🌺</div>
    <div class="flower-decoration" style="top: 70%; left: 5%;">🌹</div>
    <div class="flower-decoration" style="bottom: 10%; right: 10%;">🌻</div>

    <section class="hero-section">
      <div class="container">
        <div class="hero-content" data-aos="fade-up">
          <div class="wedding-rings pulse">💍</div>
          <h1 class="hero-title gradient-text glow">Wedding Invitation</h1>
          <div class="decorative-line"></div>
          <p class="hero-subtitle">우리의 특별한 날에 초대합니다</p>
        </div>
      </div>
    </section>

    <section class="couple-section section">
      <div class="container">
        <div class="card sparkle" data-aos="zoom-in">
          <div class="couple-names">
            <div class="groom-info slide-in-left" data-aos="fade-right" data-aos-delay="200">
              <div class="family-info">
                <small>{{ weddingInfo.groom_father }} · {{ weddingInfo.groom_mother }}의 아들</small>
              </div>
              <h2 class="name">{{ weddingInfo.groom_name }}</h2>
            </div>
            
            <div class="heart-divider heart-beat" data-aos="pulse" data-aos-delay="400">💝</div>
            
            <div class="bride-info slide-in-right" data-aos="fade-left" data-aos-delay="600">
              <div class="family-info">
                <small>{{ weddingInfo.bride_father }} · {{ weddingInfo.bride_mother }}의 딸</small>
              </div>
              <h2 class="name">{{ weddingInfo.bride_name }}</h2>
            </div>
          </div>
          
          <div class="greeting-message" data-aos="fade-up" data-aos-delay="800">
            <p>{{ weddingInfo.greeting_message }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="wedding-info-section section">
      <div class="container">
        <h2 class="section-title" data-aos="fade-up">Wedding Details</h2>
        
        <div class="card" data-aos="fade-up" data-aos-delay="200">
          <div class="wedding-details">
            <div class="detail-item">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <h3>날짜</h3>
                <p>{{ formatWeddingDate }}</p>
                <div class="countdown" v-if="daysUntilWedding > 0">
                  <span class="countdown-text">D-{{ daysUntilWedding }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-icon">🕐</div>
              <div class="detail-content">
                <h3>시간</h3>
                <p>{{ weddingInfo.wedding_time }}</p>
              </div>
            </div>
            
            <div class="detail-item">
              <div class="detail-icon">🏛️</div>
              <div class="detail-content">
                <h3>장소</h3>
                <p><strong>{{ weddingInfo.venue_name }}</strong></p>
                <p class="address">{{ weddingInfo.venue_address }}</p>
                <p class="phone">{{ weddingInfo.venue_phone }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="contact-section section">
      <div class="container">
        <h2 class="section-title" data-aos="fade-up">연락처</h2>
        
        <div class="contact-cards" data-aos="fade-up" data-aos-delay="200">
          <div class="contact-card">
            <h3>신랑측</h3>
            <p class="name">{{ weddingInfo.groom_name }}</p>
            <a :href="`tel:${weddingInfo.groom_phone}`" class="phone-link">
              📞 {{ weddingInfo.groom_phone }}
            </a>
          </div>
          
          <div class="contact-card">
            <h3>신부측</h3>
            <p class="name">{{ weddingInfo.bride_name }}</p>
            <a :href="`tel:${weddingInfo.bride_phone}`" class="phone-link">
              📞 {{ weddingInfo.bride_phone }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="action-section section">
      <div class="container">
        <div class="action-buttons" data-aos="fade-up">
          <router-link to="/rsvp" class="btn btn-primary">
            💌 참석 여부 알려주기
          </router-link>
          <router-link to="/guestbook" class="btn btn-secondary">
            📝 방명록 작성하기
          </router-link>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <p class="footer-text" data-aos="fade-up">
          💕 {{ weddingInfo.groom_name }} & {{ weddingInfo.bride_name }} 💕
        </p>
        <router-link to="/admin" class="admin-link">관리자</router-link>
      </div>
    </footer>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useWeddingStore } from '../stores/wedding'
import FloatingHearts from '../components/FloatingHearts.vue'

export default {
  name: 'Home',
  components: {
    FloatingHearts
  },
  setup() {
    const weddingStore = useWeddingStore()

    onMounted(async () => {
      await weddingStore.getWeddingInfo()
    })

    return {
      weddingInfo: weddingStore.weddingInfo,
      daysUntilWedding: weddingStore.daysUntilWedding,
      formatWeddingDate: weddingStore.formatWeddingDate
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #ffeef7 0%, #f8e8f0 50%, #ffd7e8 100%);
}

.hero-section {
  padding: 60px 0;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 238, 247, 0.9) 0%, rgba(248, 232, 240, 0.9) 100%);
}

.hero-content {
  max-width: 350px;
  margin: 0 auto;
}

.wedding-rings {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: floating 3s ease-in-out infinite;
}

.hero-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  margin-top: 20px;
}

.couple-section {
  background: rgba(255, 255, 255, 0.7);
}

.couple-names {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.groom-info, .bride-info {
  text-align: center;
}

.family-info {
  margin-bottom: 10px;
}

.family-info small {
  color: var(--text-light);
  font-size: 0.9rem;
}

.name {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.heart-divider {
  font-size: 2rem;
  margin: 10px 0;
}

.greeting-message {
  text-align: center;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-dark);
  padding: 20px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 15px;
  border-left: 4px solid var(--primary-color);
}

.wedding-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(248, 244, 230, 0.5);
  border-radius: 12px;
}

.detail-icon {
  font-size: 1.5rem;
  margin-top: 5px;
}

.detail-content h3 {
  margin: 0 0 8px 0;
  color: var(--primary-color);
  font-weight: 600;
}

.detail-content p {
  margin: 4px 0;
  color: var(--text-dark);
}

.address {
  color: var(--text-light) !important;
  font-size: 0.9rem;
}

.phone {
  color: var(--text-light) !important;
  font-size: 0.9rem;
}

.countdown {
  margin-top: 10px;
}

.countdown-text {
  background: var(--gradient-gold);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.contact-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.contact-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.contact-card h3 {
  margin: 0 0 10px 0;
  color: var(--primary-color);
  font-size: 1rem;
}

.contact-card .name {
  font-size: 1.3rem;
  margin: 8px 0;
}

.phone-link {
  display: inline-block;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-top: 8px;
  transition: color 0.3s ease;
}

.phone-link:hover {
  color: var(--accent-color);
}

.action-section {
  padding: 40px 0 60px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 280px;
  margin: 0 auto;
}

.btn-primary {
  background: var(--gradient-gold);
  font-size: 1.1rem;
  padding: 15px 30px;
}

.footer {
  background: rgba(44, 44, 44, 0.9);
  color: white;
  padding: 30px 0;
  text-align: center;
}

.footer-text {
  font-family: 'Dancing Script', cursive;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.admin-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.admin-link:hover {
  color: white;
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .wedding-rings {
    font-size: 3rem;
  }
  
  .name {
    font-size: 2rem;
  }
  
  .contact-cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>