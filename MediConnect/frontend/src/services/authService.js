import api from './api';

export const loginAPI = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerAPI = async (email, password, fullName, role, specialty) => {
  const response = await api.post('/auth/register', {
    email,
    password,
    full_name: fullName,
    role,
    specialty
  });
  return response.data;
};
