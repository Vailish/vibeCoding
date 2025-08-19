import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { itineraryService } from '../services/itinerary';
import { Itinerary, CreateItineraryRequest, UpdateItineraryRequest } from '../types';

interface ItineraryFormProps {
  travelId: number;
  selectedDate: string;
  editingItinerary?: Itinerary | null;
  onClose: () => void;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
  travelId,
  selectedDate,
  editingItinerary,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    estimated_cost: '',
    actual_cost: '',
    is_completed: false,
    notes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingItinerary) {
      setFormData({
        title: editingItinerary.title,
        description: editingItinerary.description || '',
        start_time: editingItinerary.start_time || '',
        end_time: editingItinerary.end_time || '',
        estimated_cost: editingItinerary.estimated_cost && editingItinerary.estimated_cost > 0 ? Math.floor(editingItinerary.estimated_cost).toString() : '',
        actual_cost: editingItinerary.actual_cost && editingItinerary.actual_cost > 0 ? Math.floor(editingItinerary.actual_cost).toString() : '',
        is_completed: editingItinerary.is_completed || false,
        notes: editingItinerary.notes || ''
      });
    }
  }, [editingItinerary]);

  const createMutation = useMutation({
    mutationFn: (data: CreateItineraryRequest) => itineraryService.createItinerary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', travelId] });
      alert('일정이 생성되었습니다!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '일정 생성에 실패했습니다.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateItineraryRequest }) =>
      itineraryService.updateItinerary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', travelId] });
      alert('일정이 수정되었습니다!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '일정 수정에 실패했습니다.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
      }
    }

    // 숫자 필드 변환
    const processedData = {
      ...formData,
      estimated_cost: formData.estimated_cost === '' ? 0 : Number(formData.estimated_cost),
      actual_cost: formData.actual_cost === '' ? 0 : Number(formData.actual_cost)
    };

    if (editingItinerary) {
      updateMutation.mutate({
        id: editingItinerary.id,
        data: processedData
      });
    } else {
      createMutation.mutate({
        travel_id: travelId,
        date: selectedDate,
        ...processedData
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {editingItinerary ? '일정 수정' : '새 일정 추가'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">일정 제목 *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 경복궁 관람"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">설명</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="일정에 대한 상세 설명을 입력하세요"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">시작 시간</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="end_time">종료 시간</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated_cost">예상 비용 (원)</Label>
                <Input
                  id="estimated_cost"
                  name="estimated_cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={handleChange}
                  placeholder="예상 비용을 입력하세요"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="actual_cost">실제 지출 (원)</Label>
                <Input
                  id="actual_cost"
                  name="actual_cost"
                  type="number"
                  value={formData.actual_cost}
                  onChange={handleChange}
                  placeholder="실제 지출을 입력하세요"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="is_completed" className="text-sm font-normal">
                이 일정을 완료했습니다
              </Label>
            </div>
            
            <div>
              <Label htmlFor="notes">메모</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="추가 메모나 주의사항을 입력하세요"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? '저장중...'
                  : editingItinerary ? '수정하기' : '추가하기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItineraryForm;