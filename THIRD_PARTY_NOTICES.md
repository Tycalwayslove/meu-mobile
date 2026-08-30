# Third-party notices

## Lucide Icons

Selected icon geometry may be generated from Lucide Icons 1.34.0 and is used under the ISC License.
Some Lucide icons are derived from Feather Icons and retain the MIT License. The complete license texts are
stored in `licenses/lucide-isc.txt` and `licenses/feather-mit.txt`.

## TanStack Virtual

`@tanstack/react-virtual` 3.14.10 and `@tanstack/virtual-core` 3.17.8 provide the React Web
virtualization engine and are used under the MIT License. The public Meu API does not expose
TanStack implementation types. The complete license text is stored in `licenses/tanstack-virtual-mit.txt`.

## Other direct runtime dependencies

The distributable Meu packages declare the following third-party runtime dependencies or peer dependencies.
The library build keeps every declared dependency external rather than embedding it into Meu JavaScript output.
Consumers obtain these as separately licensed packages, and their own package license files remain authoritative.

| Package                    | Resolved version | Relationship                      | License copy                       |
| -------------------------- | ---------------: | --------------------------------- | ---------------------------------- |
| `@floating-ui/react`       |          0.27.20 | `@meu/mobile` dependency          | `licenses/floating-ui-mit.txt`     |
| `@vanilla-extract/recipes` |            0.5.7 | `@meu/mobile` dependency          | `licenses/vanilla-extract-mit.txt` |
| `embla-carousel-react`     |            8.6.0 | `@meu/mobile` dependency          | `licenses/embla-carousel-mit.txt`  |
| `@hookform/resolvers`      |            5.9.1 | `@meu/form-react` dependency      | `licenses/react-hook-form-mit.txt` |
| `react-hook-form`          |           7.86.0 | `@meu/form-react` peer dependency | `licenses/react-hook-form-mit.txt` |
| `zod`                      |            4.4.3 | `@meu/form-react` peer dependency | `licenses/zod-mit.txt`             |
| `react`                    |           19.2.8 | React package peer dependency     | `licenses/react-mit.txt`           |
| `react-dom`                |           19.2.8 | React package peer dependency     | `licenses/react-mit.txt`           |

All packages in this table are used under the MIT License. The machine-readable declaration-to-resolution
inventory is stored in `docs/v2/runtime-dependencies.json`. Transitive dependencies are not reproduced in this
summary; they remain subject to the license metadata and license files shipped by their respective packages.
