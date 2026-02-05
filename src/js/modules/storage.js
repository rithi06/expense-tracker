// Local Storage Management Module

export const storage = {
    // Keys for localStorage
    keys: {
        TRANSACTIONS: 'expense_tracker_transactions',
        CATEGORIES: 'expense_tracker_categories',
        BUDGETS: 'expense_tracker_budgets',
        SETTINGS: 'expense_tracker_settings',
        THEME: 'expense_tracker_theme',
        LAST_BACKUP: 'expense_tracker_last_backup'
    },

    // Initialize storage with default data
    initialize: () => {
        console.log('Initializing storage...');
        
        // Initialize transactions if not exists
        if (!storage.get(storage.keys.TRANSACTIONS)) {
            console.log('Initializing empty transactions array');
            storage.set(storage.keys.TRANSACTIONS, []);
        }

        // Initialize categories if not exists
        const existingCategories = storage.get(storage.keys.CATEGORIES);
        if (!existingCategories || existingCategories.length === 0) {
            console.log('Initializing default categories...');
            const defaultCategories = [
                { id: 'food', name: 'Food & Dining', icon: 'utensils', type: 'expense', color: '#FF6B6B' },
                { id: 'transportation', name: 'Transportation', icon: 'car', type: 'expense', color: '#4ECDC4' },
                { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', type: 'expense', color: '#FFD166' },
                { id: 'entertainment', name: 'Entertainment', icon: 'film', type: 'expense', color: '#06D6A0' },
                { id: 'utilities', name: 'Utilities', icon: 'bolt', type: 'expense', color: '#118AB2' },
                { id: 'health', name: 'Health', icon: 'heartbeat', type: 'expense', color: '#EF476F' },
                { id: 'education', name: 'Education', icon: 'graduation-cap', type: 'expense', color: '#7209B7' },
                { id: 'housing', name: 'Housing', icon: 'home', type: 'expense', color: '#073B4C' },
                { id: 'other', name: 'Other', icon: 'ellipsis-h', type: 'expense', color: '#6C757D' },
                { id: 'salary', name: 'Salary', icon: 'money-bill-wave', type: 'income', color: '#4CC9F0' },
                { id: 'freelance', name: 'Freelance', icon: 'laptop-code', type: 'income', color: '#4361EE' },
                { id: 'investment', name: 'Investment', icon: 'chart-line', type: 'income', color: '#3A0CA3' },
                { id: 'gift', name: 'Gifts Received', icon: 'gift', type: 'income', color: '#F72585' }
            ];
            storage.set(storage.keys.CATEGORIES, defaultCategories);
            console.log('Default categories initialized:', defaultCategories);
        } else {
            console.log('Categories already exist:', existingCategories.length, 'categories found');
        }

        // Initialize budgets if not exists
        if (!storage.get(storage.keys.BUDGETS)) {
            storage.set(storage.keys.BUDGETS, []);
        }

        // Initialize settings if not exists
        if (!storage.get(storage.keys.SETTINGS)) {
            const defaultSettings = {
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                theme: 'auto',
                notifications: {
                    enabled: true,
                    type: 'browser',
                    threshold: 90
                },
                exportFormat: 'json',
                autoBackup: true,
                backupFrequency: 'weekly'
            };
            storage.set(storage.keys.SETTINGS, defaultSettings);
        }

        // Initialize theme if not exists
        if (!storage.get(storage.keys.THEME)) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            storage.set(storage.keys.THEME, prefersDark ? 'dark' : 'light');
        }

        console.log('Storage initialized successfully');
    },

    // Generic getter
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    },

    // Generic setter
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                storage.handleQuotaExceeded();
            }
            
            return false;
        }
    },

    // Remove item
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage key "${key}":`, error);
            return false;
        }
    },

    // Clear all app data
    clearAll: () => {
        try {
            Object.values(storage.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Handle quota exceeded error
    handleQuotaExceeded: () => {
        // Try to clear old backups first
        const backups = storage.get('expense_tracker_backups') || [];
        if (backups.length > 5) {
            // Remove oldest backups
            backups.sort((a, b) => new Date(a.date) - new Date(b.date));
            const toRemove = backups.length - 5;
            backups.splice(0, toRemove);
            storage.set('expense_tracker_backups', backups);
        }

        // Try to clear old transactions
        const transactions = storage.get(storage.keys.TRANSACTIONS) || [];
        if (transactions.length > 1000) {
            // Keep only last 1000 transactions
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            const toKeep = transactions.slice(0, 1000);
            storage.set(storage.keys.TRANSACTIONS, toKeep);
        }

        console.warn('Storage quota exceeded, attempted cleanup');
    },

    // Backup data
    backup: () => {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                transactions: storage.get(storage.keys.TRANSACTIONS),
                categories: storage.get(storage.keys.CATEGORIES),
                budgets: storage.get(storage.keys.BUDGETS),
                settings: storage.get(storage.keys.SETTINGS),
                version: '1.0.0'
            };

            // Get existing backups
            const backups = storage.get('expense_tracker_backups') || [];
            
            // Add new backup
            backups.push({
                date: backupData.timestamp,
                data: backupData
            });

            // Keep only last 10 backups
            if (backups.length > 10) {
                backups.sort((a, b) => new Date(a.date) - new Date(b.date));
                backups.splice(0, backups.length - 10);
            }

            // Save backups
            storage.set('expense_tracker_backups', backups);
            storage.set(storage.keys.LAST_BACKUP, backupData.timestamp);

            return {
                success: true,
                timestamp: backupData.timestamp,
                size: JSON.stringify(backupData).length
            };
        } catch (error) {
            console.error('Error creating backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Restore from backup
    restore: (backupData) => {
        try {
            // Validate backup data
            if (!backupData || !backupData.transactions || !backupData.categories) {
                throw new Error('Invalid backup data');
            }

            // Restore data
            storage.set(storage.keys.TRANSACTIONS, backupData.transactions);
            storage.set(storage.keys.CATEGORIES, backupData.categories);
            
            if (backupData.budgets) {
                storage.set(storage.keys.BUDGETS, backupData.budgets);
            }
            
            if (backupData.settings) {
                storage.set(storage.keys.SETTINGS, backupData.settings);
            }

            console.log('Data restored successfully from backup:', backupData.timestamp);
            return {
                success: true,
                timestamp: backupData.timestamp
            };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Export data to file
    exportToFile: (format = 'json') => {
        try {
            const data = {
                transactions: storage.get(storage.keys.TRANSACTIONS),
                categories: storage.get(storage.keys.CATEGORIES),
                budgets: storage.get(storage.keys.BUDGETS),
                settings: storage.get(storage.keys.SETTINGS),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            let content, filename, type;

            switch (format) {
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    filename = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                    type = 'application/json';
                    break;

                case 'csv':
                    content = storage.convertToCSV(data.transactions);
                    filename = `expense-tracker-transactions-${new Date().toISOString().split('T')[0]}.csv`;
                    type = 'text/csv';
                    break;

                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Create download link
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return {
                success: true,
                filename,
                size: content.length
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Import data from file
    importFromFile: async (file) => {
        try {
            const content = await file.text();
            let data;

            // Try to parse as JSON first
            try {
                data = JSON.parse(content);
            } catch (jsonError) {
                // If not JSON, try CSV
                data = storage.parseCSV(content);
            }

            // Validate imported data
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Invalid data format: transactions array required');
            }

            // Merge with existing data or replace
            const existingTransactions = storage.get(storage.keys.TRANSACTIONS) || [];
            const mergedTransactions = [...existingTransactions, ...data.transactions];

            // Remove duplicates based on ID
            const uniqueTransactions = Array.from(
                new Map(mergedTransactions.map(item => [item.id, item])).values()
            );

            // Save merged data
            storage.set(storage.keys.TRANSACTIONS, uniqueTransactions);

            // Update categories if provided
            if (data.categories && Array.isArray(data.categories)) {
                storage.set(storage.keys.CATEGORIES, data.categories);
            }

            return {
                success: true,
                importedCount: data.transactions.length,
                totalCount: uniqueTransactions.length
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Convert transactions to CSV
    convertToCSV: (transactions) => {
        if (!transactions || transactions.length === 0) {
            return '';
        }

        const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
        const rows = transactions.map(transaction => [
            transaction.date,
            `"${transaction.description.replace(/"/g, '""')}"`,
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction.paymentMethod || '',
            `"${(transaction.notes || '').replace(/"/g, '""')}"`
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    },

    // Parse CSV to transactions
    parseCSV: (csvContent) => {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const transactions = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const transaction = {};
                
                headers.forEach((header, index) => {
                    if (values[index]) {
                        transaction[header.toLowerCase().replace(/\s+/g, '')] = values[index];
                    }
                });

                // Generate ID if not present
                if (!transaction.id) {
                    transaction.id = `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }

                // Convert amount to number
                if (transaction.amount) {
                    transaction.amount = parseFloat(transaction.amount);
                }

                return transaction;
            });

        return { transactions };
    },

    // Get storage statistics
    getStatistics: () => {
        const stats = {};
        
        Object.values(storage.keys).forEach(key => {
            const data = storage.get(key);
            if (data) {
                const size = JSON.stringify(data).length;
                stats[key] = {
                    items: Array.isArray(data) ? data.length : Object.keys(data).length,
                    size: size,
                    sizeFormatted: `${(size / 1024).toFixed(2)} KB`
                };
            }
        });

        // Calculate total
        const totalSize = Object.values(stats).reduce((sum, stat) => sum + stat.size, 0);
        stats.total = {
            size: totalSize,
            sizeFormatted: `${(totalSize / 1024).toFixed(2)} KB`
        };

        return stats;
    },

    // Check if storage is available
    isAvailable: () => {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get available storage space (approximate)
    getAvailableSpace: () => {
        if (!storage.isAvailable()) {
            return { available: 0, total: 0, used: 0 };
        }

        try {
            // Create a large string to test storage
            const testData = 'x'.repeat(1024 * 1024); // 1MB
            let total = 0;
            
            // Try to fill storage
            while (true) {
                try {
                    localStorage.setItem(`test_${total}`, testData);
                    total++;
                } catch (e) {
                    break;
                }
            }
            
            // Clean up test data
            for (let i = 0; i < total; i++) {
                localStorage.removeItem(`test_${i}`);
            }
            
            const used = Object.keys(localStorage).reduce((size, key) => {
                return size + (localStorage.getItem(key)?.length || 0);
            }, 0);
            
            const available = total * 1024 * 1024 - used;
            
            return {
                available,
                total: total * 1024 * 1024,
                used,
                availableFormatted: `${(available / (1024 * 1024)).toFixed(2)} MB`,
                usedFormatted: `${(used / (1024 * 1024)).toFixed(2)} MB`,
                totalFormatted: `${(total).toFixed(2)} MB`
            };
        } catch (error) {
            console.error('Error calculating storage space:', error);
            return { available: 0, total: 0, used: 0 };
        }
    }
};