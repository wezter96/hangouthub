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
- **Explore** — Discover (events by category, with **search**) and Groups tabs.
- **Event detail** — cover (emoji or image), schedule, **Open in Maps**, attendance
  meter, **who's going** avatars, host group, a **discussion thread**, and a one-tap
  **RSVP** (auth-gated) that updates the going count live.
- **Group detail** — cover, description, member count, **join / leave**, and the
  group's upcoming events.
- **Create event** — a form (category, venue, city, day/time, capacity, optional
  host group, optional cover image URL) that publishes a real event and auto-RSVPs
  the creator.
- **Social login** — "continue with GitHub / Google" (enabled when OAuth
  credentials are configured; see below).
- **Profile** — avatar, the events you're **Going** to, events you're **Hosting**,
  and **Your groups**, with sign out.
- **My Tasks** — the original Better-T-Stack todo example, kept as a working
  end-to-end demo of the oRPC + Drizzle wiring.

## Project structure

```
hangouthub/
├── apps/
│   ├── native/            # Expo app (iOS, Android, web via Expo Router)
│   │   ├── app/           # Routes: (drawer) → Home/Explore/Profile, event/[id], group/[id], modal
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
- **event** — a scheduled meetup (title, venue, start time, capacity, attendee
  count) optionally tied to a host group and/or a creator.
- **rsvp** — a member's RSVP to an event (drives the going count).
- **membership** — a user's membership in a group (drives the member count).

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
| `bun run test`          | Run the vitest suite (needs a database)        |

## Testing

Unit tests cover the API's pure helpers; integration tests drive the oRPC
routers (create event, RSVP counting, group membership, comments, search)
against a real Postgres. With the database running:

```bash
bun run test
```

CI (`.github/workflows/ci.yml`) spins up a Postgres service and runs typecheck,
Biome, schema push, and the test suite on every push and PR.

## Social login (optional)

Email/password works out of the box. To enable GitHub / Google sign-in, add the
OAuth credentials to `apps/server/.env` and flip the client flag:

```bash
# apps/server/.env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# apps/native/.env
EXPO_PUBLIC_ENABLE_SOCIAL=true
```

Providers turn on automatically when their credentials are present; the app
shows the buttons only when `EXPO_PUBLIC_ENABLE_SOCIAL=true`.

## Deployment

- **Server** — `apps/server/Dockerfile` builds the API with Bun.
- **Full stack locally** — `docker compose up --build` runs Postgres + the API
  together (the Expo app still runs on the host with `bun run dev:native`).
- **Native/web** — build with [EAS](https://docs.expo.dev/eas/) (`eas build`)
  or export the web bundle with `bunx expo export`.
