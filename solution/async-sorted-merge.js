"use strict";

const { Heap } = require("heap-js");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
  // Create min-heap with custom log comparator
  const logComparator = ({ logEntry: a }, { logEntry: b }) =>
    a.date.getTime() - b.date.getTime();
  const logQueue = new Heap(logComparator);

  // Populate min-heap with data from all log sources
  const entries = (
    await Promise.all(logSources.map((logSource) => logSource.popAsync()))
  ).map((logEntry, i) => ({ logEntry, sourceIndex: i }));
  logQueue.init(entries);

  // Introduce a log entry cache to start promises for new log entries early on each source
  const logEntryCache = logSources.map((logSource) => logSource.popAsync());

  // Continuously pop/push off min-heap until all sources are drained
  while (logQueue.length) {
    const { logEntry, sourceIndex } = logQueue.pop();
    printer.print(logEntry);

    const newEntry = await logEntryCache[sourceIndex];
    if (!!newEntry) {
      // add the new entry onto the heap
      logQueue.push({ logEntry: newEntry, sourceIndex });
      // repopulate the cache
      logEntryCache[sourceIndex] = logSources[sourceIndex].popAsync();
    }
  }
  printer.done();

  return console.log("Async sort complete.");
};
