// app/api/[[...slugs]]/route.ts
// import { Elysia, t } from "elysia";

// const app = new Elysia({ prefix: "/user" })
//   .get("/", () => "hi")
//   .post("/", ({ body }) => body, {
//     body: t.Object({
//       name: t.String(),
//     }),
//   });

import { elysiaApp } from 'hangouthub-elysia'

export const GET = elysiaApp.handle
export const POST = elysiaApp.handle
export const PUT = elysiaApp.handle
export const PATCH = elysiaApp.handle
export const DELETE = elysiaApp.handle
