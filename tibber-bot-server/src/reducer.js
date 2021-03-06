const { reduce, append, init, concat, last } = require("ramda");
const {
  isHorizontalSegment,
  normalizeSegment,
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
  hSegments: {},
  vSegments: {},
  position: start,
});

const reduceState = (state, command) => {
  const newPosition = calculatePosition(state.position, command);
  const segment = [state.position, newPosition];
  const newState = storeSegment(segment, state);

  return {
    ...newState,
    position: newPosition,
  };
};

const applyCommands = (start, commands) =>
  reduce(reduceState, createExecutionState(start), commands);

const getIndexedSegmentVector = (segment, state) => {
  const [start] = segment;
  return isHorizontalSegment(segment)
    ? [start.y, state.hSegments[start.y]]
    : [start.x, state.vSegments[start.x]];
};

const getDirectionalState = (isHorizontal, state) =>
  isHorizontal
    ? {
        vectors: state.hSegments,
        vectorsKey: "hSegments",
      }
    : {
        vectors: state.vSegments,
        vectorsKey: "vSegments",
      };

const storeSegment = (segment, state) => {
  const isHorizontal = isHorizontalSegment(segment);
  const { vectors, vectorsKey } = getDirectionalState(isHorizontal, state);
  const [index, segmentVector] = getIndexedSegmentVector(segment, state);

  const newVector = insertSegment(normalizeSegment(segment), segmentVector);

  return {
    ...state,
    [vectorsKey]: {
      ...vectors,
      [index]: newVector,
    },
  };
};

const insertSegment = (newSegment, vector = []) =>
  !vector.length
    ? [newSegment]
    : vector.reduce((vectorAcc, segment, index) => {
        if (isOverlapping(newSegment, segment)) {
          const mergedSegment = mergeSegments(newSegment, segment);
          const prevSegment = last(vectorAcc);

          if (!isOverlapping(prevSegment, mergedSegment)) {
            return append(mergedSegment, vectorAcc);
          }

          const twiceMergedSegment = mergeSegments(prevSegment, mergedSegment);

          return append(twiceMergedSegment, init(vectorAcc));
        }

        // no overlap
        return startsBefore(newSegment, segment)
          ? concat(vectorAcc, [newSegment, segment])
          : isLastElement(index, vector)
          ? concat(vectorAcc, [segment, newSegment])
          : append(segment, vectorAcc);
      }, []);

const isLastElement = (index, arr) => index === arr.length - 1;

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
