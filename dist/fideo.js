var A = Object.defineProperty;
var z = (s, t, e) => t in s ? A(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var n = (s, t, e) => z(s, typeof t != "symbol" ? t + "" : t, e);
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
    this.state = { ...this.state, ...e }, this.dispatchEvent(new CustomEvent(i, { detail: this.getState() })), this.dispatchEvent(new CustomEvent("change", { detail: this.getState() }));
  }
}
class N extends b {
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
    this.element.volume = H(e);
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
    const e = ["play", "pause", "timeupdate", "durationchange", "loadedmetadata", "volumechange", "ratechange", "progress", "ended"];
    for (const i of e)
      this.element.addEventListener(i, () => {
        this.syncFromElement(), this.dispatchEvent(new CustomEvent(i, { detail: this.getState() })), this.dispatchEvent(new CustomEvent("change", { detail: this.getState() }));
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
function H(s) {
  return Math.min(1, Math.max(0, s));
}
const M = {
  mobile: 767,
  tablet: 1024
}, R = /* @__PURE__ */ new Set(["", "true", "1", "yes", "on"]), B = /* @__PURE__ */ new Set(["false", "0", "no", "off"]), I = "[data-fideo]", m = {
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
  return R.has(e) ? !0 : B.has(e) ? !1 : t;
}
function y(s, t) {
  if (s == null || s.trim() === "") return t;
  const e = Number(s);
  return Number.isFinite(e) ? e : t;
}
function $(s, t) {
  if (typeof s == "number") return Number.isFinite(s) && s > 0 ? s : t;
  if (s == null || s.trim() === "") return t;
  const e = s.trim(), i = e.split(/[:/]/).map((a) => Number(a.trim()));
  if (i.length === 2 && i.every((a) => Number.isFinite(a) && a > 0))
    return i[0] / i[1];
  const r = Number(e);
  return Number.isFinite(r) && r > 0 ? r : t;
}
function O(s, t) {
  if (!s) return t;
  const e = s.split(",").map((i) => Number(i.trim())).filter((i) => Number.isFinite(i) && i > 0);
  return e.length ? e : t;
}
function U(s, t = {}) {
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
function j(s, t) {
  if (!s) return t;
  const e = s.trim().toLowerCase();
  return B.has(e) || e === "none" ? !1 : e === "play" || e === "pause" || e === "play-pause" ? e : R.has(e) ? "play-pause" : t;
}
function Y(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoSrcDesktop || t.fideoSrc || void 0,
    tablet: t.fideoSrcTablet || void 0,
    mobile: t.fideoSrcMobile || void 0
  };
}
function D(s) {
  const t = s.dataset;
  return {
    desktop: t.fideoPosterDesktop || t.fideoPoster || void 0,
    tablet: t.fideoPosterTablet || void 0,
    mobile: t.fideoPosterMobile || void 0
  };
}
function q(s, t = {}) {
  var p, f;
  const e = s.dataset, i = {
    mobile: y(e.fideoBreakpointMobile, ((p = t.breakpoints) == null ? void 0 : p.mobile) ?? M.mobile),
    tablet: y(e.fideoBreakpointTablet, ((f = t.breakpoints) == null ? void 0 : f.tablet) ?? M.tablet)
  }, r = e.fideoProvider, a = t.provider ?? r ?? "auto", o = { ...Y(s), ...t.sources }, l = a === "auto" ? U(s, o) : a, h = t.viewport ?? !1, d = c(e.fideoBackground, t.background ?? !1);
  return {
    selector: t.selector ?? I,
    provider: l,
    autoplay: d || c(e.fideoAutoplay, t.autoplay ?? !1),
    muted: d || c(e.fideoMuted, t.muted ?? !1),
    loop: d || c(e.fideoLoop, t.loop ?? !1),
    playsInline: d || c(e.fideoPlaysinline ?? e.fideoPlaysInline, t.playsInline ?? !0),
    controls: d ? !1 : c(e.fideoControls, t.controls ?? !0),
    background: d,
    controlVisibility: G(s, t.controlVisibility),
    viewport: j(e.fideoViewport, h),
    viewportThreshold: y(e.fideoViewportThreshold, t.viewportThreshold ?? 0.35),
    volume: y(e.fideoVolume, t.volume ?? 1),
    playbackRates: O(e.fideoPlaybackRates, t.playbackRates ?? [0.5, 1, 1.25, 1.5, 2]),
    backgroundAspectRatio: $(e.fideoBackgroundAspectRatio ?? t.backgroundAspectRatio, 16 / 9),
    sources: o,
    posters: { ...D(s), ...t.posters },
    breakpoints: i,
    icons: t.icons ?? {},
    className: e.fideoClass || t.className || "",
    cssVars: {
      ...W(s),
      ...t.cssVars ?? {}
    }
  };
}
function G(s, t = {}) {
  const e = s.dataset, i = c(e.fideoShowTime, !0);
  return {
    play: c(e.fideoShowPlay, t.play ?? m.play),
    timeline: c(e.fideoShowTimeline, t.timeline ?? m.timeline),
    currentTime: c(
      e.fideoShowCurrentTime,
      t.currentTime ?? i ?? m.currentTime
    ),
    duration: c(e.fideoShowDuration, t.duration ?? i ?? m.duration),
    volume: c(e.fideoShowVolume, t.volume ?? m.volume),
    settings: c(e.fideoShowSettings, t.settings ?? m.settings),
    fullscreen: c(e.fideoShowFullscreen, t.fullscreen ?? m.fullscreen)
  };
}
function W(s) {
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
function S(s, t, e = window.innerWidth) {
  return e <= t.mobile ? s.mobile ?? s.tablet ?? s.desktop : e <= t.tablet ? s.tablet ?? s.desktop ?? s.mobile : s.desktop ?? s.tablet ?? s.mobile;
}
function g(s, t) {
  if (!s) return s;
  const e = new URL(s, window.location.href);
  for (const [i, r] of Object.entries(t))
    e.searchParams.set(i, String(r));
  return e.toString();
}
function L(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase();
  let i;
  if (e === "youtu.be")
    i = t.pathname.split("/").filter(Boolean)[0];
  else if (e === "youtube.com" || e === "youtube-nocookie.com") {
    const a = t.pathname.split("/").filter(Boolean);
    a[0] === "embed" && (i = a[1]), a[0] === "watch" && (i = t.searchParams.get("v") ?? void 0), a[0] === "shorts" && (i = a[1]);
  }
  if (!i)
    return t.hostname = "www.youtube-nocookie.com", t.toString();
  const r = new URL(`https://www.youtube-nocookie.com/embed/${i}`);
  return t.searchParams.forEach((a, o) => {
    o !== "v" && r.searchParams.set(o, a);
  }), r.toString();
}
function P(s) {
  if (!s) return s;
  const t = new URL(s, window.location.href), e = t.hostname.replace(/^www\./, "").toLowerCase(), i = t.pathname.split("/").filter(Boolean);
  if (e === "player.vimeo.com" || e !== "vimeo.com" || !i[0])
    return t.toString();
  const [r, a] = i, o = new URL(`https://player.vimeo.com/video/${r}`);
  return t.searchParams.forEach((l, h) => o.searchParams.set(h, l)), a && !o.searchParams.has("h") && o.searchParams.set("h", a), o.toString();
}
function u(s, t) {
  const e = document.createElement(s);
  return t && (e.className = t), e;
}
function J(s, t = "fideo") {
  return s.id || (s.id = `${t}-${Math.random().toString(36).slice(2, 10)}`), s.id;
}
const C = /* @__PURE__ */ new Map();
function x(s) {
  const t = C.get(s);
  if (t) return t;
  const e = new Promise((i, r) => {
    const a = document.querySelector(`script[src="${s}"]`);
    if ((a == null ? void 0 : a.dataset.loaded) === "true") {
      i();
      return;
    }
    const o = a ?? document.createElement("script");
    o.src = s, o.async = !0, o.addEventListener("load", () => {
      o.dataset.loaded = "true", i();
    }), o.addEventListener("error", () => r(new Error(`Could not load ${s}`))), a || document.head.append(o);
  });
  return C.set(s, e), e;
}
class K extends b {
  constructor(e, i) {
    super();
    n(this, "provider", "vimeo");
    n(this, "player");
    n(this, "ready");
    this.element = e, this.options = i;
    const r = {
      api: 1,
      controls: 0,
      playsinline: 1
    };
    this.options.autoplay && (r.autoplay = 1), this.options.muted && (r.muted = 1), this.options.loop && (r.loop = 1), this.options.background && (r.background = 1), this.element.src = g(P(this.element.src), r), this.ready = x("https://player.vimeo.com/api/player.js").then(() => (this.player = new window.Vimeo.Player(this.element), this.bind(), this.sync()));
  }
  async play() {
    this.postMessage("play"), this.update({ paused: !1 }, "play"), this.ready.then(() => {
      var e;
      return (e = this.player) == null ? void 0 : e.play();
    }).catch(() => {
    });
  }
  async pause() {
    this.postMessage("pause"), this.update({ paused: !0 }, "pause"), this.ready.then(() => {
      var e;
      return (e = this.player) == null ? void 0 : e.pause();
    }).catch(() => {
    });
  }
  async seek(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setCurrentTime(e)), await this.sync();
  }
  async setVolume(e) {
    var i;
    await this.ready, await ((i = this.player) == null ? void 0 : i.setVolume(Z(e))), await this.sync();
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
    await this.ready, await ((i = this.player) == null ? void 0 : i.loadVideo({ url: g(P(e), this.providerParams()) })), await this.sync();
  }
  destroy() {
    var e;
    (e = this.player) == null || e.destroy();
  }
  bind() {
    var i;
    const e = ["play", "pause", "ended", "timeupdate", "volumechange", "durationchange", "playbackratechange"];
    for (const r of e)
      (i = this.player) == null || i.on(r, (a = {}) => {
        this.applyEvent(r, a), this.dispatchEvent(new CustomEvent(r, { detail: this.getState() })), this.dispatchEvent(new CustomEvent("change", { detail: this.getState() }));
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
    const [e, i, r, a, o] = await Promise.all([
      this.player.getCurrentTime().catch(() => 0),
      this.player.getDuration().catch(() => 0),
      this.player.getVolume().catch(() => 1),
      this.player.getMuted().catch(() => !1),
      this.player.getPlaybackRate().catch(() => 1)
    ]);
    this.update({ currentTime: e, duration: i, volume: r, muted: a, playbackRate: o });
  }
  postMessage(e, i) {
    var a;
    const r = new URL(this.element.src, window.location.href).origin;
    (a = this.element.contentWindow) == null || a.postMessage(JSON.stringify({ method: e, value: i }), r);
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
function Z(s) {
  return Math.min(1, Math.max(0, s));
}
class Q extends b {
  constructor(e) {
    super();
    n(this, "provider", "wistia");
    n(this, "video");
    n(this, "ready");
    n(this, "timer");
    this.element = e;
    const i = X(e.src);
    this.ready = new Promise((r) => {
      window._wq = window._wq || [], window._wq.push({
        id: i || "_all",
        onReady: (a) => {
          this.video = a, this.bind(), this.sync(), r();
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
    await this.ready, (i = this.video) == null || i.volume(ee(e)), this.sync();
  }
  async setMuted(e) {
    var i, r;
    await this.ready, e ? (i = this.video) == null || i.mute() : (r = this.video) == null || r.unmute(), this.sync();
  }
  async setPlaybackRate(e) {
    var i, r;
    await this.ready, (r = (i = this.video) == null ? void 0 : i.playbackRate) == null || r.call(i, e), this.sync();
  }
  async setSource(e) {
    this.element.src = e;
  }
  destroy() {
    var e, i, r, a;
    this.timer && window.clearInterval(this.timer), (e = this.video) == null || e.unbind("play"), (i = this.video) == null || i.unbind("pause"), (r = this.video) == null || r.unbind("end"), (a = this.video) == null || a.pause();
  }
  bind() {
    var e, i, r;
    (e = this.video) == null || e.bind("play", () => {
      this.startTimer(), this.dispatchEvent(new CustomEvent("play", { detail: this.getState() }));
    }), (i = this.video) == null || i.bind("pause", () => {
      this.stopTimer(), this.dispatchEvent(new CustomEvent("pause", { detail: this.getState() }));
    }), (r = this.video) == null || r.bind("end", () => {
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
function X(s) {
  var t;
  return (t = s.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/)) == null ? void 0 : t[1];
}
function ee(s) {
  return Math.min(1, Math.max(0, s));
}
let w;
class te extends b {
  constructor(e, i) {
    super();
    n(this, "provider", "youtube");
    n(this, "player");
    n(this, "ready");
    n(this, "readyResolver");
    n(this, "timer");
    this.element = e, this.options = i;
    const r = L(this.element.src), a = {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      origin: window.location.origin
    };
    if (this.options.autoplay && (a.autoplay = 1), this.options.muted && (a.mute = 1), this.options.loop) {
      a.loop = 1;
      const l = _(r);
      l && (a.playlist = l);
    }
    this.element.src = g(r, a);
    const o = J(this.element, "fideo-youtube");
    this.ready = new Promise((l) => {
      this.readyResolver = l;
    }), ie().then(() => {
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
    await this.ready, (i = this.player) == null || i.setVolume(Math.round(se(e) * 100)), this.sync();
  }
  async setMuted(e) {
    var i, r;
    await this.ready, e ? (i = this.player) == null || i.mute() : (r = this.player) == null || r.unMute(), this.sync();
  }
  async setPlaybackRate(e) {
    var i;
    await this.ready, (i = this.player) == null || i.setPlaybackRate(e), this.sync();
  }
  async setSource(e) {
    var o;
    await this.ready;
    const i = L(e), r = _(i), a = this.options.loop && r ? g(i, { loop: 1, playlist: r }) : i;
    (o = this.player) == null || o.loadVideoByUrl(a);
  }
  destroy() {
    var e;
    this.timer && window.clearInterval(this.timer), (e = this.player) == null || e.destroy();
  }
  handleStateChange(e) {
    this.sync(), e === 1 && (this.startTimer(), this.dispatchEvent(new CustomEvent("play", { detail: this.getState() }))), e === 2 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("pause", { detail: this.getState() }))), e === 0 && (this.stopTimer(), this.dispatchEvent(new CustomEvent("ended", { detail: this.getState() }))), this.dispatchEvent(new CustomEvent("change", { detail: this.getState() }));
  }
  sync() {
    var i, r, a, o, l, h, d, p, f, T;
    if (!this.player) return;
    const e = ((r = (i = this.player).getDuration) == null ? void 0 : r.call(i)) || 0;
    this.state = {
      currentTime: ((o = (a = this.player).getCurrentTime) == null ? void 0 : o.call(a)) || 0,
      duration: e,
      volume: (((h = (l = this.player).getVolume) == null ? void 0 : h.call(l)) ?? 100) / 100,
      muted: ((p = (d = this.player).isMuted) == null ? void 0 : p.call(d)) ?? !1,
      paused: this.state.paused,
      playbackRate: ((T = (f = this.player).getPlaybackRate) == null ? void 0 : T.call(f)) || 1,
      buffered: 0
    }, this.dispatchEvent(new CustomEvent("change", { detail: this.getState() }));
  }
  startTimer() {
    this.state.paused = !1, !this.timer && (this.timer = window.setInterval(() => this.sync(), 500));
  }
  stopTimer() {
    this.state.paused = !0, this.timer && window.clearInterval(this.timer), this.timer = void 0;
  }
}
function ie() {
  var s;
  return (s = window.YT) != null && s.Player ? Promise.resolve() : w || (w = new Promise((t, e) => {
    const i = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      i == null || i(), t();
    };
    const r = document.createElement("script");
    r.src = "https://www.youtube.com/iframe_api", r.async = !0, r.onerror = () => e(new Error("Could not load the YouTube IFrame API.")), document.head.append(r);
  }), w);
}
function se(s) {
  return Math.min(1, Math.max(0, s));
}
function _(s) {
  if (!s) return;
  const e = new URL(s, window.location.href).pathname.split("/").filter(Boolean);
  return e[0] === "embed" ? e[1] : void 0;
}
function re(s, t, e) {
  if (s === "html5") {
    if (!(t instanceof HTMLVideoElement))
      throw new Error("Fideo html5 provider needs a <video> element.");
    return new N(t);
  }
  if (!(t instanceof HTMLIFrameElement))
    throw new Error(`Fideo ${s} provider needs an <iframe> element.`);
  return s === "youtube" ? new te(t, e) : s === "vimeo" ? new K(t, e) : new Q(t);
}
const ae = {
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"/></svg>',
  pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"/></svg>',
  volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  volumeLow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg>',
  muted: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/><path d="M16 10l4 4m0 -4l-4 4"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6"/></svg>',
  fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2 -2v-2"/></svg>',
  fullscreenExit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2c0 -.551 .223 -1.05 .584 -1.412"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2c.545 0 1.04 -.218 1.4 -.572"/><path d="M3 3l18 18"/></svg>'
};
class ne {
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
    n(this, "handleFullscreenChange", () => this.render(this.adapter.getState()));
    this.adapter = t, this.wrapper = e, this.icons = { ...ae, ...i.icons }, this.element = u("div", "fideo__controls"), this.playButton = this.button("fideo__button fideo__play", "Play", this.icons.play), this.muteButton = this.button("fideo__button fideo__mute", "Mute", this.icons.volume), this.track = this.range("fideo__track", 0, 1e3, 1), this.volume = this.range("fideo__volume", 0, 1, 0.01), this.currentTime = u("span", "fideo__time"), this.duration = u("span", "fideo__time"), this.speedMenu = this.createSpeedMenu(i.playbackRates), this.fullscreenButton = this.button("fideo__button", "Fullscreen", this.icons.fullscreen);
    const r = this.button("fideo__button fideo__settings-toggle", "Settings", this.icons.settings), a = u("div", "fideo__timeline");
    a.append(this.track);
    const o = u("span", "fideo__time-group"), l = u("span", "fideo__time-separator");
    l.textContent = "/", o.append(this.currentTime, l, this.duration), this.volumeGroup = u("div", "fideo__volume-group"), this.volumePanel = u("div", "fideo__volume-panel"), this.volumePanel.append(this.volume), this.volumeGroup.append(this.muteButton, this.volumePanel);
    const h = u("div", "fideo__settings");
    h.append(r, this.speedMenu);
    const d = u("div", "fideo__control-row"), p = u("span", "fideo__spacer");
    i.controlVisibility.play && d.append(this.playButton), (i.controlVisibility.currentTime || i.controlVisibility.duration) && d.append(o), d.append(p), i.controlVisibility.volume && d.append(this.volumeGroup), i.controlVisibility.settings && d.append(h), i.controlVisibility.fullscreen && d.append(this.fullscreenButton), this.element.append(d), i.controlVisibility.timeline && this.element.append(a), this.wrapper.append(this.element), i.controlVisibility.currentTime || this.currentTime.remove(), i.controlVisibility.duration || this.duration.remove(), (!i.controlVisibility.currentTime || !i.controlVisibility.duration) && l.remove(), this.playButton.addEventListener("click", () => this.togglePlay()), this.muteButton.addEventListener("click", () => this.toggleMute()), this.volume.addEventListener("input", () => this.changeVolume()), this.track.addEventListener("pointerdown", () => {
      this.seeking = !0;
    }), this.track.addEventListener("input", () => this.previewSeek()), this.track.addEventListener("change", () => this.commitSeek()), r.addEventListener("click", () => h.classList.toggle("is-open")), this.fullscreenButton.addEventListener("click", () => this.toggleFullscreen()), document.addEventListener("fullscreenchange", this.handleFullscreenChange), this.adapter.addEventListener("change", () => this.render(this.adapter.getState())), this.render(this.adapter.getState());
  }
  destroy() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange), this.element.remove();
  }
  button(t, e, i) {
    const r = document.createElement("button");
    return r.className = t, r.type = "button", r.ariaLabel = e, r.title = e, r.innerHTML = i, r;
  }
  range(t, e, i, r) {
    const a = document.createElement("input");
    return a.className = t, a.type = "range", a.min = String(e), a.max = String(i), a.step = String(r), a;
  }
  createSpeedMenu(t) {
    const e = u("div", "fideo__settings-menu");
    for (const i of t) {
      const r = this.button("fideo__speed", `${i}x`, "");
      r.textContent = `${i}x`, r.addEventListener("click", () => {
        var a;
        this.adapter.setPlaybackRate(i).catch(() => {
        }), (a = e.parentElement) == null || a.classList.remove("is-open");
      }), e.append(r);
    }
    return e;
  }
  togglePlay() {
    this.adapter.getState().paused ? this.adapter.play().catch(() => {
    }) : this.adapter.pause().catch(() => {
    });
  }
  toggleMute() {
    if (!this.volumeGroup.classList.contains("is-open")) {
      this.volumeGroup.classList.add("is-open");
      return;
    }
    const t = this.adapter.getState();
    this.adapter.setMuted(!t.muted).catch(() => {
    });
  }
  changeVolume() {
    const t = Number(this.volume.value);
    t > 0 && this.adapter.setMuted(!1).catch(() => {
    }), this.adapter.setVolume(t).catch(() => {
    });
  }
  previewSeek() {
    const t = this.adapter.getState();
    t.duration && (this.currentTime.textContent = k(Number(this.track.value) / 1e3 * t.duration));
  }
  commitSeek() {
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
  render(t) {
    this.playButton.innerHTML = t.paused ? this.icons.play : this.icons.pause, this.playButton.ariaLabel = t.paused ? "Play" : "Pause", this.playButton.title = t.paused ? "Play" : "Pause", this.muteButton.innerHTML = t.muted || t.volume === 0 ? this.icons.muted : this.icons.volume, !t.muted && t.volume > 0 && t.volume <= 0.5 && (this.muteButton.innerHTML = this.icons.volumeLow), this.muteButton.ariaLabel = t.muted || t.volume === 0 ? "Unmute" : "Mute", this.muteButton.title = t.muted || t.volume === 0 ? "Unmute" : "Mute";
    const e = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = e ? this.icons.fullscreenExit : this.icons.fullscreen, this.fullscreenButton.ariaLabel = e ? "Exit fullscreen" : "Fullscreen", this.fullscreenButton.title = e ? "Exit fullscreen" : "Fullscreen", this.volume.value = String(t.muted ? 0 : t.volume), this.currentTime.textContent = k(t.currentTime), this.duration.textContent = k(t.duration), this.seeking || (this.track.value = t.duration ? String(t.currentTime / t.duration * 1e3) : "0"), this.track.style.setProperty("--fideo-progress", `${Number(this.track.value) / 10}%`), this.volume.style.setProperty("--fideo-progress", `${Number(this.volume.value) * 100}%`);
  }
}
function k(s) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const t = Math.floor(s), e = Math.floor(t / 60), i = t % 60;
  return `${e}:${String(i).padStart(2, "0")}`;
}
class oe {
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
    this.element = t, this.options = e, this.wrapper = this.wrapElement(t, e), this.configureElement(), this.adapter = re(e.provider, t, e), this.applyResponsiveMedia(), e.controls && (this.controls = new ne(this.adapter, this.wrapper, e)), this.bindAdapterEvents(), this.bindClickToToggle(), this.bindResponsiveMedia(), this.bindBackgroundCover(), this.bindViewportPlayback(), this.adapter.setVolume(e.volume), this.adapter.setMuted(e.muted), e.autoplay && this.play().catch(() => {
    });
  }
  play() {
    return this.adapter.play();
  }
  pause() {
    return this.adapter.pause();
  }
  destroy() {
    var t, e, i, r;
    (t = this.observer) == null || t.disconnect(), (e = this.resizeObserver) == null || e.disconnect(), this.resizeController.abort(), (i = this.controls) == null || i.destroy(), this.adapter.destroy(), this.activityTimer && window.clearTimeout(this.activityTimer), this.wrapper.classList.remove("is-ready"), this.wrapper.classList.remove("has-poster", "is-poster-visible"), this.element.removeAttribute("data-fideo-ready"), (r = this.posterImage) == null || r.remove();
  }
  wrapElement(t, e) {
    var r;
    if ((r = t.parentElement) != null && r.classList.contains("fideo"))
      return t.parentElement;
    const i = document.createElement("div");
    return i.className = ["fideo", e.className].filter(Boolean).join(" "), t.before(i), i.append(t), i;
  }
  configureElement() {
    this.wrapper.classList.add(`fideo--${this.options.provider}`), this.options.background && this.wrapper.classList.add("fideo--background"), this.wrapper.classList.add("is-ready"), this.wrapper.classList.add("is-paused"), this.element.classList.add("fideo__media"), this.element.setAttribute("data-fideo-ready", "true");
    for (const [t, e] of Object.entries(this.options.cssVars))
      this.wrapper.style.setProperty(t, e);
    this.element instanceof HTMLVideoElement ? (this.element.controls = !1, this.element.loop = this.options.loop, this.element.muted = this.options.muted, this.element.playsInline = this.options.playsInline, this.element.setAttribute("playsinline", "")) : (this.element.allow = le(this.element.allow, ["autoplay", "fullscreen", "picture-in-picture", "encrypted-media"]), this.element.setAttribute("allowfullscreen", ""));
  }
  bindAdapterEvents() {
    const t = ["play", "pause", "ended", "timeupdate", "volumechange", "change"];
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
    this.wrapper.classList.toggle("is-playing", !t), this.wrapper.classList.toggle("is-paused", t), t && this.activateControls(0);
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
    const t = S(this.options.posters, this.options.breakpoints);
    this.adapter.setPoster && this.adapter.setPoster(t ?? ""), this.applyPosterOverlay(t);
    const e = S(this.options.sources, this.options.breakpoints);
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
    if (!this.options.background || this.element instanceof HTMLVideoElement) return;
    const t = this.wrapper.clientWidth, e = this.wrapper.clientHeight;
    if (!t || !e) return;
    const i = t / e, r = this.options.backgroundAspectRatio;
    let a = t, o = e;
    i > r ? o = t / r : a = e * r, this.element.style.width = `${a}px`, this.element.style.height = `${o}px`, this.element.style.left = `${(t - a) / 2}px`, this.element.style.top = `${(e - o) / 2}px`;
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
function le(s, t) {
  const e = new Set(
    (s ?? "").split(";").map((i) => i.trim()).filter(Boolean)
  );
  return t.forEach((i) => e.add(i)), Array.from(e).join("; ");
}
const V = /* @__PURE__ */ new WeakMap();
class de {
  constructor(t, e = {}) {
    n(this, "player");
    this.player = v(F(t), e);
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
    return v(t, e);
  }
}
function ce(s, t = {}) {
  return v(F(s), t);
}
function E(s = {}) {
  const t = s.selector ?? I, i = Array.from(document.querySelectorAll(t)).filter(
    (r) => r instanceof HTMLVideoElement || r instanceof HTMLIFrameElement
  ).map((r) => v(r, s));
  return {
    players: i,
    destroy() {
      i.forEach((r) => r.destroy());
    }
  };
}
function v(s, t = {}) {
  const e = V.get(s);
  if (e) return e;
  const i = q(s, t), r = new oe(s, i);
  return V.set(s, r), r;
}
function F(s) {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (t instanceof HTMLVideoElement || t instanceof HTMLIFrameElement)
    return t;
  throw new Error("Fideo target must resolve to a <video> or <iframe> element.");
}
typeof window < "u" && (Object.assign(window, { Fideo: de, createFideo: ce, initFideo: E, mountFideo: v }), document.addEventListener("DOMContentLoaded", () => {
  E();
}));
export {
  de as Fideo,
  ce as createFideo,
  E as initFideo,
  v as mountFideo
};
//# sourceMappingURL=fideo.js.map
