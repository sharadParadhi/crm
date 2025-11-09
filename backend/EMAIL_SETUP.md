# Gmail Email Setup Guide

## Problem
Gmail requires an **App Password** instead of your regular Gmail password when using SMTP from third-party applications.

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, enable **2-Step Verification**
4. Follow the prompts to set up 2FA (you'll need your phone)

### Step 2: Generate App Password
1. Go to [Google Account Settings > Security](https://myaccount.google.com/security)
2. Under **Signing in to Google**, click on **2-Step Verification**
3. Scroll down and click on **App passwords**
4. You may need to sign in again
5. Select **Mail** as the app
6. Select **Other (Custom name)** as the device
7. Enter a name like "CRM System" or "Node.js App"
8. Click **Generate**
9. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
1. Open `backend/.env`
2. Update the `EMAIL_PASSWORD` with the App Password you just generated:
   ```
   EMAIL=sharadparadhi2124@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  (your 16-character app password, no spaces)
   ```
3. Save the file
4. Restart your server

### Step 4: Verify
1. Restart your backend server
2. Try creating a lead and assigning it to a user with an email
3. Check the server logs - you should see "Email sent successfully"
4. Check the user's email inbox

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Cause**: Using regular Gmail password instead of App Password
- **Solution**: Generate an App Password following the steps above

### Error: "Less secure app access"
- **Cause**: Gmail no longer supports "Less secure app access"
- **Solution**: You MUST use App Passwords with 2FA enabled

### Error: "App passwords not available"
- **Cause**: 2FA is not enabled on your Google account
- **Solution**: Enable 2-Step Verification first (Step 1 above)

### Emails not being received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check server logs for error messages
- Verify the App Password is correct (no spaces, all 16 characters)

## Alternative: Use Other Email Providers

If you prefer not to use Gmail, you can configure other providers:

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
```

### AWS SES
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### Outlook/Office 365
```env
EMAIL_SERVICE=outlook
EMAIL=your-email@outlook.com
EMAIL_PASSWORD=your_password
```

## Security Notes
- Never commit your `.env` file to version control
- App Passwords are safer than regular passwords
- Each App Password is unique and can be revoked independently
- If compromised, revoke the App Password immediately and generate a new one
