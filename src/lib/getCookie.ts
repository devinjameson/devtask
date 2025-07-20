export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined
  }

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : undefined
}
