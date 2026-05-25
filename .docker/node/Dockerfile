FROM node:20-alpine

RUN apk add --no-cache python3 make g++ bash git curl
WORKDIR /var/www/html
COPY package*.json ./
RUN npm ci --no-audit --silent
COPY . .
EXPOSE 5173
CMD ["npm", "run", "watch", "--", "--host", "0.0.0.0"]
