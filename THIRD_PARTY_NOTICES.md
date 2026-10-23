# Third-party and brand notices

The MIT License covers SheAI's original code and documentation, not a relicensing of third-party software, data, hosted services or branding. This is an inventory starting point, not a completed legal audit.

## Software

The package manifest and `bun.lock` identify direct and resolved dependencies. These include React, TanStack, Tailwind CSS, Radix UI, Lucide, Vercel AI SDK, backend SDKs and Lovable integration/configuration packages. Preserve upstream LICENSE/NOTICE files and review the installed versions, transitive dependencies and any restrictions before distributing them. Access to a hosted service is governed separately from its SDK's license.

## Fonts and imagery

- Cormorant Garamond and Manrope are loaded through Google Fonts. Check their upstream SIL Open Font License notices before bundling or modifying font files; external font loading also has privacy implications.
- The uploaded Concept 2 SheAI logo and favicon are brand assets. Their creator/redistribution rights have not been independently verified. The source license does not grant trademark or endorsement rights. Obtain permission or substitute your own lawful assets in an independent release.
- `src/assets/*.asset.json` files point to hosted media rather than necessarily containing portable binaries. Check the source and permission for every referenced asset before redistributing or relying on that host.

## Maps and emergency sources

Trip views link to OpenStreetMap. Preserve attribution required by the map provider when embedding or distributing map content; follow OpenStreetMap licensing and service usage terms. No map database is included in this source license.

Emergency-directory entries contain factual contact information and authoritative source links. Links are not endorsements or a license to reproduce full third-party pages. Review accuracy, service scope and source terms when adapting the directory.