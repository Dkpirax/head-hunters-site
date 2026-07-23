import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function AdminAISettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [replacingKey, setReplacingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient('/api/admin/ai-settings');
      if (res) {
        setSettings(res);
      }
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      if (replacingKey) {
        payload.apiKey = newApiKey;
      }

      const res = await apiClient('/api/admin/ai-settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res) {
        alert("Settings saved successfully.");
        setReplacingKey(false);
        setNewApiKey('');
        fetchSettings(); // Refresh to get updated apiKeyConfigured state
      }
    } catch (error) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await apiClient('/api/admin/ai-settings/test', {
        method: 'POST',
        body: JSON.stringify({
          baseUrl: settings.baseUrl,
          apiKey: settings.apiKey,
          modelName: settings.modelName
        })
      });
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, message: "Network error occurred during test." });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="p-8 text-white/50">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#04a891]" />
            AI Agent Settings
          </h1>
          <p className="text-white/60 mt-1">Configure Ollama, models, and fallback behaviours.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#04a891] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#038c79] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-[#1a1c1b] border border-white/10 rounded-xl p-6 space-y-8">
        
        {/* Toggle Agent */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-[#04a891]' : 'bg-white/10'}`}>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input 
              type="checkbox" 
              className="hidden"
              checked={settings.enabled}
              onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
            />
            <div>
              <span className="text-white font-medium block">Enable AI Chat Agent</span>
              <span className="text-white/50 text-sm">Turn off to use manual chat only.</span>
            </div>
          </label>
        </div>

        {/* Ollama Connection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">Ollama Connection</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Base URL</label>
              <input
                type="text"
                value={settings.baseUrl}
                onChange={e => setSettings({...settings, baseUrl: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                placeholder="http://localhost:11434"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">API Key / Bearer Token</label>
              <div className="flex items-center gap-2">
                {settings.apiKeyConfigured && !replacingKey ? (
                  <>
                    <div className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white/50">
                      ************************
                    </div>
                    <button onClick={() => setReplacingKey(true)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm shrink-0 whitespace-nowrap transition-colors">
                      Replace Key
                    </button>
                    <button onClick={async () => {
                      if (confirm("Are you sure you want to remove the API key?")) {
                        await apiClient('/api/admin/ai-settings', {
                          method: 'PUT',
                          body: JSON.stringify({ ...settings, removeApiKey: true })
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
                      value={newApiKey}
                      onChange={e => setNewApiKey(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                      placeholder="Leave blank if local without key"
                    />
                    {settings.apiKeyConfigured && (
                      <button onClick={() => { setReplacingKey(false); setNewApiKey(''); }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm shrink-0 whitespace-nowrap transition-colors">
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Model Name</label>
              <input
                type="text"
                value={settings.modelName}
                onChange={e => setSettings({...settings, modelName: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                placeholder="deepseek-r1:7b"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Embedding Model</label>
              <input
                type="text"
                value={settings.embeddingModel}
                onChange={e => setSettings({...settings, embeddingModel: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
                placeholder="nomic-embed-text"
              />
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="mt-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div className={`p-4 rounded-lg flex items-start gap-3 mt-2 ${testResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {testResult.success ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />}
              <p className={testResult.success ? 'text-green-400' : 'text-red-400'}>{testResult.message}</p>
            </div>
          )}
        </div>

        {/* Agent Behavior */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">Retrieval & Thresholds</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Retrieval Result Count (Top K)</label>
              <input
                type="number"
                value={settings.retrievalCount}
                onChange={e => setSettings({...settings, retrievalCount: parseInt(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Min Relevance Score (0.0 - 1.0)</label>
              <input
                type="number"
                step="0.01"
                value={settings.minRelevanceScore}
                onChange={e => setSettings({...settings, minRelevanceScore: parseFloat(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white border-b border-white/10 pb-2">System Messages & Instructions</h2>
          
          <div className="p-4 bg-[#04a891]/10 border border-[#04a891]/20 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#04a891] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-[#04a891] font-medium text-sm">Protected Agent Instructions</h3>
              <p className="text-white/70 text-sm mt-1">
                The grounding and security instructions are controlled by the server and cannot be modified from the dashboard.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Fallback Message (When unsupported)</label>
            <textarea
              value={settings.fallbackMessage}
              onChange={e => setSettings({...settings, fallbackMessage: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#04a891] h-24"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
