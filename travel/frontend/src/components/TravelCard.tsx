import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Travel } from '../types';
import { formatBudget } from '../utils/format';

interface TravelCardProps {
  travel: Travel;
  onDelete: (id: number) => void;
}

const TravelCard: React.FC<TravelCardProps> = ({ travel, onDelete }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{travel.title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(travel.status)}`}>
            {getStatusText(travel.status)}
          </span>
        </div>
        {travel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {travel.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">기간:</span>
            <span>{formatDate(travel.start_date)} - {formatDate(travel.end_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">예산:</span>
            <span>{formatBudget(travel.budget)}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Link to={`/travel/${travel.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              상세보기
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('정말 삭제하시겠습니까?')) {
                onDelete(travel.id);
              }
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelCard;