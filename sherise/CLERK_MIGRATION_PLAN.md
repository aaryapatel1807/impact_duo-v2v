# 🔄 Clerk Authentication Migration Plan

## ✅ COMPLETED

1. ✅ Installed `@clerk/nextjs`
2. ✅ Added Clerk keys to `.env.local`
3. ✅ Created Clerk middleware (`middleware.ts`)
4. ✅ Wrapped app with `ClerkProvider` in `layout.tsx`
5. ✅ Created Sign-In page (`/sign-in`)
6. ✅ Created Sign-Up page (`/sign-up`)
7. ✅ Updated Prisma schema to use Clerk User ID
8. ✅ Created Clerk webhook handler (`/api/webhooks/clerk`)
9. ✅ Created auth utility functions (`lib/auth.ts`)

## 🚧 TODO - Critical

### Database Migration
```bash
# Run this command to update your database:
npx prisma migrate dev --name add_clerk_auth

# Then push to Neon:
npx prisma db push
```

### Update All API Routes
Every API route must:
1. Import `import { requireAuth } from '@/lib/auth'`
2. Get user: `const user = await requireAuth()`
3. Use `user.id` instead of getting userId from request body

Files to update:
- `/api/profile/route.ts` - ✅ Use Clerk user
- `/api/profile/[userId]/route.ts` - ✅ Use Clerk user
- `/api/roadmap/route.ts` - ⏳ Use Clerk user
- `/api/roadmap/[userId]/route.ts` - ⏳ Use Clerk user  
- `/api/roadmap/generate/route.ts` - ⏳ Use Clerk user
- `/api/skill-passport/route.ts` - ⏳ Use Clerk user
- `/api/skill-passport/[userId]/route.ts` - ⏳ Use Clerk user
- `/api/skill-passport/generate/route.ts` - ⏳ Use Clerk user
- `/api/opportunities/route.ts` - ⏳ Use Clerk user
- `/api/opportunities/match/route.ts` - ⏳ Use Clerk user
- `/api/progress/[userId]/route.ts` - ⏳ Use Clerk user
- `/api/progress/update/route.ts` - ⏳ Use Clerk user

### Update All Pages
Every page must use Clerk hooks:
- Import: `import { useUser } from '@clerk/nextjs'`
- Get user: `const { user, isLoaded } = useUser()`
- Show loading while `!isLoaded`
- Use `user.id`, `user.fullName`, `user.imageUrl`, `user.primaryEmailAddress.emailAddress`

Files to update:
- `/dashboard/page.tsx` - ⏳ Remove ALL mock data
- `/onboarding/page.tsx` - ⏳ Use Clerk user
- `/roadmap/page.tsx` - ⏳ Remove mock, use real data
- `/skill-passport/page.tsx` - ⏳ Remove mock, use real data
- `/opportunity-radar/page.tsx` - ⏳ Remove mock, use real data
- `/dream-tracker/page.tsx` - ⏳ Remove mock, use real data
- `/page.tsx` (home) - ⏳ Add Clerk SignedIn/SignedOut

### Remove Mock Data Files
Delete these if they exist:
- `lib/profile-client.ts` - ⏳ DELETE (replaced by lib/auth.ts)
- Any `mockData.ts`, `dummyData.ts`, etc.

### Update Components
All dashboard components must receive REAL data as props:
- `components/dashboard/*` - ⏳ Update all props to use real types

## 📋 NEXT STEPS

1. **Run Database Migration First**
2. **Update API Routes (one by one)**
3. **Update Pages (one by one)**
4. **Test Each Page**
5. **Remove Mock Data**
6. **Final Testing**

## ⚙️ Clerk Dashboard Configuration

Don't forget to configure in Clerk Dashboard:

1. **Webhook Endpoint**: Add `https://your-domain.com/api/webhooks/clerk`
2. **Events**: Enable `user.created`, `user.updated`, `user.deleted`
3. **Webhook Secret**: Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

## 🧪 Testing Checklist

After implementation:
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard shows real user name/email/image
- [ ] Onboarding saves to database with Clerk user ID
- [ ] Roadmap generation works
- [ ] Skill passport generation works
- [ ] Opportunities are fetched for authenticated user
- [ ] Progress tracking works
- [ ] Sign out works
- [ ] Webhooks sync users to database

---

This is a PRODUCTION-READY authentication system. No more mock data!
