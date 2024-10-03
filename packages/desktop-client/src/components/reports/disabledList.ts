import { t } from 'i18next';

const intervalOptions = [
  {
    description: t('Daily'),
    defaultRange: t('This month'),
  },
  {
    description: t('Weekly'),
    defaultRange: t('Last 3 months'),
  },
  {
    description: t('Monthly'),
    defaultRange: t('Last 6 months'),
  },
  {
    description: t('Yearly'),
    defaultRange: t('Year to date'),
  },
];

const currentIntervalOptions = [
  {
    description: t('This week'),
    disableInclude: true,
  },
  {
    description: t('This month'),
    disableInclude: true,
  },
  {
    description: t('Year to date'),
    disableInclude: true,
  },
  {
    description: t('Last year'),
    disableInclude: true,
  },
  {
    description: t('All time'),
    disableInclude: true,
  },
];

type graphOptions = {
  description: string;
  disabledSplit: string[];
  defaultSplit: string;
  disabledType: string[];
  defaultType: string;
  disableLegend?: boolean;
  disableLabel?: boolean;
};
const totalGraphOptions: graphOptions[] = [
  {
    description: 'TableGraph',
    disabledSplit: [],
    defaultSplit: t('Category'),
    disabledType: [],
    defaultType: t('Payment'),
    disableLegend: true,
    disableLabel: true,
  },
  {
    description: 'BarGraph',
    disabledSplit: [],
    defaultSplit: t('Category'),
    disabledType: [],
    defaultType: t('Payment'),
  },
  {
    description: 'AreaGraph',
    disabledSplit: [t('Category'), t('Group'), t('Payee'), t('Account')],
    defaultSplit: t('Interval'),
    disabledType: [],
    defaultType: t('Payment'),
    disableLegend: true,
  },
  {
    description: 'DonutGraph',
    disabledSplit: [],
    defaultSplit: t('Category'),
    disabledType: ['Net'],
    defaultType: t('Payment'),
  },
];

const timeGraphOptions: graphOptions[] = [
  {
    description: 'TableGraph',
    disabledSplit: ['Interval'],
    defaultSplit: t('Category'),
    disabledType: [t('Net Payment'), t('Net Deposit')],
    defaultType: t('Payment'),
    disableLegend: true,
    disableLabel: true,
  },
  {
    description: 'StackedBarGraph',
    disabledSplit: [t('Interval')],
    defaultSplit: t('Category'),
    disabledType: [],
    defaultType: t('Payment'),
  },
  {
    description: 'LineGraph',
    disabledSplit: [t('Interval')],
    defaultSplit: t('Category'),
    disabledType: [],
    defaultType: t('Payment'),
    disableLegend: false,
    disableLabel: true,
  },
];

const modeOptions = [
  {
    description: 'total',
    graphs: totalGraphOptions,
    disabledGraph: ['LineGraph'],
    defaultGraph: 'TableGraph',
  },
  {
    description: 'time',
    graphs: timeGraphOptions,
    disabledGraph: ['AreaGraph', 'DonutGraph'],
    defaultGraph: 'TableGraph',
  },
];

export function disabledGraphList(
  item: string,
  newGraph: string,
  type: 'disabledSplit' | 'disabledType',
) {
  const graphList = modeOptions.find(d => d.description === item);
  if (!graphList) {
    return [];
  }

  const disabledList = graphList.graphs.find(e => e.description === newGraph);
  if (!disabledList) {
    return [];
  }

  return disabledList[type];
}

export function disabledLegendLabel(
  item: string,
  newGraph: string,
  type: 'disableLegend' | 'disableLabel',
) {
  const graphList = modeOptions.find(d => d.description === item);
  if (!graphList) {
    return false;
  }

  const disableLegendLabel = graphList.graphs.find(
    e => e.description === newGraph,
  );
  if (!disableLegendLabel) {
    return false;
  }

  return disableLegendLabel[type];
}

export function defaultsGraphList(
  item: string,
  newGraph: string,
  type: 'defaultSplit' | 'defaultType',
) {
  const graphList = modeOptions.find(d => d.description === item);
  if (!graphList) {
    return '';
  }

  const defaultItem = graphList.graphs.find(e => e.description === newGraph);
  if (!defaultItem) {
    return '';
  }

  return defaultItem[type];
}

export const disabledList = {
  mode: modeOptions,
  modeGraphsMap: new Map(
    modeOptions.map(item => [item.description, item.disabledGraph]),
  ),
  currentInterval: new Map(
    currentIntervalOptions.map(item => [item.description, item.disableInclude]),
  ),
};

export const defaultsList = {
  mode: modeOptions,
  modeGraphsMap: new Map(
    modeOptions.map(item => [item.description, item.defaultGraph]),
  ),
  intervalRange: new Map(
    intervalOptions.map(item => [item.description, item.defaultRange]),
  ),
};
