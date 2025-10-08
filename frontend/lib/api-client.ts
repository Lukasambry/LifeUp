/**
 * API Client
 * Handles communication with backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
