pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('ML Validation') {
            steps {
                dir('ml-service') {
                    sh 'pip install -r requirements.txt'
                    sh 'python -m py_compile app.py'
                }
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
            echo 'ReactBuilder Build Success ✅'
        }

        failure {
            echo 'Build Failed ❌'
        }
    }
}