import apiClient from './axiosClient';

export const requestOwnerVerification = async (payload) => {
  const { data } = await apiClient.post('/owners/request-verification', payload);
  return data;
};

export const getMyOwnerVerificationStatus = async () => {
  const { data } = await apiClient.get('/owners/my-verification');
  return data;
};
