// @ts-strict-ignore
import React, {
  useState,
  type ComponentType,
  type ComponentPropsWithoutRef,
  type FormEvent,
  useCallback,
} from 'react';
import { Form } from 'react-aria-components';

import { styles } from '../../style';
import { Button } from '../common/Button2';
import { FormError } from '../common/FormError';
import { Modal, ModalCloseButton, type ModalHeader } from '../common/Modal';
import { View } from '../common/View';
import { InputField } from '../mobile/MobileForms';

type SingleInputModalProps = {
  name: string;
  Header: ComponentType<ComponentPropsWithoutRef<typeof ModalHeader>>;
  buttonText: string;
  onSubmit: (value: string) => void;
  onValidate?: (value: string) => string[];
  inputPlaceholder?: string;
};

export function SingleInputModal({
  name,
  Header,
  buttonText,
  onSubmit,
  onValidate,
  inputPlaceholder,
}: SingleInputModalProps) {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const _onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>, { close }: { close: () => void }) => {
      e.preventDefault();

      const error = onValidate?.(value);
      if (error) {
        setErrorMessage(error);
        return;
      }

      onSubmit?.(value);
      close();
    },
    [onSubmit, onValidate, value],
  );

  return (
    <Modal name={name}>
      {({ state: { close } }) => (
        <>
          <Header rightContent={<ModalCloseButton onPress={close} />} />
          <Form onSubmit={e => _onSubmit(e, { close })}>
            <View>
              <InputField
                placeholder={inputPlaceholder}
                value={value}
                onChangeValue={setValue}
                autoFocus
                autoSelect
              />
              {errorMessage && (
                <FormError
                  style={{
                    paddingTop: 5,
                    marginLeft: styles.mobileEditingPadding,
                    marginRight: styles.mobileEditingPadding,
                  }}
                >
                  * {errorMessage}
                </FormError>
              )}
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <Button
                type="submit"
                variant="primary"
                style={{
                  height: styles.mobileMinHeight,
                  marginLeft: styles.mobileEditingPadding,
                  marginRight: styles.mobileEditingPadding,
                }}
              >
                {buttonText}
              </Button>
            </View>
          </Form>
        </>
      )}
    </Modal>
  );
}
