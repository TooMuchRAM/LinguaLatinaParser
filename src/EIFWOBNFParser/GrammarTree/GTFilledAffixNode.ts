import GTNode from "./GTNode";
import GTAffixNode from "./GTAffixNode";
import {allPossibleCombinations} from "../utils";

export default class GTFilledAffixNode extends GTNode {
    filledValues: { [key: string]: string };
    affixNode: GTAffixNode;

    constructor(affixNode: GTAffixNode, filledValues: { [key: string]: string } = {}) {
        super("temporary");
        this.filledValues = filledValues;
        this.affixNode = affixNode;
    }

    /**
     * Generates all possible combinations of parameter values
     * based on the filled values and the possible values of the parameters
     * and puts them together to create a list of possible node names.
     * @returns A list of possible node names.
     */
    public generatePossibleNodeNames(): string[] {
        const unfilledParamIndeces: number[] = Array.from(this.affixNode.params.entries()).map(([index, param]) => {
            if (this.filledValues[param.name] === undefined) {
                return index;
            }
        }).filter((index) => index !== undefined);
        const indexArrays = allPossibleCombinations(...unfilledParamIndeces.map((index) => {
            return this.affixNode.params[index].childrenAffixStrings.length;
        }));
        const names = [];
        for(const indexArray of indexArrays) {
            let subName = this.affixNode.name;
            let offset = 0;
            for (let i = 0; i < indexArray.length; i++) {
                while (i + offset !== indexArray[i]) {
                    subName += this.affixNode.params[i + offset].name
                    offset++;
                }
                subName += this.affixNode.params[i + offset].childrenAffixStrings[indexArray[i + offset]];
            }
            names.push(subName);
        }
        return names;
    }

    public generateName(): string {
        this.affixNode.params.forEach((param) => {
            if (this.filledValues[param.name] === undefined) {
                throw new Error("Not all parameters are filled in");
            }
        });
        return this.affixNode.name + this.affixNode.params.map((param) => {
            return this.filledValues[param.name];
        }).join("");
    }
}