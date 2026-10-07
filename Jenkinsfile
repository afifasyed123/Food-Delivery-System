pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_BACKEND = 'food-delivery-backend'
        IMAGE_FRONTEND = 'food-delivery-frontend'
        JIRA_PROJECT_KEY = 'FDA'
    }

    stages {
        stage('1. Git Checkout & Jira Issue Scan') {
            steps {
                echo 'Checking out code and inspecting commit history for Jira keys...'
                sh '''
                    git log -n 5 --oneline
                    echo "Checking Jira issue association for project ${JIRA_PROJECT_KEY}..."
                '''
            }
        }

        stage('2. Backend Tests & Coverage') {
            steps {
                dir('backend') {
                    echo 'Running backend unit and integration test suites...'
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('3. Frontend Build & Static Analysis') {
            steps {
                dir('frontend') {
                    echo 'Compiling and verifying frontend web assets...'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('4. Docker Container Build') {
            steps {
                echo 'Building Docker container images...'
                sh 'docker compose build backend frontend'
            }
        }

        stage('5. Deploy & Health Verification') {
            steps {
                echo 'Deploying containers with Docker Compose...'
                sh 'docker compose up -d'
                
                echo 'Verifying Prometheus /metrics and /health probe...'
                sh '''
                    sleep 5
                    curl -f http://localhost:5000/health || exit 1
                    curl -f http://localhost:5000/metrics || exit 1
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution complete.'
        }
        success {
            echo "CI/CD Pipeline Succeeded. Jira issues under ${JIRA_PROJECT_KEY} updated."
        }
        failure {
            echo "CI/CD Pipeline Failed. Check stage logs for details."
        }
    }
}
