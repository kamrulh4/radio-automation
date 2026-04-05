import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CloudRain, Newspaper, Car, CheckCircle2, XCircle, RotateCw, Mic2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerDownload, getStationSources, triggerSource } from '../api';

const DownloadPanel = ({ station, stationId, onDownloadSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [dynamicSources, setDynamicSources] = useState([]);

  useEffect(() => {
    if (stationId) {
      fetchDynamicSources();
    }
  }, [stationId]);

  const fetchDynamicSources = async () => {
    try {
      const res = await getStationSources(stationId);
      setDynamicSources(res.data);
    } catch (err) {
      console.error("Failed to fetch dynamic sources:", err);
    }
  };

  const handleTrigger = async (type, isDynamic = false, sourceId = null) => {
    const triggerId = isDynamic ? `dynamic-${sourceId}` : type;
    setLoading(triggerId);
    try {
      let res;
      if (isDynamic) {
        res = await triggerSource(sourceId);
      } else {
        res = await triggerDownload(type, station);
      }

      if (res.data.status === 'success') {
        setResults(prev => ({ ...prev, [triggerId]: 'success' }));
        if (onDownloadSuccess) onDownloadSuccess();
      } else {
        setResults(prev => ({ ...prev, [triggerId]: 'error' }));
      }
      setTimeout(() => setResults(prev => ({ ...prev, [triggerId]: null })), 5000);
    } catch (err) {
      setResults(prev => ({ ...prev, [triggerId]: 'error' }));
    } finally {
      setLoading(null);
    }
  };

  const legacyTypes = [
    { id: 'meteo', icon: <CloudRain size={20} />, label: t('trigger_meteo'), color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'news', icon: <Newspaper size={20} />, label: t('trigger_news'), color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'traffic', icon: <Car size={20} />, label: t('trigger_traffic'), color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
          <Download size={20} />
        </div>
        {t('downloads_title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Legacy Sources */}
        {legacyTypes.map(type => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={type.id}
            onClick={() => handleTrigger(type.id)}
            disabled={loading === type.id}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all relative overflow-hidden h-full min-h-[100px] ${
              results[type.id] === 'success' 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : results[type.id] === 'error'
                ? 'border-red-500/50 bg-red-500/5'
                : 'border-border bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg mb-2 ${type.bg} ${type.color}`}>
              {loading === type.id ? <RotateCw className="animate-spin" size={20} /> : type.icon}
            </div>
            <span className="text-xs font-bold tracking-tight text-center leading-tight">
              {type.label}
            </span>

            {results[type.id] === 'success' && (
              <div className="absolute top-2 right-2 text-emerald-500">
                <CheckCircle2 size={14} />
              </div>
            )}
            {results[type.id] === 'error' && (
              <div className="absolute top-2 right-2 text-red-400">
                <XCircle size={14} />
              </div>
            )}
          </motion.button>
        ))}

        {/* Dynamic Sources */}
        {dynamicSources.map(source => {
          const triggerId = `dynamic-${source.id}`;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={triggerId}
              onClick={() => handleTrigger(null, true, source.id)}
              disabled={loading === triggerId}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all relative overflow-hidden h-full min-h-[100px] ${
                results[triggerId] === 'success' 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : results[triggerId] === 'error'
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${source.is_ai_mode ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {loading === triggerId ? <RotateCw className="animate-spin" size={20} /> : <Mic2 size={20} />}
              </div>
              <span className="text-xs font-bold tracking-tight text-center leading-tight">
                {source.name}
              </span>

              {results[triggerId] === 'success' && (
                <div className="absolute top-2 right-2 text-emerald-500">
                  <CheckCircle2 size={14} />
                </div>
              )}
              {results[triggerId] === 'error' && (
                <div className="absolute top-2 right-2 text-red-400">
                  <XCircle size={14} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DownloadPanel;
