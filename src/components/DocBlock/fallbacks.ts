import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import graphicStyles from '../Graphic/styles.scss';
import tilegramStyles from '../Tilegram/styles.scss';
import { DEFAULT_PROPS, GraphicProps } from '../Graphic';
import { graphicPropsToAlternatingCase } from '../../utils';

export default async function run(initiatingElement, panels) {
  const graphicsProps: GraphicProps[] = [];
  const filenames: string[] = [];

  function processPanel({ data, nodes }) {
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
  const imgServiceRoot = 'https://fallback-automation-inky.vercel.app/api';
  // const imgServiceRoot = 'http://localhost:5173/api';
  const imageURLs = graphicsProps.map(graphicProps =>
    [
      imgServiceRoot,
      new URLSearchParams({
        url: `${urlRoot}#${graphicPropsToAlternatingCase({
          ...graphicProps,
          // Disable animations otherwise we can get partial screenshots
          hexani: undefined,
          hexflip: undefined
        })}`,
        selector: '.' + graphicProps.counting ? graphicStyles.root : tilegramStyles.root
      }).toString()
    ].join('?')
  );

  const zip = new JSZip();
  const imageBlobPromises = imageURLs.map(url =>
    fetch(url).then(response => {
      if (response.status !== 200) {
        return null;
      }
      return response.blob();
    })
  );

  const missing: string[] = [];

  return Promise.all(imageBlobPromises).then(blobs => {
    blobs.forEach((blob, index) => {
      const filename = `${String(index).padStart(3, '0')}-${filenames[index]}.png`;
      if (blob) {
        zip.file(filename, blob);
      } else {
        missing.push(filename);
      }
    });

    if (missing.length === imageBlobPromises.length) {
      alert('Could not download files. The fallback service may not be running.');
      return;
    } else if (missing.length) {
      alert('Error: could not download some files. These might be missing from the zip:\n\n' + missing.join('\n'));
    }

    return zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, `ec-fallback-bundle-${Date.now()}.zip`);
    });
  });
}
