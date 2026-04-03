# Changelog

## [Unreleased]

### Breaking Changes
- **Default AI Model Changed**: The default AI model has been switched from `gpt-4o` to `gemini-3-flash-preview` to make the CLI more accessible out of the box (Google provides a free tier for Gemini API keys). If you previously relied on the default `gpt-4o` and only had an `OPENAI_API_KEY` set, you may need to pass `--ai-model gpt-4o` explicitly.

### Changed
- Improved `handleCookieConsent()` precision to avoid accidentally hiding non-banner layout elements.
- Fixed an issue where the Adblocker plugin would register multiples times during `BrowserEngine` initialization.

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
