import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { weddingAPI } from '../utils/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const CreateWedding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    eventDate: '',
    venue: '',
    adminPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdWedding, setCreatedWedding] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.adminPassword.length < 6) {
      toast.error('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await weddingAPI.create({
        brideName: formData.brideName,
        groomName: formData.groomName,
        eventDate: formData.eventDate,
        venue: formData.venue,
        adminPassword: formData.adminPassword
      });

      setCreatedWedding(response.data.wedding);
      toast.success('결혼식 이벤트가 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('Create wedding error:', error);
      toast.error(error.response?.data?.error || '결혼식 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToAdmin = () => {
    navigate(`/admin/${createdWedding.event_code}`);
  };

  const weddingUrl = createdWedding 
    ? `${window.location.origin}/wedding/${createdWedding.event_code}`
    : '';

  if (createdWedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <div className="text-center mb-8">
              <HeartIcon className="h-16 w-16 text-wedding-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                결혼식 이벤트 생성 완료!
              </h1>
              <p className="text-gray-600">
                하객들이 사진을 업로드할 수 있도록 링크와 QR 코드를 공유하세요
              </p>
            </div>

            {/* Wedding Info */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                결혼식 정보
              </h2>
              <div className="space-y-3 text-gray-700">
                <div>
                  <span className="font-medium">신랑신부:</span>{' '}
                  {createdWedding.groom_name} ♥ {createdWedding.bride_name}
                </div>
                <div>
                  <span className="font-medium">결혼식 날짜:</span>{' '}
                  {new Date(createdWedding.event_date).toLocaleDateString('ko-KR')}
                </div>
                {createdWedding.venue && (
                  <div>
                    <span className="font-medium">장소:</span> {createdWedding.venue}
                  </div>
                )}
                <div>
                  <span className="font-medium">이벤트 코드:</span>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {createdWedding.event_code}
                  </code>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* QR Code */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  QR 코드
                </h3>
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QRCode value={weddingUrl} size={150} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    하객들이 QR 코드를 스캔하여 접속할 수 있습니다
                  </p>
                </div>
              </div>

              {/* Share Link */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  공유 링크
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-sm break-all">
                    {weddingUrl}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(weddingUrl);
                      toast.success('링크가 복사되었습니다!');
                    }}
                    className="w-full btn-secondary"
                  >
                    링크 복사하기
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleGoToAdmin}
                className="flex-1 btn-primary"
              >
                관리자 페이지로 이동
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-md mx-auto mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            홈으로 돌아가기
          </button>
          
          <div className="text-center">
            <HeartIcon className="h-12 w-12 text-wedding-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              결혼식 이벤트 생성
            </h1>
            <p className="text-gray-600">
              하객들이 사진을 업로드할 수 있는 이벤트를 만들어보세요
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Couple Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="groomName" className="block text-sm font-medium text-gray-700 mb-2">
                  신랑 이름
                </label>
                <input
                  id="groomName"
                  name="groomName"
                  type="text"
                  value={formData.groomName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="brideName" className="block text-sm font-medium text-gray-700 mb-2">
                  신부 이름
                </label>
                <input
                  id="brideName"
                  name="brideName"
                  type="text"
                  value={formData.brideName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                결혼식 날짜
              </label>
              <input
                id="eventDate"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Venue */}
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                결혼식장 (선택사항)
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                placeholder="예: 서울 웨딩홀"
                className="input-field"
              />
            </div>

            {/* Admin Password */}
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                관리자 비밀번호
              </label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="최소 6자리 이상"
                className="input-field"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '생성 중...' : '결혼식 이벤트 생성하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWedding;