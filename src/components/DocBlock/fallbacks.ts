import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import graphicStyles from '../Graphic/styles.scss';
import tilegramStyles from '../Tilegram/styles.scss';
import { DEFAULT_PROPS, GraphicProps } from '../Graphic';
import { graphicPropsToAlternatingCase } from '../../utils';

const graphicPropsToUrlQuery = ({}, {}) => '';

export default function run(initiatingElement, panels) {
  const graphicsProps: GraphicProps[] = [];
  const filenames: string[] = [];

  function processPanel({ data, nodes }) {
    console.log({ data });
    graphicsProps.push({
      ...DEFAULT_PROPS,
      ...data
    } as GraphicProps);
    filenames.push(String(nodes[0].textContent).trim().replace(/\W+/g, '-').slice(0, 30).toLowerCase());
  }

  if (panels) {
    panels.forEach(processPanel);
  } else {
    Object.keys(window.__scrollytellers).forEach(key => {
      window.__scrollytellers[key].panels.forEach(processPanel);
    });
  }

  //  2020 edition
  // const imageURLs = graphicsProps.map(
  //   graphicProps =>
  //     `https://cors-anywhere.herokuapp.com/https://fallback-automation.drzax.now.sh/api?url=${encodeURIComponent(
  //       `${__webpack_public_path__}editor/${graphicPropsToUrlQuery(graphicProps, DEFAULT_PROPS)}`
  //     )}&width=600&selector=.${graphicProps.counting ? graphicStyles.root : tilegramStyles.root}`
  // );

  // 2024 edition
  // const urlRoot = `https://www.abc.net.au/res/sites/news-projects/elections-us2024-electoral-college/1.0.43/editor/`;
  const urlRoot = `${__webpack_public_path__}editor/`;
  const imageURLs = graphicsProps.map(
    graphicProps =>
      `https://fallback-automation-inky.vercel.app/api?url=${encodeURIComponent(
        `${urlRoot}#${graphicPropsToAlternatingCase(graphicProps)}`
      )}&width=600&selector=.${graphicProps.counting ? graphicStyles.root : tilegramStyles.root}`
  );

  const zip = new JSZip();
  console.log({ imageURLs });
  const imageBlobPromises = imageURLs.map(url => fetch(url).then(response => response.blob()));

  (initiatingElement as HTMLElement).style.pointerEvents = 'none';

  const end = () => {
    (initiatingElement as HTMLElement).style.pointerEvents = 'initial';
  };

  Promise.all(imageBlobPromises)
    .then(blobs => {
      blobs.forEach((blob, index) => {
        if (blob) {
          zip.file(`${String(index).padStart(3, '0')}-${filenames[index]}.png`, blob);
        }
      });
      zip
        .generateAsync({ type: 'blob' })
        .then(content => {
          saveAs(content, `ec-fallback-bundle-${Date.now()}.zip`);
          end();
        })
        .catch(end);
    })
    .catch(end);
}
