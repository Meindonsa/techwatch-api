FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Builder le TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]