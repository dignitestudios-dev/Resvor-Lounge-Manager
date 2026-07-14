// Import scripts for Firebase compat SDK
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyBDkYIIrcyTCIibphB2ljyg1HW2wnGS3t8",
  authDomain: "resvor-f8d95.firebaseapp.com",
  projectId: "resvor-f8d95",
  storageBucket: "resvor-f8d95.firebasestorage.app",
  messagingSenderId: "426613970767",
  appId: "1:426613970767:web:a286883422ad084a6fd73a"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/logo.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
