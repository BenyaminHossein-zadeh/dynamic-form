"use client"
import DynamicForm from "@/Components/DynamicForm";
import { schema, values } from "@/constants";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <DynamicForm
        onSubmit={(val) => console.log(val)}
        schema={schema}
        values={values}
      />
    </div>
  );
}
