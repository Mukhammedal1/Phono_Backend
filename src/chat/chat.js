// Configuration
const API_URL = 'http://localhost:3000'; // Replace with your actual API URL
const CURRENT_USER_ID = 1; // Replace with actual user authentication
const CURRENT_USER_NAME = 'John Doe'; // Replace with actual user name

// DOM Elements
const chatList = document.getElementById('chat-list');
const chatInterface = document.getElementById('chat-interface');
const emptyState = document.getElementById('empty-state');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatTitle = document.getElementById('chat-title');
const recipientName = document.getElementById('recipient-name');
const recipientStatus = document.getElementById('recipient-status');
const typingIndicator = document.getElementById('typing-indicator');
const currentUserName = document.getElementById('current-user-name');
const productList = document.getElementById('product-list');

// State
let socket;
let activeChats = [];
let currentChatId = null;
let typingTimeout = null;
let onlineUsers = new Set();
let userCache = new Map(); // Cache for user data
let phoneCache = new Map(); // Cache for phone data

// Set current user name
currentUserName.textContent = CURRENT_USER_NAME;

// Initialize Socket.IO connection
function initializeSocket() {
  // Connect to the WebSocket server with the current user ID
  socket = io(API_URL, {
    query: {
      userId: CURRENT_USER_ID
    }
  });

  // Socket event listeners
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    // Load demo products after connection
    loadDemoProducts();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('chatCreated', (chat) => {
    console.log('New chat created:', chat);

    // Add chat to our array and update UI
    addChat(chat);

    // Join the chat room
    socket.emit('joinChat', chat.id);

    // Open the chat - make sure this happens after the chat is added
    setTimeout(() => {
      openChat(chat.id);
    }, 100);
  });

  socket.on('userOnline', ({ userId }) => {
    console.log(`User ${userId} is online`);
    onlineUsers.add(userId);
    updateUserStatus(userId);
  });

  socket.on('userOffline', ({ userId }) => {
    console.log(`User ${userId} is offline`);
    onlineUsers.delete(userId);
    updateUserStatus(userId);
  });

  // Listen for typing events
  socket.on('typing', handleTypingEvent);
  socket.on('stopTyping', handleStopTypingEvent);

  // Listen for error events
  socket.on('errorEvent', (error) => {
    console.error('Socket error:', error);
    alert(`Error: ${error.message}`);
  });
}

// Update user status indicators
function updateUserStatus(userId) {
  // Update status in chat list
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    const itemUserId = parseInt(item.dataset.userId);
    if (itemUserId === userId) {
      const statusIndicator = item.querySelector('.status-indicator');
      statusIndicator.className = `status-indicator ${onlineUsers.has(userId) ? 'online' : 'offline'}`;
    }
  });

  // Update status in active chat header if this is the current recipient
  if (currentChatId) {
    const activeChat = activeChats.find(chat => chat.id === currentChatId);
    if (activeChat) {
      const otherUserId = getOtherUserId(activeChat);
      if (otherUserId === userId) {
        recipientStatus.className = `status-indicator ${onlineUsers.has(userId) ? 'online' : 'offline'}`;
      }
    }
  }
}

// Handle typing events
function handleTypingEvent(data) {
  const eventChatId = parseInt(data.chatId);
  const typingUserId = parseInt(data.userId);

  // Only show typing indicator if this is the current chat and not the current user
  if (currentChatId === eventChatId && typingUserId !== CURRENT_USER_ID) {
    typingIndicator.style.display = 'inline';
  }
}

// Handle stop typing events
function handleStopTypingEvent(data) {
  const eventChatId = parseInt(data.chatId);
  const typingUserId = parseInt(data.userId);

  // Only hide typing indicator if this is the current chat and not the current user
  if (currentChatId === eventChatId && typingUserId !== CURRENT_USER_ID) {
    typingIndicator.style.display = 'none';
  }
}

// Load demo products
function loadDemoProducts() {
  // In a real app, you would fetch products from your API
  const demoProducts = [
    {
      id: 1, // Make sure this ID exists in your Phone table
      title: 'iPhone 13 Pro',
      price: 999.99,
      sellerId: 2,
      sellerName: 'Jane Smith'
    },
    {
      id: 2, // Make sure this ID exists in your Phone table
      title: 'MacBook Air M1',
      price: 899.99,
      sellerId: 3,
      sellerName: 'Bob Johnson'
    },
    {
      id: 3, // Make sure this ID exists in your Phone table
      title: 'Sony PlayStation 5',
      price: 499.99,
      sellerId: 4,
      sellerName: 'Alice Brown'
    }
  ];

  renderProductList(demoProducts);
}

// Render product list
function renderProductList(products) {
  productList.innerHTML = '';

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    productCard.innerHTML = `
            <div class="product-image">Product Image</div>
            <div class="product-title">${product.title}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-seller">Seller: ${product.sellerName}</div>
            <button class="chat-button" data-product-id="${product.id}" data-seller-id="${product.sellerId}">
                Chat with Seller
            </button>
        `;

    const chatButton = productCard.querySelector('.chat-button');
    chatButton.addEventListener('click', () => {
      startNewChat(product.id);
    });

    productList.appendChild(productCard);
  });
}

// Set up listeners for a specific chat
function setupChatListeners(chatId) {
  // Remove existing listeners to avoid duplicates
  socket.off(`newMessage:${chatId}`);
  socket.off(`unreadCount:${chatId}`);
  socket.off(`messagesRead:${chatId}`);

  // Listen for new messages in this chat
  socket.on(`newMessage:${chatId}`, (message) => {
    handleNewMessage(chatId, message);
  });

  // Listen for unread count updates
  socket.on(`unreadCount:${chatId}`, ({ count }) => {
    updateUnreadCount(chatId, count);
  });

  // Listen for messages read status
  socket.on(`messagesRead:${chatId}`, ({ userId }) => {
    updateMessagesReadStatus(chatId, userId);
  });
}

// Render the chat list
function renderChatList() {
  chatList.innerHTML = '';

  if (activeChats.length === 0) {
    chatList.innerHTML = '<div class="empty-state">No active chats</div>';
    return;
  }

  // Sort chats by last message time (most recent first)
  const sortedChats = [...activeChats].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.createdAt || 0);
    const timeB = new Date(b.lastMessageTime || b.createdAt || 0);
    return timeB - timeA;
  });

  sortedChats.forEach(chat => {
    const chatElement = createChatItemElement(chat);
    chatList.appendChild(chatElement);
  });
}

// Add a chat to our data and UI
function addChat(chat) {
  // Check if chat already exists in the list
  const existingChatIndex = activeChats.findIndex(c => c.id === chat.id);

  if (existingChatIndex !== -1) {
    // Update existing chat
    activeChats[existingChatIndex] = {
      ...activeChats[existingChatIndex],
      ...chat
    };
  } else {
    // Process the chat data to match our UI needs
    const processedChat = processChat(chat);

    // Add new chat
    activeChats.push(processedChat);

    // Set up listeners for this chat
    setupChatListeners(chat.id);
  }

  // Re-render the chat list
  renderChatList();
}

// Process chat data from the server to match our UI needs
function processChat(chat) {
  console.log('Processing chat:', chat);

  // Extract product name from the Phone object
  let productName = `Chat #${chat.id}`;

  if (chat.Phone) {
    productName = chat.Phone.name || `Phone #${chat.Phone.id}`;
  } else if (chat.phoneId) {
    productName = `Phone #${chat.phoneId}`;
  }

  // Extract last message if available
  let lastMessage = '';
  let lastMessageTime = chat.createdAt;

  if (chat.messages && chat.messages.length > 0) {
    const message = chat.messages[0]; // First message (most recent if sorted desc)
    lastMessage = message.message || message.content || '';
    lastMessageTime = message.sentAt || message.createdAt;
  }

  return {
    ...chat,
    productName,
    lastMessage,
    lastMessageTime,
    unreadCount: 0 // Will be updated by the server
  };
}

// Create a chat item element
function createChatItemElement(chat) {
  const otherUserId = getOtherUserId(chat);
  const otherUserName = getUserName(otherUserId);

  const chatItem = document.createElement('div');
  chatItem.className = `chat-item ${currentChatId === chat.id ? 'active' : ''}`;
  chatItem.dataset.chatId = chat.id;
  chatItem.dataset.userId = otherUserId;

  const lastMessageTime = new Date(chat.lastMessageTime || chat.createdAt);
  const timeString = formatTime(lastMessageTime);

  chatItem.innerHTML = `
        <div class="chat-item-header">
            <div class="chat-item-title">${chat.productName || 'Chat'}</div>
            <div class="chat-item-time">${timeString}</div>
        </div>
        <div class="user-status">
            <span class="status-indicator ${onlineUsers.has(otherUserId) ? 'online' : 'offline'}"></span>
            <span>${otherUserName}</span>
        </div>
        <div class="chat-item-preview">${chat.lastMessage || 'No messages yet'}</div>
        ${chat.unreadCount ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
    `;

  chatItem.addEventListener('click', () => {
    openChat(chat.id);
  });

  return chatItem;
}

// Get user name from cache or use placeholder
function getUserName(userId) {
  if (userId === CURRENT_USER_ID) return CURRENT_USER_NAME;
  return userCache.get(userId) || `User #${userId}`;
}

// Open a chat
function openChat(chatId) {
  console.log('Opening chat:', chatId);

  currentChatId = chatId;
  const chat = activeChats.find(c => c.id === chatId);

  if (!chat) {
    console.error(`Chat with ID ${chatId} not found`);
    return;
  }

  // Update UI
  emptyState.style.display = 'none';
  chatInterface.style.display = 'flex';

  // Update chat header
  chatTitle.textContent = chat.productName || 'Chat';

  const otherUserId = getOtherUserId(chat);
  const otherUserName = getUserName(otherUserId);
  recipientName.textContent = otherUserName;
  recipientStatus.className = `status-indicator ${onlineUsers.has(otherUserId) ? 'online' : 'offline'}`;

  // Hide typing indicator
  typingIndicator.style.display = 'none';

  // Mark chat as active in the list
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.classList.remove('active');
    if (parseInt(item.dataset.chatId) === chatId) {
      item.classList.add('active');
    }
  });

  // Load messages
  loadChatMessages(chatId);

  // Mark messages as read
  socket.emit('markAsRead', { chatId, userId: CURRENT_USER_ID });
}

// Load chat messages
function loadChatMessages(chatId) {
  // Clear messages container
  messagesContainer.innerHTML = '';

  // In a real app, you would fetch messages from your API
  // For demo purposes, we'll use the messages from the chat object if available
  const chat = activeChats.find(c => c.id === chatId);

  if (chat && chat.messages && chat.messages.length > 0) {
    // Sort messages by time (oldest first)
    const sortedMessages = [...chat.messages].sort((a, b) => {
      const timeA = new Date(a.sentAt || a.createdAt);
      const timeB = new Date(b.sentAt || b.createdAt);
      return timeA - timeB;
    });

    // Render messages
    sortedMessages.forEach(message => {
      addMessageToChat({
        id: message.id,
        chatId,
        senderId: message.senderId,
        content: message.message || message.content,
        createdAt: message.sentAt || message.createdAt,
        read: message.isRead
      });
    });
  } else {
    // If no messages, show a placeholder
    messagesContainer.innerHTML = '<div class="empty-state">No messages yet</div>';
  }

  // Scroll to bottom
  scrollToBottom();
}

// Add a message to the chat
function addMessageToChat(message) {
  const messageElement = document.createElement('div');
  const isSent = message.senderId === CURRENT_USER_ID;
  messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
  messageElement.dataset.messageId = message.id;

  const messageTime = new Date(message.createdAt);
  const timeString = formatTime(messageTime);

  messageElement.innerHTML = `
        ${message.content}
        <span class="message-time">${timeString}</span>
        ${isSent ? `<span class="message-status">${message.read ? 'Read' : 'Delivered'}</span>` : ''}
    `;

  messagesContainer.appendChild(messageElement);
}

// Handle new message
function handleNewMessage(chatId, message) {
  // Find the chat
  const chat = activeChats.find(c => c.id === chatId);
  if (!chat) return;

  // Update chat with last message
  chat.lastMessage = message.message || message.content;
  chat.lastMessageTime = message.sentAt || message.createdAt;

  // If this is the current chat, add the message to the UI
  if (currentChatId === chatId) {
    addMessageToChat({
      id: message.id,
      chatId,
      senderId: message.senderId,
      content: message.message || message.content,
      createdAt: message.sentAt || message.createdAt,
      read: message.isRead
    });
    scrollToBottom();

    // Mark as read if the message is not from the current user
    if (message.senderId !== CURRENT_USER_ID) {
      socket.emit('markAsRead', { chatId, userId: CURRENT_USER_ID });
    }
  } else {
    // If not the current chat, increment unread count
    if (message.senderId !== CURRENT_USER_ID) {
      chat.unreadCount = (chat.unreadCount || 0) + 1;
    }
  }

  // Re-render chat list to update last message and unread count
  renderChatList();
}

// Update unread count
function updateUnreadCount(chatId, count) {
  const chat = activeChats.find(c => c.id === chatId);
  if (chat) {
    chat.unreadCount = count;
    renderChatList();
  }
}

// Update messages read status
function updateMessagesReadStatus(chatId, userId) {
  // Only update if the reader is not the current user
  if (userId === CURRENT_USER_ID) return;

  // Update read status for all messages sent by current user
  const messageElements = messagesContainer.querySelectorAll('.message.sent');
  messageElements.forEach(element => {
    const statusElement = element.querySelector('.message-status');
    if (statusElement) {
      statusElement.textContent = 'Read';
    }
  });
}

// Send a message
function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !currentChatId) return;

  const messageDto = {
    chatId: currentChatId,
    senderId: CURRENT_USER_ID,
    content: content
  };

  // Emit the message to the server
  socket.emit('sendMessage', messageDto);

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Stop typing indicator
  socket.emit('stopTyping', { chatId: currentChatId, userId: CURRENT_USER_ID });
}

// Start a new chat
function startNewChat(phoneId) {
  // Use productId to match your CreateChatDto
  const createChatDto = {
    senderId: CURRENT_USER_ID,
    productId: phoneId // Using productId as specified in your DTO
  };

  console.log('Creating chat with:', createChatDto);
  socket.emit('createChat', createChatDto);
}

// Helper function to get the other user ID in a chat
function getOtherUserId(chat) {
  if (chat.senderId === CURRENT_USER_ID) {
    // If current user is the sender, the other user is the phone owner
    return chat.Phone?.userId || 0;
  } else {
    // If current user is not the sender, the other user is the sender
    return chat.senderId;
  }
}

// Helper function to format time
function formatTime(date) {
  const now = new Date();
  const diff = now - date;

  // If less than 24 hours, show time
  if (diff < 86400000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // If less than a week, show day
  if (diff < 604800000) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  // Otherwise show date
  return date.toLocaleDateString();
}

// Helper function to scroll to bottom of messages
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listeners
messageInput.addEventListener('keypress', (e) => {
  // Send message on Enter (without Shift)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }

  // Emit typing event
  if (!typingTimeout && currentChatId) {
    socket.emit('typing', { chatId: currentChatId, userId: CURRENT_USER_ID });
  }

  // Clear previous timeout
  clearTimeout(typingTimeout);

  // Set new timeout
  typingTimeout = setTimeout(() => {
    if (currentChatId) {
      socket.emit('stopTyping', { chatId: currentChatId, userId: CURRENT_USER_ID });
    }
    typingTimeout = null;
  }, 3000);
});

sendButton.addEventListener('click', sendMessage);

// Auto-resize textarea
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = (messageInput.scrollHeight) + 'px';
});

// Initialize the app
initializeSocket();