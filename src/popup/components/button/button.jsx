import React from 'react';
import PropTypes from 'prop-types';
import './button.scss';

const Button = props => <button disabled={props.disabled} className="icbs-button" onClick={props.action}>{ props.label }</button>;

Button.propTypes = {
  action: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default Button;
