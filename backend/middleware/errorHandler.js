// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Supabase errors
    if (err.code && err.code.startsWith('PGRST')) {
        return res.status(400).json({
            error: 'Database error',
            message: err.message
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Please login again'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            message: 'Please login again'
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            message: err.message
        });
    }
    
    // Custom validation/business logic errors (from our services)
    const validationMessages = [
        'Email already registered',
        'Username already taken',
        'Phone number already registered',
        'Invalid credentials',
        'User not found',
        'Invalid password',
        'Renewal date must be',
        'You already have a subscription',
        'Subscription not found',
        'Google authentication'
    ];
    
    const isValidationError = validationMessages.some(msg => 
        err.message && err.message.includes(msg)
    );
    
    if (isValidationError) {
        return res.status(400).json({
            error: 'Validation error',
            message: err.message
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        error: 'Server error',
        message: err.message || 'Something went wrong'
    });
};

module.exports = errorHandler;
