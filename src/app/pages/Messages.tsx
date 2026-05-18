import { Search, Send, Paperclip, Phone, Video, ShieldAlert } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const filterContactInfo = (text: string) => {
  let filtered = text;
  // Replace phone numbers (+254..., 07..., etc)
  filtered = filtered.replace(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/g, "[Hidden Contact Info]");
  // Replace emails
  filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[Hidden Contact Info]");
  return filtered;
};

export default function Messages() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const contactParam = searchParams.get("contactId");
  const messageParam = searchParams.get("message");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageParam) {
      setNewMessage(messageParam);
      // Clear it so it doesn't stay in URL forever
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("message");
      setSearchParams(newParams, { replace: true });
    }
  }, [messageParam, searchParams, setSearchParams]);

  useEffect(() => {
    if (!profile) return;

    const fetchContacts = async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`);
      
      if (msgs) {
        const contactIds = new Set<string>();
        msgs.forEach(m => {
          if (m.sender_id !== profile.id) contactIds.add(m.sender_id);
          if (m.receiver_id !== profile.id) contactIds.add(m.receiver_id);
        });

        let fetchedProfiles: any[] = [];

        // Always fetch the admin
        const { data: adminProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("role", "admin")
          .limit(1);

        if (contactIds.size > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .in("id", Array.from(contactIds));
          if (profiles) fetchedProfiles = [...profiles];
        } 
        
        if (contactIds.size === 0) {
            // Fallback: fetch some recent profiles so new users have someone to chat with
            const { data: fallbackProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .neq("id", profile.id)
            .neq("role", "admin")
            .limit(10);
            if (fallbackProfiles) fetchedProfiles = [...fallbackProfiles];
        }

        // Add admin to the top if not already there, and if the user isn't the admin themselves
        if (adminProfiles && adminProfiles.length > 0) {
          const admin = adminProfiles[0];
          admin.full_name = "Platform Admin (Support)";
          if (!fetchedProfiles.some(p => p.id === admin.id) && admin.id !== profile.id) {
            fetchedProfiles = [admin, ...fetchedProfiles];
          }
        }

        // If there's a specific contact passed in URL not found yet, fetch it
        if (contactParam && !fetchedProfiles.some(p => p.id === contactParam)) {
          const { data: specificProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", contactParam)
            .single();
          if (specificProfile) {
            fetchedProfiles.push(specificProfile);
          }
        }

        setContacts(fetchedProfiles);
        
        if (contactParam && fetchedProfiles.some(p => p.id === contactParam)) {
          setSelectedContactId(contactParam);
        } else if (fetchedProfiles.length > 0) {
          setSelectedContactId(fetchedProfiles[0].id);
        }
      }
    };
    
    fetchContacts();

    // Subscribe to new messages for the current user
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id === profile.id || newMsg.receiver_id === profile.id) {
          setMessages(prev => {
            // Only add if it belongs to the currently selected conversation
            // But we actually only render messages for the selectedContactId anyway. 
            // Better to fetch or just append if it matches selectedContactId
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  // When a contact is selected, fetch messages
  useEffect(() => {
    if (!profile || !selectedContactId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${selectedContactId}),and(sender_id.eq.${selectedContactId},receiver_id.eq.${profile.id})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [profile, selectedContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!profile || !selectedContactId || !newMessage.trim()) return;

    const filteredContent = filterContactInfo(newMessage);

    if (filteredContent !== newMessage) {
      toast.warning("Contact information was hidden for your safety.");
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: profile.id,
      receiver_id: selectedContactId,
      content: filteredContent,
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const displayedMessages = messages.filter(m => 
    (m.sender_id === profile?.id && m.receiver_id === selectedContactId) ||
    (m.sender_id === selectedContactId && m.receiver_id === profile?.id)
  );

  const handleAskAdmin = () => {
    const admin = contacts.find(c => c.full_name === "Platform Admin (Support)");
    if (admin && selectedContact) {
      setSelectedContactId(admin.id);
      setNewMessage(`Hi Admin, I need help regarding a negotiation with ${selectedContact.full_name}.`);
    } else if (admin) {
      setSelectedContactId(admin.id);
      setNewMessage("Hi Admin, I need some assistance.");
    }
  };

  const handleStartVideoCall = async () => {
    if (!profile || !selectedContactId) return;

    // Generate a secure room ID
    const roomId = Math.random().toString(36).substring(7) + Date.now().toString(36);
    const callUrl = `${window.location.origin}/app/call/${roomId}`;

    // Send the message
    const { error } = await supabase.from("messages").insert({
      sender_id: profile.id,
      receiver_id: selectedContactId,
      content: `📞 I'm starting a video call. Click here to join: ${callUrl}`,
    });

    if (error) {
      toast.error("Failed to start video call");
      return;
    }

    // Redirect to the call room
    navigate(`/app/call/${roomId}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
        <p className="text-emerald-200">Chat directly with others on the platform securely.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 h-[calc(100vh-250px)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search contacts..." className="w-full bg-white/10 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${selectedContactId === contact.id ? "bg-emerald-900/30" : "hover:bg-white/5"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg">
                    {contact.avatar_url ? <img src={contact.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : (contact.role === 'farmer' ? '👨🏾‍🌾' : '👩🏾')}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-10">
                    <h4 className="text-white font-semibold truncate leading-tight">{contact.full_name}</h4>
                    <p className="text-xs text-gray-400 capitalize truncate">{contact.role}</p>
                  </div>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-center text-emerald-300/50 p-4 text-sm">No contacts yet.</p>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {!selectedContactId ? (
            <div className="flex-1 flex items-center justify-center text-emerald-300/50">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{selectedContact?.role === 'farmer' ? '👨🏾‍🌾' : '👩🏾'}</div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedContact?.full_name}</h3>
                    <p className="text-xs text-emerald-300 capitalize">{selectedContact?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedContact?.full_name !== "Platform Admin (Support)" && (
                    <button 
                      onClick={handleAskAdmin}
                      title="Ask Admin for Help"
                      className="p-2 bg-emerald-900/50 hover:bg-emerald-800 rounded-lg transition-colors border border-emerald-700/50 flex items-center gap-2 text-emerald-300 text-sm font-medium mr-2"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Voice Call (Coming Soon)"><Phone className="w-5 h-5 text-emerald-300" /></button>
                  <button onClick={handleStartVideoCall} className="p-2 hover:bg-white/10 rounded-lg transition-colors shadow-lg bg-emerald-600/30 border border-emerald-500/50" title="Start Video Call">
                    <Video className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayedMessages.map((message) => {
                  const isOwn = message.sender_id === profile?.id;
                  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isOwn ? "bg-emerald-600 text-white" : "bg-white/10 text-white"} rounded-lg p-3 shadow-md`}>
                        {message.content.includes("/app/call/") ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm">📞 {isOwn ? "You started a video call." : "Incoming video call!"}</p>
                            <a href={message.content.split(' ').pop()} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded text-center transition-all">
                              {isOwn ? "Rejoin Call" : "Join Video Call"}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm mb-1 whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                        <p className={`text-[10px] text-right mt-1 ${isOwn ? "text-emerald-200" : "text-gray-400"}`}>{time}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-emerald-950/30">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Paperclip className="w-5 h-5 text-emerald-300" /></button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message (contact info will be hidden automatically)..."
                    className="flex-1 bg-white/10 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/10"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 p-3 rounded-xl transition-colors shadow-lg">
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
