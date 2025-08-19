import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { itineraryService } from '../services/itinerary';
import { Itinerary } from '../types';
import ItineraryForm from './ItineraryForm';
import { formatCurrency, getBudgetStatusColor, getBudgetStatusText, getItineraryBudgetText } from '../utils/format';

interface ItineraryManagerProps {
  travelId: number;
  startDate: string;
  endDate: string;
}

const ItineraryManager: React.FC<ItineraryManagerProps> = ({ 
  travelId, 
  startDate, 
  endDate 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [draggedItem, setDraggedItem] = useState<Itinerary | null>(null);
  const queryClient = useQueryClient();

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['itineraries', travelId],
    queryFn: () => itineraryService.getItinerariesByTravel(travelId)
  });

  const deleteMutation = useMutation({
    mutationFn: itineraryService.deleteItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', travelId] });
      alert('일정이 삭제되었습니다.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '일정 삭제에 실패했습니다.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      itineraryService.updateItinerary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', travelId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '일정 수정에 실패했습니다.');
    }
  });

  // 날짜별로 일정을 그룹화
  const getDateRange = () => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const getItinerariesByDate = (date: string) => {
    return itineraries.filter(item => 
      new Date(item.date).toISOString().split('T')[0] === date
    );
  };

  const handleAddItinerary = (date: string) => {
    setSelectedDate(date);
    setEditingItinerary(null);
    setShowForm(true);
  };

  const handleEditItinerary = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setSelectedDate(new Date(itinerary.date).toISOString().split('T')[0]);
    setShowForm(true);
  };

  const handleDeleteItinerary = (id: number) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleComplete = (itinerary: Itinerary) => {
    updateMutation.mutate({
      id: itinerary.id,
      data: { is_completed: !itinerary.is_completed }
    });
  };

  const handleDragStart = (e: React.DragEvent, itinerary: Itinerary) => {
    setDraggedItem(itinerary);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const sourceDate = new Date(draggedItem.date).toISOString().split('T')[0];
    
    if (sourceDate !== targetDate) {
      // 다른 날짜로 이동하는 경우
      updateMutation.mutate({
        id: draggedItem.id,
        data: { date: targetDate }
      });
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM 형식으로 자르기
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    
    let dayInfo = '';
    if (diffDays === 0) dayInfo = ' (오늘)';
    else if (diffDays === 1) dayInfo = ' (내일)';
    else if (diffDays > 0) dayInfo = ` (D-${diffDays})`;
    else dayInfo = ` (D+${Math.abs(diffDays)})`;
    
    return `${dateStr} (${weekday})${dayInfo}`;
  };

  // 예산 요약 계산
  const getBudgetSummary = () => {
    if (!itineraries) return { totalEstimated: 0, totalActual: 0, completedCount: 0, totalCount: 0 };
    
    const totalEstimated = itineraries.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0);
    const totalActual = itineraries.reduce((sum, item) => sum + (Number(item.actual_cost) || 0), 0);
    const completedCount = itineraries.filter(item => Boolean(item.is_completed)).length;
    const totalCount = itineraries.length;
    
    return { totalEstimated, totalActual, completedCount, totalCount };
  };

  const budgetSummary = getBudgetSummary();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>일정을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">여행 일정</h2>
        <p className="text-sm text-muted-foreground">
          {getDateRange().length}일간의 여행
        </p>
      </div>

      {/* Budget Summary */}
      {budgetSummary.totalCount > 0 && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">💰 예산 요약</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetSummary.totalEstimated)}</p>
                <p className="text-xs text-muted-foreground">총 예산</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getBudgetStatusColor(budgetSummary.totalEstimated, budgetSummary.totalActual)}`}>
                  {formatCurrency(budgetSummary.totalActual)}
                </p>
                <p className="text-xs text-muted-foreground">실제 지출</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getBudgetStatusColor(budgetSummary.totalEstimated, budgetSummary.totalActual)}`}>
                  {getBudgetStatusText(budgetSummary.totalEstimated, budgetSummary.totalActual)}
                </p>
                <p className="text-xs text-muted-foreground">예산 상태</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {budgetSummary.completedCount}/{budgetSummary.totalCount}
                </p>
                <p className="text-xs text-muted-foreground">완료된 일정</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date List */}
      <div className="space-y-4">
        {getDateRange().map((date, index) => {
          const dayItineraries = getItinerariesByDate(date);
          const dayNumber = index + 1;
          
          return (
            <Card 
              key={date} 
              className="overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">
                      Day {dayNumber} - {formatDate(date)}
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItinerary(date)}
                  >
                    + 일정 추가
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {dayItineraries.length === 0 ? (
                  <div 
                    className={`p-6 text-center text-muted-foreground min-h-[100px] flex flex-col justify-center transition-colors ${
                      draggedItem ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">📝</div>
                    <p>아직 일정이 없습니다</p>
                    <p className="text-sm">
                      {draggedItem ? '여기에 일정을 드롭하세요' : '일정을 추가해서 하루를 계획해보세요!'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dayItineraries
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((itinerary, idx) => (
                      <div
                        key={itinerary.id}
                        className={`p-4 transition-colors cursor-move ${
                          draggedItem?.id === itinerary.id 
                            ? 'opacity-50 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, itinerary)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <h4 className="font-semibold">{itinerary.title}</h4>
                              {(itinerary.start_time || itinerary.end_time) && (
                                <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                                  {formatTime(itinerary.start_time)} 
                                  {itinerary.end_time && ` - ${formatTime(itinerary.end_time)}`}
                                </span>
                              )}
                            </div>
                            
                            {itinerary.description && (
                              <p className="text-sm text-muted-foreground mb-2 ml-9">
                                {itinerary.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 ml-9 text-xs text-muted-foreground">
                              {((Number(itinerary.estimated_cost) || 0) > 0 || (Number(itinerary.actual_cost) || 0) > 0 || itinerary.is_completed) && (
                                <span 
                                  className={`${getBudgetStatusColor(Number(itinerary.estimated_cost) || 0, Number(itinerary.actual_cost) || 0)}`}
                                >
                                  {getItineraryBudgetText(
                                    Number(itinerary.estimated_cost) || 0,
                                    Number(itinerary.actual_cost) || 0,
                                    Boolean(itinerary.is_completed)
                                  )}
                                </span>
                              )}
                              {itinerary.notes && (
                                <span>메모: {itinerary.notes}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleComplete(itinerary)}
                              className={`${
                                itinerary.is_completed 
                                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              {itinerary.is_completed ? '✓ 완료됨' : '○ 미완료'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItinerary(itinerary)}
                            >
                              수정
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItinerary(itinerary.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Itinerary Form Modal */}
      {showForm && (
        <ItineraryForm
          travelId={travelId}
          selectedDate={selectedDate}
          editingItinerary={editingItinerary}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ItineraryManager;