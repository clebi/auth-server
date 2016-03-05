FROM node:argon

RUN mkdir -p /usr/src/app
RUN mkdir -p /etc/app
WORKDIR /usr/src/app
ENV AUTH_SERVER_CONFIG_PATH /etc/app/conf.yaml
COPY docker_files/conf.yaml /etc/app/conf.yaml
COPY . /usr/src/app
RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
