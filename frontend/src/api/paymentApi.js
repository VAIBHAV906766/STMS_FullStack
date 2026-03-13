import apiClient from './axiosClient';

export const payInvoice = async (payload) => {
  const { data } = await apiClient.post('/payments/pay', payload);
  return data;
};
