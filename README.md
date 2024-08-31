# 🏰 CyberFortress-Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white)

CyberFortress-Backend is a robust Node.js-based backend service for the CyberFortress API security dashboard. It provides API endpoints to fetch security reports and manages data storage using MongoDB.

## 🌟 Features

- 🚀 Fast and efficient Node.js server
- 📊 RESTful API for fetching security reports
- 🗄️ MongoDB integration for data persistence
- 🔐 Secure API endpoints
- 🔄 Easy-to-use data retrieval system
- 🔄 Jenkins pipeline for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.0 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Captain-T2004/CyberFortress-Backend.git
   ```

2. Navigate to the project directory:
   ```
   cd CyberFortress-Backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add necessary environment variables (e.g., MongoDB connection string, port)

5. Start the server:
   ```
   npm start
   ```

## 🔧 Configuration

Update the `.env` file with your specific configuration:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cyberfortress
// Add other necessary environment variables
```

## 📡 API Endpoints

### GET /api/report

Fetches the API security report from the MongoDB database.

**Response:**
```json
{
  "apis": [
    {
      "id": "1",
      "name": "User Authentication API",
      "securityHealth": "Good",
      "vulnerabilities": []
    },
    {
      "id": "2",
      "name": "Payment Processing API",
      "securityHealth": "At Risk",
      "vulnerabilities": [
        {
          "type": "SQL Injection",
          "severity": "High",
          "description": "Potential SQL injection vulnerability in query parameter"
        }
      ]
    }
  ]
}
```

## 🚢 Deployment

1. Ensure your MongoDB instance is running and accessible
2. Set up environment variables for production
3. Build the project (if necessary):
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm start
   ```

## 🔄 Jenkins Pipeline Setup

The project includes a Jenkinsfile in the codebase to easily set up a CI/CD pipeline using Jenkins. This pipeline automates the build, test, and deployment processes.

### Prerequisites

- Jenkins server installed and running

### Setting up the Pipeline

1. In Jenkins, create a new Pipeline job.

2. In the job configuration, under "Pipeline", select "Pipeline script from SCM".

3. Choose your SCM (e.g., Git) and provide the repository URL.

4. Specify the path to the Jenkinsfile (usually just `Jenkinsfile` if it's in the root of your repository).

5. Save the job configuration.

### Jenkinsfile Overview

The Jenkinsfile defines the following stages:

- **Checkout**: Clones the repository
- **Install Dependencies**: Runs `npm install`
- **Run Tests**: Executes the test suite with `npm test`
- **Build**: Builds the project (if necessary)

### Running the Pipeline

To run the pipeline:

1. Go to the Jenkins job you created.
2. Click "Build Now".

Jenkins will execute each stage defined in the Jenkinsfile, providing feedback on the progress and results of each stage.

## 🙏 Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
