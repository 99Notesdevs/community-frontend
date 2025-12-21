import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MessageSquare, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Breakpoints
const BREAKPOINTS = {
  sm: 640,    // Mobile
  md: 768,    // Small tablets
  lg: 1024,   // Tablets/Laptops
  xl: 1280,   // Large desktops
};

// Custom hook to lock body scroll
const useLockBodyScroll = (isLocked: boolean) => {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  participants: string[];
  type: 'new' | 'existing';
  lastMessage?: string;
  updatedAt: string;
}

export const MessagesPage: React.FC = () => {
  // Lock body scroll when component mounts
  useLockBodyScroll(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < BREAKPOINTS.md);
  const [showChat, setShowChat] = useState(false);

  // Check for userId in URL params (coming from PostCard)
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      // Remove the param after reading it
      searchParams.delete('userId');
      setSearchParams(searchParams);
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.includes(userId)
      );
      
      if (existingConv) {
        setSelectedConversation(existingConv._id);
      } else {
        // Open new chat modal with userId pre-filled
        setUserIdInput(userId);
        setIsNewChatModalOpen(true);
      }
    }
  }, [searchParams, conversations, setSearchParams]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://auth.main.local:4000/api/conversations', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          // Add type: 'existing' to all conversations from the API
          const conversationsWithType = data.map((conv: any) => ({
            ...conv,
            type: 'existing' as const
          }));
          setConversations(conversationsWithType);
          if (conversationsWithType.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationsWithType[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < BREAKPOINTS.md;
      setIsMobileView(isMobile);
      
      // If we're on desktop and chat was hidden, show it
      if (!isMobile && !showChat) {
        setShowChat(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [showChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (isMobileView) {
      setShowChat(true);
    }
  };

  // Handle back to conversations list (mobile)
  const handleBackToConversations = () => {
    setShowChat(false);
  };

  // Load messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sort messages by date (oldest first) for display
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !socket) return;

    // Mark messages as read when conversation is selected
    socket.emit('MARK_READ', { conversationId: selectedConversation });

    // Load messages
    if (conversations.find(conv => conv._id === selectedConversation)?.type === 'existing') {
      socket.emit('LIST_MESSAGES', { conversationId: selectedConversation, limit: 50 }, (response: any) => {
        console.log("Response", response);
        if (response?.ok) {
          setMessages(response.messages);
        }
      });
    } else {
      setMessages([]);
    }
  }, [selectedConversation, socket]);

  // Handle new messages and conversation updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data: { type: string; message: Message }) => {
      if (data.type === 'NEW_MESSAGE') {
        const { message } = data;
        
        // Add message to current messages if in the right conversation
        setMessages(prev => 
          selectedConversation === message.conversationId 
            ? [...prev, message] 
            : prev
        );

        // Update conversations list with new message
        setConversations(prev => {
          // If conversation exists, update it
          const convExists = prev.some(conv => conv._id === message.conversationId);
          
          if (convExists) {
            return prev.map(conv => 
              conv._id === message.conversationId
                ? { 
                    ...conv, 
                    lastMessage: message.content, 
                    updatedAt: new Date().toISOString() 
                  }
                : conv
            );
          } else {
            // If it's a new conversation, create it
            return [{
              _id: message.conversationId,
              participants: [message.senderId, message.receiverId],
              lastMessage: message.content,
              updatedAt: new Date().toISOString(),
              type: 'existing' as const
            }, ...prev];
          }
        });
      }
    };

    socket.on('NEW_MESSAGE', handleNewMessage);
    
    // Handle conversation updates
    const handleConversationUpdate = (data: { type: string; conversation: Conversation }) => {
      if (data.type === 'CONVERSATION_UPDATED') {
        setConversations(prev => {
          const exists = prev.some(conv => conv._id === data.conversation._id);
          if (exists) {
            return prev.map(conv => 
              conv._id === data.conversation._id 
                ? { ...data.conversation, type: 'existing' as const }
                : conv
            );
          } else {
            return [data.conversation, ...prev];
          }
        });
      }
    };

    socket.on('CONVERSATION_UPDATED', handleConversationUpdate);

    return () => {
      socket.off('NEW_MESSAGE', handleNewMessage);
      socket.off('CONVERSATION_UPDATED', handleConversationUpdate);
    };
  }, [socket, user, selectedConversation]);

  const createNewConversation = async (userId: string) => {
    try {
      if (userId === user?.id?.toString()) {
        alert('You cannot start a conversation with yourself');
        return;
      }

      // Check if conversation already exists with this user
      const existingConv = conversations.find(conv => 
        conv.participants.includes(userId) && conv.participants.includes(user?.id?.toString() || '')
      );

      if (existingConv) {
        setSelectedConversation(existingConv._id);
        setIsNewChatModalOpen(false);
        setUserIdInput('');
        return;
      }

      const newConv = {
        _id: `conv_${Date.now()}`,
        participants: [userId, user?.id?.toString() || ''],
        lastMessage: '',
        updatedAt: new Date().toISOString(),
        type: 'new' as const
      };
      
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv._id);
      setIsNewChatModalOpen(false);
      setUserIdInput('');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleNewChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdInput.trim()) {
      createNewConversation(userIdInput.trim());
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket || !user) return;

    const conversation = conversations.find(c => c._id === selectedConversation);
    if (!conversation) return;

    // Find the other participant
    const otherParticipant = conversation.participants.find(id => id !== user.id?.toString());
    if (!otherParticipant) {
      console.error('No other participant found');
      return;
    }

    // Prevent sending message to self
    if (otherParticipant === user.id?.toString()) {
      alert('You cannot send a message to yourself');
      return;
    }

    // Create a temporary message for immediate UI update
    const tempId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: newMessage,
      senderId: user.id?.toString() || '',
      receiverId: otherParticipant,
      conversationId: selectedConversation,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Add the message to the UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Send the message via socket
    socket.emit('SEND_MESSAGE', {
      toUserId: otherParticipant,
      content: newMessage,
      conversationId: selectedConversation,
      tempId
    }, (response: any) => {
      if (response?.ok && response.message) {
        // Replace the temporary message with the real one from the server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? response.message : msg
          )
        );
      } else if (response?.error) {
        // Handle error (e.g., show error message)
        console.error('Failed to send message:', response.error);
        // Remove the temporary message if sending failed
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== user?.id?.toString()) || 'Unknown User';
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { date: string; label: string; messages: Message[] }[] = [];
    
    // Sort messages by date (oldest first)
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let currentDate: string | null = null;
    
    sortedMessages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const dateStr = messageDate.toDateString();
      
      // Format date label
      let label = '';
      if (messageDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else if (messageDate.getFullYear() === today.getFullYear()) {
        label = messageDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      } else {
        label = messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      
      // Create new date group if needed
      if (dateStr !== currentDate) {
        groups.push({
          date: dateStr,
          label,
          messages: [message]
        });
        currentDate = dateStr;
      } else {
        // Add to current date group
        groups[groups.length - 1].messages.push(message);
      }
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading conversations...
      </div>
    );
  }

  // Calculate the height to account for any fixed headers/navbars
  const pageHeight = 'calc(100vh - 4rem)'; // Adjust 4rem based on your navbar height

  return (
    <div className="relative flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Conversations sidebar - Always rendered but conditionally shown/hidden based on viewport */}
      <div 
        className={`${isMobileView && showChat ? 'hidden' : 'flex'} 
                  lg:flex w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-800 
                  bg-white dark:bg-gray-900 flex-col h-full overflow-hidden`}
        style={{ height: pageHeight }}
      >
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 flex-shrink-0">
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Messages</h1>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="New conversation"
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 overflow-x-hidden">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors
                hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedConversation === conversation._id
                  ? 'bg-blue-50 dark:bg-gray-800 border-l-2 border-l-blue-500'
                  : ''
              }`}
              onClick={() => handleSelectConversation(conversation._id)}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{getOtherParticipant(conversation)}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
                  {new Date(conversation.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {conversation.lastMessage || 'Start a new conversation'}
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">No conversations yet</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Start a conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-md p-5 w-96 border border-gray-100 dark:border-gray-800 shadow-lg">
            <h2 className="text-base font-medium mb-3 dark:text-gray-100">New Conversation</h2>
            <form onSubmit={handleNewChatSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Enter User ID
                </label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  placeholder="User ID to message"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewChatModalOpen(false);
                    setUserIdInput('');
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!userIdInput.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div 
        className={`${isMobileView && !showChat ? 'hidden' : 'flex'} 
                  flex-1 flex-col bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-full overflow-hidden`}
        style={{ height: pageHeight }}
      >
        {selectedConversation ? (
          <>
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 flex-shrink-0">
              <div className="flex items-center">
                {isMobileView && (
                  <button 
                    onClick={handleBackToConversations}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
                <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-medium mr-2">
                  {getOtherParticipant(
                    conversations.find((c) => c._id === selectedConversation) || {
                      participants: [],
                      _id: '',
                      type: 'existing',
                      updatedAt: '',
                    }
                  ).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getOtherParticipant(
                      conversations.find((c) => c._id === selectedConversation) || {
                        participants: [],
                        _id: '',
                        type: 'existing',
                        updatedAt: '',
                      }
                    )}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Online</p>
                </div>
              </div>
            </div>

            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-4 bg-white dark:bg-gray-900 overflow-x-hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              {messageGroups.length > 0 ? (
                messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="relative flex items-center justify-center my-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                      </div>
                      <div className="relative px-2 py-0.5 bg-white dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 rounded-md border border-gray-100 dark:border-gray-800">
                        {group.label}
                      </div>
                    </div>

                    {group.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id?.toString() ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`px-3 py-2 rounded-md ${
                              message.senderId === user?.id?.toString()
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`text-[11px] mt-0.5 flex items-center justify-end space-x-1 ${
                                message.senderId === user?.id?.toString() ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              <span>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {message.senderId === user?.id?.toString() && (
                                <span>{message.read ? '✓✓' : '✓'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No messages yet</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Send a message to start the conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="max-w-3xl mx-auto w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 p-1.5 rounded ${
                      newMessage.trim()
                        ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    } transition-colors`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 text-center">
            <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm mb-2">Select a conversation to start chatting</p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Start a new conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;