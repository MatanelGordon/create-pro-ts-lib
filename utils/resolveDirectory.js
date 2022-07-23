const resolveDirectory = argv => {
    const dirs = argv._;
    if (dirs.length > 1) {
        throw new Error(`expected 1 directory, received ${dirs.length} - ${dirs}`);
    }
    return dirs[0].trim();
}

module.exports = resolveDirectory;