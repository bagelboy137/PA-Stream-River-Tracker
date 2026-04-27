/**
 * Stream Station Configuration
 * Your favorite SE PA streams and rivers with USGS station codes
 */

const STATIONS = [
    {
        name: 'Delaware River at Easton, PA',
        code: '01447000',
        region: 'Easton',
        lat: 40.6883,
        lon: -75.2055
    },
    {
        name: 'Tohickon Creek near Pipersville, PA',
        code: '01459500',
        region: 'Pipersville',
        lat: 40.4456,
        lon: -75.3517
    },
    {
        name: 'Penns Creek at Penns Creek, PA',
        code: '01555000',
        region: 'Penns Creek',
        lat: 40.8644,
        lon: -76.8278
    },
    {
        name: 'Little Juniata River at Spruce Creek, PA',
        code: '01558000',
        region: 'Spruce Creek',
        lat: 40.8522,
        lon: -77.4794
    },
    {
        name: 'West Branch Delaware River at Hale Eddy, NY',
        code: '01426500',
        region: 'Hale Eddy, NY',
        lat: 42.0358,
        lon: -75.1189
    }
];

/**
 * USGS Parameter Codes
 * These are the measurements we're tracking
 */
const USGS_PARAMS = {
    '00065': { name: 'Gage Height', unit: 'ft', icon: '📏' },
    '00060': { name: 'Discharge', unit: 'cfs', icon: '💧' },
    '00010': { name: 'Temperature', unit: '°C', icon: '🌡️' }
};

/**
 * USGS Real-time Data API endpoint
 * Documentation: https://waterservices.usgs.gov/
 */
const USGS_API_URL = 'https://waterservices.usgs.gov/nwis/iv';

/**
 * Auto-refresh interval in milliseconds (5 minutes)
 */
const REFRESH_INTERVAL = 300000;
