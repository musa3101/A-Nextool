import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://t3id9d4k.eu-central.insforge.app';
const anonKey =
  import.meta.env.VITE_INSFORGE_ANON_KEY ||
  'anon_bdeb20bddce93a92ae46f74e45db298f6e6cf5b8a905eb05efce2044f076deb9';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

