import * as d from 'date-fns';

import { integerToAmount } from 'loot-core/src/shared/util';

function recalculate(item, months, assets, debts, groupByLabel) {
  let totalAssets = 0;
  let totalDebts = 0;
  const monthData = months.reduce((arr, month) => {
    let monthAssets = assets
      .filter(asset => asset[groupByLabel] === item.id && asset.date === month)
      .reduce((a, v) => (a = a + v.amount), 0);
    totalAssets += monthAssets;

    let monthDebts = debts
      .filter(debts => debts[groupByLabel] === item.id && debts.date === month)
      .reduce((a, v) => (a = a + v.amount), 0);
    totalDebts += monthDebts;

    const dateParse = d.parseISO(`${month}-01`);
    //const change = last ? total - amountToInteger(last.totalTotals) : 0;

    arr.push({
      dateParse,
      totalAssets: integerToAmount(monthAssets),
      totalDebts: integerToAmount(monthDebts),
      totalTotals: integerToAmount(monthAssets + monthDebts),
      // eslint-disable-next-line rulesdir/typography
      date: d.format(dateParse, "MMM ''yy"),
      dateLookup: month,
    });

    return arr;
  }, []);

  return {
    id: item.id,
    name: item.name,
    totalAssets: integerToAmount(totalAssets),
    totalDebts: integerToAmount(totalDebts),
    totalTotals: integerToAmount(totalAssets + totalDebts),
    monthData,
  };
}

export default recalculate;
