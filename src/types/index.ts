import { JSX } from "react";

export interface Field {
  /**
   * @description
   * نام فیلد
   * @type {string}
   * @required
   */
  name: string;

  /**
   * @description
   * نوع فیلد
   * @type {string}
   * @required
   * @default 'text'
   */
  type: "select" | "text";

  /**
   * @description
   * عنوان فیلد
   *  پارامتر label برای کاربر که در GUI نمایش داده میشود.
   * @type {string}
   * @default ''
   */
  label?: string;

  /**
   * @description مشخص میکند که فیلد اجباری است یا خیر
   * @type Boolean
   * @default false
   */
  required?: boolean;

  /**
   *
   *
   * @type {boolean}
   * @default False
   * @description اگر true، انتخاب چندگانه مجاز است.
   */
  multiple?: boolean;

  /**
   *
   * @type {any}
   * @default undefined
   * @description مقدار پیش فرض فیلد براساس نوع فیلد
   */
  default?: any;

  /**
   * @description
   * اعتبار سنجی فیلد
   */
  validate?: {
    min?: number;
    minItems?: number;
    maxItems?: number;
  };

  options?: { store: string; nested?: Field[] } | Option[];
}

export interface Option {
  label: string;
  value: string | number;
  nested?: Field[];
}

export interface FieldProps {
  field: Field;
  value: string | number | (string | number)[] | undefined;
  error: string | undefined;
  onChange: (
    field: Field,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onBlur: (field: Field) => void;
  getOptions: (field: Field) => Option[];
  shouldShowNested: (field: Field, values: Record<string, string | number | (string | number)[] | undefined>) => boolean;
  formValues: Record<string, string | number | (string | number)[] | undefined>;
  renderField: (field: Field) => JSX.Element;
}

export interface Props {
  schema: Field[];
  values: Record<string, any>;
  onSubmit: (formData: Record<string, string | number | (string | number)[] | undefined>) => void;
}