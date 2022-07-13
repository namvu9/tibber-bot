const { reduce, append, init, concat, last } = require("ramda");
const {
  isHorizontalSegment,
  normalizeSegment,
  magnitudeOf,
  isOverlapping,
  mergeSegments,
  startsBefore,
} = require("./segment");

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
  const segment = [state.position, calculatePosition(state.position, command)];
  const newState = storeSegment(segment, state);

  return {
    ...newState,
    position: last(segment),
  };
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
    ? [initialScore + magnitudeOf(newSegment), [newSegment]]
    : segments.reduce(
        ([sum, rowAcc], segment, index) => {
          if (isOverlapping(newSegment, segment)) {
            const mergedSegment = mergeSegments(newSegment, segment);
            const prevSegment = last(rowAcc);

            if (!isOverlapping(prevSegment, mergedSegment)) {
              return [
                sum + magnitudeOf(mergedSegment) - magnitudeOf(segment),
                append(mergedSegment, rowAcc),
              ];
            }

            const twiceMergedSegment = mergeSegments(
              prevSegment,
              mergedSegment
            );

            return [
              sum -
                magnitudeOf(prevSegment) -
                magnitudeOf(segment) +
                magnitudeOf(twiceMergedSegment),
              append(twiceMergedSegment, init(rowAcc)),
            ];
          }

          if (startsBefore(newSegment, segment)) {
            return [
              sum + magnitudeOf(newSegment),
              concat(rowAcc, [newSegment, segment]),
            ];
          }

          if (index === segments.length - 1) {
            return [
              sum + magnitudeOf(newSegment),
              concat(rowAcc, [segment, newSegment]),
            ];
          }

          return [sum + magnitudeOf(segment), append(segment, rowAcc)];
        },
        [initialScore, []]
      );

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
  storeSegment,
  calculatePosition,
};
