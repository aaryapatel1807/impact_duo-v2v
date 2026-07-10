# API Routes Testing Guide

All API routes are now created! Here's how to test them.

## Testing with Thunder Client / Postman / curl

### 1. POST /api/profile - Create/Update Profile

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "age": 25,
    "country": "India",
    "educationLevel": "Higher Secondary (Grade 11-12)",
    "reasonStopped": "Testing the API",
    "skills": "Testing, debugging",
    "interests": "Technology",
    "hoursPerDay": "2-4 hours",
    "internetAvailability": "stable",
    "careerGoal": "Learn backend development"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "clxxxxx...",
  "profile": { /* profile data */ }
}
```

**Save the `userId` from the response!** You'll need it for other endpoints.

---

### 2. GET /api/profile/[userId] - Fetch Profile

```bash
curl http://localhost:3000/api/profile/YOUR_USER_ID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "clxxxxx...",
    "name": "Test User",
    "email": "test@example.com",
    "profile": { /* complete profile */ }
  }
}
```

---

### 3. POST /api/roadmap - Save Roadmap

```bash
curl -X POST http://localhost:3000/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "currentSituation": "You are starting your journey",
    "steps": [
      {
        "title": "Step 1",
        "description": "Complete basic training",
        "icon": "🎯",
        "status": "current"
      },
      {
        "title": "Step 2",
        "description": "Build first project",
        "icon": "🚀",
        "status": "future"
      }
    ],
    "timelineMonths": "6 months"
  }'
```

---

### 4. GET /api/roadmap/[userId] - Fetch Roadmap

```bash
curl http://localhost:3000/api/roadmap/YOUR_USER_ID_HERE
```

---

### 5. POST /api/skill-passport - Save Skills

```bash
curl -X POST http://localhost:3000/api/skill-passport \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "skills": [
      {
        "lifeRole": "Homemaker",
        "mappedSkill": "Budget Management",
        "justification": "Managing household expenses requires financial planning"
      }
    ],
    "generatedContent": {
      "resumeSummary": "Experienced professional with strong organizational skills",
      "bio": "I am a dedicated individual with practical experience",
      "elevatorPitch": "I bring real-world skills to the table"
    }
  }'
```

---

### 6. GET /api/skill-passport/[userId] - Fetch Skills

```bash
curl http://localhost:3000/api/skill-passport/YOUR_USER_ID_HERE
```

---

### 7. GET /api/opportunities - List All Opportunities

```bash
curl http://localhost:3000/api/opportunities
```

**Expected Response:**
```json
{
  "success": true,
  "opportunities": [ /* array of 15 opportunities */ ],
  "count": 15
}
```

---

### 8. GET /api/progress/[userId] - Fetch Progress

```bash
curl http://localhost:3000/api/progress/YOUR_USER_ID_HERE
```

---

## Quick Test with Priya's Data

Since Priya already exists in the database, you can test with her userId.

**Step 1:** Get Priya's userId
```bash
# In Prisma Studio or run this query in Neon SQL Editor:
# SELECT id FROM users WHERE email = 'priya.demo@sherise.app';
```

Priya's email is: `priya.demo@sherise.app`

**Step 2:** Test fetching her profile
```bash
curl http://localhost:3000/api/profile/PRIYA_USER_ID
```

**Step 3:** Test fetching her progress
```bash
curl http://localhost:3000/api/progress/PRIYA_USER_ID
```

---

## Testing Checklist

- [ ] POST /api/profile - Creates new user + profile
- [ ] GET /api/profile/[userId] - Returns user with profile
- [ ] POST /api/roadmap - Saves roadmap with steps
- [ ] GET /api/roadmap/[userId] - Returns latest roadmap
- [ ] POST /api/skill-passport - Saves skills + generated content
- [ ] GET /api/skill-passport/[userId] - Returns skills
- [ ] GET /api/opportunities - Returns all 15 opportunities
- [ ] GET /api/progress/[userId] - Returns progress log

---

## Common Issues

### "User not found" error
- Make sure you're using the correct userId from the POST /api/profile response

### "Validation error"
- Check that all required fields are present in your request body
- Make sure `internetAvailability` is one of: "none", "low", or "stable"

### 500 Internal Server Error
- Check the server console for detailed error messages
- Make sure the dev server is running: `npm run dev`
- Verify your DATABASE_URL is set correctly in .env.local

---

## Next: Phase 3

Once all routes are tested and working, you're ready for **Phase 3: AI Integration**!
