FROM node:16 as builder

VOLUME /root/.npm

WORKDIR /code
RUN npm i -g npm
COPY ./web/package.json ./web/package-lock.json /code/
RUN npm ci

ENV NODE_ENV="production"
COPY ./web/ /code/
RUN QUIET=true npm run build


FROM nginx

#对外暴露端口
EXPOSE 80

COPY --from=builder /code/build  /var/www/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
CMD exec nginx -g 'daemon off;' && echo '0' > /var/www/html/healthy-check
