function selectAllText(container) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(container);
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(container);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}

function id(id) { return document.getElementById(id); }

function span(klass, content) {
    return dom('span', { 'class': klass }, content);
}

var map = {
    'space': '',
    'operator': 'red',
    'name': 'blue',
    'comment': 'grey italic',
    'lambda': 'purple bold'
};

function wrap(token) {
    return span(map[token.name] || '', token.content);
}

function generateList(content, type) {
    var names;
    if (type === 'pairs') {
        names = { cons: 'consP', nil: 'nilP' };
    } else if (type === 'fn') {
        names = { cons: 'cons', nil: 'nil' };
    }

    var items = content.split(' ');

    function str(arr) {
        if (!arr.length) return names.nil;
        var head = arr[0];
        if (!head.trim().length) {
            return str(arr.slice(1));
        }
        var tail = arr.slice(1);
        return ['(', names.cons, ' ', head.trim(), ' ', str(tail), ')'].join('');
    }

    return str(items);
}

window.addEventListener('DOMContentLoaded', function () {
    var container = id('content');
    var listResult = id('list_result');

    var lines = container.innerText.split('\n');
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var tokens = window.parseLine(line);
        result = result.concat([{ name: 'space', content: '\n' }]).concat(tokens);
    }

    container.innerHTML = '';
    for (var j = 0; j < result.length; j++) {
        container.appendChild(wrap(result[j]));
    }

    id('select_all_link').addEventListener('click', function (ev) {
        selectAllText(container);
        ev.preventDefault();
        return false;
    });

    id('select_list_link').addEventListener('click', function (ev) {
        selectAllText(listResult);
        ev.preventDefault();
        return false;
    });

    id('list_generator').addEventListener('submit', function (ev) {
        var result = generateList(id('list_content').value, id('list_type').value);
        var tokens = window.parseLine(result);
        listResult.innerHTML = '';
        for (var i = 0; i < tokens.length; i++) {
            listResult.appendChild(wrap(tokens[i]));
        }
        ev.preventDefault();
        return false;
    })
});
