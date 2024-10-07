import GrammarTree from "./EIFWOBNFParser/GrammarTree/GrammarTree";
import EIFWOBNFParser from "./EIFWOBNFParser/eifwobnfParser";
import latinGrammar from "./grammar";

export default class LinguaLatinaParser {
    private eifwobnfParser: EIFWOBNFParser = new EIFWOBNFParser();
    private grammarTree: GrammarTree;

    constructor() {
        this.grammarTree = this.eifwobnfParser.parse(latinGrammar);
        console.log(this.grammarTree.toString());
    }

    parse(input: string): void {

    }
}