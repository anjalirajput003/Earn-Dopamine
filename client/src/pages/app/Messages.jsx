import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSelector } from "react-redux";

import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api/axios";

import { socket } from "../../services/socket/socket";

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const otherUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");

  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  /*
   * Fetch all conversations.
   */
  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get("/conversations");

      return response.data.data || [];
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load conversations.");

      return [];
    }
  }, []);

  /*
   * Initial conversation-list loading.
   */
  useEffect(() => {
    const fetchConversations = async () => {
      setIsConversationsLoading(true);

      const data = await loadConversations();

      setConversations(data);
      setIsConversationsLoading(false);
    };

    fetchConversations();
  }, [loadConversations]);

  /*
   * Open a conversation from:
   *
   * /messages?userId=<userId>
   *
   * If the conversation already exists, use the data
   * from the conversation list.
   *
   * Otherwise create it through the existing backend
   * endpoint and then refresh the conversation list.
   */
  useEffect(() => {
    if (!otherUserId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    const openConversation = async () => {
      setIsConversationLoading(true);
      setError("");

      try {
        let currentConversation = conversations.find(
          (item) => item.otherUser?._id?.toString() === otherUserId.toString(),
        );

        if (!currentConversation) {
          const response = await api.post(`/conversations/${otherUserId}`);

          const createdConversation = response.data.data;

          /*
           * Refresh the conversation list so we get
           * the populated otherUser information.
           */
          const updatedConversations = await loadConversations();

          setConversations(updatedConversations);

          currentConversation = updatedConversations.find(
            (item) => item._id === createdConversation._id,
          );

          /*
           * Fallback to the conversation returned by
           * the create endpoint.
           */
          if (!currentConversation) {
            currentConversation = createdConversation;
          }
        }

        setConversation(currentConversation);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to open this conversation.",
        );
      } finally {
        setIsConversationLoading(false);
      }
    };

    openConversation();
  }, [otherUserId, conversations, loadConversations]);

  /*
   * Load messages for the active conversation.
   */
  useEffect(() => {
    if (!conversation?._id) {
      return;
    }

    const loadMessages = async () => {
      setIsMessagesLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/conversations/${conversation._id}/messages`,
          {
            params: {
              page: 1,
              limit: 50,
            },
          },
        );

        const fetchedMessages = response.data.data?.messages || [];

        setMessages(fetchedMessages.reverse());

        await api.patch(`/conversations/${conversation._id}/messages/read`);

        /*
         * Remove unread badge when conversation is opened.
         */
        setConversations((previousConversations) =>
          previousConversations.map((item) =>
            item._id === conversation._id
              ? {
                  ...item,
                  unreadCount: 0,
                }
              : item,
          ),
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load messages.");
      } finally {
        setIsMessagesLoading(false);
      }
    };

    loadMessages();
  }, [conversation?._id]);

  /*
   * Real-time incoming messages.
   */
  useEffect(() => {
    const handleIncomingMessage = async (message) => {
      if (!message?.conversation) {
        return;
      }

      const conversationId = message.conversation.toString();

      const isCurrentConversation =
        conversation?._id?.toString() === conversationId;

      /*
       * Add the message to the open conversation.
       */
      if (isCurrentConversation) {
        setMessages((previousMessages) => {
          const alreadyExists = previousMessages.some(
            (item) => item._id === message._id,
          );

          if (alreadyExists) {
            return previousMessages;
          }

          return [...previousMessages, message];
        });
      }

      /*
       * Update the conversation preview.
       */
      setConversations((previousConversations) => {
        const existingConversation = previousConversations.find(
          (item) => item._id === conversationId,
        );

        /*
         * If this is a brand-new conversation that
         * wasn't previously in our list, refresh the
         * list from the backend.
         */
        if (!existingConversation) {
          void loadConversations().then((updatedConversations) => {
            setConversations(updatedConversations);
          });

          return previousConversations;
        }

        const isMine = message.sender?.toString() === user?._id?.toString();

        return previousConversations
          .map((item) =>
            item._id === conversationId
              ? {
                  ...item,

                  lastMessage: {
                    _id: message._id,
                    sender: message.sender,
                    content: message.content,
                    createdAt: message.createdAt,
                    isRead: isCurrentConversation || isMine,
                  },

                  unreadCount:
                    isCurrentConversation || isMine ? 0 : item.unreadCount + 1,

                  updatedAt: message.createdAt,
                }
              : item,
          )
          .sort(
            (first, second) =>
              new Date(second.updatedAt) - new Date(first.updatedAt),
          );
      });
    };

    socket.on("chat:message", handleIncomingMessage);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [conversation?._id, user?._id, loadConversations]);

  /*
   * Scroll to newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * Search conversations.
   */
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((item) => {
      const username = item.otherUser?.username?.toLowerCase() || "";

      const fullName = item.otherUser?.fullName?.toLowerCase() || "";

      return username.includes(query) || fullName.includes(query);
    });
  }, [conversations, search]);

  /*
   * Select a conversation.
   */
  const handleSelectConversation = (item) => {
    setConversation(item);
    setError("");

    navigate(`/messages?userId=${item.otherUser._id}`, {
      replace: true,
    });
  };

  /*
   * Return to conversation list.
   */
  const handleBack = () => {
    navigate("/messages");
  };

  const handleDeleteConversation = async () => {
    if (!conversation?._id || isDeletingConversation) {
      return;
    }

    const confirmed = window.confirm(
      `Delete your conversation with ${activeUser?.username || "this user"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingConversation(true);
      setError("");

      await api.delete(`/conversations/${conversation._id}`);

      setConversations((previousConversations) =>
        previousConversations.filter((item) => item._id !== conversation._id),
      );

      setConversation(null);
      setMessages([]);
      setContent("");

      navigate("/messages");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete the conversation.",
      );
    } finally {
      setIsDeletingConversation(false);
    }
  };

  /*
   * Send message.
   */
  const handleSend = (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || !conversation?._id || isSending) {
      return;
    }

    if (!socket.connected) {
      setError("Chat connection is unavailable.");
      return;
    }

    setIsSending(true);
    setError("");

    socket.emit(
      "chat:message",
      {
        conversationId: conversation._id,
        content: trimmedContent,
      },
      async (response) => {
        setIsSending(false);

        if (!response?.success) {
          setError(response?.message || "Failed to send message.");
          return;
        }

        setContent("");

        /*
         * Make sure a newly-created conversation
         * appears in the conversation list.
         */
        const updatedConversations = await loadConversations();

        setConversations(updatedConversations);
      },
    );
  };

  const activeUser = conversation?.otherUser;

  /*
   * Format message timestamp.
   */
  const formatMessageTime = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] w-full max-w-[1100px] overflow-hidden border border-neutral-800 bg-[#111111]">
      {/* Conversation list */}
      <aside
        className={`w-full shrink-0 flex-col border-r border-neutral-800 bg-[#0d0d0d] md:w-[320px] ${
          otherUserId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-neutral-800 px-5 py-5">
          <h1 className="text-lg font-semibold text-white">Messages</h1>

          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages"
              className="h-10 w-full border border-neutral-800 bg-[#111111] pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isConversationsLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={22} className="animate-spin text-neutral-600" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center bg-neutral-900">
                <MessageCircle size={21} className="text-neutral-600" />
              </div>

              <p className="mt-4 text-sm font-medium text-neutral-400">
                No conversations
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Start a conversation from someone's profile.
              </p>
            </div>
          ) : (
            <div>
              {filteredConversations.map((item) => {
                const itemUser = item.otherUser;

                const isActive = conversation?._id === item._id;

                const avatarUrl = itemUser?.avatar?.url;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleSelectConversation(item)}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
                      isActive ? "bg-neutral-900" : "hover:bg-neutral-900/60"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={itemUser.username}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                        {itemUser?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {itemUser?.username}
                        </p>

                        {item.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0095f6] px-1.5 text-[10px] font-bold text-white">
                            {item.unreadCount > 99 ? "99+" : item.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-xs ${
                            item.unreadCount > 0
                              ? "font-medium text-neutral-300"
                              : "text-neutral-500"
                          }`}
                        >
                          {item.lastMessage?.content || "No messages yet"}
                        </p>

                        {item.lastMessage?.createdAt && (
                          <span className="shrink-0 text-[10px] text-neutral-700">
                            {formatMessageTime(item.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Active conversation */}
      <section
        className={`min-w-0 flex-1 flex-col ${
          otherUserId ? "flex" : "hidden md:flex"
        }`}
      >
        {!otherUserId || !conversation ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
                <MessageCircle size={24} className="text-neutral-500" />
              </div>

              <h2 className="mt-5 text-base font-semibold text-white">
                Select a conversation
              </h2>

              <p className="mt-2 text-sm text-neutral-600">
                Choose someone from your messages.
              </p>
            </div>
          </div>
        ) : isConversationLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={25} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4 md:px-5">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 hover:text-white md:hidden"
              >
                <ArrowLeft size={18} />
              </button>

              {activeUser?.avatar?.url ? (
                <img
                  src={activeUser.avatar.url}
                  alt={activeUser.username}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-white">
                  {activeUser?.username?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white">
                  {activeUser?.username || "User"}
                </h1>

                <p className="truncate text-xs text-neutral-600">
                  {activeUser?.fullName || "Direct message"}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={handleDeleteConversation}
                  disabled={isDeletingConversation}
                  title="Delete conversation"
                  className="flex h-9 w-9 items-center justify-center text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeletingConversation ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-5 md:px-5">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2
                    className="animate-spin text-neutral-600"
                    size={22}
                  />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  {activeUser?.avatar?.url ? (
                    <img
                      src={activeUser.avatar.url}
                      alt={activeUser.username}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-xl font-semibold text-white">
                      {activeUser?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <p className="mt-4 text-sm font-medium text-white">
                    {activeUser?.username}
                  </p>

                  <p className="mt-1 text-xs text-neutral-600">
                    Send the first message.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMine =
                      message.sender?._id === user?._id ||
                      message.sender === user?._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[82%] md:max-w-[75%] ${
                            isMine ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-purple-600 text-white"
                                : "bg-neutral-900 text-neutral-300"
                            }`}
                          >
                            {message.content}
                          </div>

                          <p
                            className={`mt-1 text-[10px] text-neutral-700 ${
                              isMine ? "text-right" : "text-left"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            {/* Error */}
            {error && (
              <div className="border-t border-red-500/10 bg-red-500/[0.04] px-5 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="border-t border-neutral-800 p-3 md:p-4"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="text"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={2000}
                  placeholder="Write a message..."
                  className="h-11 min-w-0 flex-1 border border-neutral-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none placeholder:text-neutral-700 focus:border-neutral-700"
                />

                <button
                  type="submit"
                  disabled={!content.trim() || isSending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSending ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Messages;
