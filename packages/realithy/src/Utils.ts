

export const identity = <M>(m: M) => m;

export function safeIndex<T>(array: readonly T[], index: number) {
    if (index < 0 || index >= array.length)
        return undefined;
    return array[index];
}
export function arrayEquals(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;
    for (let index = 0; index < arr1.length; index++) {
        const element1 = arr1[index];
        const element2 = arr2[index];
        if (!Object.is(element1, element2))
            return false;
    }
    return true;
}