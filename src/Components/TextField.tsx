import React, { memo } from "react";
import { FieldProps } from "@/types";

const TextField: React.FC<FieldProps> = memo(
  ({ field, value, error, onChange, onBlur }) => {
    const helperText = field.validate?.min
      ? `Enter at least ${field.validate.min} characters`
      : "Optional field";
    return (
      <div className="bg-gray-300 p-4 rounded-lg w-full">
        <label className="text-black font-bold flex gap-2 mb-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          name={field.name}
          value={(value as string | undefined) ?? ""}
          onChange={(e) => onChange(field, e)}
          onBlur={() => onBlur(field)}
          className="w-full p-2.5 border border-gray-300 rounded bg-white outline-none text-sm box-border"
        />
        <p className="text-xs text-gray-900 mt-1">{"! " + helperText}</p>
        {error && <p className="text-xs mt-1 text-red-400">{error}</p>}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
