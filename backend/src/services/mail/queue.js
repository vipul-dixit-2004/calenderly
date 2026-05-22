import { getTransporter } from './transport.js';
import { render } from './templateEngine.js';
import { mailConfig } from '../../config/mail.js';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 15000]; // escalating backoff (ms)

const pending = [];
let processing = false;

export const mailQueue = {
  /**
   * Add a mail job to the in-memory queue.
   *
   * @param {string} name     – job name (for logging)
   * @param {object} jobData  – { to, subject, template, data }
   */
  async add(name, jobData) {
    pending.push({ ...jobData, _retries: 0 });
    if (!processing) processQueue();
  },

  /** Current queue depth (for monitoring) */
  get size() {
    return pending.length;
  },
};

async function processQueue() {
  processing = true;

  while (pending.length > 0) {
    const job = pending.shift();
    const { to, subject, template, data, _retries } = job;

    try {
      const html = render(template, data);
      await getTransporter().sendMail({
        from: mailConfig.from,
        to,
        subject,
        html,
      });
      console.log(`📨 Mail sent → ${to} [${template}]`);
    } catch (err) {
      console.error(`❌ Mail failed → ${to} [${template}]:`, err.message);

      if (_retries < MAX_RETRIES) {
        const delay = RETRY_DELAYS[_retries] || 15000;
        console.log(`🔄 Retrying in ${delay}ms (attempt ${_retries + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          pending.push({ ...job, _retries: _retries + 1 });
          if (!processing) processQueue();
        }, delay);
      } else {
        console.error(`💀 Mail permanently failed → ${to} [${template}] after ${MAX_RETRIES} retries`);
      }
    }
  }

  processing = false;
}
