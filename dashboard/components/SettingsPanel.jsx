import { useState, useEffect, Fragment } from 'react';
import { useToast } from './Toast';
import { api } from '../api';
import { NOTIFICATION_CHANNELS } from '../constants/notificationChannels';

const CHANNEL_DEFAULTS = Object.fromEntries(NOTIFICATION_CHANNELS.map(ch => [ch.type, Object.fromEntries(ch.fields.map(f => [f.key, '']))]));

const TestButton = ({ testing, testResult, onTest }) => (
    <button onClick={onTest} disabled={testing}
        className="w-full py-2 mt-2 rounded-lg text-sm bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors">
        {testing ? '测试中...' : testResult?.ok ? '✅ 测试通过' : '📤 测试推送'}
    </button>
);

const SettingsPanel = ({ expanded, onToggle, userPath, onPathChange }) => {
    const toast = useToast();
    const [settings, setSettings] = useState({
        surgeVersion: '5.0.0',
        surgeBuild: '2000',
        cronEnabled: true,
        notification: {
            type: 'none',
            ...CHANNEL_DEFAULTS
        }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [regenerating, setRegenerating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (expanded) loadSettings();
    }, [expanded]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { ok, data } = await api('/api/dashboard/user/settings');
            if (ok) setSettings(data);
        } catch (e) { }
        finally { setLoading(false); }
    };

    const testNotification = async () => {
        setTesting(true);
        setTestResult(null);
        const { ok, data } = await api('/api/dashboard/user/notification/test', {
            method: 'POST',
            body: settings.notification,
        });
        if (ok) {
            setTestResult({ ok: true });
            toast.success('测试推送发送成功！');
        } else {
            setTestResult({ ok: false, error: data.error || '' });
            toast.error('推送测试失败: ' + (data.error || ''));
        }
        setTesting(false);
    };

    const saveSettings = async () => {
        const notif = settings.notification;
        if (notif.type !== 'none' && !testResult?.ok) {
            toast.warning('请先测试推送通道再保存');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            const { ok } = await api('/api/dashboard/user/settings', {
                method: 'POST',
                body: settings
            });
            setMessage(ok ? '✓ 设置已保存' : '保存失败');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) { setMessage('保存失败'); }
        finally { setSaving(false); }
    };

    const handleRegeneratePath = async () => {
        if (!confirm('⚠️ 确定要重新生成访问路径吗？\n\n此操作会导致：\n• 旧路径立即失效\n• 所有已配置的设备需要重新设置\n• 分享给他人的链接将不可用\n\n此操作不可撤销！')) return;

        setRegenerating(true);
        try {
            const { ok, data } = await api('/api/dashboard/user/regenerate-path', { method: 'POST' });
            if (ok && data.path) {
                onPathChange(data.path);
                setMessage('✓ 路径已重新生成');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (e) {
            toast.error('重新生成失败');
        } finally {
            setRegenerating(false);
        }
    };

    const updateField = (path, value) => {
        setSettings(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let obj = copy;
            for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
            obj[keys[keys.length - 1]] = value;
            return copy;
        });
        if (path.startsWith('notification.')) setTestResult(null);
    };

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            <button onClick={onToggle} className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg font-semibold text-white">高级设置</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-700/30">
                    {loading ? <div className="text-center py-4 text-gray-400">加载中...</div> : (
                        <div className="space-y-8 mt-4">
                            {/* 定时同步 */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 pb-2 border-b border-slate-700/50">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    定时同步
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                    <div>
                                        <p className="text-white text-sm font-medium">启用定时刷新</p>
                                        <p className="text-gray-500 text-xs mt-1">每 6 小时自动刷新订阅，保持节点信息最新</p>
                                    </div>
                                    <button
                                        onClick={() => updateField('cronEnabled', !settings.cronEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.cronEnabled ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-slate-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.cronEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Surge 环境配置 */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 pb-2 border-b border-slate-700/50">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                    Surge 环境
                                </h3>
                                <p className="text-gray-500 text-xs">模拟 Surge 环境，防止检查版本号</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">版本号</label>
                                        <input type="text" value={settings.surgeVersion} onChange={e => updateField('surgeVersion', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="5.0.0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Build</label>
                                        <input type="text" value={settings.surgeBuild} onChange={e => updateField('surgeBuild', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="2000" />
                                    </div>
                                </div>
                            </div>

                            {/* 通知推送配置 */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 pb-2 border-b border-slate-700/50">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    通知推送
                                </h3>
                                <p className="text-gray-500 text-xs">脚本产生的通知将推送到你的设备</p>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">推送通道</label>
                                    <div className="relative">
                                        <select value={settings.notification.type} onChange={e => updateField('notification.type', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer">
                                            {[
                                                { value: 'none', label: '不推送' },
                                                ...NOTIFICATION_CHANNELS.map(ch => ({ value: ch.type, label: ch.label })),
                                            ].map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {settings.notification.type !== 'none' && (
                                    <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl">
                                        {NOTIFICATION_CHANNELS.filter(ch => ch.type === settings.notification.type).map(ch => (
                                            <Fragment key={ch.type}>
                                                {ch.fields.map(field => (
                                                    <div key={field.key}>
                                                        <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                                                        <input type="text" value={settings.notification[ch.type]?.[field.key] || ''}
                                                            onChange={e => updateField(`notification.${ch.type}.${field.key}`, e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                            placeholder={field.placeholder} />
                                                    </div>
                                                ))}
                                            </Fragment>
                                        ))}
                                        <TestButton testing={testing} testResult={testResult} onTest={testNotification} />
                                    </div>
                                )}
                            </div>

                            {/* 重新生成路径 */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 pb-2 border-b border-slate-700/50">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    访问路径
                                </h3>
                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-medium">重新生成访问路径</p>
                                            <p className="text-gray-500 text-xs mt-1">当前路径: <code className="text-cyan-400">/{userPath}</code></p>
                                        </div>
                                        <button
                                            onClick={handleRegeneratePath}
                                            disabled={regenerating}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                        >
                                            {regenerating ? '生成中...' : '重新生成'}
                                        </button>
                                    </div>
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-red-300/80 text-xs">
                                            ⚠️ 重新生成后，旧路径将立即失效，所有使用该路径的设备和分享链接都需要重新配置。此操作不可撤销。
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 保存按钮 */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <span className={`text-sm ${message.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>{message}</span>
                                <button onClick={saveSettings} disabled={saving}
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {saving ? '保存中...' : '保存设置'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SettingsPanel;
