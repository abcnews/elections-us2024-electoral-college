/**
 * @file
 * Calculate hexagons ahead of time. Why make the browser do what we couldn't
 * be bothered to?
 *
 * Hexagons are configured in stateDelegateHexesXy*.json - these are editable in
 * the builder in https://www.abc.net.au/res/sites/news-projects/elections-us2024-results/0.1.0/editor.html
 *
 * When changing hexagon layouts, run `node runme.js` to generate new files.
 */
import statesDelegateHexexXY2024 from './statesDelegateHexesXY2024.json' with { type: "json" };
import statesDelegateHexexXY2020 from './statesDelegateHexesXY2020.json' with { type: "json" };
import { defineHex, Grid, rectangle } from 'honeycomb-grid';
import polygonClipping from 'polygon-clipping';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(import.meta.url.replace('file://',''));



function toSvgCoord([x,y]){
  // Offset to line up with legacy graphics
  const Y_OFFSET = 18


  const newX = Math.round(x)+2;
  const newY = Math.round(y) + Y_OFFSET;

  return `${newX},${newY}`;
}

function processFile(delegateHexesXy){
  // Create state hexagons
  // 1. Create a hex class matching roughly the old hex dims
  const Tile = defineHex({ dimensions: 17 });
  const grid = new Grid(Tile, rectangle({ width: 100, height: 100 }));
  const STATES_DELEGATE_HEXES = {};
  Object.entries(delegateHexesXy).forEach(([state, hexes]) => {
    const newHexes = hexes.map((point, i) => {
      const d= grid
        .getHex({ col: point[1], row: point[0] })
        .corners.map(({ x, y }) => toSvgCoord([x,y]))
        .join(' ');
        return d;

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

const us2024= processFile(statesDelegateHexexXY2024, '2024');
const us2020  =processFile(statesDelegateHexexXY2020, '2020');

fs.writeFileSync(path.resolve(__dirname, 'generated__mapdata.json'), JSON.stringify({us2024, us2020}, null,2));

