# Next.js Image Optimizer and Microlink Previews (Offline)

This guide explains how the mirror handles Next.js `/_next/image` and Microlink previews.

## Next.js `/_next/image` strategy

- Do not download `/_next/image` directly (prevents 402).
- Parse the original image from the `url=` query parameter.
- Download the original and store a mapping so both the original URL and `/_next/image?...` resolve to the same local file.
- At runtime, a MutationObserver-based rewriter updates any attributes or styles referencing `/_next/image` to the local path.

Attributes handled:

- `src`, `href`, `poster`
- `srcset`, `imagesrcset`
- Inline `style` with `background-image: url(...)`

## Microlink strategy

- Capture Microlink network responses during page load/hover.
- If response is JSON, follow common fields to extract the actual screenshot URL:
  - `data.image.url`, `data.screenshot.url`, `data.thumbnail.url`, `image.url`, `screenshot.url`
- Download the resolved image; store it as a normal local asset.

## Debugging

- Run with `--debug` to see `[MW rewrite]` logs.
- Verify the rewritten path is a local `./assets/...` URL.
- Open the asset directly in the browser to confirm it resolves (200 OK).

## Limitations

- Some sites may lazy-load previews only after specific user interactions; we simulate common hover/pointer events but site-specific interactions may require adjustments.
- If you find a case where `srcset` candidates still point to remote `/_next/image`, file an issue with the HTML snippet or console logs.
