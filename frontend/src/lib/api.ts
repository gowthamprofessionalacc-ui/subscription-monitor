// API Client for backend communication
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;
    
    const config: RequestInit = {
      method,
      headers: this.getHeaders(token),
    };
    
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'API request failed');
    }
    
    return response.json();
  }

  // Auth endpoints
  async register(name: string, username: string, email: string, password: string, phone_number?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, username, email, password, phone_number },
    });
  }

  async login(identifier: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
  }

  async googleAuth(uid: string, email: string, displayName: string, photoURL?: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: { uid, email, displayName, photoURL },
    });
  }

  async getProfile(token: string) {
    return this.request('/auth/profile', { token });
  }

  async updateProfile(token: string, data: { name?: string; username?: string; phone_number?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async updateSettings(token: string, data: { monthly_subscription_budget?: number; notification_enabled?: boolean }) {
    return this.request('/auth/settings', {
      method: 'PUT',
      body: data,
      token,
    });
  }

  // Subscription endpoints
  async getOttCatalog(token: string) {
    return this.request('/subscriptions/catalog', { token });
  }

  async getSubscriptions(token: string) {
    return this.request('/subscriptions', { token });
  }

  async getSubscription(token: string, id: number) {
    return this.request(`/subscriptions/${id}`, { token });
  }

  async getDashboard(token: string) {
    return this.request('/subscriptions/dashboard', { token });
  }

  async createSubscription(token: string, data: {
    ott_catalog_id?: number;
    name: string;
    category?: string;
    amount: number;
    billing_cycle?: string;
    auto_renew?: boolean;
    start_date?: string;
    renewal_date?: string;
    is_shared?: boolean;
    shared_members_count?: number;
    is_critical?: boolean;
    is_seasonal?: boolean;
  }) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateSubscription(token: string, id: number, data: Partial<{
    name: string;
    amount: number;
    billing_cycle: string;
    auto_renew: boolean;
    renewal_date: string;
    is_shared: boolean;
    shared_members_count: number;
    is_critical: boolean;
    is_seasonal: boolean;
  }>) {
    return this.request(`/subscriptions/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async deleteSubscription(token: string, id: number) {
    return this.request(`/subscriptions/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async setIntentionalKeep(token: string, id: number, intentional_keep: boolean) {
    return this.request(`/subscriptions/${id}/intentional-keep`, {
      method: 'POST',
      body: { intentional_keep },
      token,
    });
  }

  // Notification endpoints
  async getNotifications(token: string, limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/notifications${query}`, { token });
  }

  async getUnreadCount(token: string) {
    return this.request('/notifications/unread-count', { token });
  }

  async respondToNotification(token: string, id: number, response: 'yes' | 'no') {
    return this.request(`/notifications/${id}/respond`, {
      method: 'POST',
      body: { response },
      token,
    });
  }

  async markAsRead(token: string, id: number) {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST',
      token,
    });
  }

  async savePushSubscription(token: string, subscription: PushSubscription) {
    const json = subscription.toJSON();
    return this.request('/notifications/push-subscription', {
      method: 'POST',
      body: {
        endpoint: json.endpoint,
        keys: json.keys,
      },
      token,
    });
  }
}

export const api = new ApiClient();
