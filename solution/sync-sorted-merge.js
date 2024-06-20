"use strict";

const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  // Create min-heap with custom log comparator
  const logComparator = ({ logEntry: a }, { logEntry: b }) =>
    a.date.getTime() - b.date.getTime();
  const logQueue = new Heap(logComparator);

  // Populate min-heap with data from all log sources
  for (const logSource of logSources) {
    const logEntry = logSource.pop();

    if (!!logEntry) {
      logQueue.push({ logEntry, logSource });
    }
  }

  // Continuously pop/push off min-heap until all sources are drained
  while (logQueue.length) {
    const { logEntry, logSource } = logQueue.pop();
    printer.print(logEntry);

    const newEntry = logSource.pop();
    if (!!newEntry) {
      logQueue.push({ logEntry: newEntry, logSource });
    }
  }
  printer.done();

  return console.log("Sync sort complete.");
};
