import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";

const PDFChat = () => {
  const { id } = useParams();
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  // Fetch chats (pagination)
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      // Save scroll position before fetching more pages
      let prevScrollHeight = 0;
      let prevScrollTop = 0;
      if (page > 1 && chatContainerRef.current) {
        prevScrollHeight = chatContainerRef.current.scrollHeight;
        prevScrollTop = chatContainerRef.current.scrollTop;
      }

      try {
        const response = await fetch(`http://localhost:3000/chats/${id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ page, limit }),
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }

        const data = await response.json();

        if (data.success) {
          setTotal(data.total);
          if (page === 1) {
            setChats(data.data);
            // Scroll to bottom on first load
            setTimeout(() => {
              if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({ behavior: "auto" });
              }
            }, 100);
          } else {
            setChats((prevChats) => [...data.data, ...prevChats]);
            setTimeout(() => {
              if (chatContainerRef.current) {
                // Maintain scroll position after prepending
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop =
                  newScrollHeight - prevScrollHeight + prevScrollTop - 100;
              }
            }, 100);
          }
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        toast.error(error.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
    // eslint-disable-next-line
  }, [id, page, limit]);

  // Infinite scroll: fetch more when scrolled to top
  useEffect(() => {
    const handleScroll = () => {
      const container = chatContainerRef.current;
      if (!container || loading) return;
      if (container.scrollTop === 0 && chats.length < total) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chats, loading, total]);

  // Scroll to bottom when a new message is sent
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats.length]);

  // Scroll to the last message when chats change
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  // Send a new message
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setChatLoading(true);
      const response = await fetch(`http://localhost:3000/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: id, query: message }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setChats((prev) => [...prev, { query: message, response: data.data }]);
        setMessage("");
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1">
        <div className="p-4">
          <div className="text-lg font-bold">Chat with PDF</div>
          <p className="text-sm text-gray-500">Ask anything about the PDF</p>
        </div>
        <div className="px-4">
          <div className="chat-container relative">
            <div
              className="chat-message overflow-y-auto h-[calc(100vh-250px)]"
              ref={chatContainerRef}
            >
              {loading && page > 1 && (
                <div className="text-center text-gray-400 py-2">Loading...</div>
              )}
              {chats.length > 0 &&
                chats.map((chat, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 my-2"
                    ref={index === chats.length - 1 ? lastMessageRef : null}
                  >
                    <div
                      className={`text-sm ${
                        chat.query &&
                        "text-gray-500 ml-auto bg-gray-100 rounded-md p-3"
                      }`}
                    >
                      {chat.query}
                    </div>
                    <div
                      className={`text-sm w-[80%] ${
                        chat.response &&
                        "text-gray-500 mr-auto bg-gray-100 rounded-md p-3"
                      }`}
                    >
                      {chat.response}
                    </div>
                  </div>
                ))}
              {chats.length === 0 && !loading && (
                <div className="text-sm text-gray-500 flex justify-center items-center h-full">
                  No chats found for this PDF
                </div>
              )}
            </div>
            <div className="fixed bottom-5 right-0 w-[calc(100vw-50vw)] px-4">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 pr-12 border border-gray-300 rounded-md focus:outline-amber-500 text-gray-600"
                  placeholder="Ask anything about the PDF"
                />
                <button
                  type="submit"
                  className="absolute bottom-0 right-4 p-2 rounded bg-amber-500"
                >
                  {chatLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      className="text-white"
                    >
                      <path
                        fill="currentColor"
                        d="m19.8 12.925l-15.4 6.5q-.5.2-.95-.088T3 18.5v-13q0-.55.45-.837t.95-.088l15.4 6.5q.625.275.625.925t-.625.925M5 17l11.85-5L5 7v3.5l6 1.5l-6 1.5zm0 0V7z"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFChat;
