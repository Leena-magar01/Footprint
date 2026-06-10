# EcoPilot AI — Google Cloud Deployment Script
# Run these commands ONE BY ONE in PowerShell after installing gcloud SDK

# =============================================
# 1. LOGIN TO GOOGLE CLOUD
# =============================================
# gcloud auth login

# =============================================
# 2. SET YOUR PROJECT (replace with your actual project ID)
# =============================================
# gcloud config set project ecopilot-ai-XXXXXX

# =============================================
# 3. ENABLE ALL REQUIRED APIS
# =============================================
# gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# =============================================
# 4. CREATE ARTIFACT REGISTRY REPOSITORY
# =============================================
# gcloud artifacts repositories create ecopilot-repo --repository-format=docker --location=us-central1 --description="EcoPilot Docker images"

# =============================================
# 5. CONFIGURE DOCKER TO USE GOOGLE REGISTRY
# =============================================
# gcloud auth configure-docker us-central1-docker.pkg.dev

# =============================================
# 6. BUILD & PUSH DOCKER IMAGE (run from project root)
# =============================================
# docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecopilot-repo/ecopilot-backend:latest ./backend
# docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecopilot-repo/ecopilot-backend:latest

# =============================================
# 7. DEPLOY BACKEND TO CLOUD RUN
# =============================================
# gcloud run deploy ecopilot-backend \
#   --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecopilot-repo/ecopilot-backend:latest \
#   --region us-central1 \
#   --platform managed \
#   --allow-unauthenticated \
#   --port 5000 \
#   --memory 512Mi \
#   --cpu 1 \
#   --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" \
#   --set-env-vars="NODE_ENV=production"

# =============================================
# 8. GET YOUR BACKEND URL
# =============================================
# gcloud run services describe ecopilot-backend --region us-central1 --format "value(status.url)"

# =============================================
# 9. BUILD FRONTEND (replace URL with your Cloud Run URL)
# =============================================
# cd frontend
# set VITE_API_URL=https://ecopilot-backend-XXXXXXXX-uc.a.run.app/api
# npm run build

# =============================================
# 10. DEPLOY FRONTEND TO FIREBASE HOSTING
# =============================================
# npm install -g firebase-tools
# firebase login
# firebase init hosting
#   -> Select your project
#   -> Public directory: dist
#   -> Single page app: YES
#   -> Don't overwrite index.html
# firebase deploy
