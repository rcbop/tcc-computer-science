FROM nginx:alpine
COPY wait-for.sh /
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html