import React, { type ChangeEvent, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { createBudget } from 'loot-core/src/client/actions/budgets';
import { loggedIn } from 'loot-core/src/client/actions/user';
import { send } from 'loot-core/src/platform/client/fetch';

import { colors } from '../../../style';
import { View, Text, Button, ButtonWithLoading } from '../../common';

import { useBootstrapped, Title, Input } from './common';

export default function Login() {
  let dispatch = useDispatch();
  let [loginMethods, setLoginMethods] = useState(['password']);
  let [password, setPassword] = useState('');
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState(null);

  let { checked } = useBootstrapped();

  useEffect(() => {
    send('subscribe-get-login-methods')
      .then(({ methods }) => setLoginMethods(methods))
      .catch(error => setError(error));
  }, []);

  function getErrorMessage(error) {
    switch (error) {
      case 'invalid-password':
        return 'Invalid password';
      case 'network-failure':
        return 'Unable to contact the server';
      case 'internal-error':
        return 'Internal error';
      default:
        return `An unknown error occurred: ${error}`;
    }
  }

  async function onSubmitPassword(e) {
    e.preventDefault();
    if (password === '' || loading) {
      return;
    }

    setError(null);
    setLoading(true);
    let { error } = await send('subscribe-sign-in', { password });
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      dispatch(loggedIn());
    }
  }

  async function onSubmitOpenId(e) {
    e.preventDefault();

    let { error, redirect_url } = await send('subscribe-sign-in-openid', {
      return_url: window.location.origin,
    });
    if (error) {
      setError(error);
    } else {
      window.location.href = redirect_url;
    }
  }

  async function onDemo() {
    await dispatch(createBudget({ demoMode: true }));
  }

  if (!checked) {
    return null;
  }

  return (
    <View style={{ maxWidth: 450, marginTop: -30 }}>
      <Title text="Sign in to this Actual instance" />
      <Text
        style={{
          fontSize: 16,
          color: colors.n2,
          lineHeight: 1.4,
        }}
      >
        If you lost your password, you likely still have access to your server
        to manually reset it.
      </Text>

      {error && (
        <Text
          style={{
            marginTop: 20,
            color: colors.r4,
            borderRadius: 4,
            fontSize: 15,
          }}
        >
          {getErrorMessage(error)}
        </Text>
      )}

      {loginMethods.includes('password') && (
        <form
          style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}
          onSubmit={onSubmitPassword}
        >
          <Input
            autoFocus={true}
            placeholder="Password"
            type="password"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            style={{ flex: 1, marginRight: 10 }}
          />
          <ButtonWithLoading primary loading={loading} style={{ fontSize: 15 }}>
            Sign in
          </ButtonWithLoading>
        </form>
      )}

      {loginMethods.includes('openid') && (
        <form style={{ marginTop: 20 }} onSubmit={onSubmitOpenId}>
          <Button primary style={{ fontSize: 15 }}>
            Sign in with OpenId
          </Button>
        </form>
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 15,
        }}
      >
        <Button
          bare
          style={{ fontSize: 15, color: colors.b4, marginLeft: 10 }}
          onClick={onDemo}
        >
          Try Demo &rarr;
        </Button>
      </View>
    </View>
  );
}
