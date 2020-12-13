FROM node:latest

EXPOSE 8080

WORKDIR /cdp

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY . .
