import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

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
    return <div className="flex justify-center items-center h-screen">Loading conversations...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold">Messages</h1>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="New conversation"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-65px)]">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedConversation(conversation._id)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">Chat with {getOtherParticipant(conversation)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-sm text-gray-500 truncate">
                {conversation.lastMessage || 'No messages yet'}
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">New Conversation</h2>
            <form onSubmit={handleNewChatSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Enter User ID
                </label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full p-2 border rounded"
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
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!userIdInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messageGroups.map((group, groupIndex) => (
                <div key={group.date} className="space-y-3">
                  {/* Date header */}
                  <div className="flex justify-center mb-2">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {group.label}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {group.messages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id?.toString();
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <div className="break-words">{message.content}</div>
                          <div className={`text-xs mt-1 opacity-70 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add bottom margin to the last group to ensure space above input */}
                  {groupIndex === messageGroups.length - 1 && <div className="h-4" />}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;