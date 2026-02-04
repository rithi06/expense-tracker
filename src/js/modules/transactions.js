// Transactions Management Module

export const transactions = {
    // Get all transactions
    getAll: () => {
        return storage.get(storage.keys.TRANSACTIONS) || [];
    },

    // Get transaction by ID
    getById: (id) => {
        const allTransactions = transactions.getAll();
        return allTransactions.find(transaction => transaction.id === id);
    },

    // Add new transaction
    add: (transactionData) => {
        const validation = validators.validateTransaction(transactionData);
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const allTransactions = transactions.getAll();
        
        // Create transaction object with all properties
        const newTransaction = {
            id: transactionData.id || helpers.generateId(),
            description: helpers.sanitizeInput(transactionData.description),
            amount: parseFloat(transactionData.amount),
            type: transactionData.type,
            category: transactionData.category,
            date: transactionData.date,
            paymentMethod: transactionData.paymentMethod || 'cash',
            notes: helpers.sanitizeInput(transactionData.notes || ''),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to transactions array
        allTransactions.push(newTransaction);
        
        // Save to storage
        const success = storage.set(storage.keys.TRANSACTIONS, allTransactions);
        
        if (success) {
            // Trigger data changed event
            transactions.triggerDataChanged();
            
            return {
                success: true,
                transaction: newTransaction,
                totalTransactions: allTransactions.length
            };
        } else {
            return {
                success: false,
                error: 'Failed to save transaction'
            };
        }
    },

    // Update existing transaction
    update: (id, updates) => {
        const allTransactions = transactions.getAll();
        const index = allTransactions.findIndex(t => t.id === id);
        
        if (index === -1) {
            return {
                success: false,
                error: 'Transaction not found'
            };
        }

        // Merge updates with existing transaction
        const updatedTransaction = {
            ...allTransactions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Validate updated transaction
        const validation = validators.validateTransaction(updatedTransaction);
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Sanitize inputs
        if (updates.description) {
            updatedTransaction.description = helpers.sanitizeInput(updates.description);
        }
        if (updates.notes) {
            updatedTransaction.notes = helpers.sanitizeInput(updates.notes);
        }

        // Update transaction in array
        allTransactions[index] = updatedTransaction;
        
        // Save to storage
        const success = storage.set(storage.keys.TRANSACTIONS, allTransactions);
        
        if (success) {
            // Trigger data changed event
            transactions.triggerDataChanged();
            
            return {
                success: true,
                transaction: updatedTransaction
            };
        } else {
            return {
                success: false,
                error: 'Failed to update transaction'
            };
        }
    },

    // Delete transaction
    delete: (id) => {
        const allTransactions = transactions.getAll();
        const filteredTransactions = allTransactions.filter(t => t.id !== id);
        
        if (filteredTransactions.length === allTransactions.length) {
            return {
                success: false,
                error: 'Transaction not found'
            };
        }

        // Save to storage
        const success = storage.set(storage.keys.TRANSACTIONS, filteredTransactions);
        
        if (success) {
            // Trigger data changed event
            transactions.triggerDataChanged();
            
            return {
                success: true,
                deletedId: id,
                totalTransactions: filteredTransactions.length
            };
        } else {
            return {
                success: false,
                error: 'Failed to delete transaction'
            };
        }
    },

    // Filter transactions
    filter: (filters = {}) => {
        let filtered = transactions.getAll();

        // Filter by type
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }

        // Filter by category
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(t => filters.categories.includes(t.category));
        }

        // Filter by payment method
        if (filters.paymentMethods && filters.paymentMethods.length > 0) {
            filtered = filtered.filter(t => filters.paymentMethods.includes(t.paymentMethod));
        }

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
        }

        // Filter by amount range
        if (filters.minAmount !== undefined) {
            filtered = filtered.filter(t => t.amount >= filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
            filtered = filtered.filter(t => t.amount <= filters.maxAmount);
        }

        // Filter by search term
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(searchTerm) ||
                (t.notes && t.notes.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    },

    // Get transactions by date range
    getByDateRange: (startDate, endDate) => {
        return transactions.filter({
            startDate: startDate,
            endDate: endDate
        });
    },

    // Get transactions by month
    getByMonth: (month, year) => {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        return transactions.getByDateRange(startDate, endDate);
    },

    // Get recent transactions
    getRecent: (limit = 10) => {
        const allTransactions = transactions.getAll();
        
        return allTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Get statistics
    getStatistics: (filters = {}) => {
        const filteredTransactions = transactions.filter(filters);
        
        const stats = {
            total: 0,
            count: filteredTransactions.length,
            income: 0,
            expense: 0,
            byCategory: {},
            byMonth: {},
            byPaymentMethod: {}
        };

        filteredTransactions.forEach(transaction => {
            // Update totals
            stats.total += transaction.type === 'income' ? transaction.amount : -transaction.amount;
            
            // Update type totals
            if (transaction.type === 'income') {
                stats.income += transaction.amount;
            } else {
                stats.expense += transaction.amount;
            }

            // Update category totals
            if (!stats.byCategory[transaction.category]) {
                stats.byCategory[transaction.category] = {
                    total: 0,
                    count: 0,
                    type: transaction.type
                };
            }
            stats.byCategory[transaction.category].total += transaction.amount;
            stats.byCategory[transaction.category].count++;

            // Update monthly totals
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!stats.byMonth[monthKey]) {
                stats.byMonth[monthKey] = {
                    income: 0,
                    expense: 0,
                    total: 0
                };
            }
            
            if (transaction.type === 'income') {
                stats.byMonth[monthKey].income += transaction.amount;
            } else {
                stats.byMonth[monthKey].expense += transaction.amount;
            }
            stats.byMonth[monthKey].total = stats.byMonth[monthKey].income - stats.byMonth[monthKey].expense;

            // Update payment method totals
            if (!stats.byPaymentMethod[transaction.paymentMethod]) {
                stats.byPaymentMethod[transaction.paymentMethod] = {
                    total: 0,
                    count: 0
                };
            }
            stats.byPaymentMethod[transaction.paymentMethod].total += transaction.amount;
            stats.byPaymentMethod[transaction.paymentMethod].count++;
        });

        // Calculate percentages
        stats.incomePercentage = stats.income > 0 ? (stats.income / (stats.income + stats.expense)) * 100 : 0;
        stats.expensePercentage = stats.expense > 0 ? (stats.expense / (stats.income + stats.expense)) * 100 : 0;

        // Sort categories by total
        stats.topCategories = Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 5)
            .map(([category, data]) => ({
                category,
                ...data
            }));

        // Calculate average transaction amount
        stats.averageTransaction = stats.count > 0 ? (stats.income + stats.expense) / stats.count : 0;

        return stats;
    },

    // Get category totals
    getCategoryTotals: (type = null, filters = {}) => {
        const filteredTransactions = type 
            ? transactions.filter({ ...filters, type })
            : transactions.filter(filters);
        
        const categoryTotals = {};

        filteredTransactions.forEach(transaction => {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }
            categoryTotals[transaction.category] += transaction.amount;
        });

        // Convert to array and sort
        return Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
    },

    // Get monthly trends
    getMonthlyTrends: (months = 12) => {
        const trends = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const monthlyTransactions = transactions.getByMonth(month, year);
            const stats = transactions.getStatistics({ startDate: date, endDate: new Date(year, month, 0) });
            
            trends.push({
                month: month,
                year: year,
                monthName: date.toLocaleString('default', { month: 'short' }),
                income: stats.income,
                expense: stats.expense,
                total: stats.total,
                transactionCount: stats.count
            });
        }

        return trends;
    },

    // Search transactions
    search: (query, filters = {}) => {
        if (!query || query.trim() === '') {
            return transactions.filter(filters);
        }

        const searchTerm = query.toLowerCase().trim();
        const allTransactions = transactions.filter(filters);
        
        return allTransactions.filter(transaction => 
            transaction.description.toLowerCase().includes(searchTerm) ||
            (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm)) ||
            transaction.category.toLowerCase().includes(searchTerm) ||
            transaction.paymentMethod.toLowerCase().includes(searchTerm)
        );
    },

    // Import multiple transactions
    importTransactions: (newTransactions, options = {}) => {
        const { merge = true, overwrite = false } = options;
        let existingTransactions = transactions.getAll();
        let importedCount = 0;
        let skippedCount = 0;
        let errors = [];

        if (overwrite) {
            existingTransactions = [];
        }

        newTransactions.forEach((transaction, index) => {
            try {
                // Generate ID if not present
                if (!transaction.id) {
                    transaction.id = helpers.generateId();
                }

                // Check for duplicates if merging
                if (merge) {
                    const isDuplicate = existingTransactions.some(t => 
                        t.id === transaction.id ||
                        (t.description === transaction.description && 
                         t.amount === transaction.amount && 
                         t.date === transaction.date)
                    );

                    if (isDuplicate) {
                        skippedCount++;
                        return;
                    }
                }

                // Validate transaction
                const validation = validators.validateTransaction(transaction);
                if (!validation.isValid) {
                    errors.push(`Transaction ${index + 1}: ${Object.values(validation.errors).join(', ')}`);
                    return;
                }

                // Add to existing transactions
                existingTransactions.push({
                    ...transaction,
                    createdAt: transaction.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                importedCount++;
            } catch (error) {
                errors.push(`Transaction ${index + 1}: ${error.message}`);
            }
        });

        // Save to storage
        const success = storage.set(storage.keys.TRANSACTIONS, existingTransactions);
        
        if (success) {
            // Trigger data changed event
            transactions.triggerDataChanged();
        }

        return {
            success,
            importedCount,
            skippedCount,
            totalCount: existingTransactions.length,
            errors: errors.length > 0 ? errors : undefined
        };
    },

    // Export transactions
    exportTransactions: (format = 'json', filters = {}) => {
        const filteredTransactions = transactions.filter(filters);
        
        switch (format) {
            case 'json':
                return JSON.stringify(filteredTransactions, null, 2);
                
            case 'csv':
                return storage.convertToCSV(filteredTransactions);
                
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    },

    // Event system for data changes
    _eventListeners: new Map(),

    // Subscribe to data changes
    subscribe: (event, callback) => {
        if (!transactions._eventListeners.has(event)) {
            transactions._eventListeners.set(event, new Set());
        }
        transactions._eventListeners.get(event).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = transactions._eventListeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    },

    // Trigger event
    triggerDataChanged: () => {
        const listeners = transactions._eventListeners.get('dataChanged');
        if (listeners) {
            listeners.forEach(callback => callback());
        }
    }
};