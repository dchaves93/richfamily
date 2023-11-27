import * as d from 'date-fns';

import q, { runQuery } from 'loot-core/src/client/query-helpers';
import { send } from 'loot-core/src/platform/client/fetch';
import * as monthUtils from 'loot-core/src/shared/months';
import { integerToAmount } from 'loot-core/src/shared/util';

import recalculate from './recalculate';

export default function createSpreadsheet(
  start,
  end,
  groupBy,
  balanceTypeOp,
  categories,
  selectedCategories,
  payees,
  accounts,
  conditions = [],
  conditionsOp,
  hidden,
  uncat,
  setDataCheck,
) {
  let uncatCat = {
    name: 'Uncategorized',
    id: null,
    uncat_id: '1',
    hidden: 0,
    offBudget: false,
  };
  let uncatTransfer = {
    name: 'Transfers',
    id: null,
    uncat_id: '2',
    hidden: 0,
    transfer: false,
  };
  let uncatOff = {
    name: 'OffBudget',
    id: null,
    uncat_id: '3',
    hidden: 0,
    offBudget: true,
  };

  let uncatGroup = {
    name: 'Uncategorized',
    id: null,
    hidden: 0,
    categories: [uncatCat, uncatTransfer, uncatOff],
  };
  let catList = uncat
    ? [...categories.list, uncatCat, uncatTransfer, uncatOff]
    : categories.list;
  let catGroup = uncat
    ? [...categories.grouped, uncatGroup]
    : categories.grouped;

  let categoryFilter = (catList || []).filter(
    category =>
      !category.hidden &&
      selectedCategories &&
      selectedCategories.some(
        selectedCategory => selectedCategory.id === category.id,
      ),
  );

  let groupByList;
  let groupByLabel;
  switch (groupBy) {
    case 'Category':
      groupByList = catList;
      groupByLabel = 'category';
      break;
    case 'Group':
      groupByList = catGroup;
      groupByLabel = 'category_group';
      break;
    case 'Payee':
      groupByList = payees;
      groupByLabel = 'payee';
      break;
    case 'Account':
      groupByList = accounts;
      groupByLabel = 'account';
      break;
    case 'Month':
      groupByList = catList;
      groupByLabel = 'category';
      break;
    case 'Year':
      groupByList = catList;
      groupByLabel = 'category';
      break;
    default:
  }

  return async (spreadsheet, setData) => {
    if (groupByList.length === 0) {
      return null;
    }

    let { filters } = await send('make-filters-from-conditions', {
      conditions: conditions.filter(cond => !cond.customName),
    });
    const conditionsOpKey = conditionsOp === 'or' ? '$or' : '$and';

    function makeQuery2(name) {
      let query = q('transactions')
        .filter(
          //Show Offbudget and hidden categories
          !hidden && {
            $and: [
              {
                'account.offbudget': false,
                $or: [
                  {
                    'category.hidden': false,
                    category: null,
                  },
                ],
              },
            ],
            $or: [
              {
                'payee.transfer_acct.offbudget': true,
                'payee.transfer_acct': null,
              },
            ],
          },
        )
        //Apply Category_Selector
        .filter(
          selectedCategories && {
            $or: [
              {
                category: null,
                $or: categoryFilter.map(category => ({
                  category: category.id,
                })),
              },
            ],
          },
        )
        //Apply filters and split by "Group By"
        .filter({
          [conditionsOpKey]: [...filters],
        })
        //Apply month range filters
        .filter({
          $and: [
            { date: { $transform: '$month', $gte: start } },
            { date: { $transform: '$month', $lte: end } },
          ],
        })
        //Show assets or debts
        .filter(
          name === 'assets' ? { amount: { $gt: 0 } } : { amount: { $lt: 0 } },
        );

      return query
        .groupBy([
          { $month: '$date' },
          { $id: '$account' },
          { $id: '$payee' },
          { $id: '$category' },
        ])
        .select([
          { date: { $month: '$date' } },
          { category: { $id: '$category.id' } },
          { category_group: { $id: '$category.group.id' } },
          { account: { $id: '$account' } },
          { payee: { $id: '$payee' } },
          { amount: { $sum: '$amount' } },
        ]);
    }

    const [assets, debts] = await Promise.all([
      runQuery(makeQuery2('assets')).then(({ data }) => data),
      runQuery(makeQuery2('debts')).then(({ data }) => data),
    ]);

    const months = monthUtils.rangeInclusive(start, end);

    let totalAssets = 0;
    let totalDebts = 0;

    const monthData = months.reduce((arr, month) => {
      let perMonthAssets = 0;
      let perMonthDebts = 0;
      let stacked = {};

      groupByList.map(item => {
        let stackAmounts = 0;

        let monthAssets = assets
          .filter(
            asset => asset.date === month && asset[groupByLabel] === item.id,
          )
          .reduce((a, v) => (a = a + v.amount), 0);
        perMonthAssets += monthAssets;

        let monthDebts = debts
          .filter(
            debts => debts.date === month && debts[groupByLabel] === item.id,
          )
          .reduce((a, v) => (a = a + v.amount), 0);
        perMonthDebts += monthDebts;

        if (balanceTypeOp === 'totalAssets') {
          stackAmounts += monthAssets;
        }
        if (balanceTypeOp === 'totalDebts') {
          stackAmounts += monthDebts;
        }
        if (stackAmounts !== 0) {
          stacked[item.name] = integerToAmount(Math.abs(stackAmounts));
        }

        return null;
      });
      totalAssets += perMonthAssets;
      totalDebts += perMonthDebts;

      arr.push({
        // eslint-disable-next-line rulesdir/typography
        date: d.format(d.parseISO(`${month}-01`), "MMM ''yy"),
        ...stacked,
        totalDebts: integerToAmount(perMonthDebts),
        totalAssets: integerToAmount(perMonthAssets),
        totalTotals: integerToAmount(perMonthDebts + perMonthAssets),
      });

      return arr;
    }, []);

    let calcData;

    calcData = groupByList.map(item => {
      const calc = recalculate(item, months, assets, debts, groupByLabel);
      return { ...calc };
    });

    setData({
      data: calcData,
      monthData,
      start,
      end,
      totalDebts: integerToAmount(totalDebts),
      totalAssets: integerToAmount(totalAssets),
      totalTotals: integerToAmount(totalAssets + totalDebts),
    });
    setDataCheck?.(true);
  };
}
