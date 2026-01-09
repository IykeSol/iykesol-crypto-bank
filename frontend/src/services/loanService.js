import api from './api';

export const loanService = {
  async requestLoan(amount, duration, reason) {
    const response = await api.post('/loans/request', {
      amount,
      duration,
      reason
    });
    return response.data;
  },

  async getMyLoans() {
    const response = await api.get('/loans/my-loans');
    return response.data;
  },

  async getAllLoans() {
    const response = await api.get('/loans/all');
    return response.data;
  },

  async approveLoan(loanId) {
    const response = await api.post(`/loans/approve/${loanId}`);
    return response.data;
  },

  async rejectLoan(loanId, reason) {
    const response = await api.post(`/loans/reject/${loanId}`, { reason });
    return response.data;
  },

  async makePayment(loanId, amount, txHash) {
    const response = await api.post(`/loans/pay/${loanId}`, {
      amount,
      txHash
    });
    return response.data;
  }
};
