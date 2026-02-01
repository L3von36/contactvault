# 🚀 Render Deployment Checklist

## Pre-Deployment ✅

- [x] Application tested locally
- [x] All tests passing (41/41)
- [x] Environment variables documented
- [x] Git repository initialized
- [x] .gitignore configured
- [ ] Code pushed to GitHub

## Deployment Steps

### 1. Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/contactvault.git
git branch -M main
git push -u origin main
```

### 2. Create Render Account
- [ ] Sign up at [render.com](https://render.com)
- [ ] Verify email

### 3. Deploy Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Environment**: Node

### 4. Add Environment Variables

Copy from your `.env.local`:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NODE_ENV=production`

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (~5-10 minutes)

## Post-Deployment ✅

### Database Setup
- [ ] Run migration SQL in Supabase
  - File: `migrations/add_emergency_safe_column.sql`
  - Location: Supabase Dashboard → SQL Editor

### Testing
- [ ] Visit your Render URL
- [ ] Test sign up
- [ ] Test sign in
- [ ] Create a contact
- [ ] Edit a contact
- [ ] Delete a contact
- [ ] Test import CSV
- [ ] Toggle Duress Mode
- [ ] Test on mobile device

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Configure SSL (automatic)
- [ ] Set up monitoring
- [ ] Configure error tracking

## Troubleshooting

If deployment fails:
1. Check Render logs
2. Verify environment variables
3. Test build locally: `npm run build`
4. Check Supabase connection

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

**Need Help?** Check `DEPLOY_RENDER.md` for detailed instructions.
