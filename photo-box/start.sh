#!/bin/bash

echo "🎊 Photo Box - 결혼식 사진/영상 수집 서비스 시작"
echo "===================================================="

# 컨테이너 중지 및 제거
echo "기존 컨테이너를 정리하는 중..."
docker-compose down

# 업로드 디렉토리 생성
echo "업로드 디렉토리를 생성하는 중..."
mkdir -p uploads

# 컨테이너 빌드 및 시작
echo "Docker 컨테이너를 빌드하고 시작하는 중..."
docker-compose up --build -d

# 서비스 상태 확인
echo ""
echo "서비스가 시작되었습니다! 🚀"
echo ""
echo "📱 하객용 페이지: http://localhost:3000"
echo "🛠️  관리자 페이지: http://localhost:3000/admin/[이벤트코드]"
echo "🔧 API 서버: http://localhost:8000"
echo ""
echo "서비스 상태를 확인하는 중..."
sleep 5

# 서비스 로그 확인
echo ""
echo "=== 서비스 로그 ==="
docker-compose logs --tail=10

echo ""
echo "✅ 설정 완료! 브라우저에서 http://localhost:3000 에 접속하세요"
echo ""
echo "🛑 서비스 중지: docker-compose down"
echo "📊 로그 확인: docker-compose logs"
echo "🔄 재시작: docker-compose restart"