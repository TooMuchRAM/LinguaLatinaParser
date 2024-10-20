const latinGrammar = String.raw`
<gender> ::= "masculine" | "feminine" | "neuter";
<person> ::= "first" | "second" | "third";
<number> ::= "singular" | "plural";
<case> ::= "nominative" | "genitive" 
    | "dative" | "accusative" 
    | "ablative" | "vocative";
<tense> ::= "present" | "prefect"
    | "imperfect" | "future"
    | "pluperfect" | "futureperfect";
<mood> ::= "indicative" | "subjunctive"
    | "imperative";
<voice> ::= "active" | "passive";

<noun(<gender>, <number>, <case>)>;
<adjective(<gender>, <number>, <case>)>;
<verb(<person>, <number>, <tense>, <mood>, <voice>)>;
<infinitive(<tense>, <voice>)>;

<sum(<person>, <number>, <tense>, <mood>, <voice>)>;
<esse(<tense>, <voice>)>;

<fio(<person>, <number>, <tense>, <mood>, <voice>)>;
<fieri(<tense>, <voice>)>;

<copulativeverb(<person>, <number>, <tense>, <mood>, <voice>)> ::= 
    <sum(<person>, <number>, <tense>, <mood>, <voice>)>
    | <fio(<person>, <number>, <tense>, <mood>, <voice>)>;
<copulativeinfinitive(<tense>, <voice>)> ::= 
    <esse(<tense>, <voice>)>
    | <fieri(<tense>, <voice>)>;

<participium(<gender>, <number>, <case>)>;
<gerund(<gender>, <number>, <case>)>;
<gerundive(<gender>, <number>, <case>)>;

<persnpron(<gender>, <number>, <case>)>;
<demstpron(<gender>, <number>, <case>)>;
<relatpron(<gender>, <number>, <case>)>;
<indefpron(<gender>, <number>, <case>)>;

<nounlike(<gender>, <number>, <case>)> ::=
    <noun(<gender>, <number>, <case>)>
    | <persnpron(<gender>, <number>, <case>)>
    | <demstpron(<gender>, <number>, <case>)>
    | <relatpron(<gender>, <number>, <case>)>
    | <indefpron(<gender>, <number>, <case>)>
    | <gerund("neuter", "singular", <case>)>;

<adjectivelike(<gender>, <number>, <case>)> ::= 
    <adjective(<gender>, <number>, <case>)> 
    | <demstpron(<gender>, <number>, <case>)>
    | <indefpron(<gender>, <number>, <case>)>
    | <gerundive(<gender>, <number>, <case>)>
    | <participium(<gender>, <number>, <case>)>;

<attributivephrase> ::= 
    {..<adjectivelike(<gender>, <number>, "genitive")>..},
    <nounlike(<gender>, <number>, "genitive")>;
   
<nounphrase(<gender>, <number>, <case>)> ::= 
    {..<adjectivelike(<gender>, <number>, <case>)>..}, 
    <nounlike(<gender>, <number>, <case>)>, 
    [..<attributivephrase>..];
    
<singlesubject> ::= <nounphrase(<gender>, <number>, "nominative")>;
<subject> ::= <singlesubject>,
    {(<et>|<vel>), <singlesubject>};
<singleobject> ::= <nounphrase(<gender>, <number>, "accusative")>;
<object> ::= <singleobject>,
    {(<et>|<vel>), <singleobject>};
   
<ad>;
<ante>;
<apud>;
<inter>;
<iuxta>;
<per>;
<post>;
<ab>;
<a>;
<coram>;
<cum>;
<de>;
<e>;
<ex>;
<pre>;
<pro>;
<sine>;
<in>;
<super>;
<prepositionclauseacc> ::= (<ad> | <ante> | <apud>  
    | <inter>
    | <iuxta> | <per> | <post> | <in> | <super>), 
    <nounphrase(<gender>, <number>, "accusative")>;
<prepositionclauseabl> ::= (<a> | <ab> | <coram> | <cum> 
    | <de> | <e> | <ex> | <pre> | <pro> 
    | <sine> | <in> | <super>), 
    <nounphrase(<gender>, <number>, "ablative")>;

<prepositionclause> ::= <prepositionclauseacc> 
    | <prepositionclauseabl>;


<verbsuper(<person>, <number>, <tense>, <mood>, <voice>)> ::= 
    <verb(<person>, <number>, <tense>, <mood>, <voice>)>
    | <copulativeverb(<person>, <number>, <tense>, <mood>, <voice>)>;

<infinitiveclause> ::= <infinitive(<tense>, <voice>)>, [..<object>..];
<copularverbphrase> ::= (
        ..<nounphrase(<gender>, <number>, "nominative")>..
        | ..<adjectivelike(<gender>, <number>, "nominative")>..
    ),
    <copulativeverb(<person>, <number>, <tense>, <mood>, <voice>)>;
    
<copularinfverbphrase> ::= [..<object>..], 
    (..<nounphrase(<gender>, <number>, "accusative")>..
    | ..<adjectivelike(<gender>, <number>, "accusative")>..),
    <copulativeinfinitive(<tense>, <voice>)>;
    
<infverbphrase> ::= [..<object>..], <infinitive(<tense>, <voice>)>;
<verbphrase> ::= ([..<object>..], 
    {..<copularinfverbphrase>..}, 
    {..<infverbphrase>..}, 
    <verbsuper(<person>, <number>, <tense>, <mood>, <voice>)>)
    | <copularverbphrase>;
    
<adverb>;
<adverbial> ::= <adverb> | <prepositionclause> 
    | <nounphrase(<gender>, <number>, "ablative")>;
<exclamation>;

<et>;
<vel>;
<otherconjunction>;
<conjunction> ::= <et> | <vel> | <otherconjunction>;

<singlesentence> ::=
    {..<exclamation>..}, 
    [..<subject>..], 
    {..<adverbial>..}, 
    ..<verbphrase>..;
`;

export default latinGrammar;
