import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Radio, Settings, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login as apiLogin } from './api';
import TTSPanel from './components/TTSPanel';
import DownloadPanel from './components/DownloadPanel';
import FileList from './components/FileList';

function App() {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [station, setStation] = useState('Radio_Garda');
  const [stations] = useState(['Radio_Garda', 'Radio_105']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiLogin('admin', password);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'it' ? 'en' : 'it');
  };

  if (!isLoggedIn) {
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
              <label className="label">{t('password')}</label>
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

          <button onClick={toggleLanguage} className="mt-8 w-full flex items-center justify-center gap-2 text-dim hover:text-white transition-colors">
            <Globe size={16} /> {i18n.language === 'it' ? 'English Language' : 'Lingua Italiana'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg-dark/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Radio className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">{t('app_title')}</h1>
              <span className="text-[10px] text-dim font-semibold uppercase tracking-widest">Control Center v1.0</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-border">
              <span className="text-xs font-bold text-dim uppercase tracking-tighter">Station</span>
              <select 
                value={station} 
                onChange={(e) => setStation(e.target.value)}
                className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-sm outline-none"
              >
                {stations.map(s => <option key={s} value={s} className="bg-slate-900">{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-6">
              <button onClick={toggleLanguage} className="p-2 hover:bg-white/5 rounded-xl transition-colors relative group">
                <Globe size={20} className="text-dim group-hover:text-white" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                  {i18n.language === 'it' ? 'English' : 'Italiano'}
                </span>
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <TTSPanel station={station} />
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <DownloadPanel station={station} />
          </motion.div>
        </div>
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <FileList station={station} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
