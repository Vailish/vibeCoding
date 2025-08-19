// 사용자 타입
export interface User {
  id: number;
  email: string;
  name: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// 그룹 관련 타입
export interface Group {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'admin' | 'member';
  joined_at: string;
  user_name: string;
  user_email: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  user_id: number;
  role?: 'admin' | 'member';
}

// 여행 관련 타입
export interface Travel {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: 'planning' | 'ongoing' | 'completed';
  user_id: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  group_id?: number;
}

export interface UpdateTravelRequest {
  title?: string;
  description?: string;
  status?: 'planning' | 'ongoing' | 'completed';
  budget?: number;
}

// 장소 관련 타입
export interface Place {
  id: number;
  name: string;
  address?: string;
  category: 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  operating_hours?: string;
  average_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaceRequest {
  name: string;
  address?: string;
  category: 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  operating_hours?: string;
  average_cost?: number;
}

// 일정 관련 타입
export interface Itinerary {
  id: number;
  travel_id: number;
  date: string;
  order_index: number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost: number;
  actual_cost: number;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItineraryRequest {
  travel_id: number;
  date: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_completed?: boolean;
  notes?: string;
}

export interface UpdateItineraryRequest {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_completed?: boolean;
  notes?: string;
}

export interface ItineraryPlace {
  id: number;
  itinerary_id: number;
  place_id: number;
  order_index: number;
  arrival_time?: string;
  departure_time?: string;
  actual_cost?: number;
  rating?: number;
  review?: string;
  place: Place;
}

// 사진 관련 타입
export interface Photo {
  id: number;
  travel_id: number;
  place_id?: number;
  filename: string;
  original_name: string;
  size: number;
  taken_at?: string;
  latitude?: number;
  longitude?: number;
  caption?: string;
  upload_date: string;
}