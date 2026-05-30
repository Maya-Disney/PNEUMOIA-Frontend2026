// src/features/medecin/pages/Messagerie.jsx
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { 
  Search, Send, Paperclip, MoreVertical, 
  Phone, Video, Smile, Image, File, 
  Check, CheckCheck, Clock, Mic, 
  User, Users, Stethoscope, MessageCircle,
  ChevronLeft, ChevronRight, X, Plus,
  Circle, CircleCheck, Star, Archive, Trash2,
  Pin, Bell, BellOff, Volume2, VolumeX,
  Edit2, UserPlus, UserMinus, LogOut, Settings,
  Flag, Copy, Share2, Download, FileText, Activity, 
  Heart, Brain, ClipboardList, Eye, Calendar as CalendarIcon,
  Pill, Syringe, Microscope, FilePlus, FolderOpen,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Messagerie() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewDoctorModal, setShowNewDoctorModal] = useState(false);
  const [showNewCommunityModal, setShowNewCommunityModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Données mockées
  const mockConversations = [
    {
      id: 1,
      type: 'medecin',
      name: 'Dr. Merlin',
      avatar: 'DM',
      specialty: 'Pneumologue',
      hospital: 'Hôpital Général de Douala',
      email: 'dr.merlin@email.com',
      phone: '+237 6XX XXX XXX',
      lastMessage: 'Pouvez-vous m\'envoyer le résultat de Tamo ?',
      lastMessageTime: '2026-04-08T14:30:00',
      unread: 2,
      online: true,
      lastSeen: '2026-04-08T14:30:00',
      pinned: true,
      muted: false,
      archived: false
    },
    {
      id: 2,
      type: 'patient',
      name: 'Tamo Bernard',
      avatar: 'TB',
      age: 47,
      pathology: 'Pneumonie bactérienne',
      phone: '+237 6XX XXX XXX',
      email: 'bernard.tamo@email.com',
      lastMessage: 'Merci docteur pour la consultation',
      lastMessageTime: '2026-04-08T11:20:00',
      unread: 0,
      online: false,
      lastSeen: '2026-04-08T10:00:00',
      pinned: false,
      muted: false,
      archived: false
    },
    {
      id: 3,
      type: 'medecin',
      name: 'Dr. Nkoa',
      avatar: 'DN',
      specialty: 'Pneumologue',
      hospital: 'Clinique La Paix',
      email: 'dr.nkoa@email.com',
      lastMessage: 'Questions sur la prise en charge BPCO',
      lastMessageTime: '2026-04-07T16:45:00',
      unread: 1,
      online: true,
      lastSeen: '2026-04-07T16:45:00',
      pinned: false,
      muted: false,
      archived: false
    },
    {
      id: 4,
      type: 'groupe',
      name: 'Communauté Pneumologie Cameroun',
      avatar: 'CP',
      members: [
        { id: 1, name: 'Dr. Jean Tagne', role: 'admin', avatar: 'JD', specialty: 'Pneumologue' },
        { id: 2, name: 'Dr. Merlin', role: 'member', avatar: 'DM', specialty: 'Pneumologue' },
        { id: 3, name: 'Dr. Nkoa', role: 'member', avatar: 'DN', specialty: 'Pneumologue' },
        { id: 4, name: 'Dr. Kamto Jordan', role: 'member', avatar: 'KJ', specialty: 'Cardiologue' },
        { id: 5, name: 'Dr. Fouda', role: 'member', avatar: 'DF', specialty: 'Médecine générale' }
      ],
      memberCount: 128,
      description: 'Groupe d\'échange sur la pneumologie au Cameroun',
      lastMessage: 'Nouveau cas clinique partagé',
      lastMessageTime: '2026-04-07T10:30:00',
      unread: 5,
      pinned: true,
      muted: false,
      archived: false
    },
    {
      id: 5,
      type: 'patient',
      name: 'Fouda Marie',
      avatar: 'FM',
      age: 52,
      pathology: 'BPCO',
      phone: '+237 6XX XXX XXX',
      email: 'marie.fouda@email.com',
      lastMessage: 'Quand dois-je revenir ?',
      lastMessageTime: '2026-04-06T15:20:00',
      unread: 0,
      online: false,
      lastSeen: '2026-04-06T15:20:00',
      pinned: false,
      muted: false,
      archived: false
    },
    {
      id: 6,
      type: 'medecin',
      name: 'Dr. Kamto Jordan',
      avatar: 'KJ',
      specialty: 'Cardiologue',
      hospital: 'Hôpital Central de Yaoundé',
      email: 'dr.kamto@email.com',
      lastMessage: 'Merci pour le partage du cas #124',
      lastMessageTime: '2026-04-06T09:15:00',
      unread: 0,
      online: false,
      lastSeen: '2026-04-06T09:15:00',
      pinned: false,
      muted: false,
      archived: false
    }
  ];

  const mockMessages = {
    1: [
      { id: 1, senderId: 1, senderName: 'Dr. Merlin', text: 'Bonjour Dr. Tagne', time: '2026-04-08T14:00:00', read: true, type: 'text' },
      { id: 2, senderId: 'me', senderName: 'Moi', text: 'Bonjour Dr. Merlin', time: '2026-04-08T14:05:00', read: true, type: 'text' },
      { id: 3, senderId: 1, senderName: 'Dr. Merlin', text: 'Pouvez-vous m\'envoyer le résultat de Tamo Bernard ?', time: '2026-04-08T14:10:00', read: true, type: 'text' },
      { id: 4, senderId: 'me', senderName: 'Moi', text: 'Bien sûr, je vous envoie ça dans 5 minutes', time: '2026-04-08T14:15:00', read: true, type: 'text' },
      { id: 5, senderId: 1, senderName: 'Dr. Merlin', text: 'Merci beaucoup !', time: '2026-04-08T14:30:00', read: false, type: 'text' }
    ],
    4: [
      { id: 1, senderId: 'system', senderName: 'Système', text: 'Bienvenue dans le groupe Communauté Pneumologie Cameroun', time: '2026-04-01T09:00:00', read: true, type: 'system' },
      { id: 2, senderId: 1, senderName: 'Dr. Martin', text: 'Bonjour à tous !', time: '2026-04-07T10:00:00', read: true, type: 'text' },
      { id: 3, senderId: 3, senderName: 'Dr. Nkoa', text: 'Nouveau cas clinique partagé sur la BPCO', time: '2026-04-07T10:30:00', read: false, type: 'text' }
    ]
  };

  // Données pour partage
  const availableCases = [
    { id: 1, title: 'BPCO stade avancé - Cas clinique', date: '2026-04-01', author: 'Dr. Jean Tagne', specialty: 'Pneumologie', type: 'cas' },
    { id: 2, title: 'Pneumonie résistante aux antibiotiques', date: '2026-03-25', author: 'Dr. Jean Tagne', specialty: 'Pneumologie', type: 'cas' },
    { id: 3, title: 'Asthme sévère chez l\'adulte', date: '2026-03-20', author: 'Dr. Jean Tagne', specialty: 'Pneumologie', type: 'cas' }
  ];

  const availableConsultations = [
    { id: 1, patient: 'Tamo Bernard', date: '2026-04-08', pathology: 'Pneumonie', doctor: 'Dr. Jean Tagne', type: 'consultation' },
    { id: 2, patient: 'Fouda Marie', date: '2026-04-08', pathology: 'BPCO', doctor: 'Dr. Jean Tagne', type: 'consultation' },
    { id: 3, patient: 'Nguema Paul', date: '2026-04-07', pathology: 'Asthme', doctor: 'Dr. Jean Tagne', type: 'consultation' }
  ];

  const availableResults = [
    { id: 1, patient: 'Tamo Bernard', examType: 'Radiographie thoracique', date: '2026-04-07', result: 'Anomalies suspectes', type: 'resultat' },
    { id: 2, patient: 'Fouda Marie', examType: 'Scanner', date: '2026-04-06', result: 'Stabilité des lésions', type: 'resultat' },
    { id: 3, patient: 'Kamga Jean', examType: 'Analyse sanguine', date: '2026-04-05', result: 'Marqueurs élevés', type: 'resultat' }
  ];

  const availableDoctors = [
    { id: 7, name: 'Dr. Mbarga', avatar: 'DM', specialty: 'Pneumologue', hospital: 'Hôpital Laquintinie', type: 'medecin' },
    { id: 8, name: 'Dr. Eyenga', avatar: 'DE', specialty: 'Infectiologue', hospital: 'Hôpital Central', type: 'medecin' },
    { id: 9, name: 'Dr. Ndongo', avatar: 'DN', specialty: 'Médecine interne', hospital: 'Clinique Bonanjo', type: 'medecin' }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = () => {
    setLoading(true);
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 500);
  };

  const loadMessages = (conversationId) => {
    setMessages(mockMessages[conversationId] || []);
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    );
    setConversations(updatedConversations);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setShowConversationMenu(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      senderId: 'me',
      senderName: 'Moi',
      text: newMessage,
      time: new Date().toISOString(),
      read: false,
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date().toISOString() }
        : conv
    );
    setConversations(updatedConversations);
    
    scrollToBottom();
  };

  const handleShareItem = (item, type) => {
    if (!selectedConversation) {
      setShowShareModal(false);
      return;
    }

    const shareMessage = {
      id: Date.now(),
      senderId: 'me',
      senderName: 'Moi',
      text: `[Partage] ${type === 'cas' ? 'Cas clinique' : type === 'consultation' ? 'Fiche de consultation' : 'Résultat d\'examen'} : ${item.title || item.patient}`,
      time: new Date().toISOString(),
      read: false,
      type: 'share',
      sharedItem: {
        type: type,
        data: item
      }
    };
    
    setMessages(prev => [...prev, shareMessage]);
    setShowShareModal(false);
    setSelectedItem(null);
    scrollToBottom();
  };

  const openShareModal = (type) => {
    setShareType(type);
    setShowShareModal(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'medecin': return User;
      case 'patient': return Stethoscope;
      case 'groupe': return Users;
      default: return MessageCircle;
    }
  };

  const handlePinConversation = (id) => {
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
    ));
  };

  const handleMuteConversation = (id) => {
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, muted: !conv.muted } : conv
    ));
  };

  const handleArchiveConversation = (id) => {
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, archived: !conv.archived } : conv
    ));
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
    toast.info('Conversation supprimée');
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleConfirmAddMember = (memberName) => {
    if (memberName && selectedConversation) {
      const newMember = {
        id: Date.now(),
        name: memberName,
        avatar: memberName.substring(0, 2).toUpperCase(),
        specialty: 'Médecin',
        role: 'member'
      };
      const updatedGroup = { ...selectedConversation, members: [...selectedConversation.members, newMember] };
      updatedGroup.memberCount = updatedGroup.members.length;
      setSelectedConversation(updatedGroup);
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id ? updatedGroup : conv
      ));
      const systemMessage = {
        id: Date.now(),
        senderId: 'system',
        senderName: 'Système',
        text: `${newMember.name} a rejoint le groupe.`,
        time: new Date().toISOString(),
        read: true,
        type: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
      toast.success(`${newMember.name} a été ajouté au groupe`);
    }
    setShowAddMemberModal(false);
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Retirer ce membre du groupe ?')) {
      const updatedGroup = { ...selectedConversation };
      const removedMember = updatedGroup.members.find(m => m.id === memberId);
      updatedGroup.members = updatedGroup.members.filter(m => m.id !== memberId);
      updatedGroup.memberCount = updatedGroup.members.length;
      setSelectedConversation(updatedGroup);
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id ? updatedGroup : conv
      ));
      
      if (removedMember) {
        const systemMessage = {
          id: Date.now(),
          senderId: 'system',
          senderName: 'Système',
          text: `${removedMember.name} a quitté le groupe.`,
          time: new Date().toISOString(),
          read: true,
          type: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    }
  };

  const handleLeaveGroup = () => {
    if (window.confirm('Quitter ce groupe ?')) {
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setSelectedConversation(null);
    }
  };

  const handleNewMessageWithDoctor = (doctor) => {
    const existingConv = conversations.find(c => c.type === 'medecin' && c.name === doctor.name);
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const newConv = {
        ...doctor,
        id: Date.now(),
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: 0,
        pinned: false,
        muted: false,
        archived: false,
        online: false,
        lastSeen: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      handleSelectConversation(newConv);
    }
    setShowNewMessageModal(false);
  };

  const handleNewMessageWithCommunity = (community) => {
    const existingConv = conversations.find(c => c.type === 'groupe' && c.name === community.name);
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const newConv = {
        ...community,
        id: Date.now(),
        type: 'groupe',
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: 0,
        pinned: false,
        muted: false,
        archived: false
      };
      setConversations(prev => [newConv, ...prev]);
      handleSelectConversation(newConv);
    }
    setShowNewMessageModal(false);
  };

  const handleAddDoctor = (doctor) => {
    const newConversation = {
      ...doctor,
      id: Date.now(),
      type: 'medecin',
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unread: 0,
      pinned: false,
      muted: false,
      archived: false,
      online: false,
      lastSeen: new Date().toISOString()
    };
    setConversations(prev => [newConversation, ...prev]);
    handleSelectConversation(newConversation);
    setShowNewDoctorModal(false);
  };

  const handleAddCommunity = (community) => {
    setConversations(prev => [community, ...prev]);
    handleSelectConversation(community);
    setShowNewCommunityModal(false);
  };

  const filteredConversations = conversations.filter(conv =>
    !conv.archived && conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const archivedConversations = conversations.filter(conv =>
    conv.archived && conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(conv => conv.pinned);
  const otherConversations = filteredConversations.filter(conv => !conv.pinned);

  return (
    <div className="h-[calc(100vh-120px)] bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
      <div className="flex h-full">
        {/* Liste des conversations */}
        <div className="w-80 border-r border-(--ln) flex flex-col">
          <div className="p-4 border-b border-(--ln)">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-(--t1)">Messages</h2>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div key="settings-content" className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                {pinnedConversations.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-medium text-(--t4) uppercase tracking-wider">Épinglées</div>
                    {pinnedConversations.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isSelected={selectedConversation?.id === conv.id}
                        onSelect={() => handleSelectConversation(conv)}
                        onPin={() => handlePinConversation(conv.id)}
                        onMute={() => handleMuteConversation(conv.id)}
                        onArchive={() => handleArchiveConversation(conv.id)}
                        onDelete={() => handleDeleteConversation(conv.id)}
                        formatTime={formatTime}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                  </div>
                )}

                {otherConversations.length > 0 && (
                  <div>
                    {pinnedConversations.length > 0 && (
                      <div className="px-4 py-2 text-xs font-medium text-(--t4) uppercase tracking-wider">Messages</div>
                    )}
                    {otherConversations.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isSelected={selectedConversation?.id === conv.id}
                        onSelect={() => handleSelectConversation(conv)}
                        onPin={() => handlePinConversation(conv.id)}
                        onMute={() => handleMuteConversation(conv.id)}
                        onArchive={() => handleArchiveConversation(conv.id)}
                        onDelete={() => handleDeleteConversation(conv.id)}
                        formatTime={formatTime}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                  </div>
                )}

                {archivedConversations.length > 0 && (
                  <div className="mt-4">
                    <div className="px-4 py-2 text-xs font-medium text-(--t4) uppercase tracking-wider">Archivées</div>
                    {archivedConversations.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isSelected={selectedConversation?.id === conv.id}
                        onSelect={() => handleSelectConversation(conv)}
                        onPin={() => handlePinConversation(conv.id)}
                        onMute={() => handleMuteConversation(conv.id)}
                        onArchive={() => handleArchiveConversation(conv.id)}
                        onDelete={() => handleDeleteConversation(conv.id)}
                        formatTime={formatTime}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                  </div>
                )}

                {filteredConversations.length === 0 && archivedConversations.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-(--t4) mx-auto mb-3" />
                    <p className="text-(--t3)">Aucune conversation</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            <ChatHeader
              conversation={selectedConversation}
              onPin={() => handlePinConversation(selectedConversation.id)}
              onMute={() => handleMuteConversation(selectedConversation.id)}
              onArchive={() => handleArchiveConversation(selectedConversation.id)}
              onDelete={() => handleDeleteConversation(selectedConversation.id)}
              onAddMember={selectedConversation.type === 'groupe' ? handleAddMember : null}
              onLeaveGroup={selectedConversation.type === 'groupe' ? handleLeaveGroup : null}
              onShowMembers={() => setShowMemberList(true)}
              formatTime={formatTime}
            />

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === 'me';
                const isSystem = msg.type === 'system';
                const showAvatar = !isMe && !isSystem && (idx === 0 || messages[idx-1]?.senderId !== msg.senderId);
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-xs text-(--t4) bg-(--sf3) px-3 py-1 rounded-full">{msg.text}</span>
                    </div>
                  );
                }
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {selectedConversation.avatar}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-8 shrink-0" />}
                      
                      <div>
                        <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-(--sf3) text-(--t1)'}`}>
                          <p className="text-sm">{msg.text}</p>
                          {msg.type === 'share' && msg.sharedItem && (
                            <SharedItemCard item={msg.sharedItem.data} type={msg.sharedItem.type} />
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-(--t4) ${isMe ? 'justify-end' : ''}`}>
                          <span>{formatTime(msg.time)}</span>
                          {isMe && (msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSendMessage}
              onShareCase={() => openShareModal('cas')}
              onShareConsultation={() => openShareModal('consultation')}
              onShareResult={() => openShareModal('resultat')}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-(--sf3) flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-(--t4)" />
            </div>
            <h3 className="text-lg font-semibold text-(--t1) mb-2">Messagerie</h3>
            <p className="text-sm text-(--t3) text-center">Sélectionnez une conversation<br />pour commencer à discuter</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSelectDoctor={handleNewMessageWithDoctor}
          onSelectCommunity={handleNewMessageWithCommunity}
          onAddDoctor={() => {
            setShowNewMessageModal(false);
            setShowNewDoctorModal(true);
          }}
          onCreateCommunity={() => {
            setShowNewMessageModal(false);
            setShowNewCommunityModal(true);
          }}
          availableDoctors={availableDoctors}
        />
      )}

      {showNewDoctorModal && (
        <NewDoctorModal
          onClose={() => setShowNewDoctorModal(false)}
          onAddDoctor={handleAddDoctor}
        />
      )}

      {showNewCommunityModal && (
        <NewCommunityModal
          onClose={() => setShowNewCommunityModal(false)}
          onAddCommunity={handleAddCommunity}
        />
      )}

      {showMemberList && selectedConversation?.type === 'groupe' && (
        <MemberListModal
          group={selectedConversation}
          onClose={() => setShowMemberList(false)}
          onRemoveMember={handleRemoveMember}
          onAddMember={handleAddMember}
        />
      )}

      {showShareModal && (
        <ShareModal
          type={shareType}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareItem}
          availableCases={availableCases}
          availableConsultations={availableConsultations}
          availableResults={availableResults}
        />
      )}
    </div>
  );
}

// Composant ConversationItem
const ConversationItem = ({ conversation, isSelected, onSelect, onPin, onMute, onArchive, onDelete, formatTime, getTypeIcon }) => {
  const [showActions, setShowActions] = useState(false);
  const TypeIcon = getTypeIcon(conversation.type);
  
  return (
    <div
      className={`relative group ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-(--sf2)'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <button onClick={onSelect} className="w-full p-3 text-left">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {conversation.avatar}
            </div>
            {conversation.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-(--t1) truncate">{conversation.name}</p>
                {conversation.pinned && <Pin className="w-3 h-3 text-(--t4)" />}
                {conversation.muted && <BellOff className="w-3 h-3 text-(--t4)" />}
              </div>
              <span className="text-xs text-(--t4) shrink-0 ml-2">{formatTime(conversation.lastMessageTime)}</span>
            </div>
            <p className="text-xs text-(--t3) truncate">{conversation.lastMessage || 'Nouvelle conversation'}</p>
            <div className="flex items-center gap-2 mt-1">
              <TypeIcon className="w-3 h-3 text-(--t4)" />
              <span className="text-xs text-(--t4)">
                {conversation.type === 'medecin' && conversation.specialty}
                {conversation.type === 'patient' && `${conversation.age} ans`}
                {conversation.type === 'groupe' && `${conversation.memberCount} membres`}
              </span>
            </div>
          </div>
          {conversation.unread > 0 && (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-xs text-white font-medium">{conversation.unread}</span>
            </div>
          )}
        </div>
      </button>
      
      {showActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 bg-(--sf) rounded-lg shadow-sm border border-(--ln) p-1">
          <button onClick={() => onPin()} className="p-1.5 rounded hover:bg-(--sf3)" title={conversation.pinned ? 'Détacher' : 'Épingler'}>
            <Pin className="w-3.5 h-3.5 text-(--t3)" />
          </button>
          <button onClick={() => onMute()} className="p-1.5 rounded hover:bg-(--sf3)" title={conversation.muted ? 'Activer son' : 'Désactiver son'}>
            {conversation.muted ? <Bell className="w-3.5 h-3.5 text-(--t3)" /> : <BellOff className="w-3.5 h-3.5 text-(--t3)" />}
          </button>
          <button onClick={() => onArchive()} className="p-1.5 rounded hover:bg-(--sf3)" title="Archiver">
            <Archive className="w-3.5 h-3.5 text-(--t3)" />
          </button>
          <button onClick={() => onDelete()} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20" title="Supprimer">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

// Composant ChatHeader
const ChatHeader = ({ conversation, onPin, onMute, onArchive, onDelete, onAddMember, onLeaveGroup, onShowMembers, formatTime }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="p-4 border-b border-(--ln) flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {conversation.avatar}
          </div>
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-(--t1)">{conversation.name}</h3>
          <p className="text-xs text-(--t3)">
            {conversation.type === 'medecin' && `${conversation.specialty} • ${conversation.online ? 'En ligne' : `Vu ${formatTime(conversation.lastSeen)}`}`}
            {conversation.type === 'patient' && `${conversation.age} ans • ${conversation.pathology} • ${conversation.online ? 'En ligne' : `Dernière connexion ${formatTime(conversation.lastSeen)}`}`}
            {conversation.type === 'groupe' && (
              <button onClick={onShowMembers} className="hover:text-blue-600 dark:hover:text-blue-400">{conversation.memberCount} membres</button>
            )}
          </p>
        </div>
      </div>

      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-(--sf3) transition-colors">
          <MoreVertical className="w-4 h-4 text-(--t3)" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-(--sf) rounded-xl border border-(--ln) shadow-lg overflow-hidden z-50">
            <button onClick={() => { onPin(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-(--t2) hover:bg-(--sf2)">
              <Pin className="w-4 h-4" /> {conversation.pinned ? 'Détacher' : 'Épingler'}
            </button>
            <button onClick={() => { onMute(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-(--t2) hover:bg-(--sf2)">
              {conversation.muted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {conversation.muted ? 'Activer les notifications' : 'Désactiver les notifications'}
            </button>
            <button onClick={() => { onArchive(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-(--t2) hover:bg-(--sf2)">
              <Archive className="w-4 h-4" /> Archiver
            </button>
            {conversation.type === 'groupe' && onAddMember && (
              <button onClick={() => { onAddMember(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-(--t2) hover:bg-(--sf2)">
                <UserPlus className="w-4 h-4" /> Ajouter un membre
              </button>
            )}
            {conversation.type === 'groupe' && onLeaveGroup && (
              <button onClick={() => { onLeaveGroup(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-4 h-4" /> Quitter le groupe
              </button>
            )}
            <div className="h-px bg-(--ln) my-1" />
            <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant ChatInput
const ChatInput = ({ newMessage, setNewMessage, onSend, onShareCase, onShareConsultation, onShareResult }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4 border-t border-(--ln)">
      <div className="flex items-center gap-2">
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 rounded-lg hover:bg-(--sf3) transition-colors"
            title="Partager"
          >
            <Share2 className="w-5 h-5 text-(--t3)" />
          </button>
          
          {showShareMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-56 bg-(--sf) rounded-xl border border-(--ln) shadow-lg overflow-hidden z-50">
              <div className="py-1">
                <button onClick={() => { onShareCase(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--t2) hover:bg-(--sf2)">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Partager un cas clinique</span>
                </button>
                <button onClick={() => { onShareConsultation(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--t2) hover:bg-(--sf2)">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>Partager une consultation</span>
                </button>
                <button onClick={() => { onShareResult(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-(--t2) hover:bg-(--sf2)">
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <span>Partager des résultats</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          placeholder="Écrivez votre message..."
          className="flex-1 px-4 py-2 text-sm border border-(--ln) rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
        />
        
        <button
          onClick={onSend}
          disabled={!newMessage.trim()}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Composant SharedItemCard
const SharedItemCard = ({ item, type }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (type === 'cas') {
    return (
      <div className="mt-2 bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
        <div className="p-3 bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">CAS CLINIQUE PARTAGÉ</span>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline">
              {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
          </div>
          <h4 className="font-semibold text-(--t1) mt-1">{item.title}</h4>
          <p className="text-xs text-(--t3)">Par {item.author} • {item.specialty} • {new Date(item.date).toLocaleDateString('fr-FR')}</p>
        </div>
        {expanded && (
          <div className="p-3 border-t border-(--ln) space-y-2">
            <p className="text-sm text-(--t2)">Cas clinique détaillé sur {item.title.toLowerCase()}...</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Eye className="w-3 h-3" /> Voir le cas
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-(--ln) rounded-lg hover:bg-(--sf2)">
                <Download className="w-3 h-3" /> Télécharger
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'consultation') {
    return (
      <div className="mt-2 bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
        <div className="p-3 bg-linear-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">FICHE DE CONSULTATION</span>
          </div>
          <h4 className="font-semibold text-(--t1) mt-1">{item.patient}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-(--t3)">
            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{new Date(item.date).toLocaleDateString('fr-FR')}</span>
            <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{item.pathology}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.doctor}</span>
          </div>
        </div>
        <div className="p-3 border-t border-(--ln)">
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Eye className="w-3 h-3" /> Voir la fiche
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-(--ln) rounded-lg hover:bg-(--sf2)">
              <Download className="w-3 h-3" /> Télécharger PDF
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'resultat') {
    return (
      <div className="mt-2 bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
        <div className="p-3 bg-linear-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <Microscope className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-600">RÉSULTAT D'EXAMEN</span>
          </div>
          <h4 className="font-semibold text-(--t1) mt-1">{item.patient}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-(--t3)">
            <span className="flex items-center gap-1"><Microscope className="w-3 h-3" />{item.examType}</span>
            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{new Date(item.date).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        <div className="p-3 border-t border-(--ln)">
          <p className="text-sm text-(--t2) mb-2">{item.result}</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Eye className="w-3 h-3" /> Voir les détails
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-(--ln) rounded-lg hover:bg-(--sf2)">
              <Download className="w-3 h-3" /> Télécharger
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

// Modal Nouveau message
const NewMessageModal = ({ onClose, onSelectDoctor, onSelectCommunity, onAddDoctor, onCreateCommunity, availableDoctors }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('medecins');

  const availableCommunities = [
    { id: 1, name: 'Pneumologues Cameroun', members: 45, specialty: 'Pneumologie', type: 'groupe' },
    { id: 2, name: 'Cardiologues Douala', members: 28, specialty: 'Cardiologie', type: 'groupe' },
    { id: 3, name: 'Médecins Généralistes', members: 112, specialty: 'Médecine générale', type: 'groupe' },
    { id: 4, name: 'Infectiologues Afrique', members: 34, specialty: 'Infectiologie', type: 'groupe' }
  ];

  const filteredMedecins = availableDoctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCommunities = availableCommunities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-5 border-b border-(--ln) flex items-center justify-between">
          <h3 className="text-lg font-semibold text-(--t1)">Nouveau message</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--sf3)">
            <X className="w-5 h-5 text-(--t3)" />
          </button>
        </div>
        
        <div className="flex border-b border-(--ln) px-5">
          <button
            onClick={() => setActiveTab('medecins')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'medecins' ? 'text-blue-600' : 'text-(--t3)'}`}
          >
            <User className="w-4 h-4" />
            Médecins
            {activeTab === 'medecins' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('communautes')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'communautes' ? 'text-blue-600' : 'text-(--t3)'}`}
          >
            <Users className="w-4 h-4" />
            Communautés
            {activeTab === 'communautes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        </div>

        <div className="p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              placeholder={activeTab === 'medecins' ? "Rechercher un médecin..." : "Rechercher une communauté..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeTab === 'medecins' ? (
              <>
                <button
                  onClick={onAddDoctor}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left border border-dashed border-blue-200 mb-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">Ajouter un nouveau médecin</p>
                    <p className="text-xs text-(--t3)">Inviter un collègue à rejoindre</p>
                  </div>
                </button>
                
                {filteredMedecins.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => onSelectDoctor(doctor)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {doctor.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-(--t1)">{doctor.name}</p>
                      <p className="text-xs text-(--t3)">{doctor.specialty} • {doctor.hospital}</p>
                    </div>
                  </button>
                ))}
                
                {filteredMedecins.length === 0 && search && (
                  <p className="text-center text-(--t3) py-4">Aucun médecin trouvé</p>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onCreateCommunity}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left border border-dashed border-emerald-200 mb-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-600">Créer une nouvelle communauté</p>
                    <p className="text-xs text-(--t3)">Rassemblez des médecins par spécialité</p>
                  </div>
                </button>
                
                {filteredCommunities.map(community => (
                  <button
                    key={community.id}
                    onClick={() => onSelectCommunity(community)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {community.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-(--t1)">{community.name}</p>
                      <p className="text-xs text-(--t3)">{community.specialty} • {community.members} membres</p>
                    </div>
                  </button>
                ))}
                
                {filteredCommunities.length === 0 && search && (
                  <p className="text-center text-(--t3) py-4">Aucune communauté trouvée</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Modal Ajouter un médecin
const NewDoctorModal = ({ onClose, onAddDoctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hospital: '',
    email: '',
    phone: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const existingDoctors = [
    { id: 1, name: 'Dr. Mbarga', specialty: 'Pneumologue', hospital: 'Hôpital Laquintinie', email: 'dr.mbarga@email.com', avatar: 'MB' },
    { id: 2, name: 'Dr. Eyenga', specialty: 'Infectiologue', hospital: 'Hôpital Central', email: 'dr.eyenga@email.com', avatar: 'EY' },
    { id: 3, name: 'Dr. Ndongo', specialty: 'Médecine interne', hospital: 'Clinique Bonanjo', email: 'dr.ndongo@email.com', avatar: 'ND' }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const results = existingDoctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setSearching(false);
    }, 300);
  };

  const handleSelectDoctor = (doctor) => {
    onAddDoctor(doctor);
  };

  const handleManualAdd = () => {
    if (!formData.name || !formData.specialty) {
      alert('Veuillez remplir les champs obligatoires (Nom et Spécialité)');
      return;
    }
    
    const newDoctor = {
      id: Date.now(),
      name: formData.name,
      specialty: formData.specialty,
      hospital: formData.hospital || 'Non spécifié',
      email: formData.email || '',
      phone: formData.phone || '',
      avatar: formData.name.substring(0, 2).toUpperCase(),
      type: 'medecin'
    };
    onAddDoctor(newDoctor);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-(--ln) flex items-center justify-between sticky top-0 bg-(--sf)">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-(--t1)">Ajouter un médecin</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--sf3)">
            <X className="w-5 h-5 text-(--t3)" />
          </button>
        </div>
        
        <div className="flex border-b border-(--ln) px-5">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'search' ? 'text-blue-600' : 'text-(--t3)'}`}
          >
            <Search className="w-4 h-4" />
            Rechercher
            {activeTab === 'search' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'manual' ? 'text-blue-600' : 'text-(--t3)'}`}
          >
            <Edit2 className="w-4 h-4" />
            Ajouter manuellement
            {activeTab === 'manual' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'search' ? (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nom, spécialité, hôpital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {searching ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : searchTerm && searchResults.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => handleSelectDoctor(doctor)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left border border-(--ln)"
                    >
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {doctor.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-(--t1)">{doctor.name}</p>
                        <p className="text-xs text-(--t3)">{doctor.specialty} • {doctor.hospital}</p>
                      </div>
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8">
                  <p className="text-(--t3)">Aucun médecin trouvé</p>
                  <button onClick={() => setActiveTab('manual')} className="mt-2 text-sm text-blue-600 hover:underline">
                    Ajouter manuellement →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-(--t4) mx-auto mb-2" />
                  <p className="text-(--t3)">Recherchez un médecin existant</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-(--t2) mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Jean Tagne"
                  className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--t2) mb-1">Spécialité *</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Pneumologue, Cardiologue..."
                  className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--t2) mb-1">Hôpital / Cabinet</label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="Nom de l'établissement"
                  className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--t2) mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--t2) mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-(--ln) flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) hover:bg-(--sf2)">
            Annuler
          </button>
          {activeTab === 'manual' && (
            <button onClick={handleManualAdd} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Ajouter le médecin
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Modal Créer une communauté
const NewCommunityModal = ({ onClose, onAddCommunity }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specialty: '',
    visibility: 'public'
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('Veuillez donner un nom à la communauté');
      return;
    }
    
    const newCommunity = {
      id: Date.now(),
      type: 'groupe',
      name: formData.name,
      avatar: formData.name.substring(0, 2).toUpperCase(),
      description: formData.description,
      specialty: formData.specialty,
      members: [
        { id: 'me', name: 'Dr. Jean Tagne', role: 'admin', avatar: 'JD', specialty: 'Pneumologue' }
      ],
      memberCount: 1,
      lastMessage: 'Bienvenue dans le groupe !',
      lastMessageTime: new Date().toISOString(),
      unread: 0,
      pinned: false,
      muted: false,
      archived: false
    };
    
    onAddCommunity(newCommunity);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-5 border-b border-(--ln) flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-(--t1)">Nouvelle communauté</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--sf3)">
            <X className="w-5 h-5 text-(--t3)" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Nom de la communauté *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Pneumologues Cameroun"
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Spécialité</label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
            >
              <option value="">Toutes spécialités</option>
              <option value="Pneumologie">Pneumologie</option>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Médecine générale">Médecine générale</option>
              <option value="Infectiologie">Infectiologie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez l'objectif de cette communauté..."
              rows="3"
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Visibilité</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)"
            >
              <option value="public">Publique (visible par tous)</option>
              <option value="private">Privée (sur invitation)</option>
            </select>
          </div>
        </div>

        <div className="p-5 border-t border-(--ln) flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) hover:bg-(--sf2)">
            Annuler
          </button>
          <button onClick={handleCreate} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Créer la communauté
          </button>
        </div>
      </div>
    </>
  );
};

// Modal Liste des membres
const MemberListModal = ({ group, onClose, onRemoveMember, onAddMember }) => {
  const [search, setSearch] = useState('');

  const filteredMembers = group.members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-5 border-b border-(--ln) flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-(--t1)">Membres du groupe</h3>
            <p className="text-xs text-(--t3)">{group.memberCount} membres</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--sf3)">
            <X className="w-5 h-5 text-(--t3)" />
          </button>
        </div>
        <div className="p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <button
              onClick={onAddMember}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left border border-dashed border-emerald-200 mb-2"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-600">Ajouter un membre</p>
                <p className="text-xs text-(--t3)">Inviter un médecin à rejoindre le groupe</p>
              </div>
            </button>
            
            {filteredMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-(--sf2)">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">{member.name}</p>
                    <p className="text-xs text-(--t3)">{member.specialty}</p>
                  </div>
                </div>
                {member.role === 'admin' ? (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Admin</span>
                ) : (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"
                    title="Retirer du groupe"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Modal de partage
const ShareModal = ({ type, onClose, onShare, availableCases, availableConsultations, availableResults }) => {
  const [search, setSearch] = useState('');
  
  let items = [];
  let title = '';
  let icon = null;
  
  if (type === 'cas') {
    items = availableCases;
    title = 'Partager un cas clinique';
    icon = <FileText className="w-5 h-5 text-blue-600" />;
  } else if (type === 'consultation') {
    items = availableConsultations;
    title = 'Partager une consultation';
    icon = <ClipboardList className="w-5 h-5 text-emerald-600" />;
  } else if (type === 'resultat') {
    items = availableResults;
    title = 'Partager des résultats';
    icon = <Microscope className="w-5 h-5 text-purple-600" />;
  }
  
  const filteredItems = items.filter(item => {
    const searchTerm = search.toLowerCase();
    if (type === 'cas') return item.title.toLowerCase().includes(searchTerm);
    if (type === 'consultation') return item.patient.toLowerCase().includes(searchTerm);
    if (type === 'resultat') return item.patient.toLowerCase().includes(searchTerm);
    return true;
  });
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-5 border-b border-(--ln) flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-(--t1)">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-(--sf3)">
            <X className="w-5 h-5 text-(--t3)" />
          </button>
        </div>
        <div className="p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => onShare(item, type)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--sf2) transition-colors text-left border border-(--ln)"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  {type === 'cas'
                    ? <FolderOpen className="w-5 h-5" />
                    : type === 'consultation'
                      ? <ClipboardList className="w-5 h-5" />
                      : <Microscope className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-(--t1)">{type === 'cas' ? item.title : item.patient}</p>
                  <p className="text-xs text-(--t3)">
                    {type === 'cas' && `${item.date} • ${item.author}`}
                    {type === 'consultation' && `${item.date} • ${item.pathology}`}
                    {type === 'resultat' && `${item.examType} • ${item.date}`}
                  </p>
                </div>
                <Share2 className="w-4 h-4 text-(--t4)" />
              </button>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-center text-(--t3) py-4">Aucun élément trouvé</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};