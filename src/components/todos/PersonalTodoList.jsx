import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Filter,
  Check
} from 'lucide-react';

export const PersonalTodoList = () => {
  const {
    currentUser,
    getMyPersonalTodos,
    addPersonalTodo,
    togglePersonalTodo,
    deletePersonalTodo,
    clearCompletedPersonalTodos
  } = useApp();

  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('Medium'); // 'Low' | 'Medium' | 'High'
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');

  const myTodos = getMyPersonalTodos();

  const totalCount = myTodos.length;
  const activeCount = myTodos.filter((t) => !t.isCompleted).length;
  const completedCount = myTodos.filter((t) => t.isCompleted).length;

  const filteredTodos = useMemo(() => {
    return myTodos.filter((t) => {
      const matchFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && !t.isCompleted) ||
        (filter === 'COMPLETED' && t.isCompleted);

      const matchSearch =
        !searchQuery.trim() ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [myTodos, filter, searchQuery]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    addPersonalTodo(newText, newPriority, newDueDate);
    setNewText('');
    setNewDueDate('');
    setNewPriority('Medium');
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/40 text-slate-400 border border-slate-700/50">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Personal To-Do List
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Your private daily scratchpad and checklist. Stored locally — completely disconnected from project delivery and reports.
            </p>
          </div>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active</span>
            <span className="text-sm font-bold font-mono text-indigo-400">{activeCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Done</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{completedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total</span>
            <span className="text-sm font-bold font-mono text-slate-200">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Add To-Do Input Card */}
      <form onSubmit={handleAddTodo} className="p-4 rounded-xl bg-[#111827] border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What do you need to do today? (e.g. Study design patterns, check notes...)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        {/* Options Row: Priority & Due Date */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-3">
            {/* Priority Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Priority:</span>
              <div className="inline-flex rounded-lg bg-[#182234] p-0.5 border border-slate-700/80">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      newPriority === p
                        ? p === 'High'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : p === 'Medium'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Due Date */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Due Date:</span>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="px-2 py-0.5 rounded-lg bg-[#182234] border border-slate-700/80 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
              {newDueDate && (
                <button
                  type="button"
                  onClick={() => setNewDueDate('')}
                  className="text-slate-400 hover:text-slate-200 text-[10px]"
                  title="Clear date"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <span className="text-[11px] text-slate-400 italic hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono">Enter</kbd> to quickly add
          </span>
        </div>
      </form>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#111827] border border-slate-800 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#182234] p-1 rounded-lg border border-slate-700/80 self-start">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search & Clear Completed Actions */}
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all completed personal to-dos?')) {
                  clearCompletedPersonalTodos();
                }
              }}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors border border-transparent hover:border-rose-500/20"
            >
              Clear Completed ({completedCount})
            </button>
          )}
        </div>
      </div>

      {/* Todo List Items */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-indigo-400/60 mx-auto" />
            <h3 className="text-sm font-bold text-white">
              {filter === 'COMPLETED'
                ? 'No completed to-dos yet'
                : filter === 'ACTIVE'
                ? 'No active to-dos!'
                : 'No personal to-dos yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filter === 'ALL'
                ? 'Add your personal notes, learning tasks, or daily reminders using the form above.'
                : 'Items will appear here once added or updated.'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            return (
              <div
                key={todo.id}
                onClick={() => togglePersonalTodo(todo.id)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
                  todo.isCompleted
                    ? 'bg-[#182234]/40 border-slate-800/80 text-slate-500'
                    : 'bg-[#182234] border-slate-700/70 hover:border-indigo-500/40 text-slate-200 hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox + Content */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePersonalTodo(todo.id);
                    }}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      todo.isCompleted
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400 bg-slate-900/60'
                    }`}
                  >
                    {todo.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium leading-relaxed truncate select-none ${
                        todo.isCompleted
                          ? 'line-through text-slate-500'
                          : 'text-white group-hover:text-indigo-300'
                      }`}
                    >
                      {todo.text}
                    </p>
                  </div>
                </div>

                {/* Right: Meta (Priority, Due Date) + Delete Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {todo.priority && getPriorityBadge(todo.priority)}

                  {todo.dueDate && (
                    <span
                      className="text-[10px] font-mono text-slate-400 flex items-center gap-1 hidden sm:inline-flex"
                      title={`Due: ${todo.dueDate}`}
                    >
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {todo.dueDate}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePersonalTodo(todo.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
