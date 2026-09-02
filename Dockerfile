FROM oven/bun:1 AS build
WORKDIR /app
ENV HUSKY=0
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY tsconfig.json vite.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
RUN bun run build

FROM oven/bun:1 AS runtime
WORKDIR /app
ENV HUSKY=0
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY src/ ./src/
COPY drizzle/ ./drizzle/
COPY public/ ./public/
COPY --from=build /app/dist/client ./dist/client
EXPOSE 8080
CMD ["bun", "src/server/index.ts"]
