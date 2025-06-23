FROM node:22-slim AS builder

COPY src /app/src
COPY tsconfig.json /app
COPY package.json /app

WORKDIR /app

EXPOSE 3000

RUN npm install

CMD ["npm", "run", "dev"]