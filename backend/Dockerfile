FROM node:22-alpine as builder
WORKDIR /app
COPY  ./package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine as main
WORKDIR /app
COPY --from=builder /app/dist ./app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./generated
CMD ["node", "app/main.js"]