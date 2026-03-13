import apiClient from './axiosClient';

export const createSupportQuery = async (payload) => {
  const { data } = await apiClient.post('/support/query', payload);
  return data;
};

export const getMySupportQueries = async () => {
  const { data } = await apiClient.get('/support/my-queries');
  return data;
};
