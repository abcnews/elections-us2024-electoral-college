import statesDelegateHexesSvg from './generated__statesDelegateHexesSvg--2024.json';
import stateShapesSvg from './generated__statesShapesSvg--2024.json';
import countryPathsSvg from './generated__countryPathsSvg--2024.json';

export const HEXGRID_PROPS = {
  width: 1037,
  height: 753,
  margin: 3
};

interface StatesShapes {
  [stateID: string]: string[];
}

export const STATES_DELEGATE_HEXES: StatesShapes = statesDelegateHexesSvg;
export const STATES_SHAPES: StatesShapes = stateShapesSvg;
export const COUNTRY_PATHS = countryPathsSvg;

type StateLabel = [number, number, boolean?];

type StatesLabels = {
  [key: string]: StateLabel;
};

export const STATES_LABELS: StatesLabels = {
  AK: [30, 599],
  AL: [518, 530],
  AR: [415, 404],
  AZ: [206, 453],
  CA: [111, 363],
  CO: [252, 276],
  CT: [918, 184],
  DC: [829, 376, true],
  DE: [903, 350, true],
  FL: [628, 658],
  GA: [600, 517],
  HI: [178, 686, true],
  IA: [378, 261],
  ID: [237, 171, true],
  IL: [474, 312],
  IN: [555, 312],
  KS: [304, 325],
  KY: [577, 389],
  LA: [415, 506],
  MA: [947, 135],
  MD: [873, 376],
  ME: [962, 29, true],
  MI: [592, 188],
  MN: [378, 184],
  MO: [385, 325],
  MS: [459, 522, true],
  MT: [281, 148, true],
  NC: [703, 442],
  ND: [326, 158, true],
  NE: [296, 250, true],
  NH: [918, 88],
  NJ: [896, 286],
  NM: [252, 453, true],
  NV: [178, 250],
  NY: [800, 173],
  OH: [637, 312],
  OK: [356, 389],
  OR: [104, 197, true],
  PA: [755, 261],
  RI: [999, 184],
  SC: [696, 504],
  SD: [326, 209, true],
  TN: [518, 440],
  TX: [326, 517],
  UT: [207, 276, true],
  VA: [754, 388],
  VT: [888, 70, true],
  WA: [118, 158],
  WI: [459, 197],
  WV: [703, 360],
  WY: [281, 197, true]
};
