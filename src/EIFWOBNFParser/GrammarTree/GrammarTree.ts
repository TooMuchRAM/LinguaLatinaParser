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
        return allParsed
            .filter(match => match.remaining.length === 0)
            .map(match => this.putInOrder(input, match.stacktrace))
            .map(stacktrace => {
                stacktrace.removeDuplicateParents();
                return stacktrace;
            });
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
        enum AnywhereQueue {
            Requirements = "requirements",
            Optionals = "optionals",
            Repeatables = "repeatables"
        }
        const finalMatches = new Array<GTMatchResult>();
        const queue = new Array<{
            queue: AnywhereQueue,
            match: GTMatchResult
        }>();
        for (const match of matches) {
            queue.push({queue: AnywhereQueue.Requirements, match});
        }

        while (queue.length > 0) {
            const entry = queue.shift()!;
            if (entry.match.remaining.length === 0) {
                finalMatches.push(entry.match);
                continue;
            }
            if (entry.match.anywhere[entry.queue].length === 0) {
                switch (entry.queue) {
                    case "requirements":
                        queue.push({queue: AnywhereQueue.Optionals, match: entry.match});
                        continue;
                    case "optionals":
                        queue.push({queue: AnywhereQueue.Repeatables, match: entry.match});
                        continue;
                    case "repeatables":
                        continue;
                }
                continue;
            }
            const {node: anywhereNode, parents} = entry.match.anywhere[entry.queue].shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(entry.match.remaining);
            if (anywhereMatches.length === 0 && entry.queue !== "requirements") {
                queue.push({queue: entry.queue, match: entry.match});
            } else {
                queue.push(...anywhereMatches.map(
                        anywhereMatch => {
                            anywhereMatch.addParents(parents, true);
                            if (entry.queue === "repeatables") {
                                anywhereMatch.anywhere.repeatables.push({node: anywhereNode, parents});
                            }
                            anywhereMatch.transfer(entry.match);
                            return {queue: AnywhereQueue.Requirements, match: anywhereMatch}
                        }
                    )
                );
            }
        }
        return finalMatches;
    }
}



