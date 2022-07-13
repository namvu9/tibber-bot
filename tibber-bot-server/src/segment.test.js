const { countUniqueNodes, magnitudeOf } = require("./segment");

describe("magnitudeOf", () => {
  it("should handle single node segment", () => {
    expect(magnitudeOf([0, 0])).toEqual(1);
  });

  it("should handle segments", () => {
    expect(magnitudeOf([-1, 2])).toEqual(4);
  });
});

describe("countUniqueNodes", () => {
  it("should handle horizontal movement", () => {
    const finalState = {
      hSum: 5,
      vSum: 0,
      hSegments: { 0: [[0, 4]] },
      vSegments: {},
      position: { x: 4, y: 0 },
    };
    expect(countUniqueNodes(finalState)).toEqual(5);
  });

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

  // v < v < <
  // v ^ v   ^
  // v ^ v   ^
  // v ^ v   ^
  // + ^ <   ^
  it("should handle vertical zig-zag pattern (west from bottom right)", () => {
    const finalState = {
      hSum: 7,
      vSum: 20,
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
    expect(countUniqueNodes(finalState)).toEqual(21);
  });
});
