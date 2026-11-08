import type { HistoryItemType } from './history';

/**
 * Sort history items by a date.
 * @param {HistoryItemType[]} arr History array to be sorted
 * @returns {HistoryItemType[]} Sorted history array
 */
export const sortHistoryByDate = (arr: HistoryItemType[]) => {
  return [...arr].sort((a, b) => {
    const timeA = a.last_changed ? new Date(a.last_changed).getTime() : 0;
    const timeB = b.last_changed ? new Date(b.last_changed).getTime() : 0;
    return timeA - timeB;
  });
};
