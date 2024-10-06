/**
 * Generates all possible combinations of indices for a given set of lengths.
 * @param lengths {number[]} - The lengths of the arrays to generate indices for.
 * @returns {Generator<number[]>} - A generator that yields all possible combinations of indices.
 * @source https://stackoverflow.com/a/4694438
 */
export function* allPossibleCombinations(...lengths: number[]): Generator<number[]> {
    const n = lengths.length;

    let indices = [];
    for (let i = n; --i >= 0;) {
        if (lengths[i] === 0) { return; }
        if (lengths[i] !== (lengths[i] & 0x7fffffff)) { throw new Error(); }
        indices[i] = 0;
    }

    while (true) {
        yield indices;
        // Increment indices.
        ++indices[n - 1];
        for (let j = n; --j >= 0 && indices[j] === lengths[j];) {
            if (j === 0) { return; }
            indices[j] = 0;
            ++indices[j - 1];
        }
    }
}
