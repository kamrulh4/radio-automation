import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Send, BarChart3 } from 'lucide-react';
import { getVoices, getUsage, generateTTS } from '../api';

const TTSPanel = ({ station }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState('');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [voicesRes, usageRes] = await Promise.all([getVoices(), getUsage()]);
      setVoices(voicesRes.data);
      if (voicesRes.data.length > 0) setVoice(voicesRes.data[0].name);
      setUsage(usageRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await generateTTS({ text, voice_name: voice, station });
      setMessage(t('success'));
      setText('');
      loadData(); // Refresh usage
    } catch (err) {
      setMessage(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Mic className="text-primary" /> {t('tts_title')}
        </h2>
        {usage && (
          <div className="text-xs text-dim text-right">
            <p>{t('quota')}: {usage.character_count} / {usage.character_limit}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dim mb-1">{t('voice')}</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full">
              {voices.map(v => <option key={v.voice_id} value={v.name}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-dim mb-1">{t('text_input')}</label>
          <textarea 
            rows="4" 
            className="w-full resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark py-2 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} /> {loading ? '...' : t('generate')}
        </button>
        {message && <p className={`text-sm ${message === t('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
      </form>
    </div>
  );
};

export default TTSPanel;
