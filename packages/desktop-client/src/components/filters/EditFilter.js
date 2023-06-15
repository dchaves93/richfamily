import React, { useEffect, useRef, useReducer } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { useFilters } from 'loot-core/src/client/data-hooks/filters';
import q, { liveQuery, runQuery } from 'loot-core/src/client/query-helpers';
import { send, sendCatch } from 'loot-core/src/platform/client/fetch';
import {
  mapField,
  friendlyOp,
  getFieldError,
  unparse,
} from 'loot-core/src/shared/rules';

import useSelected, { SelectedProvider } from '../../hooks/useSelected';
import AddIcon from '../../icons/v0/Add';
import SubtractIcon from '../../icons/v0/Subtract';
import { colors } from '../../style';
import SimpleTransactionsTable from '../accounts/SimpleTransactionsTable';
import { View, Text, Button, Stack, CustomSelect } from '../common';
import { FormField, FormLabel } from '../forms';
import { FieldSelect, ConditionsList } from '../modals/EditRule';
import { Page } from '../Page';
import { BetweenAmountInput } from '../util/AmountInput';
import GenericInput from '../util/GenericInput';

function getTransactionFields(conditions) {
  let fields = ['date'];

  if (conditions.find(c => c.field === 'imported_payee')) {
    fields.push('imported_payee');
  }

  fields.push('account');
  fields.push('payee');
  fields.push('category');
  fields.push('amount');

  return fields;
}

export function OpSelect({
  ops,
  type,
  style,
  value,
  formatOp = friendlyOp,
  onChange,
}) {
  // We don't support the `contains` operator for the id type for
  // rules yet
  if (type === 'id') {
    ops = ops.filter(op => op !== 'contains');
  }

  return (
    <CustomSelect
      options={ops.map(op => [op, formatOp(op, type)])}
      value={value}
      onChange={value => onChange('op', value)}
      style={style}
    />
  );
}

function EditorButtons({ onAdd, onDelete, style }) {
  return (
    <>
      {onDelete && (
        <Button
          bare
          onClick={onDelete}
          style={{ padding: 7 }}
          aria-label="Delete entry"
        >
          <SubtractIcon style={{ width: 8, height: 8 }} />
        </Button>
      )}
      {onAdd && (
        <Button
          bare
          onClick={onAdd}
          style={{ padding: 7 }}
          aria-label="Add entry"
        >
          <AddIcon style={{ width: 10, height: 10 }} />
        </Button>
      )}
    </>
  );
}

function FieldError({ type }) {
  return (
    <Text
      style={{
        fontSize: 12,
        textAlign: 'center',
        color: colors.r5,
        marginBottom: 5,
      }}
    >
      {getFieldError(type)}
    </Text>
  );
}

function Editor({ error, style, children }) {
  return (
    <View style={style} data-testid="editor-row">
      <Stack
        direction="row"
        align="center"
        spacing={1}
        style={{
          padding: '3px 5px',
        }}
      >
        {children}
      </Stack>
      {error && <FieldError type={error} />}
    </View>
  );
}

export function ConditionEditor({
  ops,
  condition,
  editorStyle,
  onChange,
  onDelete,
  onAdd,
}) {
  let { field, op, value, type, options, error } = condition;

  if (field === 'amount' && options) {
    if (options.inflow) {
      field = 'amount-inflow';
    } else if (options.outflow) {
      field = 'amount-outflow';
    }
  }

  let valueEditor;
  if (type === 'number' && op === 'isbetween') {
    valueEditor = (
      <BetweenAmountInput
        defaultValue={value}
        onChange={v => onChange('value', v)}
      />
    );
  } else {
    valueEditor = (
      <GenericInput
        field={field}
        type={type}
        value={value}
        multi={op === 'oneOf'}
        onChange={v => onChange('value', v)}
      />
    );
  }

  return (
    <Editor style={editorStyle} error={error}>
      <FieldSelect fields={conditionFields} value={field} onChange={onChange} />
      <OpSelect ops={ops} value={op} type={type} onChange={onChange} />

      <View style={{ flex: 1 }}>{valueEditor}</View>

      <Stack direction="row">
        <EditorButtons
          onAdd={onAdd}
          onDelete={field === 'date' ? null : onDelete}
        />
      </Stack>
    </Editor>
  );
}

// TODO:
// * Dont touch child transactions?

let conditionFields = [
  'imported_payee',
  'account',
  'category',
  'date',
  'payee',
  'notes',
  'amount',
]
  .map(field => [field, mapField(field)])
  .concat([
    ['amount-inflow', mapField('amount', { inflow: true })],
    ['amount-outflow', mapField('amount', { outflow: true })],
  ]);

export default function EditFilter() {
  //let [dispatch, setDispatch] = useState('');
  let { id } = useParams();
  let scrollableEl = useRef();
  let history = useHistory();
  let adding = id == null;
  let filters = useFilters();

  let [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'set-schedule': {
          let filter = action.filter;
          return {
            ...state,
            filter: {
              conditions: filter.conditions,
              conditionsOp: filter.conditions_op,
              name: filter.name,
              id: filter.id,
            },
          };
        }

        case 'set-field':
          let filter = { [action.field]: action.value };
          return {
            ...state,
            filter: { ...state.filter, ...filter },
          };

        case 'set-transactions':
          return { ...state, transactions: action.transactions };

        case 'form-error':
          return { ...state, error: action.error };

        default:
          throw new Error('Unknown action: ');
      }
    },
    {
      filter: { conditions: [] },
      error: null,
      transactions: [],
    },
  );

  async function loadFilter() {
    let { data } = await runQuery(
      q('transaction_filters').filter({ id }).select('*'),
    );
    return data[0];
  }

  //Set Modal (default values or pull edit data)
  useEffect(() => {
    // Flash the scrollbar
    if (scrollableEl.current) {
      let el = scrollableEl.current;
      let top = el.scrollTop;
      el.scrollTop = top + 1;
      el.scrollTop = top;
    }

    // Run it here
    async function run() {
      if (adding) {
        let filter = {
          name: 'None1',
          conditions_op: 'and',
          conditions: [{ op: 'is', field: 'payee', value: null, type: 'id' }],
        };

        dispatch({ type: 'set-schedule', filter });
      } else {
        let filter = await loadFilter();
        if (filter) {
          dispatch({ type: 'set-schedule', filter });
        }
      }
    }
    run();
  }, []);

  //Set Transactions preview table
  useEffect(() => {
    let unsubscribe;

    send('make-filters-from-conditions', {
      conditions: state.filter.conditions.map(unparse),
    }).then(({ filters }) => {
      if (filters.length > 0) {
        const conditionsOpKey =
          state.filter.conditionsOp === 'or' ? '$or' : '$and';
        let live = liveQuery(
          q('transactions')
            .filter({ [conditionsOpKey]: filters })
            .select('*'),
          data => dispatch({ type: 'set-transactions', transactions: data }),
        );
        unsubscribe = live.unsubscribe;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [state.filter.conditions, state.filter.conditionsOp]);

  let selectedInst = useSelected('transactions', state.transactions, []);

  async function onSave() {
    dispatch({ type: 'form-error', error: null });

    let res = await sendCatch(adding ? 'filter/create' : 'filter/update', {
      state: state.filter,
      filters,
    });

    if (res.error) {
      dispatch({
        type: 'form-error',
        error: res.error.message,
        //'An error occurred while saving. Please contact help@actualbudget.com for support.',
      });
    } else {
      history.goBack();
    }
  }

  let editorStyle = {
    backgroundColor: colors.n10,
    borderRadius: 4,
  };

  return (
    <Page title="Custom Filter" modalSize="medium">
      <Stack direction="row" style={{ marginTop: 10 }}>
        <FormField style={{ flex: 1 }}>
          <FormLabel title="Filter Name" htmlFor="name-field" />
          <GenericInput
            field="string"
            type="string"
            value={state.filter.name}
            onChange={e => {
              dispatch({ type: 'set-field', field: 'name', value: e });
            }}
          />
        </FormField>
      </Stack>
      <View style={{ flexShrink: 0 }}>
        <View style={{ marginBottom: 10, marginTop: 20 }}>
          <Text style={{ color: colors.n4, marginBottom: 5 }}>
            If
            <FieldSelect
              data-testid="conditions-op"
              style={{ display: 'inline-flex' }}
              fields={[
                ['and', 'all'],
                ['or', 'any'],
              ]}
              value={state.filter.conditionsOp}
              onChange={(name, value) => {
                dispatch({
                  type: 'set-field',
                  field: 'conditionsOp',
                  value: value,
                });
              }}
            />
            of these conditions match:
          </Text>

          <ConditionsList
            conditionsOp={state.filter.conditionsOp}
            conditions={state.filter.conditions}
            editorStyle={editorStyle}
            onChangeConditions={e => {
              dispatch({ type: 'set-field', field: 'conditions', value: e });
            }}
          />
        </View>
      </View>

      <SelectedProvider instance={selectedInst}>
        <View style={{ padding: '20px', flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.n4, marginBottom: 0 }}>
              Filter results:
            </Text>
          </View>

          <SimpleTransactionsTable
            transactions={state.transactions}
            fields={getTransactionFields(state.filter.conditions)}
            style={{
              border: '1px solid ' + colors.border,
              borderRadius: 4,
              overflow: 'hidden',
              marginTop: 5,
            }}
          />

          <Stack
            direction="row"
            justify="flex-end"
            align="center"
            style={{ marginTop: 20 }}
          >
            {state.error && (
              <Text style={{ color: colors.r4 }}>{state.error}</Text>
            )}
            <Button
              style={{ marginRight: 10 }}
              onClick={() => history.goBack()}
            >
              Cancel
            </Button>
            <Button primary onClick={onSave}>
              {adding ? 'Add' : 'Update'}
            </Button>
          </Stack>
        </View>
      </SelectedProvider>
    </Page>
  );
}
