/**
 * L2 - Diplomat
 * 推送通知网关：根据用户配置的通道类型分发通知
 *
 * 使用方式：
 *   const gateway = createNotificationGateway(userSettings, ctx);
 *   await gateway.post(title, subtitle, content);
 *
 * 测试方式（不保存配置）：
 *   import { sendTestNotification } from './notificationGateway.js';
 *   await sendTestNotification({ type: 'telegram', telegram: { botToken, chatId } });
 */

import { sendBarkNotification, sendTelegramNotification, sendFtqqNotification, sendFtqq3Notification, sendPushoverNotification } from '../../atoms/substore/notificationAtoms.js';
import { NOTIFICATION_CHANNELS } from '../../../dashboard/constants/notificationChannels.js';
import { debug } from '../../utils/logger.js';

const SENDERS = {
    bark: sendBarkNotification,
    telegram: sendTelegramNotification,
    ftqq: sendFtqqNotification,
    ftqq3: sendFtqq3Notification,
    pushover: sendPushoverNotification,
};

const CHANNEL_MAP = Object.fromEntries(
    NOTIFICATION_CHANNELS.map((ch) => [ch.type, { send: SENDERS[ch.type], requiredKey: ch.requiredKey, configKey: ch.type }])
);

export function createNotificationGateway(userSettings, ctx) {
    const notification = userSettings?.notification || { type: 'none' };

    return {
        post: (title, subtitle, content) => {
            debug(`[Notification] ${title}: ${subtitle} - ${content}`);
            const channel = CHANNEL_MAP[notification.type];
            if (!channel) return;
            const config = notification[channel.configKey];
            if (!config || !config[channel.requiredKey]) return;
            const send = () => channel.send(config, title, subtitle, content).catch(() => {});
            if (ctx && typeof ctx.waitUntil === 'function') {
                ctx.waitUntil(send());
            } else {
                send();
            }
        },
    };
}

export async function sendTestNotification(config) {
    const { type } = config;
    const channel = CHANNEL_MAP[type];
    if (!channel) throw new Error(`不支持的推送通道: ${type}`);
    const channelConfig = config[channel.configKey];
    if (!channelConfig || !channelConfig[channel.requiredKey]) {
        throw new Error(`缺少 ${channel.configKey}.${channel.requiredKey} 配置`);
    }
    await channel.send(channelConfig, 'Sub-Store', '测试消息', '推送通道配置成功！');
}
