# ZINDAGI — Android + Website Starter

यह डाउनलोड करने योग्य शुरुआती प्रोजेक्ट है। इसमें responsive bilingual (Hindi/English) UI, feed, demo post creation, profile editing, privacy selection, joining counter, demo messaging और call placeholders हैं।

## महत्वपूर्ण स्थिति
- Firebase credentials के बिना ऐप **local demo mode** में चलता है।
- Demo profile, posts और joining इसी डिवाइस के browser `localStorage` में सेव होते हैं।
- Demo chat स्थानीय state में है; असली user-to-user messaging अभी configured नहीं है।
- Voice/video call UI मौजूद है; वास्तविक calls के लिए signaling/backend और LiveKit या WebRTC integration चाहिए।
- 1000 Joining badge इस starter में local demo counter पर आधारित है। Production में server-side validation, anti-spam और trusted counter जरूरी है।
- Blue milestone badge पहचान सत्यापन नहीं है।
- Firebase config browser app में public config होता है; Firestore/Storage Security Rules और App Check जरूरी हैं। कभी भी service-account private key frontend में न रखें।

## वेबसाइट चलाना (कंप्यूटर पर)
Node.js 20+ और npm install करें, फिर:
```bash
npm install
npm run dev
```
Vite द्वारा दिया गया local URL खोलें। Production build:
```bash
npm run build
```
`dist/` वेबसाइट deploy करने के लिए है।

## Firebase जोड़ना
1. Firebase Console में project बनाएं।
2. Authentication में Email/Password provider enable करें।
3. Firestore Database बनाएं।
4. Storage enable करें (plan/region availability और billing requirements जाँचें)।
5. Firebase Web App config लेकर `.env.example` को `.env.local` नाम से कॉपी करें और `VITE_FIREBASE_...` values भरें।
6. Firestore Rules और Storage Rules को Firebase Console में review करके publish करें।
7. `npm run dev` दोबारा चलाएं।

ध्यान दें: इस starter में Firebase Auth और post upload का शुरुआती hook है। Production-grade profiles, feeds, private account access, chat membership, notifications, moderation, call signaling, rate limits और admin tools को अलग से पूरा और test करना होगा। मौजूदा rules production launch के लिए पूर्ण नहीं हैं।

## Android APK बनाना
Capacitor के लिए Android Studio और Android SDK वाला कंप्यूटर आवश्यक है:
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Android Studio में Build > Build Bundle(s) / APK(s) से APK/AAB बनाएं।
केवल Android फोन से source edit/preview किया जा सकता है; APK compile/sign करने के लिए आम तौर पर कंप्यूटर या cloud build service चाहिए।

## मोबाइल से शुरू करने का आसान तरीका
- ZIP को फोन में डाउनलोड और extract करें।
- GitHub पर नया private repository बनाकर files upload कर सकते हैं।
- GitHub Codespaces या किसी भरोसेमंद cloud development environment में Node/npm commands चलाएं।
- वेबसाइट deploy करने से पहले `.env.local`, rules, privacy policy और security testing पूरी करें।

## अभी बाकी जरूरी production काम
- पूर्ण user profile backend और avatar upload
- Private profile request/approval और post access enforcement
- Follow/Joining graph में unique membership validation
- Chat conversation model, delivery/read status, blocking/reporting
- Push notifications
- WebRTC/LiveKit signaling, call permissions और abuse controls
- Admin moderation dashboard, content reporting, age-appropriate safety
- Privacy policy, Terms, deletion/export workflow, backups and monitoring
- Load testing, security review, accessibility and app-store compliance
