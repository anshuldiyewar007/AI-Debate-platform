import api from './axiosConfig'

/**
 * Debates API service
 */
export const debateService = {
  /**
   * Get paginated list of debates
   */
  async listDebates(page = 1, limit = 10) {
    const response = await api.get('/debates', {
      params: { page, limit },
    })
    return response.data
  },

  /**
   * Get a specific debate by ID
   */
  async getDebate(debateId) {
    const response = await api.get(`/debates/${debateId}`)
    return response.data
  },

  /**
   * Create a new debate
   */
  async createDebate(topic) {
    const response = await api.post('/debates', {
      topic,
    })
    return response.data
  },

  /**
   * Add user argument to debate
   */
  async addArgument(debateId, side, content) {
    const response = await api.post(`/debates/${debateId}/participate`, {
      side,
      content,
    })
    return response.data
  },

  /**
   * Vote on an argument
   */
  async voteOnArgument(debateId, argumentId) {
    const response = await api.post(
      `/debates/${debateId}/vote/${argumentId}`
    )
    return response.data
  },

  /**
   * Generate debate summary
   */
  async generateSummary(debateId) {
    const response = await api.post(`/debates/${debateId}/summary`)
    return response.data
  },
}
