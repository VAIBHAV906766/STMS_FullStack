import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('stms_user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem('stms_token');

export const roleHomePath = (role) => {
  if (role === 'OWNER') return '/owner/dashboard';
  if (role === 'DRIVER') return '/driver/dashboard';
  return '/customer/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const login = (authData) => {
    const nextToken = authData?.token;
    const nextUser = authData?.user;

    setToken(nextToken);
    setUser(nextUser);

    localStorage.setItem('stms_token', nextToken);
    localStorage.setItem('stms_user', JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stms_token');
    localStorage.removeItem('stms_user');
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
