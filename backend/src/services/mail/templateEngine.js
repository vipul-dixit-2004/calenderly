import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Cache compiled templates
const cache = new Map();

/**
 * Compile & render a template with data.
 * Wraps the result inside the base layout automatically.
 *
 * @param {string} templateName  – filename without .hbs (e.g. 'booking-confirmation')
 * @param {object} data          – template variables
 * @returns {string}             – rendered HTML string
 */
export function render(templateName, data = {}) {
  const bodyHtml = compileTemplate(templateName, data);

  const layoutHtml = compileTemplate('layouts/base', {
    ...data,
    body: bodyHtml,
    year: new Date().getFullYear(),
  });

  return layoutHtml;
}

function compileTemplate(name, data) {
  if (!cache.has(name)) {
    const filePath = path.join(TEMPLATES_DIR, `${name}.hbs`);
    const source = fs.readFileSync(filePath, 'utf-8');
    cache.set(name, Handlebars.compile(source));
  }
  return cache.get(name)(data);
}


Handlebars.registerHelper('formatDate', (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
});

Handlebars.registerHelper('formatTime', (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
});
