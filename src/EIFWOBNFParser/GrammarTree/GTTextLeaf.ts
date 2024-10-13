import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";

export default class GTTextLeaf extends GTNode {

    children?: never;
    override toString(): string {
        return `"${this.name}"`;
    }

    override matchChildren(input: SEQ<GTNode>): GTMatchResult[] {
        if (input[0].name === this.name) {
            return [
              new GTMatchResult({
                    remaining: input.slice(1)
              })
            ];
        } else {
            return [];
        }
    }
}