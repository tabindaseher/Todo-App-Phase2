import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import ProtectedRoute from '../components/layout/protected-route';
import Header from '../components/layout/header';
import TodoList from '../components/features/todo-list';
import { getTodos, createTodo } from '../services/todo-service';
import { TodoItem, CreateTodoItemData } from '../models/todo-item';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos when the component mounts
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTodos();

      // Safely handle response with fallback for undefined/empty data
      let todosFromResponse = response?.todos || [];

      // Normalize todos to ensure they match the expected interface
      const normalizedTodos = todosFromResponse.map(todo => ({
        ...todo,
        id: String(todo?.id || Math.random().toString()), // Ensure id is string with fallback
        priority: todo?.priority || 'medium', // Ensure priority has a default
      }));

      setTodos(normalizedTodos);
    } catch (err) {
      console.error('Error loading todos:', err);
      setError('Failed to load todos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData: CreateTodoItemData) => {
    try {
      const newTodo = await createTodo(todoData);
      // Ensure the new todo has all required fields in the correct format
      const normalizedTodo = {
        ...newTodo,
        id: String(newTodo.id), // Ensure id is string
        priority: newTodo.priority || 'medium', // Ensure priority has a default
      };
      setTodos([normalizedTodo, ...todos]); // Add new todo to the top of the list
    } catch (err) {
      console.error('Error creating todo:', err);
      throw err; // Re-throw so the form can handle the error
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Todo Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name}. Here's your todo list.
                </p>
              </div>
            </div>

            <div className="mt-8">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <TodoList
                  todos={todos}
                  onCreateTodo={handleCreateTodo}
                  onRefresh={loadTodos}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;