import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVoices, getUsage, generateTTS } from '../api';

const TTSPanel = ({ station }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState('');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [voicesRes, usageRes] = await Promise.all([getVoices(), getUsage()]);
      setVoices(voicesRes.data);
      if (voicesRes.data.length > 0 && !voice) setVoice(voicesRes.data[0].name);
      setUsage(usageRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      await generateTTS({ text, voice_name: voice, station });
      setStatus({ type: 'success', msg: t('success') });
      setText('');
      loadData();
    } catch (err) {
      setStatus({ type: 'error', msg: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const usagePercent = usage ? (usage.character_count / usage.character_limit) * 100 : 0;

  return (
    <div className="glass-card p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Mic size={24} />
          </div>
          {t('tts_title')}
        </h2>
        
        {usage && (
          <div className="w-48 text-right">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1 gap-2">
              <span className="text-dim whitespace-nowrap">ElevenLabs Usage</span>
              <span className={usagePercent > 80 ? 'text-red-400' : 'text-indigo-400'}>
                {Math.round(usagePercent)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className={`h-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
              />
            </div>
            <p className="text-[10px] text-dim mt-1 text-right">
              {usage.character_count.toLocaleString()} / {usage.character_limit.toLocaleString()} chars
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="label">Select Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="input-field">
              {voices.map(v => <option key={v.voice_id} value={v.name} className="bg-slate-900">{v.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">{t('text_input')}</label>
          <div className="relative">
            <textarea 
              rows="5" 
              className="input-field scrollbar-hide focus:ring-primary/30"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste script here..."
              required
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-dim/50 uppercase">
              {text.length} Characters
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            type="submit" 
            disabled={loading || !text}
            className="btn-primary py-4 text-lg"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <Sparkles size={20} />
                {t('generate')}
              </>
            )}
          </button>
          
          <AnimatePresence>
            {status.msg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {status.type === 'success' ? <Sparkles size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-semibold">{status.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default TTSPanel;
