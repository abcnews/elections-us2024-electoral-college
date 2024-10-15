import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './TextState.css';
export default function TextState({ name, id, allocation, showAbbr }) {
  return (
    <span className={styles.textState} data-main-allocation={allocation}>
      <span className={styles.textStateInner}> {name}</span>
      {showAbbr && <span className={styles.textStateAcronym}>{id}</span>}
    </span>
  );
}
