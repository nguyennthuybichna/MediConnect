import api from './api';

export const diagnoseSymptomsAPI = async (patientId, symptomsText) => {

  const response = await api.post('/diagnosis', {
    patient_id: patientId,
    symptoms_text: symptomsText
  });
  return response.data;
};
