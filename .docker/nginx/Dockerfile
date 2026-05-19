FROM nginx:1.26-alpine

RUN apk add --no-cache curl \
    && mkdir -p /var/cache/nginx

COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80