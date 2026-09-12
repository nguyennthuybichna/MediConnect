import api from './api';

export const bookAppointmentAPI = async (bookingData) => {
  const response = await api.post('/appointments', bookingData);
  return response.data;
};

export const getBookedSlotsAPI = async (doctorId, date) => {
  const response = await api.get('/appointments/booked-slots', {
    params: { doctor_id: doctorId, date }
  });
  return response.data;
};
