# Deployment Guide

## Quick Start Checklist

Before deploying, ensure you have:

- [ ] Supabase project created
- [ ] Database tables set up in Supabase
- [ ] Environment variables configured
- [ ] Code pushed to GitHub

## Step-by-Step Deployment

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project details
   - Wait for the project to initialize

2. **Get Your Supabase Credentials**
   - Go to Settings > API
   - Copy your project URL and anon public key
   - Note down your database password

3. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the SQL from `src/lib/database.ts` (the `createTablesSQL` constant)
   - Paste and execute the SQL
   - Verify tables are created in the Table Editor

### 2. Local Development Setup

1. **Environment Variables**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://jrcqvuyuvmxgphqlgphy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_PASSWORD=your_actual_password_here
   ```

2. **Test Locally**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Test user registration
   - Verify dashboard loads

### 3. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Finance tracker app"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Choose the `finance-app` repository

3. **Configure Environment Variables**
   In Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://jrcqvuyuvmxgphqlgphy.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
     SUPABASE_PASSWORD=your_actual_password_here
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### 4. Post-Deployment Verification

1. **Test Authentication**
   - Visit your deployed app
   - Create a new account
   - Verify email confirmation works
   - Test login/logout

2. **Test API Endpoints**
   - Check dashboard loads without errors
   - Verify `/api/init-db` endpoint returns proper response
   - Test that user data is isolated (create multiple accounts)

3. **Check Database**
   - Go to Supabase Table Editor
   - Verify user data appears in auth.users
   - Check that RLS policies are working

## Environment Variables Reference

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_PASSWORD` | Database password | `your_secure_password` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | For admin operations | `eyJhbGciOiJIUzI1NiIs...` |
| `DATABASE_URL` | Direct database connection | `postgresql://postgres:...` |

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key secured (not exposed to client)
- [ ] HTTPS enforced on production
- [ ] Environment variables properly configured
- [ ] User authentication working
- [ ] Data isolation verified

## Performance Optimization

### For Production

1. **Enable Compression**
   - Vercel automatically handles this

2. **Database Optimization**
   - Indexes are created by default
   - Consider connection pooling for high traffic

3. **Image Optimization**
   - Next.js handles this automatically

4. **Caching**
   - API routes cache database queries when appropriate
   - Static assets cached by Vercel CDN

## Monitoring and Maintenance

### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review authentication logs

### Vercel Analytics
- Track page performance
- Monitor function execution times
- Review deployment logs

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for user session replay
- Custom analytics for business metrics

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Redeploy after adding variables
   - Verify variables in Vercel dashboard

2. **Database Connection Failed**
   - Verify Supabase URL and keys
   - Check if database is paused (free tier)
   - Review network connectivity

3. **Authentication Not Working**
   - Check Supabase auth settings
   - Verify email templates configured
   - Test with different email providers

4. **API Routes Returning 500**
   - Check Vercel function logs
   - Verify database schema matches code
   - Test queries in Supabase SQL editor

### Getting Help

- Check Vercel deployment logs
- Review Supabase real-time logs
- Test API endpoints with curl/Postman
- Use browser developer tools for client-side issues

## Scaling Considerations

### Database
- Monitor connection limits
- Consider upgrading Supabase plan for higher limits
- Implement connection pooling if needed

### Serverless Functions
- Monitor execution time and memory usage
- Consider upgrading Vercel plan for higher limits
- Optimize database queries for performance

### Storage
- Plan for file uploads (future feature)
- Consider CDN for static assets
- Monitor bandwidth usage
