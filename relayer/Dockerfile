FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --network-timeout=600000
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev --network-timeout=600000
EXPOSE 3295
ENV PORT=3295
CMD ["node", "dist/index.js"]
