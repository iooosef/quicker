import React, { useState } from 'react';

const CheckboxGroup = ({ options, groupTitle, onChange, classNames }) => {
  return (
    <div>
      <h6 className="label-text text-base">{groupTitle}</h6>
      <div className="max-w-sm">
        <ul className="border-base-content/25 divide-base-content/25 divide-y rounded-box border *:p-3 first:*:rounded-t-box last:*:rounded-b-box">
          {options.map((option, index) => (
            <li key={index}>
              <label className="form-control flex items-center gap-3">
                <input
                  type="checkbox"
                  className={`checkbox checkbox-primary ${classNames}`}
                  onChange={(e) => onChange(option, e.target.checked)}
                />
                <span className="label cursor-pointer flex-col items-start">
                  <span className="label-text text-base">{option}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CheckboxGroup;