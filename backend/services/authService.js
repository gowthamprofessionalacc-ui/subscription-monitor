// Auth Service - User authentication with Supabase and Google OAuth
const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    
    // =============================================
    // REGISTER WITH EMAIL
    // =============================================
    async registerWithEmail(name, username, email, password, phoneNumber = null) {
        // Check if email exists
        const { data: existingEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        
        if (existingEmail) {
            throw new Error('Email already registered');
        }
        
        // Check if username exists
        const { data: existingUsername } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
        
        if (existingUsername) {
            throw new Error('Username already taken');
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Create user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                username,
                email,
                phone_number: phoneNumber,
                password_hash: passwordHash,
                auth_provider: 'email'
            })
            .select()
            .single();
        
        if (error) throw error;
        
        // Create default user settings
        await supabaseAdmin
            .from('user_settings')
            .insert({
                user_id: user.id,
                monthly_subscription_budget: 0
            });
        
        // Generate JWT
        const token = this.generateToken(user);
        
        return {
            user: this.sanitizeUser(user),
            token
        };
    }
    
    // =============================================
    // LOGIN WITH EMAIL
    // =============================================
    async loginWithEmail(email, password) {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('auth_provider', 'email')
            .single();
        
        if (error || !user) {
            throw new Error('Invalid email or password');
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        
        const token = this.generateToken(user);
        
        return {
            user: this.sanitizeUser(user),
            token
        };
    }
    
    // =============================================
    // GOOGLE AUTH
    // =============================================
    async handleGoogleAuth(googleUser) {
        const { uid, email, displayName, photoURL } = googleUser;
        
        // Check if user exists
        let { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_provider_id', uid)
            .eq('auth_provider', 'google')
            .single();
        
        if (!user) {
            // Check if email exists with different provider
            const { data: existingEmail } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            
            if (existingEmail) {
                // Link accounts
                const { data: updatedUser, error } = await supabaseAdmin
                    .from('users')
                    .update({
                        auth_provider: 'google',
                        auth_provider_id: uid
                    })
                    .eq('id', existingEmail.id)
                    .select()
                    .single();
                
                if (error) throw error;
                user = updatedUser;
            } else {
                // Create new user
                const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
                
                const { data: newUser, error } = await supabaseAdmin
                    .from('users')
                    .insert({
                        name: displayName || 'User',
                        username,
                        email,
                        auth_provider: 'google',
                        auth_provider_id: uid
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                user = newUser;
                
                // Create default user settings
                await supabaseAdmin
                    .from('user_settings')
                    .insert({
                        user_id: user.id,
                        monthly_subscription_budget: 0
                    });
            }
        }
        
        const token = this.generateToken(user);
        
        return {
            user: this.sanitizeUser(user),
            token
        };
    }
    
    // =============================================
    // GET USER PROFILE
    // =============================================
    async getUserProfile(userId) {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select(`
                *,
                user_settings (*)
            `)
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        return this.sanitizeUser(user);
    }
    
    // =============================================
    // UPDATE USER PROFILE
    // =============================================
    async updateUserProfile(userId, updateData) {
        const { name, username, phone_number } = updateData;
        
        // Check username uniqueness if updating
        if (username) {
            const { data: existing } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('username', username)
                .neq('id', userId)
                .single();
            
            if (existing) {
                throw new Error('Username already taken');
            }
        }
        
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update({ name, username, phone_number })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        return this.sanitizeUser(user);
    }
    
    // =============================================
    // UPDATE USER SETTINGS
    // =============================================
    async updateUserSettings(userId, settings) {
        const { monthly_subscription_budget, notification_enabled } = settings;
        
        const { data, error } = await supabaseAdmin
            .from('user_settings')
            .update({ monthly_subscription_budget, notification_enabled })
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) throw error;
        
        return data;
    }
    
    // =============================================
    // HELPER METHODS
    // =============================================
    generateToken(user) {
        return jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET || 'SubTracker2026SecureJWTKey!@#$%SecretToken',
            { expiresIn: '7d' }
        );
    }
    
    sanitizeUser(user) {
        const { password_hash, ...sanitized } = user;
        return sanitized;
    }
    
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AuthService();
