import api from './axiosConfig'

/**
 * Authentication API service
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(email, password, name) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
    })
    
    // Store token and user info
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    return response.data
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    
    // Store token and user info
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    return response.data
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },
}
