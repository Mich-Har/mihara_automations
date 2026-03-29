const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, company, needs, systems } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !needs?.trim()) {
    return res.status(400).json({ error: 'Uzupełnij wymagane pola.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Nieprawidłowy adres e-mail.' });
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `Nowe zapytanie – ${firstName} ${lastName}${company ? ` (${company})` : ''}`;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#29182F">
      <div style="background:#3D496E;padding:28px 32px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0;font-size:1.3rem">Nowe zapytanie z formularza</h2>
      </div>
      <div style="background:#FFFEF9;padding:28px 32px;border:1px solid #E0DCD8;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b6170;font-size:.85rem;width:140px">Imię i nazwisko</td><td style="padding:8px 0;font-weight:600">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6170;font-size:.85rem">E-mail</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#E56135">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b6170;font-size:.85rem">Telefon</td><td style="padding:8px 0">${phone || '–'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6170;font-size:.85rem">Firma</td><td style="padding:8px 0">${company || '–'}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #E0DCD8;margin:16px 0"/>
        <p style="color:#6b6170;font-size:.85rem;margin:0 0 6px">Potrzeby automatyzacyjne</p>
        <p style="margin:0;white-space:pre-wrap">${needs}</p>
        ${systems ? `<hr style="border:none;border-top:1px solid #E0DCD8;margin:16px 0"/>
        <p style="color:#6b6170;font-size:.85rem;margin:0 0 6px">Systemy do integracji</p>
        <p style="margin:0;white-space:pre-wrap">${systems}</p>` : ''}
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from:    `"Mihara Formularz" <${process.env.SMTP_USER}>`,
      to:      process.env.MAIL_TO || 'kontakt@mihara.pl',
      replyTo: email,
      subject,
      html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    res.status(500).json({ error: 'Błąd wysyłki. Spróbuj ponownie lub napisz bezpośrednio na kontakt@mihara.pl' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mihara mailer → http://localhost:${PORT}`));
