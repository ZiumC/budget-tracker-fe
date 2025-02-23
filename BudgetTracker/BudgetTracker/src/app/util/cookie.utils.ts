export function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value};path=/`;
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
