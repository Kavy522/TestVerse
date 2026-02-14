/**
 * Authentication Module - University Exam Portal
 */

const Auth = {
  /**
   * Check if user is authenticated
   */
  isLoggedIn() {
    return API.isAuthenticated();
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return API.getUser();
  },

  /**
   * Get user role
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  /**
   * Check if current user is staff
   */
  isStaff() {
    return this.getUserRole() === 'staff';
  },

  /**
   * Check if current user is student
   */
  isStudent() {
    return this.getUserRole() === 'student';
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await API.login(email, password);
    return response;
  },

  /**
   * Register new user
   */
  async register(userData) {
    return await API.register(userData);
  },

  /**
   * Logout user
   */
  logout() {
    API.clearTokens();
    window.location.href = CONFIG.ROUTES.LOGIN;
  },

  /**
   * Redirect based on user role
   */
  redirectToDashboard() {
    if (this.isStaff()) {
      window.location.href = CONFIG.ROUTES.STAFF_DASHBOARD;
    } else {
      window.location.href = CONFIG.ROUTES.STUDENT_DASHBOARD;
    }
  },

  /**
   * Protect route - redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = CONFIG.ROUTES.LOGIN;
      return false;
    }
    return true;
  },

  /**
   * Protect staff routes
   */
  requireStaff() {
    if (!this.requireAuth()) return false;
    if (!this.isStaff()) {
      window.location.href = CONFIG.ROUTES.STUDENT_DASHBOARD;
      return false;
    }
    return true;
  },

  /**
   * Protect student routes
   */
  requireStudent() {
    if (!this.requireAuth()) return false;
    if (!this.isStudent()) {
      window.location.href = CONFIG.ROUTES.STAFF_DASHBOARD;
      return false;
    }
    return true;
  },

  /**
   * Redirect if already logged in - executed once only
   */
  redirectIfLoggedIn() {
    // Check if redirect already triggered to prevent loops
    if (window._redirectIfLoggedInExecuted) {
      return false;
    }
    
    if (this.isLoggedIn()) {
      window._redirectIfLoggedInExecuted = true;
      this.redirectToDashboard();
      return true;
    }
    return false;
  }
};
