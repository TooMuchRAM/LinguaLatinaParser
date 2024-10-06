import GTNode from "./GTNode";
import GTAnywhereNode from "./GTAnywhereNode";

export default class GrammarTree {
    public root: GTNode;
    public nodeIndex: { [name: string]: GTNode } = {};
    public anywhereNodes: GTAnywhereNode[] = [];

    public constructor(root: GTNode) {
        this.root = root;
    }

    public toString(): string {
        return this.root.toString();
    }
}



