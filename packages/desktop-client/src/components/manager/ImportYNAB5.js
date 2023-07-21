import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { importBudget } from 'loot-core/src/client/actions/budgets';

import { styles, theme } from '../../style';
import {
  View,
  Block,
  Modal,
  ButtonWithLoading,
  P,
  ExternalLink,
} from '../common';

function getErrorMessage(error) {
  switch (error) {
    case 'parse-error':
      return 'Unable to parse file. Please select a JSON file exported from nYNAB.';
    case 'not-ynab5':
      return 'This file is not valid. Please select a JSON file exported from nYNAB.';
    default:
      return 'An unknown error occurred while importing. Please report this as a new issue on Github.';
  }
}

function Import({ modalProps }) {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [importing, setImporting] = useState(false);

  async function onImport() {
    const res = await window.Actual.openFileDialog({
      properties: ['openFile'],
      filters: [{ name: 'ynab', extensions: ['json'] }],
    });
    if (res) {
      setImporting(true);
      setError(false);
      try {
        await dispatch(importBudget(res[0], 'ynab5'));
      } catch (err) {
        setError(err.message);
      } finally {
        setImporting(false);
      }
    }
  }

  return (
    <Modal {...modalProps} title="Import from nYNAB" style={{ width: 400 }}>
      {() => (
        <View
          style={[
            styles.smallText,
            { lineHeight: 1.5, marginTop: 20, color: theme.pageText },
          ]}
        >
          {error && (
            <Block style={{ color: theme.errorText, marginBottom: 15 }}>
              {getErrorMessage(error)}
            </Block>
          )}

          <View
            style={{ alignItems: 'center', '& > div': { lineHeight: '1.7em' } }}
          >
            <P>
              <ExternalLink to="https://actualbudget.org/docs/migration/nynab">
                Read here
              </ExternalLink>{' '}
              for instructions on how to migrate your data from YNAB. You need
              to export your data as JSON, and that page explains how to do
              that.
            </P>
            <P>
              Once you have exported your data, select the file and Actual will
              import it. Budgets may not match up exactly because things work
              slightly differently, but you should be able to fix up any
              problems.
            </P>
            <View>
              <ButtonWithLoading loading={importing} primary onClick={onImport}>
                Select file...
              </ButtonWithLoading>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

export default Import;
