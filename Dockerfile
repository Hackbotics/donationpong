FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY app.ts ./

RUN bun install --frozen-lockfile --production

CMD [ "bun", "start" ]