(function (global) {
    var enter = function () {
        this.buffer = [];
        this.active = true;
    };
    var consume = function (c) {
        this.buffer.push(c);
    };
    var leave = function () {
        this.active = false;
        return this.buffer.join('');
    };

    var nameState = {
        name: 'name',
        enter: enter,
        consume: consume,
        leave: leave,
        check: function (c) {
            return !!c.match(/[A-Za-z0-9]/);
        }
    };
    var operatorState = {
        name: 'operator',
        enter: enter,
        consume: consume,
        leave: leave,
        check: function (c) {
            return !!c.match(/[().]/);
        }
    };
    var commentState = {
        name: 'comment',
        enter: enter,
        leave: leave,
        consume: consume,
        check: function (c) {
            if (!this.active) return c === '%';
            return true;
        }
    };
    var lambdaState = {
        name: 'lambda',
        enter: enter,
        leave: leave,
        consume: consume,
        check: function (c) {
            if (!this.active) return c === '\\';
            return c !== '.';
        }
    };
    var spaceState = {
        name: 'space',
        enter: enter,
        leave: leave,
        consume: consume,
        check: function (c) {
            return c === ' ' || c === '\t';
        }
    };

    function Parser(line) {
        this.line = line;
        this.state = null;
        this.tokens = [];
        this.allStates = [nameState, operatorState, commentState, lambdaState, spaceState];
    }
    Parser.prototype.parse = function () {
        if (!this.line.length) return;
        this.state = this.defineState(this.line[0]);
        this.state.enter();
        for (var i = 0; i < this.line.length; i++) {
            var c = this.line[i];
            this.consume(c);
        }
        this.leaveState();
    };
    Parser.prototype.consume = function(char) {
        if (this.state.check(char)) {
            this.state.consume(char);
        } else {
            this.leaveState();
            this.state = this.defineState(char);
            this.state.enter();
            this.state.consume(char);
        }
    };
    Parser.prototype.defineState = function(char) {
        for (var i = 0; i < this.allStates.length; i++) {
            var candidate = this.allStates[i];
            if (candidate.check(char))
                return candidate;
        }
        throw new Error('Cannot define state for ' + char);
    };
    Parser.prototype.leaveState = function() {
        this.tokens.push({
            name: this.state.name,
            content: this.state.leave()
        });
    };

    function parseLine(line) {
        var p = new Parser(line);
        p.parse();
        return p.tokens;
    }

    global.parseLine = parseLine;
})(window);
