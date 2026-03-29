# Instrukcja uruchomienia formularza kontaktowego

## Co robi backend?

Plik `server.js` to mini serwer Node.js, który odbiera dane z formularza kontaktowego i wysyła je na podany adres e-mail. Używa bibliotek:
- **Express** – serwer HTTP
- **Nodemailer** – wysyłka maili przez SMTP
- **dotenv** – konfiguracja przez plik `.env`
- **cors** – zezwolenie przeglądarce na kontakt z serwerem

---

## Wymagania

- Zainstalowany **Node.js** (wersja 18 lub nowsza)
  Sprawdź: `node -v`
  Pobierz z: https://nodejs.org

---

## Krok 1 – Zainstaluj zależności

Otwórz terminal w folderze projektu i wpisz:

```bash
npm install
```

Zainstaluje to: express, nodemailer, dotenv, cors.

---

## Krok 2 – Skonfiguruj plik `.env`

Skopiuj plik przykładowy:

```bash
cp .env.example .env
```

Otwórz `.env` i uzupełnij dane:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=twoj@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx
MAIL_TO=kontakt@mihara.pl
ALLOWED_ORIGIN=*
PORT=3000
```

### Ważne – hasło do aplikacji Gmail

Gmail **nie pozwala** na logowanie zwykłym hasłem przez SMTP.
Musisz wygenerować **hasło do aplikacji**:

1. Zaloguj się na https://myaccount.google.com
2. Wejdź w **Bezpieczeństwo**
3. Włącz **Weryfikację dwuetapową** (jeśli jeszcze nie jest)
4. Wejdź w **Hasła do aplikacji**
5. Wybierz aplikację: „Poczta", urządzenie: „Komputer z systemem Windows"
6. Kliknij **Utwórz** – dostaniesz 16-znakowe hasło (np. `abcd efgh ijkl mnop`)
7. Wpisz je w `.env` jako `SMTP_PASS` (bez spacji): `abcdefghijklmnop`

### Inne dostawce SMTP

| Dostawca | SMTP_HOST | SMTP_PORT |
|----------|-----------|-----------|
| Gmail | smtp.gmail.com | 587 |
| Outlook/Hotmail | smtp-mail.outlook.com | 587 |
| OVH | ssl0.ovh.net | 587 |
| nazwa.pl | poczta.nazwa.pl | 587 |

---

## Krok 3 – Uruchom serwer

### Tryb produkcyjny:
```bash
npm start
```

### Tryb developerski (auto-restart po zmianach):
```bash
npm run dev
```

Serwer startuje na `http://localhost:3000`
Endpoint formularza: `POST http://localhost:3000/api/contact`

---

## Krok 4 – Testowanie

Otwórz stronę `index.html` (najlepiej przez lokalny serwer, np. Live Server w VS Code) i wypełnij formularz. Sprawdź skrzynkę e-mail podaną w `MAIL_TO`.

### Test przez terminal (curl):
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jan","lastName":"Kowalski","email":"test@test.pl","needs":"Chcę umówić audyt"}'
```

Oczekiwana odpowiedź: `{"success":true}`

---

## Krok 5 – reCAPTCHA (do dodania później)

W HTML jest gotowe miejsce na widget Google reCAPTCHA v2 (`id="recaptchaContainer"`).

Gdy będziesz gotowy:

1. Zarejestruj domenę na https://www.google.com/recaptcha/admin
2. Wybierz **reCAPTCHA v2** → „Nie jestem robotem"
3. Skopiuj **Site Key** i **Secret Key**
4. W `index.html` dodaj przed `</head>`:
   ```html
   <script src="https://www.google.com/recaptcha/api.js" async defer></script>
   ```
5. Zastąp placeholder w HTML:
   ```html
   <div class="g-recaptcha" data-sitekey="TWOJ_SITE_KEY"></div>
   ```
6. W `server.js` dodaj weryfikację Secret Key po stronie serwera (wyślij token do `https://www.google.com/recaptcha/api/siteverify`)

---

## Produkcja (deployment)

Gdy strona idzie na serwer:

1. Zmień `ALLOWED_ORIGIN` w `.env` na docelowy adres domeny, np.:
   ```
   ALLOWED_ORIGIN=https://mihara.pl
   ```
2. W `js/main.js` zmień URL endpointu z `http://localhost:3000/api/contact` na adres serwera produkcyjnego, np.:
   ```
   https://api.mihara.pl/api/contact
   ```
3. Uruchom serwer jako usługę (np. przez **PM2**):
   ```bash
   npm install -g pm2
   pm2 start server.js --name mihara-mailer
   pm2 save
   pm2 startup
   ```

---

## Struktura plików

```
mihara_forge/
├── index.html          ← strona z formularzem
├── server.js           ← backend Node.js
├── package.json        ← zależności
├── .env                ← konfiguracja (NIE commituj do git!)
├── .env.example        ← szablon konfiguracji
├── css/
│   └── styles.css
└── js/
    └── main.js         ← obsługa wysyłki formularza
```

> **Uwaga:** Plik `.env` zawiera hasła – nigdy nie wrzucaj go do repozytorium git.
> Dodaj `.env` do pliku `.gitignore`.
