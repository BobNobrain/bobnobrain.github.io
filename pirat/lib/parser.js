import findTokens from './tokenizer.js';

export default class Parser {
    constructor(code) {
        this.source = code;
        this.tokens = [];
        this.ast = [];
    }

    tokenize() {
        const lines = this.source.split('\n');
        const tokens = lines.map(findTokens);
        this.tokens = tokens;
    }

    parse() {
        // TODO
        this.ast = this.tokens;
    }
}
