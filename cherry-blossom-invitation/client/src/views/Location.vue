<template>
  <div class="location-container">
    <div class="cherry-card">
      <h1 class="page-title cherry-title heart-decoration">오시는 길</h1>
      <p class="page-subtitle cherry-text">{{ weddingInfo.venue_name }}</p>

      <!-- 웨딩홀 정보 -->
      <div class="venue-info">
        <div class="info-card">
          <h3 class="venue-name">{{ weddingInfo.venue_name }}</h3>
          <div class="venue-details">
            <div class="detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ weddingInfo.venue_address }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-calendar-check"></i>
              <span>{{ formatDate(weddingInfo.wedding_date) }} {{ weddingInfo.wedding_time }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <span>문의: 02-1234-5678</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 지도 섹션 -->
      <div class="map-section">
        <h3 class="section-title">지도</h3>
        <div class="map-placeholder">
          <i class="fas fa-map"></i>
          <p>지도를 표시하려면 지도 API 설정이 필요합니다.</p>
          <div class="map-links">
            <a href="#" class="map-link" @click="openNaverMap">
              <i class="fas fa-external-link-alt"></i>
              네이버 지도에서 보기
            </a>
            <a href="#" class="map-link" @click="openKakaoMap">
              <i class="fas fa-external-link-alt"></i>
              카카오맵에서 보기
            </a>
            <a href="#" class="map-link" @click="openGoogleMap">
              <i class="fas fa-external-link-alt"></i>
              구글 지도에서 보기
            </a>
          </div>
        </div>
      </div>

      <!-- 교통 안내 -->
      <div class="transportation-section">
        <h3 class="section-title">교통 안내</h3>
        
        <div class="transport-grid">
          <!-- 지하철 -->
          <div class="transport-card">
            <div class="transport-header">
              <i class="fas fa-subway"></i>
              <h4>지하철</h4>
            </div>
            <div class="transport-content">
              <div class="route-item">
                <span class="line line-2">2호선</span>
                <span class="station">강남역 3번 출구</span>
                <span class="distance">도보 5분</span>
              </div>
              <div class="route-item">
                <span class="line line-9">9호선</span>
                <span class="station">신논현역 1번 출구</span>
                <span class="distance">도보 7분</span>
              </div>
            </div>
          </div>

          <!-- 버스 -->
          <div class="transport-card">
            <div class="transport-header">
              <i class="fas fa-bus"></i>
              <h4>버스</h4>
            </div>
            <div class="transport-content">
              <div class="bus-routes">
                <div class="bus-group">
                  <span class="bus-type blue">간선</span>
                  <span class="bus-numbers">146, 360, 740</span>
                </div>
                <div class="bus-group">
                  <span class="bus-type green">지선</span>
                  <span class="bus-numbers">3412, 4318</span>
                </div>
                <p class="bus-stop">강남역 정류장 하차</p>
              </div>
            </div>
          </div>

          <!-- 자가용 -->
          <div class="transport-card">
            <div class="transport-header">
              <i class="fas fa-car"></i>
              <h4>자가용</h4>
            </div>
            <div class="transport-content">
              <div class="parking-info">
                <div class="parking-item">
                  <i class="fas fa-parking"></i>
                  <span>건물 지하 1~3층 주차장 이용</span>
                </div>
                <div class="parking-item">
                  <i class="fas fa-clock"></i>
                  <span>3시간 무료 주차 가능</span>
                </div>
                <div class="parking-item">
                  <i class="fas fa-info-circle"></i>
                  <span>발렛파킹 서비스 제공</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 주의사항 -->
      <div class="notice-section">
        <h3 class="section-title">주의사항</h3>
        <div class="notice-content">
          <div class="notice-item">
            <i class="fas fa-exclamation-triangle"></i>
            <p>주말에는 교통이 혼잡할 수 있으니 여유 시간을 두고 출발해 주세요.</p>
          </div>
          <div class="notice-item">
            <i class="fas fa-mask"></i>
            <p>코로나19 방역수칙을 준수하여 마스크를 착용해 주세요.</p>
          </div>
          <div class="notice-item">
            <i class="fas fa-gift"></i>
            <p>축의금은 웨딩홀 1층 리셉션에서 접수해 주시기 바랍니다.</p>
          </div>
        </div>
      </div>

      <!-- 연락처 -->
      <div class="contact-section">
        <h3 class="section-title">연락처</h3>
        <div class="contact-grid">
          <div class="contact-card">
            <h4>신랑측</h4>
            <div class="contact-info">
              <div class="contact-item">
                <span class="name">김민수</span>
                <a :href="`tel:${weddingInfo.contact_groom}`" class="phone-link">
                  {{ weddingInfo.contact_groom }}
                </a>
              </div>
            </div>
          </div>
          <div class="contact-card">
            <h4>신부측</h4>
            <div class="contact-info">
              <div class="contact-item">
                <span class="name">박지은</span>
                <a :href="`tel:${weddingInfo.contact_bride}`" class="phone-link">
                  {{ weddingInfo.contact_bride }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Location',
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
      }
    }
  },
  async mounted() {
    await this.loadWeddingInfo()
  },
  methods: {
    async loadWeddingInfo() {
      try {
        const response = await axios.get('/api/wedding-info')
        if (response.data) {
          this.weddingInfo = response.data
        }
      } catch (error) {
        console.error('결혼 정보 로드 실패:', error)
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    },

    openNaverMap() {
      const query = encodeURIComponent(this.weddingInfo.venue_address)
      window.open(`https://map.naver.com/v5/search/${query}`, '_blank')
    },

    openKakaoMap() {
      const query = encodeURIComponent(this.weddingInfo.venue_address)
      window.open(`https://map.kakao.com/link/search/${query}`, '_blank')
    },

    openGoogleMap() {
      const query = encodeURIComponent(this.weddingInfo.venue_address)
      window.open(`https://maps.google.com/maps?q=${query}`, '_blank')
    }
  }
}
</script>

<style scoped>
.location-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  font-size: 1.3rem;
  margin-bottom: 2rem;
  color: var(--cherry-brown);
  font-weight: 500;
}

.section-title {
  font-size: 1.5rem;
  color: var(--cherry-deep-pink);
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: var(--cherry-pink);
}

/* 웨딩홀 정보 */
.venue-info {
  margin-bottom: 3rem;
}

.info-card {
  background: linear-gradient(135deg, var(--cherry-light-pink), var(--cherry-pink));
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 8px 25px rgba(255, 183, 197, 0.3);
}

.venue-name {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.venue-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 1.1rem;
}

.detail-item i {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

/* 지도 섹션 */
.map-section {
  margin-bottom: 3rem;
}

.map-placeholder {
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  color: #666;
}

.map-placeholder i {
  font-size: 3rem;
  color: var(--cherry-light-pink);
  margin-bottom: 1rem;
}

.map-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.map-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--cherry-pink);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.map-link:hover {
  background: var(--cherry-deep-pink);
  transform: translateY(-2px);
}

/* 교통 안내 */
.transportation-section {
  margin-bottom: 3rem;
}

.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.transport-card {
  background: white;
  border: 2px solid var(--cherry-light-pink);
  border-radius: 15px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.transport-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255, 183, 197, 0.2);
}

.transport-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.transport-header i {
  font-size: 1.5rem;
  color: var(--cherry-pink);
}

.transport-header h4 {
  font-size: 1.3rem;
  color: var(--cherry-deep-pink);
  margin: 0;
}

.transport-content {
  color: #555;
}

/* 지하철 스타일 */
.route-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  padding: 0.5rem;
  background: rgba(255, 183, 197, 0.1);
  border-radius: 8px;
}

.line {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  color: white;
  font-weight: 500;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: center;
}

.line-2 { background: #00A84D; }
.line-9 { background: #BDB092; }

.station {
  font-weight: 500;
  flex: 1;
}

.distance {
  color: var(--cherry-brown);
  font-size: 0.9rem;
}

/* 버스 스타일 */
.bus-routes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bus-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.bus-type {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.bus-type.blue { background: #1E88E5; }
.bus-type.green { background: #43A047; }

.bus-numbers {
  font-weight: 500;
}

.bus-stop {
  margin-top: 0.5rem;
  color: var(--cherry-brown);
  font-style: italic;
}

/* 주차 정보 */
.parking-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.parking-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem;
  background: rgba(255, 183, 197, 0.1);
  border-radius: 8px;
}

.parking-item i {
  color: var(--cherry-pink);
  width: 20px;
  text-align: center;
}

/* 주의사항 */
.notice-section {
  margin-bottom: 3rem;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 183, 197, 0.1);
  border-radius: 15px;
  border-left: 4px solid var(--cherry-pink);
}

.notice-item i {
  color: var(--cherry-pink);
  font-size: 1.2rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.notice-item p {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

/* 연락처 */
.contact-section {
  margin-bottom: 2rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  background: linear-gradient(135deg, var(--cherry-light-pink), var(--cherry-pink));
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  color: white;
}

.contact-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name {
  font-size: 1.1rem;
  font-weight: 500;
}

.phone-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  transition: background 0.3s ease;
}

.phone-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .venue-details {
    text-align: left;
  }
  
  .detail-item {
    justify-content: flex-start;
  }
  
  .transport-grid {
    grid-template-columns: 1fr;
  }
  
  .map-links {
    flex-direction: column;
    align-items: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .route-item,
  .parking-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .bus-group {
    flex-wrap: wrap;
  }
  
  .map-placeholder {
    padding: 2rem 1rem;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>