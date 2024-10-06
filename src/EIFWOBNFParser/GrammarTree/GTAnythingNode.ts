import GTNode from "./GTNode";

export default class GTAnythingNode extends GTNode {
    constructor() {
        super("...");
    }

    override toString(): string {
        return `...`;
    }
}