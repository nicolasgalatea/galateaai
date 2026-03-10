const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email y contrasena requeridos' });
  }

  // Pilot password from environment variable — never exposed to client
  const pilotPassword = process.env.PILOT_PASSWORD;
  if (!pilotPassword) {
    console.error('PILOT_PASSWORD not configured in environment variables');
    return res.status(500).json({ success: false, error: 'Autenticacion no configurada. Contacta al administrador.' });
  }

  // Validate against known pilot users (FSFB emails)
  const PILOT_DOMAINS = ['fsfb.org.co'];
  const emailDomain = email.split('@')[1];
  if (!PILOT_DOMAINS.includes(emailDomain)) {
    return res.status(401).json({ success: false, error: 'Email no autorizado para piloto' });
  }

  // Constant-time comparison to prevent timing attacks
  const crypto = require('crypto');
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(pilotPassword).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(expectedHash))) {
    return res.status(401).json({ success: false, error: 'Contrasena incorrecta' });
  }

  return res.status(200).json({ success: true });
};
