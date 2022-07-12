const { pipe, mapObjIndexed, values, unnest } = require("ramda");

const countUniqueNodes = (state) => {
  const rows = toSegmentsIndexed(state.hSegments);
  const cols = toSegmentsIndexed(state.vSegments);
  return state.hSum + state.vSum - countOverlaps(rows, cols);
};

const countOverlaps = (rows, cols) =>
  cols.reduce((acc, [xPos, segment]) => {
    const [yStart, yEnd] = segment;
    const overlaps = rows.filter(([row, rowSegment]) => {
      const [xStart, xEnd] = rowSegment;
      return row >= yStart && row <= yEnd && xStart <= xPos && xEnd >= xPos;
    }).length;
    return acc + overlaps;
  }, 0);

const toSegmentsIndexed = pipe(
  mapObjIndexed((segments, key) =>
    segments.map((segment) => [Number.parseInt(key), segment])
  ),
  values,
  unnest
);

module.exports = {
  countUniqueNodes,
};
