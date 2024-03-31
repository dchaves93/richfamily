import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import memoizeOne from 'memoize-one';
import { useDebounceCallback } from 'usehooks-ts';

import {
  getPayees,
  markAccountRead,
  syncAndDownload,
} from 'loot-core/client/actions';
import { SchedulesProvider } from 'loot-core/client/data-hooks/schedules';
import * as queries from 'loot-core/client/queries';
import { pagedQuery } from 'loot-core/client/query-helpers';
import { listen } from 'loot-core/platform/client/fetch';
import { isPreviewId } from 'loot-core/shared/transactions';

import { useDateFormat } from '../../../hooks/useDateFormat';
import { useLocalPref } from '../../../hooks/useLocalPref';
import { useNavigate } from '../../../hooks/useNavigate';
import { usePreviewTransactions } from '../../../hooks/usePreviewTransactions';
import { theme } from '../../../style';
import { View } from '../../common/View';
import { Page } from '../../Page';
import { MobileBackButton } from '../MobileBackButton';
import { AddTransactionButton } from '../transactions/AddTransactionButton';
import { TransactionListWithBalances } from '../transactions/TransactionListWithBalances';

export function AccountTransactions({ account, pending, failed }) {
  return (
    <Page
      title={
        !account.bankId ? (
          account.name
        ) : (
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <div
              style={{
                margin: 'auto',
                marginRight: 3,
                width: 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: pending
                  ? theme.sidebarItemBackgroundPending
                  : failed
                    ? theme.sidebarItemBackgroundFailed
                    : theme.sidebarItemBackgroundPositive,
                transition: 'transform .3s',
              }}
            />
            {account.name}
          </View>
        )
      }
      headerLeftContent={<MobileBackButton />}
      headerRightContent={
        <AddTransactionButton state={{ accountId: account.id }} />
      }
      padding={0}
      style={{
        flex: 1,
        backgroundColor: theme.mobilePageBackground,
      }}
    >
      <SchedulesProvider transform={getSchedulesTransform(account.id)}>
        <TransactionListWithPreviews account={account} />
      </SchedulesProvider>
    </Page>
  );
}

const getSchedulesTransform = memoizeOne(id => {
  const filter = queries.getAccountFilter(id, '_account');

  return q => {
    q = q.filter({ $and: [filter, { '_account.closed': false }] });
    return q.orderBy({ next_date: 'desc' });
  };
});

function TransactionListWithPreviews({ account }) {
  const [currentQuery, setCurrentQuery] = useState();
  const [isSearching, setIsSearching] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const prependTransactions = usePreviewTransactions();
  const allTransactions = useMemo(
    () =>
      !isSearching ? prependTransactions.concat(transactions) : transactions,
    [isSearching, prependTransactions, transactions],
  );

  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const [_numberFormat] = useLocalPref('numberFormat');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onRefresh = async () => {
    await dispatch(syncAndDownload(account.id));
  };

  const makeRootQuery = useCallback(
    () => queries.makeTransactionsQuery(account.id).options({ splits: 'none' }),
    [account.id],
  );

  const paged = useRef(null);

  const updateQuery = useCallback(query => {
    paged.current?.unsubscribe();
    paged.current = pagedQuery(
      query.options({ splits: 'none' }).select('*'),
      data => setTransactions(data),
      { pageCount: 10 },
    );
  }, []);

  const fetchTransactions = useCallback(async () => {
    const query = makeRootQuery();
    setCurrentQuery(query);
    updateQuery(query);
  }, [makeRootQuery, updateQuery]);

  useEffect(() => {
    let unlisten;

    async function setUpAccount() {
      unlisten = listen('sync-event', ({ type, tables }) => {
        if (type === 'applied') {
          if (
            tables.includes('transactions') ||
            tables.includes('category_mapping') ||
            tables.includes('payee_mapping')
          ) {
            paged.current?.run();
          }

          if (tables.includes('payees') || tables.includes('payee_mapping')) {
            dispatch(getPayees());
          }
        }
      });

      await fetchTransactions();

      dispatch(markAccountRead(account.id));
    }

    setUpAccount();

    return () => unlisten();
  }, [account.id, dispatch, fetchTransactions]);

  const updateSearchQuery = useDebounceCallback(
    useCallback(
      searchText => {
        if (searchText === '' && currentQuery) {
          updateQuery(currentQuery);
        } else if (searchText && currentQuery) {
          updateQuery(
            queries.makeTransactionSearchQuery(
              currentQuery,
              searchText,
              dateFormat,
            ),
          );
        }

        setIsSearching(searchText !== '');
      },
      [currentQuery, dateFormat, updateQuery],
    ),
    150,
  );

  const onSearch = text => {
    updateSearchQuery(text);
  };

  const onSelectTransaction = transaction => {
    // details of how the native app used to handle preview transactions here can be found at commit 05e58279
    if (!isPreviewId(transaction.id)) {
      navigate(`/transactions/${transaction.id}`);
    }
  };

  const onLoadMore = () => {
    paged.current?.fetchNext();
  };

  const balance = queries.accountBalance(account);
  const balanceCleared = queries.accountBalanceCleared(account);
  const balanceUncleared = queries.accountBalanceUncleared(account);

  return (
    <TransactionListWithBalances
      transactions={allTransactions}
      balance={balance}
      balanceCleared={balanceCleared}
      balanceUncleared={balanceUncleared}
      onLoadMore={onLoadMore}
      searchPlaceholder={`Search ${account.name}`}
      onSearch={onSearch}
      onSelectTransaction={onSelectTransaction}
      onRefresh={onRefresh}
    />
  );
}
