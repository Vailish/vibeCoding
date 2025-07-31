<template>
  <div id="app" class="cherry-blossom-bg">
    <!-- 벚꽃 떨어지는 애니메이션 -->
    <div class="cherry-petals" ref="cherryPetals"></div>
    
    <!-- 내비게이션 -->
    <nav class="cherry-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <span class="cherry-title" style="font-size: 1.5rem;">🌸 Ji-eun ♥ Min-su</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/">초대장</router-link>
          <router-link to="/gallery">갤러리</router-link>
          <router-link to="/location">오시는 길</router-link>
          <router-link to="/guestbook">방명록</router-link>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </main>

    <!-- 푸터 -->
    <footer class="cherry-footer">
      <div class="footer-content">
        <p class="cherry-text">
          🌸 사랑이 꽃피우는 아름다운 순간을 함께해주세요 🌸
        </p>
        <p class="footer-love">
          Made with 💕 for Ji-eun & Min-su
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.createCherryPetals();
    this.startPetalAnimation();
  },
  methods: {
    createCherryPetals() {
      const petalsContainer = this.$refs.cherryPetals;
      const petalCount = 15;
      
      // 기존 꽃잎들 제거
      petalsContainer.innerHTML = '';
      
      for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'cherry-petal';
        petal.innerHTML = '🌸';
        
        // 랜덤 위치와 애니메이션 지연 시간 설정
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 10;
        const randomDuration = 10 + Math.random() * 10;
        
        petal.style.cssText = `
          position: fixed;
          left: ${randomX}%;
          top: -20px;
          font-size: ${0.8 + Math.random() * 0.4}rem;
          opacity: ${0.6 + Math.random() * 0.4};
          pointer-events: none;
          z-index: 1;
          animation: fallDown ${randomDuration}s linear ${randomDelay}s infinite;
        `;
        
        petalsContainer.appendChild(petal);
      }
    },
    
    startPetalAnimation() {
      // CSS 키프레임 애니메이션 동적 생성
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fallDown {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .cherry-petal {
          animation-timing-function: ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
</script>

<style>
@import './assets/styles/main.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 내비게이션 스타일 개선 */
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-logo {
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* 페이지 전환 애니메이션 */
.page-enter-active, .page-leave-active {
  transition: all 0.5s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 푸터 스타일 */
.cherry-footer {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 183, 197, 0.2);
  margin-top: 2rem;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-love {
  font-size: var(--font-sm);
  color: var(--cherry-brown);
  margin-top: 1rem;
  font-style: italic;
}

/* 벚꽃 떨어지는 애니메이션 컨테이너 */
.cherry-petals {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

/* 반응형 내비게이션 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .cherry-footer {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .nav-links a {
    font-size: 0.85rem;
    padding: 0.4rem 0.7rem;
  }
  
  .cherry-nav {
    margin: 0.5rem;
    padding: 1rem;
  }
}
</style>