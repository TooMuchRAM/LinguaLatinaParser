import GTNodeChildren from "./GrammarTree/GTNodeChildren";
import GTNode from "./GrammarTree/GTNode";
import GTAffixNode from "./GrammarTree/GTAffixNode";
import OR from "./GrammarTree/OR";
import SEQ from "./GrammarTree/SEQ";
import GTFilledAffixNode from "./GrammarTree/GTFilledAffixNode";
import GTTextLeaf from "./GrammarTree/GTTextLeaf";
import {allPossibleCombinations} from "./utils";
import GTRepeatableNode from "./GrammarTree/GTRepeatableNode";
import GTOptionalNode from "./GrammarTree/GTOptionalNode";
import GTAnywhereNode from "./GrammarTree/GTAnywhereNode";
import GTAnythingNode from "./GrammarTree/GTAnythingNode";
import {NonterminalNode, TerminalNode} from "ohm-js";
import GTConstructNode from "./GrammarTree/GTConstructNode";

export default class ConstructGrammarTreeActions {
    public nodeIndex: { [id: string]: GTNode } = {};
    /**
     * Variable holding the affixes during parsing.
     * the name is the name of the AffixNonTerminal,
     * the list GTNode are the NonTerminals that describe
     * the possible values of the affixes
     * @private
     */
    private _affixes: { [name: string]: GTAffixNode } = {};

    public anywhereNodes: GTAnywhereNode[] = [];
    public leaves: {[value: string]: GTTextLeaf[]} = {};

    public constructor() {
        this.reset();
    }

    public reset() {
        this.nodeIndex = {};
        this._affixes = {};
        this.anywhereNodes = [];
        this.leaves = {};
    }

    private _newOrSeq(node: GTNode): GTNodeChildren {
        return new OR(new SEQ(node));
    }

    private _setParentOnChildren(children: GTNodeChildren, parent: GTNode) {
        children.forEach((seq) => {
            seq.forEach((node) => {
                node.parents.add(parent);
            });
        });
    }

    private _mapAffixNodes(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren, callback: (node: GTAffixNode | GTFilledAffixNode) => GTNode): GTNodeChildren {
        return nodeList.map((seq): SEQ<GTNode> => {
            return seq.map((node): GTNode => {
                if (node instanceof GTAffixNode || node instanceof GTFilledAffixNode) {
                    return callback(node);
                } else if (node instanceof GTConstructNode && node.containsAffixNodes) {
                    const newNode: GTConstructNode = new (Object.getPrototypeOf(node).constructor);
                    newNode.children = self._mapAffixNodes(self, node.children!, callback);
                    self._setParentOnChildren(newNode.children, newNode);
                    return newNode;
                } else {
                    return node;
                }
            });
        });
    }

    Rules_head(self: ConstructGrammarTreeActions, rules: NonterminalNode, rule: NonterminalNode): GTNodeChildren {
        rules.constructGrammarTree();
        return rule.constructGrammarTree();
    }

    Rules_tail(self: ConstructGrammarTreeActions, rule: NonterminalNode): GTNodeChildren {
        return rule.constructGrammarTree();
    }

    Rule(self: ConstructGrammarTreeActions, declaration: NonterminalNode): GTNodeChildren {
        return declaration.constructGrammarTree();
    }

    Declaration(self: ConstructGrammarTreeActions, anyNonTerminal: NonterminalNode, _: TerminalNode): GTNodeChildren {
        anyNonTerminal.constructGrammarTree();
        return new OR();
    }

    /**
     * Get all parameters from all affix nodes contained in the list of nodes
     * @param self {ConstructGrammarTreeActions} - The instance of the ConstructGrammarTreeActions
     * @param nodeList {GTNodeChildren} - The list of nodes to get the parameters from
     * @returns {Set<GTNode>} - The set of parameters
     * @private
     */
    private _getAllParameters(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren): GTNode[] {
        const params: Set<GTNode> = new Set();
        self._mapAffixNodes(self, nodeList, (node) => {
            if (node instanceof GTAffixNode) {
                node.params.forEach((param) => {
                    params.add(param);
                });
            } else {
                node.affixNode.params.filter(
                    (param) => !node.filledValues[param.name]
                ).forEach((param) => {
                    params.add(param);
                });
            }
            return node;
        });
        return Array.from(params).filter((param) => !(param instanceof GTTextLeaf));
    }

    private _generateAllParameterCombinations(parameters: GTNode[]): { [param: string]: string }[] {
        const configurations: { [param: string]: string }[] = [];
        const possibleIndexCombinations = allPossibleCombinations(...parameters.map((param) => {
            return param.childrenAffixStrings.length;
        }));
        for (const indexCombination of possibleIndexCombinations) {
            const configuration: { [param: string]: string } = {};
            for (let i = 0; i < indexCombination.length; i++) {
                configuration[parameters[i].name] = parameters[i].childrenAffixStrings[indexCombination[i]];
            }
            configurations.push(configuration);
        }
        return configurations;
    }

    private _generateNodesForConfiguration(self: ConstructGrammarTreeActions, configuration: {[param: string]: string}, nodeList: GTNodeChildren): {
        configuration: {[param: string]: string},
        nodes: GTNodeChildren
    } {
        return {
            configuration,
            nodes: self._mapAffixNodes(self, nodeList, (node) => {
                let filledNode: GTFilledAffixNode;
                const changedValues = [];
                if (node instanceof GTAffixNode) {
                    filledNode = new GTFilledAffixNode(node);
                    filledNode.filledValues = configuration;
                } else {
                    filledNode = node;
                    for (const [key, value] of Object.entries(configuration)) {
                        if (!filledNode.filledValues[key]) {
                            filledNode.filledValues[key] = value;
                            changedValues.push(key);
                        }
                    }
                }
                const generatedName = filledNode.generateName();
                changedValues.forEach((key) => {
                    delete filledNode.filledValues[key];
                });
                return self.nodeIndex[generatedName];
            })
        };
    }

    private _expandAffixNodes(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren): {
        configuration: {[param: string]: string},
        nodes: GTNodeChildren
    }[] {
        // Get all parameters to expand
        const paramsToExpand = self._getAllParameters(self, nodeList);

        if (paramsToExpand.length === 0) {
            return [];
        }

        // Generate all possible combinations of the parameters
        const configurations = self._generateAllParameterCombinations(paramsToExpand);

        // Generate the new nodes
        return configurations.map(
            (configuration) => self._generateNodesForConfiguration(self, configuration, nodeList)
        );
    }

    private _declareNormalNode(self: ConstructGrammarTreeActions, left: GTNode, right: GTNodeChildren): GTNodeChildren {
        const expandedAffixNodes = self._expandAffixNodes(self, right);
        if (expandedAffixNodes.length === 0) {
            left.children?.push(...right);
            self._setParentOnChildren(right, left);
            return self._newOrSeq(left);
        } else {
            left.children = expandedAffixNodes
                .map((node) => node.nodes)
                .reduce((acc, val) => acc.concat(val), []);
            self._setParentOnChildren(left.children, left);
            return self._newOrSeq(left);
        }
    }

    private _declareContainingNoAffixNodes(self: ConstructGrammarTreeActions, left: GTAffixNode|GTFilledAffixNode, right: GTNodeChildren): GTNodeChildren {
        const filledAffix = left instanceof GTAffixNode ? new GTFilledAffixNode(left) : left;
        const possibleNames = filledAffix.generatePossibleNodeNames();
        return possibleNames.map((name): SEQ<GTNode> => {
            const node = self.nodeIndex[name];
            node.children?.push(...right);
            self._setParentOnChildren(right, node);
            return [node];
        });
    }

    private _declareContainingAffixNodes(self: ConstructGrammarTreeActions, left: GTAffixNode|GTFilledAffixNode, configurations: {
        configuration: {[param: string]: string},
        nodes: GTNodeChildren
    }[]): GTNodeChildren {
        const allNodes = new Set<GTNode>();
        configurations.forEach((config) => {
            const filledAffixNode = left instanceof GTAffixNode ? new GTFilledAffixNode(left as GTAffixNode, config.configuration) : left as GTFilledAffixNode;
            for (const [key, value] of Object.entries(config.configuration)) {
                if (!filledAffixNode.filledValues[key]) {
                    filledAffixNode.filledValues[key] = value;
                }
            }
            const normalNode = self.nodeIndex[filledAffixNode.generateName()];
            normalNode.children?.push(...config.nodes);
            self._setParentOnChildren(config.nodes, normalNode);
            allNodes.add(normalNode);
        });
        return Array.from(allNodes).map((node) => new SEQ(node));
    }

    Initialisation(
        self: ConstructGrammarTreeActions,
        anyNonTerminal: NonterminalNode,
        _: TerminalNode,
        conjunction: NonterminalNode,
        _1: TerminalNode
    ): GTNodeChildren {
        const leftSide = (anyNonTerminal.constructGrammarTree() as GTNodeChildren)[0][0];
        const rightSide: GTNodeChildren = conjunction.constructGrammarTree();

        if (leftSide instanceof GTAffixNode || leftSide instanceof GTFilledAffixNode) {
            const expandedAffixNodes = self._expandAffixNodes(self, rightSide);
            if (expandedAffixNodes.length === 0) {
                return self._declareContainingNoAffixNodes(self, leftSide, rightSide);
            } else {
                return self._declareContainingAffixNodes(self, leftSide, expandedAffixNodes);
            }
        } else {
            // We are dealing with a regular non-terminal
            return self._declareNormalNode(self, leftSide, rightSide);
        }
    }

    Conjunction_tail(self: ConstructGrammarTreeActions, groupOrComposition: NonterminalNode): GTNodeChildren {
        return groupOrComposition.constructGrammarTree();
    }

    Conjunction_head(self: ConstructGrammarTreeActions, groupOrComposition: NonterminalNode, _1: TerminalNode, conjunction: NonterminalNode): GTNodeChildren {
        return [...groupOrComposition.constructGrammarTree(), ...conjunction.constructGrammarTree()];
    }

    Composition_tail(self: ConstructGrammarTreeActions, ConstructOrGrouping: NonterminalNode) {
        return ConstructOrGrouping.constructGrammarTree();
    }

    Composition_head(self: ConstructGrammarTreeActions, ConstructOrGrouping: NonterminalNode, _: TerminalNode, composition: NonterminalNode): GTNodeChildren {
        const nodes: GTNodeChildren = ConstructOrGrouping.constructGrammarTree();
        const result = nodes.map(seq => seq.splice(0));
        const compositionNodes: GTNodeChildren = composition.constructGrammarTree();
        for (let i = 1; i < compositionNodes.length; i++) {
            result.push(...nodes.map(seq => seq.splice(0)));
        }
        if (compositionNodes.length > nodes.length) {
            for (let i = 0; i < compositionNodes.length; i++) {
                for (let j = 0; j < nodes.length; j++) {
                    result[j].push(...compositionNodes[i]);
                }
            }
        } else {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = 0; j < compositionNodes.length; j++) {
                    result[i].push(...compositionNodes[j]);
                }
            }
        }
        return result;
    }

    Grouping(self: ConstructGrammarTreeActions, _1: TerminalNode, Construct: NonterminalNode, _2: TerminalNode): GTNodeChildren {
        return Construct.constructGrammarTree();
    }

    Construct(self: ConstructGrammarTreeActions, Construct: NonterminalNode): GTNodeChildren {
        return Construct.constructGrammarTree();
    }

    ConstructRepeat(self: ConstructGrammarTreeActions, _1: TerminalNode, Construct: NonterminalNode, _2: TerminalNode): GTNodeChildren {
        const nodes: GTNodeChildren = Construct.constructGrammarTree();
        const repeatableNode = new GTRepeatableNode();
        repeatableNode.children = nodes;
        self._setParentOnChildren(nodes, repeatableNode);
        return self._newOrSeq(repeatableNode);
    }

    ConstructOptional(self: ConstructGrammarTreeActions, _1: TerminalNode, Construct: NonterminalNode, _2: TerminalNode): GTNodeChildren {
        const nodes: GTNodeChildren = Construct.constructGrammarTree();
        const optionalNode = new GTOptionalNode();
        optionalNode.children = nodes;
        self._setParentOnChildren(nodes, optionalNode);
        return self._newOrSeq(optionalNode);
    }

    ConstructAnywhere(self: ConstructGrammarTreeActions, _1: TerminalNode, Construct: NonterminalNode, _2: TerminalNode) {
        const nodes: GTNodeChildren = Construct.constructGrammarTree();
        const anywhereNode = new GTAnywhereNode();
        anywhereNode.children = nodes;
        self._setParentOnChildren(nodes, anywhereNode);
        self.anywhereNodes.push(anywhereNode);
        return self._newOrSeq(anywhereNode);
    }

    AnyNonTerminal(self: ConstructGrammarTreeActions, nonTerminal: NonterminalNode): GTNodeChildren {
        return nonTerminal.constructGrammarTree();
    }

    NonTerminal(self: ConstructGrammarTreeActions, _: TerminalNode, name: NonterminalNode, _1: TerminalNode): GTNodeChildren {
        const nameStr = name.sourceString;
        if (self.nodeIndex[nameStr]) {
            return self._newOrSeq(self.nodeIndex[nameStr]);
        } else {
            return self._newOrSeq(self.nodeIndex[nameStr] = new GTNode(nameStr));
        }
    }

    /**
     * This function creates all possible permutations as normal nodes
     * from an affix node.
     * For example, the following language:
     * ```
     * <Number> ::= "singular" | "plural";
     * <Person> ::= "first" | "second" | "third";
     * <Noun(<Number>, <Person>)>;
     * ```
     * will generate the following GTNodes:
     * ```
     * Nounsingularfirst, Nounsingularsecond, Nounsingularthird,
     * Nounpluralfirst, Nounpluralsecond, Nounpluralthird
     * ```
     * @param self {ConstructGrammarTreeActions} - The instance of the ConstructGrammarTreeActions
     * @param affix {GTAffixNode} - The node to create permutations from
     * @param params {GTNode[]} - The parameters of the affix node
     * @returns {GTAffixNode} - The affix node
     */
    private _createAndRegisterAffixNodes(self: ConstructGrammarTreeActions, affix: GTAffixNode, params: GTNode[]): void {
        // Infer all possible combinations of parameter values
        const indexArrays = allPossibleCombinations(...params.map((param: GTNode) => {
            return param.childrenAffixStrings.length
        }));
        // Create the new nodes
        for(const paramValueIndeces of indexArrays) {
            let subName = affix.name;
            for (let i = 0; i < paramValueIndeces.length; i++) {
                subName += params[i].childrenAffixStrings[paramValueIndeces[i]];
            }
            self.nodeIndex[subName] = new GTNode(subName);
        }
    }

    /**
     * This function creates a filled affix node from an affix node and a list of parameters.
     * @param affix {GTAffixNode} - The affix node to fill
     * @param params {GTNode[]} - The parameters to fill the affix node with.
     *  This can be a regular node or a GTTextLeaf. In case of a GTTextLeaf, the value of the GTTextLeaf
     *  must be a possible value for the parameter.
     * @private
     */
    private _createFilledAffixFromAffix(affix: GTAffixNode, params: GTNode[]): GTFilledAffixNode {
        const filledValues: { [valueName: string]: string } = {};
        for (let i = 0; i < params.length; i++) {
            if (params[i] instanceof GTTextLeaf) {
                if (!affix.paramMayBe(affix.params[i].name, params[i].toString())) {
                    throw new Error(`Parameter ${affix.params[i].name} cannot be ${params[i].name}`);
                }
                filledValues[affix.params[i].name] = params[i].toString();
            }
        }
        return new GTFilledAffixNode(affix, filledValues);
    }

    AffixNonTerminal(
        self: ConstructGrammarTreeActions,
        _: TerminalNode,
        name: NonterminalNode,
        _1: TerminalNode,
        affixParam: NonterminalNode,
        _2: TerminalNode,
        restAffixParams: NonterminalNode,
        _3: TerminalNode
    ) {
        const nameStr = name.sourceString;
        const unparsedParams = [affixParam, ...restAffixParams.children];
        const parsedParams = unparsedParams.map((param) => (param.constructGrammarTree() as GTNodeChildren)[0][0]);
        if (!self._affixes[nameStr]) {
            const affix = self._affixes[nameStr] = new GTAffixNode(nameStr, parsedParams);
            self._createAndRegisterAffixNodes(self, affix, parsedParams);
            return self._newOrSeq(self._affixes[nameStr]);
        } else {
            const originalAffix = self._affixes[nameStr];
            return self._newOrSeq(self._createFilledAffixFromAffix(originalAffix, parsedParams));
        }
    }

    Terminal(self: ConstructGrammarTreeActions, _: TerminalNode, value: NonterminalNode, _1: TerminalNode): GTNodeChildren {
        const leaf = new GTTextLeaf(value.sourceString);
        if (!self.leaves[value.sourceString]) {
            self.leaves[value.sourceString] = [];
        }
        self.leaves[value.sourceString].push(leaf);

        return self._newOrSeq(leaf);
    }

    anythingSelector(self: ConstructGrammarTreeActions, _: TerminalNode): GTNodeChildren {
        return self._newOrSeq(new GTAnythingNode());
    }
}