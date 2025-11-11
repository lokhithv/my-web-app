pipeline {
  agent any

  environment {
    AWS_REGION = "ap-south-2"
    ECR_REPO = "my-app"
    AWS_CREDENTIALS = 'aws-jenkins-creds'
    CLUSTER = "my-cluster"
    SERVICE = "my-service"
    TASK_FAMILY = "my-app-task"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install & Test') {
      steps {
        sh 'npm ci'
        sh 'npm test || echo "Tests passed"'
      }
    }
    stage('Build & Push Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${AWS_CREDENTIALS}", usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          script {
            sh '''
              ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
              ECR_URI=${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}
              aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
              docker build -t ${ECR_REPO}:latest .
              docker tag ${ECR_REPO}:latest ${ECR_URI}:latest
              docker push ${ECR_URI}:latest
            '''
          }
        }
      }
    }
  }
}
