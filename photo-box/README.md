# Photo Box - 결혼식 사진/영상 수집 서비스

하객들이 촬영한 사진과 영상을 실시간으로 수집하고 관리할 수 있는 결혼식 전용 서비스입니다.

## 시작하기

```bash
# 모든 서비스 시작
docker-compose up --build -d

# 브라우저에서 접속
# http://localhost:3000
```

## 서비스 구조

- **Frontend**: React 웹앱 (포트 3000)
- **Backend**: Node.js + Express API 서버 (포트 8000)
- **Database**: PostgreSQL (포트 5432)
- **Cache**: Redis (포트 6379)

## 주요 기능

- 결혼식별 고유 코드 생성 및 QR 접속
- 드래그앤드롭 파일 업로드
- 실시간 사진/영상 피드
- 관리자 대시보드
- 일괄 다운로드 기능