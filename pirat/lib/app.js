import Parser from './parser.js';

class App {
    constructor() {
        this.els = null;
        this.config = null;
    }

    init(els) {
        this.els = els;
        console.log('Initialized application', els)
    }

    translate() {
        const inputCode = this.els.input.val();
        const p = new Parser(inputCode);
        p.tokenize();
        p.parse();
        this.els.output.text(p.ast.join('\n'));
    }
}

export default new App();
