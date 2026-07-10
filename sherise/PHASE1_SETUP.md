# Phase 1 Setup Complete ✅

## What Was Done

✅ Installed Prisma, Prisma Client, and Neon serverless driver  
✅ Created comprehensive Prisma schema with all 8 models  
✅ Created seed file with Priya persona + 15 real opportunities  
✅ Configured package.json for seeding  

## Database Schema Overview

### Models Created:

1. **User** - Base user account (Priya)
2. **Profile** - Complete onboarding data matching PRD exactly
3. **Roadmap** - AI-generated comeback plans (JSON steps)
4. **SkillPassportEntry** - Life role → professional skill mappings
5. **GeneratedContent** - AI-generated resume/bio/pitch
6. **Opportunity** - Static dataset of real opportunities
7. **OpportunityMatch** - User-opportunity matching with status
8. **ProgressLog** - Streak, confidence, task tracking

All models have proper relations and cascade deletes.

## Next Steps - BEFORE Running Migration

### 1. Get Your Neon Database URL

1. Go to **https://neon.tech** (create account if needed)
2. Create a new project: **sherise-db**
3. In the dashboard, click **"Connection Details"**
4. Copy the **Pooled connection** string (looks like):
   ```
   postgresql://user:password@ep-*****.neon.tech/neondb?sslmode=require
   ```

### 2. Update Your .env File

Replace the DATABASE_URL in `.env` with your actual Neon connection string:

```env
DATABASE_URL="postgresql://your-actual-neon-connection-string-here"
```

**CRITICAL:** Make sure `.env` is in `.gitignore` — never commit database credentials!

### 3. Run the Migration

This creates all tables in your Neon database:

```bash
npx prisma migrate dev --name init
```

You should see:
```
✔ Prisma Migrate created and applied the following migration:
migrations/
  └─ 20XX_init/
    └─ migration.sql

✔ Generated Prisma Client
```

### 4. Seed the Database

This populates your Neon database with Priya + 15 opportunities:

```bash
npx prisma db seed
```

Expected output:
```
🌱 Starting seed...
✅ Created demo user: Priya
✅ Created/updated 15 opportunities
🎉 Seed completed successfully!
```

### 5. Verify the Data

**Method 1: Prisma Studio (local GUI)**
```bash
npx prisma studio
```

Opens at http://localhost:5555

Check these tables:
- ✅ **users** - Should have 1 row (Priya)
- ✅ **profiles** - Should have 1 row with all her data
- ✅ **opportunities** - Should have 15 rows with real opportunities
- ✅ **progress_logs** - Should have 1 row (initial state)

**Method 2: Neon Dashboard (cloud verification)**

1. Go to https://console.neon.tech
2. Select your **sherise-db** project
3. Click **SQL Editor**
4. Run these queries:

```sql
-- Check Priya exists
SELECT * FROM users;

-- Check her profile
SELECT * FROM profiles;

-- Check all opportunities
SELECT title, organization, type, region FROM opportunities;

-- Check progress log
SELECT * FROM progress_logs;
```

If you see data in **both** Prisma Studio AND Neon SQL Editor, Phase 1 is complete! ✅

## Troubleshooting

### Error: "Can't reach database server"
- Double-check your DATABASE_URL in `.env`
- Make sure you copied the **pooled connection** string from Neon
- Verify `?sslmode=require` is at the end of the URL

### Error: "Column does not exist"
- Run `npx prisma migrate reset` to reset and re-create all tables
- Then run `npx prisma db seed` again

### Seed script fails
- Check if `tsx` is installed: `npm list tsx`
- If not: `npm install -D tsx`
- Make sure `package.json` has the `"prisma": { "seed": "tsx prisma/seed.ts" }` section

## What's Next

Once Phase 1 is verified (data in Neon), you're ready for:

**Phase 2:** Build CRUD API routes (POST /api/profile, GET /api/roadmap, etc.)  
**Phase 3:** Add AI integration for Roadmap + Skill Passport generation  
**Phase 4:** Opportunity matching + Dream Tracker logic  
**Phase 5:** Frontend integration + deployment to Vercel  

---

## Quick Reference

```bash
# View schema changes without applying
npx prisma migrate dev --create-only

# Reset database completely
npx prisma migrate reset

# Re-seed after reset
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate
```

---

**Phase 1 Status:** ✅ Complete once you've verified data in Neon!
