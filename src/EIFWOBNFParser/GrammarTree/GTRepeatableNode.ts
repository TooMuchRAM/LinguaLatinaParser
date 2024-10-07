import GTConstructNode from "./GTConstructNode";

export default class GTRepeatableNode extends GTConstructNode {
    constructor() {
        super("{}");
    }

    override toString(): string {
        return `{${this.children?.toString()}}`;
    }
}