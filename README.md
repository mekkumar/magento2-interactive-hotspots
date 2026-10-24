# Kumar_InteractiveHotspots

A custom Magento 2 Page Builder content type for creating interactive image hotspots.

## Overview

`Kumar_InteractiveHotspots` adds an **InteractiveHotspots** content type to the Page Builder **Add Content** panel.

It allows content editors to configure an image and add interactive hotspot points with supporting details.

<img width="1024" height="1536" alt="Magento 2 Interactive Hotspots Showcase" src="https://github.com/user-attachments/assets/2c6f6af6-6be7-46f8-94d0-cca680c2fce8" />


## Features

- Custom InteractiveHotspots content type for Magento Page Builder.
- Image selection and upload through the editor.
- Click-to-place hotspot points.
- Hotspot details: name, description, and URL.
- Drag-to-reposition existing hotspots.
- Delete existing hotspots.
- Percentage-based hotspot coordinates for responsive positioning.
- Frontend styling designed for responsive layouts.

## Requirements

- Magento 2.
- Magento Page Builder installed and enabled.
- A PHP version compatible with the installed Magento version.

Compatibility should be verified against the Magento and Page Builder versions used in the target installation.

## Installation

### 1. Copy the module

Copy the `Kumar_InteractiveHotspots` directory into:

```text
app/code/Kumar/InteractiveHotspots
```

### 2. Enable the module

From the Magento project root, run:

```bash
bin/magento module:enable Kumar_InteractiveHotspots
```

### 3. Run setup upgrade

```bash
bin/magento setup:upgrade
```

### 4. Clear cache

```bash
bin/magento cache:flush
```

### 5. Deploy static content

Run the following command if required by your environment:

```bash
bin/magento setup:static-content:deploy -f
```

### 6. Open Page Builder

1. Open **Content → Pages** or **Content → Blocks** in Magento Admin.
2. Open the Page Builder editor.
3. Find **InteractiveHotspots** under **Add Content**.
4. Add the content type to the desired layout.
5. Select an image and configure the hotspots.

## Hotspot Configuration

Each hotspot supports the following information:

| Field | Description |
|---|---|
| Name | Label for the hotspot |
| Description | Additional information about the selected point |
| URL | Optional destination associated with the hotspot |
| X coordinate | Horizontal position relative to the image |
| Y coordinate | Vertical position relative to the image |

Hotspot coordinates are stored as percentages so that marker positions can adapt to responsive image dimensions.

## Image Storage

The intended upload directory is:

```text
pub/media/kumar/interactivehotspots
```

Actual upload behaviour depends on the module's upload controller, Magento permissions, and media configuration.

## Important Implementation Notes

- No product selector is included.
- No external slider dependency is included.
- The upload endpoint is intended to use Magento backend ACL and media APIs.
- Validate the content type XML, form configuration, image upload permissions, and editor save/reopen behaviour against the installed Magento Page Builder version before production use.

## License

No license is included in this README. The repository owner should add an appropriate license only after confirming the right to publish and license the module.
