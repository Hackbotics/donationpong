FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY app.ts ./

RUN bun install --frozen-lockfile --production
EXPOSE 3000
CMD [ "bun", "start" ]