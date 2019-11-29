FROM node:alpine
RUN mkdir /app
WORKDIR /app
RUN apk add python make
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
