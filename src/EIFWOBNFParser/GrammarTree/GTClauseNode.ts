import GTNode from "./GTNode";
import GTInfixNode from "./GTInfixNode";
import GTFilledInfixNode from "./GTFilledInfixNode";

export default class GTClauseNode extends GTNode {
    public get containsInfixNodes(): boolean {
        return this.children?.some((child) => {
            return child.some((node) => {
                if (node instanceof GTClauseNode) {
                    return node.containsInfixNodes;
                } else return node instanceof GTInfixNode || node instanceof GTFilledInfixNode;
            });
        }) || false;
    }
}