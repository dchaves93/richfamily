import React, { createContext, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { useResponsive } from '../ResponsiveProvider';
import { colors, styles } from '../style';

import { Modal, View, Text } from './common';

let PageTypeContext = createContext({ type: 'page' });

export function PageTypeProvider({ type, current, children }) {
  return (
    <PageTypeContext.Provider value={{ type, current }}>
      {children}
    </PageTypeContext.Provider>
  );
}

export function usePageType() {
  return useContext(PageTypeContext);
}

function PageTitle({ name, style }) {
  const { isNarrowWidth } = useResponsive();

  if (isNarrowWidth) {
    return (
      <View
        style={[
          {
            alignItems: 'center',
            backgroundColor: colors.b2,
            color: 'white',
            flexDirection: 'row',
            flex: '1 0 auto',
            fontSize: 18,
            fontWeight: 500,
            height: 50,
            justifyContent: 'center',
            overflowY: 'auto',
          },
          style,
        ]}
      >
        {name}
      </View>
    );
  }

  return (
    <Text
      style={[
        {
          fontSize: 25,
          fontWeight: 500,
          marginBottom: 15,
        },
        style,
      ]}
    >
      {name}
    </Text>
  );
}

function loadSize(modalSize) {
  switch (modalSize) {
    case 'medium': {
      return { width: 750, height: 600 };
    }
    case 'large': {
      return {
        maxWidth: '100%',
        width: 900,
        height: '90vh',
      };
    }
    default: {
      return { width: 600 };
    }
  }
}

export function Page({ title, modalSize, children, titleStyle }) {
  let { type, current } = usePageType();
  let history = useHistory();
  let { isNarrowWidth } = useResponsive();
  let HORIZONTAL_PADDING = isNarrowWidth ? 10 : 20;

  if (type === 'modal') {
    let size = typeof modalSize === 'string' ? loadSize(modalSize) : modalSize;

    return (
      <Modal
        title={title}
        isCurrent={current}
        size={size}
        onClose={() => history.goBack()}
      >
        {children}
      </Modal>
    );
  }

  return (
    <View style={isNarrowWidth ? undefined : styles.page}>
      <PageTitle
        name={title}
        style={{
          ...titleStyle,
          paddingInline: HORIZONTAL_PADDING,
        }}
      />
      <View
        style={
          isNarrowWidth
            ? { overflowY: 'auto', padding: HORIZONTAL_PADDING }
            : {
                paddingLeft: HORIZONTAL_PADDING,
                paddingRight: HORIZONTAL_PADDING,
                flex: 1,
              }
        }
      >
        {children}
      </View>
    </View>
  );
}
