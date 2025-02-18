FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Создаем директорию для логов
RUN mkdir -p logs

CMD ["npm", "start"] 