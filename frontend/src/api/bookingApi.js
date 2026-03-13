import apiClient from './axiosClient';

export const createBooking = async (payload) => {
  const { data } = await apiClient.post('/bookings', payload);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await apiClient.get('/bookings/my');
  return data;
};

export const getPendingBookings = async () => {
  const { data } = await apiClient.get('/bookings/pending');
  return data;
};

export const getApprovedUninvoicedBookings = async () => {
  const { data } = await apiClient.get('/bookings/approved-uninvoiced');
  return data;
};

export const updateBookingStatus = async (bookingId, payload) => {
  const { data } = await apiClient.patch(`/bookings/${bookingId}/status`, payload);
  return data;
};

export const getAssignedTrips = async () => {
  const { data } = await apiClient.get('/bookings/assigned');
  return data;
};
