import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import TravelForm from '../components/TravelForm';
import TravelCard from '../components/TravelCard';
import { GroupManager } from '../components/GroupManager';
import { travelService } from '../services/travel';
import { groupService } from '../services/group';
import { useAuthStore } from '../stores/auth';
import { Travel } from '../types';

const HomePage: React.FC = () => {
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all' | 'personal'>('all');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: travels = [], isLoading, error } = useQuery({
    queryKey: ['travels'],
    queryFn: travelService.getTravels,
    enabled: isAuthenticated
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getGroups,
    enabled: isAuthenticated
  });

  const deleteMutation = useMutation({
    mutationFn: travelService.deleteTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] });
      alert('여행이 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '삭제에 실패했습니다.');
    }
  });

  const handleDeleteTravel = (id: number) => {
    deleteMutation.mutate(id);
  };

  const getFilteredTravels = (status?: string) => {
    let filtered = travels;
    
    // 그룹 필터링
    if (selectedGroupFilter === 'personal') {
      filtered = filtered.filter((travel: Travel) => !travel.group_id);
    } else if (selectedGroupFilter !== 'all' && typeof selectedGroupFilter === 'number') {
      filtered = filtered.filter((travel: Travel) => travel.group_id === selectedGroupFilter);
    }
    
    // 상태 필터링
    if (status) {
      filtered = filtered.filter((travel: Travel) => travel.status === status);
    }
    
    return filtered;
  };
  
  const getGroupName = (groupId?: number) => {
    if (!groupId) return null;
    const group = groups.find(g => g.id === groupId);
    return group?.name || '알 수 없는 그룹';
  };

  if (!isAuthenticated) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Travel Planner</h1>
              <p className="text-sm text-muted-foreground">
                안녕하세요, {user?.name}님! 멋진 여행을 계획해보세요.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowGroupManager(true)}
              >
                그룹 관리
              </Button>
              <Button onClick={() => setShowTravelForm(true)}>
                새 여행 만들기
              </Button>
              <Button variant="outline" onClick={logout}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Travel Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <Button
              variant={selectedGroupFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={selectedGroupFilter === 'personal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupFilter('personal')}
            >
              개인 여행
            </Button>
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={selectedGroupFilter === group.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGroupFilter(group.id)}
              >
                {group.name}
              </Button>
            ))}
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getFilteredTravels('planning').length}
                </div>
                <p className="text-sm text-muted-foreground">계획중인 여행</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getFilteredTravels('ongoing').length}
                </div>
                <p className="text-sm text-muted-foreground">진행중인 여행</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {getFilteredTravels('completed').length}
                </div>
                <p className="text-sm text-muted-foreground">완료된 여행</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Travel Lists */}
        {getFilteredTravels().length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">아직 여행이 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  첫 번째 여행을 만들어서 멋진 계획을 세워보세요!
                </p>
                <Button onClick={() => setShowTravelForm(true)}>
                  첫 여행 만들기
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Planning Travels */}
            {getFilteredTravels('planning').length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">계획중인 여행</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredTravels('planning').map((travel: Travel) => (
                    <div key={travel.id}>
                      <TravelCard
                        travel={travel}
                        onDelete={handleDeleteTravel}
                      />
                      {travel.group_id && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          그룹: {getGroupName(travel.group_id)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ongoing Travels */}
            {getFilteredTravels('ongoing').length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">진행중인 여행</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredTravels('ongoing').map((travel: Travel) => (
                    <div key={travel.id}>
                      <TravelCard
                        travel={travel}
                        onDelete={handleDeleteTravel}
                      />
                      {travel.group_id && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          그룹: {getGroupName(travel.group_id)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Travels */}
            {getFilteredTravels('completed').length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">완료된 여행</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredTravels('completed').map((travel: Travel) => (
                    <div key={travel.id}>
                      <TravelCard
                        travel={travel}
                        onDelete={handleDeleteTravel}
                      />
                      {travel.group_id && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          그룹: {getGroupName(travel.group_id)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Travel Form Modal */}
      {showTravelForm && (
        <TravelForm onClose={() => setShowTravelForm(false)} />
      )}
      
      {/* Group Manager Modal */}
      {showGroupManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">그룹 관리</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowGroupManager(false)}
                >
                  닫기
                </Button>
              </div>
              <GroupManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage