import React, { type ReactElement } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import * as d from 'date-fns';

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
  if (dateParsed.toString() !== 'Invalid Date') {
    return d.format(dateParsed, 'yyyy-MM-dd');
  } else {
    return null;
  }
}

export function DateRange({ start, end, type }: DateRangeProps): ReactElement {
  const checkStart = checkDate(start);
  const checkEnd = checkDate(end);

  const { t } = useTranslation();

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

  let content: string | ReactElement;
  if (['budget', 'average'].includes(type || '')) {
    content = (
      <div>
        <Trans>
          Compare {d.format(startDate, 'MMM yyyy')} to{' '}
          {type === 'budget' ? 'budgeted' : 'average'}
        </Trans>
      </div>
    );
  } else if (startDate.getFullYear() !== endDate.getFullYear()) {
    content = (
      <div>
        {type && t('Compare ')}
        {d.format(startDate, 'MMM yyyy')}
        {type ? t(' to ') : ' - '}
        {['budget', 'average'].includes(type || '')
          ? type
          : d.format(endDate, 'MMM yyyy')}
      </div>
    );
  } else if (startDate.getMonth() !== endDate.getMonth()) {
    content = (
      <div>
        {type && t('Compare ')}
        {d.format(startDate, 'MMM yyyy')}
        {type ? t(' to ') : ' - '}
        {['budget', 'average'].includes(type || '')
          ? type
          : d.format(endDate, 'MMM yyyy')}
      </div>
    );
  } else {
    content = d.format(endDate, 'MMMM yyyy');
  }

  return <Block style={{ color: theme.pageTextSubdued }}>{content}</Block>;
}
