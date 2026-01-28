export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )csrf_token=([^;]+)"));
  return match ? match[2] : null;
}
