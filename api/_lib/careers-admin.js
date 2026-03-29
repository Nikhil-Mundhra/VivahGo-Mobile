const nodemailer = require('nodemailer');

const DEFAULT_CAREER_REJECTION_TEMPLATE = {
  subject: 'Update on your VivahGo application for {{jobTitle}}',
  body: [
    'Hi {{firstName}},',
    '',
    'Thank you for taking the time to apply for the {{jobTitle}} role at VivahGo.',
    '',
    'We appreciate the effort you put into your application. After reviewing your profile, we will not be moving forward with your application for this opening.',
    '',
    'We are grateful for your interest in VivahGo and wish you the very best in your search.',
    '',
    'Warm regards,',
    'VivahGo Careers',
  ].join('\n'),
};

function sanitizeTemplateValue(value, maxLength) {
  return typeof value === 'string'
    ? value.trim().slice(0, maxLength)
    : '';
}

function getDefaultCareerRejectionTemplate() {
  return { ...DEFAULT_CAREER_REJECTION_TEMPLATE };
}

function sanitizeCareerRejectionTemplate(template = {}) {
  const defaults = getDefaultCareerRejectionTemplate();
  const subject = sanitizeTemplateValue(template.subject, 200) || defaults.subject;
  const body = sanitizeTemplateValue(template.body, 12000) || defaults.body;

  return {
    subject,
    body,
  };
}

function getCareerTemplateTokens(application = {}) {
  const fullName = typeof application.fullName === 'string' && application.fullName.trim()
    ? application.fullName.trim()
    : 'there';
  const firstName = fullName.split(/\s+/).filter(Boolean)[0] || fullName;
  return {
    fullName,
    firstName,
    jobTitle: typeof application.jobTitle === 'string' && application.jobTitle.trim()
      ? application.jobTitle.trim()
      : 'the role',
    email: typeof application.email === 'string' ? application.email.trim() : '',
  };
}

function renderCareerTemplate(value, application = {}) {
  const template = typeof value === 'string' ? value : '';
  const tokens = getCareerTemplateTokens(application);
  return template.replace(/\{\{\s*(fullName|firstName|jobTitle|email)\s*\}\}/g, (_match, tokenName) => tokens[tokenName] || '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlFromPlainText(text) {
  const paragraphs = String(text || '')
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return '';
  }

  return paragraphs
    .map(paragraph => `<p style="margin: 0 0 16px;">${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

async function sendCareerRejectionEmail({ toEmail, template, application }) {
  const smtpHost = process.env.CAREERS_SMTP_HOST;
  const smtpPort = Number(process.env.CAREERS_SMTP_PORT || 587);
  const smtpLogin = process.env.CAREERS_SMTP_LOGIN;
  const smtpPassword = process.env.CAREERS_SMTP_PASSWORD;
  const fromEmail = process.env.CAREERS_SMTP_FROM_EMAIL;

  if (!smtpHost || !smtpLogin || !smtpPassword || !fromEmail || !toEmail) {
    throw new Error('Career rejection email is not configured.');
  }

  const sanitizedTemplate = sanitizeCareerRejectionTemplate(template);
  const subject = renderCareerTemplate(sanitizedTemplate.subject, application);
  const text = renderCareerTemplate(sanitizedTemplate.body, application);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      ${buildHtmlFromPlainText(text)}
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isFinite(smtpPort) ? smtpPort : 587,
    secure: smtpPort === 465,
    requireTLS: smtpPort !== 465,
    auth: {
      user: smtpLogin,
      pass: smtpPassword,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    text,
    html,
  });

  return {
    subject,
    body: text,
    sentAt: new Date(),
  };
}

module.exports = {
  getDefaultCareerRejectionTemplate,
  sanitizeCareerRejectionTemplate,
  renderCareerTemplate,
  sendCareerRejectionEmail,
};
