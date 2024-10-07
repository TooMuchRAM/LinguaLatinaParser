import GTConstructNode from "./GTConstructNode";

export default class GTOptionalNode extends GTConstructNode {
    constructor() {
        super("[]");
    }

    override toString(): string {
        return `[${this.children?.toString()}]`;
    }
}