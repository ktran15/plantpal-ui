# Backend Setup Guide

## Environment Variables Configuration

### Step 1: Google Cloud / Vertex AI Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable Vertex AI API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"
4. Create Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name it (e.g., "plantpal-vertex-ai")
   - Grant role: "Vertex AI User"
   - Click "Done"
5. Create and Download Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the key file
   - Store it securely (e.g., `./keys/gcp-service-account.json`)
   - **NEVER commit this file to git**

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select or create a project
3. Enable Firestore:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (update rules later for production)
   - Select a location
4. Enable Storage:
   - Go to "Storage"
   - Click "Get started"
   - Start in test mode
5. Get Service Account Credentials:
   - Go to "Project Settings" → "Service Accounts"
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
6. Get Frontend Config:
   - Go to "Project Settings" → "General"
   - Scroll to "Your apps"
   - Click the web icon (</>) to add a web app
   - Copy the config values to `.env` with `VITE_` prefix

### Step 3: Create .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all the values from the steps above

3. **Important**: Add `.env` to `.gitignore` to prevent committing secrets

### Step 4: Install Dependencies

```bash
pnpm install
```

### Step 5: Verify Setup

The backend will automatically use these environment variables when you start the API server.

## Security Notes

- Never commit `.env` files or service account keys to version control
- Use different credentials for development and production
- Rotate keys regularly
- Use Firebase Security Rules to restrict access
- Enable CORS only for your frontend domain in production

