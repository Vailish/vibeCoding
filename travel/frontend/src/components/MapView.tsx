import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { itineraryService } from '../services/itinerary';
import { formatCurrency } from '../utils/format';

interface MapViewProps {
  travelId: number;
}

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapView: React.FC<MapViewProps> = ({ travelId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: itineraries = [], isLoading: itinerariesLoading, error: itinerariesError } = useQuery({
    queryKey: ['itineraries', travelId],
    queryFn: () => {
      console.log('MapView: Fetching itineraries for travel:', travelId);
      return itineraryService.getItinerariesByTravel(travelId);
    }
  });

  // Google Maps API 로드
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log('MapView: API Key check', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return;
    }

    // Google Maps 스크립트가 이미 로드되었는지 확인
    if (window.google && window.google.maps) {
      console.log('MapView: Google Maps already loaded');
      setIsMapLoaded(true);
      return;
    }

    // 기존 스크립트가 있는지 확인
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      console.log('MapView: Google Maps script already exists, waiting for load');
      // 이미 로딩 중이면 로딩 완료를 기다림
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('MapView: Google Maps loaded via existing script');
          setIsMapLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkLoaded);
      }, 10000); // 10초 후 타임아웃
      
      return;
    }

    console.log('MapView: Loading Google Maps script');

    // 전역 콜백 함수 설정
    window.initMap = () => {
      console.log('MapView: Google Maps initialization callback called');
      setIsMapLoaded(true);
    };

    // Google Maps 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onerror = (e) => {
      console.error('MapView: Failed to load Google Maps script', e);
    };
    
    document.head.appendChild(script);

    return () => {
      // cleanup은 하지 않음 - 다른 컴포넌트에서도 사용할 수 있음
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google || !window.google.maps) {
      console.log('MapView: Map initialization skipped', {
        isMapLoaded,
        hasMapRef: !!mapRef.current,
        hasGoogleMaps: !!(window.google && window.google.maps)
      });
      return;
    }

    console.log('MapView: Initializing map');

    const mapOptions = {
      zoom: 10,
      center: { lat: 37.5665, lng: 126.9780 }, // 서울 기본 위치
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    };

    try {
      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
      console.log('MapView: Map created successfully');
      setMap(googleMap);
    } catch (error) {
      console.error('MapView: Failed to create map', error);
    }
  }, [isMapLoaded]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !window.google) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    // 일정별로 마커 생성 (실제 좌표 사용)
    itineraries.forEach((itinerary, index) => {
      // 일정에 저장된 좌표 사용, 없으면 서울 기본 위치 + 약간의 오프셋
      const lat = itinerary.latitude || (37.5665 + (Math.random() - 0.5) * 0.1);
      const lng = itinerary.longitude || (126.9780 + (Math.random() - 0.5) * 0.1);

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: itinerary.title,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 16 16 24 16 24s16-8 16-24c0-8.8-7.2-16-16-16z" fill="#3B82F6"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
              <text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#3B82F6">${index + 1}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 40),
          anchor: new window.google.maps.Point(16, 40)
        }
      });

      // 정보 창 생성
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
              ${itinerary.title}
            </h3>
            ${itinerary.location_name ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">📍 ${itinerary.location_name}</p>` : ''}
            ${itinerary.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${itinerary.description}</p>` : ''}
            <div style="font-size: 12px; color: #9ca3af;">
              <div>📅 ${new Date(itinerary.date).toLocaleDateString('ko-KR')}</div>
              ${itinerary.start_time || itinerary.end_time ? 
                `<div>🕐 ${itinerary.start_time || ''} ${itinerary.end_time ? `- ${itinerary.end_time}` : ''}</div>` : 
                ''
              }
              ${itinerary.estimated_cost > 0 ? 
                `<div>💰 ${formatCurrency(itinerary.estimated_cost)}</div>` : 
                ''
              }
              ${itinerary.latitude && itinerary.longitude ? 
                `<div style="margin-top: 4px; font-size: 11px; color: #d1d5db;">위도: ${itinerary.latitude.toFixed(5)}, 경도: ${itinerary.longitude.toFixed(5)}</div>` : 
                ''
              }
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        // 다른 정보창 닫기
        newMarkers.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        infoWindow.open(map, marker);
      });

      marker.infoWindow = infoWindow;
      newMarkers.push(marker);
      bounds.extend({ lat, lng });
      hasValidCoordinates = true;
    });

    setMarkers(newMarkers);

    // 모든 마커가 보이도록 지도 조정
    if (hasValidCoordinates && newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        map.setCenter(newMarkers[0].getPosition());
        map.setZoom(15);
      } else {
        map.fitBounds(bounds);
        // 최소 줌 레벨 설정
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, itineraries]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  console.log('MapView: Component render', { 
    travelId, 
    itinerariesLength: itineraries.length, 
    isMapLoaded, 
    itinerariesLoading,
    itinerariesError: !!itinerariesError 
  });

  if (itinerariesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">일정 로딩 오류</h3>
            <p className="text-muted-foreground">
              일정을 불러오는 중 오류가 발생했습니다.
            </p>
            <pre className="text-xs mt-4 p-2 bg-gray-100 rounded">
              {JSON.stringify(itinerariesError, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (itinerariesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>일정을 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">지도 설정 필요</h3>
            <p className="text-muted-foreground mb-4">
              Google Maps API 키가 설정되지 않았습니다.
            </p>
            <div className="text-sm text-muted-foreground bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold mb-2">설정 방법:</p>
              <ol className="text-left space-y-1">
                <li>1. frontend/.env 파일을 생성하세요</li>
                <li>2. VITE_GOOGLE_MAPS_API_KEY=your_api_key_here 를 추가하세요</li>
                <li>3. 페이지를 새로고침하세요</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMapLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>지도를 로딩 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">여행 지도</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (map && markers.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();
                markers.forEach(marker => bounds.extend(marker.getPosition()));
                map.fitBounds(bounds);
              }
            }}
          >
            전체보기
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            style={{ width: '100%', height: '500px' }}
            className="rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Legend */}
      {itineraries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">일정 목록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {itineraries.map((itinerary, index) => (
                <div
                  key={itinerary.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const marker = markers[index];
                    if (marker && map) {
                      map.setCenter(marker.getPosition());
                      map.setZoom(15);
                      // 정보창 열기
                      markers.forEach(m => {
                        if (m.infoWindow) m.infoWindow.close();
                      });
                      if (marker.infoWindow) {
                        marker.infoWindow.open(map, marker);
                      }
                    }
                  }}
                >
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{itinerary.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(itinerary.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapView;