import nodemailer from 'nodemailer';
import { mailConfig } from '../../config/mail.js';

let transporter = null;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
      family: 4,                                          // Force IPv4 — Render has no IPv6 outbound
      connectionTimeout: mailConfig.connectionTimeout,
      greetingTimeout: mailConfig.greetingTimeout,
    });
  }
  return transporter;
}


export async function verifyTransport() {
  try {
    await getTransporter().verify();
    console.log('✅ Mail transport verified');
  } catch (err) {
    console.error('❌ Mail transport verification failed:', err.message);
  }
}
