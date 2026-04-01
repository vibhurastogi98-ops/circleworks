import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://circleworks.vercel.app'
  const routes = [
    '',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/demo',
    '/signup',
    '/product/payroll',
    '/product/hris',
    '/product/ats',
    '/product/benefits',
    '/product/time-tracking',
    '/product/expenses',
    '/product/performance',
    '/product/compliance',
    '/product/reporting',
    '/integrations',
    '/security',
    '/trust',
    '/careers',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}
