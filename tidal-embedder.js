const TIDAL_PUBLIC_TOKEN = 'CzET4vdadNUFQ5JU';

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  lookupAlbum(request.options).then((albumList) => {
    sendResponse(albumList);
  });

  return true;
});

async function lookupAlbum(search) {
  const initialSearch = await executeSearch(search.artist, search.albumName);
  if (!initialSearch) return null;
  const result = await initialSearch.json();

  if (!isValidSearch(result)) {
    console.info(`Found no albums, searching for just artist`);

    const backupSearchResponse = await executeSearch(search.artist);

    if (!backupSearchResponse) return null;

    const backupResult = await backupSearchResponse.json();

    console.log(backupResult);

    if (!isValidSearch(backupResult)) {
      console.info(`Found no albums for backup search`);
      return null;
    }

    console.info(`Found ${result.albums.items.length} albums in backup seach`);
    return backupResult.albums.items;
  }

  console.info(`Found ${result.albums.items.length} albums`);
  return result.albums.items;
}

async function executeSearch(artist, album) {
  const requestUrl = `https://listen.tidal.com/v1/search/top-hits?query=${encodeURI(cleanName(album))}%20${encodeURI(
    cleanName(artist)
  )}&limit=25&offset=0&types=ARTISTS,ALBUMS,TRACKS,VIDEOS,PLAYLISTS&includeContributors=true&countryCode=NO`;

  console.info(`Searching for ${cleanName(album)} ${cleanName(artist)}`);

  const response = await fetch(requestUrl, {
    headers: { 'x-tidal-token': TIDAL_PUBLIC_TOKEN },
  });

  if (response.status !== 200) {
    console.error(`Tidal responded with ${response.status} ${response.statusText}`);
    return null;
  }

  return response;
}

function cleanName(name) {
  if (!name) return '';
  return name
    .replace('(LP)', '')
    .replace('(2LP)', '')
    .replace('LTD', '')
    .replace('(10")', '')
    .replace('(12")', '')
    .replace(' - ', '')
    .trim()
    .toLowerCase();
}

function isValidSearch(result) {
  return result && result.albums && result.albums.items && result.albums.items.length > 0;
}
