export const SITE_ORIGIN = (process.env.SITE_ORIGIN ?? 'https://dds-solutions.github.io').toLowerCase().replace(/\/$/, '');
export const BASE_PATH = (process.env.BASE_PATH ?? '/AI-Tadpole-OS-Marketing').replace(/\/$/, '');
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}/`;

export default {
  SITE_ORIGIN,
  BASE_PATH,
  SITE_URL,
};
