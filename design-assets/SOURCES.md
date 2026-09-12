# DarkVeil background and font source record

Prepared for the GasBack application on 2026-09-12. Only files under `design-assets/`
were changed. No paid template code, generated image service, API credits or browser
UI were used. No visual match to the Expense It template has been verified here.

## React Bits DarkVeil

Official repository: [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits).
Pinned revision: `3a1c7f2f9f94ed833934ab5c2635760b9e644583`.

Downloaded unmodified:

- [DarkVeil.jsx](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/src/content/Backgrounds/DarkVeil/DarkVeil.jsx)
- [DarkVeil.css](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/src/content/Backgrounds/DarkVeil/DarkVeil.css)
- [DarkVeilDemo.jsx](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/src/demo/Backgrounds/DarkVeilDemo.jsx)
- [darkVeilCode.js](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/src/constants/code/Backgrounds/darkVeilCode.js)
- [LICENSE.md](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/LICENSE.md)

Their local copies are in `react-bits-darkveil/`. The separate `vertex.glsl` and
`fragment.glsl`, plus `darkveil-shaders.js`, were extracted by `extract-shaders.mjs`.
The shader text is unchanged; `darkveil-shaders.js` uses JavaScript string escaping
so it can be imported directly without a special GLSL loader.

**License:** MIT + Commons Clause, copyright 2026 David Haz. The license allows use,
modification and distribution as part of an application, website or product, including
commercial purposes, with its copyright and permission notice retained. It restricts
selling, sublicensing or redistributing the components themselves, including bundles
and ported versions. Keep the full local license with the application; do not publish
this adaptation as a separate component library or sell it as a template component.
This is not an unrestricted MIT-only component.

### Verified official defaults

| Option | Official value | Effect |
| --- | ---: | --- |
| hueShift | 0 | Shader hue rotation, in degrees |
| noiseIntensity | 0 | Grain |
| scanlineIntensity | 0 | Scanline darkening |
| speed | 0.5 | Time multiplier |
| scanlineFrequency | 0 | Scanline spacing |
| warpAmount | 0 | UV warp strength |
| resolutionScale | 1 | Render resolution multiplier |
| lightMode | false | Light-background color treatment |

Official demo slider ranges: hue 0–360, speed 0–3, noise 0–0.2, scanline intensity
0–1, scanline frequency 0.5–5 and warp 0–5. These are demo controls, not template
parameters or intrinsic shader limits.

### Expense It evidence boundary

Root reported that the public login template uses `canvas.darkveil-canvas` and shows
bright green waves. This task did not inspect that page or its React props. Its exact
hue, speed, resolution, canvas dimensions, animation phase, opacity, CSS filters,
overlays, scanline/noise settings and shader revision are **unknown**.

`GREEN_PRESET` uses hue 110 and speed 0.45 as local starting values. All other shader
options keep the official defaults. These values are not attributed to the template.
The source's neural-pattern shader supplies the flowing wave shapes; the final green
intensity and composition need the root task's side-by-side browser check.

## Vanilla JS integration

Install `ogl@1.0.11` with the application's package manager. Copy
`darkveil-vanilla.js`, `darkveil-shaders.js`, and the full React Bits license into the
application. The module uses a normal bare `ogl` import for a bundler.

```js
import { mountDarkVeil, GREEN_PRESET } from './darkveil-vanilla.js';

const background = mountDarkVeil(document.querySelector('.darkveil-canvas'), GREEN_PRESET);
// Optional controls:
background.update({ hueShift: 110, speed: 0.45 });
background.pause(true);
background.renderAt(4); // Shader time, independent of wall clock; useful for comparisons.
// Call background.destroy() when removing this screen.
```

```css
.background-layer { position: absolute; inset: 0; overflow: hidden; }
.darkveil-canvas { display: block; width: 100%; height: 100%; }
```

The parent must have nonzero dimensions. Keep content in a separate positioned layer.
The shader emits opaque pixels; any overall fade is an application CSS decision.

The React `useEffect` wrapper becomes `mountDarkVeil`; a `ResizeObserver` updates
resolution, and `requestAnimationFrame` updates shader time. The returned handle
allows parameter updates, pause, deterministic time and resource cleanup. The
adaptation respects reduced-motion by default and avoids advancing hidden tabs.

Adaptation differences from upstream: default pixel ratio is 1, and `uResolution`
uses actual framebuffer dimensions. Upstream sets renderer DPR to min(device DPR,2)
but passes CSS dimensions to `uResolution`. At DPR/resolutionScale other than 1,
upstream and this adaptation can therefore produce different framing. Use pixelRatio
1 and resolutionScale 1 for a direct shader comparison. The GLSL itself is unchanged.

`preview.html` is an optional standalone study with an import map resolving the local
installed OGL package. `pnpm.cmd install --frozen-lockfile` prepares it. Root requested
no extra server, so the briefly started local server was stopped and is not running.
No HTTP or browser rendering check was performed; source syntax/import checks and
shader extraction equality are the current verification boundary.

## OGL

Official npm package: `ogl@1.0.11`; [source repository](https://github.com/oframe/ogl).
The package declares **Unlicense**. Its full license text appears in its official
README, not a separate LICENSE file. Copies of the package manifest, README and the
extracted license section are under `ogl/`. The package and lockfile install locally;
`node_modules` is not tracked. No paid service is involved.

## Inter

Official site: [rsms.me/inter](https://rsms.me/inter/).
Official stylesheet: [inter.css](https://rsms.me/inter/inter.css).

Downloaded files from URLs found in that stylesheet:

- [InterVariable.woff2 v4.1](https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1)
- [InterVariable-Italic.woff2 v4.1](https://rsms.me/inter/font-files/InterVariable-Italic.woff2?v=4.1)
- [Official SIL Open Font License 1.1](https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt)

Local assets and license are under `inter/`. Use `inter/inter-local.css` for the two
downloaded variable font files; the preserved upstream stylesheet also references
many static fonts which were not downloaded. Inter supports weight 100–900 in this
variable build. Keep the OFL copyright/license with redistributed font files. The
font license allows application embedding and bundling; fonts may not be sold alone.

`sources.json` records retrieval URLs, file sizes and SHA-256 values for the downloaded
assets and extracted shader files. Font URLs are version-labeled by the official
site rather than commit-addressed, so hashes capture the exact downloaded bytes.
