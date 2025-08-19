import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { photoService } from '../services/photo';
import { Photo } from '../types';
import PhotoUpload from './PhotoUpload';

interface PhotoGalleryProps {
  travelId: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ travelId }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', travelId],
    queryFn: () => photoService.getPhotosByTravel(travelId)
  });

  const deleteMutation = useMutation({
    mutationFn: photoService.deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', travelId] });
      setSelectedPhoto(null);
      alert('사진이 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '사진 삭제에 실패했습니다.');
    }
  });

  const handleDeletePhoto = (photo: Photo) => {
    if (confirm('이 사진을 삭제하시겠습니까?')) {
      deleteMutation.mutate(photo.id);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>사진을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">사진 갤러리 ({photos.length}개)</h2>
        <Button onClick={() => setShowUpload(true)}>
          📸 사진 업로드
        </Button>
      </div>

      {/* Empty State */}
      {photos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold mb-2">아직 사진이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                여행의 소중한 순간들을 사진으로 남겨보세요!
              </p>
              <Button onClick={() => setShowUpload(true)}>
                첫 사진 업로드하기
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Photo Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photoService.getThumbnailUrl(photo.filename)}
                alt={photo.caption || photo.original_name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-medium truncate">
                    {photo.caption || photo.original_name}
                  </p>
                  <p className="text-xs opacity-75">
                    {new Date(photo.upload_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl max-h-[90vh] w-full relative">
            <Button
              variant="ghost"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 text-white hover:bg-white/30"
            >
              ✕
            </Button>
            
            <img
              src={photoService.getPhotoUrl(selectedPhoto.filename)}
              alt={selectedPhoto.caption || selectedPhoto.original_name}
              className="w-full h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {selectedPhoto.caption || selectedPhoto.original_name}
                  </h3>
                  <p className="text-sm opacity-75">
                    업로드: {new Date(selectedPhoto.upload_date).toLocaleString('ko-KR')}
                  </p>
                  {selectedPhoto.taken_at && (
                    <p className="text-sm opacity-75">
                      촬영: {new Date(selectedPhoto.taken_at).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDeletePhoto(selectedPhoto)}
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  {deleteMutation.isPending ? '삭제 중...' : '🗑️ 삭제'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <PhotoUpload
          travelId={travelId}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default PhotoGallery;