FROM alpine:3.21 AS builder
RUN apk add --no-cache nodejs npm

ARG MSS_APP_FOLDER
ARG MSS_DEPLOYMENT_TYPE

WORKDIR /app/

COPY ./ ./

RUN npm ci --omit=dev && npm cache clean --force

WORKDIR /app/$MSS_APP_FOLDER/

RUN npm run app:deploy

FROM alpine:3.21
RUN apk add --no-cache nodejs

ARG MSS_APP_FOLDER

WORKDIR /runtime/

COPY --from=builder /app/$MSS_APP_FOLDER/bin/server/ ./server/
COPY --from=builder /app/$MSS_APP_FOLDER/bin/web/    ./web/

CMD ["node", "server/main.js"]
