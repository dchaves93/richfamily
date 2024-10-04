import React, { type ReactElement } from 'react';
import { Trans } from 'react-i18next';

import * as d from 'date-fns';
import { t } from 'i18next';

import { theme } from '../../style';
import { styles } from '../../style/styles';
import { Block } from '../common/Block';
import { Text } from '../common/Text';

type DateRangeProps = {
  start: string;
  end: string;
  type?: string;
};

function checkDate(date: string) {
  const dateParsed = new Date(date);
  if (dateParsed.toString() !== t('Invalid Date')) {
    return d.format(dateParsed, 'yyyy-MM-dd');
  } else {
    return null;
  }
}

export function DateRange({ start, end, type }: DateRangeProps): ReactElement {
  const checkStart = checkDate(start);
  const checkEnd = checkDate(end);

  let startDate;
  let endDate;
  if (checkStart && checkEnd) {
    startDate = d.parseISO(checkStart);
    endDate = d.parseISO(checkEnd);
  } else {
    return (
      <Text style={{ ...styles.mediumText, color: theme.errorText }}>
        <Trans>There was a problem loading your date range</Trans>
      </Text>
    );
  }

  const formattedStartDate = d.format(startDate, 'MMM yyyy');
  const formattedEndDate = d.format(endDate, 'MMM yyyy');
  const typeOrFormattedEndDate = ['budget', 'average'].includes(type)
    ? type
    : formattedEndDate;

  let content: string | ReactElement;
  if (['budget', 'average'].includes(type || '')) {
    content = (
      <div>
        <Trans
          values={{
            startDate: formattedStartDate,
            endDate: typeOrFormattedEndDate,
          }}
        >
          Compare {{ startDate }} to {{ endDate }}
        </Trans>
      </div>
    );
  } else if (
    startDate.getFullYear() !== endDate.getFullYear() ||
    startDate.getMonth() !== endDate.getMonth()
  ) {
    content = (
      <div>
        {type ? (
          <Trans
            values={{
              formattedStartDate,
              endDate: typeOrFormattedEndDate,
            }}
          >
            Compare {{ formattedStartDate }} to {{ endDate }}
          </Trans>
        ) : (
          <Trans>
            {{ formattedStartDate }} - {{ formattedEndDate }}
          </Trans>
        )}
      </div>
    );
  } else {
    content = formattedEndDate;
  }

  return <Block style={{ color: theme.pageTextSubdued }}>{content}</Block>;
}
