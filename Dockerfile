FROM node:20-alpine

# 1. Creăm folderul de lucru
WORKDIR /usr/src/app

# 2. Copiem DOAR fișierele de dependențe mai întâi
COPY package*.json ./

# 3. Instalăm dependențele (Această etapă va fi cache-uită dacă package.json nu se schimbă)
RUN npm install

# 4. Acum copiem restul codului sursă
COPY . .

# Expunem portul
EXPOSE 3000

CMD ["npm", "start"]