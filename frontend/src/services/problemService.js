// Add to authService.js or create problemService.js
import { authService } from './authService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const problemService = {
  async getProblems() {
    const response = await authService.makeAuthenticatedRequest(`${API_URL}/api/problems`);
    if (!response.ok) throw new Error('Failed to fetch problems');
    return response.json();
  },
  async getProblemById(id) {
    const response = await authService.makeAuthenticatedRequest(`${API_URL}/api/problems/${id}`);
    if (!response.ok) throw new Error('Failed to fetch problem');
    return response.json();
  }
};
