import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuth = async () => {
      try {
        // In a real app, this would verify the token with the backend
        const storedAuth = localStorage.getItem('isAuthenticated');
        
        if (storedAuth === 'true') {
          // Mock user data - in a real app, this would come from the backend
          setUser({
            id: '1',
            name: 'Dr. Rebecca Johnson',
            email: 'rebecca@mentalspace.com',
            role: 'clinician'
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would call the backend API
      // const response = await api.post('/auth/login', { email, password });
      
      // Mock successful login
      localStorage.setItem('isAuthenticated', 'true');
      
      // Mock user data
      const userData = {
        id: '1',
        name: 'Dr. Rebecca Johnson',
        email,
        role: 'clinician'
      };
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // In a real app, this would also call the backend to invalidate the token
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    // In a real app, this would call the backend API
    // await api.post('/auth/forgot-password', { email });
    
    // Mock API call
    return Promise.resolve();
  };

  const resetPassword = async (token: string, password: string) => {
    // In a real app, this would call the backend API
    // await api.post('/auth/reset-password', { token, password });
    
    // Mock API call
    return Promise.resolve();
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
