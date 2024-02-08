# Desde que lenguaje o imagen queremos trabajar
FROM node:18.15-alpine

WORKDIR /frontend

COPY package.json ./
COPY package-lock.json ./

RUN npm install 

COPY . ./

EXPOSE 3000

CMD ["npm", "start"]