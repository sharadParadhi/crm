# Render Deployment Guide

## Prerequisites
1. Render account (sign up at https://render.com)
2. PostgreSQL database on Render
3. GitHub repository with your code

## Step 1: Create PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `crm-database` (or your preferred name)
   - **Database**: `crm_db`
   - **User**: Auto-generated
   - **Region**: Choose closest to your app
   - **PostgreSQL Version**: 15 or later
   - **Plan**: Free tier (or paid for production)
4. Click **Create Database**
5. **Important**: Copy the **Internal Database URL** (you'll need this)

## Step 2: Create Web Service on Render

1. Go to your Render Dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crm-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if your repo structure requires it)

## Step 3: Configure Environment Variables

In your Render Web Service settings, go to **Environment** tab and add:

### Required Variables:

```env
# Database (use the Internal Database URL from Step 1)
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/crm_db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Port (Render sets this automatically, but include it)
PORT=10000

# Node Environment
NODE_ENV=production

# Frontend URL (your frontend deployment URL)
FRONTEND_URL=https://your-frontend-app.onrender.com

# Email Configuration (Gmail)
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Important Notes:

1. **DATABASE_URL**: 
   - Use the **Internal Database URL** from your PostgreSQL service
   - Format: `postgresql://user:password@host:port/database`
   - Render provides this automatically - just copy it from your database service

2. **JWT_SECRET**: 
   - Generate a strong random string
   - You can use: `openssl rand -base64 32`
   - Or use an online generator

3. **FRONTEND_URL**: 
   - This should be your frontend deployment URL
   - Include the protocol: `https://your-app.onrender.com`

4. **PORT**: 
   - Render sets `PORT` automatically
   - Don't hardcode it, but you can set a default

## Step 4: Update Build and Start Commands

### Build Command:
```bash
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
```

### Start Command:
```bash
cd backend && npm start
```

**Or if your package.json has the scripts:**

### Build Command:
```bash
cd backend && npm install && npm run prisma:generate && npm run build
```

### Start Command:
```bash
cd backend && npm start
```

## Step 5: Database Migrations

Render will automatically run migrations during build if you use `prisma migrate deploy` in the build command.

**Alternative**: You can run migrations manually after deployment:
1. Go to your Web Service → **Shell**
2. Run: `cd backend && npx prisma migrate deploy`

## Step 6: Verify Deployment

1. Check the **Logs** tab for any errors
2. Verify database connection in logs: "Database connected successfully"
3. Test the health endpoint: `https://your-app.onrender.com/health`
4. Test API endpoints: `https://your-app.onrender.com/api/v1/auth/login`

## Troubleshooting

### Error: "Can't reach database server at localhost:5433"

**Problem**: DATABASE_URL is not set or is pointing to localhost

**Solution**:
1. Check Environment Variables in Render dashboard
2. Ensure DATABASE_URL is set to the Internal Database URL
3. The URL should look like: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
4. **NOT** like: `postgresql://user:pass@localhost:5432/dbname`

### Error: "Migration failed"

**Problem**: Database migrations haven't been run

**Solution**:
1. Add `npx prisma migrate deploy` to your build command
2. Or run migrations manually in the Shell: `cd backend && npx prisma migrate deploy`

### Error: "Prisma Client not generated"

**Problem**: Prisma Client needs to be generated before building

**Solution**:
1. Add `npx prisma generate` to your build command
2. Build command should be: `cd backend && npm install && npx prisma generate && npm run build`

### Error: "Module not found"

**Problem**: Dependencies not installed or wrong directory

**Solution**:
1. Ensure build command runs `npm install` in the correct directory
2. Check that `package.json` is in the `backend` folder
3. Verify Root Directory setting in Render

### Database Connection Pooling

For production, consider using connection pooling. Render's Internal Database URL already includes pooling, but you can also use:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?pgbouncer=true&connection_limit=1
```

## Step 7: Frontend Deployment

1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Set Environment Variables:
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api/v1
   VITE_SOCKET_URL=https://your-backend-app.onrender.com
   ```

## Additional Tips

1. **Auto-Deploy**: Enable auto-deploy on git push
2. **Health Checks**: Use `/health` endpoint for health checks
3. **Logs**: Monitor logs regularly for errors
4. **Database Backups**: Enable automatic backups in Render
5. **SSL**: Render provides SSL certificates automatically
6. **Custom Domain**: You can add a custom domain in Render settings

## Environment Variables Checklist

- [ ] DATABASE_URL (Internal Database URL from Render)
- [ ] JWT_SECRET (strong random string)
- [ ] JWT_EXPIRES_IN (e.g., "7d")
- [ ] NODE_ENV (set to "production")
- [ ] FRONTEND_URL (your frontend URL)
- [ ] PORT (Render sets this automatically)
- [ ] EMAIL (your Gmail address)
- [ ] EMAIL_PASSWORD (Gmail App Password)

## Support

If you encounter issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check that migrations have been applied
5. Verify Prisma Client has been generated
