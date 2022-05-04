
class SessionStore {
  constructor(sessions = new Map()) {
    this.sessions = sessions
  }
  
  findSession(id) {
    return this.sessions.get(id);
  }
  
  saveSession(id, session) {
    this.sessions.set(id, session)
    
    
  }
  
  forEachSession(callback, thisArg) {
    this.sessions.forEach(callback, thisArg)
  }
}

export default new SessionStore()