import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  onLocationChange: (location: { latitude: number; longitude: number; locationName: string }) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  locationName,
  onLocationChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [, setSearchBox] = useState<any>(null);

  // Google Maps 초기화
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const initialLat = latitude || 37.5665;
    const initialLng = longitude || 126.9780;

    const mapOptions = {
      zoom: 15,
      center: { lat: initialLat, lng: initialLng },
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    };

    const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(googleMap);

    // 마커 생성
    const newMarker = new window.google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: googleMap,
      draggable: true,
      title: '선택된 위치'
    });
    setMarker(newMarker);

    // 마커 드래그 이벤트
    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      
      // 역지오코딩으로 주소 가져오기
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        let locationName = '';
        if (status === 'OK' && results[0]) {
          locationName = results[0].formatted_address;
        }
        onLocationChange({
          latitude: lat,
          longitude: lng,
          locationName
        });
      });
    });

    // 지도 클릭 이벤트
    googleMap.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      newMarker.setPosition({ lat, lng });
      
      // 역지오코딩으로 주소 가져오기
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        let locationName = '';
        if (status === 'OK' && results[0]) {
          locationName = results[0].formatted_address;
        }
        onLocationChange({
          latitude: lat,
          longitude: lng,
          locationName
        });
      });
    });

    // Places SearchBox 초기화
    if (searchInputRef.current) {
      const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
      setSearchBox(searchBoxInstance);

      searchBoxInstance.addListener('places_changed', () => {
        const places = searchBoxInstance.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.formatted_address || place.name || '';

        newMarker.setPosition({ lat, lng });
        googleMap.setCenter({ lat, lng });
        googleMap.setZoom(15);

        onLocationChange({
          latitude: lat,
          longitude: lng,
          locationName: name
        });
      });
    }

  }, [isMapExpanded]);

  // 기존 위치가 있으면 마커 업데이트
  useEffect(() => {
    if (marker && latitude && longitude) {
      marker.setPosition({ lat: latitude, lng: longitude });
      if (map) {
        map.setCenter({ lat: latitude, lng: longitude });
      }
    }
  }, [marker, map, latitude, longitude]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Label>위치</Label>
        <div className="p-4 border rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-600">Google Maps API 키가 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>위치</Label>
      
      {/* 장소 검색 */}
      <div>
        <Input
          ref={searchInputRef}
          placeholder="장소를 검색하거나 지도에서 클릭하세요"
          defaultValue={locationName || ''}
        />
      </div>

      {/* 지도 토글 버튼 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsMapExpanded(!isMapExpanded)}
      >
        {isMapExpanded ? '지도 숨기기' : '지도에서 위치 선택'}
      </Button>

      {/* 지도 */}
      {isMapExpanded && (
        <div className="border rounded-lg overflow-hidden">
          <div
            ref={mapRef}
            style={{ width: '100%', height: '300px' }}
          />
          <div className="p-2 bg-gray-50 text-xs text-gray-600">
            💡 지도를 클릭하거나 마커를 드래그해서 위치를 선택하세요
          </div>
        </div>
      )}

      {/* 선택된 위치 정보 표시 */}
      {latitude && longitude && (
        <div className="p-2 bg-blue-50 rounded text-xs">
          <div className="font-semibold text-blue-800">선택된 위치:</div>
          <div className="text-blue-600">{locationName || '위치 정보 없음'}</div>
          <div className="text-blue-500">
            위도: {latitude.toFixed(6)}, 경도: {longitude.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;