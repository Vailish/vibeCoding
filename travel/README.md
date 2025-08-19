# 🌟 Travel Planner

개인 여행 계획 및 예산 관리를 위한 종합 웹 애플리케이션입니다. 여행 계획 수립부터 실제 여행 중 예산 추적까지 모든 것을 한 곳에서 관리할 수 있습니다.

## ✨ 주요 기능

### 📅 **스마트 일정 관리**
- **날짜별 일정 구성**: 여행 기간에 따른 자동 날짜 분할
- **상세 일정 계획**: 시간, 장소, 예상 비용, 메모 등 상세 정보 입력
- **실시간 완료 추적**: 클릭 한 번으로 일정 완료/미완료 토글
- **직관적인 UI**: 드래그 앤 드롭, 모달 폼 등 사용자 친화적 인터페이스

### 💰 **똑똑한 예산 관리**
- **예산 vs 실제 지출 비교**: 실시간 예산 상태 모니터링
- **색상 코딩 시스템**: 
  - 🟢 예산 내/절약 (녹색)
  - 🟡 10% 이내 초과 (노란색)  
  - 🔴 10% 이상 초과 (빨간색)
- **종합 예산 대시보드**: 총 예산, 실제 지출, 절약/초과 금액 한눈에 확인
- **깔끔한 금액 표시**: 소수점 없는 정수 단위 (예: 10,000원)

### 📸 **추억 관리**
- **사진 업로드**: 드래그 앤 드롭으로 간편한 사진 업로드
- **자동 이미지 최적화**: WebP 포맷 변환 및 썸네일 자동 생성
- **갤러리 뷰**: 그리드 레이아웃으로 사진들을 아름답게 정리
- **메타데이터 관리**: 촬영 일시, 위치, 캡션 등 상세 정보

### 🗺️ **지도 연동**
- **Google Maps 통합**: 일정별 위치를 지도에서 시각적으로 확인
- **마커 및 정보창**: 클릭 가능한 마커로 일정 세부사항 표시
- **경로 최적화**: 여행 동선을 한눈에 파악

### 🔐 **안전한 사용자 관리**
- **JWT 기반 인증**: 안전한 로그인 및 세션 관리
- **개인별 데이터**: 사용자별 독립된 여행 데이터 관리
- **비밀번호 암호화**: bcrypt를 이용한 안전한 비밀번호 저장

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**: 타입 안전성을 갖춘 현대적 UI
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **TanStack Query**: 서버 상태 관리 및 캐싱
- **Zustand**: 클라이언트 사이드 상태 관리
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **React Router**: SPA 라우팅

### Backend
- **Node.js** + **Express**: 경량화된 REST API 서버
- **TypeScript**: 백엔드 코드의 타입 안전성
- **MariaDB**: 관계형 데이터베이스
- **JWT**: 토큰 기반 인증
- **Multer + Sharp**: 이미지 업로드 및 처리
- **Helmet + CORS**: 보안 강화

### Infrastructure
- **Docker + Docker Compose**: 컨테이너화된 개발/배포 환경
- **Nginx**: 프론트엔드 정적 파일 서빙
- **Multi-stage Build**: 최적화된 프로덕션 이미지

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd travel-planner
```

### 2. 환경 변수 설정
```bash
# 백엔드 환경 변수
cp backend/.env.example backend/.env

# 프론트엔드 환경 변수 (Google Maps API 키 필요)
cp frontend/.env.example frontend/.env
```

### 3. Docker로 실행
```bash
# 모든 서비스 빌드 및 시작
docker compose up -d

# 빌드 포함하여 시작
docker compose up --build -d
```

### 4. 애플리케이션 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **API 문서**: http://localhost:5000/api-docs

## 📝 사용 방법

### 1. **회원가입 및 로그인**
- 새 계정 생성 또는 기존 계정으로 로그인

### 2. **여행 계획 생성**
- 여행 제목, 기간, 예산 설정
- 상세 설명 추가

### 3. **일정 관리**
- 날짜별로 세부 일정 추가
- 예상 비용 및 실제 지출 입력
- 완료 여부 실시간 업데이트

### 4. **예산 추적**
- 예산 요약 대시보드에서 전체 현황 확인
- 일정별 예산 상태 모니터링
- 절약/초과 금액 실시간 계산

### 5. **사진 업로드**
- 드래그 앤 드롭으로 여행 사진 업로드
- 갤러리에서 추억 관리

### 6. **지도 확인**
- Google Maps API 키 설정 후 지도 기능 활성화
- 일정별 위치를 지도에서 확인

## 🔧 개발 가이드

### 로컬 개발 환경
```bash
# 백엔드 개발
cd backend
npm install
npm run dev

# 프론트엔드 개발
cd frontend
npm install
npm run dev
```

### 데이터베이스 스키마
- **users**: 사용자 정보
- **travels**: 여행 계획
- **itineraries**: 세부 일정
- **places**: 장소 정보
- **photos**: 사진 메타데이터

### API 엔드포인트
- `GET /api/travels` - 여행 목록 조회
- `POST /api/travels` - 새 여행 생성
- `GET /api/itineraries/:travelId` - 일정 목록
- `POST /api/photos/upload` - 사진 업로드
- 자세한 API 문서: http://localhost:5000/api-docs

## 🌍 환경 변수

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=travel_user
DB_PASSWORD=travel_password
DB_NAME=travel_planner
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 📊 주요 특징

### 🎯 **사용자 경험 중심 설계**
- 반응형 디자인으로 모바일/데스크톱 완벽 지원
- 직관적인 인터페이스로 학습 곡선 최소화
- 실시간 피드백으로 즉각적인 상호작용

### ⚡ **성능 최적화**
- 이미지 자동 압축 및 WebP 변환
- 코드 스플리팅으로 초기 로딩 속도 향상
- React Query 캐싱으로 불필요한 API 호출 방지

### 🔒 **보안 강화**
- JWT 토큰 기반 인증
- CORS 및 Helmet 보안 미들웨어
- SQL 인젝션 방지를 위한 Prepared Statement

### 📱 **확장 가능한 아키텍처**
- 마이크로서비스 지향적 설계
- TypeScript로 타입 안전성 확보
- Docker 컨테이너화로 일관된 배포 환경

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 개발자

**Travel Planner Team**
- 풀스택 개발
- UI/UX 디자인  
- 데이터베이스 설계

---

## 🎉 특별한 기능들

### 💡 **예산 상태 지능형 표시**
- 미완료 일정: "예산 10,000원" 또는 "예산 미정"
- 완료 일정 (무료): "예산 10,000원 | 실제: 무료"
- 완료 일정 (지출): "예산 10,000원 | 실제: 12,000원 (2,000원 초과)"

### 🔄 **원클릭 완료 토글**
- 수정 폼 없이 목록에서 바로 완료/미완료 전환
- "○ 미완료" ↔ "✓ 완료됨" 버튼으로 직관적 조작

### 📈 **실시간 예산 분석**
- 총 예산 대비 실제 지출 비교
- 완료된 일정 통계 (예: 3/5 완료)
- 예산 초과/절약 금액 실시간 계산

**Travel Planner**로 더 스마트하고 체계적인 여행을 계획해보세요! ✈️