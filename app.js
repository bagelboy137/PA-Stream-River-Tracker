/**
 * PA Stream Tracker - Main Application
 * Fetches real-time and historical data from USGS
 */

// Global state
let stationData = {};
let charts = {};
let autoRefreshInterval;

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing PA Stream Tracker...');
    document.getElementById('refreshBtn').addEventListener('click', refreshAllData);
    
    // Load data on startup
    await refreshAllData();
    
    // Set up auto-refresh every 5 minutes
    autoRefreshInterval = setInterval(refreshAllData, REFRESH_INTERVAL);
}

/**
 * Refresh all station data
 */
async function refreshAllData() {
    console.log('Refreshing all station data...');
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('error').style.display = 'none';
    document.getElementById('stationsGrid').innerHTML = '';

    try {
        // Fetch real-time data for all stations
        for (const station of STATIONS) {
            await fetchStationData(station);
        }

        // Update last refresh time
        updateLastRefreshTime();
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error refreshing data:', error);
        showError('Failed to load stream data. Please try again.');
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * Fetch real-time and historical data for a station
 */
async function fetchStationData(station) {
    try {
        // Fetch real-time data
        const realtimeData = await fetchUSGSRealtime(station.code);
        
        // Fetch last 7 days of data for graphs
        const historicalData = await fetchUSGSHistorical(station.code);
        
        // Store combined data
        stationData[station.code] = {
            station,
            realtime: realtimeData,
            historical: historicalData
        };

        // Render station card with data
        renderStationCard(station, realtimeData, historicalData);
    } catch (error) {
        console.error(`Error fetching data for ${station.name}:`, error);
        renderStationError(station);
    }
}

/**
 * Fetch real-time data from USGS
 */
async function fetchUSGSRealtime(siteCode) {
    const parameterCodes = '00065,00060,00010'; // Gage height, discharge, temperature
    const url = `${USGS_API_URL}?format=json&sites=${siteCode}&parameterCd=${parameterCodes}&siteStatus=all`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (!data.value || !data.value.timeSeries || data.value.timeSeries.length === 0) {
            console.warn(`No real-time data for site ${siteCode}`);
            return null;
        }

        // Parse the response into usable format
        const parsed = parseUSGSRealtime(data.value.timeSeries);
        return parsed;
    } catch (error) {
        console.error(`USGS real-time fetch error for ${siteCode}:`, error);
        return null;
    }
}

/**
 * Fetch historical data (last 7 days) from USGS
 */
async function fetchUSGSHistorical(siteCode) {
    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const formatDate = (date) => date.toISOString().split('T')[0];
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const parameterCodes = '00065,00060,00010';
    const url = `${USGS_API_URL}?format=json&sites=${siteCode}&startDT=${start}&endDT=${end}&parameterCd=${parameterCodes}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (!data.value || !data.value.timeSeries || data.value.timeSeries.length === 0) {
            console.warn(`No historical data for site ${siteCode}`);
            return null;
        }

        // Parse the response
        const parsed = parseUSGSHistorical(data.value.timeSeries);
        return parsed;
    } catch (error) {
        console.error(`USGS historical fetch error for ${siteCode}:`, error);
        return null;
    }
}

/**
 * Parse USGS real-time response
 */
function parseUSGSRealtime(timeSeries) {
    const result = {};

    for (const ts of timeSeries) {
        const method = ts.sourceInfo;
        const paramCode = ts.variable.variableCode[0].value;
        const paramName = ts.variable.variableName;
        const unit = ts.variable.unit.unitCode;

        // Get the most recent value
        const values = ts.values[0].value;
        if (values.length > 0) {
            const latestValue = values[values.length - 1];
            result[paramCode] = {
                value: parseFloat(latestValue.value),
                dateTime: latestValue.dateTime,
                unit: unit,
                name: paramName
            };
        }
    }

    return result;
}

/**
 * Parse USGS historical response
 */
function parseUSGSHistorical(timeSeries) {
    const result = {};

    for (const ts of timeSeries) {
        const paramCode = ts.variable.variableCode[0].value;
        const paramName = ts.variable.variableName;
        const unit = ts.variable.unit.unitCode;

        const values = ts.values[0].value;
        result[paramCode] = {
            name: paramName,
            unit: unit,
            data: values.map(v => ({
                value: parseFloat(v.value),
                dateTime: new Date(v.dateTime)
            }))
        };
    }

    return result;
}

/**
 * Render station card with data and charts
 */
function renderStationCard(station, realtimeData, historicalData) {
    if (!realtimeData) {
        renderStationError(station);
        return;
    }

    const grid = document.getElementById('stationsGrid');
    const card = document.createElement('div');
    card.className = 'station-card';

    // Get USGS URL
    const usgsUrl = `https://waterdata.usgs.gov/nwis/qw?site_no=${station.code}`;

    // Build header
    let html = `
        <div class="card-header">
            <h2>${station.name}</h2>
            <p class="region">${station.region}</p>
            <a href="${usgsUrl}" target="_blank" class="usgs-link">📊 View on USGS</a>
        </div>
        <div class="card-body">
            <div class="measurements">
    `;

    // Add real-time measurements
    for (const [paramCode, param] of Object.entries(USGS_PARAMS)) {
        if (realtimeData[paramCode]) {
            const data = realtimeData[paramCode];
            const timestamp = new Date(data.dateTime).toLocaleString();
            html += `
                <div class="measurement">
                    <div class="measurement-icon">${param.icon}</div>
                    <div class="measurement-info">
                        <div class="measurement-name">${param.name}</div>
                        <div class="measurement-value">${data.value.toFixed(2)} ${param.unit}</div>
                        <div class="measurement-time">${timestamp}</div>
                    </div>
                </div>
            `;
        }
    }

    html += `
            </div>
            <div class="charts-container">
    `;

    // Add chart containers for each parameter
    for (const [paramCode, param] of Object.entries(USGS_PARAMS)) {
        if (historicalData && historicalData[paramCode]) {
            html += `
                <div class="chart-wrapper">
                    <h3>${param.name} - Last 7 Days</h3>
                    <canvas id="chart-${station.code}-${paramCode}"></canvas>
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>
    `;

    card.innerHTML = html;
    grid.appendChild(card);

    // Initialize charts after DOM is updated
    setTimeout(() => {
        for (const [paramCode, param] of Object.entries(USGS_PARAMS)) {
            if (historicalData && historicalData[paramCode]) {
                createChart(station.code, paramCode, historicalData[paramCode], param);
            }
        }
    }, 100);
}

/**
 * Create interactive chart for parameter data
 */
function createChart(stationCode, paramCode, historicalData, paramInfo) {
    const canvasId = `chart-${stationCode}-${paramCode}`;
    const ctx = document.getElementById(canvasId);
    
    if (!ctx) return;

    // Prepare data for chart
    const labels = historicalData.data.map(d => 
        d.dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
    );
    const values = historicalData.data.map(d => d.value);

    // Color scheme by parameter
    const colorMap = {
        '00065': 'rgba(54, 162, 235, 1)',    // Gage height - blue
        '00060': 'rgba(75, 192, 75, 1)',     // Discharge - green
        '00010': 'rgba(255, 99, 132, 1)'     // Temperature - red
    };

    const bgColorMap = {
        '00065': 'rgba(54, 162, 235, 0.1)',
        '00060': 'rgba(75, 192, 75, 0.1)',
        '00010': 'rgba(255, 99, 132, 0.1)'
    };

    // Destroy existing chart if it exists
    const chartKey = `${stationCode}-${paramCode}`;
    if (charts[chartKey]) {
        charts[chartKey].destroy();
    }

    // Create new chart
    charts[chartKey] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${paramInfo.name} (${historicalData.unit})`,
                data: values,
                borderColor: colorMap[paramCode],
                backgroundColor: bgColorMap[paramCode],
                borderWidth: 2,
                fill: true,
                pointRadius: 2,
                pointBackgroundColor: colorMap[paramCode],
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: 10,
                    titleFont: { size: 12 },
                    bodyFont: { size: 11 },
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: historicalData.unit }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 45, minRotation: 0 }
                }
            }
        }
    });
}

/**
 * Render error state for a station
 */
function renderStationError(station) {
    const grid = document.getElementById('stationsGrid');
    const card = document.createElement('div');
    card.className = 'station-card error';
    
    const usgsUrl = `https://waterdata.usgs.gov/nwis/qw?site_no=${station.code}`;
    
    card.innerHTML = `
        <div class="card-header">
            <h2>${station.name}</h2>
            <p class="region">${station.region}</p>
            <a href="${usgsUrl}" target="_blank" class="usgs-link">📊 View on USGS</a>
        </div>
        <div class="card-body">
            <p class="error-text">⚠️ Unable to load data for this station. The USGS server may be temporarily unavailable.</p>
        </div>
    `;
    
    grid.appendChild(card);
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = `❌ ${message}`;
    errorDiv.style.display = 'block';
}

/**
 * Update last refresh timestamp
 */
function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    document.getElementById('lastUpdate').textContent = `Last updated: ${timeString}`;
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', initApp);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    // Destroy all charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
});
