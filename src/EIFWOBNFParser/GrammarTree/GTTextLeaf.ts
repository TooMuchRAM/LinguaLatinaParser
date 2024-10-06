import GTNode from "./GTNode";

export default class GTTextLeaf extends GTNode {

    children?: never;
    override toString(): string {
        return `"${this.name}"`;
    }
}