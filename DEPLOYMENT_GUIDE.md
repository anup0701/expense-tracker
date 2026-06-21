# Step-by-Step Setup and Deployment Guide

This document provides detailed instructions for setting up the Expense Tracker application in both Development and Production environments.

## 1. Prerequisites
Before starting, ensure you have the following installed on your local machine:
- **Docker** and **Docker Compose**
- **Git**
- **Docker Hub Account** (for production)
- **AWS EC2 Instance** (Ubuntu 22.04 LTS recommended)

---

## 2. Local Development Setup
Follow these steps to run the application on your local machine with hot-reloading:

1. **Clone the Project**:
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Run in Development Mode**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d --build
   ```

3. **Verify Startup**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
   - **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

4. **Stop the Application**:
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   ```

---

## 3. Production Deployment & CI/CD
This project uses GitHub Actions for automated building and deployment.

### A. GitHub Repository Configuration
You must add the following **Secrets** to your GitHub repository (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `johndoe` |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token | `dckr_pat_...` |
| `MYSQL_ROOT_PASSWORD` | Root password for MySQL | `secure_root_123` |
| `EC2_HOST` | Public IP of your AWS EC2 | `54.x.x.x` |
| `EC2_USER` | SSH username (default for Ubuntu) | `ubuntu` |
| `EC2_SSH_KEY` | Content of your `.pem` private key | `-----BEGIN RSA PRIVATE KEY-----...` |

### B. The Deployment Process
When you push code to the `main` branch, the following steps occur automatically:

1. **Build & Push**:
   - Docker images are built using `Dockerfile.prod` for both frontend and backend.
   - Images are tagged and pushed to Docker Hub.
2. **Setup on EC2**:
   - GitHub Actions connects to EC2 via SSH.
   - It checks if **Docker** and **Docker Compose** are installed (installs if missing).
   - `docker-compose.yml` and `init.sql` are copied to the server.
3. **Run Application**:
   - The latest images are pulled from Docker Hub.
   - Services are started in detached mode.

---

## 4. Manual Server Configuration (If needed)
If you wish to deploy manually without CI/CD, follow these steps on your Ubuntu server:

1. **Install Docker**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2
   sudo systemctl start docker
   ```

2. **Prepare Directory**:
   ```bash
   mkdir ~/expense-tracker && cd ~/expense-tracker
   # Copy docker-compose.yml and database/init.sql here
   ```

3. **Start Application**:
   ```bash
   docker compose up -d
   ```

---

## 5. Troubleshooting
- **Icons not showing?**: Ensure `database/init.sql` and the database volume use `utf8mb4`.
- **CORS Errors?**: Check Nginx configuration in `frontend/nginx.conf`.
- **Connection Refused?**: Verify the `VITE_API_URL` environment variable points to `/api`.
- **Garbled Icons?**: If icons show as `ðŸ’°`, set `FORCE_DB_RESET=true` in your `.env` and restart the backend. This will clear the corrupted data and re-seed with clean Unicode. **(Warning: This deletes all transaction history!)**

---
*Prepared for: College Project Documentation*
