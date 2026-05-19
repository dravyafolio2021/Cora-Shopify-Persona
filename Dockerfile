FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/
RUN npm install

COPY apps/dashboard ./apps/dashboard
# Skip types/lint checks during docker build for speed if desired, or let turbo run it
RUN npx turbo run build --filter=dashboard...

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

WORKDIR /app/apps/dashboard
EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]
