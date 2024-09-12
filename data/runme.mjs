/**
 * @file
 * Calculate hexagons ahead of time. Why make the browser do what we couldn't
 * be bothered to?
 *
 * Hexagons are configured in stateDelegateHexesXy*.json - these are editable in
 * the builder in https://www.abc.net.au/res/sites/news-projects/elections-us2024-results/0.2.0/editor.html
 *
 * When changing hexagon layouts, run `npm run generate-mapdata` to generate new files.
 */
import statesDelegateHexexXY2024 from './statesDelegateHexesXY2024.json' with { type: "json" };
import statesDelegateHexexXY2020 from './statesDelegateHexesXY2020.json' with { type: "json" };
import labels2024 from './labelPositions2024.json' with { type: "json" };
import groups from './groups.json' with { type: "json" };
import { defineHex, Grid, rectangle } from 'honeycomb-grid';
import polygonClipping from 'polygon-clipping';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(import.meta.url.replace('file://',''));


  // Offset to line up with legacy graphics
  const Y_OFFSET = 18

function toSvgCoord([x,y]){


  const newX = (x);
  const newY = (y) + Y_OFFSET;

  return `${newX},${newY}`;
}

// 1. Create a hex class matching roughly the old hex dims
const Tile = defineHex({ dimensions: 17 });
const grid = new Grid(Tile, rectangle({ width: 100, height: 100 }));
const zeroHex = grid
  .getHex({ col: 0, row: 0 })
  .corners.map(({ x, y }) => [x, y])
  .map(([x ,y]) => `${x},${y}`);
const zeroHexD = `M${zeroHex.join(' ')}z`;

function processFile(delegateHexesXy){
  const STATES_DELEGATE_HEXES = {};
  Object.entries(delegateHexesXy).forEach(([state, hexes]) => {
    const newHexes = hexes.map((point, i) => {
      const hex = grid
        .getHex({ col: point[1], row: point[0] });
      return ([hex.x,hex.y+Y_OFFSET]);

    });
    STATES_DELEGATE_HEXES[state] = newHexes;
  });

  // Create state outlines
  const STATES_SHAPES = {};
  const allPolygons = [];
  Object.entries(delegateHexesXy).forEach(([state, hexes]) => {
    const  statePolygons = hexes.map(([row, col]) => {
      const hex = grid.getHex({ row, col });
      if (!hex) return [];
      const ring = hex.corners.map(({ x, y }) => [x, y]);
      const polygon = [ring];
      return polygon;
    });
    allPolygons.push(...statePolygons);
    const statePolygonsUnion = (statePolygons.length ? polygonClipping.union(statePolygons) : []).sort(
      (a, b) => b[0].length - a[0].length
    );

    const statePolygonsUnionStrings = statePolygonsUnion.map(polygon => {
      return polygon[0].map(toSvgCoord).join(' ');
    })

    STATES_SHAPES[state] = statePolygonsUnionStrings;
  });

  // Create country outlines
  const countryPolygonsUnion = polygonClipping.union(allPolygons).sort(
    (a, b) => b[0].length - a[0].length
  );

  const statePolygonsUnionStrings = countryPolygonsUnion.map(polygon => {
    return polygon[0].map(toSvgCoord).join(' ');
  });

  return {STATES_DELEGATE_HEXES, STATES_SHAPES, statePolygonsUnionStrings}
}

const us2024= processFile(statesDelegateHexexXY2024);
const us2020  =processFile(statesDelegateHexexXY2020);

const newLabels = {...labels2024}
// Offset label positions for the graphic.
Object.keys(labels2024).forEach(key => {
  console.log(key, labels2024[key][1])
  labels2024[key][0] += 13;
});

us2024.labels = newLabels;
us2020.labels = newLabels;


// Calculate state/group totals based on the number of hexagons assigned to each
// Note: ME/NE are hard-coded in the JSON because these states split votes
const groupCounts = groups.map(group => ({
  ...group,
  count: group.count || {
    2020: us2020.STATES_DELEGATE_HEXES[group.id].length,
    2024: us2024.STATES_DELEGATE_HEXES[group.id].length,
  }
}));

fs.writeFileSync(path.resolve(__dirname, 'generated__mapdata.json'), JSON.stringify({zeroHexD, us2024, us2020, groupCounts}, null,2));

