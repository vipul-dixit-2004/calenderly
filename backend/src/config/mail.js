export const mailConfig = {
  host: 'smtp.gmail.com',
  port: 587,          // Always use 587 (STARTTLS) — port 465 is blocked on Render and many cloud hosts
  secure: false,      // false = STARTTLS (upgrades after connection); true = implicit TLS (port 465)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  from: process.env.MAIL_FROM || 'Calenderly <noreply@calenderly.com>',
  connectionTimeout: 10000,  // 10 s — fail fast instead of hanging
  greetingTimeout: 10000,
};
