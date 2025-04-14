FROM alpine:3.21 AS builder
RUN apk add --no-cache nodejs npm

ARG MSS_DEPLOYMENT_TYPE

WORKDIR /app/

COPY ./ ./

RUN npm ci --omit=dev && npm cache clean --force

WORKDIR /app/template/

RUN npm run app:deploy

FROM alpine:3.21
RUN apk add --no-cache nodejs

WORKDIR /runtime/

COPY --from=builder /app/template/bin/server/ ./server/
COPY --from=builder /app/template/bin/web/    ./web/

CMD ["node", "server/main.js"]
