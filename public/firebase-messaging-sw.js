importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBtS2E18BEc1RPoyEdJED6JXoboyaR6IfQ",
  authDomain: "betweenus-ca598.firebaseapp.com",
  projectId: "betweenus-ca598",
  messagingSenderId: "572090117717",
  appId: "1:572090117717:web:596d4bdf70a25c8f526edc",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});

self.addEventListener("push", function (event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
    }),
  );
});
