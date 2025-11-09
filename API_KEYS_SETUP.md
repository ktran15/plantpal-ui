# API Keys and Configuration Setup

## Required API Keys and Where to Add Them

### 1. Gemini API Key (Frontend)
**Location**: `.env` file in project root
```
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```
**Where to get it**: 
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy and paste into `.env`

### 2. Google Cloud / Vertex AI (Backend)
**Location**: `.env` file in project root
```
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```
**Where to get it**:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing
- Enable Vertex AI API
- Create Service Account → Download JSON key
- See `SETUP_BACKEND.md` for detailed instructions

### 3. Firebase Configuration (Frontend)
**Location**: `.env` file in project root
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```
**Where to get it**:
- Go to [Firebase Console](https://console.firebase.google.com/)
- Project Settings → General → Your apps → Web app config
- Copy all values with `VITE_` prefix

### 4. Firebase Admin (Backend)
**Location**: `.env` file in project root
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```
**Where to get it**:
- Firebase Console → Project Settings → Service Accounts
- Generate new private key
- Extract values from JSON file
- See `SETUP_BACKEND.md` for detailed instructions

### 5. API Server Configuration
**Location**: `.env` file in project root
```
API_PORT=3001
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
```
**Note**: `VITE_API_BASE_URL` is for frontend to know where the API server is running

## Quick Setup Checklist

1. ✅ Create `.env` file from `.env.example`
2. ✅ Add `VITE_GEMINI_API_KEY` (for plant identification/chat)
3. ✅ Set up Google Cloud project and get service account key
4. ✅ Set up Firebase project and get config values
5. ✅ Add all Firebase frontend config (VITE_*)
6. ✅ Add Firebase Admin credentials
7. ✅ Install dependencies: `pnpm install`
8. ✅ Start API server: `pnpm run dev:server` (in separate terminal)
9. ✅ Start frontend: `pnpm run dev`

## Important Notes

- **Never commit `.env` files** to version control
- Store service account keys securely
- Use different credentials for development and production
- The API server must be running for plant agent features to work
- Firebase Authentication must be set up for user-specific features

## Testing the Setup

1. Start the API server: `pnpm run server`
2. Check health endpoint: `http://localhost:3001/health`
3. Start the frontend: `pnpm run dev`
4. Test plant identification in Camera page
5. Test PlantPal chat feature

