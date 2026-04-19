const env = require('../config/env');

function isEmailDeliveryConfigured() {
  return Boolean(env.resendApiKey && env.emailFrom);
}

async function sendEmail({ to, subject, html, text }) {
  if (!isEmailDeliveryConfigured()) {
    return {
      success: false,
      skipped: true,
      reason: 'Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.'
    };
  }

  const payload = {
    from: env.emailFrom,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text
  };

  if (env.emailReplyTo) {
    payload.reply_to = env.emailReplyTo;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `Email API responded with ${response.status}`;
    throw new Error(message);
  }

  return {
    success: true,
    data
  };
}

module.exports = {
  isEmailDeliveryConfigured,
  sendEmail
};
