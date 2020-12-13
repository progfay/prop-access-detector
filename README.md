# cdp-template

Template Repository with Chrome DevTools Protocol

## Usage

### with docker-compose

Run headless-chrome and Node.js at the same time:

```sh
docker-compose up --build
```

Run only headless-chrome in background:

```sh
docker-compose up -d chrome
```

Run Node.js with build before executing:

```sh
docker-compose up --build node
```

### with Local Environment

1. Run only headless-chrome in background
2. Execute built Javascript code

```sh
docker-compose up -d chrome
npm start
```
