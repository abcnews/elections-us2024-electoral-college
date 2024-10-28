import React, { useEffect, useState } from 'react';
import styles from './styles.scss';
import coinflipSrc from './illustrations/coinflip.svg';
import shimmerSrc from './illustrations/shimmer.svg';
import { createPortal } from 'react-dom';

const illustrations = {
  shimmer: {
    props: {},
    src: shimmerSrc
  },
  coinflip: {
    props: {},
    src: coinflipSrc
  }
};

export default function Illustration({ name }) {
  const illustrationDefs = illustrations[name];

  if (!illustrationDefs) return null;

  return (
    <div className={styles.root}>
      <iframe
        sandbox="allow-scripts"
        className={styles.frame}
        src={illustrationDefs.src}
        width="380"
        height="380"
      ></iframe>
    </div>
  );
}
