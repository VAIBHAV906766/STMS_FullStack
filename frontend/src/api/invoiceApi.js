import apiClient from './axiosClient';

export const generateInvoice = async (payload) => {
  const { data } = await apiClient.post('/invoices/generate', payload);
  return data;
};

export const getMyInvoices = async () => {
  const { data } = await apiClient.get('/invoices/my');
  return data;
};

export const getOwnerInvoices = async () => {
  const { data } = await apiClient.get('/invoices/owner');
  return data;
};
