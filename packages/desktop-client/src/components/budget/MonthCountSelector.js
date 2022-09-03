import React from 'react';
import { useTranslation } from 'react-i18next';

import { useBudgetMonthCount } from 'loot-design/src/components/budget/BudgetMonthCountContext';
import { View } from 'loot-design/src/components/common';
import { colors } from 'loot-design/src/style';
import CalendarIcon from 'loot-design/src/svg/v2/Calendar';

function Calendar({ color, onClick }) {
  return (
    <CalendarIcon
      style={{ width: 13, height: 13, color: color, marginRight: 5 }}
      onClick={onClick}
    />
  );
}

export function MonthCountSelector({ maxMonths, onChange }) {
  let { displayMax } = useBudgetMonthCount();

  let style = { width: 15, height: 15, color: colors.n8 };
  let activeStyle = { color: colors.n5 };

  // It doesn't make sense to show anything if we can only fit one
  // month
  if (displayMax <= 1) {
    return null;
  }

  let calendars = [];
  for (let i = 1; i <= displayMax; i++) {
    calendars.push(
      <Calendar
        key={i}
        color={maxMonths >= i ? colors.n5 : colors.n8}
        onClick={() => onChange(i)}
      />
    );
  }

  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        marginRight: 20,
        marginTop: -1,
        '& svg': {
          transition: 'transform .15s'
        },
        '& svg:hover': {
          transform: 'scale(1.2)'
        }
      }}
      title={t('budget.chooseNumberMonths')}
    >
      {calendars}
    </View>
  );
}
