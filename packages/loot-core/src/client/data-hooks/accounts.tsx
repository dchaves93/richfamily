import React, { createContext, useContext, useMemo } from 'react';

import q from 'loot-core/src/client/query-helpers';
import { useLiveQuery } from 'loot-core/src/client/query-hooks';
import { getAccountsById } from 'loot-core/src/client/reducers/queries';

export function useAccounts() {
  return useLiveQuery(useMemo(() => q('accounts').select('*'), []));
}

let AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  let data = useAccounts();
  return <AccountsContext.Provider value={data} children={children} />;
}

export function CachedAccounts({ children, idKey }) {
  let data = useCachedAccounts({ idKey });
  return children(data);
}

export function useCachedAccounts({ idKey }: { idKey? } = {}) {
  let data = useContext(AccountsContext);
  return idKey && data ? getAccountsById(data) : data;
}
