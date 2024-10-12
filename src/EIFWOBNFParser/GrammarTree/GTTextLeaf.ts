import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTNodeChildren from "./GTNodeChildren";
import OR from "./OR";

export default class GTTextLeaf extends GTNode {

    children?: never;
    override toString(): string {
        return `"${this.name}"`;
    }

    override matchChildren(_: SEQ<GTNode>): GTNodeChildren {
        return new OR();
    }
}