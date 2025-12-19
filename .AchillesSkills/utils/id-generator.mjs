export const nextId = (existingIds, prefix) => {
    const numbers = existingIds
        .map((id) => {
            const match = id.match(/-(\d+)$/);
            return match ? Number(match[1]) : 0;
        })
        .filter(Number.isFinite);
    const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};
