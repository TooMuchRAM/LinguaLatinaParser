import GTClauseNode from "./GTClauseNode";

export default class GTAnywhereNode extends GTClauseNode {
    constructor() {
        super("....");
    }

    override toString(): string {
        return `..${this.children?.toString()}..`;
    }
}