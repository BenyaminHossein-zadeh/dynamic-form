import { Field } from "@/types";

export const schema: Field[] = [
  {
    name: "pizza",
    type: "select",
    label: "Pizza",
    required: true,
    options: {
      store: "https://mocki.io/v1/32ce822a-fb8a-469d-b2ef-a86797556c00",
      nested: [
        {
          name: "sauce",
          type: "select",
          label: "Sauces",
          multiple: true,
          validate: { minItems: 1, maxItems: 3 },
          default: [2],
          options: [
            { label: "Ketchup", value: 1 },
            { label: "BBQ", value: 2 },
            { label: "Spicy", value: 3 },
          ],
        },
        { name: "notes", type: "text", label: "Notes", validate: { min: 10 } },
      ],
    },
  },
];

export const values: Record<string, any> = {};