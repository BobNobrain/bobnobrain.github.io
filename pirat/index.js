import app from '/pirat/lib/app.js';

document.addEventListener('DOMContentLoaded', () => {
    const els = {
        input: $('#input_code'),
        output: $('#output_code'),
        configureBody: $('#configure_body')
    };

    app.init(els);
    window.app = app;
});
