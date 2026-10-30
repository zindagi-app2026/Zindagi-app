import React, { useMemo, useState } from 'react';
import {
  Home, Compass, PlusSquare, MessageCircle, UserRound, Heart, ImagePlus,
  Video, Users, ShieldCheck, Lock, Globe, Phone, VideoIcon, Languages,
  Search, LogOut, BadgeCheck, Send, Menu, X
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, firebaseReady } from './firebase';

const copy = {
  hi: {
    tagline:'अपनी ज़िंदगी, अपनी पहचान।', home:'होम', explore:'एक्सप्लोर', create:'पोस्ट बनाएं', chat:'मैसेज', profile:'प्रोफाइल',
    welcome:'आपकी दुनिया', intro:'अपनी कहानी दुनिया के साथ साझा करें।', join:'Joining', unjoin:'Unjoining',
    public:'Public', private:'Private', caption:'आप क्या साझा करना चाहते हैं?', publish:'पोस्ट प्रकाशित करें',
    login:'लॉगिन', signup:'अकाउंट बनाएं', email:'ईमेल', password:'पासवर्ड', username:'यूजरनेम',
    bio:'अपने बारे में लिखें', gender:'जेंडर', save:'प्रोफाइल सेव करें', demo:'डेमो मोड',
    empty:'अभी कोई पोस्ट नहीं है। पहली पोस्ट बनाएं!', likes:'पसंद', send:'भेजें',
    privacy:'प्रोफाइल की गोपनीयता', milestone:'Joining Milestone', calls:'कॉल सुविधा',
    callnote:'वास्तविक कॉल के लिए सुरक्षित signaling सर्वर और call provider सेटअप करना होगा।',
    chatnote:'यह शुरुआती संस्करण स्थानीय डेमो चैट दिखाता है। असली चैट के लिए Firebase कनेक्शन करें।',
    firebase:'Firebase सेटअप बाकी है', connected:'Firebase कॉन्फ़िगरेशन मिला',
    choose:'फोटो या वीडियो चुनें', text:'टेक्स्ट पोस्ट', short:'शॉर्ट वीडियो', long:'लंबा वीडियो',
    notReady:'यह फीचर अभी डेमो है।', milestoneInfo:'1000 वैध Joining पर Milestone बैज। यह पहचान सत्यापन नहीं है।'
  },
  en: {
    tagline:'Your life, your identity.', home:'Home', explore:'Explore', create:'Create Post', chat:'Messages', profile:'Profile',
    welcome:'Your world', intro:'Share your story with the world.', join:'Joining', unjoin:'Unjoining',
    public:'Public', private:'Private', caption:'What would you like to share?', publish:'Publish post',
    login:'Log in', signup:'Create account', email:'Email', password:'Password', username:'Username',
    bio:'About you', gender:'Gender', save:'Save profile', demo:'Demo mode',
    empty:'No posts yet. Create the first post!', likes:'Likes', send:'Send',
    privacy:'Profile privacy', milestone:'Joining Milestone', calls:'Calling',
    callnote:'Real calls require a secure signaling server and call provider setup.',
    chatnote:'This starter shows a local demo chat. Connect Firebase for real messaging.',
    firebase:'Firebase setup needed', connected:'Firebase configuration found',
    choose:'Choose photo or video', text:'Text post', short:'Short video', long:'Long video',
    notReady:'This feature is currently a demo.', milestoneInfo:'Milestone badge at 1000 valid Joinings. This is not identity verification.'
  }
};

const seedPosts = [
  { id:'welcome', username:'ZINDAGI Team', caption:'Welcome to ZINDAGI! अपनी ज़िंदगी, अपनी पहचान।', type:'text', likes:12 },
  { id:'community', username:'Community', caption:'Share your moments, creativity and stories.', type:'text', likes:8 }
];

export default function App() {
  const [lang,setLang] = useState('hi');
  const t = copy[lang];
  const [page,setPage] = useState('home');
  const [user,setUser] = useState(()=>JSON.parse(localStorage.getItem('zindagi-profile') || 'null'));
  const [posts,setPosts] = useState(()=>JSON.parse(localStorage.getItem('zindagi-posts') || 'null') || seedPosts);
  const [joining,setJoining] = useState(()=>JSON.parse(localStorage.getItem('zindagi-joining') || '[]'));
  const [privacy,setPrivacy] = useState(user?.privacy || 'Public');
  const [caption,setCaption] = useState('');
  const [postType,setPostType] = useState('text');
  const [file,setFile] = useState(null);
  const [query,setQuery] = useState('');
  const [messages,setMessages] = useState([]);
  const [message,setMessage] = useState('');
  const [notice,setNotice] = useState('');
  const [authMode,setAuthMode] = useState('signup');
  const [authEmail,setAuthEmail] = useState('');
  const [authPassword,setAuthPassword] = useState('');
  const [authName,setAuthName] = useState('');
  const [profileBio,setProfileBio] = useState(user?.bio || '');
  const [gender,setGender] = useState(user?.gender || 'Prefer not to say');
  const [avatar,setAvatar] = useState(null);

  const count = joining.length;
  const isMilestone = count >= 1000;
  const visiblePosts = useMemo(()=>posts.filter(p => (p.username||'').toLowerCase().includes(query.toLowerCase()) || (p.caption||'').toLowerCase().includes(query.toLowerCase())),[posts,query]);

  function persistProfile(next) {
    setUser(next); localStorage.setItem('zindagi-profile',JSON.stringify(next));
    setPrivacy(next.privacy || 'Public'); setProfileBio(next.bio || '');
  }
  async function handleAuth(e) {
    e.preventDefault(); setNotice('');
    if (!authEmail || !authPassword) return setNotice('Email and password are required.');
    try {
      if (firebaseReady) {
        const cred = authMode === 'signup'
          ? await createUserWithEmailAndPassword(auth,authEmail,authPassword)
          : await signInWithEmailAndPassword(auth,authEmail,authPassword);
        persistProfile({uid:cred.user.uid,email:authEmail,username:authName || authEmail.split('@')[0],bio:'',gender:'Prefer not to say',privacy:'Public'});
      } else {
        if (authPassword.length < 8) return setNotice('Demo password must be at least 8 characters.');
        persistProfile({uid:'local-demo',email:authEmail,username:authName || authEmail.split('@')[0],bio:'',gender:'Prefer not to say',privacy:'Public'});
        setNotice('Demo account created on this device only. Configure Firebase for real accounts.');
      }
    } catch(err) { setNotice(err.message); }
  }
  async function publishPost(e) {
    e.preventDefault();
    if (!caption.trim() && !file) return setNotice('Add a caption or choose media.');
    let mediaUrl = '';
    try {
      if (firebaseReady && user?.uid !== 'local-demo' && file) {
        const storageRef = ref(storage,`posts/${user.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef,file); mediaUrl = await getDownloadURL(storageRef);
      } else if (file) mediaUrl = URL.createObjectURL(file);
      const post = {id:crypto.randomUUID(),uid:user?.uid || 'guest',username:user?.username || 'Guest',caption,type:postType,mediaUrl,likes:0,createdAt:Date.now()};
      if (firebaseReady && user?.uid !== 'local-demo') await addDoc(collection(db,'posts'),{...post,createdAt:serverTimestamp()});
      const next=[post,...posts];setPosts(next);localStorage.setItem('zindagi-posts',JSON.stringify(next));
      setCaption('');setFile(null);setNotice('Post added.');setPage('home');
    } catch(err) { setNotice(err.message); }
  }
  function toggleJoin(id) {
    const next=joining.includes(id)?joining.filter(x=>x!==id):[...joining,id];
    setJoining(next);localStorage.setItem('zindagi-joining',JSON.stringify(next));
  }
  function savePrivacy(value) {
    const next={...(user||{}),privacy:value};persistProfile(next);
  }
  function sendMessage(e) {
    e.preventDefault(); if(!message.trim()) return;
    setMessages([...messages,{text:message,from:user?.username || 'You',time:new Date().toLocaleTimeString()}]);setMessage('');
  }
  function logout() {
    if (firebaseReady && auth?.currentUser) signOut(auth).catch(()=>{});
    localStorage.removeItem('zindagi-profile');setUser(null);setPage('home');setNotice('Logged out.');
  }
  const nav=[['home',Home,t.home],['explore',Compass,t.explore],['create',PlusSquare,t.create],['chat',MessageCircle,t.chat],['profile',UserRound,t.profile]];
  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setPage('home')}><span className="brand-mark">Z</span><span>ZINDAGI<small>{t.tagline}</small></span></button>
      <div className="top-actions"><span className={`status ${firebaseReady?'online':''}`}>{firebaseReady?'● Connected':'● Demo'}</span><button className="icon-btn" onClick={()=>setLang(lang==='hi'?'en':'hi')} title="Language"><Languages size={19}/><span>{lang==='hi'?'HI':'EN'}</span></button></div>
    </header>
    <div className="layout">
      <aside className="sidebar">
        <div className="side-user"><div className="avatar">{user?.username?.[0]?.toUpperCase() || 'Z'}</div><div><b>{user?.username || 'Welcome'}</b><small>{user?.email || 'Join ZINDAGI'}</small></div></div>
        {nav.map(([id,Icon,label])=><button key={id} className={`nav-item ${page===id?'selected':''}`} onClick={()=>setPage(id)}><Icon size={19}/>{label}</button>)}
        <div className="side-bottom"><ShieldCheck size={17}/> Safe community</div>
      </aside>
      <main className="main-content">
        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
        {page==='home' && <><div className="hero"><div><span className="eyebrow">WELCOME TO YOUR COMMUNITY</span><h1>{t.welcome}</h1><p>{t.intro}</p><button className="btn-primary" onClick={()=>setPage('create')}><PlusSquare size={17}/> {t.create}</button></div><div className="hero-orb">✦</div></div><div className="section-head"><div><h2>{t.home}</h2><p>Moments from the ZINDAGI community</p></div><button className="btn-quiet" onClick={()=>setPage('explore')}><Compass size={16}/> Explore</button></div><div className="feed">{posts.map(p=><PostCard key={p.id} post={p} t={t} onLike={()=>{const next=posts.map(x=>x.id===p.id?{...x,likes:(x.likes||0)+1}:x);setPosts(next);localStorage.setItem('zindagi-posts',JSON.stringify(next));}}/>)}</div></>}
        {page==='explore' && <><div className="section-head"><div><h1>{t.explore}</h1><p>Find posts and creators</p></div></div><div className="searchbox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search creators or posts..."/></div><div className="feed">{visiblePosts.map(p=><PostCard key={p.id} post={p} t={t}/>)}</div><div className="panel"><h3>Creator discovery</h3><p>Suggested creator accounts will appear here when connected to the backend.</p><button className="btn-primary" onClick={()=>setNotice(t.notReady)}><Users size={16}/> Discover people</button></div></>}
        {page==='create' && <><div className="section-head"><div><h1>{t.create}</h1><p>Share a photo, video or thought</p></div></div><form className="panel form-panel" onSubmit={publishPost}><label>Post type<select value={postType} onChange={e=>setPostType(e.target.value)}><option value="text">{t.text}</option><option value="photo">Photo</option><option value="short">{t.short}</option><option value="long">{t.long}</option></select></label><label>{t.choose}<input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>{file && <p className="file-name">{file.name}</p>}<label>{t.caption}<textarea rows="4" value={caption} onChange={e=>setCaption(e.target.value)} placeholder={t.caption}/></label><button className="btn-primary" type="submit"><PlusSquare size={17}/>{t.publish}</button><p className="hint">Demo posts are stored on this device. Configure Firebase for cloud media and posts.</p></form></>}
        {page==='chat' && <><div className="section-head"><div><h1>{t.chat}</h1><p>Private conversations</p></div></div><div className="panel chat-panel"><div className="chat-empty"><MessageCircle size={34}/><h3>ZINDAGI Chat</h3><p>{t.chatnote}</p></div><div className="messages">{messages.map((m,i)=><div key={i} className="message-bubble"><b>{m.from}</b><p>{m.text}</p><small>{m.time}</small></div>)}</div><form className="send-row" onSubmit={sendMessage}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a message..."/><button className="btn-primary" aria-label="Send"><Send size={17}/></button></form></div><div className="call-grid"><button className="panel call-card" onClick={()=>setNotice(t.callnote)}><Phone/> <b>Voice Call</b><small>Start an audio call</small></button><button className="panel call-card" onClick={()=>setNotice(t.callnote)}><VideoIcon/> <b>Video Call</b><small>Start a video call</small></button></div></>}
        {page==='profile' && <><div className="section-head"><div><h1>{t.profile}</h1><p>Your personal space</p></div>{user && <button className="btn-quiet" onClick={logout}><LogOut size={16}/> Log out</button>}</div>{!user ? <form className="panel form-panel" onSubmit={handleAuth}><div className="auth-switch"><button type="button" className={authMode==='signup'?'active':''} onClick={()=>setAuthMode('signup')}>{t.signup}</button><button type="button" className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>{t.login}</button></div>{authMode==='signup'&&<label>{t.username}<input value={authName} onChange={e=>setAuthName(e.target.value)} required/></label>}<label>{t.email}<input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required/></label><label>{t.password}<input type="password" minLength="8" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required/></label><button className="btn-primary" type="submit">{authMode==='signup'?t.signup:t.login}</button><p className="hint">{firebaseReady?'Firebase authentication configured.':'Demo login only. Add Firebase settings to enable real accounts.'}</p></form> : <div className="profile-grid"><div className="panel profile-card"><div className="profile-cover"></div><div className="profile-avatar">{user.username?.[0]?.toUpperCase()||'Z'}</div><h2>{user.username} {isMilestone&&<BadgeCheck className="verified" size={19}/>}</h2><p>{user.bio || 'Add a bio to introduce yourself.'}</p><div className="stats"><div><b>{count}</b><small>Joining</small></div><div><b>{posts.filter(p=>p.uid===user.uid).length}</b><small>Posts</small></div></div>{isMilestone&&<span className="milestone"><BadgeCheck size={16}/> 1000+ Joining milestone</span>}</div><div className="panel form-panel"><h3>Edit profile</h3><label>{t.username}<input value={user.username||''} onChange={e=>persistProfile({...user,username:e.target.value})}/></label><label>{t.bio}<textarea value={profileBio} onChange={e=>{setProfileBio(e.target.value);persistProfile({...user,bio:e.target.value})}}/></label><label>{t.gender}<select value={gender} onChange={e=>{setGender(e.target.value);persistProfile({...user,gender:e.target.value})}}><option>Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option></select></label><h3>{t.privacy}</h3><div className="privacy-options"><button className={privacy==='Public'?'chosen':''} onClick={()=>savePrivacy('Public')} type="button"><Globe size={17}/>{t.public}</button><button className={privacy==='Private'?'chosen':''} onClick={()=>savePrivacy('Private')} type="button"><Lock size={17}/>{t.private}</button></div><p className="hint">{t.milestoneInfo}</p></div></div>}</>}
      </main>
      <aside className="rightbar"><div className="panel mini-card"><span className="eyebrow">YOUR ZINDAGI</span><h3>Connect with people</h3><p>Share moments and build your community.</p><button className="btn-primary" onClick={()=>setPage('explore')}>Explore community</button></div><div className="panel mini-card"><h3>{t.milestone}</h3><div className="milestone-number">{count}<span>/1000</span></div><div className="progress"><i style={{width:`${Math.min(100,count/10)}%`}}/></div><p className="hint">{t.milestoneInfo}</p></div><div className="panel mini-card"><h3>{t.calls}</h3><p>{t.callnote}</p></div></aside>
    </div>
    <nav className="mobile-nav">{nav.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>
    <footer>© ZINDAGI · Your life, your identity · <span>{firebaseReady?t.connected:t.firebase}</span></footer>
  </div>;
}

function PostCard({post,t,onLike}) {
  return <article className="post-card"><div className="post-author"><div className="avatar small">{(post.username||'Z')[0].toUpperCase()}</div><div><b>{post.username}</b><small>Community post</small></div></div>{post.mediaUrl && (post.type==='photo'||post.mediaUrl.startsWith('blob:')&&post.type!=='short'&&post.type!=='long') ? <img className="post-media" src={post.mediaUrl} alt="Post media"/> : post.mediaUrl ? <video className="post-media" controls src={post.mediaUrl}/> : null}<p className="post-caption">{post.caption}</p><div className="post-actions"><button onClick={onLike}><Heart size={17}/> {t.likes} · {post.likes||0}</button><button><MessageCircle size={17}/> Comment</button></div></article>;
}