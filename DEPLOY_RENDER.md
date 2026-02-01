# Render Deployment Guide for ContactVault

## Quick Start

### 1. Prerequisites
- ✅ Supabase project running
- ✅ GitHub account
- ✅ Render account (sign up at [render.com](https://render.com))

### 2. Push to GitHub

If you haven't already, initialize a Git repository and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ContactVault ready for deployment"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/contactvault.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com/)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Connect a repository"
   - Authorize GitHub access
   - Select your `contactvault` repository

3. **Configure Service**
   - **Name**: `contactvault` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Choose Plan**
   - **Free**: Good for testing (spins down after inactivity)
   - **Starter ($7/mo)**: Always on, better for production

5. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=production
   ```

   > **Where to find these values?**
   > - Go to your Supabase project
   > - Settings → API
   > - Copy the values from there

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - You'll get a URL like `https://contactvault.onrender.com`

#### Option B: Using render.yaml (Infrastructure as Code)

Create a `render.yaml` file in your project root (already created for you).

Then:
1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will auto-detect the `render.yaml` file
5. Add environment variables manually (they're not in the file for security)

### 4. Post-Deployment Steps

#### Run Database Migration

1. Go to your Supabase Dashboard
2. Click "SQL Editor"
3. Copy the SQL from `migrations/add_emergency_safe_column.sql`
4. Run it

#### Test Your Deployment

Visit your Render URL and test:
- ✅ Sign up / Sign in
- ✅ Create a contact
- ✅ Edit a contact
- ✅ Delete a contact
- ✅ Import CSV
- ✅ Duress Mode toggle

### 5. Custom Domain (Optional)

1. In Render Dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `contactvault.yourdomain.com`)
4. Update DNS records as instructed by Render

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: `Build command failed`
- **Solution**: Check Render logs for specific error
- Verify build works locally with `npm run build`

### App Crashes on Start

**Error**: `Application failed to respond`
- **Solution**: Check environment variables are set correctly
- Verify `npm start` works locally

### Database Connection Issues

**Error**: `Failed to connect to Supabase`
- **Solution**: Double-check environment variables
- Ensure Supabase project is active
- Check Supabase API keys are correct

### Free Tier Spin Down

The free tier spins down after 15 minutes of inactivity.
- First request after spin down takes ~30 seconds
- Upgrade to Starter plan ($7/mo) for always-on service

## Monitoring & Logs

### View Logs
1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. View real-time logs

### Set Up Alerts
1. Go to "Settings" → "Notifications"
2. Add email for deploy notifications
3. Get notified of failures

## Updating Your App

After making changes:

```bash
# Commit changes
git add .
git commit -m "Your update message"

# Push to GitHub
git push

# Render auto-deploys on push!
```

## Cost Estimate

- **Free Tier**: $0/month (spins down after inactivity)
- **Starter**: $7/month (always on, 512MB RAM)
- **Standard**: $25/month (2GB RAM, better performance)

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL (automatic with Render)
- [ ] Set up monitoring/analytics
- [ ] Configure backup strategy for Supabase
- [ ] Add error tracking (e.g., Sentry)
