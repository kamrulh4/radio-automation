import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Radio, Trash2, Check, X } from 'lucide-react';
import axios from 'axios';

const AdminPanel = ({ token }) => {
  const { t } = require('react-i18next').useTranslation();
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [newStation, setNewStation] = useState({ name: '', display_name: '', is_active: true });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'dj', assigned_station_id: '' });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [stationRes, userRes] = await Promise.all([
        axios.get('http://localhost:8000/api/stations/', { headers }),
        axios.get('http://localhost:8000/api/users/', { headers })
      ]);
      setStations(stationRes.data);
      setUsers(userRes.data);
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
      await axios.post('http://localhost:8000/api/stations/', newStation, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.post('http://localhost:8000/api/users/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('success', 'User created successfully!');
      setNewUser({ username: '', password: '', role: 'dj', assigned_station_id: '' });
      fetchData();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {message.text && (
        <div className={`p-4 rounded-xl backdrop-blur-md border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stations Management */}
        <div className="glass-panel p-6">
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
              className="glass-input w-full"
              required
            />
            <input
              type="text"
              placeholder="Display Name (e.g., Radio 105)"
              value={newStation.display_name}
              onChange={e => setNewStation({...newStation, display_name: e.target.value})}
              className="glass-input w-full"
              required
            />
            <button type="submit" className="primary-btn w-full justify-center">
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
        <div className="glass-panel p-6">
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
              className="glass-input w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="glass-input w-full"
              required
            />
            <select
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value})}
              className="glass-input w-full"
            >
              <option value="dj">DJ (Restricted)</option>
              <option value="admin">Administrator</option>
            </select>
            {newUser.role === 'dj' && (
              <select
                value={newUser.assigned_station_id}
                onChange={e => setNewUser({...newUser, assigned_station_id: e.target.value})}
                className="glass-input w-full"
                required
              >
                <option value="">Select Assigned Station...</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.display_name}</option>
                ))}
              </select>
            )}
            <button type="submit" className="primary-btn w-full justify-center">
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
    </div>
  );
};

export default AdminPanel;
