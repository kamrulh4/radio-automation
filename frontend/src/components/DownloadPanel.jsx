import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CloudRain, Newspaper, Car } from 'lucide-react';
import { triggerDownload } from '../api';

const DownloadPanel = ({ station }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState('');

  const handleTrigger = async (type) => {
    setLoading(type);
    setMessage('');
    try {
      await triggerDownload(type, station);
      setMessage(`${t('success')}: ${type}`);
    } catch (err) {
      setMessage(t('error'));
    } finally {
      setLoading(null);
    }
  };

  const types = [
    { id: 'meteo', icon: <CloudRain />, label: t('trigger_meteo') },
    { id: 'news', icon: <Newspaper />, label: t('trigger_news') },
    { id: 'traffic', icon: <Car />, label: t('trigger_traffic') },
  ];

  return (
    <div className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Download className="text-primary" /> {t('downloads_title')}
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => handleTrigger(type.id)}
            disabled={loading === type.id}
            className="flex items-center justify-between p-3 rounded-md bg-bg-card hover:bg-slate-700 transition-colors border border-border disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary">{type.icon}</span>
              <span>{type.label}</span>
            </div>
            {loading === type.id && <span className="text-xs animate-pulse">Running...</span>}
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-green-400">{message}</p>}
    </div>
  );
};

export default DownloadPanel;
