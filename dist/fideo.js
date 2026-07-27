var G = Object.defineProperty;
var Y = (s, t, e) => t in s ? G(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var a = (s, t, e) => Y(s, typeof t != "symbol" ? t + "" : t, e);
class x extends EventTarget {
  constructor() {
    super(...arguments);
    a(this, "state", {
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: !1,
      paused: !0,
      playbackRate: 1,
      buffered: 0
    });
  }
  getState() {
    return { ...this.state };
  }
  update(e, i = "change") {
    this.state = { ...this.state, ...e }, this.dispatchEvent(new CustomEvent(i, { detail: this.getState() }));
  }
}
class q extends x {
  constructor(e) {
    super();
    a(this, "provider", "html5");
    a(this, "boundHandler", this.handleMediaEvent.bind(this));
    a(this, "boundEvents", []);
    this.element = e, this.syncFromElement(), this.bind();
  }
  async play() {
    await this.element.play();
  }
  async pause() {
    this.element.pause();
  }
  async seek(e) {
    this.element.currentTime = e;
  }
  async setVolume(e) {
    this.element.volume = W(e);
  }
  async setMuted(e) {
    this.element.muted = e;
  }
  async setPlaybackRate(e) {
    this.element.playbackRate = e;
  }
  async setSource(e) {
    if (this.element.currentSrc === e || this.element.src === e) return;
    const i = this.element.paused;
    this.element.src = e, this.element.load(), i || await this.play().catch(() => {
    });
  }
  destroy() {
    this.element.pause();
    for (const e of this.boundEvents)
      this.element.removeEventListener(e, this.boundHandler);
    this.boundEvents = [];
  }
  bind() {
    const e = ["play", "pause", "timeupdate", "durationchange", "loadedmetadata", "volumechange", "ratechange", "ended"];
    for (const i of e)
      this.element.addEventListener(i, this.boundHandler), this.boundEvents.push(i);
  }
  handleMediaEvent(e) {
    this.syncFromElement(), this.dispatchEvent(new CustomEvent(e.type, { detail: this.getState() }));
  }
  syncFromElement() {
    const e = Number.isFinite(this.element.duration) ? this.element.duration : 0, i = this.element.buffered.length ? this.element.buffered.end(this.element.buffered.length - 1) : 0;
    this.state = {
      currentTime: this.element.currentTime || 0,
      duration: e,
      volume: this.element.volume,
      muted: this.element.muted,
      paused: this.element.paused,
      playbackRate: this.element.playbackRate,
      buffered: e > 0 ? i / e : 0
    };
  }
}
function W(s) {
  return Math.min(1, Math.max(0, s));
}
const L = {
  mobile: 767,
  tablet: 1024
}, D = /* @__PURE__ */ new Set(["", "true", "1", "yes", "on"]), N = /* @__PURE__ */ new Set(["false", "0", "no", "off"]), $ = "[data-fideo]", y = {
  play: !0,
  timeline: !0,
  currentTime: !0,
  duration: !0,
  volume: !0,
  settings: !0,
  fullscreen: !0
};
function c(s, t) {
  if (s == null) return t;
  const e = s.trim().toLowerCase();
  return D.has(e) ? !0 : N.has(e) ? !1 : t;
}
function k(s, t) {
  if (s == null || s.trim() === "") return t;
  const e = Number(s);
  return Number.isFinite(e) ? e : t;
}
function K(s, t) {
  if (typeof s == "number") return Number.isFinite(s) && s > 0 ? s : t;
  if (s == null || s.trim() === "") return t;
  const e = s.trim(), i = e.split(/[:/]/).map((o) => Number(o.trim()));
  if (i.length === 2 && i.every((o) => Number.isFinite(o) && o > 0))
    return i[0] / i[1];
  const r = Number(e);
  return Number.isFinite(r) && r > 0 ? r : t;
}
function Q(s, t) {
  if (!s) return t;
  const e = s.split(",").map((i) => Number(i.trim())).filter((i) => Number.isFinite(i) && i > 0);
  return e.length ? e : t;
}
function Z(s, t = {}) {
  if (s instanceof HTMLVideoElement) return "html5";
  const e = [s.getAttribute("src") || s.src, t.desktop, t.tablet, t.mobile].filter(
    (i) => !!i
  );
  for (const i of e) {
    if (/youtube(?:-nocookie)?\.com|youtu\.be/i.test(i)) return "youtube";
    if (/vimeo\.com/i.test(i)) return "vimeo";
    if (/wistia\.(?:com|net)|fast\.wistia/i.test(i)) return "wistia";
  }
  return "html5";
}
function J(s, t) {
  if (!s) return t;
  const e = s.trim().toLowerCase();
  return N.has(e) || e === "none" ? !1 : e === "play" || e === "pause" || e === "play-pause" ? e : D.has(e) ? "play-pause" : t;
}
function X(s, t) {
  if (!s) return t;
  const e = s.trim().toLowerCase();
  return e === "none" || e === "metadata" || e === "auto" ? e : t;
}
function T(s) {
  return typeof s == "string" ? { desktop: s } : s ?? {};
}
function ee(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoSrcDesktop || t.fideoSrc || void 0,
    tablet: t.fideoSrcTablet || void 0,
    mobile: t.fideoSrcMobile || void 0
  };
}
function te(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoPosterDesktop || t.fideoPoster || void 0,
    tablet: t.fideoPosterTablet || void 0,
    mobile: t.fideoPosterMobile || void 0
  };
}
function ie(s, t = {}) {
  var f, h;
  const e = s.dataset, i = {
    mobile: k(e.fideoBreakpointMobile, ((f = t.breakpoints) == null ? void 0 : f.mobile) ?? L.mobile),
    tablet: k(e.fideoBreakpointTablet, ((h = t.breakpoints) == null ? void 0 : h.tablet) ?? L.tablet)
  }, r = e.fideoProvider, o = t.provider ?? r ?? "auto", n = { ...ee(s), ...T(t.sources) }, d = o === "auto" ? Z(s, n) : o, l = t.viewport ?? !1, u = c(e.fideoBackground, t.background ?? !1), m = d !== "html5";
  return {
    selector: t.selector ?? $,
    provider: d,
    autoplay: u || c(e.fideoAutoplay, t.autoplay ?? !1),
    muted: u || c(e.fideoMuted, t.muted ?? !1),
    loop: u || c(e.fideoLoop, t.loop ?? !1),
    playsInline: u || c(e.fideoPlaysinline ?? e.fideoPlaysInline, t.playsInline ?? !0),
    controls: c(e.fideoControls, t.controls ?? !u),
    background: u,
    lazy: c(e.fideoLazy, t.lazy ?? m),
    lazyRootMargin: e.fideoLazyRootMargin || t.lazyRootMargin || "800px 0px",
    preload: X(e.fideoPreload, t.preload ?? "metadata"),
    controlVisibility: se(s, t.controlVisibility),
    viewport: J(e.fideoViewport, l),
    viewportThreshold: k(e.fideoViewportThreshold, t.viewportThreshold ?? 0.35),
    volume: k(e.fideoVolume, t.volume ?? 1),
    playbackRates: Q(e.fideoPlaybackRates, t.playbackRates ?? [0.5, 1, 1.25, 1.5, 2]),
    backgroundAspectRatio: K(e.fideoBackgroundAspectRatio ?? t.backgroundAspectRatio, 16 / 9),
    sources: n,
    posters: { ...te(s), ...T(t.posters) },
    breakpoints: i,
    icons: t.icons ?? {},
    className: e.fideoClass || t.className || "",
    cssVars: {
      ...re(s),
      ...t.cssVars ?? {}
    },
    disabledProviders: t.disabledProviders ?? []
  };
}
function se(s, t = {}) {
  const e = s.dataset, i = c(e.fideoShowTime, !0);
  return {
    play: c(e.fideoShowPlay, t.play ?? y.play),
    timeline: c(e.fideoShowTimeline, t.timeline ?? y.timeline),
    currentTime: c(
      e.fideoShowCurrentTime,
      t.currentTime ?? i ?? y.currentTime
    ),
    duration: c(e.fideoShowDuration, t.duration ?? i ?? y.duration),
    volume: c(e.fideoShowVolume, t.volume ?? y.volume),
    settings: c(e.fideoShowSettings, t.settings ?? y.settings),
    fullscreen: c(e.fideoShowFullscreen, t.fullscreen ?? y.fullscreen)
  };
}
function re(s) {
  const t = {}, e = [
    ["--fideo-accent", s.dataset.fideoAccent],
    ["--fideo-control-bg", s.dataset.fideoControlBg],
    ["--fideo-control-color", s.dataset.fideoControlColor],
    ["--fideo-track", s.dataset.fideoTrack],
    ["--fideo-track-fill", s.dataset.fideoTrackFill],
    ["--fideo-radius", s.dataset.fideoRadius]
  ];
  for (const [i, r] of e)
    r && (t[i] = r);
  return t;
}
function A(s, t, e = window.innerWidth) {
  return e <= t.mobile ? s.mobile ?? s.tablet ?? s.desktop : e <= t.tablet ? s.tablet ?? s.desktop ?? s.mobile : s.desktop ?? s.tablet ?? s.mobile;
}
function E(s, t) {
  if (!s) return s;
  const e = new URL(s, window.location.href);
  for (const [i, r] of Object.entries(t))
    e.searchParams.set(i, String(r));
  return e.toString();
}
function C(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase();
  let i;
  if (e === "youtu.be")
    i = t.pathname.split("/").filter(Boolean)[0];
  else if (e === "youtube.com" || e === "youtube-nocookie.com") {
    const o = t.pathname.split("/").filter(Boolean);
    o[0] === "embed" && (i = o[1]), o[0] === "watch" && (i = t.searchParams.get("v") ?? void 0), o[0] === "shorts" && (i = o[1]);
  }
  if (!i)
    return t.hostname = "www.youtube-nocookie.com", t.toString();
  const r = new URL(`https://www.youtube-nocookie.com/embed/${i}`);
  return t.searchParams.forEach((o, n) => {
    n !== "v" && r.searchParams.set(n, o);
  }), r.toString();
}
function z(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase(), i = t.pathname.split("/").filter(Boolean);
  if (e === "player.vimeo.com" || e !== "vimeo.com" || !i[0])
    return t.toString();
  const [r, o] = i, n = new URL(`https://player.vimeo.com/video/${r}`);
  return t.searchParams.forEach((d, l) => n.searchParams.set(l, d)), o && !n.searchParams.has("h") && n.searchParams.set("h", o), n.toString();
}
function p(s, t) {
  const e = document.createElement(s);
  return t && (e.className = t), e;
}
function ae(s, t = "fideo") {
  return s.id || (s.id = `${t}-${Math.random().toString(36).slice(2, 10)}`), s.id;
}
const R = /* @__PURE__ */ new Map();
function H(s) {
  const t = R.get(s);
  if (t) return t;
  const e = new Promise((i, r) => {
    const o = document.querySelector(`script[src="${s}"]`);
    if ((o == null ? void 0 : o.dataset.loaded) === "true") {
      i();
      return;
    }
    const n = o ?? document.createElement("script");
    n.src = s, n.async = !0, n.addEventListener("load", () => {
      n.dataset.loaded = "true", i();
    }), n.addEventListener("error", () => r(new Error(`Could not load ${s}`))), o || document.head.append(n);
  });
  return R.set(s, e), e;
}
class oe extends x {
  constructor(e, i) {
    var n;
    super();
    a(this, "provider", "vimeo");
    a(this, "player");
    a(this, "ready");
    a(this, "destroyed", !1);
    this.element = e, this.options = i, this.options.muted && (this.state.muted = !0);
    const r = {
      api: 1,
      controls: 0,
      playsinline: 1
    };
    this.options.autoplay && (r.autoplay = 1), this.options.muted && (r.muted = 1), this.options.loop && (r.loop = 1), this.options.background && (r.background = 1), this.element.src = E(z(this.element.src), r);
    const o = (n = window.Vimeo) != null && n.Player ? Promise.resolve() : H("https://player.vimeo.com/api/player.js");
    this.ready = o.then(() => {
      if (!this.destroyed)
        return this.player = new window.Vimeo.Player(this.element), this.bind(), this.sync();
    });
  }
  async play() {
    var e;
    await this.ready, !this.destroyed && await ((e = this.player) == null ? void 0 : e.play());
  }
  async pause() {
    var e;
    await this.ready, !this.destroyed && await ((e = this.player) == null ? void 0 : e.pause());
  }
  async seek(e) {
    var i;
    await this.ready, !this.destroyed && (await ((i = this.player) == null ? void 0 : i.setCurrentTime(e)), await this.sync());
  }
  async setVolume(e) {
    var i;
    await this.ready, !this.destroyed && (await ((i = this.player) == null ? void 0 : i.setVolume(ne(e))), await this.sync("volumechange"));
  }
  async setMuted(e) {
    var i;
    await this.ready, !this.destroyed && (await ((i = this.player) == null ? void 0 : i.setMuted(e)), await this.sync("volumechange"));
  }
  async setPlaybackRate(e) {
    var i;
    await this.ready, !this.destroyed && (await ((i = this.player) == null ? void 0 : i.setPlaybackRate(e).catch(() => {
    })), await this.sync());
  }
  async setSource(e) {
    var i;
    await this.ready, !this.destroyed && (await ((i = this.player) == null ? void 0 : i.loadVideo({ url: E(z(e), this.providerParams()) })), await this.sync());
  }
  destroy() {
    var e;
    this.destroyed = !0, (e = this.player) == null || e.destroy();
  }
  bind() {
    var i;
    const e = ["play", "pause", "ended", "timeupdate", "volumechange", "durationchange", "playbackratechange"];
    for (const r of e)
      (i = this.player) == null || i.on(r, (o = {}) => {
        this.applyEvent(r, o), this.dispatchEvent(new CustomEvent(r, { detail: this.getState() }));
      });
  }
  applyEvent(e, i) {
    this.state = {
      ...this.state,
      currentTime: typeof i.seconds == "number" ? i.seconds : this.state.currentTime,
      duration: typeof i.duration == "number" ? i.duration : this.state.duration,
      volume: typeof i.volume == "number" ? i.volume : this.state.volume,
      muted: typeof i.muted == "boolean" ? i.muted : this.state.muted,
      paused: e === "play" ? !1 : e === "pause" || e === "ended" ? !0 : this.state.paused
    };
  }
  async sync(e = "change") {
    if (!this.player) return;
    const [i, r, o, n, d] = await Promise.all([
      this.player.getCurrentTime().catch(() => 0),
      this.player.getDuration().catch(() => 0),
      this.player.getVolume().catch(() => 1),
      this.player.getMuted().catch(() => !1),
      this.player.getPlaybackRate().catch(() => 1)
    ]);
    this.update({ currentTime: i, duration: r, volume: o, muted: n, playbackRate: d }, e);
  }
  providerParams() {
    const e = {
      api: 1,
      controls: 0,
      playsinline: 1
    };
    return this.options.autoplay && (e.autoplay = 1), this.options.muted && (e.muted = 1), this.options.loop && (e.loop = 1), this.options.background && (e.background = 1), e;
  }
}
function ne(s) {
  return Math.min(1, Math.max(0, s));
}
class de extends x {
  constructor(e, i) {
    super();
    a(this, "provider", "wistia");
    a(this, "element");
    a(this, "player");
    a(this, "ready");
    a(this, "mediaId");
    a(this, "destroyed", !1);
    a(this, "readyResolver");
    this.options = i, this.element = e, this.options.muted && (this.state.muted = !0), this.mediaId = V(e.src);
    const r = document.createElement("wistia-player");
    r.setAttribute("media-id", this.mediaId), r.setAttribute("aspect", "1.7777777777777777"), this.options.controls !== !1 && r.setAttribute("controls-visible-on-load", "false"), this.options.autoplay && r.setAttribute("auto-play", ""), this.options.muted && r.setAttribute("muted", ""), this.options.loop && r.setAttribute("end-video-behavior", "loop"), this.options.background && r.setAttribute("fit-strategy", "cover"), r.classList.add("fideo__media"), r.setAttribute("data-fideo-ready", "true"), r.style.position = "relative", r.style.zIndex = "0", r.style.display = "block", r.style.width = "100%", r.style.height = "100%", r.style.border = "0", e.before(r), e.remove(), this.player = r;
    const o = document.createElement("script");
    o.src = `https://fast.wistia.com/embed/${this.mediaId}.js`, o.type = "module", o.async = !0;
    const n = new Promise((d, l) => {
      o.addEventListener("load", () => d()), o.addEventListener("error", () => l(new Error(`Could not load Wistia embed ${this.mediaId}.`)));
    });
    document.head.appendChild(o), this.ready = Promise.all([H("https://fast.wistia.com/player.js"), n]).then(
      () => new Promise((d) => {
        if (this.readyResolver = d, this.destroyed) {
          d();
          return;
        }
        r.addEventListener("api-ready", () => {
          if (this.destroyed) {
            d();
            return;
          }
          this.bind(), this.sync(), d();
        }, { once: !0 });
      })
    );
  }
  async play() {
    var e;
    await this.ready, !this.destroyed && ((e = this.player) == null || e.play());
  }
  async pause() {
    var e;
    await this.ready, !this.destroyed && ((e = this.player) == null || e.pause());
  }
  async seek(e) {
    await this.ready, !this.destroyed && (this.player && (this.player.currentTime = e), this.sync());
  }
  async setVolume(e) {
    await this.ready, !this.destroyed && (this.player && (this.player.volume = le(e)), this.sync("volumechange"));
  }
  async setMuted(e) {
    await this.ready, !this.destroyed && (this.player && (this.player.muted = e), this.sync("volumechange"));
  }
  async setPlaybackRate(e) {
    await this.ready, !this.destroyed && (this.player && (this.player.playbackRate = e), this.sync());
  }
  async setSource(e) {
    if (this.destroyed) return;
    const i = V(e);
    i && this.player && (this.player.mediaId = i);
  }
  destroy() {
    var e, i;
    this.destroyed = !0, (e = this.player) == null || e.remove(), (i = this.readyResolver) == null || i.call(this);
  }
  bind() {
    const e = this.player;
    e && (e.addEventListener("play", () => {
      this.update({ paused: !1 }, "play");
    }), e.addEventListener("pause", () => {
      this.update({ paused: !0 }, "pause");
    }), e.addEventListener("ended", () => {
      this.update({ paused: !0 }, "ended");
    }), e.addEventListener("time-update", () => {
      if (!this.player) return;
      const i = this.player.currentTime ?? 0;
      this.update({ currentTime: i }, "timeupdate");
    }), e.addEventListener("volume-change", () => {
      this.sync();
    }), e.addEventListener("mute-change", () => {
      this.sync();
    }));
  }
  sync(e = "change") {
    if (!this.player) return;
    const i = this.player;
    this.update({
      currentTime: i.currentTime ?? 0,
      duration: i.duration ?? 0,
      volume: i.volume ?? 1,
      muted: i.muted ?? !1,
      playbackRate: i.playbackRate ?? 1
    }, e);
  }
}
function V(s) {
  var t;
  return ((t = s.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/)) == null ? void 0 : t[1]) ?? "";
}
function le(s) {
  return Math.min(1, Math.max(0, s));
}
let S;
class ue extends x {
  constructor(e, i) {
    super();
    a(this, "provider", "youtube");
    a(this, "player");
    a(this, "ready");
    a(this, "readyResolver");
    a(this, "readyRejecter");
    a(this, "timer");
    a(this, "destroyed", !1);
    this.element = e, this.options = i, this.options.muted && (this.state.muted = !0);
    const r = C(this.element.src), o = {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      disablekb: 1,
      fs: 0,
      origin: window.location.origin
    };
    if (this.options.autoplay && (o.autoplay = 1), this.options.muted && (o.mute = 1), this.options.loop) {
      o.loop = 1;
      const d = F(r);
      d && (o.playlist = d);
    }
    this.element.src = E(r, o);
    const n = ae(this.element, "fideo-youtube");
    this.ready = new Promise((d, l) => {
      this.readyResolver = d, this.readyRejecter = l;
    }), ce().then(() => {
      var d;
      if (this.destroyed) {
        (d = this.readyResolver) == null || d.call(this);
        return;
      }
      this.player = new window.YT.Player(n, {
        events: {
          onReady: () => {
            var l, u, m;
            if (this.destroyed) {
              (l = this.player) == null || l.destroy(), (u = this.readyResolver) == null || u.call(this);
              return;
            }
            this.sync(), (m = this.readyResolver) == null || m.call(this);
          },
          onStateChange: ({ data: l }) => {
            this.destroyed || this.handleStateChange(l);
          }
        }
      });
    }).catch((d) => {
      var l;
      (l = this.readyRejecter) == null || l.call(this, d);
    });
  }
  async play() {
    var e;
    await this.ready, !this.destroyed && ((e = this.player) == null || e.playVideo());
  }
  async pause() {
    var e;
    await this.ready, !this.destroyed && ((e = this.player) == null || e.pauseVideo());
  }
  async seek(e) {
    var i;
    await this.ready, !this.destroyed && ((i = this.player) == null || i.seekTo(e, !0), this.sync());
  }
  async setVolume(e) {
    var r;
    if (await this.ready, this.destroyed) return;
    const i = he(e);
    (r = this.player) == null || r.setVolume(Math.round(i * 100)), this.sync(), this.state.volume = i, this.dispatchEvent(new CustomEvent("volumechange", { detail: this.getState() }));
  }
  async setMuted(e) {
    var i, r;
    await this.ready, !this.destroyed && (e ? (i = this.player) == null || i.mute() : (r = this.player) == null || r.unMute(), this.sync(), this.state.muted = e, this.dispatchEvent(new CustomEvent("volumechange", { detail: this.getState() })));
  }
  async setPlaybackRate(e) {
    var i;
    await this.ready, !this.destroyed && ((i = this.player) == null || i.setPlaybackRate(e), this.sync());
  }
  async setSource(e) {
    var n;
    if (await this.ready, this.destroyed) return;
    const i = C(e), r = F(i), o = E(i, {
      ...this.providerParams(),
      ...this.options.loop && r ? { loop: 1, playlist: r } : {}
    });
    (n = this.player) == null || n.loadVideoByUrl(o);
  }
  destroy() {
    var e, i;
    this.destroyed = !0, this.timer && window.clearInterval(this.timer), (e = this.player) == null || e.destroy(), (i = this.readyResolver) == null || i.call(this);
  }
  handleStateChange(e) {
    this.sync(), e === 1 && (this.startTimer(), this.dispatchEvent(new CustomEvent("play", { detail: this.getState() }))), e === 2 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("pause", { detail: this.getState() }))), e === 0 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("ended", { detail: this.getState() })));
  }
  sync() {
    var r, o, n, d, l, u, m, f, h, g;
    if (!this.player) return;
    const e = ((o = (r = this.player).getDuration) == null ? void 0 : o.call(r)) || 0, i = this.state.paused;
    this.state = {
      currentTime: ((d = (n = this.player).getCurrentTime) == null ? void 0 : d.call(n)) || 0,
      duration: e,
      volume: (((u = (l = this.player).getVolume) == null ? void 0 : u.call(l)) ?? 100) / 100,
      muted: ((f = (m = this.player).isMuted) == null ? void 0 : f.call(m)) ?? !1,
      paused: i,
      playbackRate: ((g = (h = this.player).getPlaybackRate) == null ? void 0 : g.call(h)) || 1,
      buffered: 0
    };
  }
  startTimer() {
    this.state.paused = !1, !this.timer && (this.timer = window.setInterval(() => {
      this.sync(), this.dispatchEvent(new CustomEvent("timeupdate", { detail: this.getState() }));
    }, 250));
  }
  stopTimer() {
    this.state.paused = !0, this.timer && window.clearInterval(this.timer), this.timer = void 0;
  }
  providerParams() {
    return {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      disablekb: 1,
      fs: 0,
      origin: window.location.origin,
      ...this.options.autoplay ? { autoplay: 1 } : {},
      ...this.options.muted ? { mute: 1 } : {}
    };
  }
}
function ce() {
  var s;
  return (s = window.YT) != null && s.Player ? Promise.resolve() : S || (S = new Promise((t, e) => {
    const i = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      i == null || i(), t();
    };
    const r = document.createElement("script");
    r.src = "https://www.youtube.com/iframe_api", r.async = !0, r.onerror = () => e(new Error("Could not load the YouTube IFrame API.")), document.head.append(r);
  }), S);
}
function he(s) {
  return Math.min(1, Math.max(0, s));
}
function F(s) {
  if (!s) return;
  const e = new URL(s, window.location.href).pathname.split("/").filter(Boolean);
  return e[0] === "embed" ? e[1] : void 0;
}
function pe(s, t, e) {
  if (e.disabledProviders.includes(s))
    throw new Error(`Fideo provider "${s}" is disabled via disabledProviders.`);
  if (s === "html5") {
    if (!(t instanceof HTMLVideoElement))
      throw new Error("Fideo html5 provider needs a <video> element.");
    return new q(t);
  }
  if (!(t instanceof HTMLIFrameElement))
    throw new Error(`Fideo ${s} provider needs an <iframe> element.`);
  return e.lazy ? new me(s, t, e) : U(s, t, e);
}
function U(s, t, e) {
  return s === "youtube" ? new ue(t, e) : s === "vimeo" ? new oe(t, e) : new de(t, e);
}
class me extends EventTarget {
  constructor(e, i, r) {
    super();
    a(this, "element");
    a(this, "provider");
    a(this, "adapter");
    a(this, "observer");
    a(this, "source");
    a(this, "destroyed", !1);
    a(this, "pendingVolume");
    a(this, "pendingMuted");
    a(this, "state");
    this.options = r, this.provider = e, this.element = i, this.source = i.getAttribute("src") || i.src, this.pendingVolume = r.volume, this.pendingMuted = r.muted, this.state = {
      currentTime: 0,
      duration: 0,
      volume: r.volume,
      muted: r.muted,
      paused: !0,
      playbackRate: 1,
      buffered: 0
    }, this.source && (i.dataset.fideoLazySrc = this.source, i.removeAttribute("src")), this.observe();
  }
  async play() {
    const e = await this.init();
    await (e == null ? void 0 : e.play());
  }
  async pause() {
    if (!this.adapter) {
      this.update({ paused: !0 }, "pause");
      return;
    }
    await this.adapter.pause();
  }
  async seek(e) {
    const i = await this.init();
    await (i == null ? void 0 : i.seek(e));
  }
  async setVolume(e) {
    if (this.pendingVolume = fe(e), !this.adapter) {
      this.update({ volume: this.pendingVolume }, "volumechange");
      return;
    }
    await this.adapter.setVolume(e);
  }
  async setMuted(e) {
    if (this.pendingMuted = e, !this.adapter) {
      this.update({ muted: e }, "volumechange");
      return;
    }
    await this.adapter.setMuted(e);
  }
  async setPlaybackRate(e) {
    const i = await this.init();
    await (i == null ? void 0 : i.setPlaybackRate(e));
  }
  async setSource(e) {
    this.source = e, this.element.dataset.fideoLazySrc = e, this.adapter && await this.adapter.setSource(e);
  }
  getState() {
    var e;
    return ((e = this.adapter) == null ? void 0 : e.getState()) ?? { ...this.state };
  }
  destroy() {
    var e, i;
    this.destroyed = !0, (e = this.observer) == null || e.disconnect(), (i = this.adapter) == null || i.destroy(), !this.adapter && this.source && (this.element.src = this.source), delete this.element.dataset.fideoLazySrc;
  }
  observe() {
    if (!("IntersectionObserver" in window)) {
      this.init().catch(() => {
      });
      return;
    }
    this.observer = new IntersectionObserver(
      ([e]) => {
        (e.isIntersecting || e.intersectionRatio > 0) && this.init().catch(() => {
        });
      },
      { rootMargin: this.options.lazyRootMargin, threshold: 0 }
    ), this.observer.observe(this.element);
  }
  async init() {
    var r;
    if (this.adapter || this.destroyed) return this.adapter;
    (r = this.observer) == null || r.disconnect(), this.source && (this.element.src = this.source);
    const e = { ...this.options, lazy: !1 }, i = U(this.provider, this.element, e);
    return this.adapter = i, this.bindAdapter(i), await i.setVolume(this.pendingVolume).catch(() => {
    }), await i.setMuted(this.pendingMuted).catch(() => {
    }), i;
  }
  bindAdapter(e) {
    const i = ["play", "pause", "ended", "timeupdate", "volumechange", "change", "durationchange"];
    for (const r of i)
      e.addEventListener(r, () => {
        this.state = e.getState(), this.dispatchEvent(new CustomEvent(r, { detail: this.getState() }));
      });
  }
  update(e, i = "change") {
    this.state = { ...this.state, ...e }, this.dispatchEvent(new CustomEvent(i, { detail: this.getState() }));
  }
}
function fe(s) {
  return Math.min(1, Math.max(0, s));
}
const ye = {
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/></svg>',
  volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  volumeLow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  muted: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/><path d="M16 10l4 4m0 -4l-4 4"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6"/></svg>',
  fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2 -2v-2"/></svg>',
  fullscreenExit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2c0 -.551 .223 -1.05 .584 -1.412"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2c.545 0 1.04 -.218 1.4 -.572"/><path d="M3 3l18 18"/></svg>'
}, j = '.fideo__button{display:inline-grid;place-items:center;position:relative;z-index:1;width:var(--fideo-button-size, 26px);height:var(--fideo-button-size, 26px);padding:0;color:var(--fideo-control-color, #ffffff);background:transparent;border:0;border-radius:var(--fideo-button-radius, 4px);cursor:pointer;line-height:0;transition:opacity .14s ease,color .14s ease}.fideo__button:hover,.fideo__button:focus-visible{color:var(--fideo-accent, #46d9a7);background:transparent}.fideo__button svg{display:block;width:var(--fideo-icon-size, 17px);height:var(--fideo-icon-size, 17px);pointer-events:none}.fideo__control-row{display:flex;gap:var(--fideo-gap, 10px);align-items:center;min-width:0}.fideo__play{margin-right:-4px}.fideo__spacer{flex:1 1 auto}.fideo__timeline{display:block;min-width:0}.fideo__time-group{display:inline-flex;gap:3px;align-items:center;margin-left:2px}.fideo__time{min-width:auto;color:var(--fideo-muted-color, rgba(255, 255, 255, .92));font:600 12px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-variant-numeric:tabular-nums;text-align:left}.fideo__time-separator{color:var(--fideo-muted-color, rgba(255, 255, 255, .92));font:600 12px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.fideo__track,.fideo__volume{--fideo-progress: 0%;--fideo-buffered: 0%;width:100%;height:18px;padding:0;background:transparent;accent-color:var(--fideo-accent, #46d9a7);cursor:pointer;-webkit-appearance:none;-moz-appearance:none;appearance:none}.fideo__track::-webkit-slider-runnable-track,.fideo__volume::-webkit-slider-runnable-track{height:var(--fideo-track-size, 5px);background:linear-gradient(to right,var(--fideo-track-fill, rgba(255, 255, 255, .9)) 0%,var(--fideo-track-fill, rgba(255, 255, 255, .9)) var(--fideo-progress),var(--fideo-buffer-color, rgba(255, 255, 255, .68)) var(--fideo-progress),var(--fideo-buffer-color, rgba(255, 255, 255, .68)) var(--fideo-buffered),var(--fideo-track, rgba(255, 255, 255, .46)) var(--fideo-buffered),var(--fideo-track, rgba(255, 255, 255, .46)) 100%);border-radius:999px}.fideo__volume::-webkit-slider-runnable-track{width:var(--fideo-track-size, 5px);height:100%;background:linear-gradient(to top,var(--fideo-track-fill, rgba(255, 255, 255, .9)) 0%,var(--fideo-track-fill, rgba(255, 255, 255, .9)) var(--fideo-progress),var(--fideo-track, rgba(255, 255, 255, .46)) var(--fideo-progress),var(--fideo-track, rgba(255, 255, 255, .46)) 100%)}.fideo__track::-moz-range-track,.fideo__volume::-moz-range-track{height:var(--fideo-track-size, 5px);background:linear-gradient(to right,var(--fideo-buffer-color, rgba(255, 255, 255, .68)) 0%,var(--fideo-buffer-color, rgba(255, 255, 255, .68)) var(--fideo-buffered),var(--fideo-track, rgba(255, 255, 255, .46)) var(--fideo-buffered),var(--fideo-track, rgba(255, 255, 255, .46)) 100%);border-radius:999px}.fideo__volume::-moz-range-track{width:var(--fideo-track-size, 5px);height:100%;background:var(--fideo-track, rgba(255, 255, 255, .46))}.fideo__track::-moz-range-progress,.fideo__volume::-moz-range-progress{height:var(--fideo-track-size, 5px);background:var(--fideo-track-fill, rgba(255, 255, 255, .9));border-radius:999px}.fideo__volume::-moz-range-progress{width:var(--fideo-track-size, 5px)}.fideo__track::-webkit-slider-thumb,.fideo__volume::-webkit-slider-thumb{width:var(--fideo-thumb-size, 13px);height:var(--fideo-thumb-size, 13px);margin-top:calc((var(--fideo-thumb-size, 13px) - var(--fideo-track-size, 5px)) / -2);background:var(--fideo-control-color, #ffffff);border:0;border-radius:999px;-webkit-appearance:none;-moz-appearance:none;appearance:none}.fideo__volume::-webkit-slider-thumb{margin-top:0;margin-left:calc((var(--fideo-thumb-size, 13px) - var(--fideo-track-size, 5px)) / -2)}.fideo__track::-webkit-slider-thumb{opacity:0}.fideo__track:hover::-webkit-slider-thumb,.fideo__track:focus-visible::-webkit-slider-thumb{opacity:1}.fideo__track::-moz-range-thumb,.fideo__volume::-moz-range-thumb{width:var(--fideo-thumb-size, 13px);height:var(--fideo-thumb-size, 13px);background:var(--fideo-control-color, #ffffff);border:0;border-radius:999px}.fideo__track::-moz-range-thumb{opacity:0}.fideo__track:hover::-moz-range-thumb,.fideo__track:focus-visible::-moz-range-thumb{opacity:1}.fideo__volume-group{position:relative;display:inline-grid;place-items:center;width:var(--fideo-button-size, 26px);height:var(--fideo-button-size, 26px)}.fideo__volume-panel{position:absolute;bottom:calc(100% + 10px);left:50%;display:grid;place-items:center;width:24px;height:76px;opacity:0;pointer-events:none;transform:translate(-50%);transition:opacity .14s ease,bottom .14s ease}.fideo__volume-panel:after{position:absolute;right:-10px;bottom:-14px;left:-10px;height:14px;content:""}.fideo__volume{width:18px;height:76px;direction:rtl;writing-mode:vertical-lr}.fideo__volume-group:hover .fideo__volume-panel,.fideo__volume-group.is-open .fideo__volume-panel,.fideo__volume-group:focus-within .fideo__volume-panel{bottom:calc(100% + 14px);opacity:1;pointer-events:auto}.fideo__settings{position:relative}.fideo__settings-menu{position:absolute;right:0;bottom:calc(100% + 8px);display:grid;min-width:90px;padding:6px;pointer-events:none;background:#080a0de0;border:1px solid rgba(255,255,255,.12);border-radius:8px;box-shadow:none;opacity:0;transform:translateY(4px);transition:opacity .14s ease,transform .14s ease}.fideo__settings.is-open .fideo__settings-menu{pointer-events:auto;opacity:1;transform:translateY(0)}.fideo__speed{display:flex;gap:6px;align-items:center;min-height:32px;padding:0 12px 0 8px;color:var(--fideo-control-color, #ffffff);text-align:left;background:transparent;border:0;border-radius:6px;cursor:pointer}.fideo__speed:before{width:10px;content:"";opacity:0}.fideo__speed[aria-checked=true]:before{content:"✓";opacity:1}.fideo__speed[aria-checked=true]{color:var(--fideo-accent, #46d9a7)}.fideo__speed:hover,.fideo__speed:focus-visible{color:#07100d;background:var(--fideo-accent, #46d9a7)}@media(max-width:700px){.fideo__time,.fideo__time-separator{font-size:11px}}', ve = '.fideo{--fideo-accent: #46d9a7;--fideo-bg: transparent;--fideo-control-bg: transparent;--fideo-control-color: #ffffff;--fideo-muted-color: rgba(255, 255, 255, .92);--fideo-track: rgba(255, 255, 255, .46);--fideo-track-fill: rgba(255, 255, 255, .9);--fideo-buffer-color: rgba(255, 255, 255, .68);--fideo-track-size: 5px;--fideo-thumb-size: 13px;--fideo-radius: 8px;--fideo-button-size: 26px;--fideo-button-radius: 4px;--fideo-icon-size: 17px;--fideo-gap: 10px;position:relative;display:block;overflow:hidden;width:100%;aspect-ratio:16 / 9;background:var(--fideo-bg);color:var(--fideo-control-color);border-radius:var(--fideo-radius)}.fideo:after{position:absolute;inset:auto 0 0;z-index:1;height:104px;pointer-events:none;content:"";background:linear-gradient(to top,#0000006b,#00000042 38%,#0000);opacity:0;transition:opacity .16s ease}.fideo:hover:after,.fideo:focus-within:after,.fideo.is-paused:after,.fideo.is-user-active:after{opacity:1}.fideo__media{position:relative;z-index:0;display:block;width:100%;height:100%;border:0;object-fit:cover}.fideo__poster{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;width:100%;height:100%;object-fit:cover;pointer-events:none;opacity:0;transition:opacity .18s ease}.fideo.has-poster.is-poster-visible .fideo__poster{opacity:1}.fideo--background{width:100%;height:100%;min-height:inherit;aspect-ratio:auto;border-radius:inherit}.fideo--background:after,.fideo--no-controls:after{display:none}.fideo--background .fideo__media{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover}.fideo--background iframe.fideo__media,.fideo--background wistia-player.fideo__media{inset:auto;object-fit:initial;pointer-events:none}.fideo__click-target{position:absolute;top:0;right:0;bottom:0;left:0;z-index:2;padding:0;background:transparent;border:0;cursor:pointer}.fideo__click-target:focus-visible{outline:2px solid var(--fideo-accent);outline-offset:-4px}.fideo.is-fullscreen{border-radius:0}.fideo.is-fullscreen .fideo__media{object-fit:contain}.fideo--background.is-fullscreen .fideo__media{position:static;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain}.fideo--background.is-fullscreen iframe.fideo__media,.fideo--background.is-fullscreen wistia-player.fideo__media{inset:auto;object-fit:initial;pointer-events:auto}.fideo__controls{position:absolute;right:16px;bottom:10px;left:16px;z-index:3;display:grid;grid-template-rows:auto auto;gap:6px;padding:0;background:var(--fideo-control-bg);border:0;border-radius:0;box-shadow:none;filter:none;opacity:0;pointer-events:none;transform:translateY(5px);transition:opacity .16s ease,transform .16s ease}.fideo:hover .fideo__controls,.fideo:focus-within .fideo__controls,.fideo.is-paused .fideo__controls,.fideo.is-user-active .fideo__controls{opacity:1;pointer-events:auto;transform:translateY(0)}@media(max-width:700px){.fideo__controls{right:12px;bottom:8px;left:12px}}', B = "fideo-host-styles";
let v;
function ge() {
  if (typeof document > "u" || !document.head || document.getElementById(B)) return;
  const s = document.createElement("style");
  s.id = B, s.textContent = ve, document.head.prepend(s);
}
function be(s) {
  const t = we();
  if (t) {
    s.adoptedStyleSheets = [...s.adoptedStyleSheets, t];
    return;
  }
  const e = document.createElement("style");
  e.textContent = j, s.appendChild(e);
}
function we() {
  if (v !== void 0) return v;
  if (v = null, typeof CSSStyleSheet == "function" && typeof CSSStyleSheet.prototype.replaceSync == "function")
    try {
      const s = new CSSStyleSheet();
      s.replaceSync(j), v = s;
    } catch {
      v = null;
    }
  return v;
}
class ke {
  constructor(t, e, i) {
    a(this, "element");
    a(this, "playButton");
    a(this, "muteButton");
    a(this, "track");
    a(this, "volume");
    a(this, "currentTime");
    a(this, "duration");
    a(this, "fullscreenButton");
    a(this, "speedMenu");
    a(this, "settingsButton");
    a(this, "volumeGroup");
    a(this, "volumePanel");
    a(this, "settingsGroup");
    a(this, "seeking", !1);
    a(this, "speedButtons", []);
    a(this, "lastRenderedTime", -1);
    a(this, "lastRenderedDuration", -1);
    a(this, "lastTrackProgress", -1);
    a(this, "lastBufferedProgress", -1);
    a(this, "lastRenderedRate", -1);
    a(this, "smoothFrame");
    a(this, "smoothStartState");
    a(this, "smoothStartMs", 0);
    a(this, "lastAudibleVolume", 1);
    a(this, "volumeQueue", Promise.resolve());
    a(this, "volumeMutationDepth", 0);
    a(this, "icons");
    a(this, "handleFullscreenChange", () => this.renderFullscreenState());
    a(this, "onAdapterPlay", () => {
      const t = this.adapter.getState();
      this.syncPlayState(t), this.startSmoothProgress(t);
    });
    a(this, "onAdapterPause", () => {
      const t = this.adapter.getState();
      this.syncPlayState(t), this.stopSmoothProgress(), this.syncPlaybackState(t, !0);
    });
    a(this, "onAdapterEnded", () => {
      const t = this.adapter.getState();
      this.syncPlayState(t), this.stopSmoothProgress(), this.syncPlaybackState(t, !0);
    });
    a(this, "onAdapterVolumeChange", () => {
      this.volumeMutationDepth > 0 || this.syncVolumeState(this.adapter.getState());
    });
    a(this, "onAdapterDurationChange", () => this.syncPlaybackState(this.adapter.getState(), !0));
    a(this, "onAdapterTimeUpdate", () => {
      const t = this.adapter.getState();
      this.syncPlaybackState(t), t.paused || this.startSmoothProgress(t);
    });
    a(this, "onAdapterChange", () => {
      const t = this.adapter.getState();
      this.syncPlaybackState(t), t.paused ? this.stopSmoothProgress() : this.startSmoothProgress(t);
    });
    a(this, "onDocumentClick", (t) => this.closeMenus(t));
    this.adapter = t, this.wrapper = e, this.icons = { ...ye, ...i.icons }, this.element = p("div", "fideo__controls");
    const r = this.element.attachShadow({ mode: "open" });
    be(r), this.playButton = this.button("fideo__button fideo__play", "Play", this.icons.play, "play-button"), this.muteButton = this.button("fideo__button fideo__mute", "Mute", this.icons.volume, "mute-button"), this.track = this.range("fideo__track", 0, 1e3, 1, "timeline"), this.track.setAttribute("aria-label", "Seek"), this.volume = this.range("fideo__volume", 0, 1, 0.01, "volume-slider"), this.volume.setAttribute("aria-label", "Volume"), this.currentTime = p("span", "fideo__time"), this.currentTime.setAttribute("part", "current-time"), this.duration = p("span", "fideo__time"), this.duration.setAttribute("part", "duration"), this.speedMenu = this.createSpeedMenu(i.playbackRates), this.fullscreenButton = this.button("fideo__button", "Fullscreen", this.icons.fullscreen, "fullscreen-button"), this.settingsButton = this.button("fideo__button fideo__settings-toggle", "Settings", this.icons.settings, "settings-button"), this.settingsButton.setAttribute("aria-haspopup", "menu"), this.settingsButton.setAttribute("aria-expanded", "false");
    const o = this.settingsButton, n = p("div", "fideo__timeline");
    n.append(this.track);
    const d = p("span", "fideo__time-group"), l = p("span", "fideo__time-separator");
    l.setAttribute("part", "time-separator"), l.textContent = "/", d.append(this.currentTime, l, this.duration), this.volumeGroup = p("div", "fideo__volume-group"), this.volumePanel = p("div", "fideo__volume-panel"), this.volumePanel.append(this.volume), this.volumeGroup.append(this.muteButton, this.volumePanel), this.settingsGroup = p("div", "fideo__settings"), this.settingsGroup.append(o, this.speedMenu);
    const u = p("div", "fideo__control-row"), m = p("span", "fideo__spacer");
    i.controlVisibility.play && u.append(this.playButton), (i.controlVisibility.currentTime || i.controlVisibility.duration) && u.append(d), u.append(m), i.controlVisibility.volume && u.append(this.volumeGroup), i.controlVisibility.settings && u.append(this.settingsGroup), i.controlVisibility.fullscreen && u.append(this.fullscreenButton), r.appendChild(u), i.controlVisibility.timeline && r.appendChild(n), this.wrapper.append(this.element), i.controlVisibility.currentTime || this.currentTime.remove(), i.controlVisibility.duration || this.duration.remove(), (!i.controlVisibility.currentTime || !i.controlVisibility.duration) && l.remove(), this.playButton.addEventListener("click", () => this.togglePlay()), this.muteButton.addEventListener("click", () => this.toggleMute()), this.volume.addEventListener("input", () => this.changeVolume()), this.track.addEventListener("pointerdown", () => {
      this.seeking = !0, this.syncPlaybackState(this.adapter.getState(), !0);
    }), this.track.addEventListener("input", () => this.previewSeek()), this.track.addEventListener("change", () => this.commitSeek()), this.track.addEventListener("pointerup", () => {
      this.seeking = !1;
    }), this.track.addEventListener("pointercancel", () => {
      this.seeking = !1;
    }), o.addEventListener("click", () => {
      var g;
      this.wrapper.classList.add("is-user-active");
      const h = this.settingsGroup.classList.toggle("is-open");
      this.settingsButton.setAttribute("aria-expanded", String(h)), h && ((g = this.speedMenu.querySelector(".fideo__speed")) == null || g.focus());
    }), this.volumeGroup.addEventListener("click", (h) => {
      h.target !== this.volume && h.target !== this.muteButton && (this.wrapper.classList.add("is-user-active"), this.volumeGroup.classList.toggle("is-open"));
    }), this.volumeGroup.addEventListener("keydown", (h) => {
      h.key === "Escape" && (h.preventDefault(), this.volumeGroup.classList.remove("is-open"), this.muteButton.focus());
    }), this.fullscreenButton.addEventListener("click", () => {
      this.wrapper.classList.add("is-user-active"), this.toggleFullscreen();
    }), document.addEventListener("fullscreenchange", this.handleFullscreenChange), document.addEventListener("click", this.onDocumentClick), this.adapter.addEventListener("play", this.onAdapterPlay), this.adapter.addEventListener("pause", this.onAdapterPause), this.adapter.addEventListener("ended", this.onAdapterEnded), this.adapter.addEventListener("volumechange", this.onAdapterVolumeChange), this.adapter.addEventListener("durationchange", this.onAdapterDurationChange), this.adapter.addEventListener("timeupdate", this.onAdapterTimeUpdate), this.adapter.addEventListener("change", this.onAdapterChange);
    const f = this.adapter.getState();
    this.syncPlayState(f), this.syncVolumeState(f), this.syncPlaybackState(f, !0), this.renderFullscreenState();
  }
  destroy() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange), document.removeEventListener("click", this.onDocumentClick), this.adapter.removeEventListener("play", this.onAdapterPlay), this.adapter.removeEventListener("pause", this.onAdapterPause), this.adapter.removeEventListener("ended", this.onAdapterEnded), this.adapter.removeEventListener("volumechange", this.onAdapterVolumeChange), this.adapter.removeEventListener("durationchange", this.onAdapterDurationChange), this.adapter.removeEventListener("timeupdate", this.onAdapterTimeUpdate), this.adapter.removeEventListener("change", this.onAdapterChange), this.stopSmoothProgress(), this.element.remove();
  }
  button(t, e, i, r) {
    const o = document.createElement("button");
    return o.className = t, o.type = "button", o.ariaLabel = e, o.title = e, o.innerHTML = i, r && o.setAttribute("part", r), o;
  }
  range(t, e, i, r, o) {
    const n = document.createElement("input");
    return n.className = t, n.type = "range", n.min = String(e), n.max = String(i), n.step = String(r), o && n.setAttribute("part", o), n;
  }
  createSpeedMenu(t) {
    const e = p("div", "fideo__settings-menu");
    e.setAttribute("part", "settings-menu"), e.setAttribute("role", "menu"), e.setAttribute("aria-label", "Playback speed");
    for (const i of t) {
      const r = this.button("fideo__speed", `${i}x`, "", "speed-button");
      r.textContent = `${i}x`, r.setAttribute("role", "menuitemradio"), r.setAttribute("aria-checked", "false"), this.speedButtons.push({ button: r, rate: i }), r.addEventListener("click", () => {
        this.wrapper.classList.add("is-user-active"), this.adapter.setPlaybackRate(i).catch(() => {
        }), this.closeSettings(), this.settingsButton.focus();
      }), e.append(r);
    }
    return e.addEventListener("keydown", (i) => this.onSpeedMenuKeydown(i)), e;
  }
  onSpeedMenuKeydown(t) {
    var o;
    const e = Array.from(this.speedMenu.querySelectorAll(".fideo__speed"));
    if (!e.length) return;
    const i = (o = this.element.shadowRoot) == null ? void 0 : o.activeElement, r = e.indexOf(i);
    t.key === "ArrowDown" ? (t.preventDefault(), e[r < 0 ? 0 : (r + 1) % e.length].focus()) : t.key === "ArrowUp" ? (t.preventDefault(), e[r < 0 ? e.length - 1 : (r - 1 + e.length) % e.length].focus()) : t.key === "Home" ? (t.preventDefault(), e[0].focus()) : t.key === "End" ? (t.preventDefault(), e[e.length - 1].focus()) : t.key === "Escape" && (t.preventDefault(), this.closeSettings(), this.settingsButton.focus());
  }
  closeMenus(t) {
    const e = t.composedPath();
    e.some((i) => i instanceof Node && (this.settingsGroup === i || this.settingsGroup.contains(i))) || this.closeSettings(), e.some((i) => i instanceof Node && (this.volumeGroup === i || this.volumeGroup.contains(i))) || this.volumeGroup.classList.remove("is-open");
  }
  closeSettings() {
    this.settingsGroup.classList.remove("is-open"), this.settingsButton.setAttribute("aria-expanded", "false");
  }
  togglePlay() {
    this.wrapper.classList.add("is-user-active"), this.adapter.getState().paused ? this.adapter.play().catch(() => {
    }) : this.adapter.pause().catch(() => {
    });
  }
  toggleMute() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState(), e = !t.muted, i = !e && t.volume === 0 ? this.lastAudibleVolume : t.volume, r = { ...t, muted: e, volume: i };
    this.enqueueVolumeMutation(r, async () => {
      !e && t.volume === 0 && await this.adapter.setVolume(i), await this.adapter.setMuted(e);
    });
  }
  changeVolume() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState(), e = I(Number(this.volume.value)), i = e === 0;
    e > 0 && (this.lastAudibleVolume = e), this.enqueueVolumeMutation({ ...t, volume: e, muted: i }, async () => {
      await this.adapter.setVolume(e), await this.adapter.setMuted(i);
    });
  }
  previewSeek() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState();
    this.setTrackProgress(Number(this.track.value)), t.duration && (this.lastRenderedTime = -1, this.currentTime.textContent = P(Number(this.track.value) / 1e3 * t.duration));
  }
  commitSeek() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState();
    this.seeking = !1, t.duration && (this.adapter.seek(Number(this.track.value) / 1e3 * t.duration).catch(() => {
    }), this.startSmoothProgress(this.adapter.getState()));
  }
  toggleFullscreen() {
    var t, e, i;
    if (document.fullscreenElement === this.wrapper) {
      (t = document.exitFullscreen) == null || t.call(document);
      return;
    }
    (i = (e = this.wrapper).requestFullscreen) == null || i.call(e);
  }
  syncPlayState(t) {
    const e = t.paused ? this.icons.play : this.icons.pause, i = t.paused ? "Play" : "Pause";
    this.playButton.innerHTML !== e && (this.playButton.innerHTML = e), this.playButton.ariaLabel !== i && (this.playButton.ariaLabel = i), this.playButton.title !== i && (this.playButton.title = i);
  }
  syncVolumeState(t) {
    const e = I(t.volume);
    !t.muted && e > 0 && (this.lastAudibleVolume = e), this.volume.value = String(t.muted ? 0 : e), this.volume.style.setProperty("--fideo-progress", `${Number(this.volume.value) * 100}%`), this.volume.setAttribute("aria-valuetext", `${Math.round(Number(this.volume.value) * 100)}%`);
    let i = t.muted || e === 0 ? this.icons.muted : this.icons.volume;
    !t.muted && e > 0 && e <= 0.5 && (i = this.icons.volumeLow);
    const r = t.muted || e === 0 ? "Unmute" : "Mute";
    this.muteButton.innerHTML !== i && (this.muteButton.innerHTML = i), this.muteButton.ariaLabel !== r && (this.muteButton.ariaLabel = r);
    const o = t.muted || e === 0, n = o ? "Muted" : "Unmuted";
    this.muteButton.title !== n && (this.muteButton.title = n), this.muteButton.setAttribute("aria-pressed", String(o));
  }
  enqueueVolumeMutation(t, e) {
    this.syncVolumeState(t), this.volumeQueue = this.volumeQueue.catch(() => {
    }).then(async () => {
      this.volumeMutationDepth += 1;
      try {
        await e();
      } catch {
      } finally {
        this.volumeMutationDepth -= 1, this.syncVolumeState(this.adapter.getState());
      }
    });
  }
  syncPlaybackState(t, e = !1) {
    !e && this.seeking || (this.setTrackProgress(t.duration ? t.currentTime / t.duration * 1e3 : 0), this.setBufferedProgress(t.buffered), this.renderTimeText(t), this.renderSpeedState(t.playbackRate));
  }
  // Called up to once per animation frame while playing, but the displayed
  // time only changes once per second — skipping the no-op writes keeps the
  // rAF loop to a single custom-property update and stops assistive tech from
  // being flooded with duplicate aria-valuetext announcements.
  renderTimeText(t) {
    const e = Math.floor(t.currentTime), i = Math.floor(t.duration);
    if (e === this.lastRenderedTime && i === this.lastRenderedDuration) return;
    this.lastRenderedTime = e, this.lastRenderedDuration = i;
    const r = P(t.currentTime), o = P(t.duration);
    this.currentTime.textContent = r, this.duration.textContent = o, this.track.setAttribute("aria-valuetext", `${r} of ${o}`);
  }
  renderSpeedState(t) {
    const e = Number.isFinite(t) && t > 0 ? t : 1;
    if (e !== this.lastRenderedRate) {
      this.lastRenderedRate = e;
      for (const { button: i, rate: r } of this.speedButtons)
        i.setAttribute("aria-checked", String(r === e));
    }
  }
  setTrackProgress(t) {
    const e = Number.isFinite(t) ? Math.min(1e3, Math.max(0, t)) : 0;
    e !== this.lastTrackProgress && (this.lastTrackProgress = e, this.track.value = String(e), this.track.style.setProperty("--fideo-progress", `${e / 10}%`));
  }
  setBufferedProgress(t) {
    const e = Number.isFinite(t) ? Math.round(Math.min(1, Math.max(0, t)) * 100) : 0;
    e !== this.lastBufferedProgress && (this.lastBufferedProgress = e, this.track.style.setProperty("--fideo-buffered", `${e}%`));
  }
  startSmoothProgress(t = this.adapter.getState()) {
    t.paused || !t.duration || this.seeking || Se() || (this.stopSmoothProgress(), this.smoothStartState = t, this.smoothStartMs = performance.now(), this.smoothFrame = requestAnimationFrame(() => this.tickSmoothProgress()));
  }
  stopSmoothProgress() {
    this.smoothFrame !== void 0 && cancelAnimationFrame(this.smoothFrame), this.smoothFrame = void 0, this.smoothStartState = void 0;
  }
  tickSmoothProgress() {
    const t = this.smoothStartState;
    if (!t || this.seeking) {
      this.stopSmoothProgress();
      return;
    }
    const e = this.adapter.getState();
    if (e.paused || !e.duration) {
      this.stopSmoothProgress(), this.syncPlaybackState(e, !0);
      return;
    }
    const i = (performance.now() - this.smoothStartMs) / 1e3 * (e.playbackRate || 1), r = Math.min(e.duration, t.currentTime + i);
    this.syncPlaybackState({ ...e, currentTime: r }, !0), this.smoothFrame = requestAnimationFrame(() => this.tickSmoothProgress());
  }
  renderFullscreenState() {
    const t = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = t ? this.icons.fullscreenExit : this.icons.fullscreen, this.fullscreenButton.ariaLabel = t ? "Exit fullscreen" : "Fullscreen", this.fullscreenButton.title = t ? "Exit fullscreen" : "Fullscreen";
  }
}
function I(s) {
  return Number.isFinite(s) ? Math.min(1, Math.max(0, s)) : 0;
}
let b;
function Se() {
  return b === void 0 && (b = typeof window < "u" && typeof window.matchMedia == "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null), (b == null ? void 0 : b.matches) ?? !1;
}
function P(s) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const t = Math.floor(s), e = Math.floor(t / 3600), i = Math.floor(t % 3600 / 60), r = String(t % 60).padStart(2, "0");
  return e > 0 ? `${e}:${String(i).padStart(2, "0")}:${r}` : `${i}:${r}`;
}
class _e {
  constructor(t, e, i) {
    a(this, "element");
    a(this, "wrapper");
    a(this, "options");
    a(this, "adapter");
    a(this, "controls");
    a(this, "observer");
    a(this, "currentSource");
    a(this, "resizeController", new AbortController());
    a(this, "lifecycleController", new AbortController());
    a(this, "activityTimer");
    a(this, "resizeFrame");
    a(this, "resizeObserver");
    a(this, "posterImage");
    a(this, "clickTarget");
    a(this, "destroyed", !1);
    a(this, "handleFullscreenChange", () => {
      const t = document.fullscreenElement === this.wrapper;
      this.wrapper.classList.toggle("is-fullscreen", t), this.options.background && this.applyBackgroundCover();
    });
    this.onDestroy = i, this.element = t, this.options = e, this.wrapper = this.wrapElement(t, e), this.configureElement(), this.adapter = pe(e.provider, t, e), this.applyResponsiveMedia(), e.controls && (this.controls = new ke(this.adapter, this.wrapper, e)), this.bindAdapterEvents(), this.bindClickToToggle(), this.bindResponsiveMedia(), this.bindBackgroundCover(), this.bindViewportPlayback(), document.addEventListener("fullscreenchange", this.handleFullscreenChange), this.adapter.setVolume(e.volume).catch(() => {
    }), this.adapter.setMuted(e.muted).catch(() => {
    }), e.autoplay && !e.background && this.play().catch(() => {
    });
  }
  play() {
    return this.adapter.play();
  }
  pause() {
    return this.adapter.pause();
  }
  seek(t) {
    return this.adapter.seek(t);
  }
  setVolume(t) {
    return this.adapter.setVolume(t);
  }
  setMuted(t) {
    return this.adapter.setMuted(t);
  }
  setPlaybackRate(t) {
    return this.adapter.setPlaybackRate(t);
  }
  setSource(t) {
    return this.adapter.setSource(t);
  }
  getState() {
    return this.adapter.getState();
  }
  destroy() {
    var t, e, i, r, o, n;
    this.destroyed || (this.destroyed = !0, (t = this.observer) == null || t.disconnect(), (e = this.resizeObserver) == null || e.disconnect(), this.resizeController.abort(), this.lifecycleController.abort(), (i = this.controls) == null || i.destroy(), this.adapter.destroy(), document.removeEventListener("fullscreenchange", this.handleFullscreenChange), this.activityTimer && window.clearTimeout(this.activityTimer), this.resizeFrame !== void 0 && cancelAnimationFrame(this.resizeFrame), this.wrapper.classList.remove("is-ready"), this.wrapper.classList.remove("has-poster", "is-poster-visible"), this.element.removeAttribute("data-fideo-ready"), this.element.classList.remove("fideo__media"), (r = this.posterImage) == null || r.remove(), (o = this.clickTarget) == null || o.remove(), this.element.parentElement === this.wrapper && this.wrapper.before(this.element), this.wrapper.remove(), (n = this.onDestroy) == null || n.call(this, this.element, this));
  }
  wrapElement(t, e) {
    var r;
    if ((r = t.parentElement) != null && r.classList.contains("fideo"))
      return t.parentElement;
    const i = document.createElement("div");
    return i.className = ["fideo", e.className].filter(Boolean).join(" "), t.before(i), i.append(t), i;
  }
  configureElement() {
    this.wrapper.classList.add(`fideo--${this.options.provider}`), this.options.background && this.wrapper.classList.add("fideo--background"), this.options.controls || this.wrapper.classList.add("fideo--no-controls"), this.wrapper.classList.add("is-ready"), this.wrapper.classList.add("is-paused"), this.element.classList.add("fideo__media"), this.element.setAttribute("data-fideo-ready", "true");
    for (const [t, e] of Object.entries(this.options.cssVars))
      this.wrapper.style.setProperty(t, e);
    this.element instanceof HTMLVideoElement ? (this.element.controls = !1, this.element.loop = this.options.loop, this.element.muted = this.options.muted, this.element.playsInline = this.options.playsInline, this.element.preload = this.options.preload, this.element.setAttribute("playsinline", "")) : (this.element.allow = Ee(this.element.allow, ["autoplay", "fullscreen", "picture-in-picture", "encrypted-media"]), this.element.setAttribute("allowfullscreen", ""));
  }
  bindAdapterEvents() {
    const t = ["play", "pause", "ended", "timeupdate", "volumechange", "change"];
    for (const e of t)
      this.adapter.addEventListener(e, () => {
        this.syncPosterVisibility(), this.syncPlaybackClasses(), e === "play" && this.clearActivity(), (e === "pause" || e === "ended") && this.wrapper.classList.remove("is-user-active"), this.element.dispatchEvent(
          new CustomEvent(`fideo:${e}`, {
            bubbles: !0,
            detail: {
              player: this,
              state: this.adapter.getState()
            }
          })
        );
      }, { signal: this.lifecycleController.signal });
  }
  bindClickToToggle() {
    if (!this.options.controls) return;
    const t = document.createElement("button");
    t.className = "fideo__click-target", t.type = "button", t.ariaLabel = "Play or pause video", this.clickTarget = t, this.wrapper.prepend(t), t.addEventListener("click", () => {
      const e = this.adapter.getState();
      this.activateControls(), e.paused ? this.play().catch(() => {
      }) : this.pause().catch(() => {
      });
    }, { signal: this.lifecycleController.signal }), t.addEventListener("keydown", (e) => this.handleShortcut(e), {
      signal: this.lifecycleController.signal
    }), this.wrapper.addEventListener("pointermove", () => this.activateControls(), {
      passive: !0,
      signal: this.lifecycleController.signal
    }), this.wrapper.addEventListener("pointerleave", () => this.clearActivity(), {
      passive: !0,
      signal: this.lifecycleController.signal
    });
  }
  syncPlaybackClasses() {
    const t = this.adapter.getState().paused;
    this.wrapper.classList.toggle("is-playing", !t), this.wrapper.classList.toggle("is-paused", t);
  }
  activateControls(t = 1800) {
    this.wrapper.classList.add("is-user-active"), this.activityTimer && window.clearTimeout(this.activityTimer), !(!t || this.adapter.getState().paused) && (this.activityTimer = window.setTimeout(() => {
      this.wrapper.classList.remove("is-user-active");
    }, t));
  }
  clearActivity() {
    this.activityTimer && window.clearTimeout(this.activityTimer), this.adapter.getState().paused || this.wrapper.classList.remove("is-user-active");
  }
  handleShortcut(t) {
    const e = this.adapter.getState();
    switch (t.key) {
      case "ArrowLeft":
        t.preventDefault(), this.seek(Math.max(0, e.currentTime - 5)).catch(() => {
        });
        break;
      case "ArrowRight":
        t.preventDefault(), this.seek(e.duration ? Math.min(e.duration, e.currentTime + 5) : e.currentTime + 5).catch(
          () => {
          }
        );
        break;
      case "ArrowUp":
        t.preventDefault(), e.muted && this.setMuted(!1).catch(() => {
        }), this.setVolume(Math.min(1, e.volume + 0.1)).catch(() => {
        });
        break;
      case "ArrowDown":
        t.preventDefault(), this.setVolume(Math.max(0, e.volume - 0.1)).catch(() => {
        });
        break;
      case "m":
      case "M":
        t.preventDefault(), this.setMuted(!e.muted).catch(() => {
        });
        break;
      case "f":
      case "F":
        t.preventDefault(), this.toggleFullscreen();
        break;
      default:
        return;
    }
    this.activateControls();
  }
  toggleFullscreen() {
    var t, e, i;
    if (document.fullscreenElement === this.wrapper) {
      (t = document.exitFullscreen) == null || t.call(document);
      return;
    }
    (i = (e = this.wrapper).requestFullscreen) == null || i.call(e);
  }
  bindResponsiveMedia() {
    const t = () => this.scheduleResponsiveUpdate();
    window.addEventListener("resize", t, {
      passive: !0,
      signal: this.resizeController.signal
    }), window.addEventListener("orientationchange", t, {
      passive: !0,
      signal: this.resizeController.signal
    });
  }
  scheduleResponsiveUpdate() {
    this.resizeFrame === void 0 && (this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = void 0, this.applyResponsiveMedia(), this.applyBackgroundCover();
    }));
  }
  applyResponsiveMedia() {
    const t = A(this.options.posters, this.options.breakpoints);
    this.adapter.setPoster && this.adapter.setPoster(t ?? ""), this.applyPosterOverlay(t);
    const e = A(this.options.sources, this.options.breakpoints);
    e && e !== this.currentSource && (this.currentSource = e, this.syncPosterVisibility(), this.adapter.setSource(e).catch(() => {
    }));
  }
  bindViewportPlayback() {
    const t = this.options.viewport || (this.options.background && this.options.autoplay ? "play-pause" : !1);
    if (t) {
      if (!("IntersectionObserver" in window)) {
        (t === "play" || t === "play-pause") && this.play().catch(() => {
        });
        return;
      }
      this.observer = new IntersectionObserver(
        ([e]) => {
          const i = e.isIntersecting && e.intersectionRatio >= this.options.viewportThreshold;
          i && (t === "play" || t === "play-pause") && this.play().catch(() => {
          }), !i && (t === "pause" || t === "play-pause") && this.pause().catch(() => {
          });
        },
        {
          threshold: [0, this.options.viewportThreshold, 1]
        }
      ), this.observer.observe(this.wrapper);
    }
  }
  bindBackgroundCover() {
    this.options.background && (this.applyBackgroundCover(), "ResizeObserver" in window && (this.resizeObserver = new ResizeObserver(() => this.applyBackgroundCover()), this.resizeObserver.observe(this.wrapper)));
  }
  applyBackgroundCover() {
    if (document.fullscreenElement === this.wrapper) {
      this.element.style.width = "", this.element.style.height = "", this.element.style.left = "", this.element.style.top = "";
      return;
    }
    if (!this.options.background || this.element instanceof HTMLVideoElement || this.options.provider === "wistia") return;
    const e = this.wrapper.clientWidth, i = this.wrapper.clientHeight;
    if (!e || !i) return;
    const r = e / i, o = this.options.backgroundAspectRatio;
    let n = e, d = i;
    r > o ? d = e / o : n = i * o, this.element.style.width = `${n}px`, this.element.style.height = `${d}px`, this.element.style.left = `${(e - n) / 2}px`, this.element.style.top = `${(i - d) / 2}px`;
  }
  applyPosterOverlay(t) {
    var i;
    if (!t) {
      (i = this.posterImage) == null || i.remove(), this.posterImage = void 0, this.wrapper.classList.remove("has-poster", "is-poster-visible");
      return;
    }
    const e = this.ensurePosterImage();
    e.getAttribute("src") !== t && (e.src = t), this.wrapper.classList.add("has-poster"), this.syncPosterVisibility();
  }
  ensurePosterImage() {
    if (this.posterImage) return this.posterImage;
    const t = document.createElement("img");
    return t.className = "fideo__poster", t.alt = "", t.setAttribute("aria-hidden", "true"), t.decoding = "async", this.wrapper.insertBefore(t, this.element.nextSibling), this.posterImage = t, t;
  }
  syncPosterVisibility() {
    var i;
    const t = !!((i = this.posterImage) != null && i.getAttribute("src")), e = t && this.adapter.getState().paused;
    this.wrapper.classList.toggle("has-poster", t), this.wrapper.classList.toggle("is-poster-visible", e);
  }
}
function Ee(s, t) {
  const e = new Set(
    (s ?? "").split(";").map((i) => i.trim()).filter(Boolean)
  );
  return t.forEach((i) => e.add(i)), Array.from(e).join("; ");
}
const _ = /* @__PURE__ */ new WeakMap();
class xe {
  constructor(t, e = {}) {
    a(this, "player");
    this.player = w(O(t), e);
  }
  get element() {
    return this.player.element;
  }
  get wrapper() {
    return this.player.wrapper;
  }
  get options() {
    return this.player.options;
  }
  get adapter() {
    return this.player.adapter;
  }
  play() {
    return this.player.play();
  }
  pause() {
    return this.player.pause();
  }
  seek(t) {
    return this.player.seek(t);
  }
  setVolume(t) {
    return this.player.setVolume(t);
  }
  setMuted(t) {
    return this.player.setMuted(t);
  }
  setPlaybackRate(t) {
    return this.player.setPlaybackRate(t);
  }
  setSource(t) {
    return this.player.setSource(t);
  }
  getState() {
    return this.player.getState();
  }
  destroy() {
    this.player.destroy();
  }
  static init(t = {}) {
    return M(t);
  }
  static mount(t, e = {}) {
    return w(t, e);
  }
}
function Pe(s, t = {}) {
  return w(O(s), t);
}
function M(s = {}) {
  const t = s.selector ?? $, e = Array.from(document.querySelectorAll(t)).filter(
    (r) => r instanceof HTMLVideoElement || r instanceof HTMLIFrameElement
  ), i = [];
  for (const r of e)
    try {
      i.push(w(r, s));
    } catch (o) {
      console.warn("[fideo] Skipped an element that could not be mounted.", r, o);
    }
  return {
    players: i,
    destroy() {
      i.forEach((r) => r.destroy());
    }
  };
}
function w(s, t = {}) {
  const e = _.get(s);
  if (e) return e;
  t.injectStyles !== !1 && ge();
  const i = ie(s, t);
  if (i.disabledProviders.includes(i.provider))
    throw new Error(`Fideo provider "${i.provider}" is disabled via disabledProviders.`);
  const r = new _e(s, i, (o, n) => {
    _.get(o) === n && _.delete(o);
  });
  return _.set(s, r), r;
}
function O(s) {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (t instanceof HTMLVideoElement || t instanceof HTMLIFrameElement)
    return t;
  throw new Error("Fideo target must resolve to a <video> or <iframe> element.");
}
typeof window < "u" && (Object.assign(window, { Fideo: xe, createFideo: Pe, initFideo: M, mountFideo: w }), Me() || document.addEventListener("DOMContentLoaded", () => {
  const s = window.__fideoAutoInit || {};
  M(s);
}));
function Me() {
  return typeof document < "u" && document.currentScript == null;
}
export {
  xe as Fideo,
  Pe as createFideo,
  M as initFideo,
  w as mountFideo
};
//# sourceMappingURL=fideo.js.map
