// Validation Functions

export const validators = {
    // Transaction validation
    validateTransaction: (transaction) => {
        const errors = {};

        // Description validation
        if (!transaction.description || transaction.description.trim() === '') {
            errors.description = 'Description is required';
        } else if (transaction.description.length < 2) {
            errors.description = 'Description must be at least 2 characters';
        } else if (transaction.description.length > 100) {
            errors.description = 'Description cannot exceed 100 characters';
        }

        // Amount validation
        if (!transaction.amount || transaction.amount === '') {
            errors.amount = 'Amount is required';
        } else {
            const amount = parseFloat(transaction.amount);
            if (isNaN(amount)) {
                errors.amount = 'Amount must be a valid number';
            } else if (amount <= 0) {
                errors.amount = 'Amount must be greater than 0';
            } else if (amount > 1000000) {
                errors.amount = 'Amount cannot exceed 1,000,000';
            }
        }

        // Type validation
        if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
            errors.type = 'Invalid transaction type';
        }

        // Category validation
        if (!transaction.category || transaction.category.trim() === '') {
            errors.category = 'Category is required';
        }

        // Date validation
        if (!transaction.date || transaction.date.trim() === '') {
            errors.date = 'Date is required';
        } else {
            const date = new Date(transaction.date);
            const today = new Date();
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(today.getFullYear() - 10);

            if (isNaN(date.getTime())) {
                errors.date = 'Invalid date format';
            } else if (date > today) {
                errors.date = 'Date cannot be in the future';
            } else if (date < tenYearsAgo) {
                errors.date = 'Date cannot be more than 10 years ago';
            }
        }

        // Payment method validation
        if (transaction.paymentMethod) {
            const validMethods = ['cash', 'debit', 'credit', 'bank', 'digital'];
            if (!validMethods.includes(transaction.paymentMethod)) {
                errors.paymentMethod = 'Invalid payment method';
            }
        }

        // Notes validation (optional)
        if (transaction.notes && transaction.notes.length > 500) {
            errors.notes = 'Notes cannot exceed 500 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Budget validation
    validateBudget: (budget) => {
        const errors = {};

        if (!budget.amount || budget.amount === '') {
            errors.amount = 'Budget amount is required';
        } else {
            const amount = parseFloat(budget.amount);
            if (isNaN(amount)) {
                errors.amount = 'Amount must be a valid number';
            } else if (amount < 0) {
                errors.amount = 'Budget cannot be negative';
            } else if (amount > 1000000) {
                errors.amount = 'Budget cannot exceed 1,000,000';
            }
        }

        if (!budget.category || budget.category.trim() === '') {
            errors.category = 'Category is required';
        }

        if (!budget.month || budget.month < 1 || budget.month > 12) {
            errors.month = 'Invalid month';
        }

        if (!budget.year || budget.year < 2000 || budget.year > 2100) {
            errors.year = 'Invalid year';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Import data validation
    validateImportData: (data) => {
        const errors = [];

        try {
            const parsed = JSON.parse(data);

            // Check if it's an array
            if (!Array.isArray(parsed)) {
                errors.push('Data must be an array of transactions');
                return { isValid: false, errors };
            }

            // Validate each transaction
            parsed.forEach((transaction, index) => {
                const validation = validators.validateTransaction(transaction);
                if (!validation.isValid) {
                    errors.push(`Transaction ${index + 1}: ${Object.values(validation.errors).join(', ')}`);
                }
            });

            // Check for required fields in each transaction
            const requiredFields = ['id', 'description', 'amount', 'type', 'category', 'date'];
            parsed.forEach((transaction, index) => {
                const missingFields = requiredFields.filter(field => !(field in transaction));
                if (missingFields.length > 0) {
                    errors.push(`Transaction ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
                }
            });

        } catch (error) {
            errors.push('Invalid JSON format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Filter validation
    validateFilter: (filter) => {
        const errors = {};

        // Date range validation
        if (filter.startDate && filter.endDate) {
            const start = new Date(filter.startDate);
            const end = new Date(filter.endDate);

            if (start > end) {
                errors.dateRange = 'Start date cannot be after end date';
            }

            const maxRange = new Date();
            maxRange.setFullYear(maxRange.getFullYear() - 10);

            if (start < maxRange) {
                errors.dateRange = 'Date range cannot exceed 10 years';
            }
        }

        // Amount range validation
        if (filter.minAmount && filter.maxAmount) {
            const min = parseFloat(filter.minAmount);
            const max = parseFloat(filter.maxAmount);

            if (isNaN(min) || isNaN(max)) {
                errors.amountRange = 'Amounts must be valid numbers';
            } else if (min < 0 || max < 0) {
                errors.amountRange = 'Amounts cannot be negative';
            } else if (min > max) {
                errors.amountRange = 'Minimum amount cannot exceed maximum amount';
            }
        }

        // Category validation
        if (filter.categories && !Array.isArray(filter.categories)) {
            errors.categories = 'Categories must be an array';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Settings validation
    validateSettings: (settings) => {
        const errors = {};

        // Currency validation
        if (settings.currency) {
            const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
            if (!validCurrencies.includes(settings.currency)) {
                errors.currency = 'Invalid currency code';
            }
        }

        // Date format validation
        if (settings.dateFormat) {
            const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
            if (!validFormats.includes(settings.dateFormat)) {
                errors.dateFormat = 'Invalid date format';
            }
        }

        // Theme validation
        if (settings.theme) {
            const validThemes = ['light', 'dark', 'auto'];
            if (!validThemes.includes(settings.theme)) {
                errors.theme = 'Invalid theme';
            }
        }

        // Notification settings validation
        if (settings.notifications) {
            const notificationTypes = ['email', 'browser', 'both'];
            if (!notificationTypes.includes(settings.notifications.type)) {
                errors.notifications = 'Invalid notification type';
            }

            if (settings.notifications.threshold < 0 || settings.notifications.threshold > 100) {
                errors.notifications = 'Threshold must be between 0 and 100';
            }
        }

        // Export format validation
        if (settings.exportFormat) {
            const validFormats = ['json', 'csv', 'pdf'];
            if (!validFormats.includes(settings.exportFormat)) {
                errors.exportFormat = 'Invalid export format';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // User input sanitization
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;

        // Remove potentially dangerous characters
        let sanitized = input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();

        // Limit length
        if (sanitized.length > 1000) {
            sanitized = sanitized.substring(0, 1000);
        }

        return sanitized;
    },

    // Email validation
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Password validation
    validatePassword: (password) => {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // URL validation
    validateURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Phone number validation (basic)
    validatePhoneNumber: (phone) => {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
};