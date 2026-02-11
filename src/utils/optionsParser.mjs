export function stripDependsOn(input) {
    if (!input) return '';
    const match = input.match(/\bdependsOn\s*:\s*/i);
    if (!match || match.index === undefined) {
        return input;
    }
    return input.slice(0, match.index).trimEnd();
}

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
    try {
        return parseKeyValueOptions(optionsRaw, { allowedKeys, repeatableKeys });
    } catch (error) {
        const trimmed = String(optionsRaw ?? '').trim();
        if (!trimmed) {
            throw error;
        }

        const match = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*/);
        if (!match) {
            throw error;
        }

        const key = match[1];
        const allowed = allowedKeys
            ? (allowedKeys instanceof Set ? allowedKeys : new Set(allowedKeys))
            : null;
        const multiline = multilineKeys
            ? (multilineKeys instanceof Set ? multilineKeys : new Set(multilineKeys))
            : new Set();

        if (allowed && !allowed.has(key)) {
            throw error;
        }
        if (!multiline.has(key)) {
            throw error;
        }

        const value = trimmed.slice(match[0].length);
        if (!value) {
            throw new Error(`Invalid options: missing value for ${key}.`);
        }

        return { [key]: value };
    }
}
