import GTConstructNode from "./GTConstructNode";
import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";

export default class GTOptionalNode extends GTConstructNode {
    constructor() {
        super("[]");
    }

    override toString(): string {
        return `[${this.children?.toString()}]`;
    }

    override matchChildren(input: SEQ<GTNode>): GTMatchResult[] {
        // Create two branches, one with the optional node and one without
        const matches = super.matchChildren(input);
        matches.forEach((match) => {
           if (match.anywhere.requirements.length > 0) {
               match.anywhere.optionals = match.anywhere.requirements;
               match.anywhere.requirements = [];
           }
        });
        return [
            ...matches,
            new GTMatchResult({
                remaining: input.slice(0)
            })
        ];
    }
}