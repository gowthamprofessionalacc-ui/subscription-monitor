-- =============================================
-- SUBSCRIPTION LEAKAGE DETECTOR - DATABASE SCHEMA
-- PostgreSQL (Supabase)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'email', -- 'email' or 'google'
    auth_provider_id VARCHAR(255), -- Google UID if using Google auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. USER SETTINGS TABLE
-- =============================================
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    monthly_subscription_budget DECIMAL(10, 2) DEFAULT 0,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. OTT CATALOG TABLE (Predefined OTTs)
-- =============================================
CREATE TABLE ott_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(100), -- Simple Icons name
    primary_color VARCHAR(7) NOT NULL, -- Hex color
    secondary_color VARCHAR(7) NOT NULL, -- Hex color
    category VARCHAR(50) DEFAULT 'streaming', -- streaming, music, gaming, etc.
    default_amount DECIMAL(10, 2),
    default_billing_cycle VARCHAR(20) DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ott_catalog_id INTEGER REFERENCES ott_catalog(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'quarterly'
    auto_renew BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    renewal_date DATE,
    is_shared BOOLEAN DEFAULT FALSE,
    shared_members_count INTEGER DEFAULT 1,
    is_critical BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    logo_url VARCHAR(500),
    theme_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. USAGE LOGS TABLE
-- =============================================
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    used VARCHAR(20) NOT NULL, -- 'yes', 'no', 'ignored'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. DECISIONS TABLE
-- =============================================
CREATE TABLE decisions (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'cancel', 'keep', 'intentional_keep', 'downgrade'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. SUBSCRIPTION STATE TABLE
-- =============================================
CREATE TABLE subscription_state (
    subscription_id INTEGER PRIMARY KEY REFERENCES subscriptions(id) ON DELETE CASCADE,
    usage_confidence INTEGER DEFAULT 50, -- 0-100
    last_used_date DATE,
    days_unused INTEGER DEFAULT 0,
    monthly_cost DECIMAL(10, 2),
    risk_score DECIMAL(5, 2) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH'
    waste_confidence DECIMAL(5, 2) DEFAULT 0,
    months_unused INTEGER DEFAULT 0,
    wasted_amount DECIMAL(10, 2) DEFAULT 0,
    yearly_bleed DECIMAL(10, 2) DEFAULT 0,
    intentional_keep BOOLEAN DEFAULT FALSE,
    ignored_count INTEGER DEFAULT 0,
    alert_interval INTEGER DEFAULT 7, -- days
    last_alert_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'usage_check', 'renewal_alert', 'budget_warning'
    is_read BOOLEAN DEFAULT FALSE,
    response VARCHAR(20), -- 'yes', 'no', 'ignored', null
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. PUSH SUBSCRIPTIONS TABLE (For Web Push)
-- =============================================
CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERT PREDEFINED OTT CATALOG
-- =============================================
INSERT INTO ott_catalog (name, icon_name, primary_color, secondary_color, category, default_amount, default_billing_cycle) VALUES
('Netflix', 'netflix', '#E50914', '#141414', 'streaming', 199, 'monthly'),
('Amazon Prime Video', 'amazonprime', '#00A8E1', '#232F3E', 'streaming', 1499, 'yearly'),
('Disney+ Hotstar', 'hotstar', '#0063E5', '#1A1D29', 'streaming', 299, 'monthly'),
('Spotify', 'spotify', '#1DB954', '#191414', 'music', 119, 'monthly'),
('YouTube Premium', 'youtube', '#FF0000', '#282828', 'streaming', 129, 'monthly'),
('Apple TV+', 'appletv', '#000000', '#FFFFFF', 'streaming', 99, 'monthly'),
('HBO Max', 'hbo', '#B000E5', '#000000', 'streaming', 299, 'monthly'),
('Hulu', 'hulu', '#1CE783', '#040405', 'streaming', 299, 'monthly'),
('Zee5', NULL, '#8230C6', '#000000', 'streaming', 99, 'monthly'),
('SonyLIV', NULL, '#111111', '#E8E8E8', 'streaming', 299, 'monthly'),
('JioCinema', NULL, '#E50064', '#1A1A2E', 'streaming', 89, 'monthly'),
('Crunchyroll', 'crunchyroll', '#F47521', '#000000', 'streaming', 79, 'monthly'),
('Voot', NULL, '#FF5500', '#1A1A1A', 'streaming', 99, 'monthly'),
('MX Player', NULL, '#0D47A1', '#000000', 'streaming', 0, 'monthly'),
('ALTBalaji', NULL, '#FF0000', '#1A1A1A', 'streaming', 100, 'monthly'),
('Apple Music', 'applemusic', '#FA233B', '#000000', 'music', 99, 'monthly'),
('Amazon Music', 'amazonmusic', '#00A8E1', '#232F3E', 'music', 89, 'monthly'),
('Gaana', NULL, '#E72C30', '#1A1A1A', 'music', 99, 'monthly'),
('JioSaavn', NULL, '#2BC5B4', '#121212', 'music', 99, 'monthly'),
('Xbox Game Pass', 'xbox', '#107C10', '#000000', 'gaming', 499, 'monthly'),
('PlayStation Plus', 'playstation', '#003791', '#000000', 'gaming', 499, 'monthly'),
('Custom', NULL, '#6366F1', '#1F2937', 'other', 0, 'monthly');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_usage_logs_subscription_id ON usage_logs(subscription_id);
CREATE INDEX idx_usage_logs_log_date ON usage_logs(log_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_subscription_state_risk_level ON subscription_state(risk_level);

-- =============================================
-- FUNCTIONS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_state_updated_at BEFORE UPDATE ON subscription_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid()::text = auth_provider_id);
CREATE POLICY user_settings_policy ON user_settings FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_provider_id = auth.uid()::text));
CREATE POLICY subscriptions_policy ON subscriptions FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_provider_id = auth.uid()::text));
CREATE POLICY notifications_policy ON notifications FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_provider_id = auth.uid()::text));
CREATE POLICY push_subscriptions_policy ON push_subscriptions FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_provider_id = auth.uid()::text));
