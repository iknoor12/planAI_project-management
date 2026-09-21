import api from './api';

export const getNotesByProject = async (projectId) => {
  const response = await api.get(`/notes/project/${projectId}`);
  return response.data;
};

export const getNoteById = async (noteId) => {
  const response = await api.get(`/notes/${noteId}`);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (noteId, noteData) => {
  const response = await api.put(`/notes/${noteId}`, noteData);
  return response.data;
};

export const deleteNote = async (noteId) => {
  const response = await api.delete(`/notes/${noteId}`);
  return response.data;
};
