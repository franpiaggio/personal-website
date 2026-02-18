# Personal Website

Francisco Piaggio's personal portfolio — Frontend Engineer & Creative Coder.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Deploy

The project includes a `Dockerfile` ready for deployment with Coolify or any Docker-based service.

```sh
docker build -t personal-website .
docker run -p 80:80 personal-website
```
