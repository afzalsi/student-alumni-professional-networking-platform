import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Check, CheckCheck } from 'lucide-react';
import { messageApi } from '../services/messageApi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await messageApi.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await messageApi.getMessages(activeConversation._id);
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  // Real-time socket message handler
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handleTyping = ({ conversationId, userName, isTyping }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTypingUser(isTyping ? userName : null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const text = newMessage;
    setNewMessage('');

    if (socket) {
      socket.emit('typing_stop', {
        conversationId: activeConversation._id,
        userName: user?.name
      });
    }

    try {
      const res = await messageApi.sendMessage(activeConversation._id, text);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id) || conv.participants?.[0] || {};
  };

  if (loading) return <Loader text="Loading conversations..." />;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden h-[calc(100vh-8rem)] flex">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Messages & Chats</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition ${
                    isActive ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={other.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={other.name}
                    className="w-11 h-11 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{other.name}</h4>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Start conversation...'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No active conversations yet. Messages unlock once mentorship is accepted.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      {activeConversation ? (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={getOtherParticipant(activeConversation).avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt="Avatar"
                className="w-10 h-10 rounded-2xl object-cover"
              />
              <div>
                <h3 className="font-bold text-sm text-slate-900">{getOtherParticipant(activeConversation).name}</h3>
                <p className="text-[11px] text-slate-400 capitalize">
                  {getOtherParticipant(activeConversation).role} • {getOtherParticipant(activeConversation).department}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messagesLoading ? (
              <Loader text="Loading messages..." />
            ) : messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-slate-400 py-12">
                Send your first message to say hello!
              </div>
            )}

            {typingUser && (
              <div className="text-xs text-indigo-600 italic">
                {typingUser} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (socket) {
                  socket.emit('typing_start', { conversationId: activeConversation._id, userName: user?.name });
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <Button type="submit" size="sm" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 text-xs">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
