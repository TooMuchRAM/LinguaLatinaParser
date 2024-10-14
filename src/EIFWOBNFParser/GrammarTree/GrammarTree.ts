import GTNode from "./GTNode";
import GTAnywhereNode from "./GTAnywhereNode";
import GTTextLeaf from "./GTTextLeaf";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";
import GTStackTrace from "./GTStackTrace";

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

    public parse(input: SEQ<GTNode>): GTStackTrace[] {
        const root = this.root;
        const matches = root.matchChildren(input);
        // We now have to waddle through the remaining nodes and try to find a match
        // from the anywhere nodes
        const allParsed = this.parseAnywhereNodes(matches);
        return allParsed.map(match => this.putInOrder(input, match.stacktrace));
    }

    /**
     * This function takes a stacktrace and tries to put the nodes in the stack trace
     * in the same order as in the input.
     * @param input
     * @param stacktrace
     * @private
     */
    private putInOrder(input: SEQ<GTNode>, stacktrace: GTStackTrace) {
        const ordered = new GTStackTrace();
        for (const node of input) {
            for (const stacktraceNode of stacktrace.stack) {
                if (stacktraceNode.node.identifier === node.identifier) {
                    ordered.stack.push(stacktraceNode);
                    break;
                }
            }
        }
        return ordered;
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
                    anywhereMatch.transfer(match);
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
                        anywhereMatch.anywhere.optionals.push(...match.anywhere.optionals)
                        anywhereMatch.anywhere.optionals.push(...anywhereMatch.anywhere.requirements);
                        anywhereMatch.anywhere.repeatables.push(...match.anywhere.repeatables);
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
                        anywhereMatch.anywhere.repeatables.push(...match.anywhere.repeatables);
                        anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.requirements);
                        anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.optionals);
                        return anywhereMatch
                    }
                ));
            }
        }

        return finalMatches;
    }
}



