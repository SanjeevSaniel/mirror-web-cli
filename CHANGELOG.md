# Changelog

## 1.0.2 - 2025-08-18

### Added

- Robust handling for Next.js image optimizer:
  - Skip direct downloads of `/_next/image` to avoid HTTP 402.
  - Parse and download the original image from the `url=` parameter.
  - Alias `/_next/image` URLs to the same local file as the original.
- Runtime asset rewriter:
  - Rewrites `src`, `href`, `poster`, `style` background-image,
  - Rewrites `srcset` and `imagesrcset` (critical for responsive images),
  - Observes DOM mutations to rewrite dynamic nodes (e.g., hover/popover content).
  - Optional debug logging with `[MW rewrite]` lines.
- Microlink support:
  - Captures Microlink images and follows JSON to the actual screenshot/image URL.
  - Downloader resolves Microlink indirection and saves the final bytes offline.
- Hover simulation and computed asset capture:
  - Triggers common hover/popover patterns so previews render during mirroring.
  - Surfaces computed background and pseudo-element images into the DOM for capture.

### Fixed

- Blank hover/popover previews offline when `srcset` pointed to `/_next/image`.
- 402 errors during image downloads caused by Next.js optimizer endpoints.

### Notes

- The rewriter is automatically injected for Next.js/React pages.
- Use `--debug` to view `[MW rewrite]` logs and verify asset rewriting at runtime.
