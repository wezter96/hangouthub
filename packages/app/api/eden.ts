import type { TElysiaApp } from 'hangouthub-elysia';
import { treaty } from '@elysiajs/eden';

const url = process.env.URL_DOMAIN ?? 'localhost:8080';
export const api = treaty<TElysiaApp>(url);
