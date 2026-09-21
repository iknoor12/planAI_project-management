import api from './api';

export const getProjectFiles = async (projectId) => {
  const response = await api.get(`/files/project/${projectId}`);
  return response.data;
};

export const getFileById = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

export const getFilePreviewUrl = async (fileId) => {
  const response = await api.get(`/files/${fileId}/preview`);
  return response.data;
};

export const getFileDownloadUrl = async (fileId) => {
  const response = await api.get(`/files/${fileId}/download`);
  return response.data;
};

export const uploadProjectFile = async (projectId, formData) => {
  const response = await api.post(`/files/project/${projectId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};