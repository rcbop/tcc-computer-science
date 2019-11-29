FROM jenkins/slave:latest
USER root
RUN apt-get update -q && apt-get install python-pip -yq && pip install awscli docker-compose
USER jenkins