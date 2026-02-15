export function escapeRegex(term: string) {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}