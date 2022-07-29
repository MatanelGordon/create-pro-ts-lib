const _mv = require('mv');

async function mv(source, dest) {
    return new Promise((res, rej) => {
        _mv(source, dest, { mkdirp: true }, function (err) {
            if (err) return rej(err);
            res();
        });
    });
}

module.exports = mv;
