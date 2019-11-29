#!/bin/bash
docker run --name jenkins-nginx -d -p 80:80 -p 443:443 -v ./nginx.conf:/etc/nginx/conf.d/default.conf nginx