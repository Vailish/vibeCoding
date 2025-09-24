import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { travelService } from '../services/travel';
import { groupService } from '../services/group';
import { CreateTravelRequest, Group } from '../types';
import { formatNumberInput } from '../utils/format';

interface TravelFormProps {
  onClose: () => void;
}

const TravelForm: React.FC<TravelFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CreateTravelRequest>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: 0,
    group_id: undefined
  });
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('그룹 목록 로딩 실패:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: travelService.createTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] });
      alert('여행이 생성되었습니다!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '여행 생성에 실패했습니다.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('종료일은 시작일보다 나중이어야 합니다.');
      return;
    }

    const processedData = {
      ...formData,
      budget: formData.budget
    };
    createMutation.mutate(processedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let formattedValue: any = value;
    // 예산 필드의 경우 숫자로 변환
    if (name === 'budget') {
      const numericValue = value.replace(/,/g, '');
      formattedValue = numericValue === '' ? 0 : Number(numericValue);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'group_id' ? (value === '' ? undefined : Number(value)) : formattedValue
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>새 여행 만들기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">여행 제목 *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="여행 제목을 입력하세요"
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
                placeholder="여행에 대한 설명을 입력하세요"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">시작일 *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">종료일 *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="budget">예산 (원)</Label>
              <Input
                id="budget"
                name="budget"
                type="text"
                value={formData.budget ? formatNumberInput(formData.budget.toString()) : ''}
                onChange={handleChange}
                placeholder="예산을 입력하세요"
              />
            </div>
            
            <div>
              <Label htmlFor="group_id">그룹 (선택)</Label>
              <select
                id="group_id"
                name="group_id"
                value={formData.group_id || ''}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoadingGroups}
              >
                <option value="">개인 여행</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {isLoadingGroups && (
                <p className="text-sm text-gray-500 mt-1">그룹 목록을 불러오는 중...</p>
              )}
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
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? '생성중...' : '생성하기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelForm;