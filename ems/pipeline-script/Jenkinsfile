
def COLOR_MAP = [
    'SUCCESS' : 'good' ,
    'FAILURE' : 'danger'
]
pipeline {
    agent any
    tools {
        maven 'maven'
        gradle 'gradle8'
        nodejs 'node18'
        jdk     'jdk21'
    }
    environment {
        EMPLOYEE_BUILD = "false"
        IDENTITY_BUILD = "false"
        UI_BUILD = "false"
    }
    stages {
        stage('Check Changes') {
            steps {
                script {
                    def changeLogSets = currentBuild.changeSets
                    for (changeLogSet in changeLogSets) {
                        for (entry in changeLogSet.items) {
                            echo "Commit: ${entry.commitId} by ${entry.author}"
                            echo "Message: ${entry.msg}"
                            for (file in entry.affectedFiles) {
                                echo "Affected file: ${file.path}"
                            }
                        }
                    }
                }
            }
        }

        stage('Build Employee') {
            when {
                changeset '**/employee/**'
            }
            
            steps {
                script {
                EMPLOYEE_BUILD = "true"
            }
                    dir('employee') {
                    sh 'gradle clean build'
                    }
            }
        }
        stage('Package Employee') {
            when {
                changeset '**/employee/**'
            }
            steps {
                dir('employee') {
                    sh 'gradle assemble'
                }
            }
        }
        stage('Sonarqube Analysis - Employee') {
            when {
                changeset '**/employee/**'
            }
            environment {
                scannerHome = tool 'sonar6.0'
            }
            steps {
                withSonarQubeEnv('sonar') {
                    sh """${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=EMS_EMPLOYEE \
                    -Dsonar.projectName=EMS_EMPLOYEE \
                    -Dsonar.projectVersion=1.0 \
                    -Dsonar.sources=employee/src \
                    -Dsonar.exclusions='**/*.spec.js, **/*.test.js' \
                    -Dsonar.sourceEncoding=UTF-8 \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.java.binaries=employee/build/classes/java/main/com/pb/employee
                    """
                }
            }
        }
        stage('Quality Gate - Employee') {
            when {
                changeset '**/employee/**'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Upload Artifact - Employee') {
            when {
                changeset '**/employee/**'
            }
            steps {
                script {
                    nexusArtifactUploader(
                        nexusVersion: 'nexus3',
                        protocol: 'http',
                        nexusUrl: '122.175.43.71:9001/',
                        groupId: 'QA',
                        version: "${env.BUILD_ID}-${env.BUILD_TIMESTAMP}",
                        repository: 'EMS_EMPLOYEE/',
                        credentialsId: 'nexuslogin',
                        artifacts: [
                            [artifactId: 'ems-fe',
                            classifier: '',
                            file: 'employee/build/libs/employee-1.0.0.jar',
                            type: '.jar']
                        ]
                    )
                }
            }
        }

        stage('Build Identity ') {
            when {
                changeset '**/identity/**'
            }
           
            steps {
                 script{
                IDENTITY_BUILD = "true"
            }
                    dir('identity') {
                    sh 'gradle clean build'
                    }
            }
        }
        stage('Package Identity') {
            when {
                changeset '**/identity/**'
            }
            steps {
                dir('identity') {
                    sh 'gradle assemble'
                }
            }
        }
        stage('Sonarqube Analysis - Identity') {
            when {
                changeset '**/identity/**'
            }
            environment {
                scannerHome = tool 'sonar6.0'
            }
            steps {
                withSonarQubeEnv('sonar') {
                    sh """${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=EMS_IDENTITY \
                    -Dsonar.projectName=EMS_IDENTITY \
                    -Dsonar.projectVersion=1.0 \
                    -Dsonar.sources=identity/src \
                    -Dsonar.exclusions='**/*.spec.js, **/*.test.js' \
                    -Dsonar.sourceEncoding=UTF-8 \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.java.binaries=identity/build/classes/java/main/com/pb/ems/
                    """
                }
            }
        }
        stage('Quality Gate - Identity') {
            when {
                changeset '**/identity/**'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Upload Artifact - Identity') {
            when {
                changeset '**/identity/**'
            }
            steps {
                script {
                    
                    nexusArtifactUploader(
                        nexusVersion: 'nexus3',
                        protocol: 'http',
                        nexusUrl: '122.175.43.71:9001/',
                        groupId: 'QA',
                        version: "${env.BUILD_ID}-${env.BUILD_TIMESTAMP}",
                        repository: 'EMS_IDENTITY/',
                        credentialsId: 'nexuslogin',
                        artifacts: [
                            [artifactId: 'ems-fe',
                            classifier: '',
                            file: 'identity/build/libs/identity-1.0.0.jar',
                            type: '.jar']
                        ]
                    )
                }
            }
        }

       stage('Install Dependencies ') {
            when {
                changeset '**/ui/**'
            }
            
            steps {
                script{
                UI_BUILD = "true"
            }
                    dir('ui') {
                    sh 'npm install'
                    }
            }
        }
        stage('Build UI') {
            when {
                changeset '**/ui/**'
            }
            steps {
                dir('ui') {
                    sh 'rm -rf build'
                    sh 'npm run build'
                }
            }
        }
        stage('Package UI'){
            when{
                  changeset '**/ui/**'
            }
           steps{
                dir ('ui') {
                sh 'sync'
                sh 'tar -czf ui.tar.gz -C build .'
                }
           }
        }
        stage('Sonarqube Analysis - UI') {
            when {
                changeset '**/ui/**'
            }
            environment {
                scannerHome = tool 'sonar6.0'
            }
            steps {
                withSonarQubeEnv('sonar') {
                    sh """${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=EMS_UI \
                    -Dsonar.projectName=EMS_UI\
                    -Dsonar.projectVersion=1.0 \
                    -Dsonar.sources=ui/src \
                    -Dsonar.exclusions='**/*.spec.js, **/*.test.js' \
                    -Dsonar.sourceEncoding=UTF-8 \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                    """
                }
            }
        }
        stage('Quality Gate - UI') {
            when {
                changeset '**/ui/**'
            }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Upload Artifact - UI') {
            when {
                changeset '**/ui/**'
            }
            steps {
                script {
                    nexusArtifactUploader(
                        nexusVersion: 'nexus3',
                        protocol: 'http',
                        nexusUrl: '122.175.43.71:9001/',
                        groupId: 'QA',
                        version: "${env.BUILD_ID}-${env.BUILD_TIMESTAMP}",
                        repository: 'EMS_UI/',
                        credentialsId: 'nexuslogin',
                        artifacts: [
                            [artifactId: 'ems-ui',
                            classifier: '',
                            file: 'ui/ui.tar.gz',
                            type: '.tar']
                        ]
                    )
                }
            }
        }
    }
   post {
            always {
                echo 'Slack Notificatons'
                slackSend channel : 'ems_ci-cd',
                    color: COLOR_MAP[currentBuild.currentResult], 
                    message: "*${currentBuild.currentResult}:* job ${env.job_Name} build ${env.BUIILD_NUMBER} \n More info at : ${env.BUILD_URL}" 
            }
        }
}
