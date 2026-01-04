'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import type { MockTask } from '@/lib/mock-data';

import { TaskCard } from './task-card';


interface TaskListProps {
  tasks: MockTask[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TaskList({ tasks }: TaskListProps): React.ReactElement {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No tasks found</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {tasks.map((task) => (
        <motion.div key={task.id} variants={itemVariants}>
          <TaskCard task={task} />
        </motion.div>
      ))}
    </motion.div>
  );
}
