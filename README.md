# Kumar_InteractiveHotspots (fresh module scaffold)

Adds an **InteractiveHotspots** content type under Page Builder's **Add Content** panel. The editor supports image upload, click-to-place hotspot points, a details dialog (name, description and URL), drag-to-reposition and deletion. Frontend styles are fluid and mobile-responsive.

## Install

1. Copy `Kumar_InteractiveHotspots` into `app/code/Kumar/InteractiveHotspots`.
2. Run:
   ```bash
   bin/magento module:enable Kumar_InteractiveHotspots
   bin/magento setup:upgrade
   bin/magento cache:flush
   bin/magento setup:static-content:deploy -f
   ```
3. Open CMS Page / Block in Page Builder and find **InteractiveHotspots** under **Add Content**.

Uploaded images are stored in `pub/media/kumar/interactivehotspots`.

## Important implementation notes

- Hotspot coordinates are stored as percentages so their positions follow the image's responsive dimensions.
- The upload endpoint is protected by Magento's backend ACL (`Magento_PageBuilder::content`) and uses Magento's uploader/Media directory APIs.
- No product selector or external slider dependency is included.
- This package was generated and statically inspected outside a running Magento instance. Before production use, validate the content type XML/form field schema and editor save/reopen behaviour against the exact installed Magento Page Builder version, then test uploads with your deployment's admin ACL and media permissions.
