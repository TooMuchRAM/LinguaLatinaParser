import GTClauseNode from "./GTClauseNode";

export default class GTOptionalNode extends GTClauseNode {
    constructor() {
        super("[]");
    }

    override toString(): string {
        return `[${this.children?.toString()}]`;
    }
}