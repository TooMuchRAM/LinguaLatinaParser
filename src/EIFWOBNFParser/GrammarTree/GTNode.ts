import GTNodeChildren from "./GTNodeChildren";
import OR from "./OR";
import SEQ from "./SEQ";
import GTMatchResult from "./GTMatchResult";

export default class GTNode {
    public constructor(public readonly name: string) {

    }

    /**
     * List of all possible parents
     */
    public parents: Set<GTNode> = new Set();
    public children?: GTNodeChildren = new OR();

    public identifier: string = crypto.randomUUID();

    /**
     * Get the string values for all children
     */
    public get childrenAffixStrings(): string[] {
        return this.children?.map((childSeq) => (childSeq.toString())) || [];
    }

    public toString(): string {
        return `${this.name}${(this.children?.length || 0) > 0 ? `(${(this.children)?.join(" | ") || ""})` : ""}`;
    }

    public matchChildren(input: SEQ<GTNode>): GTMatchResult[] {
        if (this.children === undefined || this.children.length === 0) {
            return [];
        }

        const matches = new Array<GTMatchResult>();
        const queue = new Array<{
            seq: SEQ<GTNode>,
            seqIndex: number,
            match: GTMatchResult
        }>();
        for (const seq of this.children) {
            queue.push(
                {
                    seq,
                    seqIndex: 0,
                    match: new GTMatchResult({
                        remaining: input.slice(0)
                    })
                }
            );
        }

        while (queue.length > 0) {
            const {seq, seqIndex, match} = queue.shift()!;
            const node = seq[seqIndex];

            if (seqIndex >= seq.length) {
                matches.push(match);
                continue;
            }

            if (match.remaining.length === 0) {
                // ignore
                continue;
            }

            if (node.name === match.remaining[0].name) {
                match.stacktrace.push(match.remaining.shift()!, this);
                queue.push({
                    seq,
                    seqIndex: seqIndex + 1,
                    match: match
                });
            } else {
                const recursiveMatches = node.matchChildren(match.remaining);
                for (const recursiveMatch of recursiveMatches) {
                    recursiveMatch.transfer(match);
                    queue.push({
                        seq,
                        seqIndex: seqIndex + 1,
                        match: recursiveMatch
                    });
                }
            }

        }

        return matches.map(match => {
            match.stacktrace.addParent(this);
            return match;
        });

    }
}