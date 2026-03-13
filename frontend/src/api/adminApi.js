import apiClient from './axiosClient';

export const getVerificationRequests = async () => {
  const { data } = await apiClient.get('/admin/verification-requests');
  return data;
};

export const verifyOwnerAccount = async (ownerId) => {
  const { data } = await apiClient.patch(`/admin/verify-owner/${ownerId}`);
  return data;
};

export const getAdminSupportQueries = async () => {
  const { data } = await apiClient.get('/admin/support-queries');
  return data;
};

export const updateAdminSupportQueryStatus = async (queryId, status) => {
  const { data } = await apiClient.patch(`/admin/support/${queryId}/status`, { status });
  return data;
};
