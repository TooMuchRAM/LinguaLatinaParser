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
        const requirementQueue = matches.slice(0);
        const optionalQueue = new Array<GTMatchResult>();
        const repeatableQueue = new Array<GTMatchResult>();
        const finalMatches = new Array<GTMatchResult>();

        this.runQueue({
            queue: requirementQueue,
            nextQueue: optionalQueue,
            finalMatches,
            anywhereQueueName: "requirements"
        }, (entry) => {
            const {node: anywhereNode, parents} = entry.anywhere.requirements.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(entry.remaining);
            requirementQueue.push(...anywhereMatches.map(anywhereMatch => {
                        anywhereMatch.addParents(parents, true);
                        anywhereMatch.transfer(entry);
                        return anywhereMatch
                    }
                )
            );
        });

        this.runQueue({
            queue: optionalQueue,
            nextQueue: repeatableQueue,
            finalMatches,
            anywhereQueueName: "optionals"
        }, (entry) => {
            const {node: anywhereNode, parents} = entry.anywhere.optionals.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(entry.remaining);
            if (anywhereMatches.length === 0) {
                optionalQueue.push(entry);
            } else {
                optionalQueue.push(...anywhereMatches.map(anywhereMatch => {
                            anywhereMatch.addParents(parents, true);
                            anywhereMatch.anywhere.optionals.push(...entry.anywhere.optionals)
                            anywhereMatch.anywhere.optionals.push(...anywhereMatch.anywhere.requirements);
                            anywhereMatch.anywhere.repeatables.push(...entry.anywhere.repeatables);
                            anywhereMatch.transferStacktrace(entry);
                            return anywhereMatch
                        }
                    )
                );
            }
        });

        this.runQueue({
            queue: repeatableQueue,
            nextQueue: null,
            finalMatches,
            anywhereQueueName: "repeatables"
        }, (entry) => {
            const {node: anywhereNode, parents} = entry.anywhere.repeatables.shift()!;
            const anywhereMatches = anywhereNode.matchChildrenAnywhere(entry.remaining);
            if (anywhereMatches.length === 0) {
                repeatableQueue.push(entry);
            } else {
                repeatableQueue.push(...anywhereMatches.map(anywhereMatch => {
                            anywhereMatch.addParents(parents, true);
                            anywhereMatch.anywhere.repeatables.push({node: anywhereNode, parents});
                            anywhereMatch.anywhere.repeatables.push(...entry.anywhere.repeatables);
                            anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.requirements);
                            anywhereMatch.anywhere.repeatables.push(...anywhereMatch.anywhere.optionals);
                            anywhereMatch.transferStacktrace(entry);
                            return anywhereMatch
                        }
                    )
                );
            }
        });
        return finalMatches;
    }

    private runQueue(
        {queue, nextQueue, finalMatches, anywhereQueueName}: {
            queue: GTMatchResult[],
            nextQueue: GTMatchResult[] | null,
            finalMatches: GTMatchResult[],
            anywhereQueueName: "requirements" | "optionals" | "repeatables"
        },
        processMatches: (queueEntry: GTMatchResult) => void
    ) {
        while (queue.length > 0) {
            const entry = queue.shift()!;
            if (entry.remaining.length === 0) {
                finalMatches.push(entry);
                continue;
            }
            if (entry.anywhere[anywhereQueueName].length === 0) {
                nextQueue?.push(entry);
                continue;
            }
            processMatches(entry);
        }
    }
}



