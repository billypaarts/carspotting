# Carspotting

Ett spel för att hitta bilar med regnummer i rätt ordning (001, 002, 003...).

## Kom igång

### 1. Installera beroenden

```bash
npm install
```

### 2. Konfigurera miljövariabler

Kopiera `.env.example` till `.env` och fyll i värdena:

```bash
cp .env.example .env
```

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="ett-hemligt-nyckelvärde"
NEXTAUTH_URL="http://localhost:3000"
```

Generera ett starkt NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Initiera databasen

```bash
npx prisma migrate deploy
```

### 4. Skapa admin-användare

```bash
ADMIN_EMAIL="din@epost.se" ADMIN_PASSWORD="dittlösenord" ADMIN_NAME="Ditt Namn" npm run db:seed
```

### 5. Starta appen

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Använda appen

1. **Logga in** som admin på `/login`
2. **Skapa inbjudningskoder** i admin-panelen (`/admin`)
3. **Dela länken** med kompisar: `https://din-domän.se/register?code=KODEN`
4. **Lägg till hanterade användare** för de som inte vill hantera appen själva (t.ex. mamma)
5. **Registrera fynd** direkt från dashboarden – tryck "Hittad!" och bekräfta

## Deploy till Vercel

1. Pusha koden till GitHub
2. Importera repot i [Vercel](https://vercel.com)
3. Lägg till env-variabler i Vercel-inställningarna
4. Ändra `DATABASE_URL` till en PostgreSQL-URL (t.ex. från [Neon](https://neon.tech) eller [Supabase](https://supabase.com))
5. I `prisma/schema.prisma`, ändra `provider = "sqlite"` till `provider = "postgresql"`

## Teknikstack

- **Next.js 15** – React-ramverk
- **Prisma 5** – ORM och databashantering
- **NextAuth v4** – Autentisering
- **SQLite** – Databas (lokal) / PostgreSQL (produktion)
- **Tailwind CSS 4** – Styling
