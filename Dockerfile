FROM node:20-alpine

# Setăm directorul de lucru
WORKDIR /usr/src/app

# Instalam tool-urile necesare pentru a compila sqlite3 pe Alpine Linux
RUN apk add --no-cache python3 make g++ sqlite

# Copiem și instalăm dependențele
COPY package*.json ./
RUN npm install

# Copiem restul codului
COPY . .

EXPOSE 3000

CMD ["npm", "start"]