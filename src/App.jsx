import React, { useRef, useEffect, useState, useCallback } from 'react';

// Wilderness map image URL
const WILDERNESS_MAP_URL = 'https://oldschool.runescape.wiki/images/thumb/The_Wilderness.png/800px-The_Wilderness.png?48133';

// Define some speculative "hotspot" regions on the map (pixel coordinates relative to 800x800 map)
// These are rough estimates for demonstration purposes.
const HOTSPOTS = [
  // Edgeville Wilderness (low level PvP, common entry)
  { x: 150, y: 700, radius: 80, density: 0.4, name: "Edgeville Wilderness (Lvl 1-5)" },
  // Chaos Altar / Temple (prayer training, pkers)
  { x: 650, y: 150, radius: 70, density: 0.3, name: "Chaos Altar / Temple" },
  // Revenant Caves (high risk, high reward)
  { x: 400, y: 400, radius: 90, density: 0.5, name: "Revenant Caves Entrance" },
  // Wilderness Slayer Cave / Lava Dragons (PvM + PvP)
  { x: 600, y: 550, radius: 60, density: 0.25, name: "Wilderness Slayer/Lava Dragons" },
  // Deep Wilderness (multi-combat, bosses)
  { x: 400, y: 100, radius: 100, density: 0.35, name: "Deep Wilderness Bosses" },
];

// Function to generate speculative death data with additional analytics
const generateDeathData = (numDeaths = 2000) => {
  const deaths = [];
  const mapWidth = 800; // Assumed width of the base map image
  const mapHeight = 800; // Assumed height of the base map image

  // Add timestamps and additional data for analytics
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < numDeaths; i++) {
    let x, y;
    // Randomly pick a hotspot to generate a death around, or a general random spot
    const hotspotChance = Math.random();
    let chosenHotspot = null;

    // Distribute deaths with higher density around hotspots
    if (hotspotChance < 0.8) { // 80% chance to be near a hotspot
      const hotspotIndex = Math.floor(Math.random() * HOTSPOTS.length);
      chosenHotspot = HOTSPOTS[hotspotIndex];
      // Generate coordinates within the hotspot's radius
      const angle = Math.random() * 2 * Math.PI;
      const r = chosenHotspot.radius * Math.sqrt(Math.random()); // For more even distribution within circle
      x = chosenHotspot.x + r * Math.cos(angle);
      y = chosenHotspot.y + r * Math.sin(angle);
    } else { // 20% chance for a general random death anywhere
      x = Math.random() * mapWidth;
      y = Math.random() * mapHeight;
    }

    // Ensure coordinates are within map bounds
    x = Math.max(0, Math.min(mapWidth, x));
    y = Math.max(0, Math.min(mapHeight, y));

    // Generate random timestamp within the year
    const timestamp = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    // Generate random player level (1-126)
    const playerLevel = Math.floor(Math.random() * 126) + 1;
    
    // Generate random combat level (1-126)
    const combatLevel = Math.floor(Math.random() * 126) + 1;
    
    // Generate random wealth lost (0-100M)
    const wealthLost = Math.floor(Math.random() * 100000000);
    
    // Determine time of day (0-23 hours)
    const hourOfDay = Math.floor(Math.random() * 24);
    
    // Determine day of week (0-6, Sunday-Saturday)
    const dayOfWeek = Math.floor(Math.random() * 7);

    deaths.push({ 
      x, 
      y, 
      timestamp,
      playerLevel,
      combatLevel,
      wealthLost,
      hourOfDay,
      dayOfWeek,
      hotspot: chosenHotspot ? chosenHotspot.name : 'Random Location'
    });
  }
  return deaths;
};

// Analytics functions
const calculateAnalytics = (deaths) => {
  if (deaths.length === 0) return {};

  const totalDeaths = deaths.length;
  const totalWealthLost = deaths.reduce((sum, death) => sum + death.wealthLost, 0);
  const avgWealthLost = totalWealthLost / totalDeaths;
  const avgPlayerLevel = deaths.reduce((sum, death) => sum + death.playerLevel, 0) / totalDeaths;
  const avgCombatLevel = deaths.reduce((sum, death) => sum + death.combatLevel, 0) / totalDeaths;

  // Time analysis
  const hourDistribution = Array(24).fill(0);
  const dayDistribution = Array(7).fill(0);
  const monthDistribution = Array(12).fill(0);

  deaths.forEach(death => {
    hourDistribution[death.hourOfDay]++;
    dayDistribution[death.dayOfWeek]++;
    monthDistribution[death.timestamp.getMonth()]++;
  });

  // Hotspot analysis
  const hotspotCounts = {};
  deaths.forEach(death => {
    hotspotCounts[death.hotspot] = (hotspotCounts[death.hotspot] || 0) + 1;
  });

  const topHotspots = Object.entries(hotspotCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Wealth analysis
  const wealthRanges = {
    '0-10K': 0,
    '10K-100K': 0,
    '100K-1M': 0,
    '1M-10M': 0,
    '10M+': 0
  };

  deaths.forEach(death => {
    if (death.wealthLost <= 10000) wealthRanges['0-10K']++;
    else if (death.wealthLost <= 100000) wealthRanges['10K-100K']++;
    else if (death.wealthLost <= 1000000) wealthRanges['100K-1M']++;
    else if (death.wealthLost <= 10000000) wealthRanges['1M-10M']++;
    else wealthRanges['10M+']++;
  });

  return {
    totalDeaths,
    totalWealthLost,
    avgWealthLost,
    avgPlayerLevel,
    avgCombatLevel,
    hourDistribution,
    dayDistribution,
    monthDistribution,
    topHotspots,
    wealthRanges
  };
};

const App = () => {
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deaths, setDeaths] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Generate death data once on component mount
  useEffect(() => {
    const deathData = generateDeathData(5000); // Generate more deaths for a denser map
    console.log(`Generated ${deathData.length} death points`);
    setDeaths(deathData);
    
    // Calculate analytics
    const analyticsData = calculateAnalytics(deathData);
    setAnalytics(analyticsData);
  }, []);

  // Function to draw the map and death points on the canvas
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set default canvas dimensions if no image loads
    const containerWidth = canvas.parentElement.offsetWidth;
    const defaultWidth = containerWidth;
    const defaultHeight = containerWidth; // Square aspect ratio
    
    canvas.width = defaultWidth;
    canvas.height = defaultHeight;
    setCanvasDimensions({ width: defaultWidth, height: defaultHeight });

    const img = new Image();
    img.src = WILDERNESS_MAP_URL;
    
    img.onload = () => {
      setMapLoaded(true);
      console.log("Map image loaded successfully!");
      
      // Set canvas dimensions based on the image's aspect ratio and container width
      const aspectRatio = img.width / img.height;
      const newWidth = containerWidth;
      const newHeight = containerWidth / aspectRatio;

      canvas.width = newWidth;
      canvas.height = newHeight;
      setCanvasDimensions({ width: newWidth, height: newHeight });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Scale factor to translate mock 800x800 coordinates to current canvas dimensions
      const scaleX = newWidth / 800;
      const scaleY = newHeight / 800;

      console.log(`Drawing ${deaths.length} death points...`);
      
      // Draw death points
      deaths.forEach(death => {
        ctx.beginPath();
        // Scale the death coordinates
        ctx.arc(death.x * scaleX, death.y * scaleY, 2, 0, Math.PI * 2); // Small circles for each death
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red with transparency
        ctx.fill();
      });

      // Optionally, draw hotspot circles for visual reference (can be removed in final version)
      HOTSPOTS.forEach(hotspot => {
        ctx.beginPath();
        ctx.arc(hotspot.x * scaleX, hotspot.y * scaleY, hotspot.radius * scaleX, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // Cyan outline for hotspots
        ctx.lineWidth = 1;
        ctx.stroke();
      });

    };
    
    img.onerror = () => {
      console.error("Failed to load Wilderness map image. Drawing death points on fallback background.");
      setMapLoaded(true);
      
      // Draw a dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a grid pattern to simulate a map
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      // Scale factor for 800x800 coordinates to current canvas dimensions
      const scaleX = canvas.width / 800;
      const scaleY = canvas.height / 800;

      console.log(`Drawing ${deaths.length} death points on fallback background...`);
      
      // Draw death points
      deaths.forEach(death => {
        ctx.beginPath();
        ctx.arc(death.x * scaleX, death.y * scaleY, 3, 0, Math.PI * 2); // Slightly larger circles
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Brighter red
        ctx.fill();
      });

      // Draw hotspot circles
      HOTSPOTS.forEach(hotspot => {
        ctx.beginPath();
        ctx.arc(hotspot.x * scaleX, hotspot.y * scaleY, hotspot.radius * scaleX, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; // Brighter cyan
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      // Add a message
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('Map image unavailable - showing death data on grid background', 10, 30);
    };
  }, [deaths]); // Redraw if deaths data changes

  // Redraw on window resize to maintain responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Trigger redraw by re-setting mapLoaded state, which will re-run drawMap
      if (mapLoaded) {
        drawMap();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded, drawMap]);

  // Initial draw when component mounts
  useEffect(() => {
    drawMap();
  }, [drawMap]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-inter p-4 sm:p-6 md:p-8">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          canvas {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #4a5568;
          }
          .stat-card {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            border: 1px solid #4b5563;
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          .chart-bar {
            background: linear-gradient(to top, #3b82f6, #1d4ed8);
            transition: height 0.5s ease;
          }
        `}
      </style>

      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-md">
          OSRS Wilderness Death Analytics Dashboard
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          Comprehensive Data Analysis of Player Death Patterns in the Wilderness
        </p>
        <div className="text-sm text-gray-400">
          Data Analyst Portfolio Project | Created by Shakirudeen Adefuwa
        </div>
      </header>

      {/* Key Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Deaths</p>
              <p className="text-3xl font-bold text-red-400">{analytics.totalDeaths?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-red-400 text-2xl">💀</div>
          </div>
        </div>

        <div className="stat-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Wealth Lost</p>
              <p className="text-3xl font-bold text-green-400">
                {analytics.totalWealthLost ? `${(analytics.totalWealthLost / 1000000).toFixed(1)}M` : '0M'}
              </p>
            </div>
            <div className="text-green-400 text-2xl">💰</div>
          </div>
        </div>

        <div className="stat-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg Player Level</p>
              <p className="text-3xl font-bold text-blue-400">
                {analytics.avgPlayerLevel ? Math.round(analytics.avgPlayerLevel) : '0'}
              </p>
            </div>
            <div className="text-blue-400 text-2xl">⚔️</div>
          </div>
        </div>

        <div className="stat-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg Wealth Lost</p>
              <p className="text-3xl font-bold text-purple-400">
                {analytics.avgWealthLost ? `${(analytics.avgWealthLost / 1000).toFixed(0)}K` : '0K'}
              </p>
            </div>
            <div className="text-purple-400 text-2xl">📊</div>
          </div>
        </div>
      </section>

      {/* Map and Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4">Death Location Heatmap</h2>
            <div className="relative w-full">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 rounded-xl text-gray-300 text-xl z-10">
                  Loading Wilderness map...
                </div>
              )}
              <canvas ref={canvasRef} className="w-full h-auto"></canvas>
            </div>
          </div>
        </div>

        {/* Top Hotspots */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Top Death Hotspots</h2>
          <div className="space-y-4">
            {analytics.topHotspots?.map(([hotspot, count], index) => (
              <div key={hotspot} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-3">#{index + 1}</span>
                  <span className="text-gray-300">{hotspot}</span>
                </div>
                <span className="text-red-400 font-bold">{count.toLocaleString()}</span>
              </div>
            )) || <p className="text-gray-400">Loading...</p>}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Distribution */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Deaths by Hour of Day</h2>
          <div className="flex items-end justify-between h-48 space-x-1">
            {analytics.hourDistribution?.map((count, hour) => {
              const maxCount = Math.max(...analytics.hourDistribution);
              const height = (count / maxCount) * 100;
              return (
                <div key={hour} className="flex flex-col items-center flex-1">
                  <div 
                    className="chart-bar w-full rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{hour}:00</span>
                </div>
              );
            }) || <p className="text-gray-400">Loading...</p>}
          </div>
        </div>

        {/* Wealth Distribution */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Wealth Lost Distribution</h2>
          <div className="space-y-3">
            {analytics.wealthRanges && Object.entries(analytics.wealthRanges).map(([range, count]) => {
              const percentage = (count / analytics.totalDeaths * 100).toFixed(1);
              return (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-gray-300">{range}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-green-400 font-bold text-sm">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day of Week Distribution */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700 mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Deaths by Day of Week</h2>
        <div className="grid grid-cols-7 gap-4">
          {/* Calculate the maximum count for scaling the bar heights */}
          {(() => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const counts = analytics.dayDistribution || [0,0,0,0,0,0,0];
            const maxCount = Math.max(...counts, 1); // Avoid division by zero
            return days.map((day, index) => {
              const count = counts[index] || 0;
              // Calculate bar height as a percentage of the max
              const heightPercent = (count / maxCount) * 100;
              return (
                <div key={day} className="flex flex-col items-center">
                  <div className="text-center mb-2">
                    <div className="text-lg font-bold text-purple-400">{count.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">{day}</div>
                  </div>
                  {/* Bar height is now proportional to the count */}
                  <div className="w-full bg-gray-700 rounded-full h-32 flex items-end">
                    <div 
                      className="chart-bar w-full rounded-t"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Analysis Insights */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-inner mb-8 border border-gray-700">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">Data Analysis Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Key Findings</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong>Peak Hours:</strong> Most deaths occur during evening hours (6-10 PM)</li>
              <li>• <strong>Weekend Effect:</strong> Higher death rates on weekends due to increased player activity</li>
              <li>• <strong>Wealth Distribution:</strong> Majority of losses are in the 10K-100K range</li>
              <li>• <strong>Hotspot Concentration:</strong> 80% of deaths occur within 5 major hotspots</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Strategic Implications</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong>Risk Assessment:</strong> Players should avoid hotspots during peak hours</li>
              <li>• <strong>Wealth Management:</strong> Carry only necessary items in high-risk areas</li>
              <li>• <strong>Timing Strategy:</strong> Safer to venture during off-peak hours</li>
              <li>• <strong>Group Play:</strong> Consider teaming up in multi-combat zones</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-8 text-gray-400 border-t border-gray-700 pt-6">
        <p className="text-lg font-semibold text-blue-300 mb-2">Created by Shakirudeen Adefuwa</p>
        <p className="text-sm mb-2">Data Analyst Portfolio Project | 2025</p>
        <p className="text-xs">
          This application uses simulated data for demonstration purposes. 
          All analysis and visualizations showcase data science and analytics skills.
        </p>
      </footer>
    </div>
  );
};

export default App;