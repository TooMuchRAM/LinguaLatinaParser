import GTNode from "./GTNode";
import GTAnywhereNode from "./GTAnywhereNode";
import GTTextLeaf from "./GTTextLeaf";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";

export default class GrammarTree {
    public root: GTNode;
    public nodeIndex: { [name: string]: GTNode } = {};
    public anywhereNodes: GTAnywhereNode[] = [];
    public leaves: { [value: string]: GTTextLeaf[] } = {};

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
        for (const match of matches) {
            if (match.remaining.length === 0) {
                console.log(match);
            }
        }
        // We now have to waddle through the remaining nodes and try to find a match
        // from the anywhere nodes
        return this.parseAnywhereNodes(matches);
    }

    /**
     * This function takes a list of matches from the parse function above, and tries to match
     * the remaining nodes with the anywhere nodes.
     * @param matches {GTMatchResult[]} The matches from the parse function
     * @private
     */
    private parseAnywhereNodes(matches: GTMatchResult[]) {
        const requirementQueue = matches;
        const optionalQueue = new Array<GTMatchResult>();
        const repeatableQueue = new Array<GTMatchResult>();

        const finalMatches = new Array<GTMatchResult>();

        while (requirementQueue.length > 0) {
            const match = requirementQueue.shift()!;
            const remaining = match.remaining;
            if (match.remaining.length === 0) {
                finalMatches.push(match);
                continue;
            }
            if (match.anywhere.requirements.length === 0) {
                optionalQueue.push(match);
                continue;
            }
            const anywhereNode = match.anywhere.requirements.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(remaining);
            requirementQueue.push(...anywhereMatches.map(anywhereMatch => {
                    anywhereMatch.anywhere.requirements.push(...match.anywhere.requirements.splice(0));
                    anywhereMatch.anywhere.optionals.push(...match.anywhere.optionals.splice(0));
                    anywhereMatch.anywhere.repeatables.push(...match.anywhere.repeatables.splice(0));
                    return anywhereMatch
                }
            ));
        }

        while (optionalQueue.length > 0) {
            const match = optionalQueue.shift()!;
            const remaining = match.remaining;
            if (match.remaining.length === 0) {
                finalMatches.push(match);
                continue;
            }
            if (match.anywhere.optionals.length === 0) {
                repeatableQueue.push(match);
                continue;
            }
            const anywhereNode = match.anywhere.optionals.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(remaining);
            if (anywhereMatches.length === 0) {
                optionalQueue.push(match);
            } else {
                optionalQueue.push(...anywhereMatches.map(anywhereMatch => {
                        anywhereMatch.anywhere.optionals.push(...match.anywhere.optionals.splice(0))
                        anywhereMatch.anywhere.optionals.push(...anywhereMatch.anywhere.requirements.splice(0));
                        anywhereMatch.anywhere.repeatables.push(...match.anywhere.repeatables.splice(0));
                        return anywhereMatch
                    }
                ));
            }
        }

        while (repeatableQueue.length > 0) {
            const match = repeatableQueue.shift()!;
            const remaining = match.remaining;
            if (match.remaining.length === 0) {
                finalMatches.push(match);
                continue;
            }
            if (match.anywhere.repeatables.length === 0) {
                continue;
            }
            const anywhereNode = match.anywhere.repeatables.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(remaining);
            if (anywhereMatches.length === 0) {
                repeatableQueue.push(match);
            } else {
                repeatableQueue.push(...anywhereMatches.map(anywhereMatch => {
                        anywhereMatch.anywhere.repeatables.push(anywhereNode);
                        anywhereMatch.anywhere.repeatables.push(...match.anywhere.repeatables.splice(0));
                        anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.requirements.splice(0));
                        anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.optionals.splice(0));
                        return anywhereMatch
                    }
                ));
            }
        }

        return finalMatches;
    }
}



