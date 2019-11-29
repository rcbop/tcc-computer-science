FROM jenkins/slave:latest
USER root
RUN apt-get update -q \
    && apt-get install git python-pip jq -yq \
    && pip install awscli awsebcli docker-compose
USER jenkins