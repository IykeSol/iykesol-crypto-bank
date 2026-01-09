import api from './api';

export const transactionService = {
  async getTransactions(page = 1, limit = 20) {
    const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  async logTransaction(transactionData) {
    const response = await api.post('/transactions', {
      ...transactionData,
      status: 'confirmed'
    });
    return response.data;
  },


  async getTransactionByHash(txHash) {
    const response = await api.get(`/transactions/${txHash}`);
    return response.data;
  }
};
