import GTConstructNode from "./GTConstructNode";
import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";

export default class GTRepeatableNode extends GTConstructNode {
    constructor() {
        super("{}");
    }

    override toString(): string {
        return `{${this.children?.toString()}}`;
    }

    override matchChildren(input: SEQ<GTNode>): GTMatchResult[] {
        const nothingMatched = new GTMatchResult({
            remaining: input.slice(0)
        })
        const matches = [nothingMatched];
        const queue = [nothingMatched];
        while (queue.length > 0) {
            const lastMatch = queue.shift()!;
            if (lastMatch.remaining.length > 0) {
                const newMatch = super.matchChildren(lastMatch.remaining);
                newMatch.forEach((match) => {if (match.anywhere.requirements.length > 0) {
                    match.anywhere.repeatables = match.anywhere.requirements;
                    match.anywhere.requirements = [];
                } else {
                    queue.push(match);
                }
                    matches.push(match);
                });
            }
        }

        return matches;
    }
}