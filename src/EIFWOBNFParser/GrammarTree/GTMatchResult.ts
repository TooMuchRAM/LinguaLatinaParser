import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTAnywhereNode from "./GTAnywhereNode";

export default class GTMatchResult {
    constructor({remaining}: {remaining: SEQ<GTNode>}) {
        this.remaining = remaining;
    }

    public remaining: SEQ<GTNode>;
    public anywhere: {
        requirements: GTAnywhereNode[];
        optionals: GTAnywhereNode[];
        repeatables: GTAnywhereNode[];
    } = {
        requirements: [],
        optionals: [],
        repeatables: []
    };
}