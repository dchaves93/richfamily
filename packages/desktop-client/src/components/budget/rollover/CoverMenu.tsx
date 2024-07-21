import React, { useState } from 'react';

import { type CategoryGroupEntity } from 'loot-core/types/models/category-group';

import { useCategories } from '../../../hooks/useCategories';
import { CategoryAutocomplete } from '../../autocomplete/CategoryAutocomplete';
import { Button } from '../../common/Button2';
import { InitialFocus } from '../../common/InitialFocus';
import { View } from '../../common/View';
import { addToBeBudgetedGroup } from '../util';

function removeSelectedCategory(
  categoryGroups: CategoryGroupEntity[],
  selectedCategoryId?: string,
) {
  if (!selectedCategoryId) return categoryGroups;

  const newCategoryGroups: CategoryGroupEntity[] = JSON.parse(
    JSON.stringify(categoryGroups),
  );

  newCategoryGroups.forEach(group => {
    group.categories = group.categories?.filter(
      category => category.id !== selectedCategoryId,
    );
  });

  return newCategoryGroups.filter(g => g.categories?.length);
}

type CoverMenuProps = {
  showToBeBudgeted?: boolean;
  targetCategory?: string;
  onSubmit: (categoryId: string) => void;
  onClose: () => void;
};

export function CoverMenu({
  showToBeBudgeted = true,
  targetCategory,
  onSubmit,
  onClose,
}: CoverMenuProps) {
  const { grouped: originalCategoryGroups } = useCategories();
  const filteredCategoryGroups = originalCategoryGroups.filter(
    g => !g.is_income,
  );
  const categoryGroups = showToBeBudgeted
    ? addToBeBudgetedGroup(filteredCategoryGroups)
    : filteredCategoryGroups;
  const [categoryId, setCategoryId] = useState<string | null>(null);

  function submit() {
    if (categoryId) {
      onSubmit(categoryId);
    }
    onClose();
  }
  return (
    <View style={{ padding: 10 }}>
      <View style={{ marginBottom: 5 }}>Cover from category:</View>

      <InitialFocus>
        {node => (
          <CategoryAutocomplete
            categoryGroups={removeSelectedCategory(
              categoryGroups,
              targetCategory,
            )}
            value={categoryGroups.find(g => g.id === categoryId) ?? null}
            openOnFocus={true}
            onSelect={(id: string | undefined) => setCategoryId(id || null)}
            inputProps={{
              inputRef: node,
              onEnter: event => !event.defaultPrevented && submit(),
              placeholder: '(none)',
            }}
            showHiddenCategories={false}
          />
        )}
      </InitialFocus>

      <View
        style={{
          alignItems: 'flex-end',
          marginTop: 10,
        }}
      >
        <Button
          variant="primary"
          style={{
            fontSize: 12,
            paddingTop: 3,
          }}
          onPress={submit}
        >
          Transfer
        </Button>
      </View>
    </View>
  );
}
