const {
  pipe,
  mapObjIndexed,
  values,
  unnest,
  curry,
  sortBy,
  prop,
  eqProps,
  pluck,
  ifElse,
  min,
  max,
} = require("ramda");

const countUniqueNodes = (state) => {
  const rows = toSegmentsIndexed(state.hSegments);
  const cols = toSegmentsIndexed(state.vSegments);
  const overlaps = cols.reduce(countOverlapsWith(rows), 0);

  return state.hSum + state.vSum - overlaps;
};

const countOverlapsWith =
  (rows) =>
  (acc, [col, colSegment]) =>
    acc +
    rows.filter(
      ([row, rowSegment]) =>
        withinSegment(colSegment, row) && withinSegment(rowSegment, col)
    ).length;

const within = (val, start, end) => start <= val && end >= val;
const withinSegment = curry(([start, end], val) => within(val, start, end));

const toSegmentsIndexed = pipe(
  mapObjIndexed((segments, key) =>
    segments.map((segment) => [Number.parseInt(key), segment])
  ),
  values,
  unnest
);

// TODO: MOVE
const isOverlapping = (segA, segB) => {
  if (!segA || !segB) {
    return false;
  }

  const [startA, endA] = segA;

  return withinSegment(segB, startA) || withinSegment(segB, endA);
};

const isHorizontalSegment = ([start, end]) => eqProps("y", start, end);

const normalizeHorizontalSegment = pipe(sortBy(prop("x")), pluck("x"));
const normalizeVerticalSegment = pipe(sortBy(prop("y")), pluck("y"));

const normalizeSegment = ifElse(
  isHorizontalSegment,
  normalizeHorizontalSegment,
  normalizeVerticalSegment
);

const startsBefore = ([, endA], [startB]) => endA < startB;

const mergeSegments = ([startA, endA], [startB, endB]) => [
  min(startA, startB),
  max(endA, endB),
];

// This function expect the segment to be arranged such that
// start <= end
const magnitudeOf = (segment) => {
  if (!segment) return 0;
  const [start, end] = segment;
  return end - start + 1;
};

module.exports = {
  isHorizontalSegment,
  countUniqueNodes,
  withinSegment,
  magnitudeOf,
  normalizeSegment,
  isOverlapping,
  mergeSegments,
  startsBefore,
};
