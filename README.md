# 🌊 PA Stream & River Tracker

Real-time water data monitoring for southeastern Pennsylvania streams and rivers using USGS data.

## 📊 Features

- **Live USGS Data** - Real-time gauge height, discharge, and temperature measurements
- **5 Monitored Stations** - Your favorite SE PA streams
- **Auto-Refresh** - Updates every 5 minutes automatically
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Direct USGS Links** - Quick access to detailed station data
- **No API Key Required** - Uses public USGS Water Services

## 🌍 Monitored Stations

1. **Delaware River at Easton, PA** (01447000)
2. **Tohickon Creek near Pipersville, PA** (01459500)
3. **Penns Creek at Penns Creek, PA** (01555000)
4. **Little Juniata River at Spruce Creek, PA** (01558000)
5. **West Branch Delaware River at Hale Eddy, NY** (01426500)

## 📏 Tracked Measurements

- **Gage Height** - Water level (feet)
- **Discharge** - Water flow rate (cubic feet per second)
- **Temperature** - Current water temperature (°C)

## 🚀 Quick Start

### Online (GitHub Pages)
Visit: https://bagelboy137.github.io/PA-Stream-River-Tracker/

### Local Testing
1. Download all files to a folder
2. Open `index.html` in your browser
3. Data loads automatically

## 🛠️ How It Works

1. **config.js** - Defines your 5 USGS stations and data parameters
2. **app.js** - Fetches live data from USGS API and renders it
3. **styles.css** - Beautiful, responsive UI
4. **index.html** - HTML structure

## 📝 Adding More Stations

Edit `config.js` and add a new entry to the `STATIONS` array:

```javascript
{
    name: 'River Name at Location, PA',
    code: 'USGS_STATION_CODE',
    region: 'Location Name',
    lat: 40.1234,
    lon: -75.5678
}
```

Find USGS station codes at: https://waterdata.usgs.gov/nwis/qw

## 🔗 API Source

Data provided by **USGS National Water Information System (NWIS)**
- Documentation: https://waterservices.usgs.gov/
- Real-time API: https://waterservices.usgs.gov/nwis/iv
- No authentication required

## 💡 USGS Integration Options

### Embed in Website (iframe)
```html
<iframe 
    src="https://bagelboy137.github.io/PA-Stream-River-Tracker/" 
    width="100%" 
    height="900" 
    frameborder="0"
    title="SE PA Stream Tracker">
</iframe>
```

### Use as Standalone App
Serve `index.html` on any web server (Apache, Nginx, etc.)

### Develop Locally
```bash
# Simply open index.html in a browser
# Or use a local server:
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## 🐛 Troubleshooting

**No data displaying?**
- Check your internet connection
- USGS servers might be temporarily down
- Try refreshing the page

**Want more/different stations?**
- Edit `config.js` with new USGS station codes
- Find codes at https://waterdata.usgs.gov/nwis/qw

**Mobile display issues?**
- CSS is fully responsive, should work on all devices
- Clear browser cache and reload

## 📚 Additional PA Streams to Track

- Susquehanna River at Harrisburg: 01570000
- Schuylkill River at Reading: 01473500
- Pocono Creek: 01432500
- Lehigh River at Allentown: 01452500

## 📄 License

Open source - feel free to modify and share!

## 🙏 Credits

- Data source: **U.S. Geological Survey (USGS)**
- USGS Water Services API
- Created by: bagelboy137

---

**Last Updated**: April 27, 2026

Questions? Check the USGS documentation or create an issue in this repo!
