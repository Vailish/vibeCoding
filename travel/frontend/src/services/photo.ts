import api from '../lib/api';
import { Photo } from '../types';

export const photoService = {
  async uploadPhotos(travelId: number, files: File[], captions?: string[]): Promise<{ message: string; photos: any[] }> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    if (captions) {
      captions.forEach(caption => {
        formData.append('captions', caption);
      });
    }
    
    const response = await api.post(`/photos/upload/${travelId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getPhotosByTravel(travelId: number): Promise<Photo[]> {
    const response = await api.get(`/photos/travel/${travelId}`);
    return response.data;
  },

  async getPhoto(id: number): Promise<Photo> {
    const response = await api.get(`/photos/${id}`);
    return response.data;
  },

  async updatePhoto(id: number, data: { caption?: string; place_id?: number }): Promise<{ message: string }> {
    const response = await api.put(`/photos/${id}`, data);
    return response.data;
  },

  async deletePhoto(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/photos/${id}`);
    return response.data;
  },

  getPhotoUrl(filename: string): string {
    const baseURL = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${baseURL.replace('/api', '')}/uploads/photos/${filename}`;
  },

  getThumbnailUrl(filename: string): string {
    const baseURL = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${baseURL.replace('/api', '')}/uploads/thumbnails/thumb-${filename}`;
  }
};