import { State, StateMachine } from './state.js';


export const T_ID = 'identifier';
export const T_PRIM = 'primitive_name';
export const T_NUM = 'number';
export const T_STR = 'string';
export const T_SUBST = 'substitution';
export const T_OP = 'operator';

const isSpace = c => c === ' ' || c === '\t' || c === '\r';
const isLetter = c => /[A-Za-z_.]/.test(c);
const isDigit = c => /[0-9]/.test(c);
const isOp = c => /[+\-$%<>()/*%!&|]/.test(c);

class Finder extends StateMachine {
    constructor(lineN) {
        super(new SInitial());
        this.tokens = [];
        this.lineN = lineN;
        this.colN = 0;
    }

    process(char) {
        super.process(char);
        this.colN++;
    }
}

class FinderState extends State {
    constructor(c) {
        super();
        this.buffer = [];
        if (c) {
            this.buffer.push(c);
        }
    }
    process(c) {
        if (isSpace(c)) return new SInitial();

        if (this.fits(c)) {
            this.buffer.push(c);
        } else {
            if (this.endChar(c)) {
                return new SInitial();
            }
            throw new TypeError(`Unexpected char ${c} at ${this.machine.lineN}:${this.machine.colN}`);
        }
    }
    onEnd() {
        this.machine.tokens.push({
            type: this.type,
            value: this.valueOf()
        });
    }
    valueOf() {
        return this.buffer.join('');
    }
    endChar() { return false; }
    fits() { return false; }
}

class SInitial extends FinderState {
    process(c) {
        if (isSpace(c)) return null;
        if (c === '$') return new SSubst(c);
        if (c === '"') return new SStr(c);
        if (isDigit(c)) return new SNumber(c);
        if (isLetter(c)) return new SId(c);
        if (isOp(c)) return new SOp(c);
        return super.process(c);
    }
    onEnd() {}
}

class SNumber extends FinderState {
    fits(c) {
        return isDigit(c);
    }
    valueOf() {
        return +super.valueOf();
    }
    get type() { return T_NUM; }
}

class SId extends FinderState {
    fits(c) {
        return isLetter(c) || isDigit(c);
    }
    get type() { return this.buffer.includes('.') ? T_PRIM : T_ID; }
}

class SStr extends FinderState {
    constructor() { super(); }
    fits(c) {
        return c !== '"';
    }
    endChar(c) {
        return c === '"';
    }
    get type() { return T_STR; }
}

class SSubst extends SId {
    constructor() { super(); }
    get type() { return T_SUBST; }
}

class SOp extends FinderState {
    fits(c) {
        return isOp(c);
    }
    get type() { return T_OP; }
}


class Token {
    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }

    toString() {
        return `[Token<${this.type}> ("${this.value}")]`;
    }
}


export function findTokens(line, n) {
    const m = new Finder(n);
    for (let i = 0; i < line.length; i++) {
        m.process(line[i]);
    }
    m.end();

    return m.tokens.map(data => new Token(data));
}
