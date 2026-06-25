pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('CI already handled by GitHub Actions') {
            steps {
                echo 'GitHub Actions handles frontend, backend, ML and Docker builds.'
            }
        }

        stage('Delivery placeholder') {
            steps {
                echo 'Jenkins is configured as the delivery orchestrator.'
            }
        }
    }

    post {
        success {
            echo 'Jenkins Pipeline Success ✅'
        }
    }
}