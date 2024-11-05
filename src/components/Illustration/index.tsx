import React, { useEffect, useState } from 'react';
import styles from './styles.scss';
import coinflipSrc from './illustrations/coinflip.svg';
import shimmerSrc from './illustrations/shimmer.svg';
import harrisWinsSrc from './illustrations/header-harris-wins-h59912_0.webp';
import trumpWinsSrc from './illustrations/header-trump-wins-g_12@312.webp';

const illustrations = {
  shimmer: {
    src: () => (
      <iframe sandbox="allow-scripts" className={styles.frame} src={shimmerSrc} width="380" height="380"></iframe>
    )
  },
  coinflip: {
    src: () => (
      <iframe sandbox="allow-scripts" className={styles.frame} src={coinflipSrc} width="380" height="380"></iframe>
    )
  },
  harriswins: {
    src: () => (
      <img
        className={styles.img}
        src={harrisWinsSrc}
        alt="Photographic illustration of Kamala Harris and Tim Walz celebrating in front of the White House."
        width="1304"
        height="1120"
      />
    )
  },
  trumpwins: {
    src: () => (
      <img
        className={styles.img}
        src={trumpWinsSrc}
        alt="Photographic illustration of Donald Trump and JD Vance celebrating in front of the White House."
        width="1304"
        height="1121"
      />
    )
  }
};

export default function Illustration({ name }) {
  const illustrationDefs = illustrations[name];

  if (!illustrationDefs) return null;

  return <div className={styles.root}>{illustrationDefs.src()}</div>;
}
