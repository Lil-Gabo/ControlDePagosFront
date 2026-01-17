import CONFIG from '../config.js';

class StorageUtil {
  setToken(token) {
    localStorage.setItem(CONFIG.STORAGE.TOKEN, token);
  }

  getToken() {
    return localStorage.getItem(CONFIG.STORAGE.TOKEN);
  }

  removeToken() {
    localStorage.removeItem(CONFIG.STORAGE.TOKEN);
  }

  setUser(user) {
    localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(CONFIG.STORAGE.USER);
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem(CONFIG.STORAGE.USER);
  }

  clear() {
    this.removeToken();
    this.removeUser();
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new StorageUtil();