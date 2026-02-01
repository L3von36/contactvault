# 📋 YOUR ENVIRONMENT VARIABLES FOR RENDER

Copy these EXACT values when setting up Render environment variables.

---

## Variable 1: NEXT_PUBLIC_SUPABASE_URL

**Key:**
```
NEXT_PUBLIC_SUPABASE_URL
```

**Value:**
```
https://dmtexkccpomzcviforny.supabase.co
```

---

## Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

**Key:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdGV4a2NjcG9temN2aWZvcm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Njk5MTIsImV4cCI6MjA4NTQ0NTkxMn0.v3VQghnHEJfwf8inf60-tiVHwS8bBuacXKEE61FPxPM
```

---

## Variable 3: SUPABASE_SERVICE_ROLE_KEY

**Key:**
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:**
```
⚠️ YOU NEED TO GET THIS FROM SUPABASE!

1. Go to: https://supabase.com/dashboard/project/dmtexkccpomzcviforny/settings/api
2. Look for "service_role" key (it's a secret key)
3. Click "Copy" or reveal it
4. Paste it here in Render
```

---

## Variable 4: NODE_ENV

**Key:**
```
NODE_ENV
```

**Value:**
```
production
```

---

## 🔑 How to Get Service Role Key

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Scroll to **Project API keys**
5. Find **service_role** (secret)
6. Click **Copy** or reveal the key
7. Paste into Render

---

## ⚠️ SECURITY NOTE

- **NEVER** commit these values to Git
- **NEVER** share these publicly
- The service_role key is especially sensitive - it bypasses Row Level Security
