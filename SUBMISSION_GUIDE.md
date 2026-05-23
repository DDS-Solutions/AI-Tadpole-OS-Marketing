# Google & Bing Webmaster Verification Guide

To verify ownership and expedite crawling of **AI-Tadpole-OS-Marketing** on Google and Bing:

## 1. Google Search Console Verification
The website template currently includes the following verification meta tag inside the HTML `<head>` section:
```html
<meta name="google-site-verification" content="fZFIBOhQC_xJPk_Vt_iueDPpdufqV8XOqdifUtCu_dk" />
```

### Steps:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a new **URL Prefix** property for: `https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/`.
3. Choose the **HTML Tag** verification option.
4. If your Google account owns the site associated with the tag, click **Verify**. (Alternatively, update the `content="..."` attribute in `src/layouts/BaseLayout.astro` with your personalized token).
5. Once verified, go to **Sitemaps** on the side panel and submit: `sitemap.xml`.

---

## 2. Bing Webmaster Tools Verification
Bing allows instant verification if imported directly from Google Search Console, or via standard verification files/tags.

### Steps:
1. Sign in to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Choose **Import your sites from Google Search Console** (recommended, takes 1 click and automatically syncs sitemaps).
3. If importing manually:
   - Add property `https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/`.
   - Submit the sitemap url: `https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/sitemap.xml`.
