import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function AdminTawkSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replacingKey, setReplacingKey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient('/api/admin/tawk-settings');
      if (res) {
        setSettings(res);
      }
    } catch (error) {
      console.error("Failed to load Tawk settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      const res = await apiClient('/api/admin/tawk-settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res) {
        alert("Settings saved successfully.");
        setReplacingKey(false);
        fetchSettings(); // Refresh
      }
    } catch (error) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white/50">Loading settings...</div>;

  return (
    <div className="flex h-full min-h-0 flex-col p-8 space-y-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Tawk.to Settings</h1>
          <p className="text-white/40 text-sm">Configure live chat integration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#02695e] hover:bg-[#027d6f] text-white px-5 py-2.5 rounded-[10px] text-xs font-bold transition-all shadow-[0_4px_12px_rgba(2,105,94,0.2)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-[#1a1c1b] border border-white/10 rounded-xl p-6 space-y-8 overflow-y-auto min-h-0 flex-1 scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Toggle Tawk */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.tawkEnabled ? 'bg-[#04a891]' : 'bg-white/10'}`}>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.tawkEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input 
              type="checkbox" 
              className="hidden"
              checked={settings.tawkEnabled}
              onChange={(e) => setSettings({...settings, tawkEnabled: e.target.checked})}
            />
            <div>
              <span className="text-white font-medium block">Enable Tawk.to Widget</span>
              <span className="text-white/50 text-sm">Shows the live chat bubble on the website.</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Tawk.to Property ID</label>
            <input
              type="text"
              value={settings.tawkPropertyId || ''}
              onChange={e => setSettings({...settings, tawkPropertyId: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
              placeholder="e.g. 64abc123..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Tawk.to Widget ID</label>
            <input
              type="text"
              value={settings.tawkWidgetId || ''}
              onChange={e => setSettings({...settings, tawkWidgetId: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
              placeholder="e.g. 1g..."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Tawk.to Secure Mode Secret</label>
          <div className="flex items-center gap-2">
            {settings.tawkSecretConfigured && !replacingKey ? (
              <>
                <div className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white/50">
                  ************************
                </div>
                <button onClick={async () => {
                  if (confirm("Are you sure you want to remove the Tawk Secret?")) {
                    await apiClient('/api/admin/tawk-settings', {
                      method: 'PUT',
                      body: JSON.stringify({ ...settings, removeTawkSecret: true })
                    });
                    fetchSettings();
                  }
                }} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm shrink-0 whitespace-nowrap transition-colors">
                  Remove
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  value={settings.tawkSecret || ''}
                  onChange={e => setSettings({...settings, tawkSecret: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                  placeholder="Paste Tawk secret to enable Identity Verification"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
