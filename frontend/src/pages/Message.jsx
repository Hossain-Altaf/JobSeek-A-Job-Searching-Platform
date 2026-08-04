import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Messages = () => {
  const { userInfo } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConversationId = searchParams.get("conversation");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const { data } = await API.get("/messages/conversations");
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const { data } = await API.get(`/messages/${conversationId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversationId) => {
    setSearchParams({ conversation: conversationId });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversationId) return;

    try {
      const { data } = await API.post(`/messages/${activeConversationId}`, { text });
      setMessages((prev) => [...prev, data]);
      setText("");
      fetchConversations(); // refresh "last message" preview in the list
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (conversation) =>
    conversation.participants.find((p) => p._id !== userInfo._id);

  return (
    <div className="messages-container">
      <div className="conversation-list">
        <h3>Messages</h3>
        {loadingConvos ? (
          <p>Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="job-meta">No conversations yet.</p>
        ) : (
          conversations.map((c) => {
            const other = getOtherParticipant(c);
            return (
              <div
                key={c._id}
                className={`conversation-item ${
                  c._id === activeConversationId ? "conversation-active" : ""
                }`}
                onClick={() => handleSelectConversation(c._id)}
              >
                {other?.profilePic && (
                  <img src={other.profilePic} alt="" className="post-avatar" />
                )}
                <div>
                  <strong>{other?.name || "Unknown"}</strong>
                  <p className="job-meta" style={{ margin: 0 }}>
                    {c.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-panel">
        {!activeConversationId ? (
          <p className="job-meta" style={{ padding: "2rem" }}>
            Select a conversation to start chatting.
          </p>
        ) : loadingMessages ? (
          <p style={{ padding: "2rem" }}>Loading messages...</p>
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`chat-bubble ${
                    m.sender?._id === userInfo._id ? "chat-bubble-mine" : "chat-bubble-theirs"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-row" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;