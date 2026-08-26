FROM node:22-apline
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
LABEL authors="Sam & Aina"
EXPOSE 3000

ENTRYPOINT ["top", "-b"]