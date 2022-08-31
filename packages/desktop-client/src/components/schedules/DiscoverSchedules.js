import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import q, { runQuery } from 'loot-core/src/client/query-helpers';
import Platform from 'loot-core/src/client/platform';
import { send } from 'loot-core/src/platform/client/fetch';
import {
  View,
  Stack,
  Button,
  ButtonWithLoading,
  P
} from 'loot-design/src/components/common';
import {
  Table,
  TableHeader,
  Row,
  Field,
  SelectCell
} from 'loot-design/src/components/table';
import { getRecurringDescription } from 'loot-core/src/shared/schedules';
import { colors } from 'loot-design/src/style';
import useSelected, {
  useSelectedDispatch,
  useSelectedItems,
  SelectedProvider
} from 'loot-design/src/components/useSelected';
import { Page } from '../Page';
import DisplayId from '../util/DisplayId';
import { ScheduleAmountCell } from './SchedulesTable';

let ROW_HEIGHT = 43;

function DiscoverSchedulesTable({ schedules, loading }) {
  let selectedItems = useSelectedItems();
  let dispatchSelected = useSelectedDispatch();

  function renderItem({ item }) {
    let selected = selectedItems.has(item.id);
    let amountOp = item._conditions.find(c => c.field === 'amount').op;
    let recurDescription = getRecurringDescription(item.date);

    return (
      <Row
        height={ROW_HEIGHT}
        inset={15}
        backgroundColor="transparent"
        onClick={() => {
          dispatchSelected({ type: 'select', id: item.id });
        }}
        borderColor={selected ? colors.b8 : colors.border}
        style={{
          cursor: 'pointer',
          backgroundColor: selected ? colors.selected : 'white',
          ':hover': {
            backgroundColor: selected ? colors.selected : colors.hover
          }
        }}
      >
        <SelectCell
          exposed={true}
          focused={false}
          selected={selected}
          onSelect={() => {
            dispatchSelected({ type: 'select', id: item.id });
          }}
        />
        <Field width="flex">
          <DisplayId type="payees" id={item.payee} />
        </Field>
        <Field width="flex">
          <DisplayId type="accounts" id={item.account} />
        </Field>
        <Field width="auto" title={recurDescription} style={{ flex: 1.5 }}>
          {recurDescription}
        </Field>
        <ScheduleAmountCell amount={item.amount} op={amountOp} />
      </Row>
    );
  }
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <TableHeader height={ROW_HEIGHT} inset={15} version="v2">
        <SelectCell
          exposed={true}
          focused={false}
          selected={selectedItems.size > 0}
          onSelect={() => dispatchSelected({ type: 'select-all' })}
        />
        <Field width="flex">{t('general.payee_one')}</Field>
        <Field width="flex">{t('general.account_one')}</Field>
        <Field width="auto" style={{ flex: 1.5 }}>
          {t('general.when')}
        </Field>
        <Field width={100} style={{ textAlign: 'right' }}>
          {t('general.amount')}
        </Field>
      </TableHeader>
      <Table
        rowHeight={ROW_HEIGHT}
        backgroundColor="transparent"
        version="v2"
        style={{ flex: 1, backgroundColor: 'transparent' }}
        items={schedules}
        loading={loading}
        isSelected={id => selectedItems.has(id)}
        renderItem={renderItem}
        renderEmpty={t('schedules.noSchedulesFound')}
      />
    </View>
  );
}

export default function DiscoverSchedules() {
  let location = useLocation();
  let history = useHistory();
  let [schedules, setSchedules] = useState();
  let [creating, setCreating] = useState(false);

  let selectedInst = useSelected('discover-schedules', schedules, []);

  useEffect(() => {
    async function run() {
      setSchedules(await send('schedule/discover'));
    }
    run();
  }, []);

  async function onCreate() {
    let items = selectedInst.items;
    let selected = schedules.filter(s => selectedInst.items.has(s.id));
    setCreating(true);

    for (let schedule of selected) {
      let scheduleId = await send('schedule/create', {
        conditions: schedule._conditions
      });

      // Now query for matching transactions and link them automatically
      let { filters } = await send('make-filters-from-conditions', {
        conditions: schedule._conditions
      });

      if (filters.length > 0) {
        let { data: transactions } = await runQuery(
          q('transactions')
            .filter({ $and: filters })
            .select('id')
        );
        await send('transactions-batch-update', {
          updated: transactions.map(t => ({
            id: t.id,
            schedule: scheduleId
          }))
        });
      }
    }

    setCreating(false);
    history.goBack();
  }
  const { t } = useTranslation();

  return (
    <Page
      title={t('schedules.foundSchedules')}
      modalSize={{ width: 850, height: 650 }}
    >
      <P>{t('schedules.foundSomePossibleSchedulesAdvice')}</P>
      <P>{t('schedules.expectedSchedulesAdvice')}</P>
      <P>
        {Platform.isBrowser
          ? t('schedules.doFromFindSchedules')
          : t('schedules.doFromToolsFindSchedules')}
      </P>

      <SelectedProvider instance={selectedInst}>
        <DiscoverSchedulesTable
          loading={schedules == null}
          schedules={schedules}
        />
      </SelectedProvider>

      <Stack
        direction="row"
        align="center"
        justify="flex-end"
        style={{ paddingTop: 20 }}
      >
        <Button onClick={() => history.goBack()}>
          {t('general.doNothing')}
        </Button>
        <ButtonWithLoading
          primary
          loading={creating}
          disabled={selectedInst.items.size === 0}
          onClick={onCreate}
        >
          {t('schedules.createSchedule', { count: selectedInst.items.size })}
        </ButtonWithLoading>
      </Stack>
    </Page>
  );
}
