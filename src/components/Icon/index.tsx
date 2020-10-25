import React from 'react';
import styles from './styles.scss';

const ICON_NAME_PATHS = {
  add: 'M11.173 4.084h1.65v7.092h7.1v1.65h-7.1v7.09h-1.65v-7.09H4.077v-1.65h7.096V4.084z',
  delete:
    'M4.218 4.36l-.031-.006 3.943-.508L8.649 2h6.87l.4 1.83 4.015.524-.066.006h.069l.415 1.609H3.648l.534-1.609h.036zm.44 2.724h14.805L18.38 22.031H5.919L4.658 7.084zm1.441 1.457l1.006 12.072h9.932l.864-12.072H6.099z',
  share: 'M15 13.406S5.458 11.47 3.003 19.031c0 0-.438-11.25 11.999-11.25V4.97L21 10.594l-6 5.625v-2.813z'
};

export type IconProps = {
  name: keyof typeof ICON_NAME_PATHS;
};

const Icon: React.FC<IconProps> = ({ name }) => (
  <svg viewBox="0 0 24 24" className={styles.root}>
    <path d={ICON_NAME_PATHS[name]} fill="currentColor" />
  </svg>
);

export default Icon;
