# PERF

## Deployment and Performance Status

The Sheggar Wheels application is deployed on Vercel.

**Production URL:**
https://sheggar-wheels-p6piu3dqd-joeleyuel.vercel.app

No Lighthouse or real-user performance scores are claimed yet because a repeatable performance audit has not been completed.

## Implemented Performance Measures

- CSS-based responsive layout without a large UI framework.
- Next.js and React for the application interface.
- Car catalogue renders a limited page of results at a time.
- Vehicle photos are stored locally as optimized WebP assets.
- Responsive CSS image sizing.
- Reduced external font dependencies by removing the Google Fonts import.
- Responsive navigation with a mobile hamburger menu.

## Performance Testing

Before final submission, run a production build:

```bash
npm run build
```

Then run Lighthouse using Chrome DevTools on the deployed website.

Record the following metrics where available:

- Performance
- Accessibility
- Best Practices
- SEO
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Interaction to Next Paint (INP)

Test both mobile and desktop configurations.

## Further Improvements

- Optimize image dimensions and loading behavior.
- Review JavaScript bundle size.
- Evaluate caching and data-fetching strategies.
- Reduce unnecessary client-side rendering.
- Test performance under slower network conditions.
- Improve accessibility and keyboard navigation.

Performance scores depend on the device, browser, network, and testing conditions. No specific Lighthouse score is guaranteed.
