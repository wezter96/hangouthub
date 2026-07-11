# HangoutHub

**Find your people. Do more together.**

HangoutHub is a Meetup-style community app for discovering local events and the
groups behind them. It runs on iOS, Android, and the web from a single Expo
codebase, backed by a fully type-safe TypeScript API.

Scaffolded with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
and extended with a real events/groups/RSVP domain.

## Stack

| Layer      | Choice                                                         |
| ---------- | -------------------------------------------------------------- |
| App        | **Expo SDK 57** (React Native 0.86) + **Expo Router** (native + web) |
| UI         | **HeroUI Native** + **Uniwind** (Tailwind for React Native)    |
| API        | **Hono** server + **oRPC** (end-to-end type-safe, OpenAPI)     |
| Database   | **PostgreSQL** + **Drizzle ORM**                               |
| Auth       | **Better Auth** (email/password, native + web sessions)        |
| Runtime    | **Bun**                                                        |
| Monorepo   | **Turborepo** · **Biome** · **Husky**                          |

## Getting started

### 1. Install

```bash
bun install
```

### 2. Start Postgres

The repo ships a Docker Compose file for a local database:

```bash
bun run db:start
```

> No Docker? Point `DATABASE_URL` in `apps/server/.env` at any Postgres instance
> (Neon, Supabase, a local install, etc.).

### 3. Apply the schema and seed sample data

```bash
bun run db:push    # create tables
bun run db:seed    # load demo groups + events
```

### 4. Run everything

```bash
bun run dev
```

- **API:** http://localhost:3000
- **OpenAPI reference (Scalar):** http://localhost:3000/api-reference
- **App:** open in Expo Go (native) or press `w` for web.

> On a device, set `EXPO_PUBLIC_SERVER_URL` in `apps/native/.env` to your
> machine's LAN IP so the app can reach the API.

## What's inside

- **Home** — greeting, branded hero, interest filters, upcoming events carousel,
  popular groups, and sign in / sign up.
- **Explore** — Discover (events by category) and Groups tabs.
- **Event detail** — cover, schedule, venue, attendance meter, host group, and a
  one-tap **RSVP** (auth-gated) that updates the going count live.
- **My Tasks** — the original Better-T-Stack todo example, kept as a working
  end-to-end demo of the oRPC + Drizzle wiring.

## Project structure

```
hangouthub/
├── apps/
│   ├── native/            # Expo app (iOS, Android, web via Expo Router)
│   │   ├── app/           # Routes: (drawer) → Home, (tabs), event/[id], modal
│   │   ├── components/    # EventCard, GroupCard, CategoryPills, AuthPanel, …
│   │   ├── constants/     # Brand colors + categories
│   │   └── lib/           # Formatting helpers, shared API types
│   └── server/            # Hono entry (mounts oRPC + Better Auth)
├── packages/
│   ├── api/               # oRPC routers: event, group, todo (+ auth middleware)
│   ├── auth/              # Better Auth config
│   ├── db/                # Drizzle schema (auth, community, todo) + seed
│   ├── env/               # Validated environment (server + native)
│   └── config/            # Shared TS config
```

## Data model

- **group** — a community (name, category, city, member count, emoji/color).
- **event** — a scheduled meetup hosted by a group (title, venue, start time,
  capacity, attendee count).
- **rsvp** — a member's RSVP to an event (drives the going count).

## Available scripts

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `bun run dev`           | Start the app and API together                 |
| `bun run dev:native`    | Start only the Expo app                        |
| `bun run dev:server`    | Start only the API                             |
| `bun run check-types`   | Typecheck the whole monorepo                   |
| `bun run check`         | Biome lint + format                            |
| `bun run db:start`      | Start the local Postgres container             |
| `bun run db:push`       | Push the Drizzle schema to the database        |
| `bun run db:seed`       | Seed demo groups and events                    |
| `bun run db:studio`     | Open Drizzle Studio                            |
