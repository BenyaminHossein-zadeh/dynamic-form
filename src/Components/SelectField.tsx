import React, { memo } from "react";
import { FieldProps } from "@/types";

const SelectField: React.FC<FieldProps> = memo(
  ({
    field,
    value,
    error,
    onChange,
    onBlur,
    getOptions,
    shouldShowNested,
    formValues,
    renderField,
  }) => {
    const showNested = shouldShowNested(field, formValues);
    const options = getOptions(field);
    const selectedOptions = showNested
      ? field.multiple
        ? options.filter(
            (opt) => Array.isArray(value) && value.includes(opt.value)
          )
        : options.filter((opt) => value === opt.value)
      : [];

    const handleCheckboxChange = React.useCallback(
      (optValue: string | number) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = Array.isArray(value) ? [...value] : [];
          if (e.target.checked) newValue.push(optValue);
          else newValue.splice(newValue.indexOf(optValue), 1);
          const event = {
            target: { name: field.name, value: newValue },
          } as unknown as React.ChangeEvent<HTMLSelectElement>;
          onChange(field, event);
        },
      [field.name, value, onChange]
    );

    return (
      <div className="bg-gray-300 p-6 rounded-lg w-full">
        <label className="text-black font-bold flex gap-2 mb-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.multiple ? (
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`${field.name}-${opt.value}`}
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={handleCheckboxChange(opt.value)}
                  onBlur={() => onBlur(field)} // Adjusted to handle FocusEvent
                  className="m-0 size-4 accent-black"
                />
                <span className="text-sm text-black">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <select
            name={field.name}
            value={
              typeof value === "string" || typeof value === "number"
                ? String(value)
                : ""
            }
            onChange={(e) => onChange(field, e)}
            onBlur={() => onBlur(field)}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "20px",
            }}
            className="w-full p-2.5 border border-gray-300 rounded-sm bg-white outline-none text-sm box-border appearance-none"
          >
            <option value="">Select {field.label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white">
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {showNested && selectedOptions.length > 0 && (
          <div className="ml-5 mt-3">
            {selectedOptions.flatMap((opt) =>
              (opt.nested || []).map(renderField)
            )}
          </div>
        )}
        {field.options &&
          typeof field.options !== "boolean" &&
          "nested" in field.options &&
          showNested && (
            <div className="ml-5 mt-3">
              {(field.options.nested || []).map(renderField)}
            </div>
          )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
