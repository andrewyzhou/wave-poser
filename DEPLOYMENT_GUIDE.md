# Simple Steps to Deploy WavePoser to andrewzhou.org/wave-poser

## ✅ Step 1: WavePoser is Already Configured
WavePoser now deploys at the root of its domain (`https://wave-poser.vercel.app/`). Just commit and push any changes to trigger a new deployment.

## 📝 Step 2: Add Rewrite to Your Main Site

Go to your **main site repository** (the one for andrewzhou.org) and add this rewrite:

### If your main site uses `vercel.json`:
Create or update `vercel.json` in the root of your main site repo:

```json
{
  "rewrites": [
    {
      "source": "/wave-poser/:path*",
      "destination": "https://wave-poser.vercel.app/:path*"
    }
  ]
}
```

### If your main site uses Next.js `next.config.js`:
Add this to your main site's `next.config.js`:

```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/wave-poser/:path*',
        destination: 'https://wave-poser.vercel.app/:path*',
      },
    ]
  },
}
```

## 🚀 Step 3: Deploy Both Sites

1. **WavePoser**: Push the updated `next.config.js` (if you haven't already) - Vercel will auto-deploy
2. **Main Site**: Push the updated `vercel.json` or `next.config.js` - Vercel will auto-deploy

## ✅ Step 4: Test

Visit `https://andrewzhou.org/wave-poser` - it should work!

---

**That's it!** The rewrite tells your main site: "when someone visits /wave-poser, show them the content from your WavePoser deployment."

