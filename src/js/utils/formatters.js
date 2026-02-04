// Formatting Functions

export const formatters = {
    // Currency formatting
    formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting
            return `${currency} ${amount.toFixed(2)}`;
        }
    },

    // Date formatting
    formatDate: (dateString, format = 'medium') => {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const options = {
            short: {
                month: 'short',
                day: 'numeric'
            },
            medium: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            long: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            },
            full: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        };

        return date.toLocaleDateString('en-US', options[format] || options.medium);
    },

    // Relative time formatting (e.g., "2 days ago")
    formatRelativeTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    },

    // Number formatting (with thousands separators)
    formatNumber: (number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },

    // Percentage formatting
    formatPercentage: (percentage, decimals = 1) => {
        return `${percentage.toFixed(decimals)}%`;
    },

    // File size formatting
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Duration formatting (e.g., "2h 30m")
    formatDuration: (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${remainingMinutes}m`;
    },

    // Phone number formatting
    formatPhoneNumber: (phoneNumber) => {
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        
        return phoneNumber;
    },

    // Credit card number formatting
    formatCreditCard: (cardNumber) => {
        const cleaned = ('' + cardNumber).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})(\d{4})$/);
        
        if (match) {
            return match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4];
        }
        
        return cardNumber;
    },

    // Social security number formatting
    formatSSN: (ssn) => {
        const cleaned = ('' + ssn).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
        
        if (match) {
            return match[1] + '-' + match[2] + '-' + match[3];
        }
        
        return ssn;
    },

    // Category name formatting
    formatCategoryName: (category) => {
        if (!category) return 'Uncategorized';
        
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // Transaction type formatting
    formatTransactionType: (type) => {
        const types = {
            'income': 'Income',
            'expense': 'Expense',
            'transfer': 'Transfer'
        };
        
        return types[type] || type;
    },

    // Payment method formatting
    formatPaymentMethod: (method) => {
        const methods = {
            'cash': 'Cash',
            'debit': 'Debit Card',
            'credit': 'Credit Card',
            'bank': 'Bank Transfer',
            'digital': 'Digital Wallet'
        };
        
        return methods[method] || method;
    },

    // Budget status formatting
    formatBudgetStatus: (spent, budget) => {
        const percentage = (spent / budget) * 100;
        
        if (percentage < 80) {
            return { status: 'Under Budget', color: 'success' };
        } else if (percentage >= 80 && percentage < 100) {
            return { status: 'Near Limit', color: 'warning' };
        } else {
            return { status: 'Over Budget', color: 'danger' };
        }
    },

    // Trend arrow formatting
    formatTrendArrow: (change) => {
        if (change > 0) {
            return { arrow: '↑', color: 'success', label: 'Increasing' };
        } else if (change < 0) {
            return { arrow: '↓', color: 'danger', label: 'Decreasing' };
        } else {
            return { arrow: '→', color: 'info', label: 'Stable' };
        }
    },

    // Abbreviate large numbers
    abbreviateNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    },

    // Format array as comma-separated list
    formatList: (array, maxItems = 3) => {
        if (!array || array.length === 0) return '';
        
        if (array.length <= maxItems) {
            return array.join(', ');
        }
        
        return array.slice(0, maxItems).join(', ') + `, +${array.length - maxItems} more`;
    },

    // Format JSON for display
    formatJSON: (json, indent = 2) => {
        try {
            return JSON.stringify(json, null, indent);
        } catch (error) {
            return 'Invalid JSON';
        }
    },

    // Format time in 12-hour format
    formatTime: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    // Format date range
    formatDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start.toDateString() === end.toDateString()) {
            return formatters.formatDate(startDate);
        }
        
        return `${formatters.formatDate(startDate, 'short')} - ${formatters.formatDate(endDate, 'short')}`;
    },

    // Format progress percentage with color
    formatProgress: (current, total) => {
        const percentage = (current / total) * 100;
        
        let color;
        if (percentage < 33) color = 'success';
        else if (percentage < 66) color = 'warning';
        else color = 'danger';
        
        return {
            percentage: percentage.toFixed(1),
            color,
            formatted: `${current.toFixed(2)} / ${total.toFixed(2)}`
        };
    }
};