import apiClient from './axiosClient';

export const getDrivers = async () => {
  const { data } = await apiClient.get('/users/drivers');
  return data;
};

export const getOwners = async () => {
  const { data } = await apiClient.get('/users/owners');
  return data;
};
