import React, { useState, useEffect, useRef, useMemo } from 'react';
 
// Initialize Supabase Client
const supabaseUrl = 'https://gtjceelqyazhslteyshf.supabase.co';
const supabaseKey = 'sb_publishable_UrkE64Rnq6SSk068FWoiJg_YVJ6A3A6';
let supabase = null;
 
// ─── CRITICAL: Detect recovery token from URL hash BEFORE anything else ───────
// Supabase embeds the recovery session as a URL hash fragment like:
// #access_token=xxx&refresh_token=yyy&type=recovery
// We read this synchronously at module load time so we can gate the entire app.
const _rawHash = window.location.hash;
const _hashParams = new URLSearchParams(_rawHash.replace(/^#/, ''));
const IS_RECOVERY_LINK = _hashParams.get('type') === 'recovery';
// ──────────────────────────────────────────────────────────────────────────────
 
const MOCK_PRODUCTS = [
  { id: 1, name: "NJR Striker Black", nameJp: "ストライカー", price: 850, player: "NEYMAR", cat: "legend", bg: "#111418", icon: "#f2a7c3", isNew: true },
  { id: 2, name: "LM10 Albiceleste", nameJp: "アルビセレステ", price: 800, player: "MESSI", cat: "legend", bg: "#1a3a6b", icon: "#ffffff" },
  { id: 3, name: "CR7 Madeira Red", nameJp: "マデイラ", price: 800, player: "RONALDO", cat: "legend", bg: "#7a1520", icon: "#ffffff" },
  { id: 4, name: "KM7 Paris Sky", nameJp: "パリスカイ", price: 670, player: "MBAPPÉ", cat: "legend", bg: "#1a2a50", icon: "#adc8e8" },
  { id: 5, name: "EH9 Arctic White", nameJp: "アークティック", price: 650, player: "HAALAND", cat: "elite", bg: "#e8eaed", icon: "#e05010" },
  { id: 6, name: "MOS11 Desert Green", nameJp: "デザートグリーン", price: 520, player: "SALAH", cat: "elite", bg: "#0e3b22", icon: "#ffffff" },
  { id: 7, name: "Pitch Elite Carbon", nameJp: "エリートカーボン", price: 900, player: "ELITE", cat: "elite", bg: "#1a1e26", icon: "#f2a7c3", isNew: true },
  { id: 8, name: "Sakura Blossom Kit", nameJp: "さくら", price: 980, player: "SAKURA", cat: "sakura", bg: "linear-gradient(135deg,#f8e0ea,#ffd6e7)", icon: "#e07fa0", isNew: true },
  { id: 9, name: "Hanami Night Jersey", nameJp: "花見", price: 860, player: "SAKURA", cat: "sakura", bg: "linear-gradient(135deg,#1a0a1e,#3a1a3e)", icon: "#f2a7c3" },
  { id: 10, name: "Fuji Summit White", nameJp: "富士山", price: 720, player: "ELITE", cat: "sakura", bg: "linear-gradient(135deg,#f0f4f8,#e8eef4)", icon: "#c09070" },
  { id: 11, name: "Shibuya Street Black", nameJp: "渋谷", price: 750, player: "STREET", cat: "elite", bg: "#0a0a0f", icon: "#f2a7c3" },
  { id: 12, name: "Kyoto Gold Edition", nameJp: "京都", price: 1100, player: "LIMITED", cat: "sakura", bg: "linear-gradient(135deg,#1a1408,#2d2010)", icon: "#c9a96e", isNew: true }
];
 
const MARQUEE_MESSAGES = ['Free Shipping Over ₹1000', 'New Drop — Sakura 2025', 'Authentic & Certified 🌸', 'Kyoto Gold — Limited Edition', 'Custom Name Printing Available', '30-Day Easy Returns', '桜エディション — Now Live', 'Pro Legends Collection'];
 
/* --- Presentation Components --- */
const SakuraPetalsCanvas = React.memo(() => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight, animationId;
    const handleResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    handleResize(); window.addEventListener('resize', handleResize);
    class Petal {
      constructor() { this.reset(); this.y = Math.random() * H; }
      reset() { this.x = Math.random() * W; this.y = -20; this.s = Math.random() * 8 + 4; this.dy = Math.random() * 1.2 + 0.5; this.dx = Math.random() * 1.5 - 0.75; this.ang = Math.random() * Math.PI * 2; this.spin = (Math.random() - 0.5) * 0.04; this.op = Math.random() * 0.55 + 0.25; this.sw = Math.random() * 0.015; this.swO = Math.random() * Math.PI * 2; this.t = 0; }
      update() { this.t++; this.y += this.dy; this.x += this.dx + Math.sin(this.swO + this.t * this.sw) * 0.8; this.ang += this.spin; if (this.y > H + 20) this.reset(); }
      draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.ang); ctx.globalAlpha = this.op; ctx.beginPath(); ctx.moveTo(0, -this.s); ctx.bezierCurveTo(this.s*0.6, -this.s*0.6, this.s*0.8, this.s*0.2, 0, this.s*0.6); ctx.bezierCurveTo(-this.s*0.8, this.s*0.2, -this.s*0.6, -this.s*0.6, 0, -this.s); ctx.fillStyle = `hsl(${340 + Math.random() * 20}, 80%, ${78 + Math.random() * 10}%)`; ctx.fill(); ctx.restore(); }
    }
    const petals = Array.from({ length: 38 }, () => new Petal());
    const loop = () => { ctx.clearRect(0, 0, W, H); petals.forEach(p => { p.update(); p.draw(); }); animationId = requestAnimationFrame(loop); };
    loop(); return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas id="petal-canvas" ref={canvasRef}></canvas>;
});
 
const FujiBackground = React.memo(() => (
  <div className="bg-layer"><div className="fuji-bg"><svg width="100%" height="100%" viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fuji-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9eb1ce" /><stop offset="100%" stopColor="#e8edf5" stopOpacity="0.3" /></linearGradient></defs><path d="M -100 500 C 300 480 600 250 670 140 C 690 100 750 100 770 140 C 840 250 1140 480 1540 500 Z" fill="url(#fuji-base)" /><path d="M 670 140 C 690 100 750 100 770 140 C 785 170 805 210 820 250 C 790 230 770 260 750 240 C 730 220 710 260 690 230 C 670 200 650 240 620 250 C 635 210 655 170 670 140 Z" fill="#ffffff" /></svg></div></div>
));
 
const SakuraBranches = React.memo(() => (
  <div className="blossom-frame">
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg"><defs><g id="flower"><circle cx="0" cy="-7" r="8" fill="var(--sakura)" /><circle cx="6.6" cy="-2.1" r="8" fill="var(--sakura)" /><circle cx="4.1" cy="5.6" r="8" fill="var(--sakura-deep)" /><circle cx="-4.1" cy="5.6" r="8" fill="var(--sakura-deep)" /><circle cx="-6.6" cy="-2.1" r="8" fill="var(--sakura)" /><circle cx="0" cy="0" r="3" fill="#fff" /><circle cx="0" cy="0" r="1.5" fill="var(--gold)" /></g><g id="cluster"><use href="#flower" x="-10" y="-10" transform="scale(0.8) rotate(15)" opacity="0.9" /><use href="#flower" x="15" y="-5" transform="scale(0.9) rotate(45)" opacity="0.9" /><use href="#flower" x="5" y="15" transform="scale(0.85) rotate(70)" opacity="0.9" /><use href="#flower" x="0" y="0" transform="scale(1.2)" /><use href="#flower" x="-15" y="10" transform="scale(0.9) rotate(30)" /><use href="#flower" x="12" y="8" transform="scale(1.1) rotate(85)" /></g></defs></svg>
    {['left-branch', 'right-branch'].map((cls, idx) => (
      <svg key={idx} className={`frame-branch ${cls}`} viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
        <path d="M-20 -20 Q 100 80 350 200" stroke="var(--ink-mid)" strokeWidth="16" fill="none" strokeLinecap="round" /><path d="M 80 30 Q 180 150 220 350" stroke="var(--ink-mid)" strokeWidth="10" fill="none" strokeLinecap="round" /><path d="M 150 110 Q 300 160 450 150" stroke="var(--ink-mid)" strokeWidth="8" fill="none" strokeLinecap="round" /><path d="M 0 150 Q 100 250 150 400" stroke="var(--ink-mid)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <use href="#cluster" x="50" y="20" transform="scale(1.4)" /><use href="#cluster" x="150" y="110" transform="scale(1.6)" /><use href="#cluster" x="350" y="200" transform="scale(1.2)" /><use href="#cluster" x="220" y="350" transform="scale(1.3)" /><use href="#cluster" x="450" y="150" transform="scale(1.1)" /><use href="#cluster" x="150" y="400" transform="scale(1.2)" /><use href="#cluster" x="80" y="150" transform="scale(1.5) rotate(45)" /><use href="#cluster" x="220" y="180" transform="scale(1.4) rotate(-20)" /><use href="#cluster" x="40" y="250" transform="scale(1.3) rotate(15)" /><use href="#cluster" x="270" y="90" transform="scale(1.2) rotate(60)" /><use href="#cluster" x="0" y="100" transform="scale(1.8)" /><use href="#cluster" x="150" y="260" transform="scale(1.3)" />
      </svg>
    ))}
  </div>
));
 
/**
 * Main Application Entry
 * Handles Supabase SDK loading then renders the App.
 */
export default function AppWrapper() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const initSupabase = () => {
      try {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        setIsReady(true);
      } catch (err) {
        setError("Failed to start backend connection.");
      }
    };
    if (window.supabase) { initSupabase(); return; }
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.crossOrigin = "anonymous";
    script.onload = initSupabase;
    script.onerror = () => setError("Failed to load Supabase library.");
    document.head.appendChild(script);
  }, []);
 
  if (error) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf6f8', color: '#e05050' }}>{error}</div>;
  if (!isReady) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8', color: '#e07fa0' }}>Loading Sakura Store Environment...</div>;
 
  return <App />;
}
 
function App() {
  // ─── If the user arrived via a password-reset email link, we lock the
  //     entire app into recovery mode immediately — before any session check.
  const [currentView, setCurrentView] = useState(IS_RECOVERY_LINK ? 'auth' : 'store');
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(IS_RECOVERY_LINK);
 
  const [user, setUser] = useState(null);
 
  // Data Persistence State
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('sakura_cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('sakura_wishlist')) || []);
  const [isDataSynced, setIsDataSynced] = useState(false);
 
  // UI State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', isRemove: false });
  const [animatingBadge, setAnimatingBadge] = useState(false);
  const [animatingWishlist, setAnimatingWishlist] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
 
  const toastTimerRef = useRef(null);
  const badgeTimerRef = useRef(null);
  const wishlistBadgeTimerRef = useRef(null);
 
  // ─── Auth & Database Sync ───────────────────────────────────────────────────
  useEffect(() => {
    const syncData = async (activeUser) => {
      const { data: cartData } = await supabase.from('user_carts').select('items').eq('id', activeUser.id).single();
      const { data: wishData } = await supabase.from('user_wishlists').select('items').eq('id', activeUser.id).single();
 
      let dbCart = cartData?.items || [];
      let dbWish = wishData?.items || [];
      let localCart = JSON.parse(localStorage.getItem('sakura_cart')) || [];
      let localWish = JSON.parse(localStorage.getItem('sakura_wishlist')) || [];
 
      let mergedCart = [...dbCart];
      localCart.forEach(localItem => {
        const existing = mergedCart.find(i => i.id === localItem.id);
        if (existing) existing.qty += localItem.qty;
        else mergedCart.push(localItem);
      });
      let mergedWish = [...new Set([...dbWish, ...localWish])];
 
      setCart(mergedCart);
      setWishlist(mergedWish);
      setIsDataSynced(true);
 
      await supabase.from('user_carts').upsert({ id: activeUser.id, items: mergedCart });
      await supabase.from('user_wishlists').upsert({ id: activeUser.id, items: mergedWish });
 
      localStorage.removeItem('sakura_cart');
      localStorage.removeItem('sakura_wishlist');
    };
 
    // ── On initial load, check if there is already a session.
    // If IS_RECOVERY_LINK is true we SKIP the normal session bootstrap entirely.
    // Supabase will still fire onAuthStateChange with event='PASSWORD_RECOVERY',
    // which is our cue to render the update-password form.
    if (!IS_RECOVERY_LINK) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email
          });
          syncData(session.user);
        } else {
          setIsDataSynced(true);
        }
      });
    } else {
      // In recovery mode we won't sync any data; mark as ready immediately.
      setIsDataSynced(true);
    }
 
    // ── Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY fires when the recovery link is consumed.
      // At this point Supabase has established a temporary session for the user
      // so they can call updateUser({ password }). We show the update-password
      // form and do NOT treat this as a full login.
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
        setCurrentView('auth');
        setUser(null); // make sure the user is not "logged in" in the UI
        return;
      }
 
      // SIGNED_IN fires after a normal login (or after updateUser in some SDK
      // versions). Only act on it when we are NOT in recovery mode.
      if (event === 'SIGNED_IN' && !isRecoveringPassword) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email
          });
          syncData(session.user);
        }
        return;
      }
 
      // SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCart([]);
        setWishlist([]);
        setIsDataSynced(true);
      }
    });
 
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  // Lock background scroll when modals/drawers are open
  useEffect(() => {
    if (cartOpen || wishlistOpen || profileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen, wishlistOpen, profileOpen]);
 
  // Persist cart
  useEffect(() => {
    if (!isDataSynced) return;
    if (user) supabase.from('user_carts').upsert({ id: user.id, items: cart }).then();
    else localStorage.setItem('sakura_cart', JSON.stringify(cart));
  }, [cart, user, isDataSynced]);
 
  // Persist wishlist
  useEffect(() => {
    if (!isDataSynced) return;
    if (user) supabase.from('user_wishlists').upsert({ id: user.id, items: wishlist }).then();
    else localStorage.setItem('sakura_wishlist', JSON.stringify(wishlist));
  }, [wishlist, user, isDataSynced]);
 
  // Load fonts & icons
  useEffect(() => {
    const fonts = document.createElement('link'); fonts.rel = 'stylesheet'; fonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600;700&family=Shippori+Mincho:wght@400;600;700&family=DM+Mono:wght@400;500&family=Cinzel:wght@400;600&display=swap';
    const icons = document.createElement('link'); icons.rel = 'stylesheet'; icons.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.append(fonts, icons);
    return () => { fonts.remove(); icons.remove(); };
  }, []);
 
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const onScroll = () => setShowScrollTop(window.scrollY > 400); window.addEventListener('scroll', onScroll);
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [currentView, selectedProduct]);
 
  const prevSearch = useRef('');
  useEffect(() => {
    if (searchQuery.trim().length > 0 && prevSearch.current.length === 0 && currentView === 'store') {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    }
    prevSearch.current = searchQuery.trim();
  }, [searchQuery, currentView]);
 
  const triggerToast = (msg, isRemove = false) => {
    clearTimeout(toastTimerRef.current); setToast({ show: true, msg, isRemove });
    toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };
 
  const handleHamburgerClick = () => {
    if (user) {
      setProfileOpen(!profileOpen);
      setCartOpen(false);
      setWishlistOpen(false);
    } else {
      setCurrentView('auth');
      triggerToast('🌸 Please log in or sign up first.');
    }
  };
 
  const handleLogout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) { triggerToast('Error logging out', true); return; }
    }
    setUser(null);
    setProfileOpen(false);
    triggerToast('🌸 Securely signed out of locker.', true);
  };
 
  const handleAddToCart = (product, event, qtyToAdd = 1) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      return exists
        ? prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item)
        : [...prev, { ...product, qty: qtyToAdd }];
    });
    triggerToast(`🌸 ${qtyToAdd}x ${product.name} added`);
 
    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const id = Date.now() + Math.random();
      setFlyingItems(prev => [...prev, { id, startX: rect.left + rect.width / 2, startY: rect.top + rect.height / 2, color: product.icon, bg: product.bg, type: 'cart' }]);
      setTimeout(() => { setFlyingItems(prev => prev.filter(item => item.id !== id)); setAnimatingBadge(true); clearTimeout(badgeTimerRef.current); badgeTimerRef.current = setTimeout(() => setAnimatingBadge(false), 500); }, 800);
    }
  };
 
  const handleChangeQty = (id, delta) => setCart(prev => prev.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
 
  const handleToggleWishlist = (product, event) => {
    if (event) event.stopPropagation();
    setWishlist(prev => {
      if (prev.includes(product.id)) { triggerToast('Removed from wishlist', true); return prev.filter(id => id !== product.id); }
      triggerToast('🌸 Saved to wishlist');
      if (event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setFlyingItems(prevItems => [...prevItems, { id, startX: rect.left + rect.width / 2, startY: rect.top + rect.height / 2, color: '#e05050', bg: 'rgba(255,220,220,0.95)', type: 'wishlist' }]);
        setTimeout(() => { setFlyingItems(prevItems => prevItems.filter(item => item.id !== id)); setAnimatingWishlist(true); clearTimeout(wishlistBadgeTimerRef.current); wishlistBadgeTimerRef.current = setTimeout(() => setAnimatingWishlist(false), 500); }, 800);
      }
      return [...prev, product.id];
    });
  };
 
  const filteredProducts = useMemo(() => MOCK_PRODUCTS.filter(p => (currentFilter === 'all' || p.cat === currentFilter) && (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.player.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameJp.includes(searchQuery))), [currentFilter, searchQuery]);
 
  const cartMetrics = useMemo(() => {
    const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const delivery = subtotal >= 1000 || cart.length === 0 ? 0 : 99;
    return { totalQty: cart.reduce((acc, curr) => acc + curr.qty, 0), subtotal, delivery, total: subtotal + delivery };
  }, [cart]);
 
  const handleCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setCurrentView('auth');
      triggerToast('🌸 Please log in to complete your order.');
      return;
    }
    triggerToast(`🌸 Order of ₹${cartMetrics.total.toLocaleString()} confirmed for ${user.name}!`);
    setCart([]);
    setCartOpen(false);
  };
 
  return (
    <>
      <GlobalStyles />
      <FujiBackground />
      {currentView === 'store' && <SakuraBranches />}
      <SakuraPetalsCanvas />
      <ToastNotification toast={toast} />
 
      {currentView === 'auth' ? (
        <AuthView
          isRecoveryMode={isRecoveringPassword}
          onBack={() => {
            // Only allow "back" if not in a recovery session (user arrived via email link).
            // Once they're mid-recovery we keep them on the update-password page.
            if (!isRecoveringPassword) {
              setCurrentView('store');
            }
          }}
          onAuthSuccess={(userData) => {
            setUser(userData);
            setCurrentView('store');
            triggerToast(`🌸 Welcome, ${userData.name}! Locker ready.`);
          }}
          onPasswordUpdated={() => {
            // Recovery is fully done. Clean URL and go to store.
            setIsRecoveringPassword(false);
            // Remove the hash so the recovery tokens are gone from the URL
            window.history.replaceState(null, '', window.location.pathname);
            setCurrentView('store');
            triggerToast('🌸 Password updated! Please log in with your new password.');
          }}
        />
      ) : (
        <div className="store-view">
          {flyingItems.map(item => <FlyingItem key={item.id} item={item} />)}
          <div id="overlay" className={cartOpen || wishlistOpen || profileOpen ? 'show' : ''} onClick={() => { setCartOpen(false); setWishlistOpen(false); setProfileOpen(false); }} />
          <ScrollToTop isVisible={showScrollTop} />
 
          <Navigation searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartTotalQty={cartMetrics.totalQty} wishlistCount={wishlist.length} animatingBadge={animatingBadge} animatingWishlist={animatingWishlist} onToggleWishlist={() => { setWishlistOpen(!wishlistOpen); setCartOpen(false); setProfileOpen(false); }} onToggleCart={() => { setCartOpen(!cartOpen); setWishlistOpen(false); setProfileOpen(false); }} onHamburgerClick={handleHamburgerClick} onNavClick={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} user={user} />
 
          <HeroSection />
          <Marquee items={MARQUEE_MESSAGES} />
          <FeaturesGrid />
 
          <CollectionGrid
            products={filteredProducts}
            currentFilter={currentFilter}
            setFilter={setCurrentFilter}
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={setSelectedProduct}
          />
 
          <NewsletterSection triggerToast={triggerToast} />
          <Footer />
 
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              allProducts={MOCK_PRODUCTS}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
              onSelectProduct={setSelectedProduct}
            />
          )}
 
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} metrics={cartMetrics} onChangeQty={handleChangeQty} onRemove={(id, name) => { setCart(prev => prev.filter(item => item.id !== id)); triggerToast(`Removed: ${name}`, true); }} onClear={() => { setCart([]); triggerToast('Locker cleared', true); }} onCheckout={handleCheckout} />
          <WishlistDrawer isOpen={wishlistOpen} items={MOCK_PRODUCTS.filter(p => wishlist.includes(p.id))} onAddToCart={handleAddToCart} onToggle={handleToggleWishlist} />
          <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} user={user} onLogout={handleLogout} onToast={triggerToast} />
        </div>
      )}
    </>
  );
}
 
/* ─── Product Details Component ─────────────────────────────────────────────── */
const ProductModal = ({ product, allProducts, onClose, onAddToCart, onSelectProduct }) => {
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const scrollRef = useRef(null);
 
  useEffect(() => {
    setSize('M');
    setQty(1);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);
 
  const relatedProducts = useMemo(() => {
    let related = allProducts.filter(p => p.id !== product.id && p.cat === product.cat);
    if (related.length < 3) related = allProducts.filter(p => p.id !== product.id);
    return related.slice(0, 3);
  }, [product, allProducts]);
 
  return (
    <div className="product-modal">
      <button className="auth-back-btn" style={{ position: 'fixed', zIndex: 10 }} onClick={onClose}>
        <i className="fas fa-arrow-left"></i> Back to Store
      </button>
 
      <div className="modal-scroll-area" ref={scrollRef}>
        <div className="product-detail-grid">
          <div className="product-image-col">
            <div className="main-image-ph" style={{ background: product.bg }}>
              <i className="fas fa-tshirt bg-icon" style={{ color: product.icon }}></i>
              <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop" alt={product.name} className="real-image-ph" />
            </div>
          </div>
 
          <div className="product-info-col">
            <div className="p-cat">{product.cat.toUpperCase()} // {product.player}</div>
            <h1 className="p-title">{product.name}</h1>
            <h2 className="p-title-jp">{product.nameJp}</h2>
            <div className="p-price">₹{product.price.toLocaleString()}</div>
 
            <p className="p-desc">
              Step onto the pitch with the exclusive {product.name}. Crafted with moisture-wicking SakuraTech fabric, this premium jersey offers supreme breathability, a dynamic tailored fit, and unparalleled Japanese elegance.
            </p>
 
            <ul className="p-specs">
              <li><i className="fas fa-check"></i> 100% Recycled Polyester</li>
              <li><i className="fas fa-check"></i> Sweat-wicking Dri-FIT technology</li>
              <li><i className="fas fa-check"></i> Authentic Sakura 2025 detailing</li>
            </ul>
 
            <div className="p-options-row">
              <div className="p-sizes">
                <h4>Select Size</h4>
                <div className="size-row">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="p-qty">
                <h4>Quantity</h4>
                <div className="qty-selector">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><i className="fas fa-minus" style={{ fontSize: '10px' }}></i></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)}><i className="fas fa-plus" style={{ fontSize: '10px' }}></i></button>
                </div>
              </div>
            </div>
 
            <button
              className="checkout-btn p-add-btn"
              onClick={(e) => {
                const sizedProduct = { ...product, id: `${product.id}-${size}`, name: `${product.name} (${size})` };
                onAddToCart(sizedProduct, e, qty);
                onClose();
              }}
            >
              <i className="fas fa-shopping-bag"></i> Add to Locker — ₹{(product.price * qty).toLocaleString()}
            </button>
          </div>
        </div>
 
        <div className="related-section">
          <h3>You May Also Like</h3>
          <div className="related-grid">
            {relatedProducts.map(p => (
              <div key={p.id} className="related-card" onClick={() => onSelectProduct(p)}>
                <div className="related-img" style={{ background: p.bg }}><i className="fas fa-tshirt" style={{ color: p.icon }}></i></div>
                <div className="related-info">
                  <div className="related-player">{p.player}</div>
                  <div className="related-name">{p.name}</div>
                  <div className="related-price">₹{p.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div className="reviews-section">
          <h3>Player Reviews</h3>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="stars"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i></div>
              <h4>Perfect Fit and Feel</h4>
              <p>"The material is incredibly light and the design is just stunning. Best kit of the 2025 season by far."</p>
              <span className="reviewer">- Kenji T.</span>
            </div>
            <div className="review-card">
              <div className="stars"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i></div>
              <h4>Amazing subtle details</h4>
              <p>"I love the subtle patterns woven into the fabric. I bought a size M and it fits perfectly true to size."</p>
              <span className="reviewer">- Liam R.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
/* ─── Auth Component ─────────────────────────────────────────────────────────── */
/**
 * PASSWORD RESET FLOW — HOW IT WORKS:
 *
 * 1. User clicks "Forgot Password" → we call supabase.auth.resetPasswordForEmail()
 *    with redirectTo = window.location.origin.
 *
 * 2. Supabase emails a link like:
 *    https://your-site.com/#access_token=XXX&type=recovery&...
 *
 * 3. User clicks the link. The browser opens the app with that hash.
 *    We read the hash synchronously (IS_RECOVERY_LINK) and put the app
 *    into recovery mode BEFORE Supabase processes the session.
 *
 * 4. Supabase SDK fires onAuthStateChange with event='PASSWORD_RECOVERY'.
 *    We keep isRecoveringPassword = true and show the update_password form.
 *    The user is NOT shown as "logged in".
 *
 * 5. User enters a new password and submits.
 *    We call supabase.auth.updateUser({ password }) — this works because
 *    Supabase established a temporary recovery session behind the scenes.
 *    The password is saved in the database.
 *
 * 6. We immediately call supabase.auth.signOut() to kill the recovery
 *    session, strip the hash from the URL, and redirect to the store.
 *    The user must now log in with their new password.
 */
const AuthView = ({ onBack, onAuthSuccess, isRecoveryMode, onPasswordUpdated }) => {
  const [view, setView] = useState(isRecoveryMode ? 'update_password' : 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
 
  useEffect(() => {
    if (isRecoveryMode) setView('update_password');
  }, [isRecoveryMode]);
 
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
 
    try {
      if (view === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        if (error) throw error;
        onAuthSuccess({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          email: data.user.email
        });
 
      } else if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name } }
        });
        if (error) throw error;
        if (data?.session) {
          onAuthSuccess({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            email: data.user.email
          });
        } else {
          setMessage({ type: 'success', text: '🌸 Success! Please check your email to verify your account.' });
        }
 
      } else if (view === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + window.location.pathname // clean path, no hash
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '🌸 Reset link sent! Check your inbox — click the link to set a new password.' });
 
      } else if (view === 'update_password') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match. Please try again.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
 
        // ── THE KEY CALL: update the password via the active recovery session.
        // Supabase's SDK has already exchanged the recovery tokens from the URL
        // hash into a valid session. This call saves the new password to the DB.
        const { error } = await supabase.auth.updateUser({ password: formData.password });
        if (error) throw error;
 
        setMessage({ type: 'success', text: '🌸 Password updated! Signing you out safely...' });
 
        // ── Sign out the temporary recovery session immediately so the user
        //    cannot accidentally remain "logged in" through it.
        await supabase.auth.signOut();
 
        // ── After a brief moment for the user to read the message, clean up
        //    and send them back to the store (onPasswordUpdated handles URL cleanup).
        setTimeout(() => {
          if (onPasswordUpdated) onPasswordUpdated();
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    }
  };
 
  const switchView = (newView) => {
    setView(newView);
    setMessage({ type: '', text: '' });
  };
 
  // Decide heading / subtext based on current view
  const headingMap = {
    login: { title: 'Welcome Back', sub: 'Enter your details to access your locker.' },
    signup: { title: 'Join the Elite', sub: 'Create an account to secure your Sakura gear.' },
    reset: { title: 'Forgot Password?', sub: 'Enter your email and we\'ll send a recovery link.' },
    update_password: { title: 'Set New Password', sub: 'Choose a strong new password for your locker.' },
  };
  const { title, sub } = headingMap[view] || headingMap.login;
 
  return (
    <div className="auth-wrapper">
      {/* Hide the back button in recovery mode — user must complete the flow */}
      {!isRecoveryMode && (
        <button className="auth-back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back to Store
        </button>
      )}
 
      <div className="auth-card reveal visible">
        <div className="auth-header">
          <div className="logo-kanji">桜</div>
          <div className="auth-title-en">PITCHBUBBLE</div>
          <div className="auth-title-jp">桜エディション</div>
          <h2 className="auth-heading">{title}</h2>
          <p className="auth-sub">{sub}</p>
        </div>
 
        {message.text && (
          <div className={`auth-msg ${message.type}`}>
            <i className={`fas ${message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
            {message.text}
          </div>
        )}
 
        <form onSubmit={handleEmailSubmit} className="auth-form">
          {view === 'signup' && (
            <div className="input-group">
              <i className="far fa-user"></i>
              <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isLoading} />
            </div>
          )}
 
          {/* Email — shown for login, signup, and reset; hidden for update_password */}
          {view !== 'update_password' && (
            <div className="input-group">
              <i className="far fa-envelope"></i>
              <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required disabled={isLoading} />
            </div>
          )}
 
          {/* Password — hidden for the plain "send reset link" step */}
          {view !== 'reset' && (
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder={view === 'update_password' ? 'New Password (min 6 chars)' : 'Password'}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          )}
 
          {/* Confirm password — only on update_password */}
          {view === 'update_password' && (
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          )}
 
          {view === 'login' && (
            <div className="auth-forgot">
              <a href="#" onClick={(e) => { e.preventDefault(); switchView('reset'); }}>Forgot Password?</a>
            </div>
          )}
 
          <button type="submit" className="auth-submit-btn" disabled={isLoading || (view === 'update_password' && message.type === 'success')}>
            {isLoading
              ? <i className="fas fa-circle-notch fa-spin"></i>
              : view === 'login' ? 'Enter Locker'
              : view === 'signup' ? 'Create Account'
              : view === 'reset' ? 'Send Reset Link'
              : 'Update Password'}
          </button>
        </form>
 
        {/* Google OAuth — only for login / signup */}
        {(view === 'login' || view === 'signup') && (
          <>
            <div className="auth-divider"><span>or continue with</span></div>
            <button type="button" className="auth-google-btn" onClick={handleGoogleAuth} disabled={isLoading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </>
        )}
 
        <div className="auth-footer">
          {view === 'login' ? (
            <p>Don't have an account? <button type="button" className="auth-toggle-btn" onClick={() => switchView('signup')} disabled={isLoading}>Sign Up</button></p>
          ) : view === 'signup' ? (
            <p>Already have an account? <button type="button" className="auth-toggle-btn" onClick={() => switchView('login')} disabled={isLoading}>Log In</button></p>
          ) : view === 'reset' ? (
            <p>Remember your password? <button type="button" className="auth-toggle-btn" onClick={() => switchView('login')} disabled={isLoading}>Back to Log In</button></p>
          ) : null /* no footer toggle in update_password mode */ }
        </div>
      </div>
    </div>
  );
};
 
/* ─── Dynamic Components ─────────────────────────────────────────────────────── */
const FlyingItem = ({ item }) => {
  const [fly, setFly] = useState(false); const [endPos, setEndPos] = useState({ x: item.startX, y: item.startY });
  useEffect(() => {
    const targetBtn = document.getElementById(item.type === 'wishlist' ? 'main-wishlist-btn' : 'main-cart-btn');
    if (targetBtn) { const rect = targetBtn.getBoundingClientRect(); setEndPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }); }
    const frame = requestAnimationFrame(() => setFly(true)); return () => cancelAnimationFrame(frame);
  }, [item]);
  return <div className={`flying-item ${fly ? 'fly' : ''}`} style={{ left: fly ? endPos.x : item.startX, top: fly ? endPos.y : item.startY, background: item.bg }}><i className={`fas ${item.type === 'wishlist' ? 'fa-heart' : 'fa-tshirt'}`} style={{ color: item.color }}></i></div>;
};
 
const Navigation = ({ searchQuery, setSearchQuery, cartTotalQty, wishlistCount, animatingBadge, animatingWishlist, onToggleWishlist, onToggleCart, onHamburgerClick, onNavClick, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => { const handleScroll = () => setIsScrolled(window.scrollY > 40); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  return (
    <nav className={`nav-wrapper ${isScrolled ? 'scrolled' : 'bubble'}`}>
      <div className="nav-inner">
        <a className="logo" onClick={() => onNavClick('top')}><div className="logo-kanji">桜</div><div className="logo-text-wrap"><div className="logo-en">PITCHBUBBLE</div><div className="logo-jp">桜エディション</div></div></a>
        <ul className="nav-links"><li><a href="#collection" onClick={(e) => { e.preventDefault(); onNavClick('collection'); }}>Collection</a></li><li><a href="#features" onClick={(e) => { e.preventDefault(); onNavClick('features'); }}>Features</a></li><li><a href="#newsletter" onClick={(e) => { e.preventDefault(); onNavClick('newsletter'); }}>About</a></li></ul>
        <div className="nav-right">
          <div className="search-bar"><i className="fas fa-search"></i><input type="text" placeholder="Search gear..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <button className="nav-btn" title="Menu" onClick={onHamburgerClick}>
            <i className="fas fa-bars" style={{ color: user ? 'var(--sakura-deep)' : 'var(--muted)' }}></i>
          </button>
          <button id="main-wishlist-btn" className={`nav-btn ${animatingWishlist ? 'bump' : ''}`} onClick={onToggleWishlist} title="Wishlist"><i className="fas fa-heart"></i><span className={`cart-badge ${wishlistCount > 0 ? 'show' : ''}`} style={{ background: '#e05050' }}>{wishlistCount}</span></button>
          <button id="main-cart-btn" className={`nav-btn ${animatingBadge ? 'bump' : ''}`} onClick={onToggleCart} title="Cart"><i className="fas fa-shopping-bag"></i><span className={`cart-badge ${cartTotalQty > 0 ? 'show' : ''}`}>{cartTotalQty}</span></button>
        </div>
      </div>
    </nav>
  );
};
 
const HeroSection = () => (
  <div className="hero" id="top"><div className="hero-left"><div className="hero-kana"><span className="kana-line"></span>桜コレクション 2025<span className="kana-line" style={{ transform: 'scaleX(-1)' }}></span></div><h1 className="hero-title">MADE FOR<br />THE <span className="jp-char">桜</span><br />PITCH.</h1><p className="hero-sub">さくら エディション</p><p className="hero-desc">The Sakura Edition — where Japanese elegance meets elite football performance. Each piece is crafted for those who play with grace and power.</p><div className="hero-actions"><button className="btn-primary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}><i className="fas fa-cherry-blossom" style={{ fontSize: '12px' }}>🌸</i> Browse Collection</button><button className="btn-ghost"><i className="fas fa-play" style={{ fontSize: '11px' }}></i> Our Story</button></div></div><div className="hero-right"><div className="hero-orb"><div className="orb-ring"></div><div className="orb-ring"></div><div className="orb-ring"></div><div className="orb-center"><i className="fas fa-tshirt"></i><span className="orb-label">さくら</span></div><div className="stat-chip"><div className="stat-val">12.4K</div><div className="stat-lbl">Active Players</div></div><div className="stat-chip"><div className="stat-val">100%</div><div className="stat-lbl">Authentic</div></div></div></div></div>
);
 
const Marquee = ({ items }) => (
  <div className="marquee-strip"><div className="marquee-track">{[...items, ...items].map((item, idx) => <span key={idx} className="marquee-item"><span className="marquee-sep">🌸</span>{item}</span>)}</div></div>
);
 
const FeaturesGrid = () => (
  <div className="features-section reveal" id="features"><div className="features-grid">
    {[{ icon: 'fa-shipping-fast', title: 'Express Delivery', desc: 'Ships within 24 hours across India. Tracked and fully insured.' }, { icon: 'fa-undo-alt', title: '30-Day Returns', desc: 'No questions asked. Easy returns on all items in original condition.' }, { icon: 'fa-certificate', title: 'Authenticity Seal', desc: 'Every piece verified with a unique sakura authentication stamp.' }, { icon: 'fa-paint-brush', title: 'Custom Printing', desc: 'Add your name and number. Personalize your Sakura kit.' }].map((f, i) => (
      <div key={i} className="feature-card"><div className="feature-icon"><i className={`fas ${f.icon}`}></i></div><div className="feature-title">{f.title}</div><div className="feature-desc">{f.desc}</div></div>
    ))}
  </div></div>
);
 
const CollectionGrid = ({ products, currentFilter, setFilter, cart, wishlist, onAddToCart, onToggleWishlist, onSelectProduct }) => (
  <div className="section reveal" id="collection">
    <div className="section-eyebrow">// 2025 Season Drop</div><div className="section-title">Full Collection</div><div className="section-title-jp">全コレクション — 桜エディション</div>
    <div className="filter-row">
      {[{ id: 'all', label: 'All Gear' }, { id: 'legend', label: 'Pro Legends' }, { id: 'elite', label: 'Elite Series' }, { id: 'sakura', label: 'Sakura Special' }].map(tab => (
        <button key={tab.id} className={`filter-tab ${currentFilter === tab.id ? 'active' : ''}`} onClick={() => setFilter(tab.id)}>{tab.label}</button>
      ))}
    </div>
    <div className="product-grid">
      {products.map((p, i) => {
        const inCart = cart.some(c => c.id.toString().startsWith(p.id.toString()));
        const inWish = wishlist.includes(p.id);
        return (
          <div key={p.id} className="product-card" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => onSelectProduct(p)}>
            <div className="product-img" style={{ background: p.bg }}>
              {p.isNew && <span className="badge-new">New</span>}<span className="product-badge">{p.player}</span><i className="fas fa-tshirt" style={{ color: p.icon }}></i>
              <button className={`wishlist-btn ${inWish ? 'loved' : ''}`} onClick={(e) => onToggleWishlist(p, e)}><i className={`fa${inWish ? 's' : 'r'} fa-heart`}></i></button>
            </div>
            <div className="product-info">
              <div className="product-player">{p.player}</div><div className="product-name">{p.name}</div><div className="product-name-jp">{p.nameJp}</div>
              <div className="product-bottom">
                <div className="product-price"><span className="currency">₹</span>{p.price.toLocaleString()}</div>
                <button className={`add-btn ${inCart ? 'added' : ''}`} onClick={(e) => { e.stopPropagation(); onAddToCart({ ...p, id: `${p.id}-M`, name: `${p.name} (M)` }, e); }}><i className={`fas ${inCart ? 'fa-check' : 'fa-plus'}`}></i></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
 
const NewsletterSection = ({ triggerToast }) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubscribe = async () => {
    if (!email) { triggerToast('Please enter an email address.', true); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') triggerToast('🌸 You are already in the Sakura circle!');
        else throw error;
      } else {
        setSuccess(true); setEmail(''); triggerToast('🌸 Welcome to the Sakura circle!');
      }
    } catch (err) {
      triggerToast('Error joining. Try again later.', true);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="section reveal" id="newsletter" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid var(--border)', margin: '0 52px 80px', maxWidth: 'unset', padding: '60px 52px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div className="section-eyebrow" style={{ textAlign: 'center' }}>// 桜 Newsletter</div>
        <div className="section-title" style={{ fontSize: '36px', marginBottom: '6px' }}>Stay in the Game</div>
        <p style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '32px' }}>Get early access to new drops, exclusive Sakura editions, and player collabs delivered to your inbox.</p>
        <div className="news-input-row" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <input className="news-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
          <button className="news-btn" onClick={handleSubscribe} disabled={isLoading}>{isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}</button>
        </div>
        {success && <p className="news-success" style={{ display: 'block' }}>🌸 You're on the list for the next drop!</p>}
      </div>
    </div>
  );
};
 
const Footer = () => (
  <footer>
    <div className="footer-grid">
      <div><div className="footer-logo">PITCHBUBBLE 桜</div><p className="footer-tagline">The future of football culture, rooted in Japanese elegance. Join the global elite movement.</p><div className="social-row">{['instagram', 'twitter', 'tiktok', 'youtube'].map(s => <a key={s} className="social-btn"><i className={`fab fa-${s}`}></i></a>)}</div></div>
      <div className="foot-col"><h5>Shop</h5><ul>{['All Products', 'Pro Legends', 'Sakura Special', 'Elite Series'].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
      <div className="foot-col"><h5>Support</h5><ul>{['Help Center', 'Track Order', 'Returns', 'Sizing Guide'].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
      <div className="foot-col"><h5>Quick Sync</h5><p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px', fontWeight: 300 }}>Subscribe for early access drops.</p><div className="news-input-row"><input className="news-input" type="email" placeholder="your@email.com" /><button className="news-btn"><i className="fas fa-arrow-right"></i></button></div></div>
    </div>
    <div className="footer-bottom"><span className="footer-copy">© 2025 PitchBubble Sakura Edition. All rights reserved.</span><div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div></div>
  </footer>
);
 
const CartDrawer = ({ isOpen, onClose, cart, metrics, onChangeQty, onRemove, onClear, onCheckout }) => (
  <div id="cart-sidebar" className={isOpen ? 'open' : ''}>
    <div className="cart-header"><div className="cart-title-wrap"><div className="cart-title">Your Locker</div><div className="cart-title-jp">カート — 桜</div></div><button className="cart-close-btn" onClick={onClose}><i className="fas fa-times"></i></button></div>
    <div className="cart-body">
      {cart.length === 0 ? <div className="cart-empty"><i className="fas fa-shopping-bag"></i><p>Your locker is empty.<br />Add some Sakura gear.</p></div> : cart.map(item => (
        <div key={item.id} className="cart-item"><div className="cart-thumb" style={{ background: item.bg }}><i className="fas fa-tshirt" style={{ color: item.icon }}></i></div><div className="cart-item-info"><div className="cart-item-name">{item.name}</div><div className="cart-item-player">{item.player}</div><div className="cart-item-price">₹{(item.price * item.qty).toLocaleString()}</div></div><div className="cart-qty"><button className="qty-btn" onClick={() => onChangeQty(item.id, -1)}><i className="fas fa-minus" style={{ fontSize: '10px' }}></i></button><span className="qty-num">{item.qty}</span><button className="qty-btn" onClick={() => onChangeQty(item.id, 1)}><i className="fas fa-plus" style={{ fontSize: '10px' }}></i></button><button className="remove-btn" onClick={() => onRemove(item.id, item.name)} title="Remove Item"><i className="fas fa-trash"></i></button></div></div>
      ))}
    </div>
    <div className="cart-footer"><div className="cart-summary"><div className="summary-row"><span>Subtotal</span><span>₹{metrics.subtotal.toLocaleString()}</span></div><div className="summary-row"><span>Delivery</span><span>{metrics.delivery === 0 ? 'Free 🌸' : `₹${metrics.delivery}`}</span></div><div className="summary-row total"><span>Total</span><span>₹{metrics.total.toLocaleString()}</span></div></div><button className="checkout-btn" onClick={onCheckout} disabled={cart.length === 0}>🌸 Authorize Transaction</button><button className="clear-btn" onClick={onClear}>Clear Locker</button></div>
  </div>
);
 
const WishlistDrawer = ({ isOpen, items, onAddToCart, onToggle }) => (
  <div id="wishlist-drawer" className={isOpen ? 'open' : ''}><div className="drawer-title">Wishlist 🌸</div><div className="drawer-sub">お気に入り — saved items</div><div>
    {items.length === 0 ? <div className="wish-empty">No saved items yet.<br />Tap ♡ on any product to save.</div> : items.map(p => (
      <div key={p.id} className="wish-item"><div className="wish-thumb" style={{ background: p.bg }}><i className="fas fa-tshirt" style={{ color: p.icon, fontSize: '16px' }}></i></div><div className="wish-info"><div className="wish-name">{p.name}</div><div className="wish-price">₹{p.price.toLocaleString()}</div></div><div className="wish-actions"><button className="wish-add" onClick={(e) => { onAddToCart({ ...p, id: `${p.id}-M`, name: `${p.name} (M)` }, e); onToggle(p, null); }}>Add</button><button className="remove-btn" onClick={() => onToggle(p, null)} title="Remove from Wishlist"><i className="fas fa-trash"></i></button></div></div>
    ))}
  </div></div>
);
 
const ProfileDrawer = ({ isOpen, onClose, user, onLogout, onToast }) => {
  const [view, setView] = useState('main');
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);
 
  useEffect(() => { if (!isOpen) setTimeout(() => setView('main'), 400); }, [isOpen]);
 
  useEffect(() => {
    if (user && isOpen) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile({ name: data.full_name || '', phone: data.phone_number || '', address: data.delivery_address || '' });
        else setProfile(prev => ({ ...prev, name: user.name || '' }));
      };
      fetchProfile();
    }
  }, [user, isOpen]);
 
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: profile.name, phone_number: profile.phone, delivery_address: profile.address, updated_at: new Date() });
    setIsSaving(false);
    if (error) onToast('Error saving profile.', true);
    else { onToast('🌸 Profile updated successfully!'); setView('main'); }
  };
 
  return (
    <div id="profile-drawer" className={isOpen ? 'open' : ''}>
      <div className="cart-header" style={{ gap: '12px' }}>
        {view !== 'main' && <button className="cart-close-btn" onClick={() => setView('main')}><i className="fas fa-arrow-left"></i></button>}
        <div className="cart-title-wrap" style={{ flex: 1 }}>
          <div className="cart-title">{view === 'main' ? 'Your Profile' : view === 'orders' ? 'Track Orders' : view === 'settings' ? 'Settings' : 'Support'}</div>
          <div className="cart-title-jp">{view === 'main' ? 'プロフィール' : view === 'orders' ? '注文履歴' : view === 'settings' ? 'アカウント設定' : 'サポート'}</div>
        </div>
        <button className="cart-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
      </div>
 
      <div className="cart-body" style={{ padding: view === 'main' ? '0' : '20px 28px' }}>
        {view === 'main' && (
          <>
            <div style={{ padding: '32px 28px', borderBottom: '1px solid var(--border)', textAlign: 'center', background: 'white' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sakura), var(--sakura-deep))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px', fontFamily: 'Cinzel', boxShadow: '0 8px 24px var(--sakura-glow)' }}>
                {(user?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontFamily: 'Shippori Mincho', fontSize: '20px', color: 'var(--ink)', marginBottom: '4px' }}>{user?.name || 'Elite Player'}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono' }}>{user?.email}</p>
            </div>
            <div className="profile-menu">
              <div className="profile-menu-item" onClick={() => setView('orders')}><i className="fas fa-box"></i> <span>Track Orders</span><i className="fas fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--muted-light)', fontSize: '10px' }}></i></div>
              <div className="profile-menu-item" onClick={() => setView('settings')}><i className="fas fa-user-cog"></i> <span>Account Settings</span><i className="fas fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--muted-light)', fontSize: '10px' }}></i></div>
              <div className="profile-menu-item" onClick={() => setView('support')}><i className="fas fa-headset"></i> <span>Support & FAQ</span><i className="fas fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--muted-light)', fontSize: '10px' }}></i></div>
            </div>
          </>
        )}
        {view === 'orders' && <div className="cart-empty"><i className="fas fa-box-open"></i><p>No past orders found.</p></div>}
        {view === 'settings' && (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group"><i className="far fa-user"></i><input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Full Name" required /></div>
            <div className="input-group"><i className="fas fa-phone"></i><input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone Number" required /></div>
            <div className="input-group" style={{ marginBottom: '8px' }}><i className="fas fa-map-marker-alt"></i><input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Delivery Address" required /></div>
            <button type="submit" className="checkout-btn" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        )}
        {view === 'support' && (
          <div>
            <h4 style={{ fontSize: '15px', fontFamily: 'Shippori Mincho', color: 'var(--ink)', marginBottom: '16px' }}>Frequently Asked Questions</h4>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--ink-mid)' }}>How long does shipping take?</strong>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>Express delivery takes 1-2 business days across major cities in India.</p>
            </div>
            <button className="checkout-btn" style={{ width: '100%', background: 'white', color: 'var(--ink)', border: '1px solid var(--border-strong)', boxShadow: 'none' }}><i className="fas fa-envelope"></i> Contact Support</button>
          </div>
        )}
      </div>
 
      {view === 'main' && (
        <div className="cart-footer" style={{ marginTop: 'auto', padding: '24px 28px', background: 'white' }}>
          <button className="checkout-btn" onClick={onLogout} style={{ background: 'linear-gradient(135deg, #ff6b6b, #e05050)', boxShadow: '0 8px 24px rgba(224, 80, 80, 0.3)' }}>
            <i className="fas fa-sign-out-alt"></i> Secure Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
 
const ToastNotification = ({ toast }) => <div id="toast" className={`${toast.show ? 'show' : ''} ${toast.isRemove ? 'remove-toast' : ''}`}><i className={`fas ${toast.isRemove ? 'fa-minus-circle' : 'fa-check-circle'} toast-icon`}></i><span>{toast.msg}</span></div>;
const ScrollToTop = ({ isVisible }) => <button id="scroll-top" className={isVisible ? 'visible' : ''} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><i className="fas fa-chevron-up"></i></button>;
 
/* ─── Global Styles ──────────────────────────────────────────────────────────── */
const GlobalStyles = React.memo(() => (
  <style dangerouslySetInnerHTML={{
    __html: `
    :root{--sakura:#f2a7c3;--sakura-deep:#e07fa0;--sakura-pale:#fde8f0;--sakura-glow:rgba(242,167,195,0.25);--ink:#1a0a0f;--ink-mid:#2d1520;--ink-soft:#4a2535;--paper:#fdf6f8;--paper-warm:#faf0f4;--washi:rgba(253,232,240,0.6);--gold:#c9a96e;--gold-pale:rgba(201,169,110,0.15);--muted:#9a7585;--muted-light:#c4a8b5;--border:rgba(242,167,195,0.2);--border-strong:rgba(242,167,195,0.45);--shadow:0 8px 40px rgba(26,10,15,0.12);--shadow-hover:0 20px 60px rgba(26,10,15,0.18);}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:var(--paper);color:var(--ink);font-family:'Noto Serif JP',serif;overflow-x:hidden;min-height:100vh;cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='4' fill='%23f2a7c3' opacity='0.8'/%3E%3C/svg%3E") 10 10,auto;}
    #petal-canvas{position:fixed;inset:0;pointer-events:none;z-index:0;}.blossom-frame{position:fixed;inset:0;z-index:-1;pointer-events:none;}.frame-branch{position:absolute;top:-40px;width:28vw;max-width:450px;min-width:250px;height:auto;opacity:0.6;filter:drop-shadow(0 10px 20px rgba(45,21,32,0.15));}.left-branch{left:-4%;transform-origin:top left;}.right-branch{right:-4%;transform:scaleX(-1);transform-origin:top right;}
    .bg-layer{position:fixed;inset:0;z-index:-2;background:radial-gradient(ellipse 80% 50% at 20% -10%,rgba(242,167,195,0.2) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 110%,rgba(242,167,195,0.15) 0%,transparent 60%),linear-gradient(180deg,rgba(160,190,225,0.2) 0%,rgba(253,246,248,0) 45%),linear-gradient(160deg,#fdf6f8 0%,#faf0f4 50%,#fdf6f8 100%);}.fuji-bg{position:absolute;bottom:0;left:0;right:0;height:65vh;z-index:1;opacity:0.95;}.bg-layer::after{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(242,167,195,0.06) 39px,rgba(242,167,195,0.06) 40px);z-index:2;}.wrap{max-width:1440px;margin:0 auto;padding:0 52px;}
    nav.nav-wrapper{position:sticky;z-index:600;transition:all 0.5s cubic-bezier(0.23,1,0.32,1);margin:0 auto;display:flex;justify-content:center;}nav.nav-wrapper.bubble{top:24px;width:85%;max-width:1200px;border-radius:40px;background:rgba(255,255,255,0.85);backdrop-filter:blur(24px);border:1px solid rgba(242,167,195,0.4);box-shadow:0 12px 40px rgba(26,10,15,0.08);}nav.nav-wrapper.scrolled{top:0;width:100%;max-width:100%;border-radius:0;background:rgba(253,246,248,0.95);backdrop-filter:blur(20px);border:none;border-bottom:1px solid var(--border);box-shadow:0 4px 20px rgba(26,10,15,0.05);}.nav-inner{width:100%;height:68px;display:flex;align-items:center;justify-content:space-between;transition:all 0.5s cubic-bezier(0.23,1,0.32,1);}nav.nav-wrapper.bubble .nav-inner{padding:0 32px;}nav.nav-wrapper.scrolled .nav-inner{padding:0 52px;max-width:1440px;}
    .logo{display:flex;align-items:center;gap:14px;cursor:pointer;text-decoration:none;color:inherit;}.logo-kanji{width:42px;height:42px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:white;box-shadow:0 4px 16px var(--sakura-glow);font-family:'Noto Serif JP',serif;font-weight:700;}.logo-text-wrap{line-height:1;}.logo-en{font-family:'Cinzel',serif;font-size:15px;font-weight:600;letter-spacing:0.15em;color:var(--ink);}.logo-jp{font-size:10px;color:var(--muted);letter-spacing:0.2em;margin-top:2px;}.nav-links{display:flex;gap:36px;list-style:none;}.nav-links a{font-size:12px;font-weight:400;letter-spacing:0.12em;color:var(--muted);text-decoration:none;transition:color 0.25s;position:relative;padding-bottom:2px;}.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:var(--sakura-deep);transition:width 0.3s ease;}.nav-links a:hover{color:var(--ink);}.nav-links a:hover::after{width:100%;}.nav-right{display:flex;gap:10px;align-items:center;}
    @keyframes badge-bounce{0%{transform:scale(1);}40%{transform:scale(1.25) translateY(-4px);color:var(--sakura-deep);border-color:var(--sakura-deep);}100%{transform:scale(1);}}
    .nav-btn{width:40px;height:40px;border-radius:10px;background:transparent;border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all 0.25s;position:relative;}.nav-btn:hover{background:var(--sakura-pale);border-color:var(--border-strong);color:var(--sakura-deep);}.nav-btn.bump{animation:badge-bounce 0.5s cubic-bezier(0.2,0.8,0.2,1);background:var(--sakura-pale);}.cart-badge{position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:var(--sakura-deep);color:white;border-radius:50%;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;transform:scale(0);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}.cart-badge.show{transform:scale(1);}.nav-btn.bump .cart-badge{transform:scale(1.3);}
    .flying-item{position:fixed;z-index:9999;width:70px;height:70px;border-radius:16px;display:flex;align-items:center;justify-content:center;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,0.25);transform:translate(-50%,-50%) scale(1);opacity:1;}.flying-item i{font-size:32px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.2));}.flying-item.fly{transition:top 0.8s cubic-bezier(0.5,0,1,0.5),left 0.8s cubic-bezier(0,0.5,0.5,1),transform 0.8s cubic-bezier(0.5,0,1,1),opacity 0.6s ease-in 0.2s;transform:translate(-50%,-50%) scale(0.1) rotate(360deg);opacity:0.1;}
    .hero{min-height:calc(100vh - 68px);display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;padding:80px 52px;max-width:1440px;margin:0 auto;}.hero-left{padding-right:60px;}.hero-kana{display:inline-flex;align-items:center;gap:10px;font-size:11px;letter-spacing:0.35em;color:var(--sakura-deep);margin-bottom:28px;font-family:'DM Mono',monospace;text-transform:uppercase;}.kana-line{width:32px;height:1px;background:linear-gradient(90deg,var(--sakura-deep),transparent);}.hero-title{font-family:'Shippori Mincho',serif;font-size:clamp(56px,5.5vw,96px);font-weight:700;line-height:0.92;color:var(--ink);margin-bottom:8px;letter-spacing:-1px;}.hero-title .jp-char{color:var(--sakura-deep);font-size:0.85em;}.hero-sub{font-family:'Shippori Mincho',serif;font-size:14px;letter-spacing:0.3em;color:var(--muted);margin-bottom:36px;}.hero-desc{font-size:15px;line-height:1.8;color:var(--ink-soft);max-width:420px;margin-bottom:52px;font-weight:600;}.hero-actions{display:flex;gap:14px;align-items:center;}.btn-primary{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));color:white;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;border:none;border-radius:12px;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px var(--sakura-glow);font-family:'Noto Serif JP',serif;}.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(242,167,195,0.45);}.btn-primary:active{transform:translateY(0);}.btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;background:rgba(255,255,255,0.5);backdrop-filter:blur(5px);color:var(--ink-mid);font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border:1px solid var(--border-strong);border-radius:12px;cursor:pointer;transition:all 0.25s;font-family:'Noto Serif JP',serif;}.btn-ghost:hover{border-color:var(--sakura-deep);color:var(--sakura-deep);background:white;}.hero-right{position:relative;display:flex;align-items:center;justify-content:center;}.hero-orb{position:relative;width:460px;height:460px;}.orb-ring{position:absolute;border-radius:50%;border:1px solid rgba(242,167,195,0.3);top:50%;left:50%;transform:translate(-50%,-50%);animation:orb-spin linear infinite;}.orb-ring:nth-child(1){width:100%;height:100%;animation-duration:40s;border-style:dashed;}.orb-ring:nth-child(2){width:75%;height:75%;animation-duration:25s;animation-direction:reverse;border-color:rgba(242,167,195,0.4);}.orb-ring:nth-child(3){width:50%;height:50%;animation-duration:18s;border-color:rgba(201,169,110,0.3);}@keyframes orb-spin{to{transform:translate(-50%,-50%) rotate(360deg);}}.orb-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;background:linear-gradient(135deg,rgba(253,246,248,0.7),rgba(255,255,255,0.95));border:1px solid rgba(255,255,255,0.6);border-radius:28px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;box-shadow:0 20px 60px rgba(242,167,195,0.25),inset 0 1px 0 rgba(255,255,255,0.8);backdrop-filter:blur(12px);animation:orb-float 5s ease-in-out infinite;}@keyframes orb-float{0%,100%{transform:translate(-50%,-50%) translateY(0);}50%{transform:translate(-50%,-50%) translateY(-12px);}}.orb-center i{font-size:52px;color:var(--sakura-deep);opacity:0.8;}.orb-center .orb-label{font-size:9px;letter-spacing:0.3em;color:var(--ink-mid);text-transform:uppercase;font-family:'DM Mono',monospace;font-weight:600;}.stat-chip{position:absolute;background:rgba(253,246,248,0.92);border:1px solid var(--border);border-radius:14px;padding:12px 18px;backdrop-filter:blur(10px);box-shadow:var(--shadow);animation:orb-float linear infinite;}.stat-chip:nth-child(5){top:10%;left:0;animation-duration:6s;animation-delay:-2s;}.stat-chip:nth-child(6){bottom:15%;right:0;animation-duration:7s;animation-delay:-1s;}.stat-val{font-family:'DM Mono';font-size:20px;font-weight:700;color:var(--sakura-deep);}.stat-lbl{font-size:9px;letter-spacing:0.15em;color:var(--ink-mid);text-transform:uppercase;margin-top:2px;}
    .marquee-strip{border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 0;overflow:hidden;background:linear-gradient(90deg,var(--sakura-pale),rgba(253,246,248,0.3),var(--sakura-pale));}.marquee-track{display:flex;width:max-content;animation:marquee-scroll 28s linear infinite;}@keyframes marquee-scroll{to{transform:translateX(-50%);}}.marquee-item{display:flex;align-items:center;gap:16px;padding:0 28px;font-size:11px;letter-spacing:0.25em;color:var(--muted);text-transform:uppercase;font-family:'DM Mono',monospace;white-space:nowrap;}.marquee-sep{color:var(--sakura);font-size:14px;}
    .section{padding:80px 52px;max-width:1440px;margin:0 auto;position:relative;z-index:10;}.section-eyebrow{font-size:10px;letter-spacing:0.4em;color:var(--sakura-deep);font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:12px;}.section-title{font-family:'Shippori Mincho',serif;font-size:44px;font-weight:700;color:var(--ink);margin-bottom:6px;}.section-title-jp{font-size:14px;letter-spacing:0.35em;color:var(--muted);margin-bottom:40px;}.filter-row{display:flex;gap:8px;margin-bottom:40px;border-bottom:1px solid var(--border);padding-bottom:0;}.filter-tab{padding:10px 22px;background:none;border:none;font-size:12px;letter-spacing:0.1em;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.25s;font-family:'Noto Serif JP',serif;}.filter-tab.active{color:var(--sakura-deep);border-bottom-color:var(--sakura-deep);}.filter-tab:hover{color:var(--ink);}.product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}@media (max-width:1100px){.product-grid{grid-template-columns:repeat(3,1fr);}}@media (max-width:768px){.product-grid{grid-template-columns:repeat(2,1fr);}}.product-card{background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:transform 0.35s cubic-bezier(0.23,1,0.32,1),box-shadow 0.35s;cursor:pointer;animation:card-in 0.5s ease both;}@keyframes card-in{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}.product-card:hover{transform:translateY(-8px);box-shadow:var(--shadow-hover),0 0 0 1px var(--border-strong);background:rgba(255,255,255,0.95);}.product-img{aspect-ratio:4/4.2;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}.product-img i{font-size:72px;filter:drop-shadow(0 10px 20px rgba(0,0,0,0.15));transition:transform 0.4s cubic-bezier(0.23,1,0.32,1);z-index:1;position:relative;}.product-card:hover .product-img i{transform:scale(1.12) translateY(-4px);}.product-img::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.15) 50%,transparent 70%);transform:translateX(-100%);transition:transform 0.6s ease;}.product-card:hover .product-img::before{transform:translateX(100%);}.product-badge{position:absolute;top:14px;right:14px;padding:4px 10px;border-radius:100px;font-size:9px;font-weight:600;letter-spacing:0.15em;background:rgba(255,255,255,0.75);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.5);color:var(--ink-soft);font-family:'DM Mono',monospace;}.badge-new{position:absolute;top:14px;left:14px;padding:4px 10px;border-radius:100px;font-size:9px;font-weight:600;letter-spacing:0.15em;background:var(--sakura-deep);color:white;font-family:'DM Mono',monospace;}.product-info{padding:18px 18px 20px;}.product-player{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--sakura-deep);font-family:'DM Mono',monospace;margin-bottom:5px;}.product-name{font-family:'Shippori Mincho',serif;font-size:15px;font-weight:600;color:var(--ink);margin-bottom:4px;}.product-name-jp{font-size:10px;color:var(--muted-light);letter-spacing:0.15em;margin-bottom:14px;}.product-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--border);}.product-price{font-family:'DM Mono',monospace;font-size:20px;font-weight:700;color:var(--ink);}.product-price .currency{font-size:12px;color:var(--muted);margin-right:2px;}.add-btn{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));color:white;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.25s;box-shadow:0 4px 12px var(--sakura-glow);}.add-btn:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(242,167,195,0.5);}.add-btn:active{transform:scale(0.93);}.add-btn.added{background:linear-gradient(135deg,#a8d8a8,#6ab56a);box-shadow:0 4px 12px rgba(106,181,106,0.3);}.wishlist-btn{position:absolute;bottom:14px;right:14px;width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.5);color:var(--muted-light);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all 0.25s;z-index:2;}.wishlist-btn.loved{color:#e05050;background:rgba(255,220,220,0.85);}.wishlist-btn:hover{transform:scale(1.1);}
    .features-section{padding:60px 52px;max-width:1440px;margin:0 auto;position:relative;z-index:10;}.features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow);}.feature-card{padding:36px 28px;border-right:1px solid var(--border);background:rgba(255,255,255,0.85);backdrop-filter:blur(10px);transition:background 0.25s;}.feature-card:last-child{border-right:none;}.feature-card:hover{background:rgba(253,232,240,0.9);}.feature-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--sakura-pale),white);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--sakura-deep);font-size:16px;margin-bottom:18px;}.feature-title{font-family:'Shippori Mincho',serif;font-size:14px;font-weight:600;color:var(--ink);margin-bottom:8px;}.feature-desc{font-size:12px;color:var(--muted);line-height:1.7;font-weight:300;}
    #cart-sidebar{position:fixed;top:0;right:0;height:100vh;width:min(480px,100vw);background:var(--paper-warm);border-left:1px solid var(--border);z-index:600;display:flex;flex-direction:column;transform:translateX(110%);transition:transform 0.55s cubic-bezier(0.23,1,0.32,1);box-shadow:-20px 0 60px rgba(26,10,15,0.12);}#cart-sidebar.open{transform:translateX(0);}.cart-header{padding:28px 28px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:white;}.cart-title{font-family:'Shippori Mincho',serif;font-size:22px;font-weight:700;color:var(--ink);}.cart-title-jp{font-size:10px;letter-spacing:0.25em;color:var(--muted);margin-top:2px;}.cart-close-btn{width:36px;height:36px;border-radius:10px;background:var(--paper);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}.cart-close-btn:hover{border-color:var(--border-strong);color:var(--ink);background:var(--sakura-pale);}.cart-body{flex:1;overflow-y:auto;padding:20px 28px;}.cart-body::-webkit-scrollbar{width:3px;}.cart-body::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:2px;}.cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;color:var(--muted-light);padding:60px 20px;text-align:center;}.cart-empty i{font-size:40px;opacity:0.3;}.cart-empty p{font-size:14px;font-weight:300;}.cart-item{display:flex;gap:14px;align-items:center;padding:14px;border-radius:14px;border:1px solid var(--border);background:white;margin-bottom:10px;transition:all 0.3s;animation:item-in 0.35s cubic-bezier(0.23,1,0.32,1) both;}@keyframes item-in{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}.cart-thumb{width:54px;height:60px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.cart-thumb i{font-size:24px;}.cart-item-info{flex:1;}.cart-item-name{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:2px;}.cart-item-player{font-size:10px;color:var(--sakura-deep);letter-spacing:0.15em;font-family:'DM Mono';margin-bottom:6px;}.cart-item-price{font-size:15px;font-weight:700;color:var(--ink);font-family:'DM Mono';}.cart-qty{display:flex;align-items:center;gap:8px;}.qty-btn{width:26px;height:26px;border-radius:7px;background:var(--paper);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}.qty-btn:hover{border-color:var(--border-strong);color:var(--sakura-deep);}.qty-num{font-family:'DM Mono';font-size:14px;font-weight:700;color:var(--ink);min-width:18px;text-align:center;}.remove-btn{background:none;border:none;color:var(--muted-light);cursor:pointer;font-size:13px;padding:6px;border-radius:6px;transition:all 0.2s;margin-left:4px;}.remove-btn:hover{color:#e05050;background:rgba(224,80,80,0.1);}.cart-footer{padding:20px 28px 28px;border-top:1px solid var(--border);background:white;}.cart-summary{margin-bottom:16px;}.summary-row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:8px;}.summary-row.total{font-size:18px;font-weight:700;color:var(--ink);font-family:'Shippori Mincho',serif;padding-top:10px;border-top:1px solid var(--border);margin-top:10px;}.summary-row.total span:last-child{font-family:'DM Mono';color:var(--sakura-deep);}.checkout-btn{width:100%;padding:15px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));color:white;font-size:12px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;border:none;border-radius:12px;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px var(--sakura-glow);font-family:'Noto Serif JP',serif;}.checkout-btn:hover{box-shadow:0 8px 30px rgba(242,167,195,0.45);transform:translateY(-1px);}.checkout-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}.clear-btn{width:100%;padding:10px;background:none;border:none;font-size:11px;color:var(--muted-light);cursor:pointer;letter-spacing:0.12em;text-transform:uppercase;margin-top:10px;transition:color 0.2s;font-family:'Noto Serif JP',serif;}.clear-btn:hover{color:#e05050;}#toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);z-index:1000;opacity:0;pointer-events:none;transition:all 0.45s cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;gap:12px;padding:13px 22px;border-radius:14px;background:var(--ink);color:white;font-size:13px;white-space:nowrap;box-shadow:0 10px 40px rgba(26,10,15,0.25);}#toast.show{opacity:1;transform:translateX(-50%) translateY(0);}.toast-icon{color:var(--sakura);font-size:15px;}#toast.remove-toast .toast-icon{color:#e07070;}#overlay{position:fixed;inset:0;z-index:500;background:rgba(26,10,15,0.35);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity 0.4s;}#overlay.show{opacity:1;pointer-events:all;}#wishlist-drawer{position:fixed;top:68px;right:0;width:340px;max-height:calc(100vh - 100px);background:white;border:1px solid var(--border);border-radius:16px 0 0 16px;box-shadow:var(--shadow-hover);z-index:550;padding:20px;transform:translateX(110%);transition:transform 0.45s cubic-bezier(0.23,1,0.32,1);overflow-y:auto;}#wishlist-drawer.open{transform:translateX(0);}.drawer-title{font-family:'Shippori Mincho';font-size:18px;font-weight:700;margin-bottom:4px;}.drawer-sub{font-size:11px;color:var(--muted);letter-spacing:0.15em;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:16px;}.wish-item{display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;border:1px solid var(--border);margin-bottom:10px;transition:border-color 0.2s;}.wish-item:hover{border-color:var(--border-strong);}.wish-thumb{width:40px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.wish-info{flex:1;}.wish-name{font-size:12px;font-weight:600;color:var(--ink);}.wish-price{font-size:12px;font-family:'DM Mono';color:var(--muted);}.wish-actions{display:flex;align-items:center;gap:6px;}.wish-add{font-size:12px;padding:6px 12px;background:var(--sakura-pale);border:1px solid var(--border-strong);color:var(--sakura-deep);border-radius:8px;cursor:pointer;transition:all 0.2s;font-family:'Noto Serif JP';}.wish-add:hover{background:var(--sakura);color:white;}.wish-empty{text-align:center;padding:40px 20px;color:var(--muted-light);font-size:13px;}.search-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:12px;border:1px solid var(--border);background:white;width:220px;transition:all 0.3s;}.search-bar:focus-within{border-color:var(--border-strong);box-shadow:0 0 0 3px rgba(242,167,195,0.15);width:280px;}.search-bar i{color:var(--muted-light);font-size:13px;}.search-bar input{border:none;outline:none;background:none;font-size:13px;color:var(--ink);width:100%;font-family:'Noto Serif JP';}.search-bar input::placeholder{color:var(--muted-light);}footer{border-top:1px solid var(--border);padding:64px 52px 40px;max-width:1440px;margin:40px auto 0;position:relative;z-index:10;}.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:60px;margin-bottom:48px;}.footer-logo{font-family:'Cinzel',serif;font-size:20px;font-weight:600;letter-spacing:0.15em;color:var(--ink);margin-bottom:12px;}.footer-tagline{font-size:13px;color:var(--muted);line-height:1.7;font-weight:300;margin-bottom:24px;}.social-row{display:flex;gap:8px;}.social-btn{width:34px;height:34px;border-radius:9px;background:var(--paper);border:1px solid var(--border);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:all 0.2s;text-decoration:none;}.social-btn:hover{border-color:var(--border-strong);color:var(--sakura-deep);background:var(--sakura-pale);}.foot-col h5{font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--muted);font-family:'DM Mono';margin-bottom:18px;}.foot-col ul{list-style:none;}.foot-col li{margin-bottom:10px;}.foot-col a{font-size:13px;color:var(--ink-soft);text-decoration:none;transition:color 0.2s;}.foot-col a:hover{color:var(--sakura-deep);}.news-input-row{display:flex;gap:8px;}.news-input{flex:1;padding:10px 14px;border:1px solid var(--border);border-radius:10px;background:white;font-size:12px;color:var(--ink);outline:none;font-family:'Noto Serif JP';transition:border-color 0.2s;}.news-input:focus{border-color:var(--border-strong);}.news-input::placeholder{color:var(--muted-light);}.news-btn{padding:10px 16px;border-radius:10px;background:var(--sakura);border:none;color:white;font-size:13px;cursor:pointer;transition:all 0.2s;}.news-btn:hover{background:var(--sakura-deep);}.news-success{font-size:11px;color:var(--sakura-deep);margin-top:10px;font-family:'DM Mono';}.footer-bottom{padding-top:24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}.footer-copy{font-size:12px;color:var(--muted);}.footer-links{display:flex;gap:20px;}.footer-links a{font-size:11px;color:var(--muted);text-decoration:none;transition:color 0.2s;}.footer-links a:hover{color:var(--sakura-deep);}#scroll-top{position:fixed;bottom:28px;right:28px;z-index:300;width:44px;height:44px;border-radius:12px;background:white;border:1px solid var(--border);color:var(--muted);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow);transition:all 0.3s;opacity:0;pointer-events:none;}#scroll-top.visible{opacity:1;pointer-events:all;}#scroll-top:hover{border-color:var(--border-strong);color:var(--sakura-deep);transform:translateY(-2px);}.reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease;}.reveal.visible{opacity:1;transform:translateY(0);}
    .auth-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;z-index:10;flex-direction:column;}.auth-back-btn{position:absolute;top:40px;left:40px;background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border:1px solid var(--border);padding:10px 20px;border-radius:12px;cursor:pointer;font-family:'Noto Serif JP';font-size:12px;color:var(--ink-mid);transition:all 0.3s;display:flex;align-items:center;gap:8px;}.auth-back-btn:hover{background:white;color:var(--sakura-deep);transform:translateX(-4px);}.auth-card{width:100%;max-width:440px;background:rgba(255,255,255,0.85);backdrop-filter:blur(24px);border:1px solid var(--border-strong);border-radius:28px;padding:48px 40px;box-shadow:0 20px 60px rgba(26,10,15,0.15);display:flex;flex-direction:column;animation:card-in 0.6s cubic-bezier(0.23,1,0.32,1) both;}@keyframes card-in{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}.auth-header{text-align:center;margin-bottom:32px;}.logo-kanji{width:48px;height:48px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;box-shadow:0 4px 16px var(--sakura-glow);font-family:'Noto Serif JP',serif;font-weight:700;margin:0 auto 16px;}.auth-title-en{font-family:'Cinzel',serif;font-size:16px;font-weight:600;letter-spacing:0.15em;color:var(--ink);line-height:1;}.auth-title-jp{font-size:10px;color:var(--muted);letter-spacing:0.2em;margin-bottom:24px;}.auth-heading{font-family:'Shippori Mincho',serif;font-size:28px;font-weight:700;color:var(--ink);margin-bottom:8px;}.auth-sub{font-size:13px;color:var(--muted);}.auth-msg{padding:12px 16px;border-radius:12px;font-size:13px;display:flex;align-items:center;gap:10px;margin-bottom:24px;animation:card-in 0.3s ease;}.auth-msg.success{background:rgba(168,216,168,0.2);color:#2d6a2d;border:1px solid rgba(168,216,168,0.5);}.auth-msg.error{background:rgba(224,80,80,0.1);color:#e05050;border:1px solid rgba(224,80,80,0.3);}.input-group{position:relative;margin-bottom:16px;}.input-group i{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--muted-light);font-size:14px;transition:color 0.3s;}.input-group input{width:100%;padding:16px 16px 16px 44px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,0.6);font-family:'Noto Serif JP',serif;font-size:14px;color:var(--ink);outline:none;transition:all 0.3s;}.input-group input:focus{border-color:var(--sakura-deep);background:white;box-shadow:0 0 0 4px var(--sakura-glow);}.auth-forgot{text-align:right;margin-bottom:24px;}.auth-forgot a{font-size:12px;color:var(--muted);text-decoration:none;transition:color 0.2s;}.auth-forgot a:hover{color:var(--sakura-deep);}.auth-submit-btn{width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,var(--sakura),var(--sakura-deep));color:white;border:none;font-size:14px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 24px var(--sakura-glow);transition:all 0.3s;font-family:'Noto Serif JP',serif;}.auth-submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 32px rgba(242,167,195,0.45);}.auth-submit-btn:disabled{opacity:0.7;cursor:not-allowed;}.auth-divider{display:flex;align-items:center;text-align:center;margin:28px 0;color:var(--muted-light);font-size:12px;}.auth-divider::before,.auth-divider::after{content:'';flex:1;border-bottom:1px solid var(--border);}.auth-divider span{padding:0 14px;font-family:'DM Mono',monospace;letter-spacing:0.05em;}.auth-google-btn{width:100%;padding:15px;border-radius:14px;background:white;border:1px solid var(--border-strong);color:var(--ink-mid);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.3s;font-family:'Noto Serif JP',serif;}.auth-google-btn:hover:not(:disabled){background:var(--sakura-pale);border-color:var(--sakura-deep);color:var(--sakura-deep);}.auth-google-btn:disabled{opacity:0.6;cursor:not-allowed;}.google-icon{width:18px;height:18px;}.auth-footer{margin-top:32px;text-align:center;font-size:13px;color:var(--muted);}.auth-toggle-btn{background:none;border:none;color:var(--sakura-deep);font-weight:600;font-family:inherit;font-size:inherit;cursor:pointer;margin-left:6px;padding:0;transition:opacity 0.2s;}.auth-toggle-btn:hover:not(:disabled){opacity:0.7;text-decoration:underline;}
    #profile-drawer{position:fixed;top:0;right:0;height:100vh;width:min(480px,100vw);background:var(--paper-warm);border-left:1px solid var(--border);z-index:600;display:flex;flex-direction:column;transform:translateX(110%);transition:transform 0.55s cubic-bezier(0.23,1,0.32,1);box-shadow:-20px 0 60px rgba(26,10,15,0.12);}#profile-drawer.open{transform:translateX(0);}
    .profile-menu{display:flex;flex-direction:column;}.profile-menu-item{display:flex;align-items:center;padding:20px 28px;border-bottom:1px solid var(--border);cursor:pointer;transition:background 0.2s;font-size:14px;color:var(--ink);font-weight:600;background:white;}.profile-menu-item:hover{background:var(--sakura-pale);color:var(--sakura-deep);}.profile-menu-item i:first-child{width:24px;color:var(--sakura-deep);font-size:16px;}
    /* Product Modal */
    .product-modal{position:fixed;inset:0;background:var(--paper);z-index:700;display:flex;flex-direction:column;animation:slide-up 0.4s cubic-bezier(0.23,1,0.32,1) both;}@keyframes slide-up{from{opacity:0;transform:translateY(100px);}to{opacity:1;transform:translateY(0);}}.modal-scroll-area{overflow-y:auto;flex:1;padding:100px 52px 60px;max-width:1200px;margin:0 auto;width:100%;}.modal-scroll-area::-webkit-scrollbar{width:4px;}.modal-scroll-area::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:4px;}.product-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-bottom:80px;align-items:center;}@media (max-width:900px){.product-detail-grid{grid-template-columns:1fr;gap:40px;}}.product-image-col{border-radius:32px;overflow:hidden;box-shadow:var(--shadow);}.main-image-ph{width:100%;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;position:relative;}.main-image-ph .bg-icon{font-size:160px;filter:drop-shadow(0 20px 40px rgba(0,0,0,0.15));position:absolute;}.real-image-ph{width:100%;height:100%;object-fit:cover;position:relative;z-index:1;mix-blend-mode:multiply;opacity:0.85;}.product-info-col{display:flex;flex-direction:column;}.p-cat{font-family:'DM Mono';font-size:11px;letter-spacing:0.3em;color:var(--sakura-deep);margin-bottom:12px;}.p-title{font-family:'Shippori Mincho';font-size:48px;font-weight:700;color:var(--ink);line-height:1.1;margin-bottom:8px;}.p-title-jp{font-size:16px;color:var(--muted-light);letter-spacing:0.2em;margin-bottom:24px;}.p-price{font-family:'DM Mono';font-size:32px;font-weight:700;color:var(--ink);margin-bottom:32px;}.p-desc{font-size:15px;color:var(--ink-soft);line-height:1.8;margin-bottom:24px;}.p-specs{list-style:none;margin-bottom:40px;}.p-specs li{font-size:13px;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:10px;}.p-specs i{color:var(--sakura-deep);font-size:12px;}.p-options-row{display:flex;gap:40px;margin-bottom:40px;align-items:flex-start;}.p-sizes h4,.p-qty h4{font-family:'DM Mono';font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}.size-row{display:flex;gap:12px;}.size-btn{width:44px;height:44px;border-radius:12px;background:white;border:1px solid var(--border);font-family:'DM Mono';font-weight:600;color:var(--ink-mid);cursor:pointer;transition:all 0.2s;}.size-btn:hover{border-color:var(--sakura-deep);color:var(--sakura-deep);}.size-btn.active{background:var(--sakura-deep);color:white;border-color:var(--sakura-deep);box-shadow:0 4px 16px var(--sakura-glow);}.qty-selector{display:flex;align-items:center;background:white;border:1px solid var(--border);border-radius:12px;height:44px;padding:0 6px;}.qty-selector button{width:32px;height:32px;border:none;background:var(--paper);border-radius:8px;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all 0.2s;}.qty-selector button:hover{background:var(--sakura-pale);color:var(--sakura-deep);}.qty-selector span{font-family:'DM Mono';font-size:14px;font-weight:700;width:36px;text-align:center;}.p-add-btn{padding:18px;font-size:14px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:12px;}.related-section{margin-top:20px;margin-bottom:60px;padding-top:40px;border-top:1px solid var(--border);}.related-section h3{font-family:'Shippori Mincho';font-size:28px;color:var(--ink);margin-bottom:24px;}.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}@media (max-width:768px){.related-grid{grid-template-columns:1fr;}}.related-card{display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.6);border:1px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;transition:all 0.25s;}.related-card:hover{transform:translateY(-4px);background:white;border-color:var(--border-strong);box-shadow:var(--shadow);}.related-img{width:64px;height:72px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.related-img i{font-size:28px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));}.related-player{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--sakura-deep);font-family:'DM Mono';margin-bottom:2px;}.related-name{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:4px;}.related-price{font-size:13px;font-family:'DM Mono';color:var(--muted);}.reviews-section h3{font-family:'Shippori Mincho';font-size:28px;color:var(--ink);margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:16px;}.reviews-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}@media (max-width:768px){.reviews-grid{grid-template-columns:1fr;}}.review-card{background:rgba(255,255,255,0.6);border:1px solid var(--border);border-radius:20px;padding:24px;}.review-card .stars{color:#c9a96e;font-size:12px;margin-bottom:12px;display:flex;gap:4px;}.review-card h4{font-size:15px;color:var(--ink);margin-bottom:8px;}.review-card p{font-size:13px;color:var(--muted);line-height:1.6;font-style:italic;margin-bottom:16px;}.review-card .reviewer{font-family:'DM Mono';font-size:11px;color:var(--sakura-deep);letter-spacing:0.1em;}
    @media(max-width:768px){html,body,#root,.store-view{overflow-x:hidden!important;width:100%;position:relative}nav.nav-wrapper.bubble{width:92%;padding:0}nav.nav-wrapper.bubble .nav-inner{padding:0 16px}.nav-links,.search-bar,.logo-text-wrap,.frame-branch{display:none}.stat-chip:nth-child(5){left:10%;top:5%}.stat-chip:nth-child(6){right:10%;bottom:5%}.wrap,.section,.hero,footer{padding-left:20px;padding-right:20px;box-sizing:border-box}.section{padding-top:40px;padding-bottom:40px}.hero{grid-template-columns:1fr;text-align:center;padding-top:20px;gap:40px}.hero-left{padding-right:0;display:flex;flex-direction:column;align-items:center;width:100%}.hero-title{font-size:38px;line-height:1.1;word-wrap:break-word}.hero-desc{margin:0 auto 24px;width:100%}.hero-actions{flex-direction:column;width:100%;gap:12px}.hero-actions button{width:100%;justify-content:center}.hero-right{width:100%;display:flex;justify-content:center;overflow:hidden}.hero-orb{width:280px;height:280px}.orb-center{width:120px;height:120px}.orb-center i{font-size:32px}.stat-chip{padding:8px 12px}.stat-val{font-size:14px}.features-grid{grid-template-columns:1fr}.feature-card{border-right:none;border-bottom:1px solid var(--border);padding:24px 16px}.feature-card:last-child{border-bottom:none}.product-grid{grid-template-columns:repeat(2,1fr);gap:10px}.product-info{padding:12px 8px}.product-price{font-size:14px}.add-btn{width:28px;height:28px;font-size:11px}.footer-grid{grid-template-columns:1fr;gap:32px;text-align:center}.social-row{justify-content:center}.footer-bottom{flex-direction:column;gap:16px;text-align:center}}
    @media(max-width:900px){.hero{grid-template-columns:1fr;text-align:center;gap:60px;padding-top:40px;}.hero-left{padding-right:0;display:flex;flex-direction:column;align-items:center;}.hero-desc{text-align:center;margin:0 auto 40px;}.features-grid{grid-template-columns:repeat(2,1fr);}.feature-card:nth-child(2){border-right:none;}.feature-card{border-bottom:1px solid var(--border);}.footer-grid{grid-template-columns:1fr 1fr;gap:40px;}.frame-branch{width:35vw;opacity:0.6;}.left-branch{left:-5%;top:-5%;}.right-branch{right:-5%;top:-5%;}}
    @media(max-width:768px){.section,.features-section,footer,.hero{padding-left:20px;padding-right:20px;}.nav-links{display:none;}nav.nav-wrapper.bubble{width:95%;top:12px;}nav.nav-wrapper.bubble .nav-inner{padding:0 16px;}.hero-title{font-size:48px;}.section-title,.p-title{font-size:32px;}.footer-grid{grid-template-columns:1fr;text-align:center;}.social-row{justify-content:center;}.news-input-row{flex-direction:column;width:100%;}.news-input-row .news-btn{width:100%;padding:14px;}input,select,textarea{font-size:16px!important;}.cart-footer{padding-bottom:calc(24px + env(safe-area-inset-bottom));}.product-modal .modal-scroll-area{padding-bottom:calc(80px + env(safe-area-inset-bottom));padding-left:20px;padding-right:20px;}.product-modal .auth-back-btn{top:16px;left:16px;z-index:50;}.nav-btn,.wishlist-btn,.add-btn{min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;}.qty-btn{min-width:36px;min-height:36px;}.auth-back-btn{top:20px;left:20px;}.auth-card{padding:36px 24px;}}
    @media(max-width:480px){.features-grid,.product-grid{grid-template-columns:1fr;gap:24px;}.feature-card{border-right:none;}.product-img{aspect-ratio:4/3.5;}.hero-orb{width:300px;height:300px;}.orb-center{width:120px;height:120px;}.orb-center i{font-size:36px;}.stat-chip{padding:8px 12px;}.stat-val{font-size:16px;}.filter-row{overflow-x:auto;white-space:nowrap;padding-bottom:8px;justify-content:flex-start;-webkit-overflow-scrolling:touch;}.filter-tab{flex-shrink:0;}}
  `}}
  />
));