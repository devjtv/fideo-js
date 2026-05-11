var z = Object.defineProperty;
var N = (s, t, e) => t in s ? z(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var n = (s, t, e) => N(s, typeof t != "symbol" ? t + "" : t, e);
class b extends EventTarget {
  constructor() {
    super(...arguments);
    n(this, "state", {
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
class H extends b {
  constructor(e) {
    super();
    n(this, "provider", "html5");
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
    this.element.volume = $(e);
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
  setPoster(e) {
    this.element.poster = e;
  }
  destroy() {
    this.element.pause();
  }
  bind() {
    const e = ["play", "pause", "timeupdate", "durationchange", "loadedmetadata", "volumechange", "ratechange", "ended"];
    for (const i of e)
      this.element.addEventListener(i, () => {
        this.syncFromElement(), this.dispatchEvent(new CustomEvent(i, { detail: this.getState() }));
      });
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
function $(s) {
  return Math.min(1, Math.max(0, s));
}
const T = {
  mobile: 767,
  tablet: 1024
}, R = /* @__PURE__ */ new Set(["", "true", "1", "yes", "on"]), F = /* @__PURE__ */ new Set(["false", "0", "no", "off"]), I = "[data-fideo]", f = {
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
  return R.has(e) ? !0 : F.has(e) ? !1 : t;
}
function v(s, t) {
  if (s == null || s.trim() === "") return t;
  const e = Number(s);
  return Number.isFinite(e) ? e : t;
}
function O(s, t) {
  if (typeof s == "number") return Number.isFinite(s) && s > 0 ? s : t;
  if (s == null || s.trim() === "") return t;
  const e = s.trim(), i = e.split(/[:/]/).map((r) => Number(r.trim()));
  if (i.length === 2 && i.every((r) => Number.isFinite(r) && r > 0))
    return i[0] / i[1];
  const a = Number(e);
  return Number.isFinite(a) && a > 0 ? a : t;
}
function U(s, t) {
  if (!s) return t;
  const e = s.split(",").map((i) => Number(i.trim())).filter((i) => Number.isFinite(i) && i > 0);
  return e.length ? e : t;
}
function j(s, t = {}) {
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
function Y(s, t) {
  if (!s) return t;
  const e = s.trim().toLowerCase();
  return F.has(e) || e === "none" ? !1 : e === "play" || e === "pause" || e === "play-pause" ? e : R.has(e) ? "play-pause" : t;
}
function D(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoSrcDesktop || t.fideoSrc || void 0,
    tablet: t.fideoSrcTablet || void 0,
    mobile: t.fideoSrcMobile || void 0
  };
}
function q(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoPosterDesktop || t.fideoPoster || void 0,
    tablet: t.fideoPosterTablet || void 0,
    mobile: t.fideoPosterMobile || void 0
  };
}
function W(s, t = {}) {
  var m, p;
  const e = s.dataset, i = {
    mobile: v(e.fideoBreakpointMobile, ((m = t.breakpoints) == null ? void 0 : m.mobile) ?? T.mobile),
    tablet: v(e.fideoBreakpointTablet, ((p = t.breakpoints) == null ? void 0 : p.tablet) ?? T.tablet)
  }, a = e.fideoProvider, r = t.provider ?? a ?? "auto", o = { ...D(s), ...t.sources }, l = r === "auto" ? j(s, o) : r, u = t.viewport ?? !1, d = c(e.fideoBackground, t.background ?? !1);
  return {
    selector: t.selector ?? I,
    provider: l,
    autoplay: d || c(e.fideoAutoplay, t.autoplay ?? !1),
    muted: d || c(e.fideoMuted, t.muted ?? !1),
    loop: d || c(e.fideoLoop, t.loop ?? !1),
    playsInline: d || c(e.fideoPlaysinline ?? e.fideoPlaysInline, t.playsInline ?? !0),
    controls: c(e.fideoControls, t.controls ?? !d),
    background: d,
    controlVisibility: G(s, t.controlVisibility),
    viewport: Y(e.fideoViewport, u),
    viewportThreshold: v(e.fideoViewportThreshold, t.viewportThreshold ?? 0.35),
    volume: v(e.fideoVolume, t.volume ?? 1),
    playbackRates: U(e.fideoPlaybackRates, t.playbackRates ?? [0.5, 1, 1.25, 1.5, 2]),
    backgroundAspectRatio: O(e.fideoBackgroundAspectRatio ?? t.backgroundAspectRatio, 16 / 9),
    sources: o,
    posters: { ...q(s), ...t.posters },
    breakpoints: i,
    icons: t.icons ?? {},
    className: e.fideoClass || t.className || "",
    cssVars: {
      ...J(s),
      ...t.cssVars ?? {}
    }
  };
}
function G(s, t = {}) {
  const e = s.dataset, i = c(e.fideoShowTime, !0);
  return {
    play: c(e.fideoShowPlay, t.play ?? f.play),
    timeline: c(e.fideoShowTimeline, t.timeline ?? f.timeline),
    currentTime: c(
      e.fideoShowCurrentTime,
      t.currentTime ?? i ?? f.currentTime
    ),
    duration: c(e.fideoShowDuration, t.duration ?? i ?? f.duration),
    volume: c(e.fideoShowVolume, t.volume ?? f.volume),
    settings: c(e.fideoShowSettings, t.settings ?? f.settings),
    fullscreen: c(e.fideoShowFullscreen, t.fullscreen ?? f.fullscreen)
  };
}
function J(s) {
  const t = {}, e = [
    ["--fideo-accent", s.dataset.fideoAccent],
    ["--fideo-control-bg", s.dataset.fideoControlBg],
    ["--fideo-control-color", s.dataset.fideoControlColor],
    ["--fideo-track", s.dataset.fideoTrack],
    ["--fideo-track-fill", s.dataset.fideoTrackFill],
    ["--fideo-radius", s.dataset.fideoRadius]
  ];
  for (const [i, a] of e)
    a && (t[i] = a);
  return t;
}
function P(s, t, e = window.innerWidth) {
  return e <= t.mobile ? s.mobile ?? s.tablet ?? s.desktop : e <= t.tablet ? s.tablet ?? s.desktop ?? s.mobile : s.desktop ?? s.tablet ?? s.mobile;
}
function g(s, t) {
  if (!s) return s;
  const e = new URL(s, window.location.href);
  for (const [i, a] of Object.entries(t))
    e.searchParams.set(i, String(a));
  return e.toString();
}
function M(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase();
  let i;
  if (e === "youtu.be")
    i = t.pathname.split("/").filter(Boolean)[0];
  else if (e === "youtube.com" || e === "youtube-nocookie.com") {
    const r = t.pathname.split("/").filter(Boolean);
    r[0] === "embed" && (i = r[1]), r[0] === "watch" && (i = t.searchParams.get("v") ?? void 0), r[0] === "shorts" && (i = r[1]);
  }
  if (!i)
    return t.hostname = "www.youtube-nocookie.com", t.toString();
  const a = new URL(`https://www.youtube-nocookie.com/embed/${i}`);
  return t.searchParams.forEach((r, o) => {
    o !== "v" && a.searchParams.set(o, r);
  }), a.toString();
}
function C(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase(), i = t.pathname.split("/").filter(Boolean);
  if (e === "player.vimeo.com" || e !== "vimeo.com" || !i[0])
    return t.toString();
  const [a, r] = i, o = new URL(`https://player.vimeo.com/video/${a}`);
  return t.searchParams.forEach((l, u) => o.searchParams.set(u, l)), r && !o.searchParams.has("h") && o.searchParams.set("h", r), o.toString();
}
function h(s, t) {
  const e = document.createElement(s);
  return t && (e.className = t), e;
}
function K(s, t = "fideo") {
  return s.id || (s.id = `${t}-${Math.random().toString(36).slice(2, 10)}`), s.id;
}
const V = /* @__PURE__ */ new Map();
function x(s) {
  const t = V.get(s);
  if (t) return t;
  const e = new Promise((i, a) => {
    const r = document.querySelector(`script[src="${s}"]`);
    if ((r == null ? void 0 : r.dataset.loaded) === "true") {
      i();
      return;
    }
    const o = r ?? document.createElement("script");
    o.src = s, o.async = !0, o.addEventListener("load", () => {
      o.dataset.loaded = "true", i();
    }), o.addEventListener("error", () => a(new Error(`Could not load ${s}`))), r || document.head.append(o);
  });
  return V.set(s, e), e;
}
class Z extends b {
  constructor(e, i) {
    super();
    n(this, "provider", "vimeo");
    n(this, "player");
    n(this, "ready");
    this.element = e, this.options = i, this.options.muted && (this.state.muted = !0);
    const a = {
      api: 1,
      controls: 0,
      playsinline: 1
    };
    this.options.autoplay && (a.autoplay = 1), this.options.muted && (a.muted = 1), this.options.loop && (a.loop = 1), this.options.background && (a.background = 1), this.element.src = g(C(this.element.src), a), this.ready = x("https://player.vimeo.com/api/player.js").then(() => (this.player = new window.Vimeo.Player(this.element), this.bind(), this.sync()));
  }
  async play() {
    var e;
    await this.ready, (e = this.player) == null || e.play();
  }
  async pause() {
    var e;
    await this.ready, (e = this.player) == null || e.pause();
  }
  async seek(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setCurrentTime(e)), await this.sync();
  }
  async setVolume(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setVolume(Q(e))), await this.sync();
  }
  async setMuted(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setMuted(e)), await this.sync();
  }
  async setPlaybackRate(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setPlaybackRate(e).catch(() => {
    })), await this.sync();
  }
  async setSource(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.loadVideo({ url: g(C(e), this.providerParams()) })), await this.sync();
  }
  destroy() {
    var e;
    (e = this.player) == null || e.destroy();
  }
  bind() {
    var i;
    const e = ["play", "pause", "ended", "volumechange", "durationchange", "playbackratechange"];
    for (const a of e)
      (i = this.player) == null || i.on(a, (r = {}) => {
        this.applyEvent(a, r), this.dispatchEvent(new CustomEvent(a, { detail: this.getState() }));
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
  async sync() {
    if (!this.player) return;
    const [e, i, a, r, o] = await Promise.all([
      this.player.getCurrentTime().catch(() => 0),
      this.player.getDuration().catch(() => 0),
      this.player.getVolume().catch(() => 1),
      this.player.getMuted().catch(() => !1),
      this.player.getPlaybackRate().catch(() => 1)
    ]);
    this.update({ currentTime: e, duration: i, volume: a, muted: r, playbackRate: o });
  }
  postMessage(e, i) {
    var r;
    const a = new URL(this.element.src, window.location.href).origin;
    (r = this.element.contentWindow) == null || r.postMessage(JSON.stringify({ method: e, value: i }), a);
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
function Q(s) {
  return Math.min(1, Math.max(0, s));
}
class X extends b {
  constructor(e) {
    super();
    n(this, "provider", "wistia");
    n(this, "video");
    n(this, "ready");
    n(this, "timer");
    this.element = e;
    const i = ee(e.src);
    this.ready = new Promise((a) => {
      window._wq = window._wq || [], window._wq.push({
        id: i || "_all",
        onReady: (r) => {
          this.video = r, this.bind(), this.sync(), a();
        }
      });
    }), x("https://fast.wistia.com/assets/external/E-v1.js").catch(() => {
    });
  }
  async play() {
    var e;
    await this.ready, (e = this.video) == null || e.play();
  }
  async pause() {
    var e;
    await this.ready, (e = this.video) == null || e.pause();
  }
  async seek(e) {
    var i;
    await this.ready, (i = this.video) == null || i.time(e), this.sync();
  }
  async setVolume(e) {
    var i;
    await this.ready, (i = this.video) == null || i.volume(te(e)), this.sync();
  }
  async setMuted(e) {
    var i, a;
    await this.ready, e ? (i = this.video) == null || i.mute() : (a = this.video) == null || a.unmute(), this.sync();
  }
  async setPlaybackRate(e) {
    var i, a;
    await this.ready, (a = (i = this.video) == null ? void 0 : i.playbackRate) == null || a.call(i, e), this.sync();
  }
  async setSource(e) {
    this.element.src = e;
  }
  destroy() {
    var e, i, a, r;
    this.timer && window.clearInterval(this.timer), (e = this.video) == null || e.unbind("play"), (i = this.video) == null || i.unbind("pause"), (a = this.video) == null || a.unbind("end"), (r = this.video) == null || r.pause();
  }
  bind() {
    var e, i, a;
    (e = this.video) == null || e.bind("play", () => {
      this.startTimer(), this.dispatchEvent(new CustomEvent("play", { detail: this.getState() }));
    }), (i = this.video) == null || i.bind("pause", () => {
      this.stopTimer(), this.dispatchEvent(new CustomEvent("pause", { detail: this.getState() }));
    }), (a = this.video) == null || a.bind("end", () => {
      this.stopTimer(), this.dispatchEvent(new CustomEvent("ended", { detail: this.getState() }));
    });
  }
  sync() {
    var e, i;
    this.video && this.update({
      currentTime: this.video.time() || 0,
      duration: this.video.duration() || 0,
      volume: this.video.volume(),
      muted: this.video.muted(),
      playbackRate: ((i = (e = this.video).playbackRate) == null ? void 0 : i.call(e)) || 1
    });
  }
  startTimer() {
    this.state.paused = !1, !this.timer && (this.timer = window.setInterval(() => this.sync(), 500));
  }
  stopTimer() {
    this.state.paused = !0, this.timer && window.clearInterval(this.timer), this.timer = void 0;
  }
}
function ee(s) {
  var t;
  return (t = s.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/)) == null ? void 0 : t[1];
}
function te(s) {
  return Math.min(1, Math.max(0, s));
}
let w;
class ie extends b {
  constructor(e, i) {
    super();
    n(this, "provider", "youtube");
    n(this, "player");
    n(this, "ready");
    n(this, "readyResolver");
    n(this, "timer");
    this.element = e, this.options = i, this.options.muted && (this.state.muted = !0);
    const a = M(this.element.src), r = {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      origin: window.location.origin
    };
    if (this.options.autoplay && (r.autoplay = 1), this.options.muted && (r.mute = 1), this.options.loop) {
      r.loop = 1;
      const l = B(a);
      l && (r.playlist = l);
    }
    this.element.src = g(a, r);
    const o = K(this.element, "fideo-youtube");
    this.ready = new Promise((l) => {
      this.readyResolver = l;
    }), se().then(() => {
      this.player = new window.YT.Player(o, {
        events: {
          onReady: () => {
            var l;
            this.sync(), (l = this.readyResolver) == null || l.call(this);
          },
          onStateChange: ({ data: l }) => this.handleStateChange(l)
        }
      });
    });
  }
  async play() {
    var e;
    await this.ready, (e = this.player) == null || e.playVideo();
  }
  async pause() {
    var e;
    await this.ready, (e = this.player) == null || e.pauseVideo();
  }
  async seek(e) {
    var i;
    await this.ready, (i = this.player) == null || i.seekTo(e, !0), this.sync();
  }
  async setVolume(e) {
    var i;
    await this.ready, (i = this.player) == null || i.setVolume(Math.round(ae(e) * 100)), this.sync();
  }
  async setMuted(e) {
    var i, a;
    await this.ready, e ? (i = this.player) == null || i.mute() : (a = this.player) == null || a.unMute(), this.sync();
  }
  async setPlaybackRate(e) {
    var i;
    await this.ready, (i = this.player) == null || i.setPlaybackRate(e), this.sync();
  }
  async setSource(e) {
    var o;
    await this.ready;
    const i = M(e), a = B(i), r = this.options.loop && a ? g(i, { loop: 1, playlist: a }) : i;
    (o = this.player) == null || o.loadVideoByUrl(r);
  }
  destroy() {
    var e;
    this.timer && window.clearInterval(this.timer), (e = this.player) == null || e.destroy();
  }
  handleStateChange(e) {
    this.sync(), e === 1 && (this.startTimer(), this.dispatchEvent(new CustomEvent("play", { detail: this.getState() }))), e === 2 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("pause", { detail: this.getState() }))), e === 0 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("ended", { detail: this.getState() })));
  }
  sync() {
    var a, r, o, l, u, d, m, p, L, S;
    if (!this.player) return;
    const e = ((r = (a = this.player).getDuration) == null ? void 0 : r.call(a)) || 0, i = this.state.paused;
    this.state = {
      currentTime: ((l = (o = this.player).getCurrentTime) == null ? void 0 : l.call(o)) || 0,
      duration: e,
      volume: (((d = (u = this.player).getVolume) == null ? void 0 : d.call(u)) ?? 100) / 100,
      muted: ((p = (m = this.player).isMuted) == null ? void 0 : p.call(m)) ?? !1,
      paused: i,
      playbackRate: ((S = (L = this.player).getPlaybackRate) == null ? void 0 : S.call(L)) || 1,
      buffered: 0
    };
  }
  startTimer() {
    this.state.paused = !1, !this.timer && (this.timer = window.setInterval(() => this.sync(), 500));
  }
  stopTimer() {
    this.state.paused = !0, this.timer && window.clearInterval(this.timer), this.timer = void 0;
  }
}
function se() {
  var s;
  return (s = window.YT) != null && s.Player ? Promise.resolve() : w || (w = new Promise((t, e) => {
    const i = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      i == null || i(), t();
    };
    const a = document.createElement("script");
    a.src = "https://www.youtube.com/iframe_api", a.async = !0, a.onerror = () => e(new Error("Could not load the YouTube IFrame API.")), document.head.append(a);
  }), w);
}
function ae(s) {
  return Math.min(1, Math.max(0, s));
}
function B(s) {
  if (!s) return;
  const e = new URL(s, window.location.href).pathname.split("/").filter(Boolean);
  return e[0] === "embed" ? e[1] : void 0;
}
function re(s, t, e) {
  if (s === "html5") {
    if (!(t instanceof HTMLVideoElement))
      throw new Error("Fideo html5 provider needs a <video> element.");
    return new H(t);
  }
  if (!(t instanceof HTMLIFrameElement))
    throw new Error(`Fideo ${s} provider needs an <iframe> element.`);
  return s === "youtube" ? new ie(t, e) : s === "vimeo" ? new Z(t, e) : new X(t);
}
const ne = {
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/></svg>',
  volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  volumeLow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  muted: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/><path d="M16 10l4 4m0 -4l-4 4"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6"/></svg>',
  fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2 -2v-2"/></svg>',
  fullscreenExit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2c0 -.551 .223 -1.05 .584 -1.412"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2c.545 0 1.04 -.218 1.4 -.572"/><path d="M3 3l18 18"/></svg>'
};
class oe {
  constructor(t, e, i) {
    n(this, "element");
    n(this, "playButton");
    n(this, "muteButton");
    n(this, "track");
    n(this, "volume");
    n(this, "currentTime");
    n(this, "duration");
    n(this, "fullscreenButton");
    n(this, "speedMenu");
    n(this, "volumeGroup");
    n(this, "volumePanel");
    n(this, "seeking", !1);
    n(this, "icons");
    n(this, "handleFullscreenChange", () => this.renderFullscreenState());
    this.adapter = t, this.wrapper = e, this.icons = { ...ne, ...i.icons }, this.element = h("div", "fideo__controls"), this.playButton = this.button("fideo__button fideo__play", "Play", this.icons.play), this.muteButton = this.button("fideo__button fideo__mute", "Mute", this.icons.volume), this.track = this.range("fideo__track", 0, 1e3, 1), this.volume = this.range("fideo__volume", 0, 1, 0.01), this.currentTime = h("span", "fideo__time"), this.duration = h("span", "fideo__time"), this.speedMenu = this.createSpeedMenu(i.playbackRates), this.fullscreenButton = this.button("fideo__button", "Fullscreen", this.icons.fullscreen);
    const a = this.button("fideo__button fideo__settings-toggle", "Settings", this.icons.settings), r = h("div", "fideo__timeline");
    r.append(this.track);
    const o = h("span", "fideo__time-group"), l = h("span", "fideo__time-separator");
    l.textContent = "/", o.append(this.currentTime, l, this.duration), this.volumeGroup = h("div", "fideo__volume-group"), this.volumePanel = h("div", "fideo__volume-panel"), this.volumePanel.append(this.volume), this.volumeGroup.append(this.muteButton, this.volumePanel);
    const u = h("div", "fideo__settings");
    u.append(a, this.speedMenu);
    const d = h("div", "fideo__control-row"), m = h("span", "fideo__spacer");
    i.controlVisibility.play && d.append(this.playButton), (i.controlVisibility.currentTime || i.controlVisibility.duration) && d.append(o), d.append(m), i.controlVisibility.volume && d.append(this.volumeGroup), i.controlVisibility.settings && d.append(u), i.controlVisibility.fullscreen && d.append(this.fullscreenButton), this.element.append(d), i.controlVisibility.timeline && this.element.append(r), this.wrapper.append(this.element), i.controlVisibility.currentTime || this.currentTime.remove(), i.controlVisibility.duration || this.duration.remove(), (!i.controlVisibility.currentTime || !i.controlVisibility.duration) && l.remove(), this.playButton.addEventListener("click", () => this.togglePlay()), this.muteButton.addEventListener("click", () => this.toggleMute()), this.volume.addEventListener("input", () => this.changeVolume()), this.track.addEventListener("pointerdown", () => {
      this.seeking = !0, this.syncPlaybackState(this.adapter.getState(), !0);
    }), this.track.addEventListener("input", () => this.previewSeek()), this.track.addEventListener("change", () => this.commitSeek()), this.track.addEventListener("pointerup", () => {
      this.seeking = !1;
    }), a.addEventListener("click", () => {
      this.wrapper.classList.add("is-user-active"), u.classList.toggle("is-open");
    }), this.fullscreenButton.addEventListener("click", () => {
      this.wrapper.classList.add("is-user-active"), this.toggleFullscreen();
    }), document.addEventListener("fullscreenchange", this.handleFullscreenChange), this.adapter.addEventListener("play", () => this.syncPlayState(this.adapter.getState())), this.adapter.addEventListener("pause", () => this.syncPlayState(this.adapter.getState())), this.adapter.addEventListener("ended", () => this.syncPlayState(this.adapter.getState())), this.adapter.addEventListener("volumechange", () => this.syncVolumeState(this.adapter.getState())), this.adapter.addEventListener("durationchange", () => this.syncPlaybackState(this.adapter.getState(), !0)), this.adapter.addEventListener("timeupdate", () => this.syncPlaybackState(this.adapter.getState())), this.adapter.addEventListener("change", () => this.syncPlaybackState(this.adapter.getState()));
    const p = this.adapter.getState();
    this.syncPlayState(p), this.syncVolumeState(p), this.syncPlaybackState(p, !0), this.renderFullscreenState();
  }
  destroy() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange), this.element.remove();
  }
  button(t, e, i) {
    const a = document.createElement("button");
    return a.className = t, a.type = "button", a.ariaLabel = e, a.title = e, a.innerHTML = i, a;
  }
  range(t, e, i, a) {
    const r = document.createElement("input");
    return r.className = t, r.type = "range", r.min = String(e), r.max = String(i), r.step = String(a), r;
  }
  createSpeedMenu(t) {
    const e = h("div", "fideo__settings-menu");
    for (const i of t) {
      const a = this.button("fideo__speed", `${i}x`, "");
      a.textContent = `${i}x`, a.addEventListener("click", () => {
        var r;
        this.wrapper.classList.add("is-user-active"), this.adapter.setPlaybackRate(i).catch(() => {
        }), (r = e.parentElement) == null || r.classList.remove("is-open");
      }), e.append(a);
    }
    return e;
  }
  togglePlay() {
    this.wrapper.classList.add("is-user-active"), this.adapter.getState().paused ? this.adapter.play().catch(() => {
    }) : this.adapter.pause().catch(() => {
    });
  }
  toggleMute() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState();
    this.adapter.setMuted(!t.muted).catch(() => {
    });
  }
  changeVolume() {
    this.wrapper.classList.add("is-user-active");
    const t = Number(this.volume.value);
    t > 0 && this.adapter.setMuted(!1).catch(() => {
    }), this.adapter.setVolume(t).catch(() => {
    });
  }
  previewSeek() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState();
    t.duration && (this.currentTime.textContent = k(Number(this.track.value) / 1e3 * t.duration));
  }
  commitSeek() {
    this.wrapper.classList.add("is-user-active");
    const t = this.adapter.getState();
    this.seeking = !1, t.duration && this.adapter.seek(Number(this.track.value) / 1e3 * t.duration).catch(() => {
    });
  }
  toggleFullscreen() {
    var t, e;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    (e = (t = this.wrapper).requestFullscreen) == null || e.call(t);
  }
  syncPlayState(t) {
    const e = t.paused ? this.icons.play : this.icons.pause, i = t.paused ? "Play" : "Pause";
    this.playButton.innerHTML !== e && (this.playButton.innerHTML = e), this.playButton.ariaLabel !== i && (this.playButton.ariaLabel = i), this.playButton.title !== i && (this.playButton.title = i);
  }
  syncVolumeState(t) {
    this.volume.value = String(t.muted ? 0 : t.volume), this.volume.style.setProperty("--fideo-progress", `${Number(this.volume.value) * 100}%`);
    let e = t.muted || t.volume === 0 ? this.icons.muted : this.icons.volume;
    !t.muted && t.volume > 0 && t.volume <= 0.5 && (e = this.icons.volumeLow);
    const i = t.muted || t.volume === 0 ? "Unmute" : "Mute";
    this.muteButton.innerHTML !== e && (this.muteButton.innerHTML = e), this.muteButton.ariaLabel !== i && (this.muteButton.ariaLabel = i), this.muteButton.title !== i && (this.muteButton.title = i);
  }
  syncPlaybackState(t, e = !1) {
    !e && this.seeking || (this.currentTime.textContent = k(t.currentTime), this.duration.textContent = k(t.duration), this.track.value = t.duration ? String(t.currentTime / t.duration * 1e3) : "0", this.track.style.setProperty("--fideo-progress", `${Number(this.track.value) / 10}%`));
  }
  renderFullscreenState() {
    const t = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = t ? this.icons.fullscreenExit : this.icons.fullscreen, this.fullscreenButton.ariaLabel = t ? "Exit fullscreen" : "Fullscreen", this.fullscreenButton.title = t ? "Exit fullscreen" : "Fullscreen";
  }
}
function k(s) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const t = Math.floor(s), e = Math.floor(t / 60), i = t % 60;
  return `${e}:${String(i).padStart(2, "0")}`;
}
class le {
  constructor(t, e) {
    n(this, "element");
    n(this, "wrapper");
    n(this, "options");
    n(this, "adapter");
    n(this, "controls");
    n(this, "observer");
    n(this, "currentSource");
    n(this, "resizeController", new AbortController());
    n(this, "activityTimer");
    n(this, "resizeObserver");
    n(this, "posterImage");
    n(this, "handleFullscreenChange", () => {
      const t = document.fullscreenElement === this.wrapper;
      this.wrapper.classList.toggle("is-fullscreen", t), this.options.background && this.applyBackgroundCover();
    });
    this.element = t, this.options = e, this.wrapper = this.wrapElement(t, e), this.configureElement(), this.adapter = re(e.provider, t, e), this.applyResponsiveMedia(), e.controls && (this.controls = new oe(this.adapter, this.wrapper, e)), this.bindAdapterEvents(), this.bindClickToToggle(), this.bindResponsiveMedia(), this.bindBackgroundCover(), this.bindViewportPlayback(), document.addEventListener("fullscreenchange", this.handleFullscreenChange), this.adapter.setVolume(e.volume), this.adapter.setMuted(e.muted), e.autoplay && this.play().catch(() => {
    });
  }
  play() {
    return this.adapter.play();
  }
  pause() {
    return this.adapter.pause();
  }
  destroy() {
    var t, e, i, a;
    (t = this.observer) == null || t.disconnect(), (e = this.resizeObserver) == null || e.disconnect(), this.resizeController.abort(), (i = this.controls) == null || i.destroy(), this.adapter.destroy(), document.removeEventListener("fullscreenchange", this.handleFullscreenChange), this.activityTimer && window.clearTimeout(this.activityTimer), this.wrapper.classList.remove("is-ready"), this.wrapper.classList.remove("has-poster", "is-poster-visible"), this.element.removeAttribute("data-fideo-ready"), (a = this.posterImage) == null || a.remove();
  }
  wrapElement(t, e) {
    var a;
    if ((a = t.parentElement) != null && a.classList.contains("fideo"))
      return t.parentElement;
    const i = document.createElement("div");
    return i.className = ["fideo", e.className].filter(Boolean).join(" "), t.before(i), i.append(t), i;
  }
  configureElement() {
    this.wrapper.classList.add(`fideo--${this.options.provider}`), this.options.background && this.wrapper.classList.add("fideo--background"), this.wrapper.classList.add("is-ready"), this.wrapper.classList.add("is-paused"), this.element.classList.add("fideo__media"), this.element.setAttribute("data-fideo-ready", "true");
    for (const [t, e] of Object.entries(this.options.cssVars))
      this.wrapper.style.setProperty(t, e);
    this.element instanceof HTMLVideoElement ? (this.element.controls = !1, this.element.loop = this.options.loop, this.element.muted = this.options.muted, this.element.playsInline = this.options.playsInline, this.element.setAttribute("playsinline", "")) : (this.element.allow = de(this.element.allow, ["autoplay", "fullscreen", "picture-in-picture", "encrypted-media"]), this.element.setAttribute("allowfullscreen", ""));
  }
  bindAdapterEvents() {
    const t = ["play", "pause", "ended", "volumechange", "change"];
    for (const e of t)
      this.adapter.addEventListener(e, () => {
        this.syncPosterVisibility(), this.syncPlaybackClasses(), this.element.dispatchEvent(
          new CustomEvent(`fideo:${e}`, {
            bubbles: !0,
            detail: {
              player: this,
              state: this.adapter.getState()
            }
          })
        );
      });
  }
  bindClickToToggle() {
    if (!this.options.controls) return;
    const t = document.createElement("button");
    t.className = "fideo__click-target", t.type = "button", t.ariaLabel = "Play or pause video", this.wrapper.prepend(t), t.addEventListener("click", () => {
      const e = this.adapter.getState();
      this.activateControls(), e.paused ? this.play().catch(() => {
      }) : this.pause().catch(() => {
      });
    }), this.wrapper.addEventListener("pointermove", () => this.activateControls(), { passive: !0 }), this.wrapper.addEventListener("pointerleave", () => this.clearActivity(), { passive: !0 });
  }
  syncPlaybackClasses() {
    const t = this.adapter.getState().paused;
    this.wrapper.classList.toggle("is-playing", !t), this.wrapper.classList.toggle("is-paused", t), this.wrapper.classList.toggle("has-click-target", t), t && this.activateControls(0);
  }
  activateControls(t = 1800) {
    this.wrapper.classList.add("is-user-active"), this.activityTimer && window.clearTimeout(this.activityTimer), !(!t || this.adapter.getState().paused) && (this.activityTimer = window.setTimeout(() => {
      this.wrapper.classList.remove("is-user-active");
    }, t));
  }
  clearActivity() {
    this.activityTimer && window.clearTimeout(this.activityTimer), this.adapter.getState().paused || this.wrapper.classList.remove("is-user-active");
  }
  bindResponsiveMedia() {
    window.addEventListener("resize", () => this.applyResponsiveMedia(), {
      passive: !0,
      signal: this.resizeController.signal
    }), window.addEventListener("orientationchange", () => this.applyResponsiveMedia(), {
      passive: !0,
      signal: this.resizeController.signal
    }), window.addEventListener("resize", () => this.applyBackgroundCover(), {
      passive: !0,
      signal: this.resizeController.signal
    }), window.addEventListener("orientationchange", () => this.applyBackgroundCover(), {
      passive: !0,
      signal: this.resizeController.signal
    });
  }
  applyResponsiveMedia() {
    const t = P(this.options.posters, this.options.breakpoints);
    this.adapter.setPoster && this.adapter.setPoster(t ?? ""), this.applyPosterOverlay(t);
    const e = P(this.options.sources, this.options.breakpoints);
    e && e !== this.currentSource && (this.currentSource = e, this.syncPosterVisibility(), this.adapter.setSource(e));
  }
  bindViewportPlayback() {
    !this.options.viewport || !("IntersectionObserver" in window) || (this.observer = new IntersectionObserver(
      ([t]) => {
        const e = t.isIntersecting && t.intersectionRatio >= this.options.viewportThreshold;
        e && (this.options.viewport === "play" || this.options.viewport === "play-pause") && this.play().catch(() => {
        }), !e && (this.options.viewport === "pause" || this.options.viewport === "play-pause") && this.pause().catch(() => {
        });
      },
      {
        threshold: [0, this.options.viewportThreshold, 1]
      }
    ), this.observer.observe(this.wrapper));
  }
  bindBackgroundCover() {
    this.options.background && (this.applyBackgroundCover(), "ResizeObserver" in window && (this.resizeObserver = new ResizeObserver(() => this.applyBackgroundCover()), this.resizeObserver.observe(this.wrapper)));
  }
  applyBackgroundCover() {
    if (document.fullscreenElement === this.wrapper) {
      this.element.style.width = "", this.element.style.height = "", this.element.style.left = "", this.element.style.top = "";
      return;
    }
    if (!this.options.background || this.element instanceof HTMLVideoElement) return;
    const e = this.wrapper.clientWidth, i = this.wrapper.clientHeight;
    if (!e || !i) return;
    const a = e / i, r = this.options.backgroundAspectRatio;
    let o = e, l = i;
    a > r ? l = e / r : o = i * r, this.element.style.width = `${o}px`, this.element.style.height = `${l}px`, this.element.style.left = `${(e - o) / 2}px`, this.element.style.top = `${(i - l) / 2}px`;
  }
  applyPosterOverlay(t) {
    var i;
    if (!t) {
      (i = this.posterImage) == null || i.remove(), this.posterImage = void 0, this.wrapper.classList.remove("has-poster", "is-poster-visible");
      return;
    }
    const e = this.ensurePosterImage();
    e.src !== t && (e.src = t), this.wrapper.classList.add("has-poster"), this.syncPosterVisibility();
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
function de(s, t) {
  const e = new Set(
    (s ?? "").split(";").map((i) => i.trim()).filter(Boolean)
  );
  return t.forEach((i) => e.add(i)), Array.from(e).join("; ");
}
const _ = /* @__PURE__ */ new WeakMap();
class ce {
  constructor(t, e = {}) {
    n(this, "player");
    this.player = y(A(t), e);
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
  play() {
    return this.player.play();
  }
  pause() {
    return this.player.pause();
  }
  destroy() {
    this.player.destroy();
  }
  static init(t = {}) {
    return E(t);
  }
  static mount(t, e = {}) {
    return y(t, e);
  }
}
function he(s, t = {}) {
  return y(A(s), t);
}
function E(s = {}) {
  const t = s.selector ?? I, i = Array.from(document.querySelectorAll(t)).filter(
    (a) => a instanceof HTMLVideoElement || a instanceof HTMLIFrameElement
  ).map((a) => y(a, s));
  return {
    players: i,
    destroy() {
      i.forEach((a) => a.destroy());
    }
  };
}
function y(s, t = {}) {
  const e = _.get(s);
  if (e) return e;
  const i = W(s, t), a = new le(s, i);
  return _.set(s, a), a;
}
function A(s) {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (t instanceof HTMLVideoElement || t instanceof HTMLIFrameElement)
    return t;
  throw new Error("Fideo target must resolve to a <video> or <iframe> element.");
}
typeof window < "u" && (Object.assign(window, { Fideo: ce, createFideo: he, initFideo: E, mountFideo: y }), document.addEventListener("DOMContentLoaded", () => {
  E();
}));
export {
  ce as Fideo,
  he as createFideo,
  E as initFideo,
  y as mountFideo
};
//# sourceMappingURL=fideo.js.map
