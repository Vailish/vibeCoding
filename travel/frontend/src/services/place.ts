import api from '../lib/api';
import { Place, CreatePlaceRequest } from '../types';

export const placeService = {
  async getPlaces(search?: string): Promise<Place[]> {
    const params = search ? { search } : {};
    const response = await api.get('/places', { params });
    return response.data;
  },

  async getPlace(id: number): Promise<Place> {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },

  async createPlace(data: CreatePlaceRequest): Promise<{ message: string; placeId: number }> {
    const response = await api.post('/places', data);
    return response.data;
  },

  async updatePlace(id: number, data: Partial<CreatePlaceRequest>): Promise<{ message: string }> {
    const response = await api.put(`/places/${id}`, data);
    return response.data;
  },

  async deletePlace(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/places/${id}`);
    return response.data;
  },

  async searchPlaces(query: string): Promise<Place[]> {
    return this.getPlaces(query);
  }
};