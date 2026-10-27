// Web app that hosts public booking and reschedule pages
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://calenderly.vipuldixit.tech';
export const WEB_HOST = WEB_URL.replace(/^https?:\/\//, '');
