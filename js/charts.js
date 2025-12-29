// ============================================
// Chart.js Configuration & Management
// ============================================

let chartInstances = {};
let currentPeriod = 5; // Default: 5 years

// Chart.js default configuration
Chart.defaults.color = '#8b949e';
Chart.defaults.borderColor = 'rgba(48, 54, 61, 0.5)';
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Create chart for a specific indicator
function createChart(canvasId, indicatorKey, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const indicator = window.marketData.indicators[indicatorKey];
    const data = window.marketData.getDataForPeriod(indicatorKey, years);
    
    // Prepare chart data
    const labels = data.map(point => point.date);
    const values = data.map(point => point.value);
    
    // Create threshold line data
    const thresholdData = new Array(data.length).fill(indicator.threshold);
    
    // Determine colors based on threshold type
    const lineColor = '#58a6ff';
    const fillColor = 'rgba(88, 166, 255, 0.1)';
    const thresholdColor = '#f85149';
    
    // Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    // Create new chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: indicator.name,
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: lineColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                },
                {
                    label: 'しきい値',
                    data: thresholdData,
                    borderColor: thresholdColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        padding: 10,
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(33, 38, 45, 0.95)',
                    titleColor: '#e6edf3',
                    bodyColor: '#e6edf3',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const date = context[0].parsed.x;
                            return new Date(date).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(indicator.decimalPlaces) + indicator.unit;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: years >= 10 ? 'year' : 
                              years >= 5 ? 'month' : 
                              years >= 1 ? 'month' :
                              years >= 0.5 ? 'week' :
                              years >= 0.08 ? 'day' : 'day',
                        displayFormats: {
                            day: 'MMM dd',
                            week: 'MMM dd',
                            month: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    grid: {
                        color: 'rgba(48, 54, 61, 0.5)',
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: years < 0.5 ? 45 : 0,
                        autoSkip: true,
                        maxTicksLimit: years < 0.5 ? 8 : 10,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(48, 54, 61, 0.5)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(indicator.decimalPlaces) + indicator.unit;
                        },
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
    
    chartInstances[canvasId] = chart;
    return chart;
}

// Initialize all charts
function initializeCharts(years = 5) {
    createChart('vixChart', 'vix', years);
    createChart('skewChart', 'skew', years);
    createChart('putCallChart', 'putCall', years);
    createChart('hySpreadChart', 'hySpread', years);
    createChart('shillerChart', 'shiller', years);
    createChart('ma200Chart', 'ma200', years);
    createChart('fearGreedChart', 'fearGreed', years);
    createChart('buffettChart', 'buffett', years);
}

// Update all charts with new period
function updateAllCharts(years) {
    currentPeriod = years;
    initializeCharts(years);
}

// Update chart for specific indicator
function updateChart(canvasId, indicatorKey, years) {
    createChart(canvasId, indicatorKey, years);
}

// Destroy all charts
function destroyAllCharts() {
    for (const [canvasId, chart] of Object.entries(chartInstances)) {
        if (chart) {
            chart.destroy();
        }
    }
    chartInstances = {};
}

// Export for use in main.js
window.chartManager = {
    initializeCharts,
    updateAllCharts,
    updateChart,
    destroyAllCharts,
    getCurrentPeriod: () => currentPeriod
};
