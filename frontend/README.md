

bash
cd frontend
docker build -f Dockerfile.dev -t expense-tracker-frontend:dev .
docker run -p 3000:3000 expense-tracker-frontend:dev


bash
cd frontend
docker build -f Dockerfile.prod -t expense-tracker-frontend:prod .
docker run -p 80:80 expense-tracker-frontend:prod


yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
