const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function getNonce(length = 32): string {
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  return value;
}
