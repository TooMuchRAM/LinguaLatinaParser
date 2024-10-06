import grammar from "./eifwobnf/eifwobnf.ohm-bundle";
import GTNodeChildren from "./GrammarTree/GTNodeChildren";
import GrammarTree from "./GrammarTree/GrammarTree";
import ConstructGrammarTreeActions from "./ConstructGrammarTreeActions";

export default class EIFWOBNFParser {
    constructor() {
        this.defineSemantics();
    }

    private semantics = grammar.createSemantics();
    private actions = new ConstructGrammarTreeActions();

    private defineSemantics() {
        const actions = this.actions;
        this.semantics.addOperation<GTNodeChildren>("constructGrammarTree", {
            Rules_head(arg0, arg1) {
                return actions.Rules_head(actions, arg0, arg1)
            },
            Rules_tail(arg0) {
                return actions.Rules_tail(actions, arg0);
            },
            Rule(arg0) {
                return actions.Rule(actions, arg0)
            },
            Initialisation(arg0, arg1) {
                return actions.Initialisation(actions, arg0, arg1)
            },
            Declaration(arg0, arg1, arg2, arg3) {
                return actions.Declaration(actions, arg0, arg1, arg2, arg3)
            },
            Grouping(arg0, arg1, arg2) {
                return actions.Grouping(actions, arg0, arg1, arg2)
            },
            Conjunction_head(arg0, arg1, arg2) {
                return actions.Conjunction_head(actions, arg0, arg1, arg2)
            },
            Conjunction_tail(arg0) {
                return actions.Conjunction_tail(actions, arg0)
            },
            Composition_head(arg0, arg1, arg2) {
                return actions.Composition_head(actions, arg0, arg1, arg2)
            },
            Composition_tail(arg0) {
                return actions.Composition_tail(actions, arg0)
            },
            Clause(arg0) {
                return actions.Clause(actions, arg0)
            },
            ClauseRepeat(arg0, arg1, arg2) {
                return actions.ClauseRepeat(actions, arg0, arg1, arg2)
            },
            ClauseOptional(arg0, arg1, arg2) {
                return actions.ClauseOptional(actions, arg0, arg1, arg2)
            },
            ClauseAnywhere(arg0, arg1, arg2) {
                return actions.ClauseAnywhere(actions, arg0, arg1, arg2)
            },
            anythingSelector(arg0) {
                return actions.anythingSelector(actions, arg0)
            },
            AnyNonTerminal(arg0) {
                return actions.AnyNonTerminal(actions, arg0)
            },
            NonTerminal(arg0, arg1, arg2) {
                return actions.NonTerminal(actions, arg0, arg1, arg2)
            },
            InfixNonTerminal(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
                return actions.InfixNonTerminal(actions, arg0, arg1, arg2, arg3, arg4, arg5, arg6)
            },
            Terminal(arg0, arg1, arg2) {
                return actions.Terminal(actions, arg0, arg1, arg2)
            }
        });
    }

    public parse(input: string): GrammarTree {
        const match = grammar.match(input);
        if (match.failed()) {
            throw new Error(`Failed to parse input: ${input}`);
        }

        this.actions.reset();
        const rootChildren = this.semantics(match).constructGrammarTree();
        if (rootChildren.length !== 1 || rootChildren[0].length !== 1) {
            throw new Error("Failed to parse input: Expected root to have exactly one child");
        }
        const grammarTree = new GrammarTree(rootChildren[0][0]);
        grammarTree.nodeIndex = this.actions.nodeIndex;
        grammarTree.anywhereNodes = this.actions.anywhereNodes;
        grammarTree.leaves = this.actions.leaves;
        return grammarTree;
    }
}