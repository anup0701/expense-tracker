backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── transactionController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── Category.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/
│   │   └── dbHelpers.js
│   └── app.js
├── server.js
├── package.json
└── .env


bash
# Development
docker build -f Dockerfile.dev -t expense-tracker-dev .
docker run -p 5000:5000 expense-tracker-dev

# Production
docker build -f Dockerfile.prod -t expense-tracker-prod .
docker run -p 5000:5000 expense-tracker-prod
