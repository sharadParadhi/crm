# Quick Fix for Render Deployment Error

## Error: "Can't reach database server at localhost:5433"

This error means your `DATABASE_URL` environment variable is either:
1. Not set in Render
2. Set to `localhost` (which won't work on Render)
3. Using the wrong database URL

## Solution: Set DATABASE_URL in Render

### Step 1: Get Your Database URL from Render

1. Go to your Render Dashboard
2. Click on your **PostgreSQL** database service
3. Look for **Connection Information** or **Internal Database URL**
4. Copy the **Internal Database URL** (it should look like):
   ```
   postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/crm_db
   ```

### Step 2: Set Environment Variable in Your Web Service

1. Go to your **Web Service** (backend) in Render
2. Click on **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL from Step 1
5. Click **Save Changes**

### Step 3: Redeploy

1. Render will automatically redeploy when you save environment variables
2. Or manually trigger a deploy: Click **Manual Deploy** → **Deploy latest commit**

### Step 4: Run Database Migrations

After deployment, you need to run migrations:

**Option A: Add to Build Command (Recommended)**
1. Go to your Web Service settings
2. Update **Build Command** to:
   ```bash
   cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

**Option B: Run Manually via Shell**
1. Go to your Web Service
2. Click **Shell** tab
3. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Step 5: Verify

1. Check the **Logs** tab
2. You should see: "Database connection verified"
3. Test your API: `https://your-app.onrender.com/health`

## Complete Environment Variables Checklist

Make sure these are set in your Render Web Service:

```env
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/crm_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend.onrender.com
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

## Important Notes

1. **Use Internal Database URL**: Don't use the external connection string. Use the **Internal Database URL** from Render.

2. **No localhost**: The DATABASE_URL should NOT contain `localhost` or `127.0.0.1`. It should point to Render's database host.

3. **Run Migrations**: After setting DATABASE_URL, you must run `prisma migrate deploy` to create tables.

4. **Check Logs**: Always check the logs for detailed error messages.

## Still Having Issues?

1. Check Render logs for the exact error message
2. Verify DATABASE_URL doesn't contain `localhost`
3. Ensure database service is running
4. Verify migrations have been applied
5. Check that Prisma Client was generated (`npx prisma generate`)

## Need Help?

- Check `backend/RENDER_DEPLOYMENT.md` for detailed deployment guide
- Render Documentation: https://render.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
