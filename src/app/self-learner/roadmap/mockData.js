/**
 * Mock Data Engine for grAdelytics Roadmap Generator
 * Generates custom curriculums based on subject inputs, skill level, and goals.
 */

// Helper to determine subject classification
function getSubjectCategory(subject = "") {
  const s = subject.toLowerCase().trim();
  if (s.includes("dsa") || s.includes("data structure") || s.includes("algorithm")) {
    return "DSA";
  }
  if (
    s.includes("python") ||
    s.includes("java") ||
    s.includes("javascript") ||
    s.includes("c++") ||
    s.includes("programming") ||
    s.includes("coding") ||
    s.includes("development") ||
    s.includes("react") ||
    s.includes("node") ||
    s.includes("html") ||
    s.includes("css") ||
    s.includes("rust") ||
    s.includes("go")
  ) {
    return "Programming";
  }
  if (
    s.includes("math") ||
    s.includes("calculus") ||
    s.includes("algebra") ||
    s.includes("statistics") ||
    s.includes("probability") ||
    s.includes("discrete") ||
    s.includes("geometry")
  ) {
    return "Mathematics";
  }
  return "Theory"; // Default general path
}

// Generate pre-assessment questions based on subject
export function getPreAssessmentQuestions(subject = "") {
  const category = getSubjectCategory(subject);
  if (category === "DSA") {
    return [
      {
        id: 1,
        question: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answer: 1, // index of option
      },
      {
        id: 2,
        question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
        options: ["Queue", "Stack", "Heap", "Singly Linked List"],
        answer: 1,
      },
      {
        id: 3,
        question: "What is the worst-case time complexity of Quick Sort?",
        options: ["O(n log n)", "O(n)", "O(n²)", "O(2^n)"],
        answer: 2,
      },
      {
        id: 4,
        question: "Which data structure is typically used to implement Breadth-First Search (BFS) in a graph?",
        options: ["Stack", "Queue", "Priority Queue", "BST"],
        answer: 1,
      },
      {
        id: 5,
        question: "What is a major advantage of a hash table over a sorted array?",
        options: [
          "Hash tables have O(1) average lookup time.",
          "Hash tables preserve sorted order of elements.",
          "Hash tables use less memory.",
          "Hash tables guarantee worst-case O(1) performance."
        ],
        answer: 0,
      },
    ];
  }

  if (category === "Programming") {
    return [
      {
        id: 1,
        question: "Which of the following is true about local and global variables in Python?",
        options: [
          "Local variables can be accessed anywhere outside their scope.",
          "Global variables can be read but not modified inside functions without the 'global' keyword.",
          "Local variables override global variables inside functions automatically and permanently.",
          "Python does not support global variables."
        ],
        answer: 1,
      },
      {
        id: 2,
        question: "What is the primary difference between a list and a tuple in Python?",
        options: [
          "Lists are immutable, tuples are mutable.",
          "Tuples can hold elements of different data types, lists cannot.",
          "Lists are mutable, tuples are immutable.",
          "Lists are faster than tuples."
        ],
        answer: 2,
      },
      {
        id: 3,
        question: "In Object-Oriented Programming, what does 'polymorphism' refer to?",
        options: [
          "Creating multiple instances of a class.",
          "Providing a single interface to entities of different types.",
          "Hiding implementation details within objects.",
          "Acquiring properties and behaviors from a parent class."
        ],
        answer: 1,
      },
      {
        id: 4,
        question: "What is the purpose of 'async/await' syntax in JavaScript/TypeScript?",
        options: [
          "To speed up execution of mathematical operations.",
          "To write synchronous-looking code for asynchronous operations.",
          "To secure execution environments in multi-threaded contexts.",
          "To automatically compile code into binary."
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "What is the Big O time complexity of appending an element to the end of a dynamic array (like python list)?",
        options: ["O(1) amortized", "O(log n)", "O(n)", "O(n²)"],
        answer: 0,
      },
    ];
  }

  if (category === "Mathematics") {
    return [
      {
        id: 1,
        question: "What is the derivative of f(x) = ln(x) with respect to x?",
        options: ["e^x", "1/x", "x", "ln(x) / x"],
        answer: 1,
      },
      {
        id: 2,
        question: "If two events A and B are independent, what is P(A and B)?",
        options: ["P(A) + P(B)", "P(A) * P(B)", "P(A) / P(B)", "P(A) - P(B)"],
        answer: 1,
      },
      {
        id: 3,
        question: "What is the value of the determinant of a 2x2 matrix [[a, b], [c, d]]?",
        options: ["ab - cd", "ad - bc", "ac - bd", "ad + bc"],
        answer: 1,
      },
      {
        id: 4,
        question: "Which of the following describes the derivative of a function at a specific point?",
        options: [
          "The area under the curve.",
          "The slope of the tangent line to the curve.",
          "The average value of the function over an interval.",
          "The y-intercept of the function."
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "What is the summation of the first n positive integers?",
        options: ["n(n - 1) / 2", "n(n + 1) / 2", "n²", "2n"],
        answer: 1,
      },
    ];
  }

  // Default Theory (e.g. OS, DBMS, Generic)
  return [
    {
      id: 1,
      question: "Which of the following is NOT a primary function of an Operating System?",
      options: [
        "Memory Management",
        "Process Scheduling",
        "File System management",
        "Compiling Source Code into Machine Code"
      ],
      answer: 3,
    },
    {
      id: 2,
      question: "In a relational database (RDBMS), what does 'atomicity' in ACID transactions guarantee?",
      options: [
        "Concurrent transactions do not interfere with each other.",
        "A transaction is treated as a single unit, which either succeeds completely or fails completely.",
        "Data remains consistent after database transaction operations.",
        "Data changes persist permanently after successful transactions."
      ],
      answer: 1,
    },
    {
      id: 3,
      question: "What is a deadlock in Operating Systems?",
      options: [
        "A crash in the system kernel due to hardware failure.",
        "A situation where two or more processes are blocked forever, waiting for each other to release resources.",
        "A network connection timeout during data transfer.",
        "An execution error caused by divide-by-zero operations."
      ],
      answer: 1,
    },
    {
      id: 4,
      question: "What is the primary function of the Domain Name System (DNS)?",
      options: [
        "To encrypt data transmission across nodes.",
        "To route local network packets to specific machines.",
        "To map human-readable domain names to machine IP addresses.",
        "To filter out malicious web requests."
      ],
      answer: 2,
    },
    {
      id: 5,
      question: "Which database normalization form focuses on eliminating transitive dependencies?",
      options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
      answer: 2,
    },
  ];
}

// Generate the fully structured roadmap
export function generateRoadmap(subject, goal, currentSkillLevel, dailyStudyTime, revisionFrequency, assessmentScore = null) {
  const category = getSubjectCategory(subject);
  const formattedSubject = subject.trim() || "Selected Subject";
  
  // 1. Calculate Estimated Completion Metrics
  // dailyStudyTime is e.g. "30 Minutes", "1 Hour", "2 Hours", "3 Hours", "4+ Hours"
  let minutesPerDay = 60;
  if (dailyStudyTime.includes("30")) minutesPerDay = 30;
  else if (dailyStudyTime.includes("2")) minutesPerDay = 120;
  else if (dailyStudyTime.includes("3")) minutesPerDay = 180;
  else if (dailyStudyTime.includes("4")) minutesPerDay = 240;

  // subject complexity
  let complexityFactor = 1.0;
  if (category === "DSA") complexityFactor = 1.4;
  else if (category === "Mathematics") complexityFactor = 1.25;

  // skill level factor
  let skillFactor = 1.0;
  if (currentSkillLevel === "Beginner") skillFactor = 1.3;
  else if (currentSkillLevel === "Advanced") skillFactor = 0.7;

  // Score adjustments (skipping master level if high score)
  let skipLevel1 = false;
  if (assessmentScore !== null && assessmentScore >= 80) {
    skipLevel1 = true;
  }

  const baseHoursRequired = 80 * complexityFactor * skillFactor;
  const hoursPerDay = minutesPerDay / 60;
  const totalDays = Math.max(15, Math.ceil(baseHoursRequired / hoursPerDay));
  const totalWeeks = Math.max(2, Math.ceil(totalDays / 7));

  // Determine starting level
  let startingLevel = "Level 1";
  if (skipLevel1) {
    startingLevel = "Level 2 (Fast-tracked due to High Score!)";
  } else if (assessmentScore !== null) {
    if (assessmentScore >= 50 && assessmentScore < 80) {
      startingLevel = "Level 1 (Beginner-Intermediate hybrid)";
    } else {
      startingLevel = "Level 1 Fundamentals";
    }
  }

  // 2. Define Levels Content depending on Subject Classification
  let levelsContent = [];

  if (category === "DSA") {
    levelsContent = [
      {
        level: 1,
        title: "DSA Fundamentals",
        description: "Core logic, basic complexities, and memory organizations.",
        topics: [
          {
            title: "Analysis of Algorithms",
            subtopics: [
              {
                title: "Time & Space Complexity",
                content: "Big-O, Big-Omega, Big-Theta definitions and analyzing basic loops.",
                formulas: "T(n) = aT(n/b) + f(n) (Master Theorem)",
                summary: "Understanding execution metrics and resource bounds is critical. Always look for loops and recursion depths.",
                mistakes: "Confusing space complexity with time complexity; neglecting auxiliary space.",
                tips: "Write mathematical recurrence relations for recursive algorithms.",
              },
              {
                title: "Recursion Basics",
                content: "Base cases, call stack operation, and simple recurrence relations.",
                formulas: "Recurrence equation: T(n) = T(n-1) + O(1)",
                summary: "A function calling itself. Essential for trees, graphs, and dynamic programming.",
                mistakes: "Stack overflow from missing or incorrect base cases.",
                tips: "Trace call stacks for small values (e.g. n=3) to verify recursion trees.",
              }
            ]
          },
          {
            title: "Linear Data Structures (Part 1)",
            subtopics: [
              {
                title: "Dynamic Arrays",
                content: "Contiguous memory layout, index access, capacity doubling, and amortized insertion cost.",
                formulas: "Amortized insert: O(1); Search by index: O(1)",
                summary: "Arrays are contiguous blocks of memory. Dynamic arrays automatically expand capacity when full.",
                mistakes: "Assuming insert is always O(1) without considering capacity resize operation.",
                tips: "Use indexing when position is known. For frequent deletions, use another data structure.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "dsa-p1",
            type: "MCQ",
            question: "What is the time complexity of searching for an element in an unsorted array of size N?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
            answer: 2,
            explanation: "In an unsorted array, we may have to traverse the entire array to find the element, which takes O(N) comparisons.",
          },
          {
            id: "dsa-p2",
            type: "Coding Question",
            question: "Write a function 'sumArray(arr)' in your favorite language to return the sum of all elements in an array. Trace its time complexity.",
            solution: "function sumArray(arr) {\n  let sum = 0;\n  for(let i=0; i<arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}\n// Time Complexity: O(N), Space Complexity: O(1)",
          }
        ],
        quiz: [
          {
            question: "Which notation represents the absolute worst-case bound?",
            options: ["Big-O", "Big-Theta", "Big-Omega", "Little-o"],
            answer: 0,
          },
          {
            question: "What is the space complexity of a recursive function that goes N levels deep with local variables of size O(1) in each stack frame?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
            answer: 2,
          },
          {
            question: "Which of the following is stored in contiguous memory locations?",
            options: ["Linked List", "Singly Dynamic Array", "Binary Tree Nodes", "Hash Map Bucket list"],
            answer: 1,
          },
          {
            question: "What does amortized time complexity represent?",
            options: ["The absolute worst runtime ever.", "The average runtime over a sequence of operations.", "The absolute best case scenario.", "The compiler compile-time limit."],
            answer: 1,
          },
          {
            question: "Which data structure is best suited for index-based random access?",
            options: ["Queue", "Linked List", "Stack", "Array"],
            answer: 3,
          }
        ]
      },
      {
        level: 2,
        title: "Intermediate Structures",
        description: "Dynamic memory structures, stacks, queues, and basic search/sort algorithms.",
        topics: [
          {
            title: "Linear Data Structures (Part 2)",
            subtopics: [
              {
                title: "Linked Lists",
                content: "Singly, doubly, and circular linked lists. Head manipulation, pointers, and traversal.",
                formulas: "Access: O(N); Insert at head: O(1)",
                summary: "Nodes linked together using pointers. Offers easy insertions/deletions at the cost of O(N) access times.",
                mistakes: "Losing references during insertion, causing memory leaks or broken list loops.",
                tips: "Always draw node pointer transitions on paper before writing pointer logic.",
              },
              {
                title: "Stacks & Queues",
                content: "LIFO vs FIFO logic. Implementations using arrays and linked lists.",
                formulas: "Push/Pop/Enqueue/Dequeue: O(1)",
                summary: "Stacks (LIFO) and Queues (FIFO) restrict operations to endpoints. Essential for traversal and call parsing.",
                mistakes: "Overflow when using arrays; forgetting null checks on pop/dequeue in linked lists.",
                tips: "Use stacks for backtracking and matching parenthesis. Use queues for task sequencing.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "dsa-p3",
            type: "MCQ",
            question: "Which data structure is typically used to implement recursion?",
            options: ["Queue", "Stack", "Tree", "Graph"],
            answer: 1,
            explanation: "The system call stack keeps track of active method executions, pushing frames on function call and popping on return.",
          },
          {
            id: "dsa-p4",
            type: "Coding Question",
            question: "Write a function 'reverseList(head)' that reverses a singly linked list. Return the new head node.",
            solution: "function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while(curr !== null) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}",
          }
        ],
        quiz: [
          {
            question: "In double-ended queue (Deque), insertion is possible at:",
            options: ["Only Front", "Only Rear", "Both Front and Rear", "Only Center"],
            answer: 2,
          },
          {
            question: "What is the time complexity of searching an element in a singly linked list of length N?",
            options: ["O(1)", "O(log N)", "O(N)", "O(1) amortized"],
            answer: 2,
          },
          {
            question: "Which stack operation retrieves the top element without removing it?",
            options: ["Pop", "Push", "Peek", "Clear"],
            answer: 2,
          },
          {
            question: "If a queue is implemented using a circular array, how do we advance the rear pointer?",
            options: ["rear++", "rear = (rear + 1) % size", "rear = rear - 1", "rear = size + 1"],
            answer: 1,
          },
          {
            question: "Which algorithmic strategy is used in Binary Search?",
            options: ["Greedy approach", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
            answer: 2,
          }
        ]
      },
      {
        level: 3,
        title: "Advanced Data Structures",
        description: "Hierarchical trees, traversal modes, priority heaps, hashing, and graph networks.",
        topics: [
          {
            title: "Trees & Binary Search Trees",
            subtopics: [
              {
                title: "Binary Tree Traversals",
                content: "Inorder, Preorder, Postorder traversals and Level Order (BFS).",
                formulas: "Time Complexity: O(N); Space Complexity: O(H) (height of tree)",
                summary: "Trees represent hierarchical data. Traversals visit nodes in systematic order recursively or iteratively.",
                mistakes: "Assuming height H is always log N (it can be N for skewed trees).",
                tips: "Inorder of BST always returns elements in sorted ascending order.",
              }
            ]
          },
          {
            title: "Heaps & Hash Tables",
            subtopics: [
              {
                title: "Binary Heaps",
                content: "Max-heap, Min-heap structures, heapify process, and priority queues.",
                formulas: "Insertion/Extraction: O(log N); Build Heap: O(N)",
                summary: "Nearly complete binary trees keeping priority conditions. Excellent for finding minimum or maximum values quickly.",
                mistakes: "Conflating heaps with heap memory allocations in languages like Java/C++.",
                tips: "Use heaps whenever you need top-k elements or scheduling orders dynamically.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "dsa-p5",
            type: "MCQ",
            question: "What is the height of a skewed binary tree with N nodes?",
            options: ["log N", "N", "N log N", "2^N"],
            answer: 1,
            explanation: "A skewed binary tree is essentially a linear chain of nodes, meaning its height is N.",
          }
        ],
        miniProject: {
          title: "Graph Traversal Visualizer",
          description: "Build an interactive graph traversal utility that simulates Depth-First Search (DFS) and Breadth-First Search (BFS) step-by-step.",
          objectives: [
            "Create a visual/textual node grid representing graph connections.",
            "Implement DFS using recursion/stack structures.",
            "Implement BFS using queue structures.",
            "Log the visitation order of nodes clearly.",
            "Handle cyclic graphs without infinite loops."
          ],
        },
        quiz: [
          {
            question: "In a min-heap, where is the minimum element always located?",
            options: ["Leaf node", "Root node", "Left child of root", "Right child of root"],
            answer: 1,
          },
          {
            question: "Which tree traversal strategy processes the root node BEFORE its children?",
            options: ["Inorder", "Preorder", "Postorder", "Level-order"],
            answer: 1,
          },
          {
            question: "What occurs when two distinct keys hash to the same table index?",
            options: ["Hash Overflow", "Collision", "De-hashing", "Exception trigger"],
            answer: 1,
          },
          {
            question: "What is the worst-case search complexity in a hash table with poor hash function distributing keys to a single bucket?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            answer: 2,
          },
          {
            question: "A binary tree is balanced if the height difference between left and right subtrees is at most:",
            options: ["0", "1", "2", "3"],
            answer: 1,
          }
        ]
      },
      {
        level: 4,
        title: "Advanced Algorithms",
        description: "Dynamic programming, optimization techniques, greedy schedules, and complex system designs.",
        topics: [
          {
            title: "Dynamic Programming",
            subtopics: [
              {
                title: "DP Foundations",
                content: "Overlapping subproblems, optimal substructure, memoization (Top-down) vs tabulation (Bottom-up).",
                formulas: "Fibonacci recurrence: F(n) = F(n-1) + F(n-2)",
                summary: "Dynamic Programming optimizes recursive approaches by saving outputs to subproblems, eliminating redundant steps.",
                mistakes: "Trying to apply DP when subproblems are not overlapping or optimal substructure is absent.",
                tips: "Identify subproblems, write the recursive relation, then add a memoization table (array/map).",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "dsa-p6",
            type: "Coding Question",
            question: "Implement the Fibonacci function using bottom-up tabulation to run in O(N) time and O(1) space.",
            solution: "function fib(n) {\n  if(n <= 1) return n;\n  let prev2 = 0, prev1 = 1;\n  for(let i=2; i<=n; i++) {\n    let curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}",
          }
        ],
        miniProject: {
          title: "Custom Cache Engine",
          description: "Implement a fully testable client-side cache memory engine using Least Recently Used (LRU) or Least Frequently Used (LFU) eviction algorithms.",
          objectives: [
            "Initialize the cache store with a maximum capacity constraint.",
            "Write a get(key) method that reads values and marks keys as active.",
            "Write a put(key, value) method that adds values and evicts the least recently/frequently used item when over capacity.",
            "Accomplish all cache lookups and updates in O(1) average time.",
            "Test cache validity with custom key insertions."
          ],
        },
        quiz: [
          {
            question: "Which optimization technique relies on memoizing overlaps?",
            options: ["Greedy approach", "Dynamic Programming", "Divide and conquer", "Linear search"],
            answer: 1,
          },
          {
            question: "What is the time complexity of the classic Knapsack 0/1 problem using DP (with N items and capacity W)?",
            options: ["O(N)", "O(2^N)", "O(N * W)", "O(N log W)"],
            answer: 2,
          },
          {
            question: "Which algorithm finds the shortest path from a single source to all vertices in a weighted graph without negative edges?",
            options: ["Kruskal's", "Dijkstra's", "Prim's", "Floyd-Warshall"],
            answer: 1,
          },
          {
            question: "What is a primary characteristic of a Greedy algorithm?",
            options: ["It re-evaluates all decisions at each step.", "It makes the locally optimal choice at each step.", "It uses recursion to backtrack.", "It yields the global optimum for every optimization task."],
            answer: 1,
          },
          {
            question: "Which sorting algorithm splits arrays recursively, sorts halves, and joins them back in O(N log N)?",
            options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
            answer: 2,
          }
        ]
      }
    ];
  } else if (category === "Programming") {
    levelsContent = [
      {
        level: 1,
        title: "Programming Foundations",
        description: "Variables, basic operations, controls, loops, and custom functions.",
        topics: [
          {
            title: "Core Syntax & Controls",
            subtopics: [
              {
                title: "Variables & Data Types",
                content: "Declaring variables, dynamically vs statically typed scopes, numbers, strings, booleans, and null values.",
                formulas: "Type Check: typeof(x) in JS, type(x) in Python",
                summary: "Variables hold values. Knowing data types prevents logical runtime errors during arithmetic and concat operations.",
                mistakes: "Mixing variable types, causing unexpected string coercions (e.g. 5 + '5' = '55').",
                tips: "Use constants (const/final) for elements that should never change values.",
              },
              {
                title: "Control Flow & Iteration",
                content: "If-else statements, switch statements, while and for-loops, break, and continue logic.",
                formulas: "Iteration depth = N steps",
                summary: "Controls instruct the computer which branch of execution to follow. Loops execute tasks repeatedly.",
                mistakes: "Infinite loops from missing update expressions inside while-loop blocks.",
                tips: "Write loop conditions that eventually become false, and initialize iterator states clearly.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "prog-p1",
            type: "MCQ",
            question: "Which of the following creates a block-scoped variable in modern JavaScript?",
            options: ["var", "let", "global", "define"],
            answer: 1,
            explanation: "'let' and 'const' enforce block scoping, whereas 'var' uses function scoping.",
          },
          {
            id: "prog-p2",
            type: "Coding Question",
            question: "Write a function 'isEven(num)' that returns true if a number is even, and false otherwise.",
            solution: "function isEven(num) {\n  return num % 2 === 0;\n}",
          }
        ],
        quiz: [
          {
            question: "Which operator checks both value and type equality in JavaScript?",
            options: ["=", "==", "===", "!="],
            answer: 2,
          },
          {
            question: "Which data type represents list sequence collections in Python?",
            options: ["Dict", "List", "Set", "Tuple"],
            answer: 1,
          },
          {
            question: "What keyword stops loop iteration immediately?",
            options: ["continue", "exit", "break", "return"],
            answer: 2,
          },
          {
            question: "Which loop runs at least once, even if the condition is false?",
            options: ["for", "while", "do-while", "foreach"],
            answer: 2,
          },
          {
            question: "What represents a function defined inside a class structure?",
            options: ["Procedure", "Variable", "Method", "Constructor"],
            answer: 2,
          }
        ]
      },
      {
        level: 2,
        title: "Object-Oriented & Core Concepts",
        description: "Classes, objects, encapsulations, file reading/writing, and error handling.",
        topics: [
          {
            title: "OOP Basics",
            subtopics: [
              {
                title: "Classes & Inheritance",
                content: "Creating custom class objects, constructors, super keyword, and method overrides.",
                formulas: "ChildClass extends ParentClass",
                summary: "OOP encapsulates state and behavior into reusable class definitions. Inheritance prevents repeating templates.",
                mistakes: "Deep hierarchy inheritance levels that make files hard to debug.",
                tips: "Prefer composition over deep inheritance trees where appropriate.",
              }
            ]
          },
          {
            title: "Exception Handling & I/O",
            subtopics: [
              {
                title: "Try-Catch Blocks",
                content: "Handling run-time failures, error propagation, throwing exceptions, and finally code blocks.",
                formulas: "try { ... } catch (err) { ... } finally { ... }",
                summary: "Graceful error capture prevents application crashes and maintains visual experiences.",
                mistakes: "Using empty catch blocks that silence errors, making debugging impossible.",
                tips: "Always log or report errors in catch blocks, or rethrow them if they cannot be handled locally.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "prog-p3",
            type: "MCQ",
            question: "What OOP concept hides internal object properties and limits access to getter methods?",
            options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
            answer: 2,
            explanation: "Encapsulation keeps fields private, exposing actions through public methods (getter/setter).",
          }
        ],
        quiz: [
          {
            question: "Which keyword instantiates an object from a class definition?",
            options: ["create", "new", "init", "instance"],
            answer: 1,
          },
          {
            question: "What blocks of code always execute regardless of whether an exception was thrown?",
            options: ["try", "catch", "finally", "else"],
            answer: 2,
          },
          {
            question: "Which function converts a JSON string into an object/dictionary?",
            options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.eval()"],
            answer: 1,
          },
          {
            question: "In Python, which statement opens files safely and closes them automatically?",
            options: ["open()", "with open() as file:", "try open()", "file = open()"],
            answer: 1,
          },
          {
            question: "Which OOP concept describes method names that act differently depending on the objects calling them?",
            options: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"],
            answer: 2,
          }
        ]
      },
      {
        level: 3,
        title: "Integration & Development",
        description: "Databases, API queries, data fetching, and state interactions.",
        topics: [
          {
            title: "Web Services & APIs",
            subtopics: [
              {
                title: "REST APIs & Fetching",
                content: "HTTP verbs (GET, POST, PUT, DELETE), JSON structures, fetch APIs, and parsing responses.",
                formulas: "fetch(url).then(res => res.json())",
                summary: "HTTP requests allow client interfaces to pull dynamic data from databases and external microservices.",
                mistakes: "Not handling network failure cases, leaving load states spinning forever.",
                tips: "Validate network status codes (e.g. res.ok) before parsing responses.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "prog-p4",
            type: "Coding Question",
            question: "Write an async function 'fetchUserData(url)' that retrieves profiles and catches potential exceptions.",
            solution: "async function fetchUserData(url) {\n  try {\n    let response = await fetch(url);\n    if(!response.ok) throw new Error('Fetch failed');\n    return await response.json();\n  } catch (error) {\n    console.error(error);\n    return null;\n  }\n}",
          }
        ],
        miniProject: {
          title: "Task Planner Application",
          description: "Build a structured frontend application that loads, inserts, updates, and deletes tasks from a mock database server.",
          objectives: [
            "Create responsive dashboard layouts listing tasks.",
            "Allow filtering tasks based on priority or status.",
            "Write POST/PUT forms to create and edit tasks.",
            "Simulate network latencies with mock loading indicators.",
            "Persist task collections inside localStorage."
          ],
        },
        quiz: [
          {
            question: "Which HTTP request method should be used to create a new resource on a server?",
            options: ["GET", "POST", "PUT", "DELETE"],
            answer: 1,
          },
          {
            question: "Which status code represents a successful REST API fetch operation?",
            options: ["200 OK", "404 Not Found", "500 Server Error", "302 Redirect"],
            answer: 0,
          },
          {
            question: "What storage mechanism persists data even after the browser window is closed?",
            options: ["SessionStorage", "Cookies", "LocalStorage", "State variable"],
            answer: 2,
          },
          {
            question: "What header is used to specify that JSON content is being sent in an HTTP request?",
            options: ["Accept: text/html", "Content-Type: application/json", "Authorization: Bearer key", "Host: local"],
            answer: 1,
          },
          {
            question: "What does XML/JSON stand for in API structures?",
            options: ["Binary layouts", "Serialized data exchange formats", "Assembly protocols", "CSS stylesheet selectors"],
            answer: 1,
          }
        ]
      },
      {
        level: 4,
        title: "Advanced Development",
        description: "Asynchronous behaviors, concurrency, memory models, and unit testing.",
        topics: [
          {
            title: "Advanced Concurrency",
            subtopics: [
              {
                title: "Asynchronous Patterns",
                content: "Event loops, callbacks, promise methods (Promise.all), and thread concepts.",
                formulas: "Promise.all([p1, p2, p3])",
                summary: "Asynchronous processing lets applications run background tasks without blocking interface operations.",
                mistakes: "Creating sequential lookups when tasks could be fired in parallel.",
                tips: "Use Promise.all to fetch independent endpoints concurrently, shortening load times.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "prog-p5",
            type: "MCQ",
            question: "What does Promise.all() do if any of the passed promises reject?",
            options: [
              "It waits for all others to complete and ignores the failure.",
              "It rejects immediately with the first error encountered.",
              "It returns resolved values alongside the errors.",
              "It re-executes the failed promise automatically."
            ],
            answer: 1,
            explanation: "Promise.all is all-or-nothing. If any promise rejects, the entire combined promise rejects immediately.",
          }
        ],
        miniProject: {
          title: "Real-time Messaging Client",
          description: "Build a real-time message simulator displaying channel logs, active typing states, and status indicator components.",
          objectives: [
            "Design modern, scrollable chat panel layouts.",
            "Write simulated WebSocket message listeners returning automatic responses.",
            "Log typing indicators when a mock user responds.",
            "Track message delivery times and show 'Read' receipt checks.",
            "Scroll to the bottom of the chat panel on incoming messages."
          ],
        },
        quiz: [
          {
            question: "Which component handles asynchronous task execution queues inside JavaScript?",
            options: ["Call Stack", "Event Loop", "Memory Heap", "Garbage Collector"],
            answer: 1,
          },
          {
            question: "What is a pure function?",
            options: [
              "A function that modifies global states.",
              "A function that always returns the same output for the same input and has no side effects.",
              "A function written without return statements.",
              "A function that can only accept numbers."
            ],
            answer: 1,
          },
          {
            question: "Which tool executes test specs and validates assertions in code modules?",
            options: ["Linter", "Bundler", "Test Runner/Framework (e.g. Jest)", "Transpiler"],
            answer: 2,
          },
          {
            question: "What design pattern manages application states globally across hierarchies?",
            options: ["Singleton pattern", "State container (e.g. Redux/Context)", "Observer pattern", "Factory pattern"],
            answer: 1,
          },
          {
            question: "Which of the following increases web app bundle compilation speed?",
            options: ["Tree Shaking", "Infinite looping", "Adding dependencies", "Inline CSS styling"],
            answer: 0,
          }
        ]
      }
    ];
  } else if (category === "Mathematics") {
    levelsContent = [
      {
        level: 1,
        title: "Mathematics Fundamentals",
        description: "Basic functions, algebra, and essential numerical graphs.",
        topics: [
          {
            title: "Algebraic Foundations",
            subtopics: [
              {
                title: "Linear Equations",
                content: "Solving linear variables, coordinate slopes, and intersections.",
                formulas: "y = mx + c",
                summary: "Algebra represents relationships between parameters. Essential for plotting curves and solving systems.",
                mistakes: "Sign errors when transposing terms across equals signs.",
                tips: "Visualize linear equations as straight lines on cartesian grids.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "math-p1",
            type: "MCQ",
            question: "What is the slope of the line given by the equation 2y - 4x = 10?",
            options: ["-2", "2", "4", "5"],
            answer: 1,
            explanation: "Rewrite in slope-intercept form (y = mx + c): 2y = 4x + 10 => y = 2x + 5. The slope m is 2.",
          }
        ],
        quiz: [
          {
            question: "What is the slope of a horizontal line?",
            options: ["0", "1", "Undefined", "Infinity"],
            answer: 0,
          },
          {
            question: "Solve for x in: 3x - 7 = 8.",
            options: ["3", "5", "15", "x = 0"],
            answer: 1,
          },
          {
            question: "What is the intersection of two linear lines representing parallel systems?",
            options: ["Origin point", "No intersection", "Infinitely many points", "A single coordinate"],
            answer: 1,
          },
          {
            question: "Which function class has a variable inside exponents?",
            options: ["Linear", "Quadratic", "Exponential", "Logarithmic"],
            answer: 2,
          },
          {
            question: "What is log base 2 of 8?",
            options: ["2", "3", "4", "8"],
            answer: 1,
          }
        ]
      },
      {
        level: 2,
        title: "Calculus & Derivative Rules",
        description: "Rates of change, derivatives, limits, and integral concepts.",
        topics: [
          {
            title: "Calculus Foundations",
            subtopics: [
              {
                title: "Derivatives Basics",
                content: "Limits, derivative rules (power rule, product rule, chain rule), and local optimization.",
                formulas: "d/dx(x^n) = nx^(n-1)",
                summary: "Derivatives measure instant rates of change. Vital for optimization, curve analysis, and gradient descent.",
                mistakes: "Forgetting the chain rule when differentiating nested equations.",
                tips: "Visualize derivatives as slopes of tangents to curves at specific coordinates.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "math-p2",
            type: "Coding Question",
            question: "Calculate the derivative of f(x) = 3x² + 5x - 7.",
            solution: "f'(x) = d/dx(3x² + 5x - 7) = 6x + 5",
          }
        ],
        quiz: [
          {
            question: "What is the derivative of f(x) = sin(x)?",
            options: ["-cos(x)", "cos(x)", "sin(x)", "sec²(x)"],
            answer: 1,
          },
          {
            question: "What does the second derivative measure about a curve?",
            options: ["Tangent slope", "Area", "Concavity", "Intercept"],
            answer: 2,
          },
          {
            question: "Differentiate f(x) = e^(2x) using the chain rule.",
            options: ["e^(2x)", "2e^(2x)", "2xe^(2x)", "e^(x)"],
            answer: 1,
          },
          {
            question: "At a local maximum, what is the value of the first derivative?",
            options: ["Negative", "Positive", "Zero", "Infinite"],
            answer: 2,
          },
          {
            question: "Which calculus operation reverses differentiation?",
            options: ["Limit", "Integration", "Summation", "Factorization"],
            answer: 1,
          }
        ]
      },
      {
        level: 3,
        title: "Probability & Statistics",
        description: "Distributions, statistics, variance, averages, and probability spaces.",
        topics: [
          {
            title: "Probability Models",
            subtopics: [
              {
                title: "Averages & Variances",
                content: "Mean, median, mode, standard deviation, and variance equations.",
                formulas: "Variance: σ² = Σ(xi - μ)² / N",
                summary: "Descriptive statistics summarize data distributions. Variance tells us how spread out coordinates are.",
                mistakes: "Using standard deviation values instead of variance values in standard mathematical equations.",
                tips: "Standard deviation shares the same units as the mean, making it easier to evaluate deviations.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "math-p3",
            type: "MCQ",
            question: "A fair die is rolled. What is the probability of getting an even number?",
            options: ["1/6", "1/3", "1/2", "2/3"],
            answer: 2,
            explanation: "Even outcomes are {2, 4, 6} (3 possibilities out of 6). P(Even) = 3/6 = 1/2.",
          }
        ],
        miniProject: {
          title: "Statistical Data Analyzer",
          description: "Build an interactive analyzer that calculates descriptive stats, normal distributions, and graphs trends.",
          objectives: [
            "Accept list arrays of numbers as inputs.",
            "Compute mean, median, mode, variance, and standard deviation.",
            "Generate sample distributions based on data entries.",
            "Expose sorting filters to find outliers.",
            "Plot simple histogram layouts using HTML divs."
          ],
        },
        quiz: [
          {
            question: "What is the sum of all probabilities in a sample space?",
            options: ["0", "1", "100", "0.5"],
            answer: 1,
          },
          {
            question: "Which statistic represents the middle value in a sorted dataset?",
            options: ["Mean", "Median", "Mode", "Variance"],
            answer: 1,
          },
          {
            question: "If the variance of a dataset is 25, what is the standard deviation?",
            options: ["5", "12.5", "50", "2.5"],
            answer: 0,
          },
          {
            question: "Which distribution is symmetrical and bell-shaped around its mean?",
            options: ["Poisson", "Binomial", "Normal (Gaussian)", "Exponential"],
            answer: 2,
          },
          {
            question: "Which theorem calculates conditional probability updates based on new evidence?",
            options: ["Central Limit Theorem", "Bayes' Theorem", "Law of Large Numbers", "Pythagorean Theorem"],
            answer: 1,
          }
        ]
      },
      {
        level: 4,
        title: "Advanced Math & Optimization",
        description: "Vector spaces, matrix algebra, multi-variable optimization, and machine learning mathematics.",
        topics: [
          {
            title: "Linear Algebra & Optimization",
            subtopics: [
              {
                title: "Gradient Descent Math",
                content: "Partial derivatives, gradient vectors, and optimization updates.",
                formulas: "x_new = x_old - α * ∇f(x)",
                summary: "Optimizers locate minimum values of multi-dimensional loss landscapes by taking steps along descending gradients.",
                mistakes: "Using learning rates (α) that are too high, causing optimization steps to overshoot and diverge.",
                tips: "Start with small learning rates (e.g. 0.01) to verify model convergences.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "math-p4",
            type: "Coding Question",
            question: "Write down the step equation of Gradient Descent updates for a single variable x.",
            solution: "x(t+1) = x(t) - alpha * f'(x(t))\nwhere alpha is the learning rate.",
          }
        ],
        miniProject: {
          title: "Linear Regression Simulator",
          description: "Build an interactive linear regression model that updates the line parameters (slope & intercept) dynamically.",
          objectives: [
            "Plot scattered coordinate points on virtual charts.",
            "Write fitting algorithms to calculate mean squared error loss.",
            "Optimize weights step-by-step using gradient derivatives.",
            "Animate regression lines fitting data points.",
            "Predict coordinate outcomes based on custom x values."
          ],
        },
        quiz: [
          {
            question: "What vector contains all partial derivatives of a multi-variable function?",
            options: ["Determinant", "Gradient", "Eigenvector", "Hessian"],
            answer: 1,
          },
          {
            question: "What is a matrix?",
            options: ["A single number value.", "A rectangular array of numbers arranged in rows and columns.", "A mathematical curve.", "A coordinate system vector of length 1."],
            answer: 1,
          },
          {
            question: "Which operation yields a scalar value from two vectors?",
            options: ["Cross Product", "Dot Product", "Matrix Addition", "Vector Multiplication"],
            answer: 1,
          },
          {
            question: "What indicates that a matrix cannot be inverted?",
            options: ["Its determinant is 1.", "Its determinant is 0.", "It has complex numbers.", "It is a square matrix."],
            answer: 1,
          },
          {
            question: "In ML, what calculates the difference between predicted values and actual targets?",
            options: ["Optimizer function", "Loss/Cost function", "Activation function", "Regularization factor"],
            answer: 1,
          }
        ]
      }
    ];
  } else {
    // Default Theory Subject (e.g., DBMS, OS, Computer Networks, generic theory)
    levelsContent = [
      {
        level: 1,
        title: "Theoretical Foundations",
        description: "Core architectural terms, basic models, definitions, and history.",
        topics: [
          {
            title: "Introduction to Concepts",
            subtopics: [
              {
                title: "Basic Definitions",
                content: "Core building blocks, key terminologies, and system boundaries.",
                formulas: "Efficiency = Output / Input",
                summary: "Understanding basic definitions creates a solid foundation for complex system behaviors.",
                mistakes: "Skipping foundational rules and attempting to configure advanced components directly.",
                tips: "Create flashcards for core terms to review them regularly.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "theo-p1",
            type: "MCQ",
            question: "What is the primary purpose of separating a system into modules?",
            options: ["Increase memory use", "Reduce complexity and isolate bugs", "Speed up compilers", "Enforce strict encryption"],
            answer: 1,
            explanation: "Modularization splits systems into independent units, reducing complex interdependencies.",
          }
        ],
        quiz: [
          {
            question: "Which layer acts as the interface between user tasks and machine hardware?",
            options: ["Operating System", "Compiler", "Driver", "Application"],
            answer: 0,
          },
          {
            question: "What does modularity aim to achieve?",
            options: ["High coupling", "Low cohesion", "High cohesion and low coupling", "No connections"],
            answer: 2,
          },
          {
            question: "What keeps track of resource usage inside processes?",
            options: ["Scheduler", "System logs/Control block", "RAM", "Compiler"],
            answer: 1,
          },
          {
            question: "Which of the following is an example of hardware resource?",
            options: ["File directory", "Process thread", "CPU scheduler", "Central Processing Unit (CPU)"],
            answer: 3,
          },
          {
            question: "Which principle restricts system access to only authorized entities?",
            options: ["Concurrency", "Security/Access Control", "Caching", "Persistence"],
            answer: 1,
          }
        ]
      },
      {
        level: 2,
        title: "Core System Architectures",
        description: "Data organization, scheduling rules, relational structures, and component operations.",
        topics: [
          {
            title: "Component Scheduling",
            subtopics: [
              {
                title: "Scheduling Policies",
                content: "Resource sharing, FIFO queues, Round Robin, prioritization schemes, and preemptive policies.",
                formulas: "Average Turnaround = ∑(Finish Time - Arrival Time) / N",
                summary: "Schedulers distribute limited resources among multiple active tasks to optimize throughput.",
                mistakes: "Not checking for starvation issues in strict priority schedules.",
                tips: "Round Robin prevents process starvation by giving equal run slices to each task.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "theo-p2",
            type: "Coding Question",
            question: "Explain the main difference between preemptive and non-preemptive scheduling policies.",
            solution: "Preemptive scheduling allows the system to interrupt a running process and assign the CPU to another. Non-preemptive scheduling keeps the process running until it finishes or blocks.",
          }
        ],
        quiz: [
          {
            question: "What scheduling policy assigns equal time slices to each active task in a loop?",
            options: ["FIFO", "LIFO", "Round Robin", "Priority Scheduling"],
            answer: 2,
          },
          {
            question: "What occurs when a process is permanently denied resources in favor of higher-priority tasks?",
            options: ["Deadlock", "Starvation", "Context Switch", "Interrupt"],
            answer: 1,
          },
          {
            question: "Which database component maintains data ACID consistency across concurrent access?",
            options: ["SQL compiler", "Transaction Manager", "Buffer pool", "Index node"],
            answer: 1,
          },
          {
            question: "What index structure is widely used in RDBMS due to its efficient range queries?",
            options: ["Hash index", "B+ Tree", "Singly linked index", "Flat file list"],
            answer: 1,
          },
          {
            question: "What does data serialization do?",
            options: ["Compresses file size", "Converts structures into byte streams for storage or transport", "Encrypts DB keys", "Formats HTML tags"],
            answer: 1,
          }
        ]
      },
      {
        level: 3,
        title: "System Integration & Applications",
        description: "Resource conflicts, concurrency control, consistency, and network communication.",
        topics: [
          {
            title: "Concurrency Control",
            subtopics: [
              {
                title: "Deadlocks & Resource Locks",
                content: "Shared locks, exclusive locks, deadlock avoidance, detection, and mitigation strategies.",
                formulas: "Resource allocation graph cycles",
                summary: "Locks control concurrent modifications, preventing race conditions and keeping system states consistent.",
                mistakes: "Holding locks for too long, causing high concurrency delays.",
                tips: "Release locks as soon as operations complete to keep the system responsive.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "theo-p3",
            type: "MCQ",
            question: "Which of the following is NOT one of the Coffman conditions required for a deadlock?",
            options: ["Mutual Exclusion", "No Preemption", "Hold and Wait", "Preemptive resource reallocation"],
            answer: 3,
            explanation: "Preemptive allocation breaks deadlock states. The fourth condition is Circular Wait.",
          }
        ],
        miniProject: {
          title: "SQL Query Planner Simulator",
          description: "Build an interactive query analyzer showing execution paths, indexes used, and estimated execution costs.",
          objectives: [
            "Create a schema parser that tracks table indexes.",
            "Display visual trees of query execution plans (e.g. Scan vs Seek).",
            "Calculate estimated execution costs based on table sizes.",
            "Suggest indices when queries search unindexed columns.",
            "Simulate performance gains with index tuning."
          ],
        },
        quiz: [
          {
            question: "Which Coffman condition is broken to prevent deadlocks by forcing processes to request all resources at once?",
            options: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"],
            answer: 1,
          },
          {
            question: "What does transactional 'isolation' guarantee?",
            options: ["Persistence", "Concurrent transactions execute independently without interference", "System safety", "Formatting validity"],
            answer: 1,
          },
          {
            question: "What protocol coordinates updates across distributed nodes to guarantee transactional consistency?",
            options: ["HTTP", "Two-Phase Commit (2PC)", "DNS lookup", "SMTP mail routing"],
            answer: 1,
          },
          {
            question: "What does the CAP theorem state about distributed databases?",
            options: ["CP or AP is achievable, but you cannot guarantee Consistency, Availability, and Partition tolerance all at once.", "Consistency is always guaranteed.", "Availability is never guaranteed.", "All distributed databases must be NoSQL."],
            answer: 0,
          },
          {
            question: "What caching strategy updates both cache memory and background database tables simultaneously?",
            options: ["Write-back", "Write-through", "Cache-aside", "No-write"],
            answer: 1,
          }
        ]
      },
      {
        level: 4,
        title: "Advanced System Topics",
        description: "Distributed networks, scaling strategies, query optimization, and modern system designs.",
        topics: [
          {
            title: "Scale & Performance",
            subtopics: [
              {
                title: "Horizontal vs Vertical Scaling",
                content: "Adding server instances, load balancers, database sharding, caching layers, and database clusters.",
                formulas: "System capacity = N servers * Instance capacity",
                summary: "Scaling keeps systems responsive under high user load. Sharding divides databases across cluster machines.",
                mistakes: "Assuming vertical scaling is limitless. Hard hardware bounds exist.",
                tips: "Use horizontal scaling with load balancers for highly available, fault-tolerant architectures.",
              }
            ]
          }
        ],
        practiceQuestions: [
          {
            id: "theo-p4",
            type: "Coding Question",
            question: "Write down the definition of Database Sharding and describe its benefits.",
            solution: "Database Sharding partitions a database horizontally into multiple smaller physical nodes (shards). This improves read/write capacity and fits huge scale networks.",
          }
        ],
        miniProject: {
          title: "Distributed File Node Tracker",
          description: "Build an interactive visualizer simulating files stored across server instances and managed by hash rings.",
          objectives: [
            "Visualize server nodes on circular rings.",
            "Map file keys to active nodes using consistent hashing.",
            "Simulate adding/removing nodes and track key shifts.",
            "Track file replication across adjacent nodes.",
            "Report node failures and recovery steps."
          ],
        },
        quiz: [
          {
            question: "What is sharding?",
            options: [
              "Encrypting table fields.",
              "Partitioning database tables horizontally across multiple server nodes.",
              "Creating duplicate indexes.",
              "Backing up database tables daily."
            ],
            answer: 1,
          },
          {
            question: "Which component routes incoming web traffic across redundant application servers?",
            options: ["DNS Server", "Load Balancer", "Firewall", "Proxy Server"],
            answer: 1,
          },
          {
            question: "What describes database sharding replication where one server accepts writes and updates read-only servers?",
            options: ["Primary-Secondary replication", "Multi-master setup", "Peer-to-peer setup", "Disconnected setup"],
            answer: 0,
          },
          {
            question: "Which indexing approach partitions tables based on hashes or range checks?",
            options: ["Primary key indexing", "Partitioned indexing", "Secondary indexing", "B-tree indexing"],
            answer: 1,
          },
          {
            question: "What database class is designed without rigid table schemas to support fast horizontal scaling?",
            options: ["Relational Database (RDBMS)", "NoSQL Database", "Object-oriented Database", "Flat CSV Files"],
            answer: 1,
          }
        ]
      }
    ];
  }

  // 3. Estimate completion items
  const stats = {
    estimatedDays: totalDays,
    estimatedWeeks: totalWeeks,
    totalLevels: 4,
    totalTopics: levelsContent.reduce((acc, lvl) => acc + lvl.topics.length, 0),
    totalPracticeQuestions: levelsContent.reduce((acc, lvl) => acc + lvl.practiceQuestions.length, 0),
    totalQuizzes: levelsContent.reduce((acc, lvl) => acc + lvl.quiz.length, 0),
    totalProjects: levelsContent.reduce((acc, lvl) => acc + (lvl.miniProject ? 1 : 0), 0)
  };

  // 4. Construct response structure
  return {
    subject: formattedSubject,
    category,
    goal,
    currentSkillLevel,
    dailyStudyTime,
    revisionFrequency,
    assessmentScore,
    startingLevel,
    stats,
    levels: levelsContent
  };
}
