<template>
  <div class="notification" :class="[type, { show: visible }]">
    <div class="notification-content">
      <span class="notification-icon">{{ getIcon() }}</span>
      <span class="notification-message">{{ message }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Notification',
  props: {
    type: {
      type: String,
      default: 'success'
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  setup(props) {
    const visible = ref(false)

    const getIcon = () => {
      switch (props.type) {
        case 'success': return '✅'
        case 'error': return '❌'
        case 'warning': return '⚠️'
        default: return 'ℹ️'
      }
    }

    onMounted(() => {
      setTimeout(() => {
        visible.value = true
      }, 100)

      setTimeout(() => {
        visible.value = false
      }, props.duration)
    })

    return {
      visible,
      getIcon
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  max-width: 300px;
}

.notification.show {
  transform: translateX(0);
}

.notification.success {
  border-left-color: #4caf50;
}

.notification.error {
  border-left-color: #f44336;
}

.notification.warning {
  border-left-color: #ff9800;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  font-size: 16px;
}

.notification-message {
  font-size: 14px;
  color: var(--text-dark);
  line-height: 1.4;
}
</style>