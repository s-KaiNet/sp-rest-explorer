export class ObjectHelper {
  public static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }
}
