import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { photoService } from '../services/photo';

interface PhotoUploadProps {
  travelId: number;
  onClose: () => void;
}

interface FileWithPreview extends File {
  preview: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ travelId, onClose }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ files, captions }: { files: File[], captions: string[] }) =>
      photoService.uploadPhotos(travelId, files, captions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', travelId] });
      alert('사진이 업로드되었습니다!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '사진 업로드에 실패했습니다.');
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...filesWithPreview]);
    setCaptions(prev => [...prev, ...new Array(acceptedFiles.length).fill('')]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    setCaptions(prev => prev.map((c, i) => i === index ? caption : c));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert('업로드할 사진을 선택해주세요.');
      return;
    }
    
    uploadMutation.mutate({ files, captions });
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>사진 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="text-4xl">📸</div>
              <p className="text-lg font-medium">
                {isDragActive ? '여기에 놓으세요!' : '사진을 드래그하거나 클릭하여 선택'}
              </p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, GIF, WebP 파일을 지원합니다 (최대 10MB)
              </p>
            </div>
          </div>

          {/* Preview Grid */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">선택된 사진 ({files.length}개)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="relative">
                      <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-white/80 text-red-600 hover:bg-white hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`caption-${index}`}>캡션 (선택사항)</Label>
                      <Input
                        id={`caption-${index}`}
                        value={captions[index] || ''}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        placeholder="이 사진에 대한 설명을 입력하세요..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadMutation.isPending || files.length === 0}
              className="flex-1"
            >
              {uploadMutation.isPending ? '업로드 중...' : `${files.length}개 사진 업로드`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUpload;