import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Play, FileAudio, ExternalLink, RefreshCw } from 'lucide-react';
import { listFiles, uploadFile } from '../api';

const FileList = ({ station }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
    try {
      await uploadFile(station, file);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass p-6 space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileAudio className="text-primary" /> {t('recent_files')}
        </h2>
        <button onClick={fetchFiles} className="p-1 hover:bg-slate-700 rounded-full text-dim hover:text-white">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[400px]">
        {files.length === 0 && !loading && (
          <p className="text-dim text-center py-10 italic">No files found</p>
        )}
        {files.map(file => (
          <div key={file.name} className="flex items-center justify-between p-3 rounded-md bg-bg-card border border-border group">
            <div className="truncate pr-4">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-[10px] text-dim">{new Date(file.modified).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={`http://localhost:8000${file.url}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-1.5 hover:bg-slate-600 rounded text-primary"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-card border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-dim hover:text-primary">
          <Upload size={20} />
          <span className="text-sm font-medium">{t('upload')}</span>
          <input type="file" className="hidden" onChange={handleUpload} accept="audio/*" />
        </label>
      </div>
    </div>
  );
};

export default FileList;
