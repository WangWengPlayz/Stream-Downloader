let _count = 0;
let _success = 0;
let _error = 0;

export function increment(): number {
  return ++_count;
}

export function recordSuccess(): void {
  _success++;
}

export function recordError(): void {
  _error++;
}

export function getCount(): number {
  return _count;
}

export function getSuccess(): number {
  return _success;
}

export function getError(): number {
  return _error;
}
