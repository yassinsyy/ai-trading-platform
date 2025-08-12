# syntax=docker/dockerfile:1
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm i; fi

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json .
COPY src ./src
RUN npx tsc -p tsconfig.json

FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
RUN npm i --omit=dev --ignore-scripts && npm cache clean --force
EXPOSE 8080
CMD ["node", "dist/server.js"]