if (typeof Zotero === 'undefined') {
  Zotero = {};
}
Zotero.JAbbr = {};

function setJournalAbbreviation(item) {
  if (item.getField('journalAbbreviation')) {
    return;
  }

  let journal = item.getField('publicationTitle');

  if (!journal) {
    return;
  }

  let abbrevs = {
    default: {
      'container-title': {},
      'collection-title': {},
      'institution-entire': {},
      'institution-part': {},
      nickname: {},
      // eslint-disable-next-line id-blacklist
      number: {},
      title: {},
      place: {},
      hereinafter: {},
      classic: {},
      'container-phrase': {},
      'title-phrase': {},
    },
  };

  Zotero.Cite.getAbbreviation(
    null,
    abbrevs,
    'default',
    'container-title',
    journal
  );

  item.setField(
    'journalAbbreviation',
    abbrevs.default['container-title'][journal]
  );
  item.saveTx();
}

Zotero.JAbbr.resetState = function (state) {
  if (state == 'initial') {
    if (Zotero.JAbbr.progressWindow) {
      Zotero.JAbbr.progressWindow.close();
    }
    Zotero.JAbbr.current = -1;
    Zotero.JAbbr.toUpdate = 0;
    Zotero.JAbbr.itemsToUpdate = null;
    Zotero.JAbbr.numberOfUpdatedItems = 0;
    Zotero.JAbbr.counter = 0;
  }

  if (state == 'final') {
    var icon = 'chrome://zotero/skin/tick.png';
    Zotero.JAbbr.progressWindow = new Zotero.ProgressWindow({
      closeOnClick: true,
    });
    Zotero.JAbbr.progressWindow.changeHeadline('Finished');
    Zotero.JAbbr.progressWindow.progress =
      new Zotero.JAbbr.progressWindow.ItemProgress(icon);
    Zotero.JAbbr.progressWindow.progress.setProgress(100);
    Zotero.JAbbr.progressWindow.progress.setText(
      'JAbbrs updated for ' + Zotero.JAbbr.counter + ' items.'
    );
    Zotero.JAbbr.progressWindow.show();
    Zotero.JAbbr.progressWindow.startCloseTimer(4000);
  }
};

Zotero.JAbbr.updateSelectedItems = function (operation) {
  Zotero.JAbbr.updateItems(ZoteroPane.getSelectedItems(), operation);
};

Zotero.JAbbr.updateItems = function (items0) {
  let items = items0.filter(
    (item) => item.itemTypeID == Zotero.ItemTypes.getID('journalArticle')
  );
  items = items.filter((item) => !item.isFeedItem);

  Zotero.JAbbr.resetState('initial');
  Zotero.JAbbr.toUpdate = items.length;
  Zotero.JAbbr.itemsToUpdate = items;

  // Progress Windows
  Zotero.JAbbr.progressWindow = new Zotero.ProgressWindow({
    closeOnClick: false,
  });
  var icon =
    'chrome://zotero/skin/toolbar-advanced-search' +
    (Zotero.hiDPI ? '@2x' : '') +
    '.png';
  Zotero.JAbbr.progressWindow.changeHeadline('Getting JAbbrs', icon);
  Zotero.JAbbr.progressWindow.progress =
    new Zotero.JAbbr.progressWindow.ItemProgress(
      icon,
      'Updating Journal Abbreviations.'
    );

  Zotero.JAbbr.updateNextItem();
};

Zotero.JAbbr.updateNextItem = function () {
  Zotero.JAbbr.numberOfUpdatedItems++;

  Zotero.debug(Zotero.JAbbr.current);

  if (Zotero.JAbbr.current == Zotero.JAbbr.toUpdate - 1) {
    Zotero.JAbbr.progressWindow.close();
    Zotero.JAbbr.resetState('final');
    return;
  }

  Zotero.JAbbr.current++;

  // Progress Windows
  var percent = Math.round(
    (Zotero.JAbbr.numberOfUpdatedItems / Zotero.JAbbr.toUpdate) * 100
  );
  Zotero.JAbbr.progressWindow.progress.setProgress(percent);
  Zotero.JAbbr.progressWindow.progress.setText(
    'Item ' + Zotero.JAbbr.current + ' of ' + Zotero.JAbbr.toUpdate
  );
  Zotero.JAbbr.progressWindow.show();

  setJournalAbbreviation(Zotero.JAbbr.itemsToUpdate[Zotero.JAbbr.current]);

  Zotero.JAbbr.counter++;

  Zotero.JAbbr.updateNextItem();
};
