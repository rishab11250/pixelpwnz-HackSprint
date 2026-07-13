import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds (ingesting vectors can take time)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach session_id if available
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT token if it exists
    const token = localStorage.getItem('signet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor – handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401 || status === 403) {
        console.warn('[Signet API] Unauthorized. Please log in again.');
        localStorage.removeItem('signet_token');
        // You might want to dispatch an event here to trigger a logout in the UI
      } else if (status === 404) {
        console.warn('[Signet API] Resource not found.');
      } else if (status === 429) {
        console.warn('[Signet API] Rate limited. Please wait.');
      } else if (status === 503 || status === 504) {
        console.warn('[Signet API] Service unavailable.');
      }
    } else if (error.code === 'ERR_NETWORK') {
      console.warn('[Signet API] Network error – are you offline?');
    }

    return Promise.reject(error);
  }
);

/**
 * Upload a WhatsApp .txt file
 * @param {File} file - The .txt file
 * @param {string} userName - User's name as it appears in the chat
 * @param {function} onProgress - Upload progress callback (0-100)
 */
export const uploadChat = async (file, userName, onProgress) => {
  const formData = new FormData();
  formData.append('chatFile', file);
  formData.append('user_name', userName);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

/**
 * Send a message to the AI clone
 * @param {string} sessionId
 * @param {string} incomingMessage
 * @param {number} temperature (optional, default 0.7)
 */
export const sendMessage = async (sessionId, incomingMessage, temperature = 0.7) => {
  const response = await apiClient.post('/chat', {
    session_id: sessionId,
    incoming_message: incomingMessage,
    temperature,
  });

  return response.data;
};

/**
 * Get session stats
 * @param {string} sessionId
 */
export const getStats = async (sessionId) => {
  const response = await apiClient.get(`/stats/${sessionId}`);
  return response.data;
};

/**
 * Get session details and chat history
 * @param {string} sessionId
 */
export const getSessionDetails = async (sessionId) => {
  const response = await apiClient.get(`/session/${sessionId}`);
  return response.data;
};

/**
 * Delete/clear a session
 * @param {string} sessionId
 */
export const clearSession = async (sessionId) => {
  await apiClient.delete(`/sessions/${sessionId}`);
};

/**
 * Register a new user
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const registerUser = async (email, password, name) => {
  const response = await apiClient.post('/auth/register', { email, password, name });
  return response.data;
};

/**
 * Login a user
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Get the current user profile (also validates token)
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Get all active sessions for the current user
 */
export const getSessions = async () => {
  const response = await apiClient.get('/sessions');
  return response.data;
};

/**
 * Get bookmarked personas for the current user
 */
export const getBookmarkedPersonas = async () => {
  const response = await apiClient.get('/persona/bookmarks');
  return response.data;
};

/**
 * Toggle bookmark for a persona
 */
export const toggleBookmark = async (id) => {
  const response = await apiClient.post(`/persona/${id}/bookmark`);
  return response.data;
};

export default apiClient;
