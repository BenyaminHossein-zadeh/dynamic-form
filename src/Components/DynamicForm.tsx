"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import TextField from "./TextField";
import SelectField from "./SelectField";
import { Field, Option, Props } from "@/types";

export default function DynamicForm({ schema, values: initialValues, onSubmit }: Props) {
  const [formValues, setFormValues] = useState<Record<string, string | number | (string | number)[] | undefined>>(initialValues || {});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [storeOptions, setStoreOptions] = useState<Record<string, Option[]>>({});

  const fetchOptions = useCallback(async () => {
    const fetchPromises = schema
      .filter((field): field is Field & { options: { store: string } } => 
        !!field.options && typeof field.options === "object" && "store" in field.options && !!field.options.store)
      .map(async (field) => {
        try {
          const res = await fetch(field.options.store);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json() as Option[];
          setStoreOptions((prev) => ({ ...prev, [field.name]: data }));
        } catch (err) {
          console.error(`Failed to fetch options for ${field.name}`, err);
          setStoreOptions((prev) => ({ ...prev, [field.name]: [] }));
        }
      });

    await Promise.all(fetchPromises);
  }, [schema]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const getOptions = useCallback((field: Field): Option[] => {
    if (!field.options) return [];
    if (Array.isArray(field.options)) return field.options;
    if ("store" in field.options && field.options.store) {
      return storeOptions[field.name] || [];
    }
    if ("options" in field.options && Array.isArray(field.options.options)) {
      return field.options.options;
    }
    return [];
  }, [storeOptions]);

  const validateField = useCallback((field: Field, value: string | number | (string | number)[] | undefined): string | null => {
    if (field.required && (value == null || value === "" || value === 0 || (Array.isArray(value) && value.length === 0))) {
      return "This field is required";
    }
    if (!field.required && (value == null || value === "" || (Array.isArray(value) && value.length === 0))) {
      return null;
    }
    if (field.multiple && field.validate) {
      const valArr = Array.isArray(value) ? value : [];
      if (field.validate.minItems !== undefined && valArr.length < field.validate.minItems) {
        return `Select at least ${field.validate.minItems} items`;
      }
      if (field.validate.maxItems !== undefined && valArr.length > field.validate.maxItems) {
        return `Select at most ${field.validate.maxItems} items`;
      }
    }
    if (field.type === "text" && field.validate && field.validate.min !== undefined) {
      if (typeof value === "string" && value.length < field.validate.min) {
        return `Minimum length is ${field.validate.min}`;
      }
    }
    return null;
  }, []);

  const handleBlur = useCallback((field: Field) => {
    const error = validateField(field, formValues[field.name]);
    setErrors((prev) => ({ ...prev, [field.name]: error || undefined }));
  }, [formValues, validateField]);

  const getAllNames = useCallback((fields: Field[]): string[] => {
    return fields.flatMap((f) => [
      f.name,
      ...(f.options && typeof f.options === "object" && "nested" in f.options && f.options.nested
        ? getAllNames(f.options.nested)
        : []),
    ]);
  }, []);

  const checkNestedCompleted = useCallback((fields: Field[]): boolean => {
    return fields.every((f) => {
      const val = formValues[f.name];
      const isSet = val != null && val !== "" && !(Array.isArray(val) && val.length === 0);

      if (f.type === "select" && f.options && typeof f.options === "object" && "store" in f.options && f.options.store) {
        return true;
      }

      if (!isSet) return false;

      if (shouldShowNested(f, formValues)) {
        if (f.type === "select") {
          const opts = getOptions(f);
          const selOpts = f.multiple
            ? opts.filter((opt) => Array.isArray(val) && val.includes(opt.value))
            : opts.filter((opt) => val === opt.value);

          if (!selOpts.every((opt) => !opt.nested || checkNestedCompleted(opt.nested))) {
            return false;
          }
        }
        if (f.options && typeof f.options === "object" && "nested" in f.options && f.options.nested) {
          if (!checkNestedCompleted(f.options.nested)) return false;
        }
      }
      return true;
    });
  }, [formValues, getOptions]);

  const areOptionNestedCompleted = useCallback((field: Field): boolean => {
    if (field.type === "select" && field.options && typeof field.options === "object" && "store" in field.options && field.options.store) {
      return true;
    }

    if (!shouldShowNested(field, formValues) || field.type !== "select") return true;
    const val = formValues[field.name];
    const opts = getOptions(field);
    const selOpts = field.multiple
      ? opts.filter((opt) => Array.isArray(val) && val.includes(opt.value))
      : opts.filter((opt) => val === opt.value);

    return selOpts.every((opt) => !opt.nested || checkNestedCompleted(opt.nested));
  }, [formValues, getOptions, checkNestedCompleted]);

  const setFieldDefaults = useCallback((values: Record<string, string | number | (string | number)[] | undefined>, fields: Field[]): boolean => {
    let changed = false;
    fields.forEach((f) => {
      if (!(f.name in values)) {
        values[f.name] = f.default ?? (f.type === "text" ? "" : f.multiple ? [] : undefined);
        changed = true;
      }
      const fieldVal = values[f.name];
      const hasVal = fieldVal != null && fieldVal !== "" && !(Array.isArray(fieldVal) && fieldVal.length === 0);

      if (hasVal) {
        if (f.type === "select") {
          const opts = getOptions(f);
          const selectedOpts = f.multiple
            ? opts.filter((opt) => Array.isArray(fieldVal) && fieldVal.includes(opt.value))
            : opts.filter((opt) => fieldVal === opt.value);

          selectedOpts.forEach((opt) => {
            if (opt.nested && setFieldDefaults(values, opt.nested)) changed = true;
          });
        }
        if (areOptionNestedCompleted(f) && f.options && typeof f.options === "object" && "nested" in f.options && f.options.nested) {
          if (setFieldDefaults(values, f.options.nested)) changed = true;
        }
      }
    });
    return changed;
  }, [getOptions, areOptionNestedCompleted]);

  useEffect(() => {
    const newVals = { ...formValues };
    const changed = setFieldDefaults(newVals, schema);
    if (changed) {
      setFormValues(newVals);
    }
  }, [schema, storeOptions, setFieldDefaults]);

  const handleChange = useCallback((
    field: Field,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let val: string | number | (string | number)[];
    if (field.type === "select") {
      if (field.multiple) {
        if (Array.isArray(e.target.value)) {
          val = e.target.value;
        } else {
          val = Array.from((e.target as HTMLSelectElement).selectedOptions).map((opt) =>
            isNaN(Number(opt.value)) ? opt.value : Number(opt.value)
          );
        }
      } else {
        val = e.target.value;
        if (!isNaN(Number(val))) val = Number(val);
      }
    } else {
      val = e.target.value;
    }

    setFormValues((prev) => {
      const newV = { ...prev, [field.name]: val };
      const prevVal = prev[field.name];

      if (field.type === "select" && !field.multiple && val !== prevVal && prevVal !== undefined) {
        const opts = getOptions(field);
        const prevOpt = opts.find((opt) => "" + opt.value === "" + prevVal);
        if (prevOpt?.nested) {
          const prevNames = getAllNames(prevOpt.nested);
          const newOpt = opts.find((opt) => "" + opt.value === "" + val);
          const newNames = newOpt?.nested ? getAllNames(newOpt.nested) : [];
          prevNames.forEach((n) => {
            if (!newNames.includes(n)) delete newV[n];
          });
        }
      }

      return newV;
    });
  }, [getOptions, getAllNames]);

  const shouldShowNested = useCallback((field: Field, values: Record<string, string | number | (string | number)[] | undefined>) => {
    const val = values[field.name];
    return !!val && !(Array.isArray(val) && val.length === 0);
  }, []);

  const validateAll = useCallback((fields: Field[]): boolean => {
    let valid = true;
    const newErrors: Record<string, string | undefined> = {};

    const validateFieldsRec = (fields: Field[]) => {
      fields.forEach((field) => {
        const val = formValues[field.name];
        const err = validateField(field, val);
        if (err) {
          valid = false;
          newErrors[field.name] = err;
        }
        if (shouldShowNested(field, formValues)) {
          if (field.type === "select") {
            const opts = getOptions(field);
            const selOpts = field.multiple
              ? opts.filter((opt) => Array.isArray(val) && val.includes(opt.value))
              : opts.filter((opt) => val === opt.value);

            selOpts.forEach((opt) => {
              if (opt.nested) validateFieldsRec(opt.nested);
            });
          }
          if (areOptionNestedCompleted(field) && field.options && typeof field.options !== "boolean" && "nested" in field.options && field.options.nested) {
            validateFieldsRec(field.options.nested || []);
          }
        }
      });
    };

    validateFieldsRec(fields);
    setErrors(newErrors);
    return valid;
  }, [formValues, validateField, shouldShowNested, getOptions, areOptionNestedCompleted]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateAll(schema)) {
      toast.success("Form is valid! Submitting...");
      onSubmit(formValues);
    } else {
      toast.error("Please fix errors before submitting.");
    }
  }, [validateAll, schema, onSubmit, formValues]);

  const renderField = useCallback((field: Field) => {
    return field.type === "text" ? (
      <TextField
        key={field.name}
        field={field}
        value={formValues[field.name]}
        error={errors[field.name]}
        onChange={handleChange}
        onBlur={handleBlur}
        getOptions={getOptions}
        shouldShowNested={shouldShowNested}
        formValues={formValues}
        renderField={renderField}
      />
    ) : (
      <SelectField
        key={field.name}
        field={field}
        value={formValues[field.name]}
        error={errors[field.name]}
        onChange={handleChange}
        onBlur={handleBlur}
        getOptions={getOptions}
        shouldShowNested={shouldShowNested}
        formValues={formValues}
        renderField={renderField}
      />
    );
  }, [formValues, errors, handleChange, handleBlur, getOptions, shouldShowNested]);

  const memoizedSchemaFields = useMemo(() => schema.map(renderField), [schema, renderField]);

  return (
    <form onSubmit={handleSubmit} className="min-w-96 space-y-6">
      {memoizedSchemaFields}
      <button className="bg-gray-300 w-full py-3 rounded-lg" type="submit">
        Submit
      </button>
    </form>
  );
}