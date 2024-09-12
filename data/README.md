## labelPositions

These are taken from figma:

1. export an SVG
2. copy all the x & y coords out of the svg into the json

I used regex search and replace to format the svg as JSON.

## statesDelegateHexes

These are designed with the [map editor in the elections-us2024-results repo](https://github.com/abcnews/elections-us2024-results/blob/main/public/editor.html).

## groups

This file links groups with a friendly display name + vote count per group.

Vote counts are _mostly_ generated from the number of hexagons in each group, but some groups where the votes are split (ME and NE) need the count hard-coded because there's no other way to automate it.
