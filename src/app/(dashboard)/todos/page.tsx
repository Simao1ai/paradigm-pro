import { TodoList } from "@/components/todo/TodoList";

export default function TodosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
        <p className="mt-1 text-sm text-gray-500">
          Keep track of your tasks and stay organized.
        </p>
      </div>
      <TodoList />
    </div>
  );
}
