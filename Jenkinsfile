// override default profile for aws cli
// ec2 should use role to deploy
env.AWSCLI_PROFILE=''
env.DOCKER_IMAGE='example-rest-api'
env.DOCKER_TAG='latest'
env.DOCKER_FULL_NAME="${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
env.DOCKER_REGISTRY_REPOSITORY="172.17.0.1:5000/${env.DOCKER_FULL_NAME}"

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

                    sh "env"
                }
            }
        }

        stage('Test docker image') {
            steps {
                script {
                    sh 'docker-compose -f docker-compose.test.yml up -d'
                    
                    junit testResults: '**/results/*.xml', allowEmptyResults: true

                    sh 'docker-compose -f docker-compose.test.yml down -v'
                }
            }
        }

        stage('Publish docker image') {
            // agent { node { label 'master' } }
            steps {
                script {
                    def version = readFile('server/VERSION')
                    def versions = version.split('\\.')
                    def major = versions[0]
                    def minor = versions[0] + '.' + versions[1]

                    echo '>>>> Publishing new version to docker registry'
                    docker.withRegistry(
                        "${DOCKER_REGISTRY_REPOSITORY}"
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

        stage('Deploy frontend') {
            steps {
                script {
                    def exitCode = sh(
                        script: 'git diff-tree --name-only HEAD | grep frontend',
                        returnStatus: true
                    )
                    if (exitCode == 0) {
                        echo 'deploying frontend'
                        sh './deploy-frontend.sh'
                    }
                }
            }
        }

        stage("Deploy docker in EB"){
            steps {
                script {
                    def branch = env.GIT_BRANCH.split('/')[0]]
                    echo branch
                    if (branch == 'master') {
                        echo 'deploying elastic beanstalk'
                        def queryCode = sh(
                            script: "aws elasticbeanstalk describe-applications --output json --region us-east-2 | jq -r '.Applications[].ApplicationName' | grep ${env.JOB_NAME}",
                            returnStatus: true
                        )
                        if (queryCode.toInteger() != 0) {
                            sh "eb init -p docker ${env.JOB_NAME}"
                            sh "eb create ${branch}"
                        } else {
                            sh "eb deploy"
                        }
                    }
                }
            }
        }
    }
}