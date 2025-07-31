<template>
  <div id="app" class="app">
    <router-view />
    <Notification v-if="notification.show" :type="notification.type" :message="notification.message" />
  </div>
</template>

<script>
import { ref } from 'vue'
import Notification from './components/Notification.vue'

export default {
  name: 'App',
  components: {
    Notification
  },
  setup() {
    const notification = ref({
      show: false,
      type: 'success',
      message: ''
    })

    return {
      notification
    }
  }
}
</script>