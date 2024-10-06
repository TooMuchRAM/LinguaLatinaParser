import GTClauseNode from "./GTClauseNode";

export default class GTRepeatableNode extends GTClauseNode {
    constructor() {
        super("{}");
    }

    override toString(): string {
        return `{${this.children?.toString()}}`;
    }
}