export function tokenizeKeyValueOptions(input) {
    const tokens = [];
    let index = 0;
    const length = input.length;

    while (index < length) {
        while (index < length && /\s/.test(input[index])) {
            index += 1;
        }
        if (index >= length) {
            break;
        }

        const quote = input[index] === '"' || input[index] === "'";
        if (quote) {
            const quoteChar = input[index];
            index += 1;
            let value = '';
            let closed = false;
            while (index < length) {
                const char = input[index];
                if (char === '\\') {
                    if (index + 1 >= length) {
                        throw new Error('Invalid escape sequence in options.');
                    }
                    const nextChar = input[index + 1];
                    const escapeMap = {
                        n: '\n',
                        r: '\r',
                        t: '\t',
                        '\\': '\\',
                        "'": "'",
                        '"': '"',
                    };
                    value += escapeMap[nextChar] ?? nextChar;
                    index += 2;
                    continue;
                }
                if (char === quoteChar) {
                    closed = true;
                    index += 1;
                    break;
                }
                value += char;
                index += 1;
            }
            if (!closed) {
                throw new Error('Unterminated string literal in options.');
            }
            tokens.push(value);
            continue;
        }

        let value = '';
        while (index < length && !/\s/.test(input[index])) {
            value += input[index];
            index += 1;
        }
        tokens.push(value);
    }

    return tokens;
}

export function parseKeyValueOptions(optionsRaw, { allowedKeys = null, repeatableKeys = null } = {}) {
    const trimmed = String(optionsRaw ?? '').trim();
    if (!trimmed) {
        return {};
    }

    const tokens = tokenizeKeyValueOptions(trimmed);
    const options = {};
    const allowed = allowedKeys
        ? (allowedKeys instanceof Set ? allowedKeys : new Set(allowedKeys))
        : null;
    const repeatable = repeatableKeys
        ? (repeatableKeys instanceof Set ? repeatableKeys : new Set(repeatableKeys))
        : new Set();

    let foundPair = false;
    for (let index = 0; index < tokens.length; index += 1) {
        const token = tokens[index];
        if (!token.endsWith(':')) {
            continue;
        }
        const key = token.slice(0, -1).trim();
        if (!key) {
            continue;
        }
        if (allowed && !allowed.has(key)) {
            throw new Error(`Invalid options: unknown key ${key}.`);
        }
        const value = tokens[index + 1];
        if (value === undefined) {
            throw new Error(`Invalid options: missing value for ${key}.`);
        }
        foundPair = true;
        if (repeatable.has(key)) {
            if (!Array.isArray(options[key])) {
                options[key] = [];
            }
            options[key].push(value);
        } else {
            options[key] = value;
        }
        index += 1;
    }

    if (!foundPair) {
        throw new Error('Invalid options: no valid key-value pairs found.');
    }

    return options;
}

export function parseKeyValueOptionsWithMultiline(optionsRaw, { allowedKeys = null, repeatableKeys = null, multilineKeys = null } = {}) {
    const trimmed = String(optionsRaw ?? '').trim();
    if (!trimmed) {
        return {};
    }

    const allowed = allowedKeys
        ? (allowedKeys instanceof Set ? allowedKeys : new Set(allowedKeys))
        : null;
    const multiline = multilineKeys
        ? (multilineKeys instanceof Set ? multilineKeys : new Set(multilineKeys))
        : new Set();

    const multilinePresent = [...multiline].some((key) => {
        const pattern = new RegExp(`(^|\\s)${key}\\s*:`);
        return pattern.test(trimmed);
    });

    if (!multilinePresent) {
        return parseKeyValueOptions(optionsRaw, { allowedKeys, repeatableKeys });
    }

    const keyRegex = /(^|\s)([A-Za-z0-9_-]+)\s*:/g;
    const matches = [];
    let match = keyRegex.exec(trimmed);
    while (match) {
        const key = match[2];
        if (!allowed || allowed.has(key)) {
            const matchStart = match.index + (match[1] ? match[1].length : 0);
            const valueStart = match.index + match[0].length;
            matches.push({ key, matchStart, valueStart });
        }
        match = keyRegex.exec(trimmed);
    }

    if (matches.length === 0) {
        throw new Error('Invalid options: no valid key-value pairs found.');
    }

    const options = {};
    const repeatable = repeatableKeys
        ? (repeatableKeys instanceof Set ? repeatableKeys : new Set(repeatableKeys))
        : new Set();

    for (let index = 0; index < matches.length; index += 1) {
        const { key, valueStart } = matches[index];
        const next = matches[index + 1];
        const valueEnd = next ? next.matchStart : trimmed.length;
        let value = trimmed.slice(valueStart, valueEnd).trim();

        if (!value) {
            throw new Error(`Invalid options: missing value for ${key}.`);
        }

        if (!multiline.has(key)) {
            const tokens = tokenizeKeyValueOptions(value);
            if (tokens.length > 0) {
                value = tokens[0];
            }
        }

        if (repeatable.has(key)) {
            if (!Array.isArray(options[key])) {
                options[key] = [];
            }
            options[key].push(value);
        } else {
            options[key] = value;
        }
    }

    return options;
}
