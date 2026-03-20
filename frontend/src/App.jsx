import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Radio, Mic, Download, Upload, BarChart3 } from 'lucide-react';
import { login as apiLogin, getVoices, getUsage } from './api';
import TTSPanel from './components/TTSPanel';
import DownloadPanel from './components/DownloadPanel';
import FileList from './components/FileList';

function App() {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [station, setStation] = useState('Radio_Garda');
  const [stations, setStations] = useState(['Radio_Garda']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await apiLogin('admin', password);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError(t('error'));
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">{t('app_title')}</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-dim mb-1">{t('password')}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required 
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary-dark py-2 rounded-md font-semibold">
              {t('login')}
            </button>
          </form>
          <button onClick={toggleLanguage} className="mt-4 w-full flex items-center justify-center gap-2 text-dim hover:text-white">
            <Globe size={16} /> {i18n.language === 'it' ? 'English' : 'Italiano'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-main">
      <nav className="border-b border-border bg-bg-card p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className="text-primary" />
            <span className="font-bold text-xl">{t('app_title')}</span>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={station} 
              onChange={(e) => setStation(e.target.value)}
              className="bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              {stations.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <button onClick={toggleLanguage} className="p-2 hover:bg-slate-700 rounded-full">
              <Globe size={20} />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-700 rounded-full text-red-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TTSPanel station={station} />
          <DownloadPanel station={station} />
        </div>
        <div className="space-y-6">
          <FileList station={station} />
        </div>
      </main>
    </div>
  );
}

export default App;
