# Using This Project as a Seed

## Step 1: Clone and Rename the Project

1. Clone the repository:

   ```bash
   git clone https://github.com/[original-repo]/next-drizzle-tailwind-auth.git new-project-name
   cd new-project-name
   ```

2. Remove the existing Git history and initialize a new repository:

   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit from seed project"
   ```

3. Update project name in `package.json`:
   ```json
   {
     "name": "your-new-project-name"
     // other fields...
   }
   ```

## Step 2: Set Up Database

1. Create a new Neon Database project:

   - Go to [Neon](https://neon.tech/) and create an account if you don't have one
   - Create a new project
   - Create a new database
   - Get the connection string from the dashboard

2. Update the `.env.local` file with your new database connection string:

   ```
   APP_ENV=LOCAL
   DB_URL=postgresql://[your-username]:[your-password]@[your-host]/[your-database]?sslmode=require
   MIGRATIONS_PATH=./drizzle/migrations
   ```

3. Generate and apply migrations:
   ```bash
   npm run generate
   npm run migrate
   ```

## Step 3: Configure Third-Party Services

### Email Service (Resend)

1. Create a [Resend](https://resend.com/) account
2. Create an API key
3. Update `.env.local` with your Resend API key:
   ```
   RESEND_API_KEY=your_resend_api_key
   ```
4. Update sender email in `src/actions/emails.tsx` if needed

### Error Monitoring (Highlight)

1. Create a [Highlight](https://highlight.io/) account
2. Create a new project
3. Get your API key
4. Update `.env.local` with your Highlight API key:
   ```
   HIGHLIGHT_API_KEY=your_highlight_api_key
   ```
5. Update the project ID in `src/highlight-error.ts` if needed

## Step 4: Update E2E Testing Configuration

1. Update the `.env.e2e` file:

   ```
   APP_ENV=E2E
   DB_URL=postgresql://test:test@localhost:5433/testdb
   MIGRATIONS_PATH=./drizzle/e2e-migrations
   E2E_URL=http://localhost:3001
   RESEND_API_KEY=noEmailsForE2E
   ```

2. If needed, update the Docker configuration in `scripts/start-e2e-db.cjs`

## Step 5: Update GitHub Actions

1. Update the GitHub repository secrets:

   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `DB_URL`: Your database connection string
     - `HIGHLIGHT_API_KEY`: Your Highlight API key
     - `RESEND_API_KEY`: Your Resend API key

2. Review and update the GitHub Actions workflows in `.github/workflows/` if needed

## Step 6: Customize the Application

### Update Authentication

1. Review and update user schema in `src/db/schema.ts`
2. Update authentication logic in:
   - `src/app/login/actions.ts`
   - `src/app/register/actions.ts`
   - `src/app/auth.ts`

### Update UI

1. Update the branding and UI components in:

   - `src/app/layout.tsx`
   - `src/app/page.tsx`
   - `src/components/`

2. Update Tailwind configuration in `tailwind.config.js` if needed

### Update Email Templates

1. Customize email templates in `src/react-email/emails/`

## Step 7: Deploy to Netlify

1. **Create a Netlify account**:

   - Sign up at [Netlify](https://app.netlify.com/signup) if you don't already have an account

2. **Connect your GitHub repository**:

   - Go to the Netlify dashboard
   - Click "Add new site" → "Import an existing project"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your repository

3. **Configure build settings**:

   - Build command: `npm run build`
   - Publish directory: `.next`
   - Set Node.js version to 18 or higher in the environment variables

4. **Add environment variables**:

   - In the Netlify dashboard, go to Site settings → Environment variables
   - Add all required environment variables:
     - `DB_URL`: Your Neon database connection string
     - `RESEND_API_KEY`: Your Resend API key
     - `HIGHLIGHT_API_KEY`: Your Highlight API key
     - `NODE_VERSION`: Set to `18` or higher

5. **Deploy your site**:

   - Click "Deploy site"
   - Wait for the build and deployment to complete

6. **Set up a custom domain (optional)**:

   - In the Netlify dashboard, go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow the instructions to configure your domain

7. **Enable continuous deployment**:
   - Netlify automatically sets up continuous deployment from your GitHub repository
   - Every push to your main branch will trigger a new deployment

## Common Issues and Troubleshooting

### Database Connection Issues

- Ensure your database connection string is correct
- Check that your IP is allowed in the Neon database firewall settings
- Verify that the database user has the necessary permissions

### Email Sending Issues

- Verify your Resend API key is correct
- Check that your sending domain is verified in Resend
- Look for error messages in the Resend dashboard

### E2E Testing Issues

- Ensure Docker is running for the E2E database
- Check that the PostgreSQL container is accessible on port 5433
- Verify that the E2E database migrations are applied correctly
