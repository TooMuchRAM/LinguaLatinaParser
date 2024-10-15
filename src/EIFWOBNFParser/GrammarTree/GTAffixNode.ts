import GTNode from "./GTNode";

export default class GTAffixNode extends GTNode {
    public params: GTNode[];
    constructor(name: string, params: GTNode[]) {
        super(name);
        this.params = params;
    }

    public paramMayBe(name: string, value: string) {
        for (let i = 0; i < this.params.length; i++) {
            if (this.params[i].name === name && !this.params[i].childrenAffixStrings.includes(value)) {
                return false;
            }
        }
        return true;
    }

    override toString(): string {
        return `${this.name}(${this.params.map(p => p.toString()).join(", ")})`;
    }
}