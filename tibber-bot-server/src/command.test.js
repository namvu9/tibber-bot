const {
  createExecutionState,
  getScore,
  insertSegment,
  reduceState,
  countUniqueNodes,
} = require("./command");

describe("applyCommands", () => {
  // 8
  // +  +  +
  // +     +
  // +  +  +
  it("should handle moving in a circle", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "east", steps: 2 },
      { direction: "south", steps: 2 },
      { direction: "west", steps: 2 },
      { direction: "north", steps: 2 },
    ];

    const initialState = createExecutionState(start);
    const res = reduceState(initialState, commands);
    const exp = {
      hSum: 6,
      vSum: 6,
      hSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      vSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      position: { x: 0, y: 0 },
    };

    expect(res).toEqual(exp);
  });

  it("should handle moving in a circle twice", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "east", steps: 2 },
      { direction: "south", steps: 2 },
      { direction: "west", steps: 2 },
      { direction: "north", steps: 2 },
      { direction: "east", steps: 2 },
      { direction: "south", steps: 2 },
      { direction: "west", steps: 2 },
      { direction: "north", steps: 2 },
    ];

    const initialState = createExecutionState(start);
    const finalState = reduceState(initialState, commands);
    const expectedFinalState = {
      hSum: 6,
      vSum: 6,
      hSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      vSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      position: { x: 0, y: 0 },
    };

    expect(finalState).toEqual(expectedFinalState);
  });

  // > > > > v
  // v < < < <
  // > > > > v
  // + < < < <
  it("should handle horizontal zig-zag pattern", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "east", steps: 4 },
      { direction: "south", steps: 1 },
      { direction: "west", steps: 4 },
      { direction: "south", steps: 1 },
      { direction: "east", steps: 4 },
      { direction: "south", steps: 1 },
      { direction: "west", steps: 4 },
    ];

    const initialState = createExecutionState(start);
    const res = reduceState(initialState, commands);
    const expectedFinalState = {
      hSum: 20,
      vSum: 6,
      hSegments: { 0: [[0, 4]], 1: [[0, 4]], 2: [[0, 4]], 3: [[0, 4]] },
      vSegments: {
        0: [[1, 2]],
        4: [
          [0, 1],
          [2, 3],
        ],
      },
      position: { x: 0, y: 3 },
    };

    expect(res).toEqual(expectedFinalState);
  });

  // v > v +
  // v ^ v ^
  // v ^ v ^
  // v ^ v ^
  // > ^ > ^
  it("should handle vertical zig-zag pattern", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "south", steps: 4 },
      { direction: "east", steps: 1 },
      { direction: "north", steps: 4 },
      { direction: "east", steps: 1 },
      { direction: "south", steps: 4 },
      { direction: "east", steps: 1 },
      { direction: "north", steps: 4 },
    ];

    const initialState = createExecutionState(start);
    const res = reduceState(initialState, commands);
    const expectedFinalState = {
      hSum: 6,
      vSum: 20,
      vSegments: { 0: [[0, 4]], 1: [[0, 4]], 2: [[0, 4]], 3: [[0, 4]] },
      hSegments: {
        0: [[1, 2]],
        4: [
          [0, 1],
          [2, 3],
        ],
      },
      position: { x: 3, y: 0 },
    };

    expect(res).toEqual(expectedFinalState);
  });
});

describe("countUniqueNodes", () => {
  // 8
  // +  +  +
  // +     +
  // +  +  +
  it("should work", () => {
    const finalState = {
      hSum: 6,
      vSum: 6,
      hSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      vSegments: { 0: [[0, 2]], 2: [[0, 2]] },
      position: { x: 0, y: 0 },
    };

    expect(countUniqueNodes(finalState)).toEqual(8);
  });

  // > > > > v
  // v < < < <
  // > > > > v
  // + < < < <
  it("should handle horizontal zig-zag pattern", () => {
    const finalState = {
      hSum: 20,
      vSum: 6,
      hSegments: { 0: [[0, 4]], 1: [[0, 4]], 2: [[0, 4]], 3: [[0, 4]] },
      vSegments: {
        0: [[1, 2]],
        4: [
          [0, 1],
          [2, 3],
        ],
      },
      position: { x: 0, y: 3 },
    };

    expect(countUniqueNodes(finalState)).toEqual(20);
  });

  // v > v +
  // v ^ v ^
  // v ^ v ^
  // v ^ v ^
  // > ^ > ^
  it("should handle vertical zig-zag pattern", () => {
    const finalState = {
      hSum: 6,
      vSum: 20,
      vSegments: { 0: [[0, 4]], 1: [[0, 4]], 2: [[0, 4]], 3: [[0, 4]] },
      hSegments: {
        0: [[1, 2]],
        4: [
          [0, 1],
          [2, 3],
        ],
      },
      position: { x: 3, y: 0 },
    };

    expect(countUniqueNodes(finalState)).toEqual(20);
  });
});

describe("getScore", () => {
  it("should handle single node segment", () => {
    expect(getScore([0, 0])).toEqual(1);
  });

  it("should handle segments", () => {
    expect(getScore([-1, 2])).toEqual(4);
  });
});

describe("insertSegment", () => {
  it("should handle single-node segment", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 0, y: 0 };
    const segment = [start, end];
    const state = {
      hSegments: {},
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 1,
      hSegments: { 0: [[start.x, end.x]] },

      vSegments: {},
    });
  });

  it("should handle empty state and horizontal segment", () => {
    const start = { x: -1, y: 0 };
    const end = { x: 2, y: 0 };
    const segment = [start, end];
    const state = {
      hSegments: {},
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 4,
      hSegments: { 0: [[start.x, end.x]] },
      vSegments: {},
    });
  });

  it("should add segment to row if no overlap and is before", () => {
    const start = { x: -2, y: 0 };
    const end = { x: 0, y: 0 };
    const segment = [start, end];
    const state = {
      hSum: 3,
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 6,
      hSegments: {
        0: [
          [start.x, end.x],
          [1, 3],
        ],
      },
      vSegments: {},
    });
  });

  it("should add segment to new row", () => {
    const start = { x: -2, y: 1 };
    const end = { x: 0, y: 1 };
    const segment = [start, end];
    const state = {
      hSum: 3,
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 6,
      hSegments: {
        0: [[1, 3]],
        1: [[start.x, end.x]],
      },
      vSegments: {},
    });
  });

  it("should add segment to row if no overlap and is before (new row)", () => {
    const start = { x: -2, y: 1 };
    const end = { x: 0, y: 1 };
    const segment = [start, end];
    const state = {
      hSum: 6,
      hSegments: {
        0: [[1, 3]],
        1: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 9,
      hSegments: {
        0: [[1, 3]],
        1: [
          [start.x, end.x],
          [1, 3],
        ],
      },
      vSegments: {},
    });
  });

  it("should add segment to row if no overlap and is last", () => {
    const start = { x: 5, y: 0 };
    const end = { x: 6, y: 0 };
    const segment = [start, end];
    const state = {
      hSum: 3,
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 5,
      hSegments: {
        0: [
          [1, 3],
          [start.x, end.x],
        ],
      },
      vSegments: {},
    });
  });

  it("should merge segments if overlap", () => {
    const start = { x: -1, y: 0 };
    const end = { x: 1, y: 0 };
    const segment = [start, end];
    const state = {
      hSum: 3,
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 5,
      hSegments: {
        0: [[-1, 3]],
      },
      vSegments: {},
    });
  });

  it("should merge segments if overlap (2)", () => {
    const start = { x: 3, y: 0 };
    const end = { x: 4, y: 0 };
    const segment = [start, end];
    const state = {
      hSum: 3,
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 4,
      hSegments: {
        0: [[1, 4]],
      },
      vSegments: {},
    });
  });

  it("should perform 3-way merge if new segment bridges existing segments", () => {
    const start = { x: 3, y: 0 };
    const end = { x: 5, y: 0 };
    const segment = [start, end];
    const state = {
      hSum: 5,
      hSegments: {
        0: [
          [1, 3],
          [5, 6],
        ],
      },
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSum: 6,
      hSegments: {
        0: [[1, 6]],
      },
      vSegments: {},
    });
  });

  it("should handle empty state and vertical segment", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 0, y: 2 };
    const segment = [start, end];
    const state = {
      hSegments: {},
      vSegments: {},
    };

    expect(insertSegment(segment, state)).toEqual({
      hSegments: {},
      vSegments: { 0: [[start.y, end.y]] },
      vSum: 3,
    });
  });
});
