import api from './axiosConfig'

/**
 * Admin API service
 */
export const adminService = {
  /**
   * Get platform analytics (admin only)
   */
  async getAnalytics() {
    const response = await api.get('/admin/analytics')
    return response.data
  },
}
