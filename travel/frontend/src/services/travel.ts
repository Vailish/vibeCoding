import api from '../lib/api';
import { Travel, CreateTravelRequest, UpdateTravelRequest } from '../types';

export const travelService = {
  async getTravels(): Promise<Travel[]> {
    const response = await api.get('/travels');
    return response.data;
  },

  async getTravel(id: number): Promise<Travel> {
    const response = await api.get(`/travels/${id}`);
    return response.data;
  },

  async createTravel(data: CreateTravelRequest): Promise<{ message: string; travelId: number }> {
    const response = await api.post('/travels', data);
    return response.data;
  },

  async updateTravel(id: number, data: UpdateTravelRequest): Promise<{ message: string }> {
    const response = await api.put(`/travels/${id}`, data);
    return response.data;
  },

  async deleteTravel(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/travels/${id}`);
    return response.data;
  }
};