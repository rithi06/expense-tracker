// UI Management Module

export const ui = {
    // DOM elements cache
    elements: {},
    
    // UI state
    state: {
        currentTheme: 'light',
        currentPage: 1,
        itemsPerPage: 10,
        sortBy: 'date',
        sortOrder: 'desc',
        currentFilter: 'all'
    },

    // Initialize UI
    initialize: () => {
        console.log('UI: Initializing...');
        ui.cacheElements();
        ui.initializeTheme();
        ui.initializeDatePicker();
        ui.setupEventListeners();
        ui.setupFormValidation();
        
        // CRITICAL: Initialize category dropdown
        ui.initializeCategoryDropdown();
        
        console.log('UI: Initialization complete');
    },

    // Cache DOM elements
    cacheElements: () => {
        console.log('UI: Caching DOM elements...');
        
        // Get all required elements
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) console.warn(`Element #${id} not found`);
            return el;
        };

        ui.elements = {
            // Theme toggle
            themeToggle: document.getElementById('theme-toggle'),
            themeIcon: document.querySelector('#theme-toggle i'),
            
            // Form elements - CRITICAL FOR CATEGORIES
            transactionForm: getElement('transaction-form'),
            descriptionInput: getElement('description'),
            amountInput: getElement('amount'),
            typeInput: getElement('type'),
            typeButtons: document.querySelectorAll('.type-btn'),
            categorySelect: getElement('category'), // THIS IS IMPORTANT
            dateInput: getElement('date'),
            paymentMethodSelect: getElement('payment-method'),
            clearFormButton: getElement('clear-form'),
            
            // Filter elements
            transactionFilter: getElement('transaction-filter'),
            chartPeriod: getElement('chart-period'),
            
            // Table elements
            transactionsList: getElement('transactions-list'),
            transactionsTable: getElement('transactions-table'),
            emptyTransactions: getElement('empty-transactions'),
            
            // Summary elements
            currentBalance: getElement('current-balance'),
            totalIncome: getElement('total-income'),
            totalExpenses: getElement('total-expenses'),
            
            // Modal elements
            confirmationModal: getElement('confirmation-modal'),
            modalTitle: getElement('modal-title'),
            modalMessage: getElement('modal-message'),
            modalClose: getElement('modal-close'),
            modalCancel: getElement('modal-cancel'),
            modalConfirm: getElement('modal-confirm'),
            
            // Footer elements
            resetDataButton: getElement('reset-data'),
            backupDataButton: getElement('backup-data'),
            privacyInfoButton: getElement('privacy-info')
        };
        
        console.log('UI: Elements cached successfully');
        console.log('Category select element:', ui.elements.categorySelect);
    },

    // Initialize theme
    initializeTheme: () => {
        const savedTheme = storage.get(storage.keys.THEME) || 'light';
        ui.state.currentTheme = savedTheme;
        
        document.documentElement.setAttribute('data-theme', ui.state.currentTheme);
        
        if (ui.elements.themeIcon) {
            ui.elements.themeIcon.className = ui.state.currentTheme === 'dark' 
                ? 'fas fa-sun' 
                : 'fas fa-moon';
        }
    },

    // Initialize date picker
    initializeDatePicker: () => {
        if (ui.elements.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            ui.elements.dateInput.value = today;
            ui.elements.dateInput.max = today;
        }
    },

    // INITIALIZE CATEGORY DROPDOWN - CRITICAL FIX
    initializeCategoryDropdown: () => {
        console.log('UI: Initializing category dropdown...');
        
        // Get categories from storage
        const categories = storage.get(storage.keys.CATEGORIES);
        console.log('UI: Categories from storage:', categories);
        
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            console.error('UI: No categories found in storage!');
            
            // Try to initialize storage again
            if (storage && storage.initialize) {
                console.log('UI: Attempting to reinitialize storage...');
                storage.initialize();
                const newCategories = storage.get(storage.keys.CATEGORIES);
                console.log('UI: Categories after reinit:', newCategories);
                
                if (newCategories && newCategories.length > 0) {
                    ui.populateCategoryDropdown('expense', newCategories);
                }
            }
            return;
        }
        
        // Initial populate with expense categories (default)
        ui.populateCategoryDropdown('expense', categories);
    },

    // Populate category dropdown
    populateCategoryDropdown: (type, categories) => {
        console.log(`UI: Populating dropdown for ${type} with`, categories.length, 'categories');
        
        if (!ui.elements.categorySelect) {
            console.error('UI: categorySelect element not found!');
            return;
        }
        
        // Clear existing options
        ui.elements.categorySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a Category --';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        ui.elements.categorySelect.appendChild(defaultOption);
        
        // Filter categories by type
        const filteredCategories = categories.filter(cat => cat.type === type);
        console.log(`UI: Filtered ${filteredCategories.length} ${type} categories`);
        
        // Add category options
        filteredCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.title = category.description || '';
            ui.elements.categorySelect.appendChild(option);
        });
        
        console.log('UI: Dropdown populated with', filteredCategories.length, 'options');
    },

    // Setup event listeners
    setupEventListeners: () => {
        console.log('UI: Setting up event listeners...');
        
        // Theme toggle
        if (ui.elements.themeToggle) {
            ui.elements.themeToggle.addEventListener('click', ui.toggleTheme);
        }

        // Form submission
        if (ui.elements.transactionForm) {
            ui.elements.transactionForm.addEventListener('submit', ui.handleFormSubmit);
        }

        // Type buttons - CRITICAL FOR CATEGORY UPDATES
        if (ui.elements.typeButtons && ui.elements.typeButtons.length > 0) {
            console.log('UI: Found', ui.elements.typeButtons.length, 'type buttons');
            ui.elements.typeButtons.forEach(button => {
                button.addEventListener('click', ui.handleTypeButtonClick);
            });
        } else {
            console.warn('UI: No type buttons found!');
        }

        // Clear form button
        if (ui.elements.clearFormButton) {
            ui.elements.clearFormButton.addEventListener('click', ui.clearForm);
        }

        // Other event listeners...
        if (ui.elements.resetDataButton) {
            ui.elements.resetDataButton.addEventListener('click', ui.showResetConfirmation);
        }

        console.log('UI: Event listeners set up');
    },

    // Toggle theme
    toggleTheme: () => {
        ui.state.currentTheme = ui.state.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', ui.state.currentTheme);
        storage.set(storage.keys.THEME, ui.state.currentTheme);
        
        if (ui.elements.themeIcon) {
            ui.elements.themeIcon.className = ui.state.currentTheme === 'dark' 
                ? 'fas fa-sun' 
                : 'fas fa-moon';
        }
    },

    // Handle type button click - UPDATE CATEGORIES WHEN TYPE CHANGES
    handleTypeButtonClick: (e) => {
        const button = e.currentTarget;
        const type = button.dataset.type;
        console.log('UI: Type button clicked:', type);

        // Update active button
        if (ui.elements.typeButtons) {
            ui.elements.typeButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        }

        // Update hidden input
        if (ui.elements.typeInput) {
            ui.elements.typeInput.value = type;
        }

        // Update category dropdown based on type
        const categories = storage.get(storage.keys.CATEGORIES);
        if (categories && categories.length > 0) {
            ui.populateCategoryDropdown(type, categories);
        } else {
            console.error('UI: No categories found when switching type!');
        }
    },

    // Handle form submission
    handleFormSubmit: (e) => {
        e.preventDefault();
        console.log('UI: Form submitted');

        // Validate form
        if (!ui.validateForm()) {
            console.log('UI: Form validation failed');
            return;
        }

        // Get form data
        const formData = {
            description: ui.elements.descriptionInput.value.trim(),
            amount: parseFloat(ui.elements.amountInput.value),
            type: ui.elements.typeInput.value,
            category: ui.elements.categorySelect.value,
            date: ui.elements.dateInput.value,
            paymentMethod: ui.elements.paymentMethodSelect ? ui.elements.paymentMethodSelect.value : 'cash'
        };

        console.log('UI: Form data:', formData);

        // Show loading state
        const submitButton = ui.elements.transactionForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitButton.disabled = true;

        try {
            // Add transaction
            const result = transactions.add(formData);

            if (result.success) {
                console.log('UI: Transaction added successfully');
                
                // Clear form
                ui.clearForm();
                
                // Show success message
                alert('Transaction added successfully!');
                
                // Refresh UI if possible
                if (ui.refreshAll) {
                    ui.refreshAll();
                }
            } else {
                console.error('UI: Failed to add transaction:', result.errors);
                alert('Error: ' + Object.values(result.errors).join(', '));
            }
        } catch (error) {
            console.error('UI: Error adding transaction:', error);
            alert('Error adding transaction: ' + error.message);
        } finally {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    },

    // Validate form
    validateForm: () => {
        let isValid = true;
        const errors = [];

        // Validate description
        const description = ui.elements.descriptionInput.value.trim();
        if (!description) {
            errors.push('Description is required');
            isValid = false;
        }

        // Validate amount
        const amount = parseFloat(ui.elements.amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            errors.push('Valid amount is required');
            isValid = false;
        }

        // Validate category
        const category = ui.elements.categorySelect.value;
        if (!category) {
            errors.push('Please select a category');
            isValid = false;
        }

        // Show errors if any
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
        }

        return isValid;
    },

    // Clear form
    clearForm: () => {
        console.log('UI: Clearing form');
        
        if (ui.elements.transactionForm) {
            // Reset form
            ui.elements.transactionForm.reset();
            
            // Set default date
            if (ui.elements.dateInput) {
                const today = new Date().toISOString().split('T')[0];
                ui.elements.dateInput.value = today;
            }
            
            // Reset to expense type
            if (ui.elements.typeButtons) {
                ui.elements.typeButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.type === 'expense') {
                        btn.classList.add('active');
                    }
                });
            }
            
            if (ui.elements.typeInput) {
                ui.elements.typeInput.value = 'expense';
            }
            
            // Refresh categories for expense
            const categories = storage.get(storage.keys.CATEGORIES);
            if (categories && categories.length > 0) {
                ui.populateCategoryDropdown('expense', categories);
            }
            
            // Focus on description
            if (ui.elements.descriptionInput) {
                ui.elements.descriptionInput.focus();
            }
            
            console.log('UI: Form cleared');
        }
    },

    // Show reset confirmation
    showResetConfirmation: () => {
        if (confirm('This will delete ALL your data. Are you sure?')) {
            storage.clearAll();
            alert('All data has been reset. Page will reload.');
            location.reload();
        }
    },

    // Refresh all UI components
    refreshAll: () => {
        console.log('UI: Refreshing all components');
        // Implement refresh logic here
    }
};