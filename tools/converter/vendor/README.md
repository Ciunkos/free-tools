# Vendored converter libraries

Built by `node scripts/vendor.mjs` from the pinned npm packages, unmodified apart from bundling and minifying:

- mediabunny 1.66.0 (MPL-2.0)
- @mediabunny/mp3-encoder 1.66.0 (MPL-2.0)
- gifenc 1.0.3 (MIT)
- gifuct-js 2.1.2 (MIT)
- libheif-js 1.23.5 (LGPL-3.0)

libheif-js (LGPL-3.0) is a separate file (heic.mjs, loaded only for HEIC images) so it can be replaced; its source is at https://github.com/catdad-experiments/libheif-js.
