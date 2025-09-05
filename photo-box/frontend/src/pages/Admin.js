import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  PhotoIcon,
  VideoCameraIcon,
  HeartIcon,
  UserIcon,
  CloudArrowDownIcon,
  TrashIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { weddingAPI, mediaAPI } from '../utils/api';
import useWeddingStore from '../store/useWeddingStore';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const Admin = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const {
    currentWedding,
    mediaList,
    mediaStats,
    isAdmin,
    adminToken,
    setWedding,
    setAdmin,
    setMediaList,
    setMediaStats,
    removeMedia,
    logout
  } = useWeddingStore();

  const [loginForm, setLoginForm] = useState({ password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  // Check if already logged in
  useEffect(() => {
    if (isAdmin && adminToken && currentWedding?.event_code === code) {
      loadAdminData();
    }
  }, [isAdmin, adminToken, code, currentWedding]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Load wedding info if not available
      if (!currentWedding || currentWedding.event_code !== code) {
        const weddingResponse = await weddingAPI.getInfo(code);
        setWedding(weddingResponse.data.wedding);
      }
      
      // Load media and stats
      const [mediaResponse, statsResponse] = await Promise.all([
        mediaAPI.getList(code, { limit: 100 }),
        mediaAPI.getStats(code)
      ]);
      
      setMediaList(mediaResponse.data.media, mediaResponse.data.pagination);
      setMediaStats(statsResponse.data.stats);
      
    } catch (error) {
      console.error('Load admin data error:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await weddingAPI.login({
        eventCode: code,
        password: loginForm.password
      });
      
      const { token, wedding } = response.data;
      localStorage.setItem('adminToken', token);
      setAdmin(token, wedding);
      
      toast.success('관리자 로그인 성공!');
      await loadAdminData();
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    logout();
    navigate('/');
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      
      const response = await mediaAPI.download(code);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${code}-photos.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('파일 다운로드가 시작되었습니다.');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('정말로 이 파일을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await mediaAPI.delete(code, mediaId);
      removeMedia(mediaId);
      toast.success('파일이 삭제되었습니다.');
      
      // Reload stats
      const statsResponse = await mediaAPI.getStats(code);
      setMediaStats(statsResponse.data.stats);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('파일 삭제에 실패했습니다.');
    }
  };

  const weddingUrl = currentWedding 
    ? `${window.location.origin}/wedding/${currentWedding.event_code}`
    : '';

  // Login form for non-authenticated users
  if (!isAdmin || !adminToken || currentWedding?.event_code !== code) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-50 to-wedding-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              홈으로 돌아가기
            </button>
            
            <div className="card">
              <div className="text-center mb-6">
                <KeyIcon className="h-12 w-12 text-wedding-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  관리자 로그인
                </h1>
                <p className="text-gray-600">
                  {code} 이벤트 관리자 페이지
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    관리자 비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ password: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                홈으로
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/wedding/${code}`)}
                className="btn-secondary"
              >
                하객용 페이지 보기
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Wedding Info Card */}
          {currentWedding && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                결혼식 정보
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">신랑신부:</span>{' '}
                    <span className="font-medium">
                      {currentWedding.groom_name} ♥ {currentWedding.bride_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">날짜:</span>{' '}
                    <span className="font-medium">
                      {new Date(currentWedding.event_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {currentWedding.venue && (
                    <div>
                      <span className="text-gray-600">장소:</span>{' '}
                      <span className="font-medium">{currentWedding.venue}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">이벤트 코드:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                      {currentWedding.event_code}
                    </code>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border">
                    <QRCode value={weddingUrl} size={120} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    하객용 QR 코드
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(weddingUrl);
                      toast.success('링크가 복사되었습니다!');
                    }}
                    className="mt-2 text-sm btn-secondary"
                  >
                    링크 복사
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {mediaStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {mediaStats.totalFiles}
                </div>
                <div className="text-sm text-gray-600">전체 파일</div>
              </div>
              
              <div className="card text-center">
                <PhotoIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {mediaStats.imageCount}
                </div>
                <div className="text-sm text-gray-600">이미지</div>
              </div>
              
              <div className="card text-center">
                <VideoCameraIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {mediaStats.videoCount}
                </div>
                <div className="text-sm text-gray-600">동영상</div>
              </div>
              
              <div className="card text-center">
                <HeartIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {mediaStats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">총 좋아요</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              업로드된 파일 관리
            </h2>
            
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading || !mediaList.length}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudArrowDownIcon className="h-5 w-5 mr-2" />
              {isDownloading ? '다운로드 중...' : '전체 다운로드 (ZIP)'}
            </button>
          </div>

          {/* Media List */}
          {mediaList.length === 0 ? (
            <div className="card text-center py-12">
              <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                아직 업로드된 파일이 없습니다
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        미리보기
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        파일명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        업로드자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        코멘트
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        좋아요
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        업로드 시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mediaList.map((media) => (
                      <tr key={media.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            {media.file_type === 'image' ? (
                              <img
                                src={`http://localhost:8000${media.thumbnail_url || media.file_url}`}
                                alt={media.original_name || '미리보기'}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                crossOrigin="anonymous"
                                onLoad={(e) => {
                                  e.target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                  if (e.target.src.includes('thumb_')) {
                                    e.target.src = `http://localhost:8000${media.file_url}`;
                                  }
                                }}
                                style={{ opacity: '0' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {media.original_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {media.file_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {media.uploader_name || '익명'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {media.comment || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
                            {media.likes_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(media.uploaded_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteMedia(media.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;