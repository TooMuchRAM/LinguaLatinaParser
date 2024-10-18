import GTNode from "./GTNode";
import SEQ from "./SEQ";
import GTAnywhereNode from "./GTAnywhereNode";
import GTStackTrace, {GTSTEntry, GTSTParent} from "./GTStackTrace";


export default class GTMatchResult {
    constructor({remaining}: {remaining: SEQ<GTNode>}) {
        this.remaining = remaining;
    }

    public remaining: SEQ<GTNode>;

    public transfer(previous: GTMatchResult): void {
        this.anywhere.requirements = [...previous.anywhere.requirements, ...this.anywhere.requirements];
        this.anywhere.optionals = [...previous.anywhere.optionals, ...this.anywhere.optionals];
        this.anywhere.repeatables = [...previous.anywhere.repeatables, ...this.anywhere.repeatables];

        this.transferStacktrace(previous);
    }

    public transferStacktrace(previous: GTMatchResult): void {
        this._stacktrace.addBefore(previous._stacktrace);
    }

    public anywhere: {
        requirements: GTSTEntry<GTAnywhereNode>[];
        optionals: GTSTEntry<GTAnywhereNode>[];
        repeatables: GTSTEntry<GTAnywhereNode>[];
    } = {
        requirements: [],
        optionals: [],
        repeatables: []
    };

    public addParents(identifiers: GTSTParent[], onlyStacktrace: boolean = false) {
        for (const identifier of identifiers) {
            this.addParent(identifier, onlyStacktrace);
        }
    }

    public addParent(parent: GTSTParent, onlyStacktrace: boolean = false) {
        this._stacktrace.addParent(parent);

        if (onlyStacktrace) {
            return;
        }

        for (const entry of this.anywhere.requirements) {
            entry.parents.push(parent);
        }
        for (const entry of this.anywhere.optionals) {
            entry.parents.push(parent);
        }
        for (const entry of this.anywhere.repeatables) {
            entry.parents.push(parent);
        }
    }

    public get stacktrace(): GTStackTrace {
        return this._stacktrace;
    }
    private _stacktrace: GTStackTrace = new GTStackTrace();
}