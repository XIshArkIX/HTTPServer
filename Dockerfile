FROM node:14.17.0 AS installer
LABEL maintainer="StatBot"

WORKDIR /build

COPY yarn.lock ./
COPY *.json ./

RUN npm i -g npm

# RUN npm i -g yarn

RUN yarn install --production --pure-lockfile

FROM installer AS ts-builder

RUN yarn global add typescript ts-node
RUN yarn add -D @types/node

COPY *.ts ./
RUN mkdir -p ./handlers
COPY ./handlers/* ./handlers/

RUN yarn build

FROM ts-builder AS starter

WORKDIR /app

COPY --from=ts-builder /build/build .
RUN mkdir -p ./node_modules
COPY --from=installer /build/node_modules/ ./node_modules

EXPOSE 80

CMD [ "node", "main.js" ]
