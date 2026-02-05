// Charts Module for Data Visualization

export const charts = {
    // Chart instances
    instances: new Map(),

    // Chart colors
    colors: {
        primary: '#4361ee',
        secondary: '#7209b7',
        success: '#4cc9f0',
        danger: '#f72585',
        warning: '#f8961e',
        info: '#4895ef',
        light: '#adb5bd',
        dark: '#212529'
    },

    // Color palettes
    palettes: {
        default: [
            '#4361ee', '#7209b7', '#f72585', '#4cc9f0', 
            '#f8961e', '#4cc9f0', '#06d6a0', '#118ab2',
            '#ef476f', '#ffd166', '#073b4c', '#7209b7'
        ],
        pastel: [
            '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
            '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'
        ],
        warm: [
            '#ff6b6b', '#ff9e6d', '#ffd166', '#06d6a0',
            '#118ab2', '#073b4c', '#7209b7', '#f72585'
        ]
    },

    // Initialize charts module
    initialize: () => {
        // Register Chart.js controllers if needed
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return false;
        }
        return true;
    },

    // Create expense distribution chart (doughnut)
    createExpenseDistributionChart: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id "${canvasId}" not found`);
            return null;
        }

        // Destroy existing chart if present
        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        // Prepare data
        const labels = data.map(item => item.category);
        const values = data.map(item => item.total);
        const backgroundColors = charts.generateColors(data.length);

        const chartData = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        };

        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create monthly overview chart (bar)
    createMonthlyOverviewChart: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        // Destroy existing chart
        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const labels = data.map(item => item.monthName);
        const incomeData = data.map(item => item.income);
        const expenseData = data.map(item => item.expense);
        const netData = data.map(item => item.total);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: charts.colors.success + '40',
                    borderColor: charts.colors.success,
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.6
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: charts.colors.danger + '40',
                    borderColor: charts.colors.danger,
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.6
                },
                {
                    label: 'Net',
                    data: netData,
                    type: 'line',
                    borderColor: charts.colors.primary,
                    backgroundColor: charts.colors.primary + '20',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true
                }
            ]
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `$${value}`
                        }
                    }
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create spending trend chart (line)
    createSpendingTrendChart: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const labels = data.map(item => item.date);
        const expenseData = data.map(item => item.expense);

        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Daily Spending',
                data: expenseData,
                borderColor: charts.colors.danger,
                backgroundColor: charts.colors.danger + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `$${value}`
                        }
                    }
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create category comparison chart (horizontal bar)
    createCategoryComparisonChart: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const labels = data.map(item => item.category);
        const values = data.map(item => item.total);
        const colors = charts.generateColors(data.length);

        const chartData = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
                borderRadius: 4
            }]
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `$${value}`
                        }
                    }
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create budget vs actual chart (bar + line)
    createBudgetVsActualChart: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const labels = data.map(item => item.category);
        const budgetData = data.map(item => item.budget);
        const actualData = data.map(item => item.actual);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData,
                    backgroundColor: charts.colors.info + '40',
                    borderColor: charts.colors.info,
                    borderWidth: 2,
                    borderRadius: 4
                },
                {
                    label: 'Actual',
                    data: actualData,
                    backgroundColor: charts.colors.warning + '40',
                    borderColor: charts.colors.warning,
                    borderWidth: 2,
                    borderRadius: 4
                }
            ]
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const budget = context.datasetIndex === 0 ? value : budgetData[context.dataIndex];
                                const actual = context.datasetIndex === 1 ? value : actualData[context.dataIndex];
                                
                                if (context.datasetIndex === 1) {
                                    const difference = actual - budget;
                                    const percentage = budget > 0 ? (difference / budget) * 100 : 0;
                                    return `${label}: $${value.toFixed(2)} (${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%)`;
                                }
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `$${value}`
                        }
                    }
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create income vs expense timeline
    createIncomeExpenseTimeline: (canvasId, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const labels = data.map(item => item.date);
        const incomeData = data.map(item => item.income);
        const expenseData = data.map(item => item.expense);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: charts.colors.success,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: charts.colors.danger,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4
                }
            ]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `$${value}`
                        }
                    }
                }
            }
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Create savings progress chart (gauge)
    createSavingsProgressChart: (canvasId, current, goal) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (charts.instances.has(canvasId)) {
            charts.instances.get(canvasId).destroy();
        }

        const percentage = (current / goal) * 100;
        const remaining = goal - current;

        const chartData = {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    percentage >= 100 ? charts.colors.success : charts.colors.primary,
                    charts.colors.light + '20'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        };

        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    tooltip: {
                        enabled: false
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    const width = chart.width;
                    const height = chart.height;
                    ctx.save();
                    
                    const text = `${percentage.toFixed(1)}%`;
                    const subText = `$${current.toFixed(0)} / $${goal.toFixed(0)}`;
                    
                    ctx.font = 'bold 24px Inter';
                    ctx.fillStyle = charts.colors.dark;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, width / 2, height / 2 - 15);
                    
                    ctx.font = '12px Inter';
                    ctx.fillStyle = charts.colors.light;
                    ctx.fillText(subText, width / 2, height / 2 + 15);
                    
                    ctx.restore();
                }
            }]
        };

        const chart = new Chart(canvas, config);
        charts.instances.set(canvasId, chart);
        return chart;
    },

    // Generate colors for charts
    generateColors: (count, palette = 'default') => {
        const selectedPalette = charts.palettes[palette] || charts.palettes.default;
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            colors.push(selectedPalette[i % selectedPalette.length]);
        }
        
        return colors;
    },

    // Update existing chart
    updateChart: (chartId, newData) => {
        if (!charts.instances.has(chartId)) {
            console.error(`Chart "${chartId}" not found`);
            return false;
        }

        const chart = charts.instances.get(chartId);
        
        // Update chart data based on chart type
        switch (chart.config.type) {
            case 'doughnut':
            case 'pie':
                chart.data.labels = newData.labels || chart.data.labels;
                chart.data.datasets[0].data = newData.values || chart.data.datasets[0].data;
                break;
                
            case 'bar':
            case 'line':
                chart.data.labels = newData.labels || chart.data.labels;
                newData.datasets?.forEach((dataset, index) => {
                    if (chart.data.datasets[index]) {
                        chart.data.datasets[index].data = dataset.data;
                    }
                });
                break;
        }
        
        chart.update();
        return true;
    },

    // Destroy chart
    destroyChart: (chartId) => {
        if (charts.instances.has(chartId)) {
            charts.instances.get(chartId).destroy();
            charts.instances.delete(chartId);
            return true;
        }
        return false;
    },

    // Destroy all charts
    destroyAllCharts: () => {
        charts.instances.forEach((chart, chartId) => {
            chart.destroy();
        });
        charts.instances.clear();
    },

    // Export chart as image
    exportChart: (chartId, format = 'png', quality = 1.0) => {
        if (!charts.instances.has(chartId)) {
            console.error(`Chart "${chartId}" not found`);
            return null;
        }

        const chart = charts.instances.get(chartId);
        const canvas = chart.canvas;
        
        const imageData = canvas.toDataURL(`image/${format}`, quality);
        return imageData;
    },

    // Create chart legend HTML
    createLegendHTML: (data, colors) => {
        let html = '<div class="chart-legend">';
        
        data.forEach((item, index) => {
            const percentage = item.percentage ? ` (${item.percentage.toFixed(1)}%)` : '';
            html += `
                <div class="legend-item" data-category="${item.category}">
                    <span class="legend-color" style="background-color: ${colors[index]}"></span>
                    <span class="legend-label">${item.category}</span>
                    <span class="legend-value">$${item.total.toFixed(2)}${percentage}</span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },

    // Calculate chart data from transactions
    calculateChartData: (transactionsData, period = 'month', type = 'expense') => {
        const filtered = transactionsData.filter(t => t.type === type);
        
        switch (period) {
            case 'month':
                return charts.calculateMonthlyData(filtered);
            case 'week':
                return charts.calculateWeeklyData(filtered);
            case 'year':
                return charts.calculateYearlyData(filtered);
            default:
                return charts.calculateCategoryData(filtered);
        }
    },

    // Calculate monthly data
    calculateMonthlyData: (transactions) => {
        const monthlyData = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    date: monthKey,
                    total: 0,
                    count: 0
                };
            }
            
            monthlyData[monthKey].total += transaction.amount;
            monthlyData[monthKey].count++;
        });
        
        return Object.values(monthlyData)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-12); // Last 12 months
    },

    // Calculate weekly data
    calculateWeeklyData: (transactions) => {
        const weeklyData = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const year = date.getFullYear();
            const weekNumber = charts.getWeekNumber(date);
            const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                    date: weekKey,
                    total: 0,
                    count: 0
                };
            }
            
            weeklyData[weekKey].total += transaction.amount;
            weeklyData[weekKey].count++;
        });
        
        return Object.values(weeklyData)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-8); // Last 8 weeks
    },

    // Calculate yearly data
    calculateYearlyData: (transactions) => {
        const yearlyData = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const year = date.getFullYear().toString();
            
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    date: year,
                    total: 0,
                    count: 0
                };
            }
            
            yearlyData[year].total += transaction.amount;
            yearlyData[year].count++;
        });
        
        return Object.values(yearlyData)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    // Calculate category data
    calculateCategoryData: (transactions) => {
        const categoryData = {};
        
        transactions.forEach(transaction => {
            if (!categoryData[transaction.category]) {
                categoryData[transaction.category] = {
                    category: transaction.category,
                    total: 0,
                    count: 0
                };
            }
            
            categoryData[transaction.category].total += transaction.amount;
            categoryData[transaction.category].count++;
        });
        
        return Object.values(categoryData)
            .sort((a, b) => b.total - a.total);
    },

    // Helper: Get week number
    getWeekNumber: (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
};