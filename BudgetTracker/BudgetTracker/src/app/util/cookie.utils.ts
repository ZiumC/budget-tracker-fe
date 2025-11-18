export function setCookie(name: string, value: string, expires: Date | null = null): void {
  if (expires) {
    document.cookie = `${name}=${value};expires=${new Date(expires).toUTCString()}; path=/`;
  } else {
    document.cookie = `${name}=${value};path=/`;
  }
}

export function getCookie(name: string): string | null {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
