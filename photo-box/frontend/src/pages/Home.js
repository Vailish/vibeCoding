import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, CameraIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode.react';

const Home = () => {
  const navigate = useNavigate();
  const [eventCode, setEventCode] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleJoinWedding = (e) => {
    e.preventDefault();
    if (eventCode.trim()) {
      navigate(`/wedding/${eventCode.toUpperCase()}`);
    }
  };

  const handleCreateWedding = () => {
    navigate('/create');
  };

  const sampleCode = 'WED-240905-KJH';
  const sampleUrl = `${window.location.origin}/wedding/${sampleCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <HeartIcon className="h-12 w-12 text-wedding-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Photo Box</h1>
          </div>
          <p className="text-xl text-gray-600">
            결혼식의 소중한 순간들을 모두 함께 모아보세요
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto space-y-8">
          {/* Join Wedding Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              결혼식 참여하기
            </h2>
            <form onSubmit={handleJoinWedding} className="space-y-4">
              <div>
                <label htmlFor="eventCode" className="block text-sm font-medium text-gray-700 mb-2">
                  결혼식 코드
                </label>
                <input
                  id="eventCode"
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="예: WED-240905-KJH"
                  className="input-field"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary"
              >
                <CameraIcon className="h-5 w-5 inline mr-2" />
                사진 올리러 가기
              </button>
            </form>
          </div>

          {/* Create Wedding */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              신랑·신부이신가요?
            </h2>
            <button
              onClick={handleCreateWedding}
              className="w-full btn-secondary"
            >
              새 결혼식 이벤트 만들기
            </button>
          </div>

          {/* QR Code Example */}
          <div className="card">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QR 코드로 간편하게!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                하객들이 QR 코드를 스캔하여 바로 접속할 수 있습니다
              </p>
              <div className="flex justify-center mb-4">
                {showQR ? (
                  <div className="p-4 bg-white rounded-lg border">
                    <QRCode value={sampleUrl} size={150} />
                    <p className="text-xs text-gray-500 mt-2">예시 QR 코드</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQR(true)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                  >
                    QR 코드 보기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            주요 기능
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-wedding-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="h-8 w-8 text-wedding-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                간편한 업로드
              </h3>
              <p className="text-gray-600">
                드래그앤드롭으로 쉽게 사진과 영상을 업로드하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-wedding-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-wedding-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                실시간 공유
              </h3>
              <p className="text-gray-600">
                업로드된 사진들을 실시간으로 모든 참석자가 볼 수 있습니다
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-wedding-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-wedding-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                일괄 다운로드
              </h3>
              <p className="text-gray-600">
                모든 사진과 영상을 ZIP 파일로 한 번에 다운로드
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;