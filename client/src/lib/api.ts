const BASE_URL = ''

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

interface ApiError {
  status: number
  message: string
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  }

  let fetchBody: BodyInit | undefined
  if (body instanceof FormData) {
    fetchBody = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    body: fetchBody,
    ...rest,
  })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }))
    const err: ApiError = { status: res.status, message: data.error || res.statusText }
    throw err
  }

  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json()
  }

  return res.text() as unknown as T
}

/** Convenience for tenant-scoped requests with tenant ID header */
export function tenantApi<T = unknown>(
  tenantId: number | string,
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  return api<T>(path, {
    ...options,
    headers: {
      'x-tenant-id': String(tenantId),
      ...(options.headers as Record<string, string>),
    },
  })
}
