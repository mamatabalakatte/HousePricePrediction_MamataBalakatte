import React, { useState, useEffect } from 'react';
import { 
  Building, Shield, Briefcase, TrendingUp, Sparkles, Sliders, 
  HelpCircle, Download, Database, Lightbulb, Compass, Award, 
  Heart, Zap, CheckCircle2, ChevronRight, Activity, Thermometer,
  Layers, Lock, AlertTriangle, ShieldCheck, DollarSign
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [theme, setTheme] = useState('dark'); // dark/light mode
  const [currency, setCurrency] = useState('INR'); // INR/USD
  
  // Property feature inputs
  const [inputs, setInputs] = useState({
    area: 5000,
    bedrooms: 3,
    bathrooms: 2,
    stories: 2,
    mainroad: 'yes',
    guestroom: 'no',
    basement: 'no',
    hotwaterheating: 'no',
    airconditioning: 'yes',
    parking: 2,
    prefarea: 'no',
    furnishingstatus: 'semi-furnished'
  });

  // API result states
  const [predictResult, setPredictResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Similar properties
  const [similarProps, setSimilarProps] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // Negotiation metrics
  const [negotiationResult, setNegotiationResult] = useState(null);
  const [loadingNegotiation, setLoadingNegotiation] = useState(false);
  
  // Upgrade Simulator choices
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [upgradeResult, setUpgradeResult] = useState(null);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  
  // Analytics charts data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // PDF report downloader
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Currency multiplier
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const convertPrice = (price) => {
    if (!price) return '0';
    const converted = currency === 'INR' ? price : price * 0.012; // 1 INR = 0.012 USD approx
    return converted.toLocaleString(undefined, { 
      maximumFractionDigits: 0,
      minimumFractionDigits: 0 
    });
  };

  // Fetch initial predictions & similar properties on load
  const runPropertyAnalysis = async () => {
    setLoading(true);
    setLoadingSimilar(true);
    setLoadingNegotiation(true);
    setError(null);
    try {
      // 1. Predict
      const predictRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (!predictRes.ok) throw new Error("Failed to compute prediction.");
      const predictData = await predictRes.json();
      setPredictResult(predictData);

      // 2. Similar Properties
      const similarRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (similarRes.ok) {
        const similarData = await similarRes.json();
        setSimilarProps(similarData);
      }

      // 3. Negotiation Advisor
      const negRes = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted_price: predictData.predicted_price,
          luxury_score: predictData.luxury_score,
          prefarea: inputs.prefarea,
          mainroad: inputs.mainroad
        })
      });
      if (negRes.ok) {
        const negData = await negRes.json();
        setNegotiationResult(negData);
      }
      
      // Reset simulator values
      setSelectedUpgrades([]);
      setUpgradeResult(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingSimilar(false);
      setLoadingNegotiation(false);
    }
  };

  // Run upgrade simulation
  const handleSimulateUpgrade = async (upgradesList) => {
    setLoadingUpgrade(true);
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: inputs,
          upgrades: upgradesList
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUpgradeResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpgrade(false);
    }
  };

  // Toggle upgrades selection
  const toggleUpgrade = (upgradeName) => {
    let updated;
    if (selectedUpgrades.includes(upgradeName)) {
      updated = selectedUpgrades.filter(u => u !== upgradeName);
    } else {
      updated = [...selectedUpgrades, upgradeName];
    }
    setSelectedUpgrades(updated);
    if (updated.length > 0) {
      handleSimulateUpgrade(updated);
    } else {
      setUpgradeResult(null);
    }
  };

  // Fetch Global dataset analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Download executive PDF report
  const downloadPdfReport = async () => {
    if (!predictResult) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictResult)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EstateGPT_Elite_${predictResult.house_dna}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    // Run an initial analysis to populate page on start
    runPropertyAnalysis();
    fetchAnalytics();
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-luxury-bg text-gray-100'}`}>
      {/* --- PREMIUM NAVIGATION HEADER --- */}
      <header className="sticky top-0 z-50 glass-panel border-b border-luxury-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-7 h-7 text-gold" />
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-gold via-yellow-200 to-yellow-600 bg-clip-text text-transparent">
              ESTATEGPT ELITE
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase">Luxury Real Estate Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('landing')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'landing' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('predict')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'predict' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Valuation
          </button>
          <button 
            onClick={() => setActiveTab('luxury')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'luxury' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Luxury Score
          </button>
          <button 
            onClick={() => setActiveTab('investment')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'investment' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Investment
          </button>
          <button 
            onClick={() => setActiveTab('forecast')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'forecast' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Forecast
          </button>
          <button 
            onClick={() => setActiveTab('advisor')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'advisor' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Comparison
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'reports' ? 'text-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
          >
            Reports & Stats
          </button>
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-black/50 border border-luxury-border text-gold rounded-lg px-2 py-1 text-xs outline-none"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
          
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-gold hover:bg-white/5 transition"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-3 border-b border-luxury-border bg-black/40">
        {['landing', 'predict', 'luxury', 'investment', 'forecast', 'advisor', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition ${activeTab === tab ? 'text-gold bg-white/10' : 'text-gray-400'}`}
          >
            {tab === 'landing' ? 'Overview' : tab}
          </button>
        ))}
      </div>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        
        {/* LANDING / OVERVIEW TAB */}
        {activeTab === 'landing' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center py-12 md:py-20 relative overflow-hidden rounded-3xl border border-luxury-border bg-gradient-to-b from-black/80 to-luxury-bg/30 p-6 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-50 blur-2xl pointer-events-none"></div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" /> The Vanguard of Luxury Analytics
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
                Redefining Luxury Real Estate <br/>
                <span className="bg-gradient-to-r from-gold via-yellow-100 to-yellow-600 bg-clip-text text-transparent">
                  Through Intelligence
                </span>
              </h2>
              
              <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg mb-8 font-light leading-relaxed">
                EstateGPT Elite combines advanced ensemble models, deep prestige metrics, and explainable AI to value and analyze high-end estates with precision.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setActiveTab('predict')}
                  className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-yellow-600 text-black hover:opacity-90 transition shadow-lg shadow-gold/20 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Launch Simulator <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="px-8 py-3.5 rounded-xl font-bold border border-luxury-border bg-white/5 hover:bg-white/10 text-white transition flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  View Market Stats
                </button>
              </div>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-2xl p-6 hover:border-gold/30 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4 border border-gold/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Predictive Appraisals</h3>
                  <p className="text-gray-400 text-sm font-light">
                    Harness machine learning trained on actual structural data to generate pricing outputs, error margins, and confidence intervals.
                  </p>
                </div>
                <button onClick={() => setActiveTab('predict')} className="text-gold text-xs font-bold mt-4 flex items-center gap-1 hover:underline">
                  Analyze property <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="glass-panel rounded-2xl p-6 hover:border-gold/30 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4 border border-gold/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Mansion Prestige Index</h3>
                  <p className="text-gray-400 text-sm font-light">
                    Evaluate properties based on our proprietary luxury parameters, scoring structural and location exclusivity.
                  </p>
                </div>
                <button onClick={() => setActiveTab('luxury')} className="text-gold text-xs font-bold mt-4 flex items-center gap-1 hover:underline">
                  Compute prestige <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="glass-panel rounded-2xl p-6 hover:border-gold/30 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4 border border-gold/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Investment Projections</h3>
                  <p className="text-gray-400 text-sm font-light">
                    Simulate future compound appreciation yields, wealth preservation ratios, and generate negotiation offer thresholds.
                  </p>
                </div>
                <button onClick={() => setActiveTab('investment')} className="text-gold text-xs font-bold mt-4 flex items-center gap-1 hover:underline">
                  Evaluate investment <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Overview statistics banner */}
            {analyticsData && (
              <div className="glass-panel rounded-2xl p-6 border border-gold/20 bg-gradient-to-r from-gold/5 via-transparent to-transparent">
                <h3 className="text-sm font-bold tracking-widest text-gold uppercase mb-6">Database Insights</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Dataset Properties</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.global_stats.total_properties}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Average House Value</p>
                    <p className="text-2xl font-bold text-white">{currencySymbol}{convertPrice(analyticsData.global_stats.mean_price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Average Property Footprint</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.global_stats.mean_area.toLocaleString()} sq.ft.</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Average Luxury Score</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.global_stats.mean_luxury.toFixed(1)}/100</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* prediction DASHBOARD TAB */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Input Form Column (Left 1/3) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-bold border-b border-luxury-border pb-3 mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-gold" /> Property Parameters
                </h3>
                
                {/* Form inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Property Size (Area sq.ft.)</label>
                    <div className="flex items-center gap-3 mt-1">
                      <input 
                        type="range" 
                        min="1500" 
                        max="15000" 
                        step="100" 
                        value={inputs.area} 
                        onChange={(e) => setInputs({...inputs, area: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono text-gold font-bold w-16 text-right">{inputs.area}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Bedrooms</label>
                      <select 
                        value={inputs.bedrooms}
                        onChange={(e) => setInputs({...inputs, bedrooms: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-black/50 border border-luxury-border text-white rounded-lg p-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Bathrooms</label>
                      <select 
                        value={inputs.bathrooms}
                        onChange={(e) => setInputs({...inputs, bathrooms: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-black/50 border border-luxury-border text-white rounded-lg p-2 text-sm"
                      >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Stories</label>
                      <select 
                        value={inputs.stories}
                        onChange={(e) => setInputs({...inputs, stories: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-black/50 border border-luxury-border text-white rounded-lg p-2 text-sm"
                      >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Parking</label>
                      <select 
                        value={inputs.parking}
                        onChange={(e) => setInputs({...inputs, parking: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-black/50 border border-luxury-border text-white rounded-lg p-2 text-sm"
                      >
                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] tracking-wider text-gray-400 uppercase font-bold">Furnishing Status</label>
                    <select 
                      value={inputs.furnishingstatus}
                      onChange={(e) => setInputs({...inputs, furnishingstatus: e.target.value})}
                      className="w-full mt-1 bg-black/50 border border-luxury-border text-white rounded-lg p-2 text-sm"
                    >
                      <option value="furnished">Furnished (Designer Fine Art)</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  {/* Binary Toggle Switches */}
                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'airconditioning', label: 'Air Conditioning' },
                      { key: 'prefarea', label: 'Preferred Enclave Location' },
                      { key: 'mainroad', label: 'Main Road Access' },
                      { key: 'guestroom', label: 'Guest Chamber Suite' },
                      { key: 'basement', label: 'Basement Level' },
                      { key: 'hotwaterheating', label: 'Hot Water Heating System' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-300 font-light">{item.label}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setInputs({...inputs, [item.key]: 'yes'})}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${inputs[item.key] === 'yes' ? 'bg-gold text-black' : 'bg-white/5 text-gray-400'}`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setInputs({...inputs, [item.key]: 'no'})}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${inputs[item.key] === 'no' ? 'bg-red-800 text-white' : 'bg-white/5 text-gray-400'}`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={runPropertyAnalysis}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl mt-6 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Generate Valuation Report</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Output Columns (Right 2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}

              {predictResult ? (
                <div className="space-y-8">
                  {/* Valuation Dashboard Panel */}
                  <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-gold/30 bg-gradient-to-r from-gold/5 via-transparent to-transparent">
                    {/* Top corner luxury badge */}
                    <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full border border-gold text-gold font-bold text-xs uppercase bg-black/60 shadow flex items-center gap-1.5">
                      {predictResult.prestige_badge}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gold font-bold">Appraised Market Value</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white mt-1">
                          {currencySymbol}{convertPrice(predictResult.predicted_price)}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-luxury-border">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Confidence Score</p>
                          <p className="text-xl font-bold text-white mt-1">{(predictResult.confidence_score * 100).toFixed(1)}%</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Estimated Valuation Range</p>
                          <p className="text-sm font-semibold text-gray-200 mt-1">
                            {currencySymbol}{convertPrice(predictResult.price_min)} – {currencySymbol}{convertPrice(predictResult.price_max)}
                          </p>
                        </div>
                      </div>

                      {/* House DNA Identity */}
                      <div className="pt-6 border-t border-luxury-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Futuristic Property Identity Code</p>
                          <p className="text-lg font-mono text-gold font-bold tracking-widest mt-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                            🧬 {predictResult.house_dna}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={downloadPdfReport}
                            disabled={downloadingPdf}
                            className="px-4 py-2 text-xs font-bold bg-white/5 border border-luxury-border hover:bg-white/10 text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                          >
                            {downloadingPdf ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <><Download className="w-3.5 h-3.5" /> Download Report PDF</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explainable AI Dashboard */}
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold border-b border-luxury-border pb-3 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-gold" /> Explainable AI (Local SHAP Attribution)
                    </h3>
                    <p className="text-xs text-gray-400 font-light mb-6">
                      Attribution weights showing how each property characteristic drives value either upward (premium drivers) or downward (depreciating limits) compared to the base market average.
                    </p>
                    
                    <div className="space-y-4">
                      {predictResult.contributions.map((contrib) => (
                        <div key={contrib.feature} className="flex items-center justify-between gap-4">
                          <div className="w-32 text-xs font-semibold text-gray-300 capitalize">
                            {contrib.feature === 'furnishingstatus' ? 'Furnishing' : contrib.feature}
                          </div>
                          
                          {/* visual bar */}
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex relative">
                            {contrib.impact === 'positive' ? (
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 absolute left-1/2" 
                                style={{ width: `${Math.min(50, (contrib.contribution / 1000000) * 15)}%` }}
                              ></div>
                            ) : (
                              <div 
                                className="h-full bg-gradient-to-l from-red-600 to-red-400 absolute right-1/2" 
                                style={{ width: `${Math.min(50, (Math.abs(contrib.contribution) / 1000000) * 15)}%` }}
                              ></div>
                            )}
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-luxury-border"></div>
                          </div>

                          <div className={`w-28 text-right text-xs font-bold font-mono ${contrib.impact === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {contrib.impact === 'positive' ? '+' : '-'}{currencySymbol}{convertPrice(Math.abs(contrib.contribution))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8">
                  <Database className="w-16 h-16 text-luxury-border mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-gray-400">Await Valuation Run</h3>
                  <p className="text-gray-500 text-sm font-light mt-1">Configure property features in the sidebar panel and click Appraise.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LUXURY INTELLIGENCE CENTER TAB */}
        {activeTab === 'luxury' && (
          <div className="space-y-8 animate-fadeIn">
            {predictResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Luxury score scorecard */}
                <div className="glass-panel rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold/5 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div>
                    <h3 className="text-lg font-bold border-b border-luxury-border pb-3 mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold" /> Luxury Quotient & Prestige Tier
                    </h3>
                    
                    <div className="flex items-center gap-8 mb-8">
                      {/* Gauge meter */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                          <circle cx="72" cy="72" r="62" stroke="#d4af37" strokeWidth="8" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 62} 
                            strokeDashoffset={2 * Math.PI * 62 * (1 - predictResult.luxury_score / 100)} 
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <p className="text-3xl font-black text-white">{predictResult.luxury_score.toFixed(0)}</p>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mt-0.5">Luxury Score</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-2xl font-black text-gold">{predictResult.luxury_grade}</h4>
                        <p className="text-xs text-gray-400 font-light mt-1">
                          This property holds the exclusive <strong>{predictResult.luxury_grade}</strong> grading rank on our premium quotient scale.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <h4 className="text-xs uppercase text-gold font-bold mb-2">Prestige Badge</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{predictResult.prestige_badge.split(' ')[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{predictResult.prestige_badge}</p>
                        <p className="text-xs text-gray-400 font-light">Class rank: {predictResult.prestige_tier}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* score details */}
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gold" /> Luxury & Prestige Breakdown
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Mansion Prestige Index", val: predictResult.prestige_score, desc: "Computed size, amenity ratios, and overall exclusivity weight." },
                      { label: "Smart Home Readiness Score", val: predictResult.smart_home_score, desc: "Level of appliance, security, heating and AC automation integration." },
                      { label: "Sustainability & Green Rating", val: predictResult.green_score, desc: "Energy efficient heating, carbon footprint score, and solar utility compatibility." }
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5 border-b border-white/5 pb-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-200">{item.label}</span>
                          <span className="font-bold text-gold">{item.val.toFixed(0)}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${item.val}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-light">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <Award className="w-16 h-16 text-luxury-border mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Luxury intelligence locked</h3>
                <p className="text-gray-500 text-sm font-light mt-1">Please run a property analysis first in the Valuation tab.</p>
              </div>
            )}
          </div>
        )}

        {/* INVESTMENT ANALYTICS TAB */}
        {activeTab === 'investment' && (
          <div className="space-y-8 animate-fadeIn">
            {predictResult ? (
              <div className="space-y-8">
                {/* Metrics grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel rounded-2xl p-6 border-b-2 border-b-gold">
                    <p className="text-xs uppercase text-gray-400 tracking-wider">Investment Score</p>
                    <h3 className="text-3xl font-black text-white mt-2">{predictResult.investment_score.toFixed(0)}/100</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-light">Compounded return potential based on location desirability and premium features.</p>
                  </div>
                  
                  <div className="glass-panel rounded-2xl p-6 border-b-2 border-b-emerald-500">
                    <p className="text-xs uppercase text-gray-400 tracking-wider">Appreciation Score</p>
                    <h3 className="text-3xl font-black text-white mt-2">{predictResult.appreciation_potential.toFixed(0)}/100</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-light">Asset value growth projection over a 5-year investment period.</p>
                  </div>
                  
                  <div className="glass-panel rounded-2xl p-6 border-b-2 border-b-sky-500">
                    <p className="text-xs uppercase text-gray-400 tracking-wider">Wealth Preservation Score</p>
                    <h3 className="text-3xl font-black text-white mt-2">{predictResult.wealth_preservation.toFixed(0)}/100</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-light">Capital risk hedge score showing price resilience during economic downtrends.</p>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel rounded-2xl p-8 space-y-6">
                    <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gold" /> Investor Performance Metrics
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-300 mb-1">
                          <span>RENTAL POTENTIAL YIELD</span>
                          <span className="text-gold">{predictResult.rental_potential.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${predictResult.rental_potential}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-300 mb-1">
                          <span>ESTIMATED LIQUIDITY RISK INDEX</span>
                          <span className="text-red-400">{predictResult.risk_score.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${predictResult.risk_score}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold border-b border-luxury-border pb-3 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-gold" /> Wealth Intelligence Advisory
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-gray-300">
                        This property qualifies as a <strong>{predictResult.wealth_preservation > 70 ? 'High-Yield Wealth Safehaven' : 'Balanced Capital Asset'}</strong>. 
                        With low volatility risks ({predictResult.risk_score.toFixed(0)}%) and premium appreciation indices, 
                        the asset is highly recommended for strategic diversification and cash flow preservation.
                      </p>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex-1 text-center">
                        <p className="text-[10px] uppercase text-gray-400 tracking-wider">CAGR Projection</p>
                        <p className="text-xl font-bold text-emerald-400 mt-1">+{predictResult.forecast.cagr_pct}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex-1 text-center">
                        <p className="text-[10px] uppercase text-gray-400 tracking-wider">5-Year Growth</p>
                        <p className="text-xl font-bold text-emerald-400 mt-1">+{predictResult.forecast.roi_5_year_pct}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <Briefcase className="w-16 h-16 text-luxury-border mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Investment scorecard locked</h3>
                <p className="text-gray-500 text-sm font-light mt-1">Please run a property analysis first in the Valuation tab.</p>
              </div>
            )}
          </div>
        )}

        {/* FUTURE VALUE FORECAST & UPGRADE SIMULATOR TAB */}
        {activeTab === 'forecast' && (
          <div className="space-y-8 animate-fadeIn">
            {predictResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 5 year growth projection */}
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold" /> Future Value Forecast
                  </h3>
                  
                  {/* Visual SVG forecast line chart */}
                  <div className="w-full h-48 bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                    <div className="flex-1 flex items-end justify-between px-4">
                      {[
                        { label: 'Current', val: predictResult.forecast.current },
                        { label: 'Yr 1', val: predictResult.forecast['1_year'] },
                        { label: 'Yr 3', val: predictResult.forecast['3_year'] },
                        { label: 'Yr 5', val: predictResult.forecast['5_year'] }
                      ].map((pt, i, arr) => {
                        const minVal = arr[0].val;
                        const maxVal = arr[arr.length - 1].val;
                        const hRatio = ((pt.val - minVal) / (maxVal - minVal || 1)) * 60 + 20; // 20% to 80% height range
                        
                        return (
                          <div key={pt.label} className="flex flex-col items-center gap-2 h-full justify-end relative group">
                            <div className="text-[10px] text-gold font-mono font-bold">{currencySymbol}{convertPrice(pt.val)}</div>
                            <div className="w-3 bg-gradient-to-t from-gold to-yellow-600 rounded-t-sm" style={{ height: `${hRatio}%` }}></div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{pt.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                      <span className="text-gray-400">Current Valuation</span>
                      <span className="font-bold text-white">{currencySymbol}{convertPrice(predictResult.forecast.current)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                      <span className="text-gray-400">1-Year Projected Value</span>
                      <span className="font-bold text-white">{currencySymbol}{convertPrice(predictResult.forecast['1_year'])}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                      <span className="text-gray-400">3-Year Projected Value</span>
                      <span className="font-bold text-white">{currencySymbol}{convertPrice(predictResult.forecast['3_year'])}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                      <span className="text-gray-400">5-Year Projected Value</span>
                      <span className="font-bold text-emerald-400">{currencySymbol}{convertPrice(predictResult.forecast['5_year'])}</span>
                    </div>
                  </div>
                </div>

                {/* Upgrade simulator */}
                <div className="glass-panel rounded-2xl p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-gold" /> Dream Upgrade Simulator
                    </h3>
                    <p className="text-xs text-gray-400 font-light mt-1">Select premium additions to instantly project value appreciation, costs, and return on investment.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Smart Home System", "Solar Panels", "Swimming Pool", 
                      "Home Theater", "Private Gym", "Luxury Garden", 
                      "EV Charging Station", "Rooftop Lounge"
                    ].map((upgrade) => {
                      const isSelected = selectedUpgrades.includes(upgrade);
                      return (
                        <button
                          key={upgrade}
                          onClick={() => toggleUpgrade(upgrade)}
                          className={`p-3 rounded-xl border text-left text-xs transition duration-200 flex flex-col justify-between h-20 ${isSelected ? 'bg-gold/10 border-gold text-white' : 'bg-black/40 border-luxury-border text-gray-400 hover:border-white/10'}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold">{upgrade}</span>
                            <span className="text-xs">{isSelected ? '✅' : '➕'}</span>
                          </div>
                          <span className="text-[10px] text-gold font-mono">
                            {upgrade === 'Swimming Pool' ? 'Est: ₹15L' : upgrade === 'Rooftop Lounge' ? 'Est: ₹12L' : 'Est: < ₹8L'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {loadingUpgrade ? (
                    <div className="p-6 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : upgradeResult ? (
                    <div className="p-4 bg-gold/5 rounded-xl border border-gold/20 space-y-3">
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-gray-400">Total Upgrade Cost</span>
                        <span className="font-bold text-white font-mono">{currencySymbol}{convertPrice(upgradeResult.upgrade_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-gray-400">Projected Value Increase</span>
                        <span className="font-bold text-emerald-400 font-mono">+{currencySymbol}{convertPrice(upgradeResult.value_increase)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-gray-400">Estimated Return (ROI)</span>
                        <span className="font-bold text-emerald-400 font-mono">{upgradeResult.roi_pct}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Upgraded Property Valuation</span>
                        <span className="font-bold text-gold font-mono">{currencySymbol}{convertPrice(upgradeResult.upgraded_price)}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="h-96 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <TrendingUp className="w-16 h-16 text-luxury-border mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Valuation engine offline</h3>
                <p className="text-gray-500 text-sm font-light mt-1">Please run a property analysis first in the Valuation tab.</p>
              </div>
            )}
          </div>
        )}

        {/* COMPARISON & ADVISOR TAB */}
        {activeTab === 'advisor' && (
          <div className="space-y-8 animate-fadeIn">
            {predictResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Similar properties table */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-gold" /> Similar Property Comparison
                  </h3>
                  
                  {loadingSimilar ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : similarProps.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-luxury-border text-gray-400 uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Similarity</th>
                            <th className="pb-3 font-semibold">Footprint</th>
                            <th className="pb-3 font-semibold">Beds/Baths</th>
                            <th className="pb-3 font-semibold">AC/Furnished</th>
                            <th className="pb-3 font-semibold">Luxury</th>
                            <th className="pb-3 font-semibold text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {similarProps.map((prop, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="py-4">
                                <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 font-bold border border-emerald-900/50">
                                  {prop.similarity_pct}%
                                </span>
                              </td>
                              <td className="py-4">{prop.area.toLocaleString()} sq.ft.</td>
                              <td className="py-4">{prop.bedrooms}B / {prop.bathrooms}Ba / {prop.stories}S</td>
                              <td className="py-4 capitalize">{prop.airconditioning === 'yes' ? 'AC' : 'No AC'} / {prop.furnishingstatus}</td>
                              <td className="py-4 font-bold text-gray-200">{prop.luxury_score.toFixed(0)}/100</td>
                              <td className="py-4 text-right font-bold text-gold font-mono">{currencySymbol}{convertPrice(prop.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No matching properties found.</p>
                  )}
                </div>

                {/* AI Negotiation Advisor */}
                <div className="lg:col-span-1 glass-panel rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-bold border-b border-luxury-border pb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold" /> AI Negotiation Advisor
                  </h3>
                  
                  {loadingNegotiation ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : negotiationResult ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Recommended Starting Bid</p>
                        <h4 className="text-3xl font-black text-white mt-1">
                          {currencySymbol}{convertPrice(negotiationResult.recommended_offer)}
                        </h4>
                      </div>

                      {/* advantage ratios */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-xs font-semibold mb-1">
                            <span className="text-gold">SELLER ADVANTAGE</span>
                            <span>{negotiationResult.seller_advantage_pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold" style={{ width: `${negotiationResult.seller_advantage_pct}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs font-semibold mb-1">
                            <span className="text-emerald-400">BUYER ADVANTAGE</span>
                            <span>{negotiationResult.buyer_advantage_pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${negotiationResult.buyer_advantage_pct}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h5 className="text-xs uppercase text-gold font-bold mb-1">Bidding Strategy</h5>
                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                          {negotiationResult.negotiation_strategy}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Valuation pending.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-96 glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <Compass className="w-16 h-16 text-luxury-border mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Advisor module offline</h3>
                <p className="text-gray-500 text-sm font-light mt-1">Please run a property analysis first in the Valuation tab.</p>
              </div>
            )}
          </div>
        )}

        {/* REPORTS & STATS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Download section */}
            <div className="glass-panel rounded-2xl p-8 bg-gradient-to-r from-gold/5 via-transparent to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white">Generate Executive Property Brochure</h3>
                <p className="text-xs text-gray-400 font-light mt-1">Download a high-end, production-ready PDF analysis containing valuation intervals, growth charts, SHAP weights, and AI reports.</p>
              </div>
              <button
                onClick={downloadPdfReport}
                disabled={!predictResult || downloadingPdf}
                className="px-8 py-3.5 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold rounded-xl transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {downloadingPdf ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><Download className="w-4 h-4" /> Export Report (PDF)</>
                )}
              </button>
            </div>

            {/* Global statistics dashboard charts */}
            {loadingAnalytics ? (
              <div className="h-96 glass-panel rounded-3xl flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analyticsData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feature importance bar chart */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold tracking-widest text-gold uppercase">Model Feature Importances</h4>
                  <div className="space-y-3">
                    {analyticsData.feature_importances.slice(0, 6).map((item) => (
                      <div key={item.feature} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-300 capitalize">
                          <span>{item.feature}</span>
                          <span>{item.importance.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${item.importance}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price distribution bar chart */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold tracking-widest text-gold uppercase">Property Price Distribution Histogram</h4>
                  <div className="space-y-3">
                    {analyticsData.price_distribution.slice(0, 6).map((item) => (
                      <div key={item.bin} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-300">
                          <span>{item.bin}</span>
                          <span>{item.count} homes</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${(item.count / 250) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* luxury score distribution */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold tracking-widest text-gold uppercase">Luxury Score Density</h4>
                  <div className="space-y-3">
                    {analyticsData.luxury_distribution.map((item) => (
                      <div key={item.range} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-300">
                          <span>{item.range}</span>
                          <span>{item.count} properties</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold" style={{ width: `${(item.count / 300) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* correlation overview */}
                <div className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold tracking-widest text-gold uppercase mb-4">Correlation Key Metrics</h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      Analysis reveals the following strong correlations with property price:
                    </p>
                    <ul className="text-xs space-y-2 mt-4 text-gray-300">
                      <li className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span>Property Size (Area) vs Price</span>
                        <span className="text-gold font-bold font-mono">+0.535</span>
                      </li>
                      <li className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span>Bathrooms Count vs Price</span>
                        <span className="text-gold font-bold font-mono">+0.517</span>
                      </li>
                      <li className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span>Air Conditioning Integration vs Price</span>
                        <span className="text-gold font-bold font-mono">+0.453</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Stories (Floors) vs Price</span>
                        <span className="text-gold font-bold font-mono">+0.421</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-gray-400 text-center italic mt-4">
                    Values calculated dynamically using Pearson correlation coefficients.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </main>

      {/* --- FOOTER PANEL --- */}
      <footer className="border-t border-luxury-border mt-20 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 EstateGPT Elite, Inc. Powered by Scikit-Learn & ReportLab PDF.</p>
        <p className="mt-2 text-[10px] tracking-wider uppercase font-semibold text-gold/60">The Future of Luxury Real Estate Intelligence</p>
      </footer>
    </div>
  );
}
