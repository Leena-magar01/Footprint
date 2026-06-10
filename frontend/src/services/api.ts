const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('ecopilot_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData: any = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Footprint
  async logFootprint(data: any) {
    const res = await fetch(`${API_BASE_URL}/footprint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getFootprintHistory(page = 1, limit = 10) {
    const res = await fetch(`${API_BASE_URL}/footprint/history?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/footprint/analytics`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getForecast() {
    const res = await fetch(`${API_BASE_URL}/footprint/predict`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Challenges
  async getChallenges() {
    const res = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async joinChallenge(challengeId: string) {
    const res = await fetch(`${API_BASE_URL}/challenges/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId })
    });
    return handleResponse(res);
  },

  async completeChallenge(userChallengeId: string) {
    const res = await fetch(`${API_BASE_URL}/challenges/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userChallengeId })
    });
    return handleResponse(res);
  },

  // Goals
  async getGoals() {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createGoal(data: any) {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // AI
  async getAIInsights() {
    const res = await fetch(`${API_BASE_URL}/ai/insights`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async uploadEcoLensImage(formData: FormData) {
    const token = localStorage.getItem('ecopilot_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Note: Fetch sets correct multipart boundary automatically if headers are left empty
    const res = await fetch(`${API_BASE_URL}/ai/ecolens`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  },

  // Leaderboard
  async getLeaderboard() {
    const res = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationsRead(notificationId?: string) {
    const url = notificationId 
      ? `${API_BASE_URL}/notifications/${notificationId}/read`
      : `${API_BASE_URL}/notifications/read`;
      
    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
