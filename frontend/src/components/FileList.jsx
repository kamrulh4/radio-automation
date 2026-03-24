import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileAudio, ExternalLink, RefreshCw, Clock, HardDrive, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listFiles, uploadFile } from '../api';

const FileList = ({ station }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await listFiles(station);
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [station]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(station, file);
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card flex flex-col max-h-[85vh]">
      <div className="py-4 px-6 border-b border-border bg-white/5 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
            <HardDrive size={20} />
          </div>
          {t('recent_files')}
        </h2>
        <button 
          onClick={fetchFiles} 
          disabled={loading}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          title={t('refresh_files')}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
        {files.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-dim">
            <FileAudio size={48} className="opacity-20 mb-4" />
            <p className="italic font-medium">No audio files found for this station</p>
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {files.map((file, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={file.name} 
              className="flex items-center justify-between py-2 px-4 rounded-xl bg-white/5 border border-border group hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-800 rounded-xl text-dim group-hover:text-primary transition-colors">
                  <Play size={14} />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{file.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-dim font-bold uppercase overflow-hidden">
                      <Clock size={10} /> {new Date(file.modified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-dim font-bold uppercase">•</span>
                    <span className="text-[10px] text-dim font-bold uppercase">{formatSize(file.size)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={`http://localhost:8000${file.url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                  title="Open Public Link"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white/5 border-t border-border">
        <label className={`w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          uploading ? 'opacity-50 cursor-wait' : 'border-border hover:border-primary/50 hover:bg-primary/5 text-dim hover:text-primary'
        }`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin" />
              <span className="text-xs font-bold uppercase">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white/5 rounded-full mb-1">
                <Upload size={24} />
              </div>
              <span className="text-sm font-bold">{t('upload')}</span>
              <span className="text-[10px] uppercase tracking-widest opacity-60">MP3, WAV, M4A up to 50MB</span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleUpload} accept="audio/*" disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

export default FileList;
