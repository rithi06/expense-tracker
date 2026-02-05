// Main Application Entry Point

// Import modules
import { helpers } from './utils/helpers.js';
import { validators } from './utils/validators.js';
import { formatters } from './utils/formatters.js';
import { storage } from './modules/storage.js';
import { transactions } from './modules/transactions.js';
import { calculations } from './modules/calculations.js';
import { charts } from './modules/charts.js';
import { ui } from './modules/ui.js';

class ExpenseTrackerApp {
    constructor() {
        this.appName = 'Expense Tracker';
        this.version = '1.0.0';
        this.isInitialized = false;
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.start = this.start.bind(this);
    }

    // Initialize the application
    initialize() {
        try {
            console.log(`=== Initializing ${this.appName} v${this.version} ===`);

            // Check for browser compatibility
            if (!this.checkBrowserCompatibility()) {
                this.showCompatibilityWarning();
                return;
            }

            // Initialize storage FIRST
            console.log('1. Initializing storage...');
            storage.initialize();
            
            // Log categories after initialization
            const categories = storage.get(storage.keys.CATEGORIES);
            console.log('2. Categories loaded:', categories ? categories.length : 0, 'categories');
            
            // Check if categories are available
            if (!categories || categories.length === 0) {
                console.error('ERROR: No categories found after storage initialization!');
                this.showError('Failed to load categories. Please refresh the page.');
                return;
            }

            // Initialize UI
            console.log('3. Initializing UI...');
            ui.initialize();
            
            // Initialize charts
            console.log('4. Initializing charts...');
            if (typeof Chart !== 'undefined') {
                charts.initialize();
            } else {
                console.warn('Chart.js not loaded, charts will be disabled');
            }

            // Load initial data
            console.log('5. Loading initial data...');
            this.loadInitialData();

            // Set up auto-save
            console.log('6. Setting up auto-save...');
            this.setupAutoSave();

            // Mark as initialized
            this.isInitialized = true;

            // Show welcome message
            this.showWelcomeMessage();

            console.log(`=== ${this.appName} initialized successfully! ===`);

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page. Error: ' + error.message);
        }
    }

    // Check browser compatibility
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'JSON',
            'querySelector',
            'addEventListener'
        ];

        for (const feature of requiredFeatures) {
            if (!(feature in window)) {
                console.error(`Browser doesn't support: ${feature}`);
                return false;
            }
        }

        return true;
    }

    // Show compatibility warning
    showCompatibilityWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            text-align: center;
            z-index: 9999;
            border-bottom: 2px solid #f5c6cb;
        `;
        warning.innerHTML = `
            <strong>Browser Compatibility Issue:</strong> 
            Your browser doesn't support all required features. 
            Please update your browser or use a modern browser like Chrome, Firefox, or Edge.
        `;
        document.body.prepend(warning);
    }

    // Load initial data
    loadInitialData() {
        try {
            // Check if first run
            const firstRun = !storage.get('expense_tracker_initialized');
            
            if (firstRun) {
                console.log('First run detected, loading sample data...');
                this.loadSampleData();
                storage.set('expense_tracker_initialized', true);
            }

            // Refresh UI with loaded data
            console.log('Initial data loaded successfully');

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Load sample data
    loadSampleData() {
        const sampleTransactions = [
            {
                id: helpers.generateId(),
                description: 'Monthly Salary',
                amount: 3500.00,
                type: 'income',
                category: 'salary',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'bank',
                notes: 'Monthly salary deposit',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: helpers.generateId(),
                description: 'Grocery Shopping',
                amount: 125.75,
                type: 'expense',
                category: 'food',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'debit',
                notes: 'Weekly groceries',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: helpers.generateId(),
                description: 'Electricity Bill',
                amount: 85.50,
                type: 'expense',
                category: 'utilities',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                paymentMethod: 'bank',
                notes: 'Monthly electricity bill',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: helpers.generateId(),
                description: 'Gas Station',
                amount: 45.25,
                type: 'expense',
                category: 'transportation',
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                paymentMethod: 'credit',
                notes: 'Car fuel',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: helpers.generateId(),
                description: 'Freelance Work',
                amount: 500.00,
                type: 'income',
                category: 'freelance',
                date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                paymentMethod: 'digital',
                notes: 'Website development project',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        // Import sample transactions
        const result = transactions.importTransactions(sampleTransactions, { merge: false });
        
        if (result.success) {
            console.log(`Loaded ${result.importedCount} sample transactions`);
        } else {
            console.warn('Failed to load sample transactions:', result.errors);
        }
    }

    // Set up auto-save
    setupAutoSave() {
        // Auto-save when leaving the page
        window.addEventListener('beforeunload', () => {
            storage.backup();
        });

        // Periodic auto-save (every 5 minutes)
        setInterval(() => {
            const lastBackup = storage.get(storage.keys.LAST_BACKUP);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            if (!lastBackup || lastBackup < fiveMinutesAgo) {
                storage.backup();
            }
        }, 5 * 60 * 1000);
    }

    // Show welcome message
    showWelcomeMessage() {
        const isFirstRun = !storage.get('expense_tracker_welcome_shown');
        
        if (isFirstRun) {
            setTimeout(() => {
                ui.showToast({
                    type: 'info',
                    title: 'Welcome to Expense Tracker!',
                    message: 'Start by adding your first transaction above.',
                    duration: 8000
                });
                
                storage.set('expense_tracker_welcome_shown', true);
            }, 1000);
        }
    }

    // Show error message
    showError(message) {
        const toastOptions = {
            type: 'error',
            title: 'Error',
            message: message,
            duration: 10000
        };
        
        // Check if UI is initialized before showing toast
        if (ui && ui.showToast) {
            ui.showToast(toastOptions);
        } else {
            // Fallback alert if UI not ready
            alert(`Error: ${message}`);
        }
    }

    // Get app statistics
    getStatistics() {
        const stats = {
            app: {
                name: this.appName,
                version: this.version,
                initialized: this.isInitialized,
                firstRun: !storage.get('expense_tracker_initialized')
            },
            data: storage.getStatistics(),
            transactions: {
                total: transactions.getAll().length,
                income: calculations.calculateTotalIncome(),
                expense: calculations.calculateTotalExpenses(),
                balance: calculations.calculateBalance()
            },
            storage: storage.getAvailableSpace()
        };

        return stats;
    }

    // Export app data
    exportAppData() {
        const data = {
            app: {
                name: this.appName,
                version: this.version,
                exportDate: new Date().toISOString()
            },
            statistics: this.getStatistics(),
            transactions: transactions.getAll(),
            categories: storage.get(storage.keys.CATEGORIES),
            budgets: storage.get(storage.keys.BUDGETS),
            settings: storage.get(storage.keys.SETTINGS)
        };

        const filename = `expense-tracker-full-export-${new Date().toISOString().split('T')[0]}.json`;
        const content = JSON.stringify(data, null, 2);
        
        helpers.downloadFile(filename, content, 'application/json');
        
        return {
            success: true,
            filename,
            size: content.length
        };
    }

    // Reset app to defaults
    resetApp() {
        const modalOptions = {
            title: 'Reset Application',
            message: 'This will delete all your data and reset the application to its default state. This action cannot be undone.',
            confirmText: 'Reset All Data',
            confirmCallback: () => {
                // Clear all data
                storage.clearAll();
                
                // Clear local variables
                this.isInitialized = false;
                
                // Show success message
                ui.showToast({
                    type: 'success',
                    title: 'Application Reset',
                    message: 'Application has been reset to defaults'
                });
                
                // Reload page after a delay
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        };
        
        if (ui && ui.showModal) {
            ui.showModal(modalOptions);
        } else {
            if (confirm(modalOptions.message)) {
                modalOptions.confirmCallback();
            }
        }
    }

    // Handle offline/online status
    setupConnectivityHandler() {
        window.addEventListener('online', () => {
            if (ui && ui.showToast) {
                ui.showToast({
                    type: 'success',
                    title: 'Back Online',
                    message: 'Your connection has been restored.',
                    duration: 3000
                });
            }
        });

        window.addEventListener('offline', () => {
            if (ui && ui.showToast) {
                ui.showToast({
                    type: 'warning',
                    title: 'You are offline',
                    message: 'Changes will be saved locally and synced when you reconnect.',
                    duration: 5000
                });
            }
        });
    }

    // Start the application
    start() {
        console.log('Starting application...');
        
        // Initialize the app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initialize);
        } else {
            // DOM already loaded, initialize immediately
            setTimeout(this.initialize, 100);
        }

        // Setup connectivity handler
        this.setupConnectivityHandler();

        // Make app instance globally available (for debugging)
        window.expenseTrackerApp = this;
    }
}

// Create and start the application
const app = new ExpenseTrackerApp();

// Export the app for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
}

// Start the app when the script loads
app.start();