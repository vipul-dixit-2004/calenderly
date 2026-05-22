import { mailQueue } from './queue.js';
import { getTransporter } from './transport.js';
import { render } from './templateEngine.js';
import { mailConfig } from '../../config/mail.js';

export { verifyTransport } from './transport.js';

/**
 * Queue an email for async delivery (recommended).
 * Non-blocking — returns immediately, email sends in background.
 *
 * @param {object}  opts
 * @param {string}  opts.to        – recipient email
 * @param {string}  opts.subject   – email subject
 * @param {string}  opts.template  – template name (e.g. 'booking-confirmation')
 * @param {object}  opts.data      – template variables
 */
export async function send({ to, subject, template, data }) {
  await mailQueue.add(template, { to, subject, template, data });
}

/**
 * Send an email immediately (bypasses queue).
 * Use sparingly — blocks until sent.
 */
export async function sendNow({ to, subject, template, data }) {
  const html = render(template, data);
  await getTransporter().sendMail({ from: mailConfig.from, to, subject, html });
}
