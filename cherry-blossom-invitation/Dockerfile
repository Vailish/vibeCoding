# Node.js 18 이미지 사용 (Alpine 대신 일반 이미지로 변경)
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 루트 디렉토리의 package.json과 package-lock.json 복사
COPY package*.json ./

# 서버 의존성 설치
RUN npm ci --only=production

# 클라이언트 디렉토리로 이동하여 클라이언트 빌드
COPY client/package*.json ./client/
RUN cd client && npm ci

# 소스 코드 복사
COPY . .

# 클라이언트 빌드
RUN cd client && npm run build

# uploads 디렉토리 생성
RUN mkdir -p uploads

# 포트 3001 노출
EXPOSE 3001

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 서버 시작
CMD ["npm", "start"]