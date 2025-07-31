# 벚꽃 청첩장 포팅 매뉴얼

## 프로젝트 개요
- **프로젝트명**: Cherry Blossom Wedding Invitation
- **기술 스택**: Vue.js 3 (Frontend), Express.js (Backend), SQLite (Database)
- **포트**: 3001

## 시스템 요구사항

### 최소 요구사항
- **OS**: Linux/Windows/macOS
- **Node.js**: 18.x 이상
- **메모리**: 최소 1GB RAM
- **디스크**: 최소 2GB 여유 공간
- **Docker**: 20.10.0 이상 (Docker 설치 시)
- **Docker Compose**: 2.0.0 이상 (Docker 설치 시)

## 설치 및 실행 방법

### 방법 1: Docker를 이용한 실행 (권장)

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd cherry-blossom-invitation
```

#### 2. Docker Compose로 실행
```bash
# 애플리케이션 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 애플리케이션 중지
docker-compose down
```

#### 3. 접속 확인
- 웹 브라우저에서 `http://localhost:3001` 접속

### 방법 2: 직접 설치 및 실행

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd cherry-blossom-invitation
```

#### 2. 서버 의존성 설치
```bash
npm install
```

#### 3. 클라이언트 의존성 설치
```bash
cd client
npm install
cd ..
```

#### 4. 애플리케이션 실행

##### 개발 모드 (권장)
```bash
npm run dev
```

##### 프로덕션 모드
```bash
# 클라이언트 빌드
npm run build

# 서버 실행
npm start
```

## 서버 배포

### Ubuntu/CentOS 서버 배포

#### 1. 필수 소프트웨어 설치

**Ubuntu:**
```bash
# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker 설치 (선택사항)
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**CentOS:**
```bash
# Node.js 18.x 설치
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Docker 설치 (선택사항)
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

#### 2. 프로젝트 배포

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /opt/cherry-blossom-invitation
cd /opt/cherry-blossom-invitation

# 소스 코드 복사 (Git 또는 직접 업로드)
git clone <repository-url> .

# Docker를 이용한 배포
sudo docker-compose up -d

# 또는 직접 실행
npm install
cd client && npm install && npm run build && cd ..
npm start
```

#### 3. 방화벽 설정
```bash
# Ubuntu (ufw)
sudo ufw allow 3001

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

#### 4. systemd 서비스 등록 (선택사항)

`/etc/systemd/system/cherry-blossom.service` 파일 생성:
```ini
[Unit]
Description=Cherry Blossom Wedding Invitation
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cherry-blossom-invitation
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

서비스 활성화:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cherry-blossom.service
sudo systemctl start cherry-blossom.service
```

## 환경 변수 설정

### 주요 환경 변수
- `PORT`: 서버 포트 (기본값: 3001)
- `NODE_ENV`: 실행 환경 (development/production)

### 설정 방법
```bash
# .env 파일 생성
echo "PORT=3001" > .env
echo "NODE_ENV=production" >> .env
```

## 데이터베이스 관리

### SQLite 데이터베이스
- **파일 위치**: `./wedding.db`
- **자동 초기화**: 서버 시작 시 테이블 자동 생성
- **백업**: `wedding.db` 파일 복사로 백업 가능

### 데이터베이스 백업
```bash
# 백업 생성
cp wedding.db wedding_backup_$(date +%Y%m%d_%H%M%S).db

# 복원
cp wedding_backup_YYYYMMDD_HHMMSS.db wedding.db
```

## 업로드 파일 관리

### 업로드 디렉토리
- **위치**: `./uploads/`
- **권한**: 쓰기 권한 필요
- **백업**: 정기적인 파일 백업 권장

### 디렉토리 권한 설정
```bash
mkdir -p uploads
chmod 755 uploads
```

## 로그 및 모니터링

### 로그 확인
```bash
# Docker 사용 시
docker-compose logs -f

# 직접 실행 시
npm start 2>&1 | tee application.log
```

### 프로세스 모니터링
```bash
# 프로세스 확인
ps aux | grep node

# 포트 사용 확인
netstat -tlnp | grep 3001
```

## 트러블슈팅

### 일반적인 문제

#### 1. 포트 이미 사용 중
```bash
# 포트 사용 프로세스 확인
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

#### 2. 권한 문제
```bash
# 파일 권한 설정
sudo chown -R $USER:$USER /opt/cherry-blossom-invitation
sudo chmod -R 755 /opt/cherry-blossom-invitation
```

#### 3. Node.js 모듈 문제
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 클라이언트 모듈 재설치
cd client
rm -rf node_modules package-lock.json
npm install
```

#### 4. 데이터베이스 문제
```bash
# 데이터베이스 파일 삭제 (주의: 모든 데이터 삭제됨)
rm wedding.db

# 서버 재시작으로 새 데이터베이스 생성
npm start
```

## 성능 최적화

### 프로덕션 환경 권장사항
1. **리버스 프록시**: Nginx 또는 Apache 사용
2. **프로세스 관리**: PM2 사용
3. **SSL 인증서**: Let's Encrypt 활용
4. **정적 파일 캐싱**: CDN 또는 Nginx 캐싱
5. **데이터베이스 백업**: 정기적인 자동 백업 설정

### PM2를 이용한 프로세스 관리
```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start server.js --name "cherry-blossom"

# 프로세스 목록 확인
pm2 list

# 로그 확인
pm2 logs cherry-blossom

# 자동 시작 설정
pm2 startup
pm2 save
```

## 보안 고려사항

1. **방화벽 설정**: 필요한 포트만 개방
2. **업데이트**: 정기적인 시스템 및 패키지 업데이트
3. **파일 권한**: 최소 권한 원칙 적용
4. **백업**: 정기적인 데이터 백업
5. **모니터링**: 시스템 리소스 및 애플리케이션 상태 모니터링

## 지원 및 문의

프로젝트 관련 문의사항이나 문제가 발생한 경우:
- GitHub Issues 등록
- 로그 파일과 함께 상세한 오류 내용 제공

---
**최종 업데이트**: 2024년 7월