# Troubleshooting

## Blank hover/popover preview

Symptoms:

- The preview container renders but the image is blank.

Checklist:

- Serve over HTTP, not `file://`.
- Run with `--debug` and check DevTools Console for lines like:
  - `[MW rewrite] srcset: /_next/image?... -> ./assets/images/asset_....png`
- Open the local path in the address bar (e.g., `http://localhost:8000/assets/images/asset_....png`):
  - If 200: likely a CSS visibility/layout issue; inspect the element’s computed width/height, opacity, and ancestor `display`/`overflow`.
  - If 404: the file wasn’t downloaded; re-run the mirror or see the section below.

If the asset is missing (404):

- Make sure the site is mirrored with the new pipeline (v1.0.2+).
- The downloader now resolves Microlink JSON to the real screenshot and avoids `/_next/image`. Re-run:
  - `mirror-web-cli <url> --debug`
  - Delete the old output folder first for a clean run.

## HTTP 402 from Next.js `/_next/image`

Why this happens:

- Next.js optimizer endpoints can require host-bound headers or rate limits, causing 402 for automated downloads.

Solution (v1.0.2+):

- We no longer download `/_next/image` directly.
- We parse the original image from the `url=` query param and download that.
- At runtime, the rewriter maps `/_next/image?...` to the already-downloaded original image file.

## How to confirm the runtime rewriter is working

- Run with `--debug`.
- Watch for `[MW rewrite]` lines for `src`, `srcset`, `imagesrcset`, `href`, `poster`, and `style` background-image.
- Especially ensure `srcset` is rewritten—browsers often prefer `srcset` over `src`.

## Still stuck?

- In the console, inspect candidates:

  ````js
  document.querySelectorAll('img, [style]').forEach((n) => {
    const src = n.currentSrc || n.getAttribute('src') || '';
    const styleAttr = n.getAttribute('style') || '';
    const bg = getComputedStyle(n).backgroundImage || '';
    const hay = [src, styleAttr, bg].join(' ');
    if (/(microlink|_next\/image|og|twitter|card)/i.test(hay)) {
      console.log('el:', n, { src, styleAttr, bg });
    }
  });

  ```Plaintext
  ````

- Share the console output so we can add site-specific hints if needed.
