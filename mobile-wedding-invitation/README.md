# 💐 모바일 청첩장 (Mobile Wedding Invitation)

Vue3, Express, SQLite3를 사용한 화려하고 아름다운 모바일 최적화 청첩장 웹 애플리케이션입니다.

## ✨ 주요 기능

### 📱 사용자 기능
- **반응형 모바일 청첩장** - 아름다운 애니메이션과 인터랙티브 효과
- **참석 여부 확인** - 참석/불참석 선택 및 동반 인원 수 입력
- **방명록 작성** - 축하 메시지 작성 및 실시간 조회
- **결혼식 정보 조회** - 날짜, 시간, 장소 정보 및 D-Day 카운트다운
- **연락처 링크** - 신랑신부 전화번호 원터치 다이얼
- **지도 연동** - 카카오맵 연동으로 결혼식장 위치 확인

### 🔧 관리자 기능
- **결혼 정보 관리** - 신랑신부 정보, 결혼식 정보, 인사말 수정
- **참석자 관리** - 참석자 목록 조회 및 정보 수정
- **방명록 관리** - 방명록 목록 조회 및 관리
- **통계 대시보드** - 참석자 수, 방명록 수 등 실시간 통계

## 🛠 기술 스택

### Frontend
- **Vue 3** - Composition API 사용
- **Vue Router** - SPA 라우팅
- **Pinia** - 상태 관리
- **Axios** - HTTP 클라이언트
- **AOS (Animate On Scroll)** - 스크롤 애니메이션
- **Animate.css** - CSS 애니메이션
- **Vite** - 개발 서버 및 빌드 도구

### Backend
- **Express.js** - Node.js 웹 프레임워크
- **SQLite3** - 임베디드 데이터베이스
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - 보안 헤더 설정
- **Body-parser** - 요청 데이터 파싱

### Design & UX
- **모바일 우선 반응형 디자인**
- **골드 & 로즈 컬러 테마**
- **부드러운 그라데이션 배경**
- **플로팅 하트 애니메이션**
- **터치 친화적 UI/UX**

## 📁 프로젝트 구조

```
mobile-wedding-invitation/
├── server/                 # 백엔드 서버
│   └── index.js           # Express 서버 설정
├── client/                # 프론트엔드 앱
│   ├── public/
│   ├── src/
│   │   ├── components/    # Vue 컴포넌트
│   │   │   ├── Notification.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   └── FloatingHearts.vue
│   │   ├── views/         # 페이지 컴포넌트
│   │   │   ├── Home.vue   # 메인 청첩장
│   │   │   ├── Admin.vue  # 관리자 페이지
│   │   │   ├── RSVP.vue   # 참석 여부 확인
│   │   │   └── Guestbook.vue # 방명록
│   │   ├── stores/        # Pinia 스토어
│   │   │   └── wedding.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css      # 글로벌 스타일
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json           # 루트 패키지 설정
├── wedding.db            # SQLite 데이터베이스 (자동 생성)
└── README.md
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd mobile-wedding-invitation
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서 백엔드 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd client
npm install
cd ..
```

### 3. 개발 모드 실행
```bash
# 동시에 백엔드/프론트엔드 서버 실행
npm run dev
```

또는 개별 실행:
```bash
# 백엔드 서버 (포트 5000)
npm run server:dev

# 프론트엔드 서버 (포트 3000)
npm run client:dev
```

### 4. 프로덕션 빌드
```bash
# 프론트엔드 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📊 데이터베이스 스키마

### wedding_info (결혼 정보)
```sql
- id: INTEGER PRIMARY KEY
- groom_name: TEXT (신랑 이름)
- bride_name: TEXT (신부 이름)
- wedding_date: TEXT (결혼식 날짜)
- wedding_time: TEXT (결혼식 시간)
- venue_name: TEXT (결혼식장 이름)
- venue_address: TEXT (결혼식장 주소)
- venue_phone: TEXT (결혼식장 전화번호)
- groom_father: TEXT (신랑 아버지)
- groom_mother: TEXT (신랑 어머니)
- bride_father: TEXT (신부 아버지)
- bride_mother: TEXT (신부 어머니)
- groom_phone: TEXT (신랑 연락처)
- bride_phone: TEXT (신부 연락처)
- wedding_photo: TEXT (결혼 사진)
- greeting_message: TEXT (인사말)
- created_at: DATETIME
- updated_at: DATETIME
```

### guests (참석자 정보)
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (이름)
- phone: TEXT (연락처)
- attendance: TEXT (참석여부: '참석', '불참석', '미정')
- guest_count: INTEGER (참석 인원)
- message: TEXT (메시지)
- created_at: DATETIME
```

### guestbook (방명록)
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (작성자 이름)
- message: TEXT (축하 메시지)
- created_at: DATETIME
```

## 🎨 디자인 컨셉

### 컬러 팔레트
- **Primary Gold**: `#d4af37` - 고급스러운 골드
- **Secondary Cream**: `#f8f4e6` - 부드러운 크림
- **Accent Brown**: `#8b7355` - 따뜻한 브라운
- **Text Dark**: `#2c2c2c` - 진한 회색
- **Background Gradient**: 로즈 골드 그라데이션

### 애니메이션 효과
- **AOS (Animate On Scroll)** - 스크롤 기반 애니메이션
- **CSS Keyframe Animations** - 커스텀 애니메이션
  - 플로팅 효과 (Floating)
  - 펄스 효과 (Pulse)
  - 하트비트 효과 (HeartBeat)
  - 글로우 효과 (Glow)
  - 스파클 효과 (Sparkle)

### 모바일 최적화
- **터치 친화적 UI** - 44px 이상 터치 영역
- **iOS Safari 호환성** - 16px 폰트로 줌 방지
- **PWA 준비** - 메타 태그 및 뷰포트 설정
- **고해상도 디스플레이 지원** - Retina 최적화

## 📱 주요 페이지

### 1. 홈페이지 (`/`)
- 메인 청첩장 화면
- 신랑신부 정보 및 결혼식 정보
- D-Day 카운트다운
- 연락처 및 액션 버튼

### 2. 참석 여부 확인 (`/rsvp`)
- 참석/불참석/미정 선택
- 동반 인원 수 입력
- 축하 메시지 작성
- 결혼식장 정보 및 지도 연동

### 3. 방명록 (`/guestbook`)
- 축하 메시지 작성
- 실시간 메시지 목록 조회
- 감사 모달 및 인터랙션

### 4. 관리자 페이지 (`/admin`)
- 결혼 정보 수정
- 참석자 관리
- 방명록 관리
- 통계 대시보드

## 🔧 API 엔드포인트

### 결혼 정보
- `GET /api/wedding-info` - 결혼 정보 조회
- `PUT /api/wedding-info` - 결혼 정보 수정

### 참석자 관리
- `GET /api/guests` - 참석자 목록 조회
- `POST /api/guests` - 참석자 등록
- `PUT /api/guests/:id` - 참석자 정보 수정

### 방명록
- `GET /api/guestbook` - 방명록 목록 조회
- `POST /api/guestbook` - 방명록 작성

### 통계
- `GET /api/stats` - 통계 정보 조회

## 🌟 특별한 기능들

### 1. 실시간 D-Day 카운트다운
결혼식까지 남은 일수를 실시간으로 계산하여 표시합니다.

### 2. 플로팅 하트 애니메이션
배경에 떠다니는 하트 이모지로 로맨틱한 분위기를 연출합니다.

### 3. 스크롤 애니메이션
페이지 스크롤 시 요소들이 부드럽게 나타나는 애니메이션 효과입니다.

### 4. 터치 최적화
모바일 디바이스에서 최적의 사용자 경험을 제공합니다.

### 5. 샘플 데이터
초기 실행 시 샘플 결혼 정보가 자동으로 생성되어 바로 테스트 가능합니다.

## 🔒 보안 고려사항

- **Helmet.js** - HTTP 보안 헤더 설정
- **CORS** - Cross-Origin 요청 보안
- **SQL Injection 방지** - Prepared Statement 사용
- **입력 데이터 검증** - 클라이언트/서버 양측 검증

## 🚀 배포 가이드

### 1. 환경 변수 설정
```bash
NODE_ENV=production
PORT=5000
```

### 2. 빌드 및 배포
```bash
# 프론트엔드 빌드
npm run build

# PM2를 사용한 프로덕션 서버 실행
pm2 start server/index.js --name "wedding-invitation"
```

### 3. Nginx 설정 (선택사항)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠 커스터마이징

### 1. 컬러 테마 변경
`client/src/style.css` 파일의 CSS 변수를 수정하세요:
```css
:root {
  --primary-color: #d4af37;
  --secondary-color: #f8f4e6;
  --accent-color: #8b7355;
  /* 원하는 컬러로 변경 */
}
```

### 2. 애니메이션 효과 조정
`client/src/main.js`에서 AOS 설정을 변경하세요:
```javascript
AOS.init({
  duration: 800,    // 애니메이션 지속 시간
  easing: 'ease-in-out',
  once: true,       // 한 번만 실행
  mirror: false     // 스크롤 업 시 애니메이션 반복
})
```

### 3. 샘플 데이터 변경
`server/index.js`의 `sampleData` 객체를 수정하여 기본 결혼 정보를 변경할 수 있습니다.

## 📞 문의사항

프로젝트 관련 문의사항이나 버그 리포트는 이슈를 통해 알려주세요.

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

💝 **아름다운 청첩장으로 특별한 날을 더욱 빛나게 만들어보세요!** 💝