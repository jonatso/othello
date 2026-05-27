FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm build
RUN pnpm --filter @othello/server --prod deploy --legacy /app/runtime
RUN rm -rf /app/runtime/dist /app/runtime/client
RUN cp -R apps/server/dist /app/runtime/dist
RUN mkdir -p /app/runtime/client && cp -R apps/client/dist /app/runtime/client/dist

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST_DIR=/app/client/dist

WORKDIR /app

COPY --from=build /app/runtime ./

EXPOSE 8080

CMD ["node", "dist/index.js"]
