import GTConstructNode from "./GTConstructNode";
import GTMatchResult from "./GTMatchResult";
import GTNode from "./GTNode";

export default class GTAnywhereNode extends GTConstructNode {
    constructor() {
        super("....");
    }

    override toString(): string {
        return `..${this.children?.toString()}..`;
    }

    override matchChildren(input: GTNode[]): GTMatchResult[] {
        //return super.matchChildren(input);
        // First, we try to match it as if it was a normal node
        const normalMatches = super.matchChildren(input);
        if (normalMatches.length > 0) {
            return normalMatches;
        }
        // If this does not work out, we just return a match that requires this node
        const matchResult = new GTMatchResult({
            remaining: input.slice(0)
        });
        matchResult.anywhere.requirements.push(this);
        return [
            matchResult
        ];
    }
}