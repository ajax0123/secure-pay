import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wallet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    let message =
      data?.message ||
      error?.message ||
      'Unexpected network error. Please try again.';

    if (data?.errors?.fieldErrors) {
      const fieldMessages = Object.values(data.errors.fieldErrors)
        .flat()
        .filter(Boolean);
      if (fieldMessages.length > 0) {
        message = `${message} ${fieldMessages.join(' ')}`;
      }
    }

    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: {
          type: 'error',
          message
        }
      })
    );

    return Promise.reject(error);
  }
);

export default api;
