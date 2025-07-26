import { useState, useEffect } from 'react';

export interface User {
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Simular verificación de sesión existente al cargar la app
  useEffect(() => {
    const checkAuthStatus = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          localStorage.removeItem('user');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    // Simular un pequeño delay para mostrar loading
    setTimeout(checkAuthStatus, 500);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Llamada POST al backend para validar usuario
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login exitoso
        const user: User = {
          email: data.user?.email || email,
          name: data.user?.name || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        };

        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Login fallido
        const errorMessage = data.message || 'Credenciales inválidas. Verifica tu email y contraseña.';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Error de conexión o del servidor
      let errorMessage = 'Error de conexión con el servidor.';
      
      if (error instanceof Error) {
        errorMessage = error.message.includes('fetch') 
          ? 'No se pudo conectar con el servidor. Verifica que esté corriendo en http://localhost:8000'
          : error.message;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
  };
};
