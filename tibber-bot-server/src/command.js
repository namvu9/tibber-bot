const { pipe, mapObjIndexed, values, reduce, unnest } = require("ramda");

// Directions
const NORTH = "north";
const SOUTH = "south";
const WEST = "west";
const EAST = "east";

const createExecutionState = (start) => ({
  hSum: 0,
  vSum: 0,
  hSegments: {},
  vSegments: {},
  position: start,
});

const applyCommand = (state, command) => {
  const { position } = state;
  const newPosition = calculatePosition(position, command);
  const newState = insertSegment([position, newPosition], state);

  return {
    ...newState,
    position: newPosition,
  };
};

const reduceState = reduce(applyCommand);

const countUniqueNodes = (state) => {
  const rows = toSegmentsIndexed(state.hSegments);
  const cols = toSegmentsIndexed(state.vSegments);

  return (
    state.hSum +
    cols.reduce((acc, [xPos, segment]) => {
      const [yStart, yEnd] = segment;
      const overlaps = rows.filter(([row, rowSegment]) => {
        const [xStart, xEnd] = rowSegment;
        return row >= yStart && row <= yEnd && xStart <= xPos && xEnd >= xPos;
      }).length;
      return acc - overlaps;
    }, state.vSum)
  );
};

const toSegmentsIndexed = pipe(
  mapObjIndexed((segments, key) =>
    segments.map((segment) => [Number.parseInt(key), segment])
  ),
  values,
  unnest
);

// This function expect the segment to be arranged such that
// start <= end
const getScore = (segment) => {
  if (!segment) return 0;
  const [start, end] = segment;
  return end - start + 1;
};

const insertSegment = (segment, state) => {
  const [start, end] = segment;

  return start.y !== end.y
    ? insertVerticalSegment(segment, state)
    : insertHorizontalSegment(segment, state);
};

const insertHorizontalSegment = (segment, state) => {
  const [start, end] = segment;
  const row = state.hSegments[start.y];

  const [hSum, newRow] = insertRowSegment(
    start.x < end.x ? [start.x, end.x] : [end.x, start.x],
    row ? row : [],
    state.hSum
  );

  return {
    ...state,
    hSum,
    hSegments: {
      ...state.hSegments,
      [start.y]: newRow,
    },
  };
};

const insertVerticalSegment = (segment, state) => {
  const [start, end] = segment;
  const col = state.vSegments[start.x];
  const [vSum, newCol] = insertRowSegment(
    start.y < end.y ? [start.y, end.y] : [end.y, start.y],
    col ? col : [],
    state.vSum
  );

  return {
    ...state,
    vSegments: {
      ...state.vSegments,
      [start.x]: newCol,
    },
    vSum,
  };
};

const insertRowSegment = (newSegment, row, initialScore = 0) =>
  !row.length
    ? [initialScore + getScore(newSegment), [newSegment]]
    : // TODO: Clean up
      row.reduce(
        ([sum, rowAcc], segment, index) => {
          if (isOverlap(newSegment, segment)) {
            const mergedSegment = mergeSegments(newSegment, segment);
            const prevSegment = getLast(rowAcc);

            if (!isOverlap(prevSegment, mergedSegment)) {
              return [
                sum + getScore(mergedSegment) - getScore(segment),
                [...rowAcc, mergedSegment],
              ];
            }

            const twiceMergedSegment = mergeSegments(
              prevSegment,
              mergedSegment
            );

            return [
              sum -
                getScore(prevSegment) -
                getScore(segment) +
                getScore(twiceMergedSegment),
              [...rowAcc.slice(0, index - 1), twiceMergedSegment],
            ];
          }

          if (startsBefore(newSegment, segment)) {
            return [sum + getScore(segment), [...rowAcc, newSegment, segment]];
          }

          if (index === row.length - 1) {
            return [
              sum + getScore(newSegment),
              [...rowAcc, segment, newSegment],
            ];
          }

          return [sum + getScore(segment), [...rowAcc, segment]];
        },
        [initialScore, []]
      );

const getLast = (arr) => arr[arr.length - 1];

const isOverlap = (segA, segB) => {
  if (!segA || !segB) {
    return false;
  }

  const [startA, endA] = segA;
  const [startB, endB] = segB;

  if (startA >= startB && startA <= endB) {
    return true;
  }

  if (endA <= endB && endA >= startB) {
    return true;
  }

  return false;
};

const startsBefore = ([, endA], [startB]) => endA < startB;

const mergeSegments = ([startA, endA], [startB, endB]) => [
  startA < startB ? startA : startB,
  endA > endB ? endA : endB,
];

const calculatePosition = (currentPos, command) => {
  const { direction, steps } = command;
  const { x, y } = currentPos;

  switch (direction) {
    case NORTH:
      return { x, y: y - steps };
    case SOUTH:
      return { x, y: y + steps };
    case WEST:
      return { x: x - steps, y };
    case EAST:
      return { x: x + steps, y };
    default:
      throw new Error("Uh oh");
  }
};

module.exports = {
  reduceState,
  createExecutionState,
  applyCommand,
  getScore,
  insertSegment,
  countUniqueNodes,
};
