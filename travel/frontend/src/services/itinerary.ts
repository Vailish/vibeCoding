import api from '../lib/api';
import { Itinerary, CreateItineraryRequest, UpdateItineraryRequest, ItineraryPlace } from '../types';

export const itineraryService = {
  async getItinerariesByTravel(travelId: number): Promise<Itinerary[]> {
    const response = await api.get(`/itineraries/travel/${travelId}`);
    return response.data;
  },

  async getItinerary(id: number): Promise<Itinerary> {
    const response = await api.get(`/itineraries/${id}`);
    return response.data;
  },

  async createItinerary(data: CreateItineraryRequest): Promise<{ message: string; itineraryId: number }> {
    const response = await api.post('/itineraries', data);
    return response.data;
  },

  async updateItinerary(id: number, data: UpdateItineraryRequest): Promise<{ message: string }> {
    const response = await api.put(`/itineraries/${id}`, data);
    return response.data;
  },

  async deleteItinerary(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/itineraries/${id}`);
    return response.data;
  },

  async getItineraryPlaces(itineraryId: number): Promise<ItineraryPlace[]> {
    const response = await api.get(`/itineraries/${itineraryId}/places`);
    return response.data;
  },

  async addPlaceToItinerary(
    itineraryId: number, 
    placeId: number, 
    orderIndex?: number,
    arrivalTime?: string,
    departureTime?: string
  ): Promise<{ message: string; itineraryPlaceId: number }> {
    const response = await api.post(`/itineraries/${itineraryId}/places`, {
      place_id: placeId,
      order_index: orderIndex,
      arrival_time: arrivalTime,
      departure_time: departureTime
    });
    return response.data;
  },

  async removePlaceFromItinerary(itineraryPlaceId: number): Promise<{ message: string }> {
    const response = await api.delete(`/itineraries/places/${itineraryPlaceId}`);
    return response.data;
  }
};