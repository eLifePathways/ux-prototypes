/** Path to the fake login page, returning to `returnTo` afterwards (optionally running an action). */
export function loginPath(returnTo = '/', action) {
  const params = new URLSearchParams({ return: returnTo });
  if (action) params.set('action', action);
  return `/login?${params}`;
}
