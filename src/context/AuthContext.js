import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage } from '@/services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // true while we check a persisted token on first load
  const [loading, setLoading] = useState(true);

  // ── On mount: restore session if a valid token exists ────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // GET /api/auth/verify — returns 200 { success, message, data:"admin" }
        // or 401 { success:false, message:"..." } → our request() throws
        await authApi.verify();
        setIsAuthenticated(true);
        setUser({ name: 'Admin' });
      } catch {
        // Token expired or invalid — remove it silently
        tokenStorage.remove();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  /**
   * Login — called by AdminModal with (email, password).
   * Backend only uses `password`; email is ignored (no email auth on backend).
   * Backend: POST /api/auth/login  body: { password }
   * Success response: { success:true, message:"Login successful.", data:{ token, expiresIn } }
   * Failure response: HTTP 401 { success:false, message:"Incorrect password." }
   *   → request() throws with that message, AdminModal catches & shows it.
   */
  const login = useCallback(async (_email, password) => {
    const res = await authApi.login(password);
    // res.data = LoginResponse { token: string, expiresIn: long }
    tokenStorage.set(res.data.token);
    setIsAuthenticated(true);
    setUser({ name: 'Admin' });
    return true;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};