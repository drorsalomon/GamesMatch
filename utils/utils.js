// Filters duplicate elements from an array
exports.filterArray = (array1, array2) => {
  if (Array.isArray(array1) && Array.isArray(array2)) {
    // eslint-disable-next-line no-restricted-syntax
    array1.forEach((el) => {
      // eslint-disable-next-line no-loop-func
      array2.forEach((game) => {
        if (game && el.name === game.name) {
          const index = array2.indexOf(game);
          array2.splice(index, 1);
        }
      });
    });
    return array2;
  }
};

// Sorts the _id array for aggregation (game and user stats)
exports.sortTraitIdArray = (array, isObject = true) => {
  if (Array.isArray(array)) {
    array.sort((a, b) => {
      const posA = isObject ? a._id.toLowerCase() : a.toLowerCase();
      const posB = isObject ? b._id.toLowerCase() : b.toLowerCase();
      if (posA < posB) {
        return -1;
      }
      if (posA > posB) {
        return 1;
      }
      return 0;
    });
  }
};

// Adds a space before an array element
exports.addSpaceToArrayEl = (array) => {
  if (Array.isArray(array)) {
    for (let i = 1; i < array.length; i++) {
      array[i] = array[i].padStart(array[i].length + 1, ' ');
    }
  }
};

// Reverses the date that comes from the DB
exports.reverseDate = (date) => date.split('-').reverse().join('-');

// Formats milliseconds into min:secs
exports.millisToMinsAndSecs = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = parseFloat(((millis % 60000) / 1000 / 100).toFixed(2));
  return minutes + seconds;
};
