import type { TElysiaApp } from './server'
import { treaty } from '@elysiajs/eden';

// If you are not using Next.js v15^, you may want to set revalidate value to 0 due to default caching mechanics.

// export const elysia = treaty<TElysiaApp>('localhost:3000',{
//     fetch: {
//       next:{revalidate:0}
//     },
//   })

const url = process.env.URL_DOMAIN ?? 'localhost:3000';
export const elysia = treaty<TElysiaApp>(url);
