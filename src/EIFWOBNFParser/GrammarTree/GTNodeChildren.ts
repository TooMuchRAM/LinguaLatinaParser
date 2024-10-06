import GTNode from "./GTNode";
import SEQ from "./SEQ";
import OR from "./OR";

type GTNodeChildren = OR<SEQ<GTNode>>;
export default GTNodeChildren;