// components/dashboard/DailyLogList.tsx
// Full CRUD to-do list with Organic Zen aesthetic + Deadline support.
// CREATE: borderless input + Enter. Optional deadline via date picker.
// READ: Mint checkbox, done = line-through. Deadline shown as Coral badge.
// UPDATE: double-click to inline edit.
// DELETE: hover-reveal X icon (lucide-react).
// AnimatePresence for smooth layout transitions.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar } from 'lucide-react';
import { format, parseISO, isValid, isPast, isToday } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import type { Task } from '@/store/useEquilStore';

interface DailyLogListProps {
  tasks: Task[];
  onAdd: (text: string, deadline?: string) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onSetDeadline: (id: string, deadline: string | undefined) => void;
  language: string;
}

// ── SINGLE TASK ROW ─────────────────────────────────────────
function TaskRow({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onSetDeadline,
  language,
}: {
  task: Task;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
  onSetDeadline: (deadline: string | undefined) => void;
  language: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onUpdate(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setEditText(task.text); setIsEditing(false); }
  };

  // Deadline display
  const deadlineDate = task.deadline ? parseISO(task.deadline) : null;
  const isOverdue = deadlineDate && isValid(deadlineDate) && isPast(deadlineDate) && !isToday(deadlineDate) && !task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 group py-2 relative"
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${
          task.completed
            ? 'bg-equil-mint border-equil-mint'
            : 'border-equil-onyx/10 group-hover:border-equil-mint/40'
        }`}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Task text / edit input */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            className="w-full bg-transparent text-sm text-equil-onyx outline-none border-b border-equil-mint/30 pb-0.5"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span
              onDoubleClick={() => { setEditText(task.text); setIsEditing(true); }}
              className={`text-sm transition-all cursor-text select-none truncate ${
                task.completed ? 'text-equil-forest/30 line-through' : 'text-equil-onyx/60'
              }`}
              title={language === 'id' ? 'Klik dua kali untuk mengedit' : 'Double-click to edit'}
            >
              {task.text}
            </span>
            {/* Deadline badge */}
            {task.deadline && deadlineDate && isValid(deadlineDate) && (
              <span className={`text-[8px] font-mono tracking-wider shrink-0 px-1.5 py-0.5 rounded-md ${
                isOverdue
                  ? 'text-equil-coral bg-equil-coral/10'
                  : task.completed
                    ? 'text-equil-forest/20 bg-equil-sage/30'
                    : 'text-equil-mint/60 bg-equil-mint/10'
              }`}>
                {format(deadlineDate, 'dd MMM', { locale: language === 'id' ? localeID : undefined })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Deadline picker (hover reveal) */}
      <button
        onClick={() => {
          setShowDatePicker(!showDatePicker);
          setTimeout(() => dateRef.current?.showPicker(), 50);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 p-1 rounded-md hover:bg-equil-sage/40"
        title={language === 'id' ? 'Atur deadline' : 'Set deadline'}
      >
        <Calendar size={13} className="text-equil-onyx/15 hover:text-equil-mint transition-colors" />
      </button>
      <input
        ref={dateRef}
        type="date"
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        value={task.deadline || ''}
        onChange={(e) => {
          onSetDeadline(e.target.value || undefined);
          setShowDatePicker(false);
        }}
      />

      {/* Delete (hover reveal) */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 p-1 rounded-md hover:bg-equil-coral/10"
      >
        <X size={14} className="text-equil-onyx/15 hover:text-equil-coral transition-colors" />
      </button>
    </motion.div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function DailyLogList({ tasks, onAdd, onToggle, onUpdate, onDelete, onSetDeadline, language }: DailyLogListProps) {
  const [newText, setNewText] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim(), newDeadline || undefined);
    setNewText('');
    setNewDeadline('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/15 uppercase block mb-5">
        {language === 'id' ? 'LOG HARIAN' : 'DAILY LOG'}
      </span>

      {/* Task list */}
      <div className="flex flex-col mb-5">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onUpdate={(text) => onUpdate(task.id, text)}
              onDelete={() => onDelete(task.id)}
              onSetDeadline={(dl) => onSetDeadline(task.id, dl)}
              language={language}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <p className="text-xs text-equil-onyx/12 italic py-3">
            {language === 'id' ? 'belum ada tugas. mulai tulis sesuatu.' : 'no tasks yet. start writing.'}
          </p>
        )}
      </div>

      {/* CREATE — borderless input + optional deadline */}
      <div className="flex items-center gap-2">
        <span className="text-equil-onyx/10 text-base">+</span>
        <input
          ref={inputRef}
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={language === 'id' ? 'tambah tugas...' : 'add task...'}
          className="flex-1 bg-transparent text-sm text-equil-onyx placeholder:text-equil-onyx/10 outline-none border-b border-equil-forest/10 pb-1.5 focus:border-equil-mint/30 transition-colors"
        />
        <button
          onClick={() => deadlineRef.current?.showPicker()}
          className="shrink-0 p-1 rounded-md hover:bg-equil-sage/40 transition-colors"
          title={language === 'id' ? 'Tambah deadline' : 'Add deadline'}
        >
          <Calendar size={13} className={`transition-colors ${newDeadline ? 'text-equil-mint' : 'text-equil-onyx/10 hover:text-equil-onyx/30'}`} />
        </button>
        <input
          ref={deadlineRef}
          type="date"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />
        {newDeadline && (
          <span className="text-[8px] font-mono text-equil-mint/60 tracking-wider">
            {newDeadline}
          </span>
        )}
      </div>
    </div>
  );
}
