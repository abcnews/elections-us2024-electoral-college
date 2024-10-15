import React, { useEffect, useState } from 'react';

async function newVersionCheck() {
  const thisVersion = window.location.pathname.match(/\/elections-us2024-electoral-college\/(\d+\.\d+\.\d+)/)?.[1];
  if (!thisVersion) {
    return Promise.resolve(null);
  }
  const [major, minor, patch] = thisVersion.split('.');
  const nextVersions = [
    [1 + Number(major), minor, patch],
    [major, 1 + Number(minor), patch],
    [major, minor, 1 + Number(patch)]
  ].map(version => version.join('.'));
  const baseUrl = 'https://www.abc.net.au/res/sites/news-projects/elections-us2024-electoral-college/';
  const newVersions = await Promise.all(
    nextVersions.map(version =>
      fetch(`${baseUrl}${version}/index.html?check`)
        .then(response => (response.status !== 200 ? false : version))
        .catch(() => false)
    )
  );

  const newVersion = newVersions.find(Boolean);
  return { thisVersion, newVersion, url: `${baseUrl}${newVersion}/editor${window.location.hash}` };
}

export default function NewVersionCheck() {
  const [newVersion, setNewVersion] = useState(null);
  useEffect(() => {
    newVersionCheck().then(setNewVersion);
  }, []);

  return (
    !!newVersion?.newVersion && (
      <a
        href={newVersion?.url}
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
          background: 'white',
          color: 'black',
          border: '1px solid black',
          padding: '1em',
          zIndex: 100
        }}
      >
        There is a new version available.
        <br />
        <br />
        Current: {newVersion?.thisVersion}
        <br />
        New: <strong>{newVersion?.newVersion}</strong>
      </a>
    )
  );
}
