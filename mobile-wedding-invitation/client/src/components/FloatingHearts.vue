<template>
  <div class="floating-hearts">
    <div 
      v-for="heart in hearts" 
      :key="heart.id"
      class="floating-heart"
      :style="heart.style"
    >
      {{ heart.emoji }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'FloatingHearts',
  props: {
    count: {
      type: Number,
      default: 8
    }
  },
  setup(props) {
    const hearts = ref([])
    let heartId = 0
    let intervalId = null

    const heartEmojis = ['💖', '💕', '💗', '💝', '🌹', '🌸', '🌺', '🌻']

    const createHeart = () => {
      const heart = {
        id: heartId++,
        emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        style: {
          left: Math.random() * 100 + '%',
          animationDuration: (Math.random() * 3 + 2) + 's',
          animationDelay: Math.random() * 2 + 's',
          fontSize: (Math.random() * 1 + 1) + 'rem',
          opacity: Math.random() * 0.5 + 0.3
        }
      }
      
      hearts.value.push(heart)
      
      setTimeout(() => {
        const index = hearts.value.findIndex(h => h.id === heart.id)
        if (index > -1) {
          hearts.value.splice(index, 1)
        }
      }, 5000)
    }

    onMounted(() => {
      for (let i = 0; i < props.count; i++) {
        setTimeout(() => createHeart(), i * 500)
      }
      
      intervalId = setInterval(() => {
        if (hearts.value.length < props.count) {
          createHeart()
        }
      }, 3000)
    })

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })

    return {
      hearts
    }
  }
}
</script>

<style scoped>
.floating-hearts {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.floating-heart {
  position: absolute;
  bottom: -50px;
  animation: floatUp linear infinite;
  pointer-events: none;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>