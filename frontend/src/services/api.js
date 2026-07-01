import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/user/update', profileData);
    return response.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/user/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/user/delete');
    return response.data;
  },
};

// Chatbot endpoints
export const chatAPI = {
  sendMessage: async (message) => {
    const response = await api.post('/chat/', { message });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
};

// Symptom Checker endpoints
export const symptomAPI = {
  check: async (symptoms) => {
    const response = await api.post('/symptom-checker/', { symptoms });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/symptom-checker/history');
    return response.data;
  },
};

// Report Summarizer endpoints
export const reportAPI = {
  summarize: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/reports/summarize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/reports/history');
    return response.data;
  },
};

// Doctor endpoints (includes helper admin methods for easy seeding)
export const doctorAPI = {
  list: async () => {
    const response = await api.get('/doctors/');
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  getSlots: async (id) => {
    const response = await api.get(`/doctors/${id}/slots`);
    return response.data;
  },
  createDoctor: async (doctorData) => {
    // doctorData: { name, email, speciality, qualification, experience, hospital }
    const response = await api.post('/doctors/', doctorData);
    return response.data;
  },
  createSlot: async (slotData) => {
    // slotData: { doctor_id, slot_date: "YYYY-MM-DD", slot_time: "HH:MM" }
    const response = await api.post('/doctors/availability', slotData);
    return response.data;
  },
};

// Appointment endpoints
export const appointmentAPI = {
  book: async (doctorId, date, time) => {
    const response = await api.post('/appointments/', {
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time,
    });
    return response.data;
  },
  listMine: async () => {
    const response = await api.get('/appointments/me');
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },
};

export default api;
