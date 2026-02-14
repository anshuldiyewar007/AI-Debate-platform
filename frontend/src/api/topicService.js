import api from './axiosConfig'

/**
 * Topics API service
 */
export const topicService = {
  /**
   * Get all topics
   */
  async listTopics() {
    const response = await api.get('/topics')
    return response.data
  },

  /**
   * Get a specific topic
   */
  async getTopic(topicId) {
    const response = await api.get(`/topics/${topicId}`)
    return response.data
  },

  /**
   * Create a new topic (admin only)
   */
  async createTopic(title, description) {
    const response = await api.post('/topics', {
      title,
      description,
    })
    return response.data
  },

  /**
   * Delete a topic (admin only)
   */
  async deleteTopic(topicId) {
    const response = await api.delete(`/topics/${topicId}`)
    return response.data
  },
}
