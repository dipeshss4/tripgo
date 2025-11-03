import api from './api';

export interface CruiseDeparture {
  id: string;
  cruiseId: string;
  departureDate: string;
  returnDate: string;
  availableSeats: number;
  priceModifier: number;
  status: 'AVAILABLE' | 'FILLING_FAST' | 'SOLD_OUT' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cruise?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface CreateDepartureData {
  cruiseId: string;
  departureDate: string;
  returnDate: string;
  availableSeats?: number;
  priceModifier?: number;
  status?: 'AVAILABLE' | 'FILLING_FAST' | 'SOLD_OUT' | 'CANCELLED';
  notes?: string;
}

export interface UpdateDepartureData extends Partial<Omit<CreateDepartureData, 'cruiseId'>> {}

export const cruiseDepartureService = {
  async getDeparturesByCruise(cruiseId: string, upcoming = true) {
    const params = new URLSearchParams();
    if (upcoming) params.append('upcoming', 'true');

    const response = await api.get(`/cruise-departures/cruise/${cruiseId}?${params.toString()}`);
    return response.data.data;
  },

  async getDeparture(id: string) {
    const response = await api.get(`/cruise-departures/${id}`);
    return response.data.data;
  },

  async createDeparture(data: CreateDepartureData) {
    const response = await api.post('/cruise-departures', data);
    return response.data.data;
  },

  async createBulkDepartures(cruiseId: string, departures: Omit<CreateDepartureData, 'cruiseId'>[]) {
    const response = await api.post('/cruise-departures/bulk', {
      cruiseId,
      departures,
    });
    return response.data.data;
  },

  async updateDeparture(id: string, data: UpdateDepartureData) {
    const response = await api.put(`/cruise-departures/${id}`, data);
    return response.data.data;
  },

  async deleteDeparture(id: string) {
    const response = await api.delete(`/cruise-departures/${id}`);
    return response.data;
  },

  async updateSeats(id: string, seatsToBook: number) {
    const response = await api.patch(`/cruise-departures/${id}/update-seats`, { seatsToBook });
    return response.data.data;
  },
};