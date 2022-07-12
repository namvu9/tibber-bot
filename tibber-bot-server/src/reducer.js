const {
  reduce,
  eqProps,
  append,
  ifElse,
  init,
  concat,
  last,
} = require("ramda");

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

const reduceState = (state, command) => {
  const segment = createSegment(state, command);
  const newState = storeSegment(segment, state);

  return {
    ...newState,
    position: last(segment),
  };
};

const createSegment = (state, command) => {
  const { position } = state;
  return [position, calculatePosition(position, command)];
};

// The algorithm can roughly be outlined as follows:
//
// 1. As we iterate over the commands, we build a map of
// contiguous horizontal and vertical segments, representing
// the robot's movements.
//
// 2. Count the number of nodes covered by the horizontal
// and vertical segments, respectively. The sum of these two
// counts will be an overestimate of the number of nodes
// covered since they do not account for overlaps.
//
// 3. Determine the number of nodes covered by both
// horizontal and vertical segments and subtract 1 for each
// such node. The remaining count is the number of UNIQUE
// nodes visited
const applyCommands = (start, commands) =>
  reduce(reduceState, createExecutionState(start), commands);

// This function expect the segment to be arranged such that
// start <= end
const countVisitedNodes = (segment) => {
  if (!segment) return 0;
  const [start, end] = segment;
  return end - start + 1;
};

const storeSegment = (segment, state) =>
  isHorizontalSegment(segment)
    ? storeHorizontalSegment(segment, state)
    : storeVerticalSegment(segment, state);

// TODO: Clean up
const storeHorizontalSegment = (segment, state) => {
  const [start] = segment;
  const row = state.hSegments[start.y];

  const [hSum, newRow] = insertSegment(
    normalizeSegment(segment),
    row,
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

// TODO: Clean up
const storeVerticalSegment = (segment, state) => {
  const [start] = segment;
  const [vSum, newCol] = insertSegment(
    normalizeSegment(segment),
    state.vSegments[start.x],
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

const insertSegment = (newSegment, segments = [], initialScore = 0) =>
  !segments.length
    ? [initialScore + countVisitedNodes(newSegment), [newSegment]]
    : // TODO: Clean up
      segments.reduce(
        ([sum, rowAcc], segment, index) => {
          if (isOverlapping(newSegment, segment)) {
            const mergedSegment = mergeSegments(newSegment, segment);
            const prevSegment = last(rowAcc);

            if (!isOverlapping(prevSegment, mergedSegment)) {
              return [
                sum +
                  countVisitedNodes(mergedSegment) -
                  countVisitedNodes(segment),
                append(mergedSegment, rowAcc),
              ];
            }

            const twiceMergedSegment = mergeSegments(
              prevSegment,
              mergedSegment
            );

            return [
              sum -
                countVisitedNodes(prevSegment) -
                countVisitedNodes(segment) +
                countVisitedNodes(twiceMergedSegment),
              append(twiceMergedSegment, init(rowAcc)),
            ];
          }

          if (startsBefore(newSegment, segment)) {
            return [
              sum + countVisitedNodes(segment),
              concat(rowAcc, [newSegment, segment]),
            ];
          }

          if (index === segments.length - 1) {
            return [
              sum + countVisitedNodes(newSegment),
              concat(rowAcc, [segment, newSegment]),
            ];
          }

          return [sum + countVisitedNodes(segment), append(segment, rowAcc)];
        },
        [initialScore, []]
      );

const isOverlapping = (segA, segB) => {
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

const isHorizontalSegment = ([start, end]) => eqProps("y", start, end);

const normalizeHorizontalSegment = ([start, end]) =>
  start.x <= end.x ? [start.x, end.x] : [end.x, start.x];

const normalizeVerticalSegment = ([start, end]) =>
  start.y <= end.y ? [start.y, end.y] : [end.y, start.y];

const normalizeSegment = ifElse(
  isHorizontalSegment,
  normalizeHorizontalSegment,
  normalizeVerticalSegment
);

const startsBefore = ([, endA], [startB]) => endA < startB;

const mergeSegments = ([startA, endA], [startB, endB]) => [
  startA < startB ? startA : startB,
  endA > endB ? endA : endB,
];

const calculatePosition = (currentPos, command) => {
  const { x, y } = currentPos;
  const { direction, steps } = command;

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
  applyCommands,
  countVisitedNodes,
  storeSegment,
  calculatePosition,
  createSegment,
  normalizeSegment,
};
