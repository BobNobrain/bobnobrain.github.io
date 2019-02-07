import { findTokens } from './tokenizer.js';
import { parseOperator } from './lang.js';

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
        this.ast = this.tokens.map(parseOperator);
    }
}
