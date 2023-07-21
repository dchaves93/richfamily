import React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import * as actions from 'loot-core/src/client/actions';

import Close from '../icons/v1/Close';
import { theme } from '../style';

import { View, Text, LinkButton, Button } from './common';

function closeNotification(setAppState) {
  // Set a flag to never show an update notification again for this session
  setAppState({
    updateInfo: null,
    showUpdateNotification: false,
  });
}

function UpdateNotification({
  updateInfo,
  showUpdateNotification,
  updateApp,
  setAppState,
}) {
  if (updateInfo && showUpdateNotification) {
    let notes = updateInfo.releaseNotes;

    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          margin: '15px 17px',
          backgroundColor: theme.pageTextPositive,
          color: theme.tableBackground,
          padding: '7px 10px',
          borderRadius: 4,
          zIndex: 10000,
          maxWidth: 450,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 10, fontWeight: 700 }}>
            <Text>App updated to {updateInfo.version}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ marginTop: -1 }}>
            <Text>
              <LinkButton onClick={updateApp}>Restart</LinkButton> (
              <LinkButton
                onClick={() =>
                  window.Actual.openURLInBrowser(
                    'https://actualbudget.org/docs/releases',
                  )
                }
              >
                notes
              </LinkButton>
              )
              <Button
                bare
                style={{ display: 'inline', padding: '1px 7px 2px 7px' }}
                onClick={() => closeNotification(setAppState)}
              >
                <Close width={9} style={{ color: theme.pageText }} />
              </Button>
            </Text>
          </View>
        </View>
        {notes && (
          <View style={{ marginTop: 10, fontWeight: 500 }}>{notes}</View>
        )}
      </View>
    );
  }

  return null;
}

export default connect(
  state => ({
    updateInfo: state.app.updateInfo,
    showUpdateNotification: state.app.showUpdateNotification,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(UpdateNotification);
