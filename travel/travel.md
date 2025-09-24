# 여행 일정 관리 웹페이지 기획서

## 1. 프로젝트 개요

### 1.1 목표
- 여행 계획부터 여행 후 기록까지 통합 관리하는 웹 플랫폼
- 직관적인 지도 기반 인터페이스로 시각적 여행 관리
- 사진과 메모를 통한 추억 아카이빙

### 1.2 주요 기능
- 여행별 프로젝트 관리
- 일정 및 경로 계획
- 지도 기반 위치 관리
- 사진 업로드 및 갤러리
- 메모 및 리뷰 작성

## 2. 핵심 기능 명세

### 2.1 여행 관리 (Travel Management)
- **여행 생성/수정/삭제**
  - 여행명, 기간, 참여자, 예산 설정
  - 여행 상태: 계획중 → 진행중 → 완료
  - 여행별 커버 이미지 설정

- **여행 목록**
  - 카드 형태로 여행 목록 표시
  - 진행 상태별 필터링
  - 최근 여행순/날짜순 정렬

### 2.2 일정 관리 (Itinerary Management)
- **일별 일정 구성**
  - 드래그 앤 드롭으로 일정 순서 변경
  - 시간대별 세부 일정 입력
  - 이동 시간 자동 계산 (선택사항)

- **장소 정보**
  - 주소, 연락처, 운영시간
  - 예상 소요시간, 예산
  - 카테고리: 관광지, 음식점, 숙소, 쇼핑, 액티비티 등

### 2.3 지도 연동 (Map Integration)
- **지도 기반 시각화**
  - 구글 맵스 또는 카카오맵 API 연동
  - 일정별 마커 표시 (색상/아이콘으로 구분)
  - 이동 경로 표시

- **위치 검색 및 추가**
  - 장소명/주소 검색
  - 클릭으로 위치 추가
  - GPS 좌표 저장

### 2.4 사진 관리 (Photo Management)
- **사진 업로드**
  - 장소별 사진 업로드 (다중 선택)
  - EXIF 데이터에서 촬영 위치/시간 자동 추출
  - 썸네일 자동 생성

- **갤러리 뷰**
  - 날짜별/장소별 사진 정렬
  - 라이트박스 뷰어
  - 사진별 메모 추가

### 2.5 메모 및 리뷰 (Notes & Reviews)
- **실시간 메모**
  - 장소별 방문 메모
  - 음식 평점, 추천도
  - 팁 및 주의사항

- **여행 후기**
  - 전체 여행 리뷰
  - 하이라이트 선정
  - 다음 여행 참고사항

## 3. 기술 스택

### 3.1 Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + Custom UI Components
- **State Management**: 
  - React Query (서버 상태 관리)
  - Zustand (클라이언트 상태 관리)
- **Map**: Google Maps API + Places API ✅
- **Styling**: CSS-in-JS + Tailwind CSS
- **HTTP Client**: Axios

### 3.2 Backend
- **Runtime**: Node.js + Express.js ✅
- **Language**: TypeScript ✅
- **Authentication**: JWT ✅
- **Database ORM**: Raw SQL (MariaDB)
- **File Upload**: Multer (준비됨)
- **API Documentation**: 개발 진행 중
- **CORS**: 설정 완료

### 3.3 Database
- **RDBMS**: MariaDB 10.11 ✅
- **Container**: Docker Compose ✅
- **Schema**: 완전히 정규화된 관계형 구조
- **Connection**: Connection Pool 적용

#### 데이터베이스 구조
```sql
-- 주요 테이블 구조 예시
travels (여행)
├── id, title, description, start_date, end_date
├── status, budget, cover_image, created_at
└── user_id (FK)

itineraries (일정)
├── id, travel_id (FK), date, order
├── title, description, start_time, end_time
├── estimated_cost, actual_cost, notes
├── latitude, longitude, location_name  ⭐ NEW
└── is_completed

places (장소)
├── id, name, address, category
├── latitude, longitude, phone, website
└── operating_hours, average_cost

itinerary_places (일정-장소 연결)
├── id, itinerary_id (FK), place_id (FK)
├── order, arrival_time, departure_time
└── actual_cost, rating, review

photos (사진)
├── id, travel_id (FK), place_id (FK)
├── filename, original_name, size
├── taken_at, latitude, longitude
└── caption, upload_date
```

## 4. 주요 화면 구성

### 4.1 메인 화면
- 여행 목록 (진행중/예정/완료된 여행)
- 새 여행 생성 버튼
- 최근 업로드된 사진 미리보기

### 4.2 여행 상세 화면 ✅ 구현완료
- **탭 구성**: 일정 | 지도 | 사진 | 메모
- **일정 탭**: 날짜별 일정 관리, 드래그앤드롭 순서 변경
- **지도 탭**: Google Maps 기반 실시간 지도
- **위치 선택**: 검색 + 지도 클릭 + 마커 드래그
- **정보창**: 일정 정보, 위치 정보, 좌표 표시

### 4.3 지도 화면 ✅ 구현완료
- **실시간 지도**: Google Maps API 활용
- **일정별 마커**: 숫자 라벨로 순서 표시
- **정보창**: 일정 제목, 위치명, 시간, 비용 정보
- **인터랙션**: 마커 클릭, 전체보기, 일정 목록 연동
- **좌표 표시**: 위도/경도 정보 표시

### 4.4 사진 갤러리
- 그리드 레이아웃
- 날짜/장소별 필터
- 사진 상세보기 및 편집

## 5. 구현 현황

### ✅ 완료된 기능 (Phase 1)
- [x] **사용자 인증 시스템**
  - 회원가입/로그인 기능
  - JWT 기반 인증
  - 로그인 상태 관리 (Zustand)

- [x] **여행 CRUD**
  - 여행 생성/수정/삭제
  - 여행 목록 조회
  - 여행 상태 관리 (planning/ongoing/completed)
  - 예산 관리 (천 단위 콤마 포맷팅)

- [x] **일정 관리**
  - 일정 생성/수정/삭제
  - 날짜별 일정 구성
  - 시간대별 세부 일정 (시작/종료 시간)
  - 예상/실제 비용 관리
  - **위치 선택 기능** ⭐ NEW
    - Google Places 검색
    - 지도 클릭으로 위치 선택
    - 마커 드래그로 위치 조정
    - 자동 주소 변환 (역지오코딩)

- [x] **Google Maps 연동**
  - 실시간 지도 표시
  - 일정별 마커 표시 (숫자 라벨)
  - 마커 클릭시 정보창 표시
  - 위치 이름 및 좌표 정보 표시
  - 전체보기 기능
  - 일정 목록에서 지도 연동

- [x] **그룹 관리**
  - 그룹 생성/수정/삭제
  - 그룹 멤버 관리
  - 그룹별 여행 생성

### 🚧 진행 중/예정 기능

### Phase 2 (진행 예정)
- [ ] **사진 업로드 및 갤러리**
  - 다중 사진 업로드
  - 장소별 사진 관리
  - EXIF 데이터 추출
  - 썸네일 생성

- [ ] **장소 상세 정보**
  - 장소별 상세 정보 저장
  - 연락처, 운영시간
  - 카테고리별 분류

- [ ] **메모 및 리뷰 기능**
  - 장소별 방문 메모
  - 평점 시스템
  - 여행 후기 작성

### Phase 3 (향후 계획)
- [ ] **고급 지도 기능**
  - 경로 최적화
  - 이동 시간 계산
  - 교통수단별 경로 표시

- [ ] **사진 자동 위치 매칭**
  - EXIF GPS 데이터 활용
  - 촬영 시간 기반 일정 매칭

- [ ] **여행 통계 및 분석**
  - 예산 사용 분석
  - 여행 패턴 분석
  - 방문 지역 통계

- [ ] **공유 기능**
  - 여행 계획 공유
  - 팀 협업 기능
  - 여행 템플릿 공유

## 6. 최신 구현 사항 (2025년 9월)

### 🎯 핵심 성과
1. **완전한 위치 기반 여행 관리 시스템 구축**
   - Google Maps API 완전 통합
   - 실시간 위치 선택 및 저장
   - 정확한 좌표 기반 지도 표시

2. **직관적인 사용자 인터페이스**
   - 반응형 디자인
   - 드래그 앤 드롭 일정 관리
   - 실시간 지도 상호작용

3. **확장 가능한 아키텍처**
   - TypeScript 완전 적용
   - 컴포넌트 기반 설계
   - Docker 컨테이너화

### 🛠️ 기술적 하이라이트
- **LocationPicker 컴포넌트**: Google Places Autocomplete + 지도 클릭 선택
- **실시간 역지오코딩**: 좌표 → 주소 자동 변환
- **마커 드래그**: 직관적인 위치 조정
- **정보창 연동**: 일정 정보 실시간 표시
- **데이터베이스 확장**: latitude, longitude, location_name 컬럼 추가

### 🚀 배포 환경
- **Frontend**: Nginx (포트 3000)
- **Backend**: Node.js + Express (포트 5001)
- **Database**: MariaDB (포트 3307)
- **Container**: Docker Compose 완전 자동화

## 7. 추가 고려사항

### 6.1 사용자 경험 (UX)
- 모바일 최적화 (반응형 디자인)
- 오프라인 사용 가능 (PWA)
- 직관적인 드래그 앤 드롭 인터페이스

### 6.2 성능 최적화
- 이미지 lazy loading
- 무한 스크롤
- 지도 클러스터링

### 6.3 확장 가능성
- 여행 템플릿 공유
- 소셜 기능 (친구와 여행 공유)
- 여행 추천 시스템
- 예산 관리 및 가계부 연동

### 7.4 보안
- 이미지 업로드 검증
- SQL Injection 방지
- XSS 공격 방지
- HTTPS 적용
- JWT 토큰 기반 인증 ✅
- CORS 정책 적용 ✅

## 8. 프로젝트 실행 방법

### 환경 요구사항
- Docker & Docker Compose
- Google Maps API 키

### 실행 단계
```bash
# 1. 환경변수 설정
echo "VITE_API_URL=http://localhost:5001/api" > frontend/.env
echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" >> frontend/.env

# 2. 컨테이너 실행
docker-compose up --build -d

# 3. 접속
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
# Database: localhost:3307
```

### API 키 발급
1. Google Cloud Console 접속
2. Maps JavaScript API 활성화
3. Places API 활성화
4. API 키 생성 및 도메인 제한 설정

---

**마지막 업데이트**: 2025년 9월 24일  
**현재 상태**: Phase 1 완료, Phase 2 진행 준비  
**주요 기능**: 위치 기반 여행 일정 관리 완전 구현 ✅
