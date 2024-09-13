import React, { useState, useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import * as d from 'date-fns';

import { addNotification } from 'loot-core/client/actions';
import { useWidget } from 'loot-core/client/data-hooks/widget';
import { send } from 'loot-core/src/platform/client/fetch';
import * as monthUtils from 'loot-core/src/shared/months';
import { amountToCurrency } from 'loot-core/src/shared/util';
import { type SpendingWidget } from 'loot-core/types/models';
import { type RuleConditionEntity } from 'loot-core/types/models/rule';

import { useFilters } from '../../../hooks/useFilters';
import { useNavigate } from '../../../hooks/useNavigate';
import { useResponsive } from '../../../ResponsiveProvider';
import { theme, styles } from '../../../style';
import { AlignedText } from '../../common/AlignedText';
import { Block } from '../../common/Block';
import { Button } from '../../common/Button2';
import { Paragraph } from '../../common/Paragraph';
import { Select } from '../../common/Select';
import { Text } from '../../common/Text';
import { Tooltip } from '../../common/Tooltip';
import { View } from '../../common/View';
import { AppliedFilters } from '../../filters/AppliedFilters';
import { FilterButton } from '../../filters/FiltersMenu';
import { MobileBackButton } from '../../mobile/MobileBackButton';
import { MobilePageHeader, Page, PageHeader } from '../../Page';
import { PrivacyFilter } from '../../PrivacyFilter';
import { SpendingGraph } from '../graphs/SpendingGraph';
import { LoadingIndicator } from '../LoadingIndicator';
import { ModeButton } from '../ModeButton';
import { calculateTimeRange } from '../reportRanges';
import { createSpendingSpreadsheet } from '../spreadsheets/spending-spreadsheet';
import { useReport } from '../useReport';
import { fromDateRepr } from '../util';

export function Spending() {
  const params = useParams();
  const { data: widget, isLoading } = useWidget<SpendingWidget>(
    params.id ?? '',
    'spending-card',
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return <SpendingInternal widget={widget} />;
}

type SpendingInternalProps = {
  widget: SpendingWidget;
};

function SpendingInternal({ widget }: SpendingInternalProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    conditions,
    conditionsOp,
    onApply: onApplyFilter,
    onDelete: onDeleteFilter,
    onUpdate: onUpdateFilter,
    onConditionsOpChange,
  } = useFilters<RuleConditionEntity>(
    widget?.meta?.conditions,
    widget?.meta?.conditionsOp,
  );

  const emptyIntervals: { name: string; pretty: string }[] = [];
  const [allIntervals, setAllIntervals] = useState(emptyIntervals);

  const initialReportMode = widget?.meta?.mode ?? 'single-month';
  const [initialStart, initialEnd, initialMode] = calculateTimeRange(
    widget?.meta?.timeFrame,
  );
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [mode, setMode] = useState(initialMode);

  const [dataCheck, setDataCheck] = useState(false);
  const [reportMode, setReportMode] = useState(initialReportMode);

  useEffect(() => {
    async function run() {
      const trans = await send('get-earliest-transaction');

      let earliestMonth = trans
        ? monthUtils.monthFromDate(d.parseISO(fromDateRepr(trans.date)))
        : monthUtils.currentMonth();

      // Make sure the month selects are at least populates with a
      // year's worth of months. We can undo this when we have fancier
      // date selects.
      const yearAgo = monthUtils.subMonths(monthUtils.currentMonth(), 12);
      if (earliestMonth > yearAgo) {
        earliestMonth = yearAgo;
      }

      const allMonths = monthUtils
        .rangeInclusive(earliestMonth, monthUtils.currentMonth())
        .map(month => ({
          name: month,
          pretty: monthUtils.format(month, 'MMMM, yyyy'),
        }))
        .reverse();

      setAllIntervals(allMonths);
    }
    run();
  }, []);

  const getGraphData = useMemo(() => {
    setDataCheck(false);
    return createSpendingSpreadsheet({
      conditions,
      conditionsOp,
      setDataCheck,
      compare: start,
      compareTo: end,
    });
  }, [conditions, conditionsOp, start, end]);

  const data = useReport('default', getGraphData);
  const navigate = useNavigate();
  const { isNarrowWidth } = useResponsive();

  async function onSaveWidget() {
    await send('dashboard-update-widget', {
      id: widget?.id,
      meta: {
        ...(widget.meta ?? {}),
        conditions,
        conditionsOp,
        timeFrame: {
          start,
          end,
          mode,
        },
        mode: reportMode,
      },
    });
    dispatch(
      addNotification({
        type: 'message',
        message: t('Dashboard widget successfully saved.'),
      }),
    );
  }

  if (!data) {
    return null;
  }

  const showAverage =
    data.intervalData[27].months[monthUtils.subMonths(start, 3)] &&
    Math.abs(
      data.intervalData[27].months[monthUtils.subMonths(start, 3)].cumulative,
    ) > 0;

  const todayDay =
    start !== monthUtils.currentMonth()
      ? 27
      : monthUtils.getDay(monthUtils.currentDay()) - 1 >= 28
        ? 27
        : monthUtils.getDay(monthUtils.currentDay()) - 1;

  const showCompareTo = Math.abs(data.intervalData[27].compareTo) > 0;
  const showCompare =
    start === monthUtils.currentMonth() ||
    Math.abs(data.intervalData[27].compare) > 0;

  const title = widget?.meta?.name ?? t('Monthly Spending');

  return (
    <Page
      header={
        isNarrowWidth ? (
          <MobilePageHeader
            title={title}
            leftContent={
              <MobileBackButton onPress={() => navigate('/reports')} />
            }
          />
        ) : (
          <PageHeader title={title} />
        )
      }
      padding={0}
    >
      <View
        style={{
          flexDirection: isNarrowWidth ? 'column' : 'row',
          alignItems: isNarrowWidth ? 'inherit' : 'center',
          padding: 20,
          paddingBottom: 0,
          flexShrink: 0,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginRight: 5,
            marginBottom: 5,
            marginTop: 5,
          }}
        >
          <Text
            style={{
              paddingRight: 5,
            }}
          >
            <Trans>Compare</Trans>
          </Text>
          <Select
            value={
              mode !== 'sliding-window' || reportMode === 'single-month'
                ? start
                : 'current-month'
            }
            onChange={newStart => {
              if (newStart === 'current-month') {
                setMode('sliding-window');
                setStart(monthUtils.currentMonth());
                return;
              }
              setMode('static');
              setStart(newStart);
            }}
            options={[
              ...(reportMode === 'single-month'
                ? []
                : [['current-month', t('Current Month')] as const]),
              ...allIntervals.map(
                ({ name, pretty }) => [name, pretty] as const,
              ),
            ]}
          />
          <Text
            style={{
              paddingRight: 5,
              paddingLeft: 5,
            }}
          >
            <Trans>to</Trans>
          </Text>
          <Select
            value={end}
            onChange={setEnd}
            options={allIntervals.map(({ name, pretty }) => [name, pretty])}
            disabled={reportMode !== 'single-month'}
          />
        </View>
        {!isNarrowWidth && (
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: theme.pillBorderDark,
              marginRight: 15,
              marginLeft: 10,
            }}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            marginRight: 5,
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <ModeButton
            selected={reportMode === 'single-month'}
            style={{
              backgroundColor: 'inherit',
            }}
            onSelect={() => {
              setMode('static');
              setReportMode('single-month');
            }}
          >
            <Trans>Single month</Trans>
          </ModeButton>
          <ModeButton
            selected={reportMode === 'budget'}
            onSelect={() => {
              setMode('sliding-window');
              setStart(monthUtils.currentMonth());
              setReportMode('budget');
            }}
            style={{
              backgroundColor: 'inherit',
            }}
          >
            <Trans>Budgeted</Trans>
          </ModeButton>
          <ModeButton
            selected={reportMode === 'average'}
            onSelect={() => {
              setMode('sliding-window');
              setStart(monthUtils.currentMonth());
              setReportMode('average');
            }}
            style={{
              backgroundColor: 'inherit',
            }}
          >
            <Trans>Average</Trans>
          </ModeButton>
        </View>
        {!isNarrowWidth && (
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: theme.pillBorderDark,
              marginRight: 10,
            }}
          />
        )}
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: 5,
            marginTop: 5,
            flex: 1,
          }}
        >
          <FilterButton
            onApply={onApplyFilter}
            compact={isNarrowWidth}
            hover={false}
            exclude={['date']}
          />
          <View style={{ flex: 1 }} />

          {widget && (
            <Tooltip
              placement="top end"
              content={
                <Text>
                  <Trans>Save compare and filter options</Trans>
                </Text>
              }
              style={{
                ...styles.tooltip,
                lineHeight: 1.5,
                padding: '6px 10px',
                marginLeft: 10,
              }}
            >
              <Button
                variant="primary"
                style={{
                  marginLeft: 10,
                }}
                onPress={onSaveWidget}
              >
                <Trans>Save</Trans>
              </Button>
            </Tooltip>
          )}
        </View>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingTop: 0,
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexGrow: 1,
          }}
        >
          {conditions && conditions.length > 0 && (
            <View
              style={{
                marginBottom: 10,
                marginLeft: 20,
                flexShrink: 0,
                flexDirection: 'row',
                spacing: 2,
              }}
            >
              <AppliedFilters
                conditions={conditions}
                onUpdate={onUpdateFilter}
                onDelete={onDeleteFilter}
                conditionsOp={conditionsOp}
                onConditionsOpChange={onConditionsOpChange}
              />
            </View>
          )}
          <View
            style={{
              backgroundColor: theme.tableBackground,
              padding: 20,
              paddingTop: 0,
              flex: '1 0 auto',
              overflowY: 'auto',
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                flexGrow: 1,
                padding: 10,
                paddingTop: 10,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <View style={{ flex: 1 }} />
                <View
                  style={{
                    alignItems: 'flex-end',
                    color: theme.pageText,
                  }}
                >
                  <View>
                    {showCompareTo && (
                      <AlignedText
                        style={{ marginBottom: 5, minWidth: 210 }}
                        left={
                          <Block>
                            Spent {monthUtils.format(start, 'MMM, yyyy')}
                            {start === monthUtils.currentMonth() && ' MTD'}:
                          </Block>
                        }
                        right={
                          <Text style={{ fontWeight: 600 }}>
                            <PrivacyFilter blurIntensity={5}>
                              {amountToCurrency(
                                Math.abs(data.intervalData[todayDay].compare),
                              )}
                            </PrivacyFilter>
                          </Text>
                        }
                      />
                    )}
                    {reportMode === 'single-month' && (
                      <AlignedText
                        style={{ marginBottom: 5, minWidth: 210 }}
                        left={
                          <Block>
                            Spent {monthUtils.format(end, 'MMM, yyyy')}:
                          </Block>
                        }
                        right={
                          <Text style={{ fontWeight: 600 }}>
                            <PrivacyFilter blurIntensity={5}>
                              {amountToCurrency(
                                Math.abs(data.intervalData[todayDay].compareTo),
                              )}
                            </PrivacyFilter>
                          </Text>
                        }
                      />
                    )}
                  </View>
                  <AlignedText
                    style={{ marginBottom: 5, minWidth: 210 }}
                    left={
                      <Block>
                        Budgeted
                        {start === monthUtils.currentMonth() && ' MTD'}:
                      </Block>
                    }
                    right={
                      <Text style={{ fontWeight: 600 }}>
                        <PrivacyFilter blurIntensity={5}>
                          {amountToCurrency(
                            Math.abs(data.intervalData[todayDay].budget),
                          )}
                        </PrivacyFilter>
                      </Text>
                    }
                  />
                  {showAverage && (
                    <AlignedText
                      style={{ marginBottom: 5, minWidth: 210 }}
                      left={
                        <Block>
                          Spent Average
                          {start === monthUtils.currentMonth() && ' MTD'}:
                        </Block>
                      }
                      right={
                        <Text style={{ fontWeight: 600 }}>
                          <PrivacyFilter blurIntensity={5}>
                            {amountToCurrency(
                              Math.abs(data.intervalData[todayDay].average),
                            )}
                          </PrivacyFilter>
                        </Text>
                      }
                    />
                  )}
                </View>
              </View>
              {!showCompare ||
              (reportMode === 'single-month' && !showCompareTo) ||
              (reportMode === 'average' && !showAverage) ? (
                <View style={{ marginTop: 20 }}>
                  <Trans>
                    <h1>Additional data required to generate graph</h1>
                    <Paragraph>
                      Currently, there is insufficient data to display selected
                      information regarding your spending. Please adjust
                      selection options to enable graph visualization.
                    </Paragraph>
                  </Trans>
                </View>
              ) : dataCheck ? (
                <SpendingGraph
                  style={{ flexGrow: 1 }}
                  compact={false}
                  data={data}
                  mode={reportMode}
                  compare={start}
                  compareTo={end}
                />
              ) : (
                <LoadingIndicator message={t('Loading report...')} />
              )}
              {showAverage && (
                <View style={{ marginTop: 30 }}>
                  <Trans>
                    <Paragraph>
                      <strong>
                        How are “Average” and “Spent Average MTD” calculated?
                      </strong>
                    </Paragraph>
                    <Paragraph>
                      They are both the average cumulative spending by day for
                      the three months before the selected “compare” month.
                    </Paragraph>
                  </Trans>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}
