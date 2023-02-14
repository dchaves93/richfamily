import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';

import { send } from 'loot-core/src/platform/client/fetch';

const ServerContext = createContext({});

export const useServerURL = () => useContext(ServerContext).url;
export const useServerVersion = () => useContext(ServerContext).version;
export const useSetServerURL = () => useContext(ServerContext).setURL;

async function getServerUrl() {
  let url = (await send('get-server-url')) || '';
  if (url === 'https://not-configured/') {
    url = '';
  }
  return url;
}

async function getServerVersion() {
  let { error, version } = await send('get-server-version');
  if (error) {
    return '';
  }
  return version;
}

export function ServerProvider({ children }) {
  let [serverURL, setServerURL] = useState('');
  let [version, setVersion] = useState('');

  useEffect(() => {
    async function run() {
      setServerURL(await getServerUrl());
      setVersion(await getServerVersion());
    }
    run();
  }, []);

  let setURL = useCallback(
    async url => {
      await send('set-server-url', { url });
      setServerURL(await getServerUrl());
      setVersion(await getServerVersion());
    },
    [setServerURL],
  );

  return (
    <ServerContext.Provider
      value={{
        url: serverURL,
        setURL,
        version: version ? `v${version}` : 'N/A',
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}
