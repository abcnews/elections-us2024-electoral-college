import { Allocation, GROUP_IDS } from './constants';

function getAllocationFromString(string) {
  if (!string) return Allocation.None;
  if (string === 'gop') return Allocation.GOP;
  if (string === 'dem') return Allocation.Dem;
  if (string === 'oth') return Allocation.None;
  alert('Error: encountered unknown winner, ' + string);
}

export async function loadData() {
  const data = await fetch('https://static.abc-cdn.net.au/datafiles/uselection2024/output/latest.json').then(res =>
    res.json()
  );

  const results = {};
  const missing = [];
  GROUP_IDS.forEach(id => {
    const [groupName, groupId = '0'] = id.split('_');
    const voter = data.s?.[groupName]?.u?.[groupId];
    if (!voter) {
      console.error('voter missing', groupName, groupId);
      missing.push(id);
    }
    const allocation = getAllocationFromString(voter?.w);
    results[id] = allocation;
  });

  if (missing.length) {
    alert('Error: missing groups: ' + missing.join());
  }

  setTimeout(() => {
    const pubTime = data.t;

    const ageSeconds = Math.round((Date.now() - Number(new Date(pubTime))) / 1000);
    const ageText =
      ageSeconds <= 90
        ? `${ageSeconds} seconds ago`
        : ageSeconds / 60 < 90
        ? `${Math.round(ageSeconds / 60)} minutes ago`
        : `${Math.round(ageSeconds / 60 / 60)} hours ago`;
    alert(`Fetched latest results. Data is from ${ageText}`);
  }, 500);

  return results;
}
