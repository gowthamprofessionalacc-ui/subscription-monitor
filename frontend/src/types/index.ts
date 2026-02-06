// TypeScript Types for the application

export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  auth_provider: 'email' | 'google';
  created_at: string;
  updated_at: string;
  user_settings?: UserSettings;
}

export interface UserSettings {
  id: number;
  user_id: number;
  monthly_subscription_budget: number;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OttCatalog {
  id: number;
  name: string;
  icon_name: string | null;
  primary_color: string;
  secondary_color: string;
  category: string;
  default_amount: number;
  default_billing_cycle: string;
  created_at: string;
  theme?: OttTheme;
}

export interface OttTheme {
  name: string;
  iconName: string | null;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  textColor: string;
  cardBackground: string;
  accentColor: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  ott_catalog_id: number | null;
  name: string;
  category: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly' | 'quarterly';
  auto_renew: boolean;
  start_date: string;
  renewal_date: string | null;
  is_shared: boolean;
  shared_members_count: number;
  is_critical: boolean;
  is_seasonal: boolean;
  logo_url: string | null;
  theme_color: string | null;
  created_at: string;
  updated_at: string;
  ott_catalog?: OttCatalog;
  subscription_state?: SubscriptionState;
  theme?: OttTheme;
}

export interface SubscriptionState {
  subscription_id: number;
  usage_confidence: number;
  last_used_date: string | null;
  days_unused: number;
  monthly_cost: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  waste_confidence: number;
  months_unused: number;
  wasted_amount: number;
  yearly_bleed: number;
  intentional_keep: boolean;
  ignored_count: number;
  alert_interval: number;
  last_alert_date: string | null;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  subscription_id: number | null;
  title: string;
  message: string;
  notification_type: 'usage_check' | 'renewal_alert' | 'budget_warning';
  is_read: boolean;
  response: 'yes' | 'no' | 'ignored' | null;
  responded_at: string | null;
  created_at: string;
  subscriptions?: {
    id: number;
    name: string;
    ott_catalog_id: number;
    ott_catalog: OttCatalog;
  };
}

export interface DashboardSummary {
  totalSubscriptions: number;
  totalMonthlyCost: number;
  riskBreakdown: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  totalWasted: number;
  yearlyProjectedBleed: number;
  budgetPressure: BudgetPressure;
}

export interface BudgetPressure {
  hasPressure: boolean;
  budget?: number;
  totalMonthlyCost?: number;
  overage?: number;
  topOffenders?: {
    id: number;
    name: string;
    wasteConfidence: number;
    monthlyCost: number;
  }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message: string;
}
