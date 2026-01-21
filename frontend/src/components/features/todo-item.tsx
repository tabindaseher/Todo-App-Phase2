import React, { useState, useRef, useEffect } from 'react';
import { TodoItem } from '../../models/todo-item';
import Button from '../ui/button';
import Card from '../ui/card';

interface TodoItemProps {
  todo: TodoItem;
  onToggleCompletion: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<TodoItem>) => void;
  isLoading: boolean;
}

const TodoItemComponent: React.FC<TodoItemProps> = ({
  todo,
  onToggleCompletion,
  onDelete,
  onUpdate,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium');
  const [height, setHeight] = useState<number | string>('auto');

  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggleCompletion = () => {
    onToggleCompletion(todo.id, !todo.completed);
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    onDelete(todo.id);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority || 'medium');
    setIsEditing(false);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  // Calculate height for smooth transitions
  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isEditing, isDeleting]);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isDeleting ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}
      style={{
        height: isDeleting ? 0 : height,
      }}
    >
      <Card className={`transition-all duration-200 ${todo.completed ? 'opacity-80 bg-gray-50' : 'bg-white'} ${isLoading ? 'opacity-70' : ''}`}>
        {isDeleting ? (
          // Delete confirmation modal
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Delete Task?</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                </p>
                <div className="mt-4 flex space-x-3">
                  <Button
                    onClick={confirmDelete}
                    variant="danger"
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </Button>
                  <Button
                    onClick={cancelDelete}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : isEditing ? (
          // Edit mode
          <div ref={contentRef} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={handleToggleCompletion}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <div
                    onClick={handleToggleCompletion}
                    className={`block w-14 h-8 rounded-full cursor-pointer transition-colors duration-200 ${
                      todo.completed ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                        todo.completed ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {todo.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleSave}
                variant="primary"
                className="flex items-center"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View mode
          <div ref={contentRef} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="flex items-center h-6 mt-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={handleToggleCompletion}
                    disabled={isLoading}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-transform duration-200 transform hover:scale-110"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-semibold transition-all duration-200 ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900 hover:text-blue-600'
                    }`}>
                      {todo.title}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      priorityColors[(todo.priority as keyof typeof priorityColors)] || priorityColors.medium
                    }`}>
                      {(todo.priority || 'medium').charAt(0).toUpperCase() + (todo.priority || 'medium').slice(1)}
                    </span>
                  </div>

                  {todo.description && (
                    <p className={`text-sm mb-3 transition-all duration-200 ${
                      todo.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {todo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 transition-all duration-200">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Created: {formatDate(todo.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Updated: {formatDate(todo.updatedAt)}
                    </span>
                    {todo.dueDate && (
                      <span className="flex items-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Due: {formatDate(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 space-x-2 ml-4">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center transition-all duration-200 hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center transition-all duration-200 hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TodoItemComponent;