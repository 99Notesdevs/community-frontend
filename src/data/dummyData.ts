// Dummy data for the community platform

export const dummyPosts = [
  {
    id: '1',
    title: 'The Future of Web Development: What to Expect in 2024',
    content: 'As we move into 2024, web development continues to evolve at a rapid pace. From AI-powered development tools to new frameworks and libraries, developers have more options than ever before.\n\nSome key trends to watch:\n• AI-assisted coding becoming mainstream\n• WebAssembly adoption growing\n• Micro-frontends architecture\n• Enhanced web performance with Core Web Vitals\n• Progressive Web Apps becoming more powerful\n\nWhat are your thoughts on these trends? Which ones are you most excited about?',
    author: 'techguru_2024',
    community: 'r/webdev',
    communityIcon: '🌐',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    votes: 1247,
    comments: 89,
    imageUrl: undefined,
    link: 'https://developer.mozilla.org/en-US/docs/Web'
  },
  {
    id: '2',
    title: 'Just built my first React app with TypeScript!',
    content: 'After months of learning JavaScript, I finally took the plunge into React and TypeScript. The learning curve was steep, but totally worth it!\n\nWhat I learned:\n• Type safety catches so many bugs early\n• Component reusability is amazing\n• Hooks make state management intuitive\n• The development experience is fantastic\n\nThanks to this community for all the helpful resources and encouragement!',
    author: 'newbie_coder',
    community: 'r/reactjs',
    communityIcon: '⚛️',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    votes: 892,
    comments: 67
  },
  {
    id: '3',
    title: 'Mind-blowing AI breakthrough: GPT-5 preview leaked!',
    content: 'Someone leaked what appears to be early access to GPT-5, and the capabilities are absolutely incredible. The reasoning abilities and code generation quality are on another level entirely.\n\nKey improvements I noticed:\n• Much better at complex reasoning\n• Generates cleaner, more efficient code\n• Better understanding of context\n• Fewer hallucinations\n\nThis is going to change everything for developers. What do you think?',
    author: 'ai_enthusiast',
    community: 'r/technology',
    communityIcon: '💻',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    votes: 3421,
    comments: 234,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Why I switched from Redux to Zustand and never looked back',
    content: 'After using Redux for years, I decided to try Zustand for a new project. The simplicity and performance gains blew me away.\n\nComparing the two:\n• Zustand: ~2.9kb vs Redux: ~47kb (with toolkit)\n• Much less boilerplate code\n• TypeScript support is excellent\n• No providers needed\n• Easier testing\n\nAnyone else made this switch? What has your experience been?',
    author: 'state_manager_pro',
    community: 'r/reactjs',
    communityIcon: '⚛️',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    votes: 567,
    comments: 43
  },
  {
    id: '5',
    title: 'Free resources that made me a better developer',
    content: 'Sharing some amazing free resources that significantly improved my coding skills:\n\n📚 Learning Platforms:\n• freeCodeCamp - Comprehensive courses\n• The Odin Project - Full-stack curriculum\n• MDN Web Docs - Best documentation\n\n🎥 YouTube Channels:\n• Traversy Media - Practical tutorials\n• Academind - In-depth concepts\n• Web Dev Simplified - Clear explanations\n\n🛠️ Tools:\n• VS Code - Best free editor\n• Git/GitHub - Version control\n• Figma - Design tool\n\nWhat free resources helped you the most?',
    author: 'helpful_dev',
    community: 'r/programming',
    communityIcon: '👨‍💻',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    votes: 2156,
    comments: 145
  }
];

export const dummyCommunities = [
  {
    id: '1',
    name: 'r/technology',
    displayName: 'Technology',
    description: 'The latest in technology news, reviews, and discussions',
    icon: '💻',
    members: 2100000,
    isJoined: true,
    rules: [
      'No spam or self-promotion',
      'Be respectful and civil',
      'Stay on topic',
      'No misleading titles'
    ]
  },
  {
    id: '2',
    name: 'r/programming',
    displayName: 'Programming',
    description: 'All things programming and software development',
    icon: '👨‍💻',
    members: 1800000,
    isJoined: true,
    rules: [
      'No homework help requests',
      'Search before posting',
      'Include relevant code examples',
      'Be constructive in criticism'
    ]
  },
  {
    id: '3',
    name: 'r/webdev',
    displayName: 'Web Development',
    description: 'A community for web developers',
    icon: '🌐',
    members: 890000,
    isJoined: true,
    rules: [
      'No portfolio showcases in main feed',
      'Use appropriate flairs',
      'Help others learn',
      'No direct job postings'
    ]
  },
  {
    id: '4',
    name: 'r/reactjs',
    displayName: 'React.js',
    description: 'A community for learning and developing with React',
    icon: '⚛️',
    members: 650000,
    isJoined: true,
    rules: [
      'Search existing posts first',
      'Include code examples',
      'Be specific with questions',
      'No job postings'
    ]
  },
  {
    id: '5',
    name: 'r/javascript',
    displayName: 'JavaScript',
    description: 'All about the JavaScript programming language',
    icon: '📜',
    members: 1200000,
    isJoined: false,
    rules: [
      'No basic questions without research',
      'Include relevant code',
      'Be helpful to beginners',
      'No framework wars'
    ]
  }
];

export const dummyUsers = [
  {
    id: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'JD',
    karma: 12456,
    joinDate: new Date('2022-03-15'),
    bio: 'Full-stack developer passionate about React and Node.js'
  },
  {
    id: '2',
    username: 'techguru_2024',
    displayName: 'Tech Guru',
    avatar: 'TG',
    karma: 45678,
    joinDate: new Date('2021-01-10'),
    bio: 'Technology enthusiast sharing insights about the latest trends'
  }
];

export const dummyMessages = [
  {
    id: '1',
    senderId: '2',
    senderName: 'techguru_2024',
    content: 'Hey! Saw your post about React hooks. Great explanation!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'john_doe',
    content: 'Thanks! I spent a lot of time researching that topic.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    isRead: true
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'techguru_2024',
    content: 'Would you be interested in collaborating on a project?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: false
  }
];