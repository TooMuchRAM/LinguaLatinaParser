import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTAnywhereNode from "./GTAnywhereNode";
import GTStackTrace from "./GTStackTrace";

export default class GTMatchResult {
    constructor({remaining}: {remaining: SEQ<GTNode>}) {
        this.remaining = remaining;
    }

    public remaining: SEQ<GTNode>;

    public transfer(previous: GTMatchResult): void {
        this.anywhere.requirements = [...previous.anywhere.requirements, ...this.anywhere.requirements];
        this.anywhere.optionals = [...previous.anywhere.optionals, ...this.anywhere.optionals];
        this.anywhere.repeatables = [...previous.anywhere.repeatables, ...this.anywhere.repeatables];

        this.stacktrace.addBefore(previous.stacktrace);
    }

    public anywhere: {
        requirements: GTAnywhereNode[];
        optionals: GTAnywhereNode[];
        repeatables: GTAnywhereNode[];
    } = {
        requirements: [],
        optionals: [],
        repeatables: []
    };

    public stacktrace: GTStackTrace = new GTStackTrace();
}