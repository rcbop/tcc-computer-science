FROM jenkins:2.32.3
USER root
RUN apt-get install git
USER jenkins

COPY config/plugins.txt /usr/share/jenkins/plugins.txt
RUN /usr/local/bin/plugins.sh /usr/share/jenkins/plugins.txt
COPY config/jenkins.properties /usr/share/jenkins/ref/
COPY config/*.groovy /usr/share/jenkins/ref/init.groovy.d/
COPY config/*.xml /usr/share/jenkins/ref/
