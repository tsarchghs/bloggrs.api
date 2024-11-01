import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  userId?: number;
  tenantId?: number;
  roles?: string[];
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function setRequestContext(context: RequestContext) {
  asyncLocalStorage.enterWith(context);
}

export function getUserIdFromContext(): number | undefined {
  return asyncLocalStorage.getStore()?.userId;
}

export function getTenantIdFromContext(): number | undefined {
  return asyncLocalStorage.getStore()?.tenantId;
}

export function getRolesFromContext(): string[] {
  return asyncLocalStorage.getStore()?.roles || [];
} 