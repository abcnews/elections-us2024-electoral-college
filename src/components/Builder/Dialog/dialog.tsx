import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import styles from './styles.scss';
export function DialogHeader({ children }) {
  return <div className={styles.menuHeader}>{children}</div>;
}

export function DialogDivider() {
  return <hr className={styles.menuDivider} />;
}

export function DialogLabel({ children }) {
  return <label className={styles.menuItem}>{children}</label>;
}

export function Dialog({ children, onClose, position }) {
  const dialog = useRef();
  const [rect, setRect] = useState();
  useEffect(() => {
    if (!dialog.current) {
      return;
    }
    dialog.current.showModal();
    setRect(dialog.current.getBoundingClientRect());
  }, [dialog]);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      style={
        rect
          ? {
              left:
                (rect.width + position[0] > window.innerWidth ? window.innerWidth - rect.width : position[0]) + 'px',
              top:
                (rect.height + position[1] > window.innerHeight ? window.innerHeight - rect.height : position[1]) + 'px'
            }
          : {}
      }
      onClick={onClose}
      onClose={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </dialog>
  );
}
