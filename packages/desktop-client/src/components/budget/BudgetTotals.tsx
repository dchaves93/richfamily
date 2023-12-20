import React, { type ComponentProps, memo, useState } from 'react';
import { useSelector } from 'react-redux';

import DotsHorizontalTriple from '../../icons/v1/DotsHorizontalTriple';
import { theme, styles } from '../../style';
import Button from '../common/Button';
import ToggleMenu from '../common/ToggleMenu';
import View from '../common/View';
import { Tooltip } from '../tooltips';

import type RenderMonths from './RenderMonths';

type BudgetTotalsProps = {
  MonthComponent: ComponentProps<typeof RenderMonths>['component'];
  toggleHiddenCategories: () => void;
  expandAllCategories: () => void;
  collapseAllCategories: () => void;
};

const BudgetTotals = memo(function BudgetTotals({
  MonthComponent,
  toggleHiddenCategories,
  expandAllCategories,
  collapseAllCategories,
}: BudgetTotalsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showHiddenCategories =
    useSelector(state => state.prefs.local?.['budget.showHiddenCategories']) ||
    false;

  return (
    <View
      data-testid="budget-totals"
      style={{
        backgroundColor: theme.tableBackground,
        flexDirection: 'row',
        flexShrink: 0,
        boxShadow: styles.cardShadow,
        marginLeft: 5,
        marginRight: 5,
        borderRadius: '4px 4px 0 0',
        borderBottom: '1px solid ' + theme.tableBorder,
      }}
    >
      <View
        style={{
          width: 200,
          color: theme.pageTextLight,
          justifyContent: 'center',
          paddingLeft: 15,
          paddingRight: 5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <View style={{ flexGrow: '1' }}>Category</View>
        <Button
          type="bare"
          aria-label="Menu"
          onClick={() => {
            setMenuOpen(true);
          }}
          style={{ color: 'currentColor', padding: 3 }}
        >
          <DotsHorizontalTriple
            width={15}
            height={15}
            style={{ color: theme.pageTextLight }}
          />
          {menuOpen && (
            <Tooltip
              position="bottom-right"
              width={200}
              style={{ padding: 0 }}
              onClose={() => {
                setMenuOpen(false);
              }}
            >
              <ToggleMenu
                onMenuSelect={type => {
                  if (type === 'toggle-visibility') {
                    toggleHiddenCategories();
                  } else if (type === 'expandAllCategories') {
                    expandAllCategories();
                    setMenuOpen(false);
                  } else if (type === 'collapseAllCategories') {
                    collapseAllCategories();
                    setMenuOpen(false);
                  }
                }}
                items={[
                  {
                    name: 'toggle-visibility',
                    text: 'Show hidden',
                    toggle: true,
                    isOn: showHiddenCategories,
                  },
                  {
                    name: 'expandAllCategories',
                    text: 'Expand all',
                  },
                  {
                    name: 'collapseAllCategories',
                    text: 'Collapse all',
                  },
                ]}
              />
            </Tooltip>
          )}
        </Button>
      </View>
    </View>
  );
});

export default BudgetTotals;
