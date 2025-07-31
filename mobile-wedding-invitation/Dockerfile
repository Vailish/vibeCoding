# Node.js 애플리케이션을 위한 멀티스테이지 Docker 빌드
FROM node:18-alpine AS client-builder

# 클라이언트 빌드 스테이지
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# 프로덕션 이미지
FROM node:18-alpine

WORKDIR /app

# 서버 의존성 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 서버 코드 복사
COPY server/ ./server/

# 클라이언트 빌드 결과물 복사
COPY --from=client-builder /app/dist ./dist

# 앱 사용자 생성 (보안 향상)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 데이터베이스 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/data && chown nodejs:nodejs /app/data

USER nodejs

# 포트 노출
EXPOSE 5000

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=5000

# 애플리케이션 시작
CMD ["node", "server/index.js"]