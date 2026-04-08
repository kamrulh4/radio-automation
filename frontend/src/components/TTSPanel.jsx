import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Send, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVoices, getUsage, generateTTS, generateAIText } from '../api';

const TTSPanel = ({ station, onGenerateSuccess }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState('');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);
  const [targetFilename, setTargetFilename] = useState('');
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

  const handleGenerateText = async () => {
    if (!aiPrompt) return;
    setGeneratingText(true);
    setStatus({ type: '', msg: '' });
    try {
      const res = await generateAIText(aiPrompt);
      setText(res.data.text);
      setAiPrompt('');
      setStatus({ type: 'success', msg: t('success') });
    } catch (err) {
      console.error("AI Generation Error:", err);
      const msg = err.response?.data?.detail || err.message || t('error');
      setStatus({ type: 'error', msg: msg });
    } finally {
      setGeneratingText(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      await generateTTS({ 
        text, 
        voice_name: voice, 
        station,
        filename: targetFilename || null 
      });
      setStatus({ type: 'success', msg: t('success') });
      setText('');
      setTargetFilename('');
       // Refresh usage
      const usageRes = await getUsage();
      setUsage(usageRes.data);
      if (onGenerateSuccess) onGenerateSuccess();
    } catch (err) {
      console.error("TTS Error:", err);
      const msg = err.response?.data?.detail || err.message || t('error');
      setStatus({ type: 'error', msg: msg });
    } finally {
      setLoading(false);
    }
  };

  const usagePercent = usage ? (usage.character_count / usage.character_limit) * 100 : 0;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Mic size={20} />
          </div>
          {t('tts_title')}
        </h2>

        {usage && (
          <div className="w-48 text-right">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1 gap-2">
              <span className="text-dim whitespace-nowrap">ElevenLabs Usage</span>
              <span className={usagePercent > 80 ? 'text-red-600' : 'text-indigo-600'}>
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

      <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wand2 size={40} className="text-primary" />
        </div>
        <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">
            🚀 {t('ai_assistant')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
            <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t('ai_prompt_placeholder')}
                className="input-field flex-1 bg-white/5 border-white/10"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateText()}
            />
            <button 
                onClick={handleGenerateText}
                disabled={generatingText || !aiPrompt}
                className="btn-primary py-2 px-6 text-sm"
            >
                {generatingText ? '...' : t('generate_text')}
            </button>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label">Select Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="input-field">
              {voices.map(v => <option key={v.voice_id} value={v.name} className="bg-slate-900">{v.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="label">{t('target_filename')}</label>
            <input 
              type="text" 
              value={targetFilename} 
              onChange={(e) => setTargetFilename(e.target.value)} 
              placeholder={t('target_filename_hint')}
              className="input-field"
            />
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
                className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
