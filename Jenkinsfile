// override default profile for aws cli
// ec2 should use role to deploy
env.AWSCLI_PROFILE=''
env.DOCKER_IMAGE='example-rest-api'
env.DOCKER_TAG='latest'
env.DOCKER_FULL_NAME="${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
env.DOCKER_REGISTRY_REPOSITORY="172.17.0.1:5000/${env.DOCKER_FULL_NAME}"
env.AWS_REGION='us-east-2'
env.ECR_REGISTRY_ADDRESS="${params.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"

String cronString = env.BRANCH_NAME == "master" ? "H/2 * * * *" : ""
def apiImage

pipeline {
    agent { 
        docker {
            image 'exemplo-cicd-slave:latest'
            args '--group-add 999 -u 112:116 -v /home/ubuntu/.docker:/.docker -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker'
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

                    echo '>>>> Publishing new version to private docker registry'
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

                    echo '>>>> Creating AWS ECR registry if does not exists'

                    def queryRepo = sh(
                        script: "aws ecr describe-repositories --region ${env.AWS_REGION} | jq '.repositories[].repositoryName' | grep ${env.DOCKER_IMAGE}",
                        returnStatus: true
                    )
                    if (queryRepo.toInteger() != 0) {
                        sh "aws ecr create-repository --region ${env.AWS_REGION} --repository-name ${env.DOCKER_IMAGE}"
                    }

                    echo '>>>> Publishing new version to private AWS docker registry'

                    sh """
                    id
                    ls -la /
                    set +x
                    \$(aws ecr get-login --no-include-email --region ${env.AWS_REGION})
                    set -x
                    docker tag ${env.DOCKER_FULL_NAME} ${env.ECR_REGISTRY_ADDRESS}/${env.DOCKER_FULL_NAME}
                    docker push ${env.ECR_REGISTRY_ADDRESS}/${env.DOCKER_FULL_NAME}
                    """
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
                    def branch = env.GIT_BRANCH.split('/')[1]
                    echo branch
                    if (branch == 'master') {
                        echo 'deploying elastic beanstalk'
                        def queryCode = sh(
                            script: "aws elasticbeanstalk describe-applications --output json --region ${env.AWS_REGION} | jq -r '.Applications[].ApplicationName' | grep ${env.JOB_NAME}",
                            returnStatus: true
                        )
                        if (queryCode.toInteger() != 0) {
                            sh """
                            cd server
                            eb init -p docker ${env.JOB_NAME} --region ${env.AWS_REGION}
                            eb create --scale 1 ${branch} --region ${env.AWS_REGION}
                            """
                        } else {
                            sh """
                            cd server
                            eb deploy
                            """
                        }
                    }
                }
            }
        }
    }
}