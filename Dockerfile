FROM node:18-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./

FROM base AS dev
RUN yarn install --frozen-lockfile

COPY . .
CMD ["yarn", "start:dev"]

FROM base AS prod
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn add global @nestjs/cli
RUN yarn build

EXPOSE 2001

CMD ["yarn", "start:prod"]
