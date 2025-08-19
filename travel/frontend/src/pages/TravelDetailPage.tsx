import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import PhotoGallery from '../components/PhotoGallery';
import ItineraryManager from '../components/ItineraryManager';
import MapView from '../components/MapView';
import { travelService } from '../services/travel';
import { useAuthStore } from '../stores/auth';
import { UpdateTravelRequest } from '../types';
import { formatBudget } from '../utils/format';

const TravelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateTravelRequest>({});
  const [activeTab, setActiveTab] = useState('overview');

  const { data: travel, isLoading, error } = useQuery({
    queryKey: ['travel', id],
    queryFn: () => travelService.getTravel(Number(id)),
    enabled: !!id && isAuthenticated
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTravelRequest }) =>
      travelService.updateTravel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel', id] });
      queryClient.invalidateQueries({ queryKey: ['travels'] });
      setIsEditing(false);
      alert('여행 정보가 수정되었습니다.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '수정에 실패했습니다.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: travelService.deleteTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] });
      alert('여행이 삭제되었습니다.');
      navigate('/');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '삭제에 실패했습니다.');
    }
  });

  const handleEdit = () => {
    if (travel) {
      setEditData({
        title: travel.title,
        description: travel.description,
        status: travel.status,
        budget: travel.budget
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (id) {
      updateMutation.mutate({ id: Number(id), data: editData });
    }
  };

  const handleDelete = () => {
    if (id && confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(Number(id));
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '계획중';
      case 'ongoing': return '진행중';
      case 'completed': return '완료됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩중...</p>
        </div>
      </div>
    );
  }

  if (error || !travel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">여행을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            요청하신 여행이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <Link to="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  ← 뒤로
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">여행 상세</h1>
                <p className="text-sm text-muted-foreground">
                  여행 정보를 확인하고 관리하세요
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={handleEdit}>
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? '저장중...' : '저장'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '개요', icon: '📋' },
                { id: 'photos', label: '사진', icon: '📸' },
                { id: 'itinerary', label: '일정', icon: '📅' },
                { id: 'map', label: '지도', icon: '🗺️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                {isEditing ? (
                  <div className="flex-1 mr-4">
                    <Label htmlFor="title">여행 제목</Label>
                    <Input
                      id="title"
                      value={editData.title || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-2xl font-bold"
                    />
                  </div>
                ) : (
                  <CardTitle className="text-3xl">{travel.title}</CardTitle>
                )}
                
                {isEditing ? (
                  <div className="min-w-[120px]">
                    <Label htmlFor="status">상태</Label>
                    <select
                      id="status"
                      value={editData.status || travel.status}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        status: e.target.value as 'planning' | 'ongoing' | 'completed' 
                      }))}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="planning">계획중</option>
                      <option value="ongoing">진행중</option>
                      <option value="completed">완료됨</option>
                    </select>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(travel.status)}`}>
                    {getStatusText(travel.status)}
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">설명</h3>
                {isEditing ? (
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="여행에 대한 설명을 입력하세요"
                    className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {travel.description || '설명이 없습니다.'}
                  </p>
                )}
              </div>

              {/* Travel Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">여행 정보</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">시작일:</span>
                      <span>{formatDate(travel.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">종료일:</span>
                      <span>{formatDate(travel.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">기간:</span>
                      <span>
                        {Math.ceil(
                          (new Date(travel.end_date).getTime() - new Date(travel.start_date).getTime()) 
                          / (1000 * 60 * 60 * 24)
                        )}일
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">예산</h3>
                  {isEditing ? (
                    <div>
                      <Label htmlFor="budget">예산 (원)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={editData.budget || 0}
                        onChange={(e) => setEditData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                        min="0"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {formatBudget(travel.budget)}
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-4 border-t">
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">생성일:</span>{' '}
                    {new Date(travel.created_at).toLocaleString('ko-KR')}
                  </div>
                  <div>
                    <span className="font-medium">수정일:</span>{' '}
                    {new Date(travel.updated_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <PhotoGallery travelId={Number(id)} />
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <ItineraryManager
              travelId={Number(id)}
              startDate={travel.start_date}
              endDate={travel.end_date}
            />
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <MapView travelId={Number(id)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default TravelDetailPage