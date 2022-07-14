const { storeSegment, applyCommands } = require("./reducer");

describe("applyCommands", () => {
  it("should handle horizontal movement", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "east", steps: 2 },
      { direction: "east", steps: 2 },
    ];

    const res = applyCommands(start, commands);
    const exp = {
      hSegments: { 0: [[0, 4]] },
      vSegments: {},
      position: { x: 4, y: 0 },
    };

    expect(res).toEqual(exp);
  });

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

    const res = applyCommands(start, commands);
    const exp = {
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

    const finalState = applyCommands(start, commands);
    const expectedFinalState = {
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

    const res = applyCommands(start, commands);
    const expectedFinalState = {
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

    const res = applyCommands(start, commands);
    const expectedFinalState = {
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

  // v < v < <
  // v ^ v   ^
  // v ^ v   ^
  // v ^ v   ^
  // + ^ <   ^
  it("should handle vertical zig-zag pattern (west from bottom right)", () => {
    const start = { x: 0, y: 0 };
    const commands = [
      { direction: "north", steps: 4 },
      { direction: "west", steps: 2 },
      { direction: "south", steps: 4 },
      { direction: "west", steps: 1 },
      { direction: "north", steps: 4 },
      { direction: "west", steps: 1 },
      { direction: "south", steps: 4 },
    ];

    const res = applyCommands(start, commands);
    const expectedFinalState = {
      vSegments: {
        "-4": [[-4, 0]],
        "-3": [[-4, 0]],
        "-2": [[-4, 0]],
        0: [[-4, 0]],
      },
      hSegments: {
        0: [[-3, -2]],
        "-4": [
          [-4, -3],
          [-2, 0],
        ],
      },
      position: { x: -4, y: 0 },
    };

    expect(res).toEqual(expectedFinalState);
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

    expect(storeSegment(segment, state)).toEqual({
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

    expect(storeSegment(segment, state)).toEqual({
      hSegments: { 0: [[start.x, end.x]] },
      vSegments: {},
    });
  });

  it("should add segment to row if no overlap and is before", () => {
    const start = { x: -2, y: 0 };
    const end = { x: 0, y: 0 };
    const segment = [start, end];
    const state = {
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [[1, 3]],
        1: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [[1, 3]],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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
      hSegments: {
        0: [
          [1, 3],
          [5, 6],
        ],
      },
      vSegments: {},
    };

    expect(storeSegment(segment, state)).toEqual({
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

    expect(storeSegment(segment, state)).toEqual({
      hSegments: {},
      vSegments: { 0: [[start.y, end.y]] },
    });
  });
});
