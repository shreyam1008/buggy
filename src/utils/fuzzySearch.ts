// Simple fuzzy search implementation
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Direct match
  if (textLower.includes(queryLower)) return true;
  
  // Fuzzy match - check if query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length;
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items;
  
  return items.filter(item => {
    const fields = getFields(item);
    return fields.some(field => fuzzyMatch(field, query));
  });
}
