/**
 * Represents a logical OR of multiple values.
 */
class OR<T> extends Array<T> {
    override toString(): string {
        return this.join(" | ");
    }
}
export default OR;