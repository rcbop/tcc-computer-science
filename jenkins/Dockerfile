FROM jenkins:2.32.3
USER root
RUN apt-get install git
USER jenkins

COPY config/plugins.txt /usr/share/jenkins/plugins.txt
RUN /usr/local/bin/plugins.sh /usr/share/jenkins/plugins.txt
# so we can use jenkins cli
COPY config/jenkins.properties /usr/share/jenkins/ref/
# remove executors in master
COPY config/*.groovy /usr/share/jenkins/ref/init.groovy.d/
# lets configure Jenkins with some defaults
COPY config/*.xml /usr/share/jenkins/ref/
