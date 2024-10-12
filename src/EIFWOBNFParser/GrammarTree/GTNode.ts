import GTNodeChildren from "./GTNodeChildren";
import OR from "./OR";
import SEQ from "./SEQ";

export default class GTNode {
    public constructor(public readonly name: string) {

    }

    /**
     * List of all possible parents
     */
    public parents: Set<GTNode> = new Set();
    public children?: GTNodeChildren = new OR();

    /**
     * Get the string values for all children
     */
    public get childrenAffixStrings(): string[] {
        return this.children?.map((childSeq) => (childSeq.toString())) || [];
    }

    public toString(): string {
        return `${this.name}${(this.children?.length || 0) > 0 ? `(${(this.children)?.join(" | ") || ""})` : ""}`;
    }

    public matchChildren(input: SEQ<GTNode>): GTNodeChildren {
        if (this.children === undefined || this.children.length === 0) {
            return new OR(input);
        }

        const matches = new OR<SEQ<GTNode>>(
            input.slice(0)
        );
        let lastMatchIndex = 0;

        for (let i = 0; i <this.children.length; i++) {
            const seq = this.children[i];
            const queue: {
                matchIndex: number,
                seqIndex: number
            }[] = [{
                matchIndex: lastMatchIndex,
                seqIndex: 0
            }];
            while (queue.length > 0) {
                const {matchIndex, seqIndex} = queue.shift()!;
                if (seqIndex >= seq.length) {
                    continue;
                }
                if (matches[matchIndex].length === 0) {
                    continue;
                }
                if (seq[seqIndex].name === matches[matchIndex][0].name) {
                    matches[matchIndex].shift();
                    queue.push({
                        matchIndex: matchIndex,
                        seqIndex: seqIndex + 1
                    });
                } else {
                    const recursiveMatches = seq[seqIndex].matchChildren(matches[matchIndex]);
                    if (recursiveMatches.length > 0) {
                        const matchesLength = matches.length;
                        matches.splice(matchIndex, 1);
                        matches.push(...recursiveMatches);
                        for (let j = 0; j < recursiveMatches.length; j++) {
                            queue.push({
                                matchIndex: matchesLength-1 + j,
                                seqIndex: seqIndex + 1
                            })
                        }
                    }
                }
            }

            if (i > 1) {
                matches.push(input.slice(0))
                lastMatchIndex = matches.length - 1;
            }

        }

        return matches;

    }
}