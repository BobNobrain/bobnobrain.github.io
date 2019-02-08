import {
    T_ID,
    T_NUM,
    T_PRIM,
    T_STR,
    T_SUBST,
    T_OP
} from './tokenizer.js';

const keywords = {
    down: 'down',
    up: 'up',
    generatedown: 'down',
    generateup: 'up',
    senddown: 'down',
    sendup: 'up',
    downsend: 'down',
    upsend: 'up',

    timer: 'timer',
    timeevent: 'timer',

    set: 'set',
    setto: 'set',

    declare: 'declare',

    goto: 'goto',
    if: 'if',

    return: 'return',

    buffer: 'buffer',
    pack: 'buffer',
    unpack: 'unbuffer',
    unbuffer: 'unbuffer',

    queue: 'queue',
    enqueue: 'queue'
};

// most important first
const importance = ['declare', 'return', 'goto', 'if', 'up', 'down', 'timer', 'set', 'buffer', 'queue'];

function findKeyword(tokens) {
    let kw = null;
    let kwi = -1;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type !== T_ID) continue;
        if (!(tokens[i].value in keywords)) continue;
        const candidate = tokens[i].value;

        for (let j = 0; j < importance.length; j++) {
            const next = importance[j];
            if (kw === next) break;
            if (candidate === next) {
                kw = candidate;
                kwi = i;
                break;
            }
        }
        if (!kw) {
            // for cases when importance does not contain candidate
            kw = candidate;
            kwi = i;
        }
    }

    const rest = tokens.slice();
    rest.splice(kwi, 1);

    return {
        kw,
        rest
    };
}

function find(tokens, type) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === type) {
            const copy = tokens.slice();
            copy.splice(i, 1);
            copy.unshift(tokens[i]);
            return copy;
        }
    }
    return [null, ...tokens];
}

class Operator {
    constructor(args) {
        Object.assign(this, args);
    }

    static recognize(tokens, lineN) {
        const { kw, rest } = findKeyword(tokens);
        if (!kw) {
            throw new TypeError(`No keyword found at ${lineN}`);
        }
        return new Operator.ops[keywords[kw]](rest, lineN);
    }

    static reg(kw) {
        Operator.ops[kw] = this;
    }
}
Operator.ops = {};


class PrimitiveOp extends Operator {
    constructor(name, tokens, lineN) {
        const [primitive, ...args] = find(tokens, T_PRIM);
        if (!primitive) throw new TypeError(`No primitive name at ${lineN}`);
        super({
            name,
            primitive: primitive.value,
            args
        });
    }
    toString(config) {
        return `down ${this.primitive} ${this.args.join(' ')}`;
    }
}
class DownOp extends PrimitiveOp {
    constructor(tokens, lineN) {
        super('down', tokens, lineN);
    }
}
DownOp.reg('down');
class UpOp extends PrimitiveOp {
    constructor(tokens, lineN) {
        super('up', tokens, lineN);
    }
}
UpOp.reg('up');


class CommentOp extends Operator {
    constructor(tokens, lineN) {
        if (tokens.length !== 1) throw new TypeError(`Not a comment line at ${lineN}: ${tokens.join(' ')}`);
        super({
            comment: tokens[0]
        });
    }
    toString() {
        return this.comment.toString();
    }
}


export function parseOperator(tokens, lineN) {
    if (!tokens.length) return '';
    try {
        return Operator.recognize(tokens, lineN);
    } catch (error) {
        return new CommentOp(tokens, lineN);
    }
}
