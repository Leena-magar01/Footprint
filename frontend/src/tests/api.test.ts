import { api } from '../services/api';

// Mock global fetch
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Frontend API Client Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('should call fetch with correct URL and headers for register', async () => {
    const mockResponse = { token: 'mock_jwt_token', user: { name: 'Test User' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const registerData = { name: 'Test User', email: 'test@test.com', password: 'password123' };
    const result = await api.register(registerData);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should include Authorization header when token exists in localStorage', async () => {
    localStorageMock.setItem('ecopilot_token', 'saved_token_xyz');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'OK' })
    });

    await api.getMe();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer saved_token_xyz'
        }
      })
    );
  });

  it('should throw error when API response is not ok', async () => {
    const errorMessage = 'Unauthorized Access';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: errorMessage })
    });

    await expect(api.getMe()).rejects.toThrow(errorMessage);
  });

  it('should call footprint analytics endpoint correctly', async () => {
    localStorageMock.setItem('ecopilot_token', 'test_token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totals: { totalEmissions: 42 } })
    });

    const result: any = await api.getAnalytics();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/footprint/analytics',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.totals.totalEmissions).toBe(42);
  });

  it('should call challenges endpoint correctly', async () => {
    localStorageMock.setItem('ecopilot_token', 'test_token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ title: 'Walk Challenge' }])
    });

    const result = await api.getChallenges();
    expect(result).toEqual([{ title: 'Walk Challenge' }]);
  });
});
