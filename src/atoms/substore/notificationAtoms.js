/**
 * L4 - Atom
 * 消息推送通知原子函数（Bark / Telegram / Pushover）
 */

export async function sendBarkNotification(config, title, subtitle, content) {
    const { serverUrl, deviceKey, group } = config;
    if (!serverUrl || !deviceKey) return;

    const fullTitle = subtitle ? `${title} - ${subtitle}` : title;
    const baseUrl = serverUrl.replace(/\/$/, '');
    const params = new URLSearchParams({
        group: group || 'SubStore',
        autoCopy: '1',
        isArchive: '1',
        sound: 'shake',
        level: 'timeSensitive',
        icon: 'https://raw.githubusercontent.com/58xinian/icon/master/Sub-Store1.png',
    });

    const url = `${baseUrl}/${encodeURIComponent(deviceKey)}/${encodeURIComponent(fullTitle)}/${encodeURIComponent(content)}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bark 推送失败: ${res.status}`);
}

export async function sendTelegramNotification(config, title, subtitle, content) {
    const { botToken, chatId } = config;
    if (!botToken || !chatId) return;

    const text = subtitle ? `<b>${title}</b>\n${subtitle}\n\n${content}` : `<b>${title}</b>\n\n${content}`;
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
        }),
    });
    if (!res.ok) throw new Error(`Telegram 推送失败: ${res.status}`);
}

export async function sendPushoverNotification(config, title, subtitle, content) {
    const { userKey, appToken } = config;
    if (!userKey || !appToken) return;

    const fullTitle = subtitle ? `${title} - ${subtitle}` : title;
    const res = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: appToken,
            user: userKey,
            title: fullTitle,
            message: content,
        }),
    });
    if (!res.ok) throw new Error(`Pushover 推送失败: ${res.status}`);
}

export async function sendFtqqNotification(config, title, subtitle, content) {
    const { sendKey } = config;
    if (!sendKey) return;

    const text = subtitle ? `${title} - ${subtitle}\n${content}` : `${title}\n${content}`;
    const url = new URL(`https://sctapi.ftqq.com/${sendKey}.send`);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, desp: text }),
    });
    if (!res.ok) throw new Error(`Server酱推送失败: ${res.status}`);
}

export async function sendFtqq3Notification(config, title, subtitle, content) {
    const { uid, sendKey } = config;
    if (!uid || !sendKey) return;

    const fullTitle = subtitle ? `${title} - ${subtitle}` : title;
    const desp = content;
    const url = new URL(`https://${uid}.push.ft07.com/send/${sendKey}.send`);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: fullTitle, desp }),
    });
    if (!res.ok) throw new Error(`Server酱3推送失败: ${res.status}`);
}
