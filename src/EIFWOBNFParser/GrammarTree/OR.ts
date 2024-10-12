/**
 * Represents a logical OR of multiple values.
 */
class OR<T> extends Array<T> {
    override toString(): string {
        return this.join(" | ");
    }

    override map<U>(callbackfn: (value: T, index: number, array: OR<T>) => U, thisArg?: any): OR<U> {
        return super.map(callbackfn, thisArg);
    }
}
export default OR;