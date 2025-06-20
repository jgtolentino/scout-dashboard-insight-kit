/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'sql-tbwa-projectscout-prod.database.windows.net'],
  },
  env: {
    AZURE_SQL_SERVER: process.env.AZURE_SQL_SERVER,
    AZURE_SQL_DATABASE: process.env.AZURE_SQL_DATABASE,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
  },
}

module.exports = nextConfig
