import { todosApi } from './api';
import { TodoItem, CreateTodoItemData, UpdateTodoItemData } from '../models/todo-item';

/**
 * Service for todo-related operations
 */

interface GetTodosParams {
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  limit?: number;
  offset?: number;
}

interface GetTodosResponse {
  todos: TodoItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get all todos for the authenticated user
 */
export const getTodos = async (params?: GetTodosParams): Promise<GetTodosResponse> => {
  try {
    const response = await todosApi.getAll(params);

    // Handle different response formats - the API returns either:
    // 1. An array directly (current backend format)
    // 2. An object with todos property (expected format)
    let todos: TodoItem[] = [];
    let total = 0;
    let limit = 100;
    let offset = 0;

    if (Array.isArray(response.data)) {
      // Direct array response from backend - need to map fields from snake_case to camelCase
      todos = response.data.map(task => ({
        id: String(task.id),
        title: task.title || '',
        description: task.description,
        completed: task.completed || false,
        dueDate: task.due_date || null, // Map due_date to dueDate
        priority: task.priority || 'medium',
        createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
        updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
        userId: task.user_id || '', // Map user_id to userId
      }));
      total = response.data.length;
    } else if (response.data && typeof response.data === 'object') {
      // Object response with todos property
      const responseTodos = response.data.todos || [];
      todos = responseTodos.map(task => ({
        id: String(task.id),
        title: task.title || '',
        description: task.description,
        completed: task.completed || false,
        dueDate: task.due_date || null, // Map due_date to dueDate
        priority: task.priority || 'medium',
        createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
        updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
        userId: task.user_id || '', // Map user_id to userId
      }));
      total = response.data.total || responseTodos.length || 0;
      limit = response.data.limit || 100;
      offset = response.data.offset || 0;
    }

    return { todos, total, limit, offset };
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

/**
 * Get a single todo by ID
 */
export const getTodoById = async (id: string): Promise<TodoItem> => {
  try {
    const response = await todosApi.getById(id);

    // Map response fields from snake_case to camelCase
    const task = response.data;
    return {
      id: String(task.id),
      title: task.title || '',
      description: task.description,
      completed: task.completed || false,
      dueDate: task.due_date || null, // Map due_date to dueDate
      priority: task.priority || 'medium',
      createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
      updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
      userId: task.user_id || '', // Map user_id to userId
    };
  } catch (error) {
    console.error(`Error fetching todo with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new todo
 */
export const createTodo = async (data: CreateTodoItemData): Promise<TodoItem> => {
  try {
    const response = await todosApi.create(data);

    // Map response fields from snake_case to camelCase
    const task = response.data;
    return {
      id: String(task.id),
      title: task.title || '',
      description: task.description,
      completed: task.completed || false,
      dueDate: task.due_date || null, // Map due_date to dueDate
      priority: task.priority || 'medium',
      createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
      updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
      userId: task.user_id || '', // Map user_id to userId
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

/**
 * Update an existing todo
 */
export const updateTodo = async (id: string, data: UpdateTodoItemData): Promise<TodoItem> => {
  try {
    const response = await todosApi.update(id, data);

    // Map response fields from snake_case to camelCase
    const task = response.data;
    return {
      id: String(task.id),
      title: task.title || '',
      description: task.description,
      completed: task.completed || false,
      dueDate: task.due_date || null, // Map due_date to dueDate
      priority: task.priority || 'medium',
      createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
      updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
      userId: task.user_id || '', // Map user_id to userId
    };
  } catch (error) {
    console.error(`Error updating todo with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a todo by ID
 */
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await todosApi.delete(id);
  } catch (error) {
    console.error(`Error deleting todo with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle the completion status of a todo
 */
export const toggleTodoCompletion = async (id: string, completed: boolean): Promise<TodoItem> => {
  try {
    const response = await todosApi.toggleComplete(id, completed);

    // Map response fields from snake_case to camelCase
    const task = response.data;
    return {
      id: String(task.id),
      title: task.title || '',
      description: task.description,
      completed: task.completed || false,
      dueDate: task.due_date || null, // Map due_date to dueDate
      priority: task.priority || 'medium',
      createdAt: task.created_at || new Date().toISOString(), // Map created_at to createdAt
      updatedAt: task.updated_at || new Date().toISOString(), // Map updated_at to updatedAt
      userId: task.user_id || '', // Map user_id to userId
    };
  } catch (error) {
    console.error(`Error toggling completion for todo with ID ${id}:`, error);
    throw error;
  }
};