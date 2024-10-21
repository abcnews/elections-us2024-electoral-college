import type { PanelDefinition } from '@abcnews/scrollyteller';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { GraphicProps } from '../Graphic';
import Graphic from '../Graphic';
import styles from './styles.scss';
import { getOdyssey } from '../../utils/getOdyssey';
import ScrollytellerWebComponent from '../ScrollytellerWebComponent';

interface BlockProps {
  panels: PanelDefinition<GraphicProps>[];
}

const Block: React.FC<BlockProps> = ({ panels }) => {
  const [graphicProps, setGraphicProps] = useState(panels[0].data);
  const onMarker = useCallback(graphicProps => {
    setGraphicProps(graphicProps);
  }, []);

  return (
    <ScrollytellerWebComponent
      panels={panels.map(panel => ({ ...panel, align: 'left' }))}
      styles={styles}
      onMarker={onMarker}
    >
      <Graphic {...graphicProps} />
    </ScrollytellerWebComponent>
  );
};

export default Block;
