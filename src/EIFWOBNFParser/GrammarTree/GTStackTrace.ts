import GTNode from "./GTNode";

export default class GTStackTrace {

    public stack: {
        node: GTNode,
        parents: GTNode[]
    }[] = [];

    public push(node: GTNode, parent: GTNode): void {
        this.stack.push({
            node,
            parents: [parent]
        });
    }

    public addParent(node: GTNode) {
        for(const entry of this.stack) {
            entry.parents.push(node);
        }
    }

    public addBefore(stacktrace: GTStackTrace) {
        for(const entry of stacktrace.stack) {
            this.stack.unshift(entry);
        }
    }

    public addAfter(stacktrace: GTStackTrace) {
        for(const entry of stacktrace.stack) {
            this.stack.push(entry);
        }
    }

    public pop(): void {
        this.stack.pop();
    }

    public toString(): string {
        return this.stack.map((entry) => {
            return `${entry.node.name}(${entry.parents.map((parent) => parent.name).join(", ")})`;
        }).join(" -> ");
    }
}