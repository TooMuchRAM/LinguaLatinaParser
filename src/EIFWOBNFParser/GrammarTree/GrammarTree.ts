import GTNode from "./GTNode";
import GTAnywhereNode from "./GTAnywhereNode";
import GTTextLeaf from "./GTTextLeaf";
import SEQ from "./SEQ";

export default class GrammarTree {
    public root: GTNode;
    public nodeIndex: { [name: string]: GTNode } = {};
    public anywhereNodes: GTAnywhereNode[] = [];
    public leaves: {[value: string]: GTTextLeaf[]} = {};

    public constructor(root: GTNode) {
        this.root = root;
    }

    public toString(): string {
        return this.root.toString();
    }

    public parse(input: SEQ<GTNode>) {
        const nodes = input.map(node => this.nodeIndex[node.name]);
        const root = this.root;
        const matches = root.matchChildren(nodes);
        console.log(matches);
    }
}



