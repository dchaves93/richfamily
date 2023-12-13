import React from 'react';

import { css } from 'glamor';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import usePrivacyMode from 'loot-core/src/client/privacy';
import { amountToCurrency } from 'loot-core/src/shared/util';

import { theme } from '../../../style';
import { type CSSProperties } from '../../../style';
import AlignedText from '../../common/AlignedText';
import PrivacyFilter from '../../PrivacyFilter';
import { getColorScale } from '../chart-theme';
import Container from '../Container';
import { type DataEntity } from '../entities';
import getCustomTick from '../getCustomTick';
import numberFormatterTooltip from '../numberFormatter';

type PayloadItem = {
  name: string;
  value: number;
  color: string;
  payload: {
    name: string;
    color: number | string;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    let sumTotals = 0;
    return (
      <div
        className={`${css({
          zIndex: 1000,
          pointerEvents: 'none',
          borderRadius: 2,
          boxShadow: '0 1px 6px rgba(0, 0, 0, .20)',
          backgroundColor: theme.menuBackground,
          color: theme.menuItemText,
          padding: 10,
        })}`}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <strong>{label}</strong>
          </div>
          <div style={{ lineHeight: 1.5 }}>
            <PrivacyFilter>
              {payload
                .slice(0)
                .reverse()
                .map(pay => {
                  sumTotals += pay.value;
                  return (
                    pay.value !== 0 && (
                      <AlignedText
                        key={pay.name}
                        left={pay.name}
                        right={amountToCurrency(pay.value)}
                        style={{ color: pay.color }}
                      />
                    )
                  );
                })}
              <AlignedText
                left={'Total'}
                right={amountToCurrency(sumTotals)}
                style={{
                  fontWeight: 600,
                }}
              />
            </PrivacyFilter>
          </div>
        </div>
      </div>
    );
  }
};

type CustomLegendProps = {
  payload?: PayloadItem[];
  OnChangeLegend;
};

const CustomLegend = ({ payload, OnChangeLegend }: CustomLegendProps) => {
  const agg = payload.map(leg => {
    return {
      name: leg.value,
      color: leg.color,
    };
  });

  OnChangeLegend(agg.slice(0).reverse());

  return <div />;
};

type StackedBarGraphProps = {
  style?: CSSProperties;
  data: DataEntity;
  compact?: boolean;
  OnChangeLegend;
};

function StackedBarGraph({
  style,
  data,
  compact,
  OnChangeLegend,
}: StackedBarGraphProps) {
  const privacyMode = usePrivacyMode();
  const colorScale = getColorScale('qualitative');

  return (
    <Container
      style={{
        ...style,
        ...(compact && { height: 'auto' }),
      }}
    >
      {(width, height, portalHost) =>
        data.monthData && (
          <ResponsiveContainer>
            <div>
              {!compact && <div style={{ marginTop: '15px' }} />}
              <BarChart
                width={width}
                height={height}
                data={data.monthData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                {!compact && (
                  <Legend
                    content={<CustomLegend OnChangeLegend={OnChangeLegend} />}
                  />
                )}
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={numberFormatterTooltip}
                  isAnimationActive={false}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: theme.pageText }}
                  tickLine={{ stroke: theme.pageText }}
                />
                {!compact && (
                  <YAxis
                    tickFormatter={value => getCustomTick(value, privacyMode)}
                    tick={{ fill: theme.pageText }}
                    tickLine={{ stroke: theme.pageText }}
                  />
                )}
                {data.data.reverse().map((c, index) => (
                  <Bar
                    key={c.name}
                    dataKey={c.name}
                    stackId="a"
                    fill={colorScale[index % colorScale.length]}
                  />
                ))}
              </BarChart>
            </div>
          </ResponsiveContainer>
        )
      }
    </Container>
  );
}

export default StackedBarGraph;
