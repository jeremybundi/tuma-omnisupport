import { useState, useEffect, useRef } from 'react';

export default function UnreadMessages({ onSelectChat }) {
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const truncateMessage = (message) => {
    return message.split('\n')[0] + ' ...';
  };

  const conversations = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    sender: i % 2 === 0 ? 'User' : 'TUMA Support',
    message:
      i % 2 === 0
        ? "I'd like to know if I can access your services here. Is TUMA available in Uganda?"
        : 'Hello! Yes, TUMA is available in Uganda. How can we assist you today?',
    timestamp: formatTime(new Date(Date.now() - i * 300000)), // Spread timestamps out
    messages: [
      {
        id: 1,
        sender: 'User',
        message:
          "I'd like to know if I can access your services here. Is TUMA available in Uganda?",
        timestamp: formatTime(new Date(Date.now() - 300000)),
      },
      {
        id: 2,
        sender: 'TUMA Support',
        message:
          'Hello! Yes, TUMA is available in Uganda. How can we assist you today?',
        timestamp: formatTime(new Date(Date.now() - 280000)),
      },
      {
        id: 3,
        sender: 'User',
        message:
          'That’s great! I’m interested in using TUMA for sending money. What’s the process?',
        timestamp: formatTime(new Date(Date.now() - 250000)),
      },
      {
        id: 4,
        sender: 'TUMA Support',
        message:
          'It’s simple! You can download our app or visit our website, create an account, and start sending money instantly. We offer competitive rates and secure transactions.',
        timestamp: formatTime(new Date(Date.now() - 230000)),
      },
    ],
  }));

  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [needsLoadMore, setNeedsLoadMore] = useState(false);

  useEffect(() => {
    const calculateInitialMessages = () => {
      const screenHeight = window.innerHeight;
      const messageHeight = 80;
      const maxMessages = Math.floor((screenHeight * 1) / messageHeight);
      setVisibleCount(maxMessages);
    };

    calculateInitialMessages();
    window.addEventListener('resize', calculateInitialMessages);
    return () => window.removeEventListener('resize', calculateInitialMessages);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const scrollHeight = containerRef.current.scrollHeight;
      setNeedsLoadMore(
        scrollHeight > containerHeight || visibleCount < conversations.length
      );
    }
  }, [visibleCount]);

  const loadMoreMessages = () => {
    setVisibleCount((prev) => Math.min(prev + 7, conversations.length));
  };

  return (
    <div className="max-w-lg mx-auto font-poppins bg-[#F3F5F8]  flex flex-col">
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden space-y-3"
        style={{ maxHeight: '73vh', overflowY: 'auto' }}
      >
        {conversations.slice(0, visibleCount).map((msg) => (
          <div
            key={msg.id}
            className=" py-1 px-3 border-b flex items-start space-x-4 rounded bg-[#F3F5F8] hover:bg-white cursor-pointer"
            onClick={() => {
              console.log('Selecting chat:', msg);
              onSelectChat(msg);
            }}
          >
            <img
              src="/images/pic.png"
              alt="User"
              className="w-12 h-12 mb-3 rounded-full"
            />

            <div className="flex-1 mt-1">
              <div className="flex justify-between items-center">
                <div className="font-medium font-manrope text-[16px]">
                  {msg.sender}
                </div>
                <div className="text-sm  text-gray-400">{msg.timestamp}</div>
              </div>
              <div className="text-sm mt-1 text-gray-500 line-clamp-1">
                {truncateMessage(msg.message)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {needsLoadMore && visibleCount < conversations.length && (
        <button
          onClick={loadMoreMessages}
          className="mt-2 text-blue-600 text-lg font-medium underline self-center"
        >
          Load More
        </button>
      )}
    </div>
  );
}
