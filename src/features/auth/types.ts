export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export type LoginCredentials = {
  email: string;
  password: string;
};
