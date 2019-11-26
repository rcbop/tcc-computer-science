FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT ["/app/wait-for.sh"]
CMD ["npm", "start"]
