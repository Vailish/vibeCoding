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
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Zustand
- **Map**: Google Maps API 또는 Kakao Map API
- **Image**: react-image-gallery, react-dropzone

### 3.2 Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer + Sharp (이미지 처리)
- **API Documentation**: Swagger

### 3.3 Database (MariaDB)
```sql
-- 주요 테이블 구조 예시
travels (여행)
├── id, title, description, start_date, end_date
├── status, budget, cover_image, created_at
└── user_id (FK)

itineraries (일정)
├── id, travel_id (FK), date, order
├── title, description, start_time, end_time
└── estimated_cost, notes

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

### 4.2 여행 상세 화면
- **탭 구성**: 일정 | 지도 | 사진 | 메모
- 좌측: 날짜별 일정 리스트
- 우측: 지도 또는 선택된 콘텐츠

### 4.3 지도 화면
- 전체 여행 경로 표시
- 장소별 마커 (카테고리별 색상)
- 마커 클릭시 상세 정보 팝업

### 4.4 사진 갤러리
- 그리드 레이아웃
- 날짜/장소별 필터
- 사진 상세보기 및 편집

## 5. 개발 우선순위

### Phase 1 (MVP)
- [ ] 사용자 인증 시스템
- [ ] 여행 CRUD
- [ ] 기본 일정 관리
- [ ] 간단한 지도 연동

### Phase 2
- [ ] 사진 업로드 및 갤러리
- [ ] 장소 검색 및 정보
- [ ] 메모 및 리뷰 기능

### Phase 3
- [ ] 고급 지도 기능 (경로 최적화)
- [ ] 사진 자동 위치 매칭
- [ ] 여행 통계 및 분석
- [ ] 공유 기능

## 6. 추가 고려사항

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

### 6.4 보안
- 이미지 업로드 검증
- SQL Injection 방지
- XSS 공격 방지
- HTTPS 적용
