pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }
    }

    post {
        success {
            echo 'ReactBuilder Docker Build Success ✅'
        }

        failure {
            echo 'ReactBuilder Docker Build Failed ❌'
        }
    }
}