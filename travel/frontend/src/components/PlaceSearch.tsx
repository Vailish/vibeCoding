import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { placeService } from '../services/place';
import { Place } from '../types';
import { formatCurrency } from '../utils/format';

interface PlaceSearchProps {
  onSelectPlace: (place: Place) => void;
  onClose: () => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onSelectPlace, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['places', 'search', debouncedQuery],
    queryFn: () => placeService.searchPlaces(debouncedQuery),
    enabled: debouncedQuery.length > 0
  });

  const getCategoryText = (category: string) => {
    const categoryMap = {
      attraction: '관광지',
      restaurant: '음식점',
      accommodation: '숙소',
      shopping: '쇼핑',
      activity: '액티비티'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      attraction: '🏛️',
      restaurant: '🍽️',
      accommodation: '🏨',
      shopping: '🛍️',
      activity: '🎯'
    };
    return iconMap[category as keyof typeof iconMap] || '📍';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">장소 검색</h3>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소명이나 주소를 입력하세요..."
            className="w-full"
          />
        </div>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          {searchQuery.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="text-4xl mb-2">🔍</div>
              <p>장소명이나 주소를 검색해보세요</p>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>검색 중...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="text-4xl mb-2">😔</div>
              <p>검색 결과가 없습니다</p>
              <p className="text-sm">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="divide-y">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectPlace(place)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(place.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{place.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {getCategoryText(place.category)}
                        </span>
                      </div>
                      {place.address && (
                        <p className="text-sm text-muted-foreground mb-2">
                          📍 {place.address}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {place.phone && (
                          <span>📞 {place.phone}</span>
                        )}
                        {place.average_cost && place.average_cost > 0 && (
                          <span>💰 평균 {formatCurrency(place.average_cost)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceSearch;