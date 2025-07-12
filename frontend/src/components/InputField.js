// frontend/src/components/InputField.js
import React from 'react';
import { Form } from 'react-bootstrap';
import InputMask from 'react-input-mask';

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = true,
  mask,
  placeholder = '',
  disabled = false,
  readOnly = false,
  autoComplete = 'off',
  helperText = '',
  error = '',
}) => {
  const id = `input-${name}`;
  const hasError = Boolean(error);

  const controlProps = {
    id,
    name,
    type,
    value,
    onChange,
    required,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    'aria-describedby': helperText ? `${id}-help` : undefined,
    isInvalid: hasError,
  };

  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Form.Label>

      {mask ? (
        <InputMask mask={mask} value={value} onChange={onChange} disabled={disabled}>
          {(inputProps) => <Form.Control {...inputProps} {...controlProps} />}
        </InputMask>
      ) : (
        <Form.Control {...controlProps} />
      )}

      {helperText && (
        <Form.Text id={`${id}-help`} className="text-muted">
          {helperText}
        </Form.Text>
      )}

      {hasError && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default InputField;
