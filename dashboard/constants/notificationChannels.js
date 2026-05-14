/**
 * 通知推送通道常量定义
 *
 * 前后端共享，添加新通道只需在此文件中注册即可。
 * - type:    通道标识（数据库存储值）
 * - label:   前端显示名称
 * - requiredKey: 网关判断配置是否有效的关键字段
 * - fields:  前端表单字段 [{ key, label, placeholder }]
 */

export const NOTIFICATION_CHANNELS = [
    {
        type: 'bark',
        label: 'Bark',
        requiredKey: 'deviceKey',
        fields: [
            { key: 'serverUrl', label: '服务器地址', placeholder: 'https://api.day.app' },
            { key: 'deviceKey', label: 'Device Key', placeholder: '你的 Bark Key' },
            { key: 'group', label: '分组名称', placeholder: 'SubStore' },
        ],
    },
    {
        type: 'telegram',
        label: 'Telegram',
        requiredKey: 'chatId',
        fields: [
            { key: 'botToken', label: 'Bot Token', placeholder: '你的 Bot Token' },
            { key: 'chatId', label: 'Chat ID', placeholder: '你的 Chat ID' },
        ],
    },
    {
        type: 'ftqq',
        label: 'Server酱',
        requiredKey: 'sendKey',
        fields: [
            { key: 'sendKey', label: 'SendKey', placeholder: 'SCT123456...' },
        ],
    },
    {
        type: 'ftqq3',
        label: 'Server酱3',
        requiredKey: 'sendKey',
        fields: [
            { key: 'uid', label: 'UID', placeholder: '12345' },
            { key: 'sendKey', label: 'SendKey', placeholder: 'SCT123456...' },
        ],
    },
    {
        type: 'pushover',
        label: 'Pushover',
        requiredKey: 'userKey',
        fields: [
            { key: 'userKey', label: 'User Key', placeholder: '你的 User Key' },
            { key: 'appToken', label: 'App Token', placeholder: '你的 App Token' },
        ],
    },
];

export function getChannelConfigs() {
    const result = {};
    for (const ch of NOTIFICATION_CHANNELS) {
        const defaults = {};
        for (const f of ch.fields) defaults[f.key] = '';
        result[ch.type] = defaults;
    }
    return result;
}
