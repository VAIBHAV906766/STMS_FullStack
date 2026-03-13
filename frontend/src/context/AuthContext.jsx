import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEYS = ['stms_token', 'token'];
const USER_KEY = 'stms_user';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const getStoredToken = () => TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || null;

export const roleHomePath = (role) => {
  if (role === 'ADMIN') return '/admin/verification-requests';
  if (role === 'OWNER') return '/owner/dashboard';
  if (role === 'DRIVER') return '/driver/dashboard';
  return '/customer/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const login = (authData) => {
    const nextToken = authData?.token || authData?.accessToken;
    const nextUser = authData?.user;

    if (!nextToken || !nextUser?.role) {
      throw new Error('Invalid authentication payload.');
    }

    setToken(nextToken);
    setUser(nextUser);

    TOKEN_KEYS.forEach((key) => localStorage.setItem(key, nextToken));
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
