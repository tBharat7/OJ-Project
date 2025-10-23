import { authService } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const submissionService = {
  async getSubmissions() {
    const response = await authService.makeAuthenticatedRequest(`${API_URL}/api/submissions`);
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  }
};