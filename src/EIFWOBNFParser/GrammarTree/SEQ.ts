/**
 * A class that represents a sequence of words.
 */
class SEQ<T> extends Array<T> {
    override toString(): string {
        return this.join(", ");
    }
}
export default SEQ;