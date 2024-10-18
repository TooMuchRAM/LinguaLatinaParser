import GTNode from "./GTNode";

export interface GTSTParent {
    identifier: string;
    name: string;
}

export interface GTSTEntry<T extends GTNode> {
    node: T;
    parents: GTSTParent[];
}

export default class GTStackTrace {

    public stack: GTSTEntry<GTNode>[] = [];

    public push(node: GTNode): void {
        this.stack.push({
            node,
            parents: []
        });
    }

    public addParent(parent: GTSTParent) {
        for(const entry of this.stack) {
            if (entry.parents.length === 0 || entry.parents[entry.parents.length - 1].identifier !== parent.identifier) {
                entry.parents.push(parent);
            }
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

    public removeDuplicateParents() {
        // for(let i = 0; i < this.stack.length; i++) {
        //     const entry = this.stack[i];
        //     entry.parents = entry.parents.filter((parent, index) => {
        //         if (index > 0) {
        //             return entry.parents[index - 1].identifier !== parent.identifier;
        //         } else {
        //             return true;
        //         }
        //     });
        // }
    }

    public toString(): string {
        return this.stack.map(entry => entry.node.toString()).join(" -> ");
    }
}