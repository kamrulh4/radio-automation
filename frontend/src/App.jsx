import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Radio, Settings, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getVoices, listStations } from './api';
import TTSPanel from './components/TTSPanel';
import DownloadPanel from './components/DownloadPanel';
import FileList from './components/FileList';
import AdminPanel from './components/AdminPanel';

function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [station, setStation] = useState('');
  const [stations, setStations] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const loadUserData = async (currentToken) => {
    try {
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      const stationsRes = await api.get('/stations/');
      let availableStations = stationsRes.data;
      
      // Filter for DJs
      if (userRes.data.role === 'dj' && userRes.data.assigned_station_id) {
        availableStations = availableStations.filter(s => s.id === userRes.data.assigned_station_id);
      }
      
      setStations(availableStations);
      if (availableStations.length > 0) {
        setStation(availableStations[0].name);
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData);
      const access_token = res.data.access_token;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setError('');
    } catch (err) {
      setError(t('error') || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setStations([]);
    setStation('');
    setActiveTab('dashboard');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 w-full max-w-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl mb-4">
              <ShieldCheck className="text-primary" size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('app_title')}</h1>
            <p className="text-dim mt-2 text-center">Dashboard Access Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="input-field text-center text-lg"
                placeholder="Username"
                required 
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-center text-lg tracking-widest"
                placeholder="••••••••"
                required 
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
              {loading ? '...' : t('login')}
            </button>
          </form>

          <button onClick={toggleLanguage} className="mt-8 nav-pill w-full justify-center">
            <Globe size={16} className="text-primary" /> {i18n.language === 'it' ? 'English Language' : 'Lingua Italiana'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg-dark/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Radio className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">{t('app_title')}</h1>
              <span className="text-[10px] text-dim font-semibold uppercase tracking-widest">
                Welcome, {user.username}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {user.role === 'admin' && (
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-dim hover:text-white'}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'admin' ? 'bg-primary text-white' : 'text-dim hover:text-white'}`}
                >
                  <Settings size={16} /> Admin
                </button>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="nav-pill hidden md:flex">
                <span className="text-[10px] font-bold text-dim uppercase tracking-tighter">Station</span>
                <select 
                  value={station} 
                  onChange={(e) => setStation(e.target.value)}
                  className="nav-select"
                  disabled={stations.length <= 1}
                >
                  {stations.map(s => <option key={s.id} value={s.name}>{s.display_name}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <button onClick={toggleLanguage} className="nav-pill">
                <Globe size={18} className="text-primary" />
                <span className="text-xs font-bold hidden sm:inline">{i18n.language === 'it' ? 'English' : 'Italiano'}</span>
              </button>
              <button onClick={handleLogout} className="nav-icon-btn red" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -20, opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-7 space-y-8">
                <TTSPanel station={station} onGenerateSuccess={() => setRefreshKey(prev => prev + 1)} />
                <DownloadPanel station={station} onDownloadSuccess={() => setRefreshKey(prev => prev + 1)} />
              </div>
              <div className="lg:col-span-5">
                <FileList station={station} key={refreshKey} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="admin"
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -20, opacity: 0 }}
            >
              <AdminPanel token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
