export class ObjectHelper {
  public static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  public static hash(input: string): number {
    let hash = 0
    let i
    let chr

    if (input.length === 0) return hash

    for (i = 0; i < input.length; i++) {
      chr = input.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0
    }
    return hash
  }
}
