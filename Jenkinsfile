env.CONTAINER_NAME = "${env.JOB_NAME}".split('/')[1..2].join('-')
env.DOCKER_IMAGE = "${env.JOB_NAME}".split('/')[1]
env.DOCKER_TAG = "${env.JOB_NAME.split('/').last()}-${env.BUILD_NUMBER}"
env.DOCKER_REGISTRY_REPOSITORY = ''
env.REGISTRY_CREDENTIAL_ID = ''

String cronString = env.BRANCH_NAME == "master" ? "H/2 * * * *" : ""

pipeline {
    agent { 
        docker {
            image 'jenkins/slave'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    triggers { 
        pollSCM(cronString)
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {
        stage("Checkout code"){
            steps {
                checkout scm
                script {
                    def gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                }
            }
        }

        stage("Docker build"){
            steps {
                script {
                    echo '>>>> Building docker image'
                    def apiImage = docker.build(
                        'example-rest-api:latest',
                        'server/Dockerfile'
                    )
                }
            }
        }

        // stage('Test Image') {
        //     steps {
        //         script {
        //             docker.image('mongo').withRun(){ db ->
        //                 app.inside("""
        //                     -e MONGODB_HOST=mongo \
        //                     -e APP_ENV=staging \
        //                     --link ${db.id}:mongo
        //                     """)
        //                 {
        //                     sh 'npm run functional-tests'
        //                     junit '**/results/*.xml'
        //                 }
        //             }
        //         }
        //     }
        // }

        // stage('Docker image publish') {
        //     steps {
        //         script {
        //             def version = readFile('server/VERSION')
        //             def versions = version.split('\\.')
        //             def major = versions[0]
        //             def minor = versions[0] + '.' + versions[1]

        //             echo '>>>> Publishing new version to docker registry'
        //             withCredentials(
        //                 [
        //                     usernamePassword(
        //                         credentialsId: 'dkr-registry-pass',
        //                         passwordVariable: 'DKR_USER',
        //                         usernameVariable: 'DKR_PASS'
        //                     )
        //                 ]
        //             )
        //             {
        //                 docker.withRegistry(
        //                     "${DOCKER_REGISTRY_REPOSITORY}",
        //                     "${REGISTRY_CREDENTIAL_ID}"
        //                 ) 
        //                 {
        //                     if (env.BRANCH_NAME == 'master') {
        //                         apiImage.push()
        //                         apiImage.push(major)
        //                         apiImage.push(minor)
        //                         apiImage.push(patch)
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        // stage("Load configuration") {
        //     steps {
        //         script {
        //             echo '>>>> Loading configuration'
        //             loadEnvironmentVariables('server/env/dev')
        //         }
        //     }
        // }

        // stage("Docker deploy"){
        //     steps {
        //         script {
        //             if (env.BRANCH_NAME == 'master') {
        //                 echo 'production deployment'
        //             }
        //         }
        //     }
        // }
    }
}

def loadEnvironmentVariables(path){
    def props = readProperties file: path
    keys = props.keySet()
    for(key in keys) {
        value = props["${key}"]
        env."${key}" = "${value}"
    }
}
