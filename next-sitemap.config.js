/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://fair-rent-seven.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/lp/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/lp/', '/api/'] },
    ],
    additionalSitemaps: [],
  },
};
