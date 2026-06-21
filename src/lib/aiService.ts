/**
 * aiService.ts
 * Simulates AI-generated content (NotebookLM-style).
 * In production, replace the body of generateAIContent with a real API call.
 */

export interface AIGeneratedContent {
  summary: string
  keyConcepts: string[]
  studyTips: string[]
  practiceQuestions: string[]
}

const AI_CONTENT_MAP: Record<string, AIGeneratedContent> = {
  'ch-cs101-1': {
    summary:
      'Arrays and Linked Lists are the two most fundamental sequential data structures. Arrays offer O(1) random access via contiguous memory but costly O(n) insertions. Linked Lists sacrifice random access for O(1) head insertions using pointer-based allocation. Mastering both is essential for every data structures interview.',
    keyConcepts: [
      'O(1) array access via pointer arithmetic (base + index × size)',
      'O(n) traversal cost for Linked List random access',
      'Singly vs doubly linked lists: memory vs traversal flexibility',
      'Dynamic arrays (ArrayList/Vector) amortize O(1) append',
      'Cache locality advantage of arrays over pointer-scattered nodes',
    ],
    studyTips: [
      'Draw memory diagrams for each operation — visualize pointer updates',
      'Implement both structures from scratch in Python or C++',
      'Practice LeetCode: Reverse Linked List, Two Sum, Move Zeroes',
    ],
    practiceQuestions: [
      'How would you detect a cycle in a linked list?',
      'When would you choose a doubly linked list over a singly linked list?',
    ],
  },
  'ch-cs101-2': {
    summary:
      'Binary Search Trees maintain sorted order through the BST property: all left descendants are smaller, all right descendants are larger. This gives O(log n) average-case search, insert, and delete. However, unbalanced insertion degrades to O(n). AVL trees and Red-Black trees solve this with self-balancing rotations.',
    keyConcepts: [
      'BST property: left < parent < right at every node',
      'Inorder traversal of a BST yields sorted output',
      'Worst-case O(n) for skewed trees (sorted insertion)',
      'AVL trees: height difference ≤ 1, single/double rotations',
      'Heap property vs BST property — min-heap guarantees O(1) minimum',
    ],
    studyTips: [
      'Trace inorder, preorder, postorder on paper before coding',
      'Implement BST insert, delete, and search in your preferred language',
      'Understand why deletion of a node with two children uses inorder successor',
    ],
    practiceQuestions: [
      'How do you validate whether a binary tree is a valid BST?',
      'What traversal order would you use to clone a BST?',
    ],
  },
  'ch-ds101-1': {
    summary:
      'Supervised learning trains models on labeled (input, output) pairs to generalize to unseen data. The key challenge is the bias-variance tradeoff: simple models underfit (high bias), complex models overfit (high variance). Regularization, cross-validation, and ensemble methods are the main tools for finding the optimal balance.',
    keyConcepts: [
      'Loss functions: MSE for regression, Cross-Entropy for classification',
      'Bias-variance decomposition: total error = bias² + variance + noise',
      'L1 (Lasso) sparsifies weights; L2 (Ridge) shrinks them smoothly',
      'k-Fold cross-validation for unbiased model evaluation',
      'Ensemble methods: Bagging (Random Forest) reduces variance; Boosting (XGBoost) reduces bias',
    ],
    studyTips: [
      'Always plot learning curves to diagnose bias vs variance',
      'Start with a simple baseline model before trying complex ones',
      'Use scikit-learn pipelines to prevent data leakage during CV',
    ],
    practiceQuestions: [
      'Your model has 99% training accuracy but 60% test accuracy. What is happening and how do you fix it?',
      'When would you prefer L1 regularization over L2?',
    ],
  },
  'ch-se101-1': {
    summary:
      'Creational design patterns decouple the process of object creation from the objects themselves. Singleton ensures shared state, Factory Method enables polymorphic instantiation, Builder handles multi-step complex construction, and Prototype allows cheap cloning of expensive-to-create objects. Understanding when to use each pattern is more important than memorizing their structure.',
    keyConcepts: [
      'Singleton: private constructor + static getInstance() method',
      'Factory Method: Creator defines interface, ConcreteCreator decides instantiation',
      'Builder: Director orchestrates, ConcreteBuilder assembles parts step-by-step',
      'Abstract Factory: families of related objects without concrete classes',
      'Prototype: deep vs shallow clone — know the difference',
    ],
    studyTips: [
      'Draw UML class diagrams for each pattern before coding',
      'Find real examples: Logger (Singleton), UI buttons (Factory), SQL query builders (Builder)',
      'Ask: "does this pattern add complexity or reduce it?" — if the former, don\'t use it',
    ],
    practiceQuestions: [
      'How would you make a Singleton thread-safe in Java or TypeScript?',
      'What is the difference between Factory Method and Abstract Factory?',
    ],
  },
  'ch-cs201-1': {
    summary:
      'Process management is at the core of every modern OS. The kernel manages process lifecycle through the PCB, schedules CPU time among competing processes, and coordinates thread execution. Understanding scheduling algorithms, synchronization primitives, and deadlock conditions is fundamental for systems programming.',
    keyConcepts: [
      'PCB stores PID, state, registers, memory maps, and open file handles',
      'Five process states: New → Ready → Running → Waiting → Terminated',
      'Context switch cost: save + restore PCB (hundreds of nanoseconds)',
      'SJF minimizes average wait time but requires burst time prediction',
      'Mutex vs Semaphore: binary lock vs counting coordination primitive',
    ],
    studyTips: [
      'Simulate scheduling algorithms (FCFS, SJF, RR) with Gantt charts',
      'Write a multi-threaded program and introduce a deliberate race condition',
      'Study the four Coffman conditions for deadlock: mutual exclusion, hold-and-wait, no preemption, circular wait',
    ],
    practiceQuestions: [
      'What is the difference between a process and a thread?',
      'How does Round Robin scheduling prevent starvation?',
    ],
  },
}

const DEFAULT_AI_CONTENT: AIGeneratedContent = {
  summary:
    'This chapter covers essential concepts that form the foundation for advanced topics in the course. The material combines theoretical understanding with practical implementation skills valued in industry.',
  keyConcepts: [
    'Core theoretical foundations and formal definitions',
    'Practical implementation patterns and best practices',
    'Time and space complexity analysis',
    'Common pitfalls and how to avoid them',
    'Real-world applications in modern systems',
  ],
  studyTips: [
    'Review lecture slides before watching the video for context',
    'Implement the key algorithms or patterns by hand',
    'Test your understanding with the quiz before moving on',
  ],
  practiceQuestions: [
    'Can you explain this concept in your own words without notes?',
    'How does this topic connect to what you learned in the previous chapter?',
  ],
}

/**
 * Simulates an async AI content generation call.
 * Replace with: const response = await fetch('/api/generate', { method: 'POST', body: ... })
 */
export async function generateAIContent(chapterId: string): Promise<AIGeneratedContent> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1600))
  return AI_CONTENT_MAP[chapterId] ?? DEFAULT_AI_CONTENT
}
