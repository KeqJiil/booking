FROM node:20-bullseye
WORKDIR /app/front
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]