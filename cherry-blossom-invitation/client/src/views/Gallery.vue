<template>
  <div class="gallery-container">
    <div class="cherry-card">
      <h1 class="page-title cherry-title heart-decoration">갤러리</h1>
      <p class="page-subtitle cherry-text">우리의 아름다운 추억들</p>

      <!-- 이미지 업로드 섹션 -->
      <div class="upload-section">
        <h3 class="section-title">사진 업로드</h3>
        <form @submit.prevent="uploadImage" class="upload-form">
          <div class="file-input-wrapper">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              class="file-input"
              id="imageFile"
            />
            <label for="imageFile" class="file-label cherry-btn">
              <i class="fas fa-camera"></i>
              {{ selectedFile ? selectedFile.name : '사진 선택' }}
            </label>
          </div>
          
          <div class="caption-input">
            <input 
              type="text" 
              v-model="caption"
              placeholder="사진 설명을 입력하세요 (선택사항)"
              class="cherry-input"
            />
          </div>
          
          <button 
            type="submit" 
            class="cherry-btn cherry-btn-primary"
            :disabled="!selectedFile || uploading"
          >
            <i class="fas fa-upload"></i>
            {{ uploading ? '업로드 중...' : '사진 업로드' }}
          </button>
        </form>
      </div>

      <!-- 갤러리 그리드 -->
      <div class="gallery-grid" v-if="images.length > 0">
        <div 
          class="gallery-item"
          v-for="image in images"
          :key="image.id"
          @click="openModal(image)"
        >
          <img :src="`/uploads/${image.filename}`" :alt="image.caption || '갤러리 이미지'" />
          <div class="image-overlay">
            <i class="fas fa-search-plus"></i>
            <p v-if="image.caption" class="image-caption">{{ image.caption }}</p>
          </div>
        </div>
      </div>
      
      <!-- 빈 갤러리 -->
      <div v-else class="empty-gallery">
        <i class="fas fa-images"></i>
        <p>아직 업로드된 사진이 없습니다</p>
        <p class="sub-text">첫 번째 추억을 공유해보세요!</p>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="selectedImage" class="image-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
        <img :src="`/uploads/${selectedImage.filename}`" :alt="selectedImage.caption" />
        <div class="modal-info">
          <p v-if="selectedImage.caption" class="modal-caption">{{ selectedImage.caption }}</p>
          <p class="modal-date">{{ formatDate(selectedImage.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- 메시지 토스트 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Gallery',
  data() {
    return {
      images: [],
      selectedFile: null,
      caption: '',
      uploading: false,
      selectedImage: null,
      message: '',
      messageType: 'success'
    }
  },
  async mounted() {
    await this.loadImages()
  },
  methods: {
    async loadImages() {
      try {
        const response = await axios.get('/api/gallery')
        this.images = response.data || []
      } catch (error) {
        console.error('갤러리 로드 실패:', error)
        this.showMessage('갤러리를 불러오는데 실패했습니다.', 'error')
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB 제한
          this.showMessage('파일 크기는 5MB를 초과할 수 없습니다.', 'error')
          return
        }
        this.selectedFile = file
      }
    },

    async uploadImage() {
      if (!this.selectedFile) {
        this.showMessage('업로드할 파일을 선택해주세요.', 'error')
        return
      }

      this.uploading = true
      const formData = new FormData()
      formData.append('image', this.selectedFile)
      formData.append('caption', this.caption)

      try {
        await axios.post('/api/gallery', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        this.showMessage('사진이 성공적으로 업로드되었습니다!', 'success')
        this.resetForm()
        await this.loadImages()
      } catch (error) {
        console.error('업로드 실패:', error)
        this.showMessage('업로드에 실패했습니다. 다시 시도해주세요.', 'error')
      } finally {
        this.uploading = false
      }
    },

    resetForm() {
      this.selectedFile = null
      this.caption = ''
      this.$refs.fileInput.value = ''
    },

    openModal(image) {
      this.selectedImage = image
      document.body.style.overflow = 'hidden'
    },

    closeModal() {
      this.selectedImage = null
      document.body.style.overflow = 'auto'
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.gallery-container {
  max-width: 1000px;
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
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--cherry-brown);
}

/* 업로드 섹션 */
.upload-section {
  background: rgba(255, 183, 197, 0.1);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.3rem;
  color: var(--cherry-deep-pink);
  margin-bottom: 1rem;
  text-align: center;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 250px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.caption-input {
  width: 100%;
  max-width: 400px;
}

/* 갤러리 그리드 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item img {
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
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  padding: 1rem;
  text-align: center;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-caption {
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 빈 갤러리 */
.empty-gallery {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-gallery i {
  font-size: 4rem;
  color: var(--cherry-light-pink);
  margin-bottom: 1rem;
}

.empty-gallery p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.sub-text {
  font-size: 0.9rem;
  color: #bbb;
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
  top: -15px;
  right: -15px;
  background: var(--cherry-pink);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
  z-index: 1001;
}

.modal-close:hover {
  background: var(--cherry-deep-pink);
}

.modal-info {
  color: white;
  margin-top: 1rem;
}

.modal-caption {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.modal-date {
  font-size: 0.9rem;
  color: #ccc;
}

/* 메시지 토스트 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message-toast.success {
  background: #4CAF50;
  color: white;
}

.message-toast.error {
  background: #f44336;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .upload-section {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-form {
    gap: 0.8rem;
  }
  
  .caption-input {
    max-width: 100%;
  }
  
  .file-label {
    max-width: 200px;
  }
}
</style>