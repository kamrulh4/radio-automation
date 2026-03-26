import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Radio, Trash2, Check, X, Clock, RefreshCw, Calendar } from 'lucide-react';
import api from '../api';

const AdminPanel = ({ token }) => {
  const { t } = useTranslation();
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [sources, setSources] = useState([]);
  
  const [newStation, setNewStation] = useState({ name: '', display_name: '', is_active: true });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'dj', assigned_station_id: '' });
  const [newSource, setNewSource] = useState({ 
    name: '', 
    url: '', 
    username: '', 
    password: '', 
    output_filename: '', 
    station_id: '',
    schedule_minute: '0',
    schedule_hour: '*',
    schedule_day_of_week: '*',
    max_retries: 3
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [stationRes, userRes, sourceRes] = await Promise.all([
        api.get('/stations/'),
        api.get('/users/'),
        api.get('/sources/')
      ]);
      setStations(stationRes.data);
      setUsers(userRes.data);
      setSources(sourceRes.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load admin data.' });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stations/', newStation);
      showMessage('success', 'Station created successfully!');
      setNewStation({ name: '', display_name: '', is_active: true });
      fetchData();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to create station');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newUser, assigned_station_id: newUser.assigned_station_id ? parseInt(newUser.assigned_station_id) : null };
      await api.post('/users/', payload);
      showMessage('success', 'User created successfully!');
      setNewUser({ username: '', password: '', role: 'dj', assigned_station_id: '' });
      fetchData();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...newSource, 
        station_id: parseInt(newSource.station_id),
        max_retries: parseInt(newSource.max_retries)
      };
      await api.post('/sources/', payload);
      showMessage('success', t('success'));
      setNewSource({ 
        name: '', url: '', username: '', password: '', output_filename: '', station_id: '',
        schedule_minute: '0', schedule_hour: '*', schedule_day_of_week: '*', max_retries: 3
      });
      fetchData();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || t('error'));
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/sources/${id}`);
      showMessage('success', t('success'));
      fetchData();
    } catch (err) {
      showMessage('error', t('error'));
    }
  };

  const handleTriggerSource = async (id) => {
    try {
      await api.post(`/sources/${id}/trigger`);
      showMessage('success', t('success'));
    } catch (err) {
      showMessage('error', t('error'));
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {message.text && (
        <div className={`p-4 rounded-xl backdrop-blur-md border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stations Management */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="text-primary" />
            <h2 className="text-xl font-semibold">Radio Stations</h2>
          </div>
          
          <form onSubmit={handleCreateStation} className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="System Name (e.g., Radio_105)"
              value={newStation.name}
              onChange={e => setNewStation({...newStation, name: e.target.value})}
              className="input-field w-full"
              required
            />
            <input
              type="text"
              placeholder="Display Name (e.g., Radio 105)"
              value={newStation.display_name}
              onChange={e => setNewStation({...newStation, display_name: e.target.value})}
              className="input-field w-full"
              required
            />
            <button type="submit" className="btn-primary w-full justify-center">
              Add Station
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-dim mb-3">Active Stations</h3>
            {stations.map(station => (
              <div key={station.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <div className="font-medium">{station.display_name}</div>
                  <div className="text-xs text-dim font-mono">{station.name}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${station.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {station.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Management */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-primary" />
            <h2 className="text-xl font-semibold">User Accounts</h2>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="input-field w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="input-field w-full"
              required
            />
            <select
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value})}
              className="input-field w-full"
            >
              <option value="dj">DJ (Restricted)</option>
              <option value="admin">Administrator</option>
            </select>
            {newUser.role === 'dj' && (
              <select
                value={newUser.assigned_station_id}
                onChange={e => setNewUser({...newUser, assigned_station_id: e.target.value})}
                className="input-field w-full"
                required
              >
                <option value="">Select Assigned Station...</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.display_name}</option>
                ))}
              </select>
            )}
            <button type="submit" className="btn-primary w-full justify-center">
              Create User
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-dim mb-3">System Users</h3>
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {user.username}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {user.role}
                    </span>
                  </div>
                  {user.role === 'dj' && (
                    <div className="text-xs text-dim mt-1">
                      Station: {stations.find(s => s.id === user.assigned_station_id)?.display_name || 'None'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Download Sources Management */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-primary" />
          <h2 className="text-xl font-semibold">{t('sources_title')}</h2>
        </div>

        <form onSubmit={handleCreateSource} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('source_name')}
              value={newSource.name}
              onChange={e => setNewSource({...newSource, name: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="URL (Placeholders: {YYYY}, {MM}, {DD}, {date})"
              value={newSource.url}
              onChange={e => setNewSource({...newSource, url: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder={t('output_filename')}
              value={newSource.output_filename}
              onChange={e => setNewSource({...newSource, output_filename: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('username')}
              value={newSource.username}
              onChange={e => setNewSource({...newSource, username: e.target.value})}
              className="input-field"
            />
            <input
              type="password"
              placeholder={t('password')}
              value={newSource.password}
              onChange={e => setNewSource({...newSource, password: e.target.value})}
              className="input-field"
            />
             <select
              value={newSource.station_id}
              onChange={e => setNewSource({...newSource, station_id: e.target.value})}
              className="input-field"
              required
            >
              <option value="">{t('station')}...</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="space-y-1">
              <label className="text-[10px] text-dim uppercase px-1">{t('minute')}</label>
              <input
                type="text"
                placeholder="Minute (0-59, *)"
                value={newSource.schedule_minute}
                onChange={e => setNewSource({...newSource, schedule_minute: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-dim uppercase px-1">{t('hour')}</label>
              <input
                type="text"
                placeholder="Hour (0-23, *)"
                value={newSource.schedule_hour}
                onChange={e => setNewSource({...newSource, schedule_hour: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-dim uppercase px-1">{t('days')}</label>
              <input
                type="text"
                placeholder="Days (0-6, *)"
                value={newSource.schedule_day_of_week}
                onChange={e => setNewSource({...newSource, schedule_day_of_week: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-dim uppercase px-1">{t('retries')}</label>
              <input
                type="number"
                min="0"
                max="5"
                value={newSource.max_retries}
                onChange={e => setNewSource({...newSource, max_retries: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center">
            {t('add_source')}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-dim text-xs uppercase border-b border-white/5">
                <th className="pb-3 px-2 font-medium">{t('source_name')}</th>
                <th className="pb-3 px-2 font-medium">Schedule</th>
                <th className="pb-3 px-2 font-medium">URL</th>
                <th className="pb-3 px-2 font-medium">File</th>
                <th className="pb-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(source => (
                <tr key={source.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-2">
                    <div className="font-medium text-sm">{source.name}</div>
                    <div className="text-[10px] text-primary">{stations.find(s => s.id === source.station_id)?.display_name}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5 text-xs text-dim">
                      <Clock size={12} />
                      {source.schedule_hour}:{source.schedule_minute}
                      <Calendar size={12} className="ml-1" />
                      {source.schedule_day_of_week}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-xs text-dim max-w-[150px] truncate" title={source.url}>{source.url}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-xs font-mono">{source.output_filename}</div>
                    {source.max_retries > 0 && <div className="text-[10px] text-dim flex items-center gap-1"><RefreshCw size={8}/> {source.max_retries}x</div>}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-dim">
                      <button 
                        onClick={() => handleTriggerSource(source.id)}
                        className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                        title={t('trigger')}
                      >
                        <Radio size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
