# MongoDB Atlas Connection Guide

## Quick Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is perfect for development)

### 2. Get Your Connection String

1. In Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as driver and version 4.1 or later
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 3. Configure Network Access

1. In Atlas, go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. For development/Vercel: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, you should restrict this to specific IPs
4. Click "Confirm"

### 4. Create Database User

1. In Atlas, go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Set role to "Read and write to any database"
6. Click "Add User"

### 5. Update Your .env File

Replace the placeholder in your connection string with your actual password:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/barren?retryWrites=true&w=majority
```

**Important:**

- Replace `your_username` with your database username
- Replace `your_password` with your database password
- Replace `cluster0.xxxxx` with your actual cluster address
- The `/barren` part is your database name (you can change this)

### Example

If your username is `barren_user` and password is `SecurePass123`, your connection string would be:

```env
MONGODB_URI=mongodb+srv://barren_user:SecurePass123@cluster0.abc123.mongodb.net/barren?retryWrites=true&w=majority
```

## Testing Your Connection

Run your app locally:

```bash
npm run dev
```

You should see:

```
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Database: barren
```

## For Vercel Deployment

Add the `MONGODB_URI` environment variable in Vercel:

### Via CLI:

```bash
vercel env add MONGODB_URI
```

Then paste your full connection string when prompted.

### Via Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `MONGODB_URI` with your connection string
4. Select "Production", "Preview", and "Development"
5. Save

## Troubleshooting

### Error: "Could not connect to any servers"

- Check that you've whitelisted your IP (0.0.0.0/0 for Vercel)
- Verify your username and password are correct
- Make sure there are no special characters in your password that need URL encoding

### Error: "Authentication failed"

- Double-check your username and password
- Make sure the user has proper permissions
- If password has special characters, URL encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - etc.

### Error: "Server selection timed out"

- Check your internet connection
- Verify network access settings in Atlas
- Try increasing `serverSelectionTimeoutMS` in dbConfig.js

## Connection String Format Explained

```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

- `mongodb+srv://` - Protocol (SRV record for automatic failover)
- `username:password` - Your database credentials
- `@cluster.mongodb.net` - Your cluster address
- `/database` - Database name (optional, defaults to 'test')
- `?options` - Connection options (retryWrites, w, etc.)

## Security Best Practices

1. **Never commit .env to Git** (already in .gitignore)
2. **Use strong passwords** for database users
3. **Restrict IP access** in production
4. **Rotate credentials** periodically
5. **Use different credentials** for dev/staging/production
