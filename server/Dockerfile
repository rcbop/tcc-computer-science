FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY . .
RUN apk add python make && npm install && ls -la
EXPOSE 3000
CMD ["npm", "start"]
