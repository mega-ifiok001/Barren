# Deploying Barren to Vercel

## Important Notes

⚠️ **Vercel does NOT use Docker**. Vercel uses serverless functions and has its own deployment infrastructure. The configuration below is specifically for Vercel's platform.

## Prerequisites

1. **MongoDB Atlas Account** (Required)

   - Vercel serverless functions need a cloud-hosted database
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string
   - Whitelist `0.0.0.0/0` in Network Access to allow Vercel's dynamic IPs

2. **Vercel Account**

   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm install -g vercel`

3. **Environment Variables**
   - You'll need to configure these in Vercel dashboard

## Step-by-Step Deployment

### 1. Prepare Your Code

✅ Already done:

- Created `vercel.json` configuration
- Updated `package.json` with proper start script
- Updated `.gitignore`

### 2. Update Environment Variables

Make sure your `.env` file has all required variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PAYSTACK_TEST_SECRET_KEY=your_paystack_test_key
PAYSTACK_LIVE_SECRET_KEY=your_paystack_live_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts
   - Choose your project name
   - Select the root directory
   - Vercel will auto-detect it's a Node.js project

3. **Add Environment Variables**

   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   vercel env add PAYSTACK_TEST_SECRET_KEY
   vercel env add PAYSTACK_LIVE_SECRET_KEY
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   ```

   - For each variable, paste the value when prompted
   - Select "Production" environment

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`
5. Add Environment Variables in the dashboard
6. Click "Deploy"

### 4. Post-Deployment Configuration

1. **Update Invoice URLs**

   - Update the `invoiceUrl` in `controllers/paymentController.js` (line 107 & 113)
   - Replace `https://8prsfpp6-3000.uks1.devtunnels.ms` with your Vercel domain
   - Example: `https://your-app-name.vercel.app`

2. **Update Paystack Webhook**

   - Go to Paystack dashboard
   - Update webhook URL to: `https://your-app-name.vercel.app/api/payment/webhook`

3. **Test Your Deployment**
   - Visit your Vercel URL
   - Test authentication
   - Test event creation
   - Test payment flow

## Important Limitations

### ⚠️ Vercel Serverless Limitations:

1. **Function Timeout**: 10 seconds (Hobby plan) / 60 seconds (Pro plan)
2. **File Uploads**: Multer file uploads work but files are NOT persisted between requests
   - You MUST use Cloudinary (already configured) for image storage
3. **Database Connections**: Use connection pooling with MongoDB Atlas
4. **Static Files**: Served from `/public` directory

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution**: Make sure MongoDB Atlas connection string is correct and IP whitelist includes `0.0.0.0/0`

### Issue: "Function timeout"

**Solution**: Optimize database queries or upgrade to Vercel Pro

### Issue: "Images not loading"

**Solution**: Ensure all image paths use absolute paths starting with `/` (e.g., `/images/logo.svg`)

### Issue: "Environment variables not working"

**Solution**:

- Redeploy after adding environment variables
- Make sure variables are set for "Production" environment
- Run `vercel env pull` to verify locally

## Alternative: Docker Deployment (Not for Vercel)

If you want to use Docker for deployment on other platforms (AWS, DigitalOcean, etc.), I can create a Dockerfile and docker-compose.yml. However, this won't work with Vercel.

Would you like me to create Docker configuration for alternative deployment platforms?

## Monitoring

- View logs: `vercel logs`
- View deployments: `vercel ls`
- View project details: `vercel inspect`

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel remove [deployment-name]

# List deployments
vercel ls

# Pull environment variables
vercel env pull
```
