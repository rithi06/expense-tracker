// Financial Calculations Module

export const calculations = {
    // Calculate current balance
    calculateBalance: (transactions = null) => {
        const trans = transactions || transactions.getAll();
        return trans.reduce((balance, transaction) => {
            return transaction.type === 'income' 
                ? balance + transaction.amount 
                : balance - transaction.amount;
        }, 0);
    },

    // Calculate total income
    calculateTotalIncome: (transactions = null, filters = {}) => {
        const trans = transactions || transactions.getAll();
        const filtered = filters ? transactions.filter(filters) : trans;
        
        return filtered
            .filter(t => t.type === 'income')
            .reduce((total, t) => total + t.amount, 0);
    },

    // Calculate total expenses
    calculateTotalExpenses: (transactions = null, filters = {}) => {
        const trans = transactions || transactions.getAll();
        const filtered = filters ? transactions.filter(filters) : trans;
        
        return filtered
            .filter(t => t.type === 'expense')
            .reduce((total, t) => total + t.amount, 0);
    },

    // Calculate net income (income - expenses)
    calculateNetIncome: (transactions = null, filters = {}) => {
        const income = calculations.calculateTotalIncome(transactions, filters);
        const expenses = calculations.calculateTotalExpenses(transactions, filters);
        return income - expenses;
    },

    // Calculate budget utilization
    calculateBudgetUtilization: (category, budgetAmount, period = 'month') => {
        let filteredTransactions;
        
        switch (period) {
            case 'month':
                const { month, year } = helpers.getCurrentMonthYear();
                filteredTransactions = transactions.getByMonth(month, year);
                break;
            case 'year':
                const currentYear = new Date().getFullYear();
                filteredTransactions = transactions.getByDateRange(
                    `${currentYear}-01-01`,
                    `${currentYear}-12-31`
                );
                break;
            default:
                filteredTransactions = transactions.getAll();
        }

        const categoryExpenses = filteredTransactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((total, t) => total + t.amount, 0);

        const utilization = (categoryExpenses / budgetAmount) * 100;
        const remaining = budgetAmount - categoryExpenses;

        return {
            spent: categoryExpenses,
            budget: budgetAmount,
            utilization: Math.min(utilization, 100),
            remaining: Math.max(remaining, 0),
            isOverBudget: categoryExpenses > budgetAmount
        };
    },

    // Calculate average daily spending
    calculateAverageDailySpending: (transactions = null, days = 30) => {
        const trans = transactions || transactions.getAll();
        const now = new Date();
        const pastDate = new Date(now);
        pastDate.setDate(now.getDate() - days);

        const recentExpenses = trans.filter(t => 
            t.type === 'expense' && 
            new Date(t.date) >= pastDate
        );

        const totalExpenses = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
        return totalExpenses / days;
    },

    // Calculate monthly projections
    calculateMonthlyProjections: () => {
        const currentMonth = helpers.getCurrentMonthYear();
        const currentMonthTransactions = transactions.getByMonth(currentMonth.month, currentMonth.year);
        
        const currentIncome = calculations.calculateTotalIncome(currentMonthTransactions);
        const currentExpenses = calculations.calculateTotalExpenses(currentMonthTransactions);
        
        const daysInMonth = helpers.getDaysInMonth(currentMonth.month, currentMonth.year);
        const today = new Date().getDate();
        const daysRemaining = daysInMonth - today;

        // Projected based on current daily averages
        const dailyIncomeAverage = currentIncome / today;
        const dailyExpenseAverage = currentExpenses / today;

        const projectedIncome = currentIncome + (dailyIncomeAverage * daysRemaining);
        const projectedExpenses = currentExpenses + (dailyExpenseAverage * daysRemaining);
        const projectedBalance = projectedIncome - projectedExpenses;

        return {
            current: {
                income: currentIncome,
                expenses: currentExpenses,
                balance: currentIncome - currentExpenses
            },
            projected: {
                income: projectedIncome,
                expenses: projectedExpenses,
                balance: projectedBalance
            },
            averages: {
                dailyIncome: dailyIncomeAverage,
                dailyExpense: dailyExpenseAverage
            },
            days: {
                passed: today,
                remaining: daysRemaining,
                total: daysInMonth
            }
        };
    },

    // Calculate savings rate
    calculateSavingsRate: (income, expenses) => {
        if (income <= 0) return 0;
        return ((income - expenses) / income) * 100;
    },

    // Calculate expense ratios by category
    calculateExpenseRatios: (transactions = null) => {
        const trans = transactions || transactions.getAll();
        const totalExpenses = calculations.calculateTotalExpenses(trans);
        
        if (totalExpenses === 0) return [];

        const categoryTotals = calculations.calculateCategoryTotals('expense', trans);
        
        return categoryTotals.map(category => ({
            category: category.category,
            amount: category.total,
            percentage: (category.total / totalExpenses) * 100
        }));
    },

    // Calculate category totals
    calculateCategoryTotals: (type = null, transactions = null) => {
        const trans = transactions || transactions.getAll();
        const totals = {};

        trans.forEach(transaction => {
            if (type && transaction.type !== type) return;
            
            if (!totals[transaction.category]) {
                totals[transaction.category] = 0;
            }
            totals[transaction.category] += transaction.amount;
        });

        return Object.entries(totals)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);
    },

    // Calculate year-over-year growth
    calculateYearOverYearGrowth: (year = null) => {
        const currentYear = year || new Date().getFullYear();
        const previousYear = currentYear - 1;

        const currentYearTransactions = transactions.getByDateRange(
            `${currentYear}-01-01`,
            `${currentYear}-12-31`
        );
        
        const previousYearTransactions = transactions.getByDateRange(
            `${previousYear}-01-01`,
            `${previousYear}-12-31`
        );

        const currentIncome = calculations.calculateTotalIncome(currentYearTransactions);
        const previousIncome = calculations.calculateTotalIncome(previousYearTransactions);
        const currentExpenses = calculations.calculateTotalExpenses(currentYearTransactions);
        const previousExpenses = calculations.calculateTotalExpenses(previousYearTransactions);

        const incomeGrowth = previousIncome > 0 
            ? ((currentIncome - previousIncome) / previousIncome) * 100 
            : currentIncome > 0 ? 100 : 0;

        const expenseGrowth = previousExpenses > 0 
            ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
            : currentExpenses > 0 ? 100 : 0;

        return {
            currentYear,
            previousYear,
            income: {
                current: currentIncome,
                previous: previousIncome,
                growth: incomeGrowth
            },
            expenses: {
                current: currentExpenses,
                previous: previousExpenses,
                growth: expenseGrowth
            }
        };
    },

    // Calculate financial health score
    calculateFinancialHealthScore: () => {
        let score = 100;
        const feedback = [];

        // Get current month data
        const currentMonth = helpers.getCurrentMonthYear();
        const currentMonthTransactions = transactions.getByMonth(currentMonth.month, currentMonth.year);
        
        const income = calculations.calculateTotalIncome(currentMonthTransactions);
        const expenses = calculations.calculateTotalExpenses(currentMonthTransactions);
        const savingsRate = calculations.calculateSavingsRate(income, expenses);

        // Rule 1: Savings rate (weight: 30%)
        if (savingsRate >= 20) {
            score += 30;
            feedback.push('Excellent savings rate!');
        } else if (savingsRate >= 10) {
            score += 20;
            feedback.push('Good savings rate');
        } else if (savingsRate >= 5) {
            score += 10;
            feedback.push('Average savings rate');
        } else {
            score -= 10;
            feedback.push('Low savings rate - consider increasing income or reducing expenses');
        }

        // Rule 2: Expense diversity (weight: 20%)
        const expenseRatios = calculations.calculateExpenseRatios(currentMonthTransactions);
        const topCategoryPercentage = expenseRatios[0]?.percentage || 0;
        
        if (topCategoryPercentage <= 30) {
            score += 20;
            feedback.push('Well-diversified expenses');
        } else if (topCategoryPercentage <= 50) {
            score += 10;
            feedback.push('Moderately diversified expenses');
        } else {
            score -= 10;
            feedback.push('High concentration in one category - consider diversifying');
        }

        // Rule 3: Consistent income (weight: 25%)
        const monthlyTrends = transactions.getMonthlyTrends(6);
        const incomeTrends = monthlyTrends.map(m => m.income);
        const incomeVariance = calculations.calculateVariance(incomeTrends);
        
        if (incomeVariance <= 0.1) {
            score += 25;
            feedback.push('Stable income stream');
        } else if (incomeVariance <= 0.3) {
            score += 15;
            feedback.push('Moderately stable income');
        } else {
            score -= 15;
            feedback.push('Highly variable income - consider building emergency fund');
        }

        // Rule 4: Debt-to-income ratio (simplified) (weight: 25%)
        const averageExpense = calculations.calculateAverageDailySpending() * 30;
        const debtRatio = averageExpense / (income || 1);
        
        if (debtRatio <= 0.3) {
            score += 25;
            feedback.push('Healthy debt-to-income ratio');
        } else if (debtRatio <= 0.5) {
            score += 15;
            feedback.push('Moderate debt-to-income ratio');
        } else {
            score -= 25;
            feedback.push('High debt-to-income ratio - focus on reducing expenses');
        }

        // Cap score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Determine grade
        let grade;
        if (score >= 90) grade = 'A+';
        else if (score >= 80) grade = 'A';
        else if (score >= 70) grade = 'B';
        else if (score >= 60) grade = 'C';
        else if (score >= 50) grade = 'D';
        else grade = 'F';

        return {
            score: Math.round(score),
            grade,
            feedback,
            metrics: {
                savingsRate,
                expenseDiversity: 100 - topCategoryPercentage,
                incomeStability: 100 - (incomeVariance * 100),
                debtRatio: debtRatio * 100
            }
        };
    },

    // Calculate variance of an array
    calculateVariance: (array) => {
        if (array.length === 0) return 0;
        
        const mean = array.reduce((sum, value) => sum + value, 0) / array.length;
        const squaredDiffs = array.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / array.length;
        
        return variance;
    },

    // Calculate compound interest
    calculateCompoundInterest: (principal, rate, time, compoundsPerYear = 12) => {
        const rateDecimal = rate / 100;
        const amount = principal * Math.pow(
            1 + rateDecimal / compoundsPerYear, 
            compoundsPerYear * time
        );
        
        return {
            principal,
            rate,
            time,
            amount,
            interest: amount - principal,
            breakdown: Array.from({ length: time }, (_, i) => {
                const year = i + 1;
                const yearAmount = principal * Math.pow(
                    1 + rateDecimal / compoundsPerYear, 
                    compoundsPerYear * year
                );
                return {
                    year,
                    amount: yearAmount,
                    interest: yearAmount - principal
                };
            })
        };
    },

    // Calculate loan payment
    calculateLoanPayment: (principal, annualRate, years) => {
        const monthlyRate = annualRate / 100 / 12;
        const payments = years * 12;
        
        if (monthlyRate === 0) {
            return principal / payments;
        }
        
        const payment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
        
        const totalPayment = payment * payments;
        const totalInterest = totalPayment - principal;

        return {
            monthlyPayment: payment,
            totalPayment,
            totalInterest,
            amortization: Array.from({ length: payments }, (_, i) => {
                const month = i + 1;
                const interest = principal * monthlyRate;
                const principalPayment = payment - interest;
                principal -= principalPayment;
                
                return {
                    month,
                    payment,
                    principal: principalPayment,
                    interest,
                    remainingBalance: Math.max(principal, 0)
                };
            })
        };
    },

    // Calculate retirement savings projection
    calculateRetirementProjection: (currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn) => {
        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;
        
        let total = currentSavings;
        const monthlyReturn = expectedReturn / 100 / 12;
        
        const projection = [];
        
        for (let month = 1; month <= monthsToRetirement; month++) {
            // Add monthly contribution
            total += monthlyContribution;
            
            // Apply monthly return
            total *= (1 + monthlyReturn);
            
            if (month % 12 === 0) {
                const year = currentAge + (month / 12);
                projection.push({
                    age: year,
                    year: year - currentAge,
                    total: total,
                    contributions: monthlyContribution * 12 * (month / 12),
                    growth: total - currentSavings - (monthlyContribution * month)
                });
            }
        }
        
        return {
            currentAge,
            retirementAge,
            yearsToRetirement,
            finalAmount: total,
            totalContributions: monthlyContribution * monthsToRetirement,
            totalGrowth: total - currentSavings - (monthlyContribution * monthsToRetirement),
            projection
        };
    }
};