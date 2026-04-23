# Carspotting

Ett spel för att hitta bilar med regnummer i rätt ordning (001, 002, 003...).

---

## Publicera appen – steg för steg

Du behöver tre gratis konton: **GitHub** (har du redan), **Neon** och **Vercel**.

---

### Steg 1 – Skapa en gratis databas på Neon

1. Gå till **[neon.tech](https://neon.tech)** och klicka **Sign up** (gratis)
2. Logga in med GitHub
3. Klicka **Create a project**
4. Ge projektet ett namn, t.ex. `carspotting`
5. Välj region närmast dig (t.ex. `Europe West`)
6. Klicka **Create project**
7. Du ser nu en ruta med en **Connection string** som ser ut ungefär så här:
   ```
   postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
8. **Kopiera hela den strängen** – du behöver den i nästa steg

---

### Steg 2 – Publicera på Vercel

1. Gå till **[vercel.com](https://vercel.com)** och klicka **Sign up** (gratis)
2. Välj **Continue with GitHub**
3. Klicka **Add New → Project**
4. Hitta `billypaarts/carspotting` i listan och klicka **Import**
5. Öppna **Environment Variables** (viktig sektion längre ner på sidan)
6. Lägg till dessa fyra variabler en i taget:

   | Namn | Värde |
   |---|---|
   | `DATABASE_URL` | Connection string från Neon (steg 1) |
   | `NEXTAUTH_SECRET` | En lång slumpsträng (se nedan hur) |
   | `NEXTAUTH_URL` | Lämna **tomt** för nu, fyll i efter deploy |
   | `ADMIN_EMAIL` | Din e-postadress |
   | `ADMIN_PASSWORD` | Välj ett lösenord du kommer ihåg |
   | `ADMIN_NAME` | Ditt namn |

   **Hur genererar jag NEXTAUTH_SECRET?**
   Gå till [generate-secret.vercel.app](https://generate-secret.vercel.app/32) – kopiera den långa strängen du får.

7. Klicka **Deploy** och vänta ca 1–2 minuter

8. När det är klart ser du en grön bock och en länk som t.ex. `carspotting.vercel.app`

---

### Steg 3 – Lägg till din URL i inställningarna

Nu när du vet din Vercel-URL behöver du lägga till den:

1. Gå till ditt projekt på Vercel
2. Klicka **Settings → Environment Variables**
3. Redigera `NEXTAUTH_URL` och sätt den till din URL, t.ex. `https://carspotting.vercel.app`
4. Klicka **Save**
5. Gå till **Deployments** och klicka **Redeploy** på den senaste deployens tre-punkts-meny

---

### Steg 4 – Initiera databasen

Nu måste databasens tabeller skapas och ditt admin-konto sättas upp.

1. På Vercel, gå till **Settings → Functions** (eller direkt till projektets översikt)
2. Klicka på **...** bredvid senaste deployment → **Redeploy**

   Alternativt, via Vercel CLI (om du har Node.js installerat):
   ```bash
   npx vercel env pull .env.local
   npx vercel run db:setup
   ```

   **Enklare alternativ – kör direkt i Neon:**
   1. Gå till [neon.tech](https://neon.tech) → ditt projekt → **SQL Editor**
   2. Klistra in innehållet från filen `prisma/migrations/0001_init/migration.sql` och kör det

   Sedan behöver du skapa din admin-användare. Det gör du enklast via Vercel's inbyggda funktioner – se nästa steg.

---

### Steg 5 – Skapa admin-användare (via Vercel Functions)

Eftersom appen körs på Vercel och inte på din dator, behöver du köra setup-scriptet där.

**Alternativ A – Vercel CLI** (rekommenderas):
```bash
# Installera Vercel CLI
npm i -g vercel

# Logga in
vercel login

# Länka till projektet (kör i carspotting-mappen)
vercel link

# Kör databas-setup
vercel run npm run db:setup
```

**Alternativ B – Lägg till en temporär setup-sida i appen:**
Skriv till mig så fixar jag en hemlig setup-URL i appen som du kan besöka en gång för att skapa admin-kontot, och sedan ta bort.

---

### Klart!

Öppna din Vercel-URL i webbläsaren. Du bör se inloggningssidan.

Logga in med e-posten och lösenordet du satte i miljövariablerna (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## Använda appen

**Bjud in kompisar:**
1. Logga in → gå till `/admin`
2. Klicka **+ Ny kod**
3. Klicka **Kopiera länk** och skicka länken till kompisen
4. Kompisen klickar länken och registrerar ett konto

**Lägg till hanterad användare (t.ex. mamma):**
1. Gå till `/admin`
2. Fyll i namnet under **Lägg till hanterad användare**
3. Välj vem som ska sköta registreringen (t.ex. dig själv)
4. Nu syns personen i din dashboard – du kan registrera fynd åt hen

**Registrera ett fynd:**
1. På startsidan ser du vilket nummer du söker
2. Hitta bilen → tryck **Hittad!**
3. Bekräfta med ett nytt klick
4. Numret uppdateras och topplistan sorteras om

---

## Teknikstack

- **Next.js 15** – React-ramverk
- **Prisma 5** + **PostgreSQL** – Databas
- **NextAuth v4** – Inloggning
- **Tailwind CSS 4** – Design
- **Vercel** – Hosting
- **Neon** – Databas i molnet
