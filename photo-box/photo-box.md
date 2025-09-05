# 결혼식 사진/영상 수집 서비스 기획서

## 1. 서비스 개요

### 1.1 서비스 목적

- 결혼식 하객들이 촬영한 사진/영상을 실시간으로 수집
- 신랑신부가 하객들의 시점에서 촬영된 소중한 순간들을 놓치지 않고 보관
- 간편한 업로드와 체계적인 관리를 통한 추억 보존

### 1.2 타겟 사용자

- **주요 사용자**: 결혼식을 진행하는 신랑신부
- **보조 사용자**: 결혼식 하객들 (사진/영상 업로드)
- **관리 사용자**: 웨딩플래너 또는 식장 관계자

## 2. 핵심 기능 명세

### 2.1 사용자 인증 및 접근 제어

```
- 결혼식별 고유 코드 생성 (예: WED-240905-KJH)
- QR 코드를 통한 간편 접속
- 하객용 익명 업로드 (선택사항: 간단한 닉네임 입력)
- 신랑신부용 관리자 계정
```

### 2.2 사진/영상 업로드 기능

```
업로드 방식:
- 드래그 앤 드롭 업로드
- 파일 선택 업로드
- 모바일 카메라 직접 촬영 후 업로드

지원 파일 형식:
- 이미지: JPEG, PNG, HEIC (최대 10MB)
- 영상: MP4, MOV, AVI (최대 100MB)

메타데이터 수집:
- 업로드 시간
- 업로드자 정보 (선택)
- 간단한 코멘트 (선택)
```

### 2.3 실시간 피드 기능

```
- 업로드된 사진/영상을 실시간으로 표시
- 타임라인 형태의 UI
- 이미지 썸네일 미리보기
- 영상 재생 기능
- 좋아요/하트 기능
```

### 2.4 관리자 기능

```
대시보드:
- 전체 업로드 현황 (개수, 용량)
- 실시간 업로드 모니터링
- 하객 참여 통계

컨텐츠 관리:
- 일괄 다운로드 (ZIP 파일)
- 개별 파일 관리 (삭제, 이동)
- 부적절한 콘텐츠 신고/삭제

데이터 내보내기:
- Google Drive 연동
- 클라우드 스토리지 백업
- USB/하드디스크 다운로드
```

## 3. 기술 스택 제안

### 3.1 Frontend (웹앱)

```
프레임워크: React.js 또는 Next.js
상태관리: Zustand 또는 Context API
UI 라이브러리: Tailwind CSS + Headless UI
파일 업로드: react-dropzone
실시간 통신: Socket.io-client
PWA: 모바일 앱처럼 사용 가능하도록 설정
```

### 3.2 Backend

```
프레임워크: Node.js + Express.js 또는 Python + FastAPI
데이터베이스: PostgreSQL (메타데이터) + Redis (세션/캐시)
파일 스토리지: AWS S3 또는 Google Cloud Storage
실시간 통신: Socket.io
인증: JWT 기반
API 문서: Swagger/OpenAPI
```

### 3.3 인프라

```
배포: Docker + Docker Compose
호스팅: AWS EC2, Google Cloud Platform, 또는 Vercel
CDN: CloudFlare (이미지 최적화)
모니터링: 기본 로깅 시스템
```

## 4. 데이터베이스 스키마

### 4.1 Wedding Events 테이블

```sql
CREATE TABLE wedding_events (
    id SERIAL PRIMARY KEY,
    event_code VARCHAR(20) UNIQUE NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    venue VARCHAR(200),
    admin_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Media Files 테이블

```sql
CREATE TABLE media_files (
    id SERIAL PRIMARY KEY,
    wedding_event_id INTEGER REFERENCES wedding_events(id),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- 'image' or 'video'
    file_size BIGINT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploader_name VARCHAR(100),
    comment TEXT,
    likes_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API 엔드포인트 명세

### 5.1 인증 관련

```
POST /api/wedding/create - 결혼식 이벤트 생성
POST /api/wedding/login - 관리자 로그인
GET /api/wedding/:code - 결혼식 정보 조회
```

### 5.2 파일 업로드

```
POST /api/:code/upload - 파일 업로드
GET /api/:code/media - 미디어 목록 조회
DELETE /api/:code/media/:id - 파일 삭제 (관리자만)
```

### 5.3 실시간 기능

```
WebSocket Events:
- 'new_upload' - 새 파일 업로드 알림
- 'like_update' - 좋아요 업데이트
- 'user_count' - 현재 접속자 수
```

## 6. UI/UX 설계 가이드

### 6.1 하객용 업로드 페이지

```
레이아웃:
- 상단: 신랑신부 이름, 결혼식 날짜
- 중앙: 대형 업로드 영역 (드래그앤드롭)
- 하단: 실시간 피드 (최근 업로드된 사진들)

디자인 컨셉:
- 깔끔하고 직관적인 인터페이스
- 웨딩 테마 색상 (파스텔 톤)
- 모바일 우선 반응형 디자인
```

### 6.2 관리자 대시보드

```
메인 화면:
- 통계 카드 (총 사진 수, 영상 수, 참여자 수)
- 실시간 업로드 현황
- 최근 업로드된 파일 미리보기

관리 기능:
- 파일 일괄 선택/다운로드
- 검색 및 필터링
- 백업 상태 확인
```

## 7. 개발 단계별 계획

### Phase 1: MVP 개발 (2주)

- [ ] 기본 웹앱 구조 생성
- [ ] 파일 업로드 기능 구현
- [ ] 간단한 갤러리 뷰
- [ ] 결혼식 코드 기반 접근

### Phase 2: 핵심 기능 (2주)

- [ ] 실시간 피드 구현
- [ ] 관리자 대시보드
- [ ] 파일 다운로드 기능
- [ ] 모바일 최적화

### Phase 3: 고급 기능 (1주)

- [ ] PWA 설정
- [ ] 클라우드 백업 연동
- [ ] 성능 최적화
- [ ] 보안 강화

## 8. 보안 고려사항

```
파일 보안:
- 파일 타입 검증
- 파일 크기 제한
- 악성 파일 스캔

접근 제어:
- 결혼식 코드 기반 접근 제한
- 관리자 권한 분리
- 세션 만료 관리

데이터 보호:
- HTTPS 통신 강제
- 파일 암호화 저장
- 개인정보 최소 수집
```

## 9. 배포 및 운영

### 9.1 배포 스크립트

```bash
# Docker Compose 기반 배포
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  api:
    build: ./api
    ports:
      - "8000:8000"
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: wedding_photos
```

### 9.2 환경 변수 설정

```env
DATABASE_URL=postgresql://user:pass@localhost/wedding_photos
AWS_S3_BUCKET=wedding-photos-bucket
JWT_SECRET=your-secret-key
UPLOAD_MAX_SIZE=104857600  # 100MB
```

## 10. 비용 추산 (월 기준)

```
호스팅 비용:
- AWS EC2 t3.small: $20
- S3 스토리지 (100GB): $2.5
- CloudFront CDN: $1-5

개발 도구:
- 무료 오픈소스 도구 활용

총 예상 비용: $25-30/월
```

## 11. 추가 기능 아이디어

### 11.1 로컬 환경 최적화

```
파일 관리:
- 자동 백업 스케줄러 (외장 하드디스크)
- 중복 파일 감지 및 정리
- 파일 압축 및 아카이빙
- 저장공간 모니터링 (2TB 활용률)

성능 최적화:
- 이미지 자동 리사이징
- 썸네일 캐싱
- 메모리 사용량 최적화
- 데이터베이스 인덱싱
```

### 11.2 사용자 편의 기능

```
모바일 최적화:
- PWA 오프라인 캐싱
- 터치 제스처 지원
- 카메라 직접 연동
- 배치 업로드

관리 기능:
- Excel 다운로드 (하객 명단)
- QR 코드 자동 생성
- 통계 대시보드
- 자동 슬라이드쇼
```

### 11.3 고급 기능 (추후 개발)

```
AI 기능:
- 얼굴 인식 자동 태깅 (로컬 AI)
- 중복/흐린 사진 자동 필터링
- 베스트 포토 추천

소셜 기능:
- 하객 간 사진 공유
- 방명록 기능
- 실시간 채팅
```

---

**개발 시작을 위한 체크리스트:**

1. ✅ Windows PC 준비 (2TB)
2. ⬜ Docker Desktop 설치 및 실행
3. ⬜ D:\wedding-photos\ 디렉토리 생성
4. ⬜ docker-compose.yml 작성
5. ⬜ Spring Boot 프로젝트 생성 (Dockerfile 포함)
6. ⬜ React 프론트엔드 설정 (Dockerfile 포함)
7. ⬜ 네트워크 포트포워딩 설정 (3000번 포트)
8. ⬜ `docker-compose up --build` 실행 테스트

**한 번의 명령으로 전체 실행:**

```bash
# 모든 서비스 시작 (MySQL, Redis, Backend, Frontend)
docker-compose up --build -d

# 브라우저에서 접속
# http://localhost:3000
```
