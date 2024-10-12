import GTNodeChildren from "./GTNodeChildren";
import OR from "./OR";

export default class GTNode {
    public constructor(public readonly name: string) {

    }

    /**
     * List of all possible parents
     */
    public parents: Set<GTNode> = new Set();
    public children?: GTNodeChildren = new OR();

    /**
     * Get the string values for all children
     */
    public get childrenAffixStrings(): string[] {
        return this.children?.map((childSeq) => (childSeq.toString())) || [];
    }

    public toString(): string {
        return `${this.name}${(this.children?.length || 0) > 0 ? `(${(this.children)?.join(" | ") || ""})` : ""}`;
    }
}