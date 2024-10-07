import GTConstructNode from "./GTConstructNode";

export default class GTAnywhereNode extends GTConstructNode {
    constructor() {
        super("....");
    }

    override toString(): string {
        return `..${this.children?.toString()}..`;
    }
}