


def COLOR_MAP = [
    'SUCCESS' : 'good' ,
    'FAILURE' : 'danger'
]
pipeline {
    agent any 
    tools {
        gradle 'gradle8'
    }
    environment {
        CI = 'false'
    }    
    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'ac46ef33-599c-4de0-b2b9-036d7cd7b5b4', url: 'https://github.com/PathBreakerGit/ems.git', branch: 'main'
            }
        }                
        stage('Removing Old Data') {
            steps {
                sh 'sudo cp /var/www/ems/assets/img/* /opt/ems-image-backup/ -R'
                sh 'sudo rm -rf /opt/ems/*'
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('ui') {
                    sh 'npm install'
                }
            }
        }
        stage('Build UI') {
            steps {
                dir('ui') {
                    sh 'npm run build'
                }
            }
        }
        stage('Deploy UI') {
            steps {
                sh 'sudo chown jenkins:jenkins /var/www/ems/ -R ' 
                sh 'sudo rm -rf /var/www/ems/*'
                sh 'sudo cp -R /var/lib/jenkins/workspace/ems-deployement/ui/build/* /var/www/ems/'
                sh 'sudo cp -R /opt/ems-image-backup/* /var/www/ems/assets/img/'
                sh 'sudo chown jenkins:jenkins /var/www/ems/assets/img/ -R'
            }
        }
        stage('Build Identity') {
            steps {
                dir('identity') {
                    sh 'gradle clean build'
                }
            }
        }
        stage('Build Employee') {
            steps {
                dir('employee') {
                    sh 'gradle clean build'
                }
            }
        }
        stage('Getting New Build Data') {
            steps {
                sh 'sudo cp -R /var/lib/jenkins/workspace/ems-deployement/* /opt/ems/'
                sh 'sudo chown jenkins:jenkins /opt/ems -R'
            }
        }
        stage('Deploy Identity') {
            steps {
                sh 'sudo systemctl restart identity.service'
            }
        }
        stage('Deploy Employee') {
            steps {
                sh 'sudo systemctl restart employee.service'
            }
        }
    }
}
