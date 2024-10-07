import GTNodeChildren from "./GrammarTree/GTNodeChildren";
import GTNode from "./GrammarTree/GTNode";
import GTInfixNode from "./GrammarTree/GTInfixNode";
import OR from "./GrammarTree/OR";
import SEQ from "./GrammarTree/SEQ";
import GTFilledInfixNode from "./GrammarTree/GTFilledInfixNode";
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
     * Variable holding the infixes during parsing.
     * the name is the name of the InfixNonTerminal,
     * the list GTNode are the NonTerminals that describe
     * the possible values of the infixes
     * @private
     */
    private _infixes: { [name: string]: GTInfixNode } = {};

    public anywhereNodes: GTAnywhereNode[] = [];
    public leaves: {[value: string]: GTTextLeaf[]} = {};

    public constructor() {
        this.reset();
    }

    public reset() {
        this.nodeIndex = {};
        this._infixes = {};
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

    private _mapInfixNodes(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren, callback: (node: GTInfixNode | GTFilledInfixNode) => GTNode): GTNodeChildren {
        return nodeList.map((seq): SEQ<GTNode> => {
            return seq.map((node): GTNode => {
                if (node instanceof GTInfixNode || node instanceof GTFilledInfixNode) {
                    return callback(node);
                } else if (node instanceof GTConstructNode && node.containsInfixNodes) {
                    const newNode: GTConstructNode = new (Object.getPrototypeOf(node).constructor);
                    newNode.children = self._mapInfixNodes(self, node.children!, callback);
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
     * Get all parameters from all infix nodes contained in the list of nodes
     * @param self {ConstructGrammarTreeActions} - The instance of the ConstructGrammarTreeActions
     * @param nodeList {GTNodeChildren} - The list of nodes to get the parameters from
     * @returns {Set<GTNode>} - The set of parameters
     * @private
     */
    private _getAllParameters(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren): Set<GTNode> {
        const params: Set<GTNode> = new Set();
        self._mapInfixNodes(self, nodeList, (node) => {
            if (node instanceof GTInfixNode) {
                node.params.forEach((param) => {
                    params.add(param);
                });
            } else {
                node.infixNode.params.filter(
                    (param) => !node.filledValues[param.name]
                ).forEach((param) => {
                    params.add(param);
                });
            }
            return node;
        });
        return params;
    }

    private _generateAllParameterCombinations(parameters: Set<GTNode>): { [param: string]: string }[] {
        const paramsToExpandArray = Array.from(parameters);
        const configurations: { [param: string]: string }[] = [];
        const possibleIndexCombinations = allPossibleCombinations(...paramsToExpandArray.map((param) => {
            return param.childrenInfixStrings.length;
        }));
        for (const indexCombination of possibleIndexCombinations) {
            const configuration: { [param: string]: string } = {};
            for (let i = 0; i < indexCombination.length; i++) {
                configuration[paramsToExpandArray[i].name] = paramsToExpandArray[i].childrenInfixStrings[indexCombination[i]];
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
            nodes: self._mapInfixNodes(self, nodeList, (node) => {
                let filledNode: GTFilledInfixNode;
                const changedValues = [];
                if (node instanceof GTInfixNode) {
                    filledNode = new GTFilledInfixNode(node);
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

    private _expandInfixNodes(self: ConstructGrammarTreeActions, nodeList: GTNodeChildren): {
        configuration: {[param: string]: string},
        nodes: GTNodeChildren
    }[] {
        // Get all parameters to expand
        const paramsToExpand = self._getAllParameters(self, nodeList);

        if (paramsToExpand.size === 0) {
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
        const expandedInfixNodes = self._expandInfixNodes(self, right);
        if (expandedInfixNodes.length === 0) {
            left.children?.push(...right);
            self._setParentOnChildren(right, left);
            return self._newOrSeq(left);
        } else {
            left.children = expandedInfixNodes
                .map((node) => node.nodes)
                .reduce((acc, val) => acc.concat(val), []);
            self._setParentOnChildren(left.children, left);
            return self._newOrSeq(left);
        }
    }

    private _declareContainingNoInfixNodes(self: ConstructGrammarTreeActions, left: GTInfixNode|GTFilledInfixNode, right: GTNodeChildren): GTNodeChildren {
        const filledInfix = left instanceof GTInfixNode ? new GTFilledInfixNode(left) : left;
        const possibleNames = filledInfix.generatePossibleNodeNames();
        return possibleNames.map((name): SEQ<GTNode> => {
            const node = self.nodeIndex[name];
            node.children?.push(...right);
            self._setParentOnChildren(right, node);
            return [node];
        });
    }

    private _declareContainingInfixNodes(self: ConstructGrammarTreeActions, left: GTInfixNode|GTFilledInfixNode, configurations: {
        configuration: {[param: string]: string},
        nodes: GTNodeChildren
    }[]): GTNodeChildren {
        const allNodes = new Set<GTNode>();
        configurations.forEach((config) => {
            const filledInfixNode = left instanceof GTInfixNode ? new GTFilledInfixNode(left as GTInfixNode, config.configuration) : left as GTFilledInfixNode;
            for (const [key, value] of Object.entries(config.configuration)) {
                if (!filledInfixNode.filledValues[key]) {
                    filledInfixNode.filledValues[key] = value;
                }
            }
            const normalNode = self.nodeIndex[filledInfixNode.generateName()];
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

        if (leftSide instanceof GTInfixNode || leftSide instanceof GTFilledInfixNode) {
            const expandedInfixNodes = self._expandInfixNodes(self, rightSide);
            if (expandedInfixNodes.length === 0) {
                return self._declareContainingNoInfixNodes(self, leftSide, rightSide);
            } else {
                return self._declareContainingInfixNodes(self, leftSide, expandedInfixNodes);
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
        const node: GTNodeChildren = ConstructOrGrouping.constructGrammarTree();
        const compositionNode: GTNodeChildren = composition.constructGrammarTree();
        return compositionNode.map((seq) => {
            return new SEQ(node[0][0], ...seq);
        });
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
     * from an infix node.
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
     * @param infix {GTInfixNode} - The node to create permutations from
     * @param params {GTNode[]} - The parameters of the infix node
     * @returns {GTInfixNode} - The infix node
     */
    private _createAndRegisterInfixNodes(self: ConstructGrammarTreeActions, infix: GTInfixNode, params: GTNode[]): void {
        // Infer all possible combinations of parameter values
        const indexArrays = allPossibleCombinations(...params.map((param: GTNode) => {
            return param.childrenInfixStrings.length
        }));
        // Create the new nodes
        for(const paramValueIndeces of indexArrays) {
            let subName = infix.name;
            for (let i = 0; i < paramValueIndeces.length; i++) {
                subName += params[i].childrenInfixStrings[paramValueIndeces[i]];
            }
            self.nodeIndex[subName] = new GTNode(subName);
        }
    }

    /**
     * This function creates a filled infix node from an infix node and a list of parameters.
     * @param infix {GTInfixNode} - The infix node to fill
     * @param params {GTNode[]} - The parameters to fill the infix node with.
     *  This can be a regular node or a GTTextLeaf. In case of a GTTextLeaf, the value of the GTTextLeaf
     *  must be a possible value for the parameter.
     * @private
     */
    private _createFilledInfixFromInfix(infix: GTInfixNode, params: GTNode[]): GTFilledInfixNode {
        const filledValues: { [valueName: string]: string } = {};
        for (let i = 0; i < params.length; i++) {
            if (params[i] instanceof GTTextLeaf) {
                if (!infix.paramMayBe(infix.params[i].name, params[i].toString())) {
                    throw new Error(`Parameter ${infix.params[i].name} cannot be ${params[i].name}`);
                }
                filledValues[infix.params[i].name] = params[i].toString();
            }
        }
        return new GTFilledInfixNode(infix, filledValues);
    }

    InfixNonTerminal(
        self: ConstructGrammarTreeActions,
        _: TerminalNode,
        name: NonterminalNode,
        _1: TerminalNode,
        infixParam: NonterminalNode,
        _2: TerminalNode,
        restInfixParams: NonterminalNode,
        _3: TerminalNode
    ) {
        const nameStr = name.sourceString;
        const unparsedParams = [infixParam, ...restInfixParams.children];
        const parsedParams = unparsedParams.map((param) => (param.constructGrammarTree() as GTNodeChildren)[0][0]);
        if (!self._infixes[nameStr]) {
            const infix = self._infixes[nameStr] = new GTInfixNode(nameStr, parsedParams);
            self._createAndRegisterInfixNodes(self, infix, parsedParams);
            return self._newOrSeq(self._infixes[nameStr]);
        } else {
            const originalInfix = self._infixes[nameStr];
            return self._newOrSeq(self._createFilledInfixFromInfix(originalInfix, parsedParams));
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