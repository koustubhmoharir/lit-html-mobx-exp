export function safeIndex<T>(array: readonly T[], index: number) {
    if (index < 0 || index >= array.length)
        return undefined;
    return array[index];
}