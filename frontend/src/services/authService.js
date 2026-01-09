import api from './api';

export const authService = {
  async register(email, password) {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async walletAuth(walletAddress, signature, message) {
    const response = await api.post('/auth/wallet-auth', {
      walletAddress,
      signature,
      message
    });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async linkWallet(walletAddress, signature, message) {
    const response = await api.post('/auth/link-wallet', {
      walletAddress,
      signature,
      message
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
  }
};
