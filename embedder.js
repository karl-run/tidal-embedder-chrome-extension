const toEmbed = (albumId) =>
  `<div class="tidal-embed" style="position:relative;padding-bottom:0;height:256px;width:256px;overflow:hidden;max-width:100%"><iframe src="https://embed.tidal.com/albums/${albumId}?layout=gridify" allowfullscreen="allowfullscreen" frameborder="0" style="position:absolute;top:0;left:0;width:100%;height:1px;min-height:100%;margin:0 auto"></iframe></div>`;

if (window.location.pathname !== '/') {
  const infoContainer = document.querySelector('.product-info-container .heading-container');

  const searchOptions = {
    artist: infoContainer.querySelector('h1').textContent,
    albumName: infoContainer.querySelector('h2').textContent,
  };

  if (searchOptions.artist) {
    const newNode = createPlayerNode();
    document.body.appendChild(newNode);

    const handleSearchResult = (albums) => {
      if (albums == null || albums.length === 0) {
        newNode.innerHTML = `<div>Unable to find album on Tidal</div>`;
        return;
      }

      if (albums.length === 1) {
        newNode.innerHTML = toEmbed(albums[0].id).trim();
      } else {
        newNode.removeChild(newNode.querySelector('div'));
        newNode.appendChild(createResultList(albums, searchOptions.albumName));
      }
    };

    chrome.runtime.sendMessage({ type: 'notification', options: searchOptions }, handleSearchResult);
  }
}

function createPlayerNode() {
  const newNode = document.createElement('div');
  newNode.id = 'tidal-embed-player-node';
  newNode.innerHTML = `<div>Looking for album...</div>`;

  applyStyle(newNode, {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '256px',
    height: '256px',
    backgroundColor: 'black',
    color: 'white',
    zIndex: '99999',
    overflow: 'auto',
  });

  return newNode;
}

function createResultList(albums, albumSearchQuery) {
  const listNode = document.createElement('div');
  applyStyle(listNode, {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  });
  listNode.innerHTML = `<h5 style="margin-left:8px">Had some trouble finding the right album, is it any of these?</div>`;

  albums.sort(sortByFirstWordInAlbum(albumSearchQuery)).forEach((album) => {
    const listItem = document.createElement('button');
    applyStyle(listItem, {
      display: 'flex',
      border: 'none',
      background: 'none',
      textAlign: 'start',
    });
    listItem.innerHTML = `
        <span>‣</span>
        <span>${album.title}</span>
    `;

    listItem.addEventListener('click', () => {
      document.getElementById('tidal-embed-player-node').innerHTML = toEmbed(album.id).trim();
    });

    listNode.appendChild(listItem);
  });

  return listNode;
}

function applyStyle(node, style) {
  Object.keys(style).forEach((it) => (node.style[it] = style[it]));
}

function sortByFirstWordInAlbum(album) {
  if (!album) return () => false;

  const [firstWord] = album.split(' ');

  return (a, b) => {
    if (a.title.includes(firstWord)) return -1;
    else if (b.title.includes(firstWord)) return 1;
    return 0;
  };
}
