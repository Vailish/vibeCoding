import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  HeartIcon, 
  CameraIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { weddingAPI, mediaAPI, uploadAPI } from '../utils/api';
import socketManager from '../utils/socket';
import useWeddingStore from '../store/useWeddingStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Wedding = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const {
    currentWedding,
    mediaList,
    setWedding,
    setMediaList,
    addMedia,
    updateMediaLikes,
    setLoading,
    setError,
    clearError
  } = useWeddingStore();

  const [uploaderName, setUploaderName] = useState('');
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Load wedding info
  useEffect(() => {
    const loadWeddingInfo = async () => {
      try {
        setLoading(true);
        clearError();
        
        const response = await weddingAPI.getInfo(code);
        setWedding(response.data.wedding);
        
        // Load initial media
        const mediaResponse = await mediaAPI.getList(code, { limit: 50 });
        setMediaList(mediaResponse.data.media, mediaResponse.data.pagination);
        
      } catch (error) {
        console.error('Load wedding error:', error);
        setError(error.response?.data?.error || '결혼식 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      loadWeddingInfo();
    }
  }, [code, setWedding, setMediaList, setLoading, setError, clearError]);

  // Socket setup
  useEffect(() => {
    if (code) {
      socketManager.connect();
      socketManager.joinRoom(code);

      socketManager.onNewUpload((data) => {
        addMedia(data.files);
        toast.success(`새로운 ${data.files.length}개의 파일이 업로드되었습니다!`);
      });

      socketManager.onLikeUpdate((data) => {
        updateMediaLikes(data.mediaId, data.likesCount);
      });

      return () => {
        socketManager.disconnect();
      };
    }
  }, [code, addMedia, updateMediaLikes]);

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      if (uploaderName.trim()) {
        formData.append('uploaderName', uploaderName.trim());
      }
      
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }

      await uploadAPI.uploadFiles(code, formData, setUploadProgress);
      
      toast.success('파일이 성공적으로 업로드되었습니다!');
      setSelectedFiles([]);
      setComment('');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || '업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLike = async (mediaId) => {
    try {
      await mediaAPI.like(code, mediaId);
    } catch (error) {
      console.error('Like error:', error);
      toast.error('좋아요 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'yyyy년 M월 d일');
  };

  if (!currentWedding) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-500 mx-auto mb-4"></div>
          <p className="text-gray-600">결혼식 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-wedding-500 to-wedding-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-wedding-100 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            홈으로 돌아가기
          </button>
          
          <div className="text-center">
            <HeartIcon className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {currentWedding.groom_name} ♥ {currentWedding.bride_name}
            </h1>
            <p className="text-wedding-100 text-lg">
              {formatDate(currentWedding.event_date)}
            </p>
            {currentWedding.venue && (
              <p className="text-wedding-200">
                {currentWedding.venue}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              <CameraIcon className="h-6 w-6 inline mr-2" />
              사진/영상 올리기
            </h2>

            {/* Uploader Info */}
            <div className="mb-6 space-y-4">
              <div>
                <label htmlFor="uploaderName" className="block text-sm font-medium text-gray-700 mb-2">
                  이름 (선택사항)
                </label>
                <input
                  id="uploaderName"
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="예: 김철수"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  코멘트 (선택사항)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="축하 메시지나 사진에 대한 설명을 입력하세요"
                  rows="3"
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-wedding-500 bg-wedding-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-wedding-600 font-medium">파일을 여기에 드롭하세요</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    파일을 드래그하여 올리거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-gray-400">
                    이미지: JPEG, PNG, HEIC | 동영상: MP4, MOV, AVI (최대 100MB)
                  </p>
                </>
              )}
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-gray-900">선택된 파일:</p>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        {file.type.startsWith('image/') ? (
                          <PhotoIcon className="h-5 w-5 text-green-600 mr-2" />
                        ) : (
                          <VideoCameraIcon className="h-5 w-5 text-blue-600 mr-2" />
                        )}
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Upload Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? `업로드 중... ${uploadProgress}%` : '업로드하기'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Media Feed */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              실시간 사진/영상 피드
            </h2>
            
            {mediaList.length === 0 ? (
              <div className="card text-center py-12">
                <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  아직 업로드된 사진이나 영상이 없습니다
                </p>
                <p className="text-gray-400 mt-2">
                  첫 번째 추억을 업로드해보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaList.map((media) => (
                  <div key={media.id} className="card p-0 overflow-hidden">
                    {/* Media Display */}
                    <div className="aspect-square bg-gray-100">
                      {media.file_type === 'image' ? (
                        <img
                          src={`http://localhost:8000${media.thumbnail_url || media.file_url}`}
                          alt={media.original_name || '업로드된 이미지'}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          crossOrigin="anonymous"
                          loading="lazy"
                          onLoad={(e) => {
                            e.target.style.opacity = '1';
                          }}
                          onError={(e) => {
                            console.error('Image load error:', e.target.src);
                            // Try original image if thumbnail fails
                            if (e.target.src.includes('thumb_')) {
                              e.target.src = `http://localhost:8000${media.file_url}`;
                            } else {
                              // Show placeholder if both fail
                              e.target.style.display = 'none';
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-200';
                              placeholder.innerHTML = `
                                <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              `;
                              e.target.parentElement.appendChild(placeholder);
                            }
                          }}
                          style={{ opacity: '0' }}
                        />
                      ) : (
                        <video
                          src={`http://localhost:8000${media.file_url}`}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Media Info */}
                    <div className="p-4">
                      {media.comment && (
                        <p className="text-gray-700 mb-3">
                          {media.comment}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          {media.uploader_name ? (
                            <>
                              <UserIcon className="h-4 w-4 mr-1" />
                              {media.uploader_name}
                            </>
                          ) : (
                            <span>익명</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleLike(media.id)}
                          className="flex items-center hover:text-red-500 transition-colors"
                        >
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {media.likes_count || 0}
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(media.uploaded_at).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wedding;