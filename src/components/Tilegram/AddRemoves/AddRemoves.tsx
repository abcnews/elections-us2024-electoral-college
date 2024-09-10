import React from 'react';
import styles from './styles.scss';
import data from '../generated__mapdata.json';
const { zeroHexD } = data;

const IconRemove = () => <rect x="-7" y="-1.5" width="14" height="3" fill="white" />;
const IconAdd = () => (
  <g transform="translate(-7,-7)">
    <rect x="0.527832" y="6" width="14" height="3" fill="white" />
    <rect x="9.02783" y="0.5" width="14" height="3" transform="rotate(90 9.02783 0.5)" fill="white" />
  </g>
);

export default function AddRemoves({ addremoves = {}, allocations, data }) {
  const graphics = Object.entries(addremoves)
    .filter(([key, style]) => style)
    .map(([key, style]) => {
      const [stateDelegate, index] = String(key).split(',');
      const state = stateDelegate.replace(/_\d/, '');
      const coords = data.STATES_DELEGATE_HEXES[state][index];
      if (!coords) {
        return null;
      }
      const Icon = style === 'a' ? IconAdd : IconRemove;
      return (
        <g className={styles.root} transform={`translate(${coords.join(' ')})`}>
          <path className={[styles.hex, styles[String(style)]].filter(Boolean).join(' ')} d={zeroHexD} />
          <Icon />
        </g>
      );
    });
  return graphics;
}
