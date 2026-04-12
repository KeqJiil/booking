FROM node:22-alpine
WORKDIR /app/back
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
CMD ["npm", "run", "start:dev"]