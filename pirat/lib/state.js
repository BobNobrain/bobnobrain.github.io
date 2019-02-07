export class StateMachine {
    constructor(initial) {
        this.state = initial;
        initial.onStart(this);
    }

    process(...args) {
        const state = this.state.process(...args);
        if (state) {
            this.setState(state);
        }
    }

    end() {
        this.state.onEnd();
    }

    setState(state) {
        this.state.onEnd();
        state.onStart(this);
        this.state = state;
    }
}

export class State {
    onStart(machine) {
        this.machine = machine;
    }
    onEnd() {}
    process() {}
}
