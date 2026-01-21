import React, { useState } from 'react';
import { TodoItem, CreateTodoItemData } from '../../models/todo-item';
import TodoItemComponent from './todo-item';
import AddTodoForm from './add-todo-form';
import { updateTodo, deleteTodo, toggleTodoCompletion } from '../../services/todo-service';

interface TodoListProps {
  todos?: TodoItem[];
  onCreateTodo: (todoData: CreateTodoItemData) => Promise<void>;
  onRefresh: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onCreateTodo, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Filter todos based on selected filter
  const filteredTodos = todos?.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  }) || [];

  // Sort todos based on selected sort option
  const sortedTodos = filteredTodos && filteredTodos.length > 0 ?
    [...filteredTodos].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Default sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) : [];

  const handleToggleCompletion = async (id: string, completed: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setError(null);

    try {
      await toggleTodoCompletion(id, completed);
      onRefresh(); // Refresh the list after successful update
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      setError('Failed to update todo status. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setError(null);

    try {
      await deleteTodo(id);
      onRefresh(); // Refresh the list after successful deletion
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateTodo = async (id: string, data: Partial<TodoItem>) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setError(null);

    try {
      await updateTodo(id, data);
      onRefresh(); // Refresh the list after successful update
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Stats and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
              <div className="text-sm text-blue-600 font-medium">Total Tasks</div>
              <div className="text-2xl font-bold text-blue-900">{Array.isArray(todos) ? todos.length : 0}</div>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-3 border border-green-100">
              <div className="text-sm text-green-600 font-medium">Completed</div>
              <div className="text-2xl font-bold text-green-900">
                {Array.isArray(todos) ? todos.filter(t => t && t.completed).length : 0}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {Array.isArray(todos) ? todos.filter(t => t && !t.completed).length : 0}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white min-w-[160px]"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white min-w-[160px]"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Todo Form */}
      <AddTodoForm onCreateTodo={onCreateTodo} />

      {/* Todo List */}
      <div className="space-y-4">
        {sortedTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'completed'
                ? "You haven't completed any tasks yet. Keep going!"
                : filter === 'active'
                ? "Great job! You've completed all your active tasks."
                : "Get started by creating your first task."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Showing {Array.isArray(sortedTodos) ? sortedTodos.length : 0} of {Array.isArray(filteredTodos) ? filteredTodos.length : 0} task{(Array.isArray(filteredTodos) ? filteredTodos.length : 0) !== 1 ? 's' : ''}
            </div>
            {Array.isArray(sortedTodos) && sortedTodos.length > 0 ? (
              sortedTodos.map(todo => (
                <div
                  className="animate-fadeIn"
                  style={{ animationDelay: `${Math.random() * 0.2}s` }}
                >
                  <TodoItemComponent
                    key={todo.id}
                    todo={todo}
                    onToggleCompletion={handleToggleCompletion}
                    onDelete={handleDeleteTodo}
                    onUpdate={handleUpdateTodo}
                    isLoading={loadingStates[todo.id]}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {filter === 'completed'
                    ? "You haven't completed any tasks yet. Keep going!"
                    : filter === 'active'
                    ? "Great job! You've completed all your active tasks."
                    : "Get started by creating your first task."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;