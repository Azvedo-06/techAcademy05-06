FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
COPY public ./public

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]