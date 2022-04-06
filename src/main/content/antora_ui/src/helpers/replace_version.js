'use strict'

function replace_version(from, to) {
    from = from.split('/');
    from[2] = to; // Version piece of the path
    from = from.join('/')
    return from;
};

module.exports = replace_version