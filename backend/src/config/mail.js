export const mailConfig = {
  host: 'smtp.gmail.com',
  port: process.env.NODE_ENV === 'production' ? 465 : 587,
  secure: process.env.NODE_ENV === 'production',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  from: process.env.MAIL_FROM || 'Calenderly <noreply@calenderly.app>',
};
