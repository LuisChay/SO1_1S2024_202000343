
# Desde que lenguaje o imagen queremos trabajar
FROM node:18.15-alpine

WORKDIR /backend

COPY package.json ./
COPY package-lock.json ./

RUN npm install 

COPY . ./

EXPOSE 5000

CMD ["node", "index.js"]