// override default profile for aws cli
// ec2 should use role to deploy
env.AWSCLI_PROFILE=''
env.DOCKER_IMAGE='example-rest-api'
env.DOCKER_TAG='latest'
env.DOCKER_FULL_NAME="${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"

String cronString = env.BRANCH_NAME == "master" ? "H/2 * * * *" : ""
def apiImage

pipeline {
    agent { 
        docker {
            image 'exemplo-cicd-slave:latest'
            args '--group-add 999 -u 112:112 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker'
        }
    }

    triggers { 
        pollSCM(cronString)
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {
        stage("Checkout code"){
            steps {
                checkout scm
            }
        }

        stage("Docker build"){
            steps {
                script {
                    echo '>>>> Building docker image'
                    
                    docker.build(
                        "${env.DOCKER_FULL_NAME}",
                        'server/'
                    )
                }
            }
        }

        stage('Test Image') {
            steps {
                script {
                    sh 'docker-compose -f docker-compose.test.yml up -d'
                    
                    junit '**/results/*.xml'

                    sh 'docker-compose -f docker-compose.test.yml down -v'
                }
            }
        }

        stage('Docker image publish') {
            steps {
                script {
                    def version = readFile('server/VERSION')
                    def versions = version.split('\\.')
                    def major = versions[0]
                    def minor = versions[0] + '.' + versions[1]

                    echo '>>>> Publishing new version to docker registry'
                    docker.withRegistry(
                        "${DOCKER_REGISTRY_REPOSITORY}",
                        "${REGISTRY_CREDENTIAL_ID}"
                    ) 
                    {
                        if (env.BRANCH_NAME == 'master') {
                            apiImage.push()
                            apiImage.push(major)
                            apiImage.push(minor)
                            apiImage.push(patch)
                        }
                    }
                }
            }
        }

        // stage("Load configuration") {
        //     steps {
        //         script {
        //             echo '>>>> Loading configuration'
        //             loadEnvironmentVariables('server/env/dev')
        //         }
        //     }
        // }

        // stage('Deploy frontend') {
        //     sh './deploy-frontend.sh'
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

// def loadEnvironmentVariables(path){
//     def props = readProperties file: path
//     keys = props.keySet()
//     for(key in keys) {
//         value = props["${key}"]
//         env."${key}" = "${value}"
//     }
// }
