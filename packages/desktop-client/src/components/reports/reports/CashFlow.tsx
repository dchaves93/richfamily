import React, { useState, useEffect, useMemo } from 'react';

import * as d from 'date-fns';

import { send } from 'loot-core/src/platform/client/fetch';
import * as monthUtils from 'loot-core/src/shared/months';
import { integerToCurrency } from 'loot-core/src/shared/util';

import useFilters from '../../../hooks/useFilters';
import { theme, styles } from '../../../style';
import AlignedText from '../../common/AlignedText';
import Block from '../../common/Block';
import Paragraph from '../../common/Paragraph';
import Text from '../../common/Text';
import View from '../../common/View';
import PrivacyFilter from '../../PrivacyFilter';
import Change from '../Change';
import CashFlowGraph from '../graphs/CashFlowGraph';
import Header from '../Header';
import { cashFlowByDate } from '../spreadsheets/cash-flow-spreadsheet';
import useReport from '../useReport';

export default function CashFlow(): JSX.Element {
  const {
    filters,
    conditionsOp,
    onApply: onApplyFilter,
    onDelete: onDeleteFilter,
    onUpdate: onUpdateFilter,
    onCondOpChange,
  } = useFilters();

  const [allMonths, setAllMonths] = useState(null);
  const [allForecasts, setAllForecasts] = useState(null);
  const [disabled, setDisabled] = useState([]);
  const [start, setStart] = useState(
    monthUtils.subMonths(monthUtils.currentMonth(), 5),
  );
  const [end, setEnd] = useState(monthUtils.currentDay());
  const [forecast, setForecast] = useState(monthUtils.addDays(monthUtils.currentDay(), 31));

  const [isConcise, setIsConcise] = useState(() => {
    const numDays = d.differenceInCalendarDays(
      d.parseISO(end),
      d.parseISO(start),
    );
    return numDays > 31 * 3;
  });

  const params = useMemo(
    () => cashFlowByDate(start, end, forecast, isConcise, filters, conditionsOp),
    [start, end, forecast, isConcise, filters, conditionsOp],
  );
  const data = useReport('cash_flow', params);

  const forecastMonths = [
    {name: monthUtils.currentMonth(), pretty: "None"},
    {name: monthUtils.addDays(monthUtils.currentDay(), 31), pretty: "1 Month"},
    {name: monthUtils.addDays(monthUtils.currentDay(), 3*31), pretty: "3 Months"},
    {name: monthUtils.addDays(monthUtils.currentDay(), 6*31), pretty: "6 Months"},
    {name: monthUtils.addDays(monthUtils.currentDay(), 12*31), pretty: "12 Months"},
    {name: monthUtils.addDays(monthUtils.currentDay(), 24*31), pretty: "24 Months"},
  ]

  useEffect(() => {
    async function run() {
      const trans = await send('get-earliest-transaction');
      const earliestMonth = trans
        ? monthUtils.monthFromDate(d.parseISO(trans.date))
        : monthUtils.currentMonth();

      const allMonths = monthUtils
        .rangeInclusive(earliestMonth, monthUtils.currentMonth())
        .map(month => ({
          name: month,
          pretty: monthUtils.format(month, 'MMMM, yyyy'),
        }))
        .reverse();

      setAllMonths(allMonths);
      setAllForecasts(forecastMonths);
    }
    run();
  }, []);

  function onChangeDates(start, end, forecast) {
    const numDays = d.differenceInCalendarDays(
      d.parseISO(end),
      d.parseISO(start),
    );
    const isConcise = numDays > 31 * 3;

    let endDay = end + '-31';
    if (endDay > monthUtils.currentDay()) {
      endDay = monthUtils.currentDay();
    }

    setStart(start + '-01');
    setEnd(endDay);
    setForecast(forecast);
    setIsConcise(isConcise);
    end != monthUtils.currentMonth() ? setDisabled(forecastMonths.slice(1).map(forecast => (
      forecast.name
    ))) : setDisabled([]);
  }

  if (!allMonths || !data || !allForecasts) {
    return null;
  }

  const { graphData, totalExpenses, totalIncome, totalTransfers } = data;

  return (
    <View style={{ ...styles.page, minWidth: 650, overflow: 'hidden' }}>
      <Header
        title="Cash Flow"
        allMonths={allMonths}
        allForecasts={allForecasts}
        disabled={disabled}
        start={monthUtils.getMonth(start)}
        end={monthUtils.getMonth(end)}
        show1Month
        forecast={forecast}
        onChangeDates={onChangeDates}
        onApply={onApplyFilter}
        filters={filters}
        onUpdateFilter={onUpdateFilter}
        onDeleteFilter={onDeleteFilter}
        conditionsOp={conditionsOp}
        onCondOpChange={onCondOpChange}
        headerPrefixItems={undefined}
        selectGraph={undefined}
      />
      <View
        style={{
          backgroundColor: theme.tableBackground,
          padding: 30,
          paddingTop: 0,
          overflow: 'auto',
        }}
      >
        <View
          style={{
            paddingTop: 20,
            paddingRight: 20,
            flexShrink: 0,
            alignItems: 'flex-end',
            color: theme.pageText,
          }}
        >
          <AlignedText
            style={{ marginBottom: 5, minWidth: 160 }}
            left={<Block>Income:</Block>}
            right={
              <Text style={{ fontWeight: 600 }}>
                <PrivacyFilter>{integerToCurrency(totalIncome)}</PrivacyFilter>
              </Text>
            }
          />

          <AlignedText
            style={{ marginBottom: 5, minWidth: 160 }}
            left={<Block>Expenses:</Block>}
            right={
              <Text style={{ fontWeight: 600 }}>
                <PrivacyFilter>
                  {integerToCurrency(totalExpenses)}
                </PrivacyFilter>
              </Text>
            }
          />

          <AlignedText
            style={{ marginBottom: 5, minWidth: 160 }}
            left={<Block>Transfers:</Block>}
            right={
              <Text style={{ fontWeight: 600 }}>
                <PrivacyFilter>
                  {integerToCurrency(totalTransfers)}
                </PrivacyFilter>
              </Text>
            }
          />
          <Text style={{ fontWeight: 600 }}>
            <PrivacyFilter>
              <Change amount={totalIncome + totalExpenses + totalTransfers} />
            </PrivacyFilter>
          </Text>
        </View>

        <CashFlowGraph graphData={graphData} isConcise={isConcise} />

        <View style={{ marginTop: 30 }}>
          <Paragraph>
            <strong>How is cash flow calculated?</strong>
          </Paragraph>
          <Paragraph>
            Cash flow shows the balance of your budgeted accounts over time, and
            the amount of expenses/income each day or month. Your budgeted
            accounts are considered to be “cash on hand,” so this gives you a
            picture of how available money fluctuates.
          </Paragraph>
        </View>
      </View>
    </View>
  );
}
