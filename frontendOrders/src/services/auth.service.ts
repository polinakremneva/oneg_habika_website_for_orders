import axios from "axios";

interface LoginResponse {
  token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NODE_ENV === "production" ? "/api" : "//localhost:3000/api";
  }

  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await axios.post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        credentials
      );
      const token = response.data.token;
      localStorage.setItem("jwt-taskify", JSON.stringify(token));
      return token;
    } catch (error) {
      throw new Error("Login failed");
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await axios.post(`${this.baseUrl}/auth/logout`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Failed to logout on the server:", error);
    } finally {
      localStorage.removeItem("jwt-taskify");
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem("jwt-taskify");
    return token ? token.slice(1, -1) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
