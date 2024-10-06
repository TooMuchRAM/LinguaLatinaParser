import GTNode from "./GTNode";
import GTInfixNode from "./GTInfixNode";
import {allPossibleCombinations} from "../utils";

export default class GTFilledInfixNode extends GTNode {
    filledValues: { [key: string]: string };
    infixNode: GTInfixNode;

    constructor(infixNode: GTInfixNode, filledValues: { [key: string]: string } = {}) {
        super("temporary");
        this.filledValues = filledValues;
        this.infixNode = infixNode;
    }

    /**
     * Generates all possible combinations of parameter values
     * based on the filled values and the possible values of the parameters
     * and puts them together to create a list of possible node names.
     * @returns A list of possible node names.
     */
    public generatePossibleNodeNames(): string[] {
        const unfilledParamIndeces: number[] = Array.from(this.infixNode.params.entries()).map(([index, param]) => {
            if (this.filledValues[param.name] === undefined) {
                return index;
            }
        }).filter((index) => index !== undefined);
        const indexArrays = allPossibleCombinations(...unfilledParamIndeces.map((index) => {
            return this.infixNode.params[index].childrenInfixStrings.length;
        }));
        const names = [];
        for(const indexArray of indexArrays) {
            let subName = this.infixNode.name;
            let offset = 0;
            for (let i = 0; i < indexArray.length; i++) {
                while (i + offset !== indexArray[i]) {
                    subName += this.infixNode.params[i + offset].name
                    offset++;
                }
                subName += this.infixNode.params[i + offset].childrenInfixStrings[indexArray[i + offset]];
            }
            names.push(subName);
        }
        return names;
    }

    public generateName(): string {
        this.infixNode.params.forEach((param) => {
            if (this.filledValues[param.name] === undefined) {
                throw new Error("Not all parameters are filled in");
            }
        });
        return this.infixNode.name + this.infixNode.params.map((param) => {
            return this.filledValues[param.name];
        }).join("");
    }
}