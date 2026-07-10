# 🔐 Clerk Authentication Setup Guide

## Step 1: Create Clerk Account

1. Go to https://dashboard.clerk.com
2. Sign up for a free account
3. Create a new application (name it "SheRise")

## Step 2: Get API Keys

1. In Clerk Dashboard, go to **API Keys** section
2. Copy your keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

## Step 3: Update Environment Variables

Open `sherise/.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
CLERK_SECRET_KEY="sk_test_YOUR_ACTUAL_SECRET_KEY_HERE"
```

⚠️ **Important**: Never commit your Secret Key to Git!

## Step 4: Configure Clerk Settings (Optional)

In Clerk Dashboard:

1. **User Profile**: Enable fields you want
   - Email (required)
   - Username (optional)
   - Profile Image (optional)

2. **Social Connections** (optional):
   - Google
   - GitHub
   - LinkedIn

3. **Email/SMS** settings as needed

## Step 5: Test Authentication

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. You should see Clerk authentication working

## Troubleshooting

- **Keys not working?** Make sure you copied the full key including prefixes
- **Redirect issues?** Check that URLs in .env.local match your actual routes
- **Development mode:** Clerk test keys work only in development/localhost

## Production Deployment

When deploying:
1. Use **Production Keys** (not test keys)
2. Update environment variables in your hosting platform
3. Add your production domain to Clerk Dashboard

---

✅ Once you've added your Clerk keys, the authentication will work automatically!
