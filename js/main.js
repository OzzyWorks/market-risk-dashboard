// ============================================
// Main Application Logic
// ============================================

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Market Risk Dashboard initializing...');
    
    // Update current time
    updateLastUpdateTime();
    
    // Load current values
    updateOverviewCards();
    
    // Populate indicators table
    populateIndicatorsTable();
    
    // Initialize charts with default period (5 years)
    window.chartManager.initializeCharts(5);
    
    // Check for alerts
    checkForAlerts();
    
    console.log('Market Risk Dashboard initialized successfully');
});

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = formattedTime;
}

// Update overview cards with current values
function updateOverviewCards() {
    const currentValues = window.marketData.getCurrentValues();
    
    for (const [key, value] of Object.entries(currentValues)) {
        const status = window.marketData.getStatus(key, value);
        const formattedValue = window.marketData.formatValue(key, value);
        const statusLabel = window.marketData.getStatusLabel(status);
        
        // Update card value
        const valueElement = document.getElementById(`${key}Value`);
        if (valueElement) {
            valueElement.textContent = formattedValue;
        }
        
        // Update status badge
        const statusElement = document.getElementById(`${key}Status`);
        if (statusElement) {
            statusElement.textContent = statusLabel;
            statusElement.className = `status-badge ${status}`;
        }
        
        // Update card styling
        const cardElement = document.getElementById(`${key}Card`);
        if (cardElement && status === 'danger') {
            cardElement.style.borderColor = '#f85149';
            cardElement.style.borderWidth = '2px';
        } else if (cardElement) {
            cardElement.style.borderColor = 'var(--border-primary)';
            cardElement.style.borderWidth = '1px';
        }
        
        // Add click handler to card (for analysis modal)
        if (cardElement) {
            cardElement.style.cursor = 'pointer';
            cardElement.onclick = function() {
                if (window.openAnalysisModal) {
                    window.openAnalysisModal(key);
                }
            };
        }
    }
}

// Populate indicators table
function populateIndicatorsTable() {
    const tbody = document.getElementById('indicatorsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const currentValues = window.marketData.getCurrentValues();
    const indicators = window.marketData.indicators;
    
    for (const [key, indicator] of Object.entries(indicators)) {
        const value = currentValues[key];
        const status = window.marketData.getStatus(key, value);
        const formattedValue = window.marketData.formatValue(key, value);
        const statusLabel = window.marketData.getStatusLabel(status);
        
        // Create threshold description
        let thresholdText = '';
        if (indicator.thresholdType === 'above') {
            thresholdText = `${indicator.threshold}${indicator.unit}以上で警告`;
        } else {
            thresholdText = `${indicator.threshold}${indicator.unit}以下で警告`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${indicator.name}</td>
            <td>${indicator.description}</td>
            <td><span class="table-value ${status}">${formattedValue}</span></td>
            <td>${thresholdText}</td>
            <td><span class="status-badge ${status}">${statusLabel}</span></td>
        `;
        
        tbody.appendChild(row);
    }
}

// Check for alerts and display banner if needed
function checkForAlerts() {
    const currentValues = window.marketData.getCurrentValues();
    const alerts = [];
    
    for (const [key, value] of Object.entries(currentValues)) {
        const status = window.marketData.getStatus(key, value);
        if (status === 'danger') {
            const indicator = window.marketData.indicators[key];
            alerts.push(indicator.name);
        }
    }
    
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    
    if (alerts.length > 0) {
        alertMessage.textContent = `警告: 以下の指標がしきい値を超えています - ${alerts.join(', ')}`;
        alertBanner.style.display = 'flex';
    } else {
        alertBanner.style.display = 'none';
    }
    
    // Update overall assessment
    updateOverallAssessment();
}

// Update overall assessment
function updateOverallAssessment() {
    const currentValues = window.marketData.getCurrentValues();
    let dangerCount = 0;
    let warningCount = 0;
    let safeCount = 0;
    
    // Count status levels
    for (const [key, value] of Object.entries(currentValues)) {
        const status = window.marketData.getStatus(key, value);
        if (status === 'danger') dangerCount++;
        else if (status === 'warning') warningCount++;
        else safeCount++;
    }
    
    // Update counts
    document.getElementById('dangerCount').textContent = dangerCount;
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('safeCount').textContent = safeCount;
    
    // Calculate risk level
    let riskLevel = '';
    let riskColor = '';
    let comment = '';
    
    if (dangerCount >= 4) {
        riskLevel = '極めて高い';
        riskColor = 'var(--color-danger)';
        comment = '複数の指標が危険水準に達しています。市場には重大なリスクが存在し、大幅な調整や暴落の可能性が高まっています。ポートフォリオの見直しと防御的なポジション調整を強く推奨します。';
    } else if (dangerCount >= 2) {
        riskLevel = '高い';
        riskColor = 'var(--color-danger)';
        comment = '複数の警告指標が点灯しています。市場の不安定性が増しており、慎重な対応が必要です。リスク資産のエクスポージャーを削減し、キャッシュポジションを高めることを検討してください。';
    } else if (dangerCount === 1 || warningCount >= 3) {
        riskLevel = 'やや高い';
        riskColor = 'var(--color-warning)';
        comment = '一部の指標に懸念が見られます。市場環境は不透明感を増しており、警戒が必要です。ポジションサイズの調整やヘッジ戦略の検討をお勧めします。';
    } else if (warningCount >= 1) {
        riskLevel = '中程度';
        riskColor = 'var(--color-warning)';
        comment = '一部の指標に注意が必要です。市場は概ね安定していますが、いくつかの懸念材料があります。継続的なモニタリングと慎重な投資判断が求められます。';
    } else {
        riskLevel = '低い';
        riskColor = 'var(--color-safe)';
        comment = '全体的に指標は良好です。市場環境は比較的安定しており、大きなリスクは見られません。ただし、市場は常に変動するため、定期的な確認を継続してください。';
    }
    
    // Update risk level display
    const riskScore = document.getElementById('riskScore');
    riskScore.textContent = riskLevel;
    riskScore.style.color = riskColor;
    
    // Update comment
    document.getElementById('overallComment').textContent = comment;
}

// Change period (called from period buttons)
function changePeriod(years) {
    console.log(`Changing period to ${years} years`);
    
    // Update button states
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.period) === years) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update all charts
    window.chartManager.updateAllCharts(years);
}

// Refresh data (simulate data refresh)
function refreshData() {
    console.log('Refreshing data...');
    
    // Add loading animation to refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear';
    
    // Simulate data refresh delay
    setTimeout(() => {
        // Update timestamp
        updateLastUpdateTime();
        
        // In a real application, you would fetch new data here
        // For demo purposes, we just re-render with existing data
        updateOverviewCards();
        populateIndicatorsTable();
        checkForAlerts();
        
        // Remove loading animation
        icon.style.animation = '';
        
        // Show success feedback
        showNotification('データを更新しました', 'success');
    }, 1000);
}

// Show notification (optional enhancement)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#3fb950' : '#58a6ff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized, updating charts...');
        const currentPeriod = window.chartManager.getCurrentPeriod();
        window.chartManager.updateAllCharts(currentPeriod);
    }, 250);
});

// Export functions for HTML onclick handlers
window.changePeriod = changePeriod;
window.refreshData = refreshData;

// Log initialization complete
console.log('Main script loaded successfully');
