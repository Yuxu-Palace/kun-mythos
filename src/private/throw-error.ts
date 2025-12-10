export function throwError(message: string, ErrorConstuctor: ErrorConstructor = Error): never {
  throw new ErrorConstuctor(`[@yuxu-palace/kun-mythos]:> ${message}`);
}

export function throwTypeError(message: string): never {
  throwError(message, TypeError);
}
