# SEO Dashboard — Deployment Setup Guide

This guide walks you through connecting the GitHub repository to Netlify and configuring all required environment variables. No coding required.

---

## Step 1: Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com) and log in (or create an account)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access GitHub if prompted
5. Find and select the repository: **`worksmtechswiss-hub/seodashboard`**
6. On the "Build settings" screen, the fields should auto-fill from the repo. Verify:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
7. Click **"Deploy site"**

Netlify will assign a URL like `https://random-name-123.netlify.app`. You'll need this URL in Step 3.

> **Tip:** You can set a custom subdomain in Netlify under **Site settings → Domain management**.

---

## Step 2: Find your Netlify site URL

After the first deploy completes:

1. Go to your site in the Netlify dashboard
2. The URL is shown at the top (e.g., `https://seodashboard.netlify.app`)
3. **Copy this URL** — you'll need it for the Google OAuth setup below

---

## Step 3: Set Up Google OAuth Credentials

> This allows the dashboard to connect to Google Search Console and Google Analytics.

### 3a. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **"New Project"**
3. Name it `SEO Dashboard` → click **"Create"**
4. Make sure the new project is selected in the dropdown

### 3b. Enable the required APIs

1. In the left menu, go to **APIs & Services → Library**
2. Search for and enable each of these (click "Enable" on each):
   - **Google Search Console API**
   - **Google Analytics Data API**

### 3c. Create OAuth 2.0 credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted to configure the consent screen first:
   - Click **"Configure Consent Screen"**
   - Choose **"Internal"** (if using a Google Workspace account) or **"External"**
   - Fill in: App name = `SEO Dashboard`, User support email = your email
   - Add your email to "Developer contact information"
   - Click **Save and Continue** through the remaining steps
4. Back on the Credentials page, click **"+ Create Credentials"** → **"OAuth client ID"**
5. Application type: **"Web application"**
6. Name: `SEO Dashboard`
7. Under **"Authorized redirect URIs"**, click **"+ Add URI"** and enter:
   ```
   https://YOUR-NETLIFY-URL.netlify.app/.netlify/functions/google-auth
   ```
   *(Replace `YOUR-NETLIFY-URL` with your actual Netlify URL from Step 2)*
8. Click **"Create"**
9. A popup shows your credentials — **copy both values:**
   - `Client ID` → this is `GOOGLE_CLIENT_ID`
   - `Client Secret` → this is `GOOGLE_CLIENT_SECRET`

---

## Step 4: Get a Formspree API Key

> This allows the dashboard to display form submission leads.

1. Go to [formspree.io](https://formspree.io) and log in
2. Click your account name (top right) → **"Account Settings"**
3. Go to the **"API Keys"** tab
4. Click **"Create API Key"**, name it `SEO Dashboard`
5. **Copy the key** → this is `FORMSPREE_API_KEY`

---

## Step 5: Create a GitHub Personal Access Token

> This allows the AI agents to create pull requests on your websites' repos.

1. Go to [github.com](https://github.com) and log in as the account that owns the websites' repositories
2. Click your profile picture (top right) → **"Settings"**
3. Scroll to the bottom of the left sidebar → **"Developer settings"**
4. Go to **"Personal access tokens"** → **"Tokens (classic)"**
5. Click **"Generate new token"** → **"Generate new token (classic)"**
6. Note: `SEO Dashboard agents`
7. Expiration: choose **"No expiration"** (or set a yearly reminder to rotate it)
8. Under **Scopes**, check the box for **`repo`** (this selects all repo sub-permissions)
9. Click **"Generate token"**
10. **Copy the token immediately** (it won't be shown again) → this is `GITHUB_TOKEN`

---

## Step 6: Add Environment Variables to Netlify

1. In the Netlify dashboard, go to your site
2. Click **"Site configuration"** in the left menu → **"Environment variables"**
3. Click **"Add a variable"** for each of the 5 variables below:

| Variable name | Where to get the value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Step 3c (starts with numbers, ends in `.apps.googleusercontent.com`) |
| `GOOGLE_CLIENT_SECRET` | From Step 3c (short alphanumeric string) |
| `GOOGLE_REDIRECT_URI` | Type this exactly: `https://YOUR-NETLIFY-URL/.netlify/functions/google-auth` |
| `FORMSPREE_API_KEY` | From Step 4 |
| `GITHUB_TOKEN` | From Step 5 (starts with `ghp_`) |

> **Important for `GOOGLE_REDIRECT_URI`:** Use your actual Netlify URL — same one you added in the Google OAuth settings in Step 3c. The value must match exactly.

4. After adding all 5 variables, click **"Deploy"** in the Netlify sidebar → **"Trigger deploy"** → **"Deploy site"** to apply the new variables.

---

## Step 7: Verify Everything Works

1. Open the dashboard URL in your browser
2. You should see the SEO dashboard load with mock data
3. Click **"Connect Google"** in the top bar
4. You should be redirected to a Google login screen
5. After logging in and approving permissions, you'll be returned to the dashboard
6. The "Connect Google" button should disappear, confirming authentication worked

---

## Troubleshooting

**"Connect Google" button keeps reappearing after login**
- Double-check that `GOOGLE_REDIRECT_URI` in Netlify matches exactly what you entered in the Google Cloud Console (Step 3c). Even a trailing slash difference will break it.

**Google shows "redirect_uri_mismatch" error**
- The URI in your Google OAuth credentials doesn't match the one in Netlify. Go back to Google Cloud Console → Credentials → edit the OAuth client → check the Authorized redirect URIs.

**Dashboard doesn't load at all**
- Go to Netlify → your site → **"Deploys"** and check if the build failed. Click the failed deploy to see the error log.

**Form submissions not appearing**
- Make sure `FORMSPREE_API_KEY` is set correctly and that each website's Formspree form has the webhook URL configured in the Formspree dashboard:
  `https://YOUR-NETLIFY-URL/.netlify/functions/formspree-webhook`

---

## Summary of Credentials Needed

| Credential | Source | Netlify variable name |
|---|---|---|
| Google Client ID | Google Cloud Console | `GOOGLE_CLIENT_ID` |
| Google Client Secret | Google Cloud Console | `GOOGLE_CLIENT_SECRET` |
| Google Redirect URI | Your Netlify URL | `GOOGLE_REDIRECT_URI` |
| Formspree API Key | Formspree account settings | `FORMSPREE_API_KEY` |
| GitHub Token | GitHub developer settings | `GITHUB_TOKEN` |
