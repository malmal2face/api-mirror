# Deployment Guide

This guide walks you through deploying the Cricket Data Hub application to production.

## Prerequisites

- Supabase account (free tier works)
- Node.js 18+ installed
- Git repository (GitHub, GitLab, etc.)
- Vercel/Netlify account (for frontend hosting) or any static hosting service

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and name your project
4. Set a strong database password
5. Select region closest to your users
6. Wait for project creation (2-3 minutes)

### 1.2 Get Project Credentials

1. Go to Project Settings > API
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### 1.3 Database Setup

The database schema has already been applied during development. If you need to apply it manually:

1. Go to SQL Editor in Supabase dashboard
2. Run the migration SQL from the development setup
3. Verify all tables are created with proper RLS policies

### 1.4 Edge Functions

The Edge Functions have already been deployed during development:
- `sync-cricket-data` - Data synchronization function
- `cricket-api` - API endpoint function

To verify deployment:
1. Go to Edge Functions in Supabase dashboard
2. Confirm both functions are listed and deployed
3. Check function logs for any errors

## Step 2: Environment Configuration

### 2.1 Local Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SPORTMONKS_API_URL=https://cricket.sportmonks.com/api/v2.0
VITE_SPORTMONKS_API_TOKEN=BdX22sWKKmJHbLsvIQEQesYN7riNnmiAgTnCdWlgj5XwcmA5PucrUdNVCFXz
```

### 2.2 Production Environment

For production hosting (Vercel/Netlify), set environment variables:

**Vercel:**
1. Go to Project Settings > Environment Variables
2. Add each variable with its value
3. Set for Production, Preview, and Development

**Netlify:**
1. Go to Site Settings > Environment Variables
2. Add each variable with its value
3. Set scope to "All"

## Step 3: Frontend Deployment

### Option A: Vercel (Recommended)

1. **Connect Repository:**
   ```bash
   # Push code to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables
   - Click "Deploy"

3. **Configure Domain (Optional):**
   - Go to Project Settings > Domains
   - Add custom domain
   - Update DNS records as instructed

### Option B: Netlify

1. **Build Locally:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Or use Netlify Dashboard:**
   - Drag and drop `dist` folder
   - Or connect Git repository for auto-deployment

### Option C: Self-Hosted

1. **Build Production:**
   ```bash
   npm run build
   ```

2. **Serve with Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/cricket-data-hub/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Step 4: Initial Data Sync

After deployment:

1. Login to admin dashboard (admin/admin123)
2. Go to "Sync Status" tab
3. Click "Sync All" button
4. Wait for initial data sync to complete
5. Verify data in "Overview" tab

## Step 5: API User Setup

### 5.1 Create API Users

1. Login to admin dashboard
2. Navigate to "User Management"
3. Create users for API access

### 5.2 Generate API Keys

1. Select user
2. Click "Add Key"
3. Set rate limit (default: 60/min)
4. Generate and save key securely

### 5.3 Test API

```bash
curl -X GET "https://xxxxx.supabase.co/functions/v1/cricket-api/teams" \
  -H "X-API-Key: your_generated_key"
```

## Step 6: Monitoring Setup

### 6.1 Supabase Dashboard

Monitor in Supabase dashboard:
- Database usage
- Edge Function invocations
- API requests
- Error logs

### 6.2 Application Monitoring

Within the admin dashboard:
- Sync status and errors
- API usage statistics
- Request logs
- Performance metrics

### 6.3 Set Up Alerts (Optional)

Create alerts for:
- Sync failures
- High API error rates
- Rate limit violations
- Database connection issues

## Step 7: Security Hardening

### 7.1 Change Default Credentials

**Important:** Update the hardcoded admin credentials in production:

1. Edit `src/contexts/AuthContext.tsx`
2. Change username and password
3. Rebuild and redeploy

### 7.2 Database Security

1. Review RLS policies
2. Ensure service role key is not exposed
3. Enable database backups in Supabase

### 7.3 API Security

1. Monitor API key usage
2. Rotate keys periodically
3. Set appropriate rate limits
4. Review API logs regularly

## Step 8: Backup Strategy

### 8.1 Database Backups

Supabase provides automatic daily backups on paid plans. For manual backups:

```bash
# Using pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### 8.2 Code Backups

- Keep Git repository as source of truth
- Tag releases: `git tag v1.0.0`
- Use GitHub/GitLab for redundancy

## Step 9: Performance Optimization

### 9.1 Database Optimization

1. Add indexes for frequently queried columns (already included in schema)
2. Monitor slow queries in Supabase dashboard
3. Consider read replicas for high traffic

### 9.2 Edge Function Optimization

1. Monitor function execution time
2. Optimize batch sizes for sync
3. Use connection pooling
4. Consider caching strategies

### 9.3 Frontend Optimization

1. Enable gzip compression
2. Use CDN for static assets
3. Implement lazy loading
4. Cache API responses

## Step 10: Scaling Considerations

### When to Scale

- API requests exceed rate limits consistently
- Sync operations take too long
- Database connections maxed out
- High error rates

### Scaling Options

**Database:**
- Upgrade Supabase plan
- Add read replicas
- Optimize queries and indexes

**Edge Functions:**
- Increase function timeout
- Optimize batch processing
- Add caching layer (Redis)

**Frontend:**
- Use CDN
- Implement server-side rendering
- Add load balancer

## Troubleshooting

### Deployment Fails

1. Check build logs
2. Verify all dependencies installed
3. Ensure environment variables set
4. Check Node.js version compatibility

### Database Connection Issues

1. Verify database URL and credentials
2. Check firewall/network settings
3. Review connection pooling settings
4. Check Supabase project status

### Edge Function Errors

1. Review function logs in Supabase
2. Test functions individually
3. Check API rate limits
4. Verify service role key permissions

### Sync Not Working

1. Check SportMonks API credentials
2. Verify Edge Function deployment
3. Review sync_status table
4. Check network connectivity

## Maintenance

### Daily
- Monitor sync status
- Check API error rates
- Review unusual activity

### Weekly
- Review API usage patterns
- Check database size
- Update rate limits if needed

### Monthly
- Update dependencies
- Review security logs
- Backup database manually
- Test disaster recovery

## Cost Estimation

### Supabase Free Tier
- 500MB database
- 2GB bandwidth
- 500K Edge Function invocations
- Sufficient for small-medium projects

### Supabase Pro ($25/month)
- 8GB database
- 50GB bandwidth
- 2M Edge Function invocations
- Daily backups
- Recommended for production

### Hosting (Vercel/Netlify)
- Free tier: 100GB bandwidth
- Pro: $20/month for unlimited
- Custom domain included

### Total Estimated Cost
- Development: Free
- Small production: $0-25/month
- Medium production: $25-50/month
- Large production: $50-100+/month

## Support Resources

- Supabase Documentation: https://supabase.com/docs
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev

## Rollback Procedure

If deployment fails:

1. **Frontend Rollback:**
   ```bash
   # Vercel
   vercel rollback

   # Netlify
   # Use dashboard to restore previous deploy
   ```

2. **Database Rollback:**
   - Restore from Supabase backup
   - Or run rollback migration SQL

3. **Edge Function Rollback:**
   - Redeploy previous version
   - Or temporarily disable problematic function

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database schema applied
- [ ] Edge Functions deployed and working
- [ ] Initial data sync completed
- [ ] Admin dashboard accessible
- [ ] API endpoints responding
- [ ] API keys generated and tested
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security hardened
- [ ] Documentation updated
- [ ] Team trained on admin dashboard

## Next Steps

After successful deployment:

1. Set up regular monitoring routine
2. Create API documentation for users
3. Implement analytics (optional)
4. Set up CI/CD pipeline
5. Plan for scaling
6. Establish backup verification process
7. Create incident response plan
