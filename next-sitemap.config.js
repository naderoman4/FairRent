/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://fairrent.fr',
  generateRobotsTxt: true,
  exclude: ['/lp/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/lp/', '/api/'] },
    ],
  },
};
