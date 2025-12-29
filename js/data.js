// ============================================
// Data Management & Historical Data Generation
// ============================================

// Indicator Definitions
const indicators = {
    vix: {
        name: 'VIX',
        fullName: 'VIX - 恐怖指数',
        description: '市場のボラティリティ（変動性）を測る指標。高いほど市場の不安が大きい',
        threshold: 30,
        thresholdType: 'above', // above means value >= threshold is warning
        unit: '',
        decimalPlaces: 2,
        baseline: 15,
        volatility: 8,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 3.5 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 4.0 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: 1.8 }
        ]
    },
    skew: {
        name: 'SKEW',
        fullName: 'SKEW - テールリスク',
        description: '市場の暴落リスク（テールリスク）を測定。145以上で警戒信号',
        threshold: 145,
        thresholdType: 'above',
        unit: '',
        decimalPlaces: 2,
        baseline: 130,
        volatility: 8,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 1.15 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 1.18 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: 1.10 }
        ]
    },
    putCall: {
        name: 'Put/Call比率',
        fullName: 'Put/Call比率 - 市場センチメント',
        description: 'プットとコールの比率。0.7以下は市場が楽観的すぎることを示唆',
        threshold: 0.7,
        thresholdType: 'below', // below means value <= threshold is warning
        unit: '',
        decimalPlaces: 2,
        baseline: 1.0,
        volatility: 0.2,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 1.5 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 1.8 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: 1.3 }
        ]
    },
    hySpread: {
        name: 'HY Spread',
        fullName: 'ハイイールド債スプレッド',
        description: 'ハイイールド債と国債の利回り差。信用リスクの拡大を示す',
        threshold: 5.0,
        thresholdType: 'above',
        unit: '%',
        decimalPlaces: 2,
        baseline: 3.5,
        volatility: 0.8,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 4.5 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 2.5 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: 1.4 }
        ]
    },
    shiller: {
        name: 'Shiller P/E',
        fullName: 'Shiller P/E - 株価割高感',
        description: '景気調整後株価収益率（CAPE）。30以上で株価が割高と判断',
        threshold: 30,
        thresholdType: 'above',
        unit: '',
        decimalPlaces: 2,
        baseline: 25,
        volatility: 3,
        trend: 0.15, // gradual upward trend over 20 years
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 0.6 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 0.75 }
        ]
    },
    ma200: {
        name: '200日線乖離率',
        fullName: 'S&P500 200日移動平均線乖離率',
        description: '株価と200日移動平均線の乖離率。0%以下で下落トレンド',
        threshold: 0,
        thresholdType: 'below',
        unit: '%',
        decimalPlaces: 2,
        baseline: 2.5,
        volatility: 5,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: -3.5 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: -2.0 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: -1.2 }
        ]
    },
    fearGreed: {
        name: 'Fear & Greed',
        fullName: 'Fear & Greed Index',
        description: '市場の感情指標。0-100のスコアで、低いほど恐怖、高いほど強欲を示す',
        threshold: 25,
        thresholdType: 'below', // below 25 = Extreme Fear (危険)
        unit: '',
        decimalPlaces: 0,
        baseline: 50,
        volatility: 15,
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 0.3 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 0.25 },
            { start: new Date('2022-02-01'), end: new Date('2022-04-01'), factor: 0.6 }
        ]
    },
    buffett: {
        name: 'Buffett指数',
        fullName: 'Buffett Indicator (株式時価総額/GDP比)',
        description: '株式市場の時価総額をGDPで割った比率。100%以上で割高、150%以上で警告',
        threshold: 150,
        thresholdType: 'above',
        unit: '%',
        decimalPlaces: 1,
        baseline: 100,
        volatility: 10,
        trend: 0.8, // gradual upward trend
        crisis: [
            { start: new Date('2008-09-01'), end: new Date('2009-03-01'), factor: 0.65 },
            { start: new Date('2020-02-01'), end: new Date('2020-05-01'), factor: 0.80 }
        ]
    }
};

// Generate Historical Data (20 years)
function generateHistoricalData() {
    const endDate = new Date('2025-12-29');
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 20);
    
    const data = {
        vix: [],
        skew: [],
        putCall: [],
        hySpread: [],
        shiller: [],
        ma200: [],
        fearGreed: [],
        buffett: []
    };
    
    // Generate data points (weekly data for 20 years ≈ 1040 points)
    let currentDate = new Date(startDate);
    const dayIncrement = 7; // weekly data
    
    while (currentDate <= endDate) {
        for (const [key, indicator] of Object.entries(indicators)) {
            let value = indicator.baseline;
            
            // Add trend if applicable
            if (indicator.trend) {
                const yearsPassed = (currentDate - startDate) / (365.25 * 24 * 60 * 60 * 1000);
                value += indicator.trend * yearsPassed;
            }
            
            // Check if in crisis period
            let crisisFactor = 1;
            if (indicator.crisis) {
                for (const crisis of indicator.crisis) {
                    if (currentDate >= crisis.start && currentDate <= crisis.end) {
                        crisisFactor = crisis.factor;
                        break;
                    }
                }
            }
            
            // Apply crisis factor
            if (key === 'ma200' && crisisFactor < 0) {
                value = crisisFactor * indicator.volatility;
            } else if (key === 'shiller' && crisisFactor < 1) {
                value = value * crisisFactor;
            } else if (crisisFactor !== 1) {
                value = value * crisisFactor;
            }
            
            // Add random volatility
            const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
            value += randomFactor * indicator.volatility * 0.5;
            
            // Ensure minimum values
            if (key === 'vix' && value < 10) value = 10 + Math.random() * 5;
            if (key === 'skew' && value < 115) value = 115 + Math.random() * 10;
            if (key === 'putCall' && value < 0.5) value = 0.5 + Math.random() * 0.2;
            if (key === 'hySpread' && value < 2) value = 2 + Math.random() * 1;
            if (key === 'shiller' && value < 15) value = 15 + Math.random() * 5;
            if (key === 'fearGreed' && value < 5) value = 5 + Math.random() * 10;
            if (key === 'fearGreed' && value > 95) value = 85 + Math.random() * 10;
            if (key === 'buffett' && value < 50) value = 50 + Math.random() * 20;
            
            // Round to appropriate decimal places
            value = parseFloat(value.toFixed(indicator.decimalPlaces));
            
            data[key].push({
                date: new Date(currentDate),
                value: value
            });
        }
        
        // Increment date
        currentDate.setDate(currentDate.getDate() + dayIncrement);
    }
    
    return data;
}

// Generate data
const historicalData = generateHistoricalData();

// Get current values (latest data point)
function getCurrentValues() {
    const current = {};
    for (const key of Object.keys(indicators)) {
        const dataArray = historicalData[key];
        current[key] = dataArray[dataArray.length - 1].value;
    }
    return current;
}

// Get data for specific period
function getDataForPeriod(indicatorKey, years) {
    const allData = historicalData[indicatorKey];
    const endDate = allData[allData.length - 1].date;
    const startDate = new Date(endDate);
    
    // Handle fractional years for short periods
    if (years < 1) {
        const daysToSubtract = Math.floor(years * 365);
        startDate.setDate(startDate.getDate() - daysToSubtract);
    } else {
        startDate.setFullYear(startDate.getFullYear() - years);
    }
    
    return allData.filter(point => point.date >= startDate);
}

// Determine status based on threshold
function getStatus(indicatorKey, value) {
    const indicator = indicators[indicatorKey];
    
    if (indicator.thresholdType === 'above') {
        if (value >= indicator.threshold) {
            return 'danger';
        } else if (value >= indicator.threshold * 0.85) {
            return 'warning';
        } else {
            return 'safe';
        }
    } else { // below
        if (value <= indicator.threshold) {
            return 'danger';
        } else if (value <= indicator.threshold * 1.2) {
            return 'warning';
        } else {
            return 'safe';
        }
    }
}

// Get status label in Japanese
function getStatusLabel(status) {
    const labels = {
        safe: '安全',
        warning: '注意',
        danger: '警告'
    };
    return labels[status];
}

// Format value with unit
function formatValue(indicatorKey, value) {
    const indicator = indicators[indicatorKey];
    return value.toFixed(indicator.decimalPlaces) + indicator.unit;
}

// Export for use in other scripts
window.marketData = {
    indicators,
    historicalData,
    getCurrentValues,
    getDataForPeriod,
    getStatus,
    getStatusLabel,
    formatValue
};
