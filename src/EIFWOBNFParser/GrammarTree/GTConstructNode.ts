import GTNode from "./GTNode";
import GTAffixNode from "./GTAffixNode";
import GTFilledAffixNode from "./GTFilledAffixNode";

export default class GTConstructNode extends GTNode {
    public get containsAffixNodes(): boolean {
        return this.children?.some((child) => {
            return child.some((node) => {
                if (node instanceof GTConstructNode) {
                    return node.containsAffixNodes;
                } else return node instanceof GTAffixNode || node instanceof GTFilledAffixNode;
            });
        }) || false;
    }
}