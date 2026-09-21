import { computed, ref, onMounted, onUnmounted, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext, toDisplayString, resolveDynamicComponent, createCommentVNode, Fragment, renderList, withModifiers, withDirectives, vModelText, nextTick, vModelSelect, vModelCheckbox, watch, Teleport, vModelDynamic, reactive, createSSRApp, h } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderVNode, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport, ssrRenderDynamicModel } from "vue/server-renderer";
import { usePage, Link, Head, useForm, router, createInertiaApp } from "@inertiajs/vue3";
import { renderToString } from "@vue/server-renderer";
import createServer from "@inertiajs/vue3/server";
const _sfc_main$D = {
  __name: "UserMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const user = computed(() => page.props.auth?.user);
    const open = ref(false);
    const root = ref(null);
    function close(e) {
      if (root.value && !root.value.contains(e.target)) open.value = false;
    }
    onMounted(() => document.addEventListener("click", close));
    onUnmounted(() => document.removeEventListener("click", close));
    return (_ctx, _push, _parent, _attrs) => {
      if (user.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          ref_key: "root",
          ref: root,
          class: "relative"
        }, _attrs))}><button class="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 transition hover:bg-surface"${ssrRenderAttr("aria-expanded", open.value)} aria-haspopup="menu">`);
        if (user.value.avatar_url) {
          _push(`<img${ssrRenderAttr("src", user.value.avatar_url)} alt="" class="size-7 rounded-full object-cover">`);
        } else {
          _push(`<span class="grid size-7 place-items-center rounded-full bg-accent text-[12px] font-bold text-white">${ssrInterpolate(user.value.initial)}</span>`);
        }
        _push(`<span class="hidden max-w-[90px] truncate text-[13px] font-semibold sm:block">${ssrInterpolate(user.value.name)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-3.5 text-ink-muted"><path d="m6 9 6 6 6-6" stroke-linecap="round"></path></svg></button>`);
        if (open.value) {
          _push(`<div role="menu" class="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-page shadow-lg"><div class="border-b border-line px-3 py-2.5"><p class="truncate text-[13px] font-bold">${ssrInterpolate(user.value.name)}</p><p class="truncate text-[11.5px] text-ink-muted">${ssrInterpolate(user.value.email)}</p></div><nav class="p-1.5">`);
          _push(ssrRenderComponent(unref(Link), {
            href: "/bookmarks",
            class: "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition hover:bg-surface",
            onClick: ($event) => open.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"${_scopeId}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round"${_scopeId}></path></svg> Bài đã lưu `);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.8",
                    class: "size-4"
                  }, [
                    createVNode("path", {
                      d: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
                      "stroke-linejoin": "round"
                    })
                  ])),
                  createTextVNode(" Bài đã lưu ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(unref(Link), {
            href: "/account",
            class: "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition hover:bg-surface",
            onClick: ($event) => open.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"${_scopeId}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round"${_scopeId}></path><circle cx="12" cy="7" r="4"${_scopeId}></circle></svg> Tài khoản `);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.8",
                    class: "size-4"
                  }, [
                    createVNode("path", {
                      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
                      "stroke-linecap": "round"
                    }),
                    createVNode("circle", {
                      cx: "12",
                      cy: "7",
                      r: "4"
                    })
                  ])),
                  createTextVNode(" Tài khoản ")
                ];
              }
            }),
            _: 1
          }, _parent));
          if (user.value.is_admin) {
            _push(ssrRenderComponent(unref(Link), {
              href: "/admin",
              class: "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition hover:bg-surface",
              onClick: ($event) => open.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"${_scopeId}><rect x="3" y="3" width="7" height="9" rx="1.5"${_scopeId}></rect><rect x="14" y="3" width="7" height="5" rx="1.5"${_scopeId}></rect><rect x="14" y="12" width="7" height="9" rx="1.5"${_scopeId}></rect><rect x="3" y="16" width="7" height="5" rx="1.5"${_scopeId}></rect></svg> Quản trị `);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "1.8",
                      class: "size-4"
                    }, [
                      createVNode("rect", {
                        x: "3",
                        y: "3",
                        width: "7",
                        height: "9",
                        rx: "1.5"
                      }),
                      createVNode("rect", {
                        x: "14",
                        y: "3",
                        width: "7",
                        height: "5",
                        rx: "1.5"
                      }),
                      createVNode("rect", {
                        x: "14",
                        y: "12",
                        width: "7",
                        height: "9",
                        rx: "1.5"
                      }),
                      createVNode("rect", {
                        x: "3",
                        y: "16",
                        width: "7",
                        height: "5",
                        rx: "1.5"
                      })
                    ])),
                    createTextVNode(" Quản trị ")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</nav><div class="border-t border-line p-1.5"><button class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-ink-muted transition hover:bg-surface"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round"></path></svg> Đăng xuất </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2" }, _attrs))}>`);
        _push(ssrRenderComponent(unref(Link), {
          href: "/login",
          class: "text-[13.5px] font-semibold text-ink-2 hover:text-ink"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Đăng nhập`);
            } else {
              return [
                createTextVNode("Đăng nhập")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(unref(Link), {
          href: "/register",
          class: "btn btn-primary !py-1.5 !text-[13px]"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Đăng ký`);
            } else {
              return [
                createTextVNode("Đăng ký")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
};
const _sfc_setup$D = _sfc_main$D.setup;
_sfc_main$D.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/UserMenu.vue");
  return _sfc_setup$D ? _sfc_setup$D(props, ctx) : void 0;
};
const _sfc_main$C = {
  __name: "PublicLayout",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const SOCIAL = {
      facebook: { name: "Facebook", d: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" },
      youtube: { name: "YouTube", d: "M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16 4.1 12 4.1 12 4.1s-4 0-6.8.2c-.4 0-1.2 0-2 .9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.2 6.6.2 6.6.2s4 0 6.8-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.6V9.1l5.2 2.8-5.2 2.7z" },
      tiktok: { name: "TikTok", d: "M16.6 5.8a4.8 4.8 0 0 1-1.1-3.1h-3.2v12.9a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.7a6 6 0 0 0-.8-.1 5.9 5.9 0 1 0 5.9 5.9V9.1a8 8 0 0 0 4.6 1.5V7.4a4.8 4.8 0 0 1-3.5-1.6z" }
    };
    const menu = computed(() => page.props.menu || []);
    const site = computed(() => page.props.site || {});
    const footerPages = computed(() => page.props.footerPages || []);
    const socials = computed(
      () => Object.entries(SOCIAL).filter(([k]) => site.value[k]).map(([k, v]) => ({ k, url: site.value[k], ...v }))
    );
    const open = ref(false);
    const term = ref("");
    const theme = ref("auto");
    onMounted(() => {
      theme.value = localStorage.getItem("theme") || "auto";
      applyTheme();
    });
    function applyTheme() {
      const el = document.documentElement;
      if (theme.value === "auto") el.removeAttribute("data-theme");
      else el.setAttribute("data-theme", theme.value);
      localStorage.setItem("theme", theme.value);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex min-h-dvh flex-col" }, _attrs))}><a href="#noi-dung" class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white"> Tới nội dung chính </a><header class="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur"><div class="wrap flex h-14 items-center gap-3">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "flex shrink-0 items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-8 rounded-lg" width="32" height="32"${_scopeId}><span class="text-[15px] font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(site.value.name)}</span>`);
          } else {
            return [
              createVNode("img", {
                src: site.value.logo,
                alt: "",
                class: "size-8 rounded-lg",
                width: "32",
                height: "32"
              }, null, 8, ["src"]),
              createVNode("span", { class: "text-[15px] font-extrabold tracking-tight" }, toDisplayString(site.value.name), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="ml-2 hidden items-center gap-1 md:flex"><!--[-->`);
      ssrRenderList(menu.value, (c) => {
        _push(ssrRenderComponent(unref(Link), {
          key: c.slug,
          href: `/category/${c.slug}`,
          class: "rounded-lg px-2.5 py-1.5 text-[14px] font-semibold text-ink-2 transition hover:bg-surface hover:text-ink"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(c.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(c.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><form class="ml-auto hidden max-w-[200px] flex-1 lg:block"><label for="q" class="sr-only">Tìm kiếm</label><input id="q"${ssrRenderAttr("value", term.value)} class="input !py-1.5 !text-[13px]" placeholder="Tìm tin…"></form><button class="btn !border-transparent !px-2"${ssrRenderAttr("title", `Giao diện: ${theme.value}`)} aria-label="Đổi giao diện sáng tối"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-linecap="round"></path></svg></button>`);
      _push(ssrRenderComponent(_sfc_main$D, { class: "shrink-0" }, null, _parent));
      _push(`<button class="btn !border-transparent !px-2 md:hidden" aria-label="Mở menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"></path></svg></button></div>`);
      if (open.value) {
        _push(`<div class="border-t border-line bg-page md:hidden"><div class="wrap space-y-2 py-3"><form><input${ssrRenderAttr("value", term.value)} class="input" placeholder="Tìm tin…"></form><nav class="grid grid-cols-2 gap-1.5"><!--[-->`);
        ssrRenderList(menu.value, (c) => {
          _push(ssrRenderComponent(unref(Link), {
            key: c.slug,
            href: `/category/${c.slug}`,
            class: "rounded-lg bg-surface px-3 py-2 text-[14px] font-semibold",
            onClick: ($event) => open.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(c.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(c.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><main id="noi-dung" class="flex-1 py-6">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="mt-10 border-t border-line bg-surface py-9"><div class="wrap grid gap-7 md:grid-cols-[1.4fr_1fr_1fr]"><div><div class="flex items-center gap-2"><img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-7 rounded-md" width="28" height="28"><span class="font-extrabold tracking-tight">${ssrInterpolate(site.value.name)}</span></div><p class="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">${ssrInterpolate(site.value.tagline)}. Tin được tổng hợp từ các báo điện tử Việt Nam, luôn kèm liên kết tới bài gốc. </p>`);
      if (socials.value.length) {
        _push(`<div class="mt-4 flex gap-2"><!--[-->`);
        ssrRenderList(socials.value, (s) => {
          _push(`<a${ssrRenderAttr("href", s.url)} target="_blank" rel="noopener"${ssrRenderAttr("aria-label", s.name)} class="grid size-8 place-items-center rounded-lg border border-line text-ink-2 transition hover:border-ink-muted hover:text-ink"><svg viewBox="0 0 24 24" fill="currentColor" class="size-4"><path${ssrRenderAttr("d", s.d)}></path></svg></a>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><nav><p class="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Chuyên mục</p><ul class="space-y-1.5 text-[13px]"><!--[-->`);
      ssrRenderList(menu.value, (c) => {
        _push(`<li>`);
        _push(ssrRenderComponent(unref(Link), {
          href: `/category/${c.slug}`,
          class: "text-ink-2 hover:text-ink"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(c.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(c.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav><nav><p class="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Thông tin</p><ul class="space-y-1.5 text-[13px]"><!--[-->`);
      ssrRenderList(footerPages.value, (p) => {
        _push(`<li>`);
        _push(ssrRenderComponent(unref(Link), {
          href: `/page/${p.slug}`,
          class: "text-ink-2 hover:text-ink"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(p.title)}`);
            } else {
              return [
                createTextVNode(toDisplayString(p.title), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--><li><a href="/rss.xml" class="text-ink-2 hover:text-ink">RSS</a></li></ul>`);
      if (site.value.email || site.value.hotline) {
        _push(`<ul class="mt-4 space-y-1 text-[12.5px] text-ink-muted">`);
        if (site.value.email) {
          _push(`<li><a${ssrRenderAttr("href", `mailto:${site.value.email}`)} class="hover:text-ink">${ssrInterpolate(site.value.email)}</a></li>`);
        } else {
          _push(`<!---->`);
        }
        if (site.value.hotline) {
          _push(`<li>${ssrInterpolate(site.value.hotline)}</li>`);
        } else {
          _push(`<!---->`);
        }
        if (site.value.address) {
          _push(`<li>${ssrInterpolate(site.value.address)}</li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</nav></div><div class="wrap mt-7 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-muted">${ssrInterpolate(site.value.copyright || `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${site.value.name}`)}</div></footer></div>`);
    };
  }
};
const _sfc_setup$C = _sfc_main$C.setup;
_sfc_main$C.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/PublicLayout.vue");
  return _sfc_setup$C ? _sfc_setup$C(props, ctx) : void 0;
};
const _sfc_main$B = {
  __name: "SeoHead",
  __ssrInlineRender: true,
  props: { seo: { type: Object, required: true } },
  setup(__props) {
    const props = __props;
    const blocks = () => {
      const j = props.seo.jsonLd;
      if (!j) return [];
      return Array.isArray(j) ? j : [j];
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Head), mergeProps({
        title: __props.seo.title
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<meta name="description"${ssrRenderAttr("content", __props.seo.description)}${_scopeId}><link rel="canonical"${ssrRenderAttr("href", __props.seo.canonical)}${_scopeId}>`);
            if (__props.seo.noindex) {
              _push2(`<meta name="robots" content="noindex, follow"${_scopeId}>`);
            } else {
              _push2(`<meta name="robots" content="index, follow, max-image-preview:large"${_scopeId}>`);
            }
            _push2(`<meta property="og:type"${ssrRenderAttr("content", __props.seo.type)}${_scopeId}><meta property="og:title"${ssrRenderAttr("content", __props.seo.title)}${_scopeId}><meta property="og:description"${ssrRenderAttr("content", __props.seo.description)}${_scopeId}><meta property="og:url"${ssrRenderAttr("content", __props.seo.canonical)}${_scopeId}><meta property="og:image"${ssrRenderAttr("content", __props.seo.image)}${_scopeId}><meta property="og:site_name"${ssrRenderAttr("content", __props.seo.siteName)}${_scopeId}><meta property="og:locale"${ssrRenderAttr("content", __props.seo.locale)}${_scopeId}>`);
            if (__props.seo.publishedAt) {
              _push2(`<meta property="article:published_time"${ssrRenderAttr("content", __props.seo.publishedAt)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.seo.modifiedAt) {
              _push2(`<meta property="article:modified_time"${ssrRenderAttr("content", __props.seo.modifiedAt)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.seo.section) {
              _push2(`<meta property="article:section"${ssrRenderAttr("content", __props.seo.section)}${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<meta name="twitter:card" content="summary_large_image"${_scopeId}><meta name="twitter:title"${ssrRenderAttr("content", __props.seo.title)}${_scopeId}><meta name="twitter:description"${ssrRenderAttr("content", __props.seo.description)}${_scopeId}><meta name="twitter:image"${ssrRenderAttr("content", __props.seo.image)}${_scopeId}><!--[-->`);
            ssrRenderList(blocks(), (b, i) => {
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent("script"), {
                key: i,
                type: "application/ld+json"
              }, null), _parent2, _scopeId);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              createVNode("meta", {
                name: "description",
                content: __props.seo.description
              }, null, 8, ["content"]),
              createVNode("link", {
                rel: "canonical",
                href: __props.seo.canonical
              }, null, 8, ["href"]),
              __props.seo.noindex ? (openBlock(), createBlock("meta", {
                key: 0,
                name: "robots",
                content: "noindex, follow"
              })) : (openBlock(), createBlock("meta", {
                key: 1,
                name: "robots",
                content: "index, follow, max-image-preview:large"
              })),
              createVNode("meta", {
                property: "og:type",
                content: __props.seo.type
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:title",
                content: __props.seo.title
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:description",
                content: __props.seo.description
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:url",
                content: __props.seo.canonical
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:image",
                content: __props.seo.image
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:site_name",
                content: __props.seo.siteName
              }, null, 8, ["content"]),
              createVNode("meta", {
                property: "og:locale",
                content: __props.seo.locale
              }, null, 8, ["content"]),
              __props.seo.publishedAt ? (openBlock(), createBlock("meta", {
                key: 2,
                property: "article:published_time",
                content: __props.seo.publishedAt
              }, null, 8, ["content"])) : createCommentVNode("", true),
              __props.seo.modifiedAt ? (openBlock(), createBlock("meta", {
                key: 3,
                property: "article:modified_time",
                content: __props.seo.modifiedAt
              }, null, 8, ["content"])) : createCommentVNode("", true),
              __props.seo.section ? (openBlock(), createBlock("meta", {
                key: 4,
                property: "article:section",
                content: __props.seo.section
              }, null, 8, ["content"])) : createCommentVNode("", true),
              createVNode("meta", {
                name: "twitter:card",
                content: "summary_large_image"
              }),
              createVNode("meta", {
                name: "twitter:title",
                content: __props.seo.title
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "twitter:description",
                content: __props.seo.description
              }, null, 8, ["content"]),
              createVNode("meta", {
                name: "twitter:image",
                content: __props.seo.image
              }, null, 8, ["content"]),
              (openBlock(true), createBlock(Fragment, null, renderList(blocks(), (b, i) => {
                return openBlock(), createBlock(resolveDynamicComponent("script"), {
                  key: i,
                  type: "application/ld+json",
                  innerHTML: JSON.stringify(b)
                }, null, 8, ["innerHTML"]);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$B = _sfc_main$B.setup;
_sfc_main$B.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/SeoHead.vue");
  return _sfc_setup$B ? _sfc_setup$B(props, ctx) : void 0;
};
const _sfc_main$A = {
  __name: "Avatar",
  __ssrInlineRender: true,
  props: {
    user: { type: Object, default: null },
    size: { type: String, default: "size-9" }
  },
  setup(__props) {
    const props = __props;
    const name = computed(() => props.user?.name || "Ẩn danh");
    const PALETTE = ["#FE2C55", "#0A9CB0", "#7C3AED", "#EA580C", "#059669", "#2563EB"];
    const color = computed(() => {
      let h2 = 0;
      for (const c of name.value) h2 = h2 * 31 + c.codePointAt(0) >>> 0;
      return PALETTE[h2 % PALETTE.length];
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.user?.avatar_url) {
        _push(`<img${ssrRenderAttrs(mergeProps({
          src: __props.user.avatar_url,
          alt: name.value,
          class: ["shrink-0 rounded-full object-cover", __props.size],
          loading: "lazy"
        }, _attrs))}>`);
      } else {
        _push(`<span${ssrRenderAttrs(mergeProps({
          class: ["grid shrink-0 place-items-center rounded-full font-bold text-white", __props.size],
          style: { background: color.value },
          "aria-hidden": "true"
        }, _attrs))}>${ssrInterpolate(name.value.charAt(0).toUpperCase())}</span>`);
      }
    };
  }
};
const _sfc_setup$A = _sfc_main$A.setup;
_sfc_main$A.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Avatar.vue");
  return _sfc_setup$A ? _sfc_setup$A(props, ctx) : void 0;
};
const _sfc_main$z = {
  __name: "Account",
  __ssrInlineRender: true,
  props: { seo: { type: Object, required: true } },
  setup(__props) {
    const user = computed(() => usePage().props.auth.user);
    const flash = computed(() => usePage().props.flash);
    const form = useForm({
      name: user.value.name || "",
      username: user.value.username || "",
      bio: user.value.bio || "",
      avatar_url: user.value.avatar_url || ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap max-w-[640px]"${_scopeId}><h1 class="text-[26px] font-extrabold tracking-tight"${_scopeId}>Tài khoản</h1><p class="mt-1 text-[13.5px] text-ink-muted"${_scopeId}> Tên và ảnh ở đây là thứ người khác thấy bên cạnh bình luận của bạn. </p>`);
            if (flash.value?.success) {
              _push2(`<div class="mt-5 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-[13.5px] font-semibold text-cyan" role="status"${_scopeId}>${ssrInterpolate(flash.value.success)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mt-5 flex items-center gap-4 rounded-xl border border-line bg-surface p-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$A, {
              user: { name: unref(form).name, avatar_url: unref(form).avatar_url },
              size: "size-14 text-xl"
            }, null, _parent2, _scopeId));
            _push2(`<div class="min-w-0"${_scopeId}><p class="truncate text-[15px] font-bold"${_scopeId}>${ssrInterpolate(unref(form).name || "Chưa đặt tên")}</p><p class="truncate text-[12.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(form).username ? "@" + unref(form).username : user.value.email)}</p>`);
            if (unref(form).bio) {
              _push2(`<p class="mt-1 line-clamp-2 text-[12.5px] text-ink-2"${_scopeId}>${ssrInterpolate(unref(form).bio)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div><form class="mt-6 space-y-4"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="name"${_scopeId}>Tên hiển thị</label><input id="name"${ssrRenderAttr("value", unref(form).name)} class="input" maxlength="60" required${_scopeId}>`);
            if (unref(form).errors.name) {
              _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.name)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="un"${_scopeId}>Tên đăng nhập</label><div class="flex items-center gap-2"${_scopeId}><span class="text-[14px] font-semibold text-ink-muted"${_scopeId}>@</span><input id="un"${ssrRenderAttr("value", unref(form).username)} class="input" maxlength="40" placeholder="khong-bat-buoc"${_scopeId}></div>`);
            if (unref(form).errors.username) {
              _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.username)}</p>`);
            } else {
              _push2(`<p class="text-[11.5px] text-ink-muted"${_scopeId}>Chỉ chữ, số, gạch ngang và gạch dưới.</p>`);
            }
            _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="av"${_scopeId}>Liên kết ảnh đại diện</label><input id="av"${ssrRenderAttr("value", unref(form).avatar_url)} class="input" type="url" placeholder="https://…"${_scopeId}>`);
            if (unref(form).errors.avatar_url) {
              _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.avatar_url)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="bio"${_scopeId}>Giới thiệu</label><textarea id="bio" rows="3" maxlength="300" class="input resize-y !py-2.5"${_scopeId}>${ssrInterpolate(unref(form).bio)}</textarea><p class="text-[11.5px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(unref(form).bio.length)}/300</p></div><div class="flex items-center gap-3 pt-1"${_scopeId}><button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu thay đổi")}</button><span class="text-[12.5px] text-ink-muted"${_scopeId}>Email ${ssrInterpolate(user.value.email)} không đổi được.</span></div></form></div>`);
          } else {
            return [
              createVNode("div", { class: "wrap max-w-[640px]" }, [
                createVNode("h1", { class: "text-[26px] font-extrabold tracking-tight" }, "Tài khoản"),
                createVNode("p", { class: "mt-1 text-[13.5px] text-ink-muted" }, " Tên và ảnh ở đây là thứ người khác thấy bên cạnh bình luận của bạn. "),
                flash.value?.success ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mt-5 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-[13.5px] font-semibold text-cyan",
                  role: "status"
                }, toDisplayString(flash.value.success), 1)) : createCommentVNode("", true),
                createVNode("div", { class: "mt-5 flex items-center gap-4 rounded-xl border border-line bg-surface p-4" }, [
                  createVNode(_sfc_main$A, {
                    user: { name: unref(form).name, avatar_url: unref(form).avatar_url },
                    size: "size-14 text-xl"
                  }, null, 8, ["user"]),
                  createVNode("div", { class: "min-w-0" }, [
                    createVNode("p", { class: "truncate text-[15px] font-bold" }, toDisplayString(unref(form).name || "Chưa đặt tên"), 1),
                    createVNode("p", { class: "truncate text-[12.5px] text-ink-muted" }, toDisplayString(unref(form).username ? "@" + unref(form).username : user.value.email), 1),
                    unref(form).bio ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "mt-1 line-clamp-2 text-[12.5px] text-ink-2"
                    }, toDisplayString(unref(form).bio), 1)) : createCommentVNode("", true)
                  ])
                ]),
                createVNode("form", {
                  class: "mt-6 space-y-4",
                  onSubmit: withModifiers(($event) => unref(form).put("/account", { preserveScroll: true }), ["prevent"])
                }, [
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "name"
                    }, "Tên hiển thị"),
                    withDirectives(createVNode("input", {
                      id: "name",
                      "onUpdate:modelValue": ($event) => unref(form).name = $event,
                      class: "input",
                      maxlength: "60",
                      required: ""
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).name]
                    ]),
                    unref(form).errors.name ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[12px] text-accent-ink"
                    }, toDisplayString(unref(form).errors.name), 1)) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "un"
                    }, "Tên đăng nhập"),
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode("span", { class: "text-[14px] font-semibold text-ink-muted" }, "@"),
                      withDirectives(createVNode("input", {
                        id: "un",
                        "onUpdate:modelValue": ($event) => unref(form).username = $event,
                        class: "input",
                        maxlength: "40",
                        placeholder: "khong-bat-buoc"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).username]
                      ])
                    ]),
                    unref(form).errors.username ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[12px] text-accent-ink"
                    }, toDisplayString(unref(form).errors.username), 1)) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-[11.5px] text-ink-muted"
                    }, "Chỉ chữ, số, gạch ngang và gạch dưới."))
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "av"
                    }, "Liên kết ảnh đại diện"),
                    withDirectives(createVNode("input", {
                      id: "av",
                      "onUpdate:modelValue": ($event) => unref(form).avatar_url = $event,
                      class: "input",
                      type: "url",
                      placeholder: "https://…"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).avatar_url]
                    ]),
                    unref(form).errors.avatar_url ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[12px] text-accent-ink"
                    }, toDisplayString(unref(form).errors.avatar_url), 1)) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "bio"
                    }, "Giới thiệu"),
                    withDirectives(createVNode("textarea", {
                      id: "bio",
                      "onUpdate:modelValue": ($event) => unref(form).bio = $event,
                      rows: "3",
                      maxlength: "300",
                      class: "input resize-y !py-2.5"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).bio]
                    ]),
                    createVNode("p", { class: "text-[11.5px] text-ink-muted tabular-nums" }, toDisplayString(unref(form).bio.length) + "/300", 1)
                  ]),
                  createVNode("div", { class: "flex items-center gap-3 pt-1" }, [
                    createVNode("button", {
                      class: "btn btn-primary",
                      disabled: unref(form).processing
                    }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu thay đổi"), 9, ["disabled"]),
                    createVNode("span", { class: "text-[12.5px] text-ink-muted" }, "Email " + toDisplayString(user.value.email) + " không đổi được.", 1)
                  ])
                ], 40, ["onSubmit"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$z = _sfc_main$z.setup;
_sfc_main$z.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Account.vue");
  return _sfc_setup$z ? _sfc_setup$z(props, ctx) : void 0;
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$z
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$y = {
  __name: "AdminLayout",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const site = computed(() => page.props.site || {});
    const user = computed(() => page.props.auth?.user);
    const can = computed(() => user.value?.can || {});
    const flash = computed(() => page.props.flash || {});
    const open = ref(false);
    const GROUPS = [
      {
        label: null,
        items: [
          {
            href: "/admin",
            label: "Tổng quan",
            exact: true,
            need: null,
            d: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"
          }
        ]
      },
      {
        label: "Nội dung",
        items: [
          {
            href: "/admin/articles",
            label: "Tin bài",
            need: "articles.view",
            d: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"
          },
          {
            href: "/admin/categories",
            label: "Chuyên mục",
            need: "categories.view",
            d: "M3 7h18M3 12h18M3 17h10"
          },
          {
            href: "/admin/pages",
            label: "Trang tĩnh",
            need: "pages.view",
            d: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6"
          }
        ]
      },
      {
        label: "Cộng đồng",
        items: [
          {
            href: "/admin/comments",
            label: "Bình luận",
            need: "comments.view",
            d: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z"
          },
          {
            href: "/admin/users",
            label: "Người dùng",
            need: "users.view",
            d: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"
          }
        ]
      },
      {
        label: "Hệ thống",
        items: [
          {
            href: "/admin/reports",
            label: "Báo cáo",
            need: "reports.view",
            d: "M3 3v18h18M7 15l4-5 3 3 5-7"
          },
          {
            href: "/admin/roles",
            label: "Vai trò",
            need: "roles.manage",
            d: "M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6zM9.5 12l1.8 1.8L15 10"
          },
          {
            href: "/admin/settings",
            label: "Cấu hình",
            need: "settings.manage",
            d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.18.42.53.75.95.92H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          }
        ]
      }
    ];
    const groups = computed(
      () => GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.need || can.value[i.need]) })).filter((g) => g.items.length)
    );
    const isActive = (n) => {
      const url = page.url.split("?")[0].replace(/\/$/, "") || "/admin";
      return n.exact ? url === n.href : url.startsWith(n.href);
    };
    const current = computed(
      () => groups.value.flatMap((g) => g.items).find(isActive)
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-dvh bg-surface lg:flex" }, _attrs))}><aside class="${ssrRenderClass([
        "fixed inset-y-0 left-0 z-50 flex w-[236px] shrink-0 flex-col border-r",
        "border-line bg-page transition-transform lg:static lg:translate-x-0",
        open.value ? "translate-x-0" : "-translate-x-full"
      ])}"><div class="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4"><img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-8 rounded-lg"><div class="min-w-0"><p class="truncate text-[14px] font-extrabold leading-tight tracking-tight">${ssrInterpolate(site.value.name)}</p><p class="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">Quản trị</p></div></div><nav class="flex-1 overflow-y-auto p-2.5"><!--[-->`);
      ssrRenderList(groups.value, (g, gi) => {
        _push(`<div class="${ssrRenderClass(gi && "mt-4")}">`);
        if (g.label) {
          _push(`<p class="mb-1 px-3 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted/80">${ssrInterpolate(g.label)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(g.items, (n) => {
          _push(ssrRenderComponent(unref(Link), {
            key: n.href,
            href: n.href,
            onClick: ($event) => open.value = false,
            class: "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition",
            style: isActive(n) ? { background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" } : { color: "var(--color-ink-2)" }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="size-[17px] shrink-0" stroke-linecap="round" stroke-linejoin="round"${_scopeId}><path${ssrRenderAttr("d", n.d)}${_scopeId}></path></svg> ${ssrInterpolate(n.label)}`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.7",
                    class: "size-[17px] shrink-0",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, [
                    createVNode("path", {
                      d: n.d
                    }, null, 8, ["d"])
                  ])),
                  createTextVNode(" " + toDisplayString(n.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></nav><div class="shrink-0 border-t border-line p-2.5"><a href="/" target="_blank" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-2 transition hover:bg-surface"> Xem website <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-auto size-3.5"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div></aside>`);
      if (open.value) {
        _push(`<div class="fixed inset-0 z-40 bg-black/40 lg:hidden"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="min-w-0 flex-1"><header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page/90 px-4 backdrop-blur sm:px-6"><button class="btn !border-transparent !px-2 lg:hidden" aria-label="Mở menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"></path></svg></button><p class="text-[14px] font-bold">${ssrInterpolate(current.value?.label || "Quản trị")}</p><div class="ml-auto flex items-center gap-2.5"><div class="hidden text-right sm:block"><p class="text-[12.5px] font-semibold leading-tight">${ssrInterpolate(user.value?.name)}</p><p class="text-[10.5px] text-ink-muted">${ssrInterpolate(user.value?.role_label)}</p></div><span class="grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold text-white">${ssrInterpolate(user.value?.initial)}</span><button class="btn !py-1.5 !text-[13px]">Thoát</button></div></header>`);
      if (flash.value.success || flash.value.error) {
        _push(`<div class="px-4 pt-4 sm:px-6"><p class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold" style="${ssrRenderStyle(flash.value.error ? { background: "rgba(217,22,68,.1)", color: "var(--color-accent-ink)" } : { background: "rgba(10,156,176,.1)", color: "var(--color-cyan)" })}" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-4">`);
        if (flash.value.error) {
          _push(`<path d="M12 8v5M12 16.5h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke-linecap="round" stroke-linejoin="round"></path>`);
        } else {
          _push(`<path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"></path>`);
        }
        _push(`</svg> ${ssrInterpolate(flash.value.error || flash.value.success)}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="p-4 sm:p-6">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
};
const _sfc_setup$y = _sfc_main$y.setup;
_sfc_main$y.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AdminLayout.vue");
  return _sfc_setup$y ? _sfc_setup$y(props, ctx) : void 0;
};
const _sfc_main$x = {
  __name: "Icon",
  __ssrInlineRender: true,
  props: {
    name: { type: String, required: true },
    size: { type: String, default: "size-4" }
  },
  setup(__props) {
    const P = {
      plus: ["M12 5v14M5 12h14"],
      edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
      trash: ["M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"],
      eye: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
      external: ["M7 17 17 7M9 7h8v8"],
      search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-3.5-3.5"],
      check: ["m5 13 4 4L19 7"],
      x: ["M18 6 6 18M6 6l12 12"],
      copy: ["M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"],
      image: ["M3 3h18v18H3z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3", "m21 16-5-5L5 21"],
      back: ["M19 12H5M12 19l-7-7 7-7"],
      save: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"],
      link: ["M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"],
      refresh: ["M21 12a9 9 0 1 1-3-6.7", "M21 3v6h-6"],
      ban: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M5 5l14 14"],
      flag: ["M4 22V4M4 4h13l-2 4 2 4H4"],
      star: ["m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9z"],
      up: ["M12 19V5M5 12l7-7 7 7"],
      down: ["M12 5v14M19 12l-7 7-7-7"]
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<svg${ssrRenderAttrs(mergeProps({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.8",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: __props.size,
        "aria-hidden": "true"
      }, _attrs))}><!--[-->`);
      ssrRenderList(P[__props.name], (d, i) => {
        _push(`<path${ssrRenderAttr("d", d)}></path>`);
      });
      _push(`<!--]--></svg>`);
    };
  }
};
const _sfc_setup$x = _sfc_main$x.setup;
_sfc_main$x.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/Icon.vue");
  return _sfc_setup$x ? _sfc_setup$x(props, ctx) : void 0;
};
const _sfc_main$w = {
  __name: "HtmlEditor",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: String, default: "" },
    rows: { type: Number, default: 18 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const el = ref(null);
    const mode = ref("viet");
    function wrap(open, close = null, block = false) {
      const ta = el.value;
      if (!ta) return;
      close ??= open.replace("<", "</").replace(/ .*>/, ">");
      const { selectionStart: a, selectionEnd: b, value } = ta;
      const picked = value.slice(a, b);
      const before = block && a > 0 && value[a - 1] !== "\n" ? "\n" : "";
      const after = block ? "\n" : "";
      const inserted = `${before}${open}${picked}${close}${after}`;
      const next = value.slice(0, a) + inserted + value.slice(b);
      emit("update:modelValue", next);
      const caret = a + before.length + open.length + picked.length;
      nextTick(() => {
        ta.focus();
        ta.setSelectionRange(
          picked ? caret + close.length + after.length : caret,
          picked ? caret + close.length + after.length : caret
        );
      });
    }
    function link() {
      const url = prompt("Dán liên kết:");
      if (url) wrap(`<a href="${url}" target="_blank" rel="noopener">`, "</a>");
    }
    function image() {
      const url = prompt("Dán liên kết ảnh:");
      if (url) wrap(`<img src="${url}" alt="" loading="lazy">`, "", true);
    }
    const TOOLS = [
      { t: "H2", title: "Tiêu đề mục", fn: () => wrap("<h2>", "</h2>", true) },
      { t: "H3", title: "Tiêu đề phụ", fn: () => wrap("<h3>", "</h3>", true) },
      { t: "P", title: "Đoạn văn", fn: () => wrap("<p>", "</p>", true) },
      { sep: true },
      { t: "B", title: "In đậm", cls: "font-extrabold", fn: () => wrap("<strong>", "</strong>") },
      { t: "I", title: "In nghiêng", cls: "italic", fn: () => wrap("<em>", "</em>") },
      { sep: true },
      { t: "“ ”", title: "Trích dẫn", fn: () => wrap("<blockquote>", "</blockquote>", true) },
      {
        t: "•",
        title: "Danh sách",
        fn: () => wrap("<ul>\n  <li>", "</li>\n</ul>", true)
      },
      { sep: true },
      { i: "link", title: "Liên kết", fn: link },
      { i: "image", title: "Ảnh", fn: image }
    ];
    const plain = computed(
      () => (props.modelValue || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    );
    const words = computed(() => plain.value ? plain.value.split(" ").length : 0);
    const minutes = computed(() => Math.max(1, Math.round(words.value / 200)));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "overflow-hidden rounded-xl border border-line" }, _attrs))}><div class="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-2 py-1.5"><!--[-->`);
      ssrRenderList(TOOLS, (b, i) => {
        _push(`<!--[-->`);
        if (b.sep) {
          _push(`<span class="mx-1 h-4 w-px bg-line"></span>`);
        } else {
          _push(`<button type="button"${ssrRenderAttr("title", b.title)}${ssrRenderAttr("aria-label", b.title)} class="${ssrRenderClass([b.cls, "grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-[12.5px] font-bold text-ink-2 transition hover:bg-surface-2 hover:text-ink active:scale-90"])}">`);
          if (b.i) {
            _push(ssrRenderComponent(_sfc_main$x, {
              name: b.i,
              size: "size-[15px]"
            }, null, _parent));
          } else {
            _push(`<!--[-->${ssrInterpolate(b.t)}<!--]-->`);
          }
          _push(`</button>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--><div class="ml-auto flex gap-0.5"><!--[-->`);
      ssrRenderList([["viet", "Viết"], ["xem", "Xem trước"], ["doi-chieu", "Đối chiếu"]], (m) => {
        _push(`<button type="button" class="rounded-md px-2 py-1 text-[12px] font-semibold transition" style="${ssrRenderStyle(mode.value === m[0] ? { background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" } : { color: "var(--color-ink-muted)" })}">${ssrInterpolate(m[1])}</button>`);
      });
      _push(`<!--]--></div></div><div class="${ssrRenderClass(mode.value === "doi-chieu" && "grid lg:grid-cols-2 lg:divide-x lg:divide-line")}"><textarea${ssrRenderAttr("rows", __props.rows)} class="block w-full resize-y border-0 bg-page px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none" placeholder="&lt;p&gt;Viết nội dung ở đây. Thẻ dùng được: p, h2, h3, ul, li, a, img, blockquote, strong, em.&lt;/p&gt;" style="${ssrRenderStyle(mode.value !== "xem" ? null : { display: "none" })}">${ssrInterpolate(__props.modelValue)}</textarea><div class="max-h-[560px] overflow-y-auto px-3.5 py-3" style="${ssrRenderStyle(mode.value !== "viet" ? null : { display: "none" })}">`);
      if (__props.modelValue) {
        _push(`<div class="prose-vi !text-[15px]">${__props.modelValue ?? ""}</div>`);
      } else {
        _push(`<p class="py-10 text-center text-[13px] text-ink-muted">Chưa có nội dung.</p>`);
      }
      _push(`</div></div><div class="flex flex-wrap items-center gap-x-4 border-t border-line bg-surface px-3 py-1.5 text-[11.5px] text-ink-muted tabular-nums"><span>${ssrInterpolate(words.value)} chữ</span><span>~${ssrInterpolate(minutes.value)} phút đọc</span><span class="ml-auto">Nội dung lưu dưới dạng HTML</span></div></div>`);
    };
  }
};
const _sfc_setup$w = _sfc_main$w.setup;
_sfc_main$w.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/HtmlEditor.vue");
  return _sfc_setup$w ? _sfc_setup$w(props, ctx) : void 0;
};
const _sfc_main$v = {
  __name: "IconButton",
  __ssrInlineRender: true,
  props: {
    icon: { type: String, required: true },
    /** Bắt buộc: nút chỉ có hình thì trình đọc màn hình không đọc được gì. */
    label: { type: String, required: true },
    tone: { type: String, default: "ink" },
    // ink | danger | cyan
    /** 'button' | 'link' (điều hướng trong ứng dụng) | 'a' (ra ngoài, tải lại trang) */
    as: { type: String, default: "button" },
    href: { type: String, default: null },
    target: { type: String, default: null }
  },
  setup(__props) {
    const props = __props;
    const tag = computed(() => ({ link: Link, a: "a" })[props.as] ?? "button");
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tag.value), mergeProps({
        href: __props.href,
        target: __props.target,
        type: __props.as === "button" ? "button" : null,
        class: ["iconbtn", __props.tone === "danger" && "iconbtn-danger", __props.tone === "cyan" && "iconbtn-cyan"],
        title: __props.label,
        "aria-label": __props.label
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$x, {
              name: __props.icon,
              size: "size-[15px]"
            }, null, _parent2, _scopeId));
            _push2(`<span class="sr-only"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
          } else {
            return [
              createVNode(_sfc_main$x, {
                name: __props.icon,
                size: "size-[15px]"
              }, null, 8, ["name"]),
              createVNode("span", { class: "sr-only" }, toDisplayString(__props.label), 1)
            ];
          }
        }),
        _: 1
      }), _parent);
    };
  }
};
const _sfc_setup$v = _sfc_main$v.setup;
_sfc_main$v.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/IconButton.vue");
  return _sfc_setup$v ? _sfc_setup$v(props, ctx) : void 0;
};
const _sfc_main$u = {
  __name: "ArticleEdit",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, default: null },
    categories: { type: Array, default: () => [] }
  },
  setup(__props) {
    const props = __props;
    const isNew = computed(() => !props.article);
    const form = useForm({
      title: props.article?.title || "",
      category_id: props.article?.category_id || null,
      excerpt: props.article?.excerpt || "",
      content: props.article?.content || "",
      image_url: props.article?.image_url || "",
      source: props.article?.source || "",
      source_url: props.article?.source_url || "",
      status: props.article?.status || "draft",
      is_featured: props.article?.is_featured || false,
      seo_title: props.article?.seo_title || "",
      seo_description: props.article?.seo_description || "",
      published_at: props.article?.published_at?.slice(0, 16) || ""
    });
    function save() {
      if (isNew.value) form.post("/admin/articles");
      else form.put(`/admin/articles/${props.article.id}`);
    }
    const can = computed(() => usePage().props.auth?.user?.can || {});
    function remove() {
      if (!confirm(`Xoá “${props.article.title.slice(0, 60)}…”?`)) return;
      router.delete(`/admin/articles/${props.article.id}`);
    }
    const titleLen = computed(() => (form.seo_title || form.title).length);
    const descLen = computed(() => (form.seo_description || form.excerpt || "").length);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), {
        title: (isNew.value ? "Viết bài mới" : "Sửa bài") + " · Quản trị"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-5 flex flex-wrap items-center gap-2.5"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$v, {
              icon: "back",
              label: "Về danh sách",
              as: "link",
              href: "/admin/articles"
            }, null, _parent2, _scopeId));
            _push2(`<div class="min-w-0"${_scopeId}><h1 class="text-[20px] font-extrabold leading-tight tracking-tight"${_scopeId}>${ssrInterpolate(isNew.value ? "Viết bài mới" : "Sửa bài")}</h1>`);
            if (__props.article) {
              _push2(`<p class="truncate text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(__props.article.title)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="ml-auto flex items-center gap-2"${_scopeId}>`);
            if (__props.article && __props.article.status === "published") {
              _push2(`<a${ssrRenderAttr("href", `/news/${__props.article.slug}`)} target="_blank" class="btn !py-1.5 !text-[13px]"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$x, {
                name: "eye",
                size: "size-3.5"
              }, null, _parent2, _scopeId));
              _push2(` Xem trên web </a>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article && can.value["articles.delete"]) {
              _push2(`<button class="btn btn-danger !py-1.5 !text-[13px]"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$x, {
                name: "trash",
                size: "size-3.5"
              }, null, _parent2, _scopeId));
              _push2(` Xoá </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).title) ? " disabled" : ""}${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$x, {
              name: "save",
              size: "size-4"
            }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu bài")}</button></div></div><div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"${_scopeId}><div class="adm-card space-y-4 p-5"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="t"${_scopeId}>Tiêu đề</label><input id="t"${ssrRenderAttr("value", unref(form).title)} class="input !text-[16px] !font-semibold" placeholder="Tiêu đề bài viết"${_scopeId}>`);
            if (unref(form).errors.title) {
              _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.title)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="ex"${_scopeId}>Sapo <span class="font-normal text-ink-muted"${_scopeId}>(đoạn mở đầu)</span></label><textarea id="ex" rows="3" class="input resize-y"${_scopeId}>${ssrInterpolate(unref(form).excerpt)}</textarea></div><div class="space-y-1.5"${_scopeId}><label class="label" for="ct"${_scopeId}>Nội dung</label>`);
            _push2(ssrRenderComponent(_sfc_main$w, {
              modelValue: unref(form).content,
              "onUpdate:modelValue": ($event) => unref(form).content = $event,
              rows: 18
            }, null, _parent2, _scopeId));
            if (unref(form).errors.content) {
              _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.content)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div><div class="space-y-4"${_scopeId}><div class="adm-card space-y-4 p-4"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="st"${_scopeId}>Trạng thái</label><select id="st" class="input"${_scopeId}><option value="published"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "published") : ssrLooseEqual(unref(form).status, "published")) ? " selected" : ""}${_scopeId}>Đã đăng</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "draft") : ssrLooseEqual(unref(form).status, "draft")) ? " selected" : ""}${_scopeId}>Nháp</option><option value="hidden"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "hidden") : ssrLooseEqual(unref(form).status, "hidden")) ? " selected" : ""}${_scopeId}>Ẩn</option></select></div><div class="space-y-1.5"${_scopeId}><label class="label" for="cat"${_scopeId}>Chuyên mục</label><select id="cat" class="input"${_scopeId}><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).category_id) ? ssrLooseContain(unref(form).category_id, null) : ssrLooseEqual(unref(form).category_id, null)) ? " selected" : ""}${_scopeId}>— chưa xếp —</option><!--[-->`);
            ssrRenderList(__props.categories, (c) => {
              _push2(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).category_id) ? ssrLooseContain(unref(form).category_id, c.id) : ssrLooseEqual(unref(form).category_id, c.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(c.name)}</option>`);
            });
            _push2(`<!--]--></select></div><div class="space-y-1.5"${_scopeId}><label class="label" for="pub"${_scopeId}>Thời điểm đăng</label><input id="pub"${ssrRenderAttr("value", unref(form).published_at)} type="datetime-local" class="input"${_scopeId}></div><label class="flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_featured) ? ssrLooseContain(unref(form).is_featured, null) : unref(form).is_featured) ? " checked" : ""} type="checkbox" class="accent-[#FE2C55]"${_scopeId}> Tin nổi bật (hiện đầu trang chủ) </label></div><div class="adm-card space-y-4 p-4"${_scopeId}><p class="text-[13.5px] font-bold"${_scopeId}>Ảnh và nguồn</p><div class="space-y-1.5"${_scopeId}><label class="label" for="img"${_scopeId}>Ảnh đại diện</label><input id="img"${ssrRenderAttr("value", unref(form).image_url)} class="input font-mono !text-[12px]" placeholder="https://…"${_scopeId}>`);
            if (unref(form).image_url) {
              _push2(`<img${ssrRenderAttr("src", unref(form).image_url)} alt="" class="mt-1.5 aspect-[16/9] w-full rounded-lg object-cover"${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="grid grid-cols-2 gap-2.5"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="src"${_scopeId}>Nguồn</label><input id="src"${ssrRenderAttr("value", unref(form).source)} class="input !text-[13px]" placeholder="Kenh14"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label" for="surl"${_scopeId}>Link gốc</label><input id="surl"${ssrRenderAttr("value", unref(form).source_url)} class="input font-mono !text-[12px]"${_scopeId}></div></div></div><div class="adm-card space-y-4 p-4"${_scopeId}><p class="text-[13.5px] font-bold"${_scopeId}>SEO</p><div class="space-y-1.5"${_scopeId}><label class="label" for="seot"${_scopeId}> Tiêu đề SEO <span class="float-right font-normal tabular-nums" style="${ssrRenderStyle({ color: titleLen.value > 60 ? "var(--color-accent-ink)" : "var(--color-ink-muted)" })}"${_scopeId}>${ssrInterpolate(titleLen.value)}/60 </span></label><input id="seot"${ssrRenderAttr("value", unref(form).seo_title)} class="input !text-[13px]"${ssrRenderAttr("placeholder", unref(form).title || "Để trống = dùng tiêu đề bài")}${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label" for="seod"${_scopeId}> Mô tả SEO <span class="float-right font-normal tabular-nums" style="${ssrRenderStyle({ color: descLen.value > 155 ? "var(--color-accent-ink)" : "var(--color-ink-muted)" })}"${_scopeId}>${ssrInterpolate(descLen.value)}/155 </span></label><textarea id="seod" rows="3" class="input resize-y !text-[13px]" placeholder="Để trống = dùng sapo"${_scopeId}>${ssrInterpolate(unref(form).seo_description)}</textarea></div><p class="rounded-lg bg-surface px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted"${_scopeId}> Google thường cắt tiêu đề ở khoảng 60 ký tự và mô tả ở 155. Vượt quá không bị phạt, chỉ là phần thừa không ai đọc được. </p></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "mb-5 flex flex-wrap items-center gap-2.5" }, [
                createVNode(_sfc_main$v, {
                  icon: "back",
                  label: "Về danh sách",
                  as: "link",
                  href: "/admin/articles"
                }),
                createVNode("div", { class: "min-w-0" }, [
                  createVNode("h1", { class: "text-[20px] font-extrabold leading-tight tracking-tight" }, toDisplayString(isNew.value ? "Viết bài mới" : "Sửa bài"), 1),
                  __props.article ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "truncate text-[12px] text-ink-muted"
                  }, toDisplayString(__props.article.title), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "ml-auto flex items-center gap-2" }, [
                  __props.article && __props.article.status === "published" ? (openBlock(), createBlock("a", {
                    key: 0,
                    href: `/news/${__props.article.slug}`,
                    target: "_blank",
                    class: "btn !py-1.5 !text-[13px]"
                  }, [
                    createVNode(_sfc_main$x, {
                      name: "eye",
                      size: "size-3.5"
                    }),
                    createTextVNode(" Xem trên web ")
                  ], 8, ["href"])) : createCommentVNode("", true),
                  __props.article && can.value["articles.delete"] ? (openBlock(), createBlock("button", {
                    key: 1,
                    class: "btn btn-danger !py-1.5 !text-[13px]",
                    onClick: remove
                  }, [
                    createVNode(_sfc_main$x, {
                      name: "trash",
                      size: "size-3.5"
                    }),
                    createTextVNode(" Xoá ")
                  ])) : createCommentVNode("", true),
                  createVNode("button", {
                    class: "btn btn-primary",
                    disabled: unref(form).processing || !unref(form).title,
                    onClick: save
                  }, [
                    createVNode(_sfc_main$x, {
                      name: "save",
                      size: "size-4"
                    }),
                    createTextVNode(" " + toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu bài"), 1)
                  ], 8, ["disabled"])
                ])
              ]),
              createVNode("div", { class: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]" }, [
                createVNode("div", { class: "adm-card space-y-4 p-5" }, [
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "t"
                    }, "Tiêu đề"),
                    withDirectives(createVNode("input", {
                      id: "t",
                      "onUpdate:modelValue": ($event) => unref(form).title = $event,
                      class: "input !text-[16px] !font-semibold",
                      placeholder: "Tiêu đề bài viết"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).title]
                    ]),
                    unref(form).errors.title ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[12px] text-accent-ink"
                    }, toDisplayString(unref(form).errors.title), 1)) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "ex"
                    }, [
                      createTextVNode("Sapo "),
                      createVNode("span", { class: "font-normal text-ink-muted" }, "(đoạn mở đầu)")
                    ]),
                    withDirectives(createVNode("textarea", {
                      id: "ex",
                      "onUpdate:modelValue": ($event) => unref(form).excerpt = $event,
                      rows: "3",
                      class: "input resize-y"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).excerpt]
                    ])
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", {
                      class: "label",
                      for: "ct"
                    }, "Nội dung"),
                    createVNode(_sfc_main$w, {
                      modelValue: unref(form).content,
                      "onUpdate:modelValue": ($event) => unref(form).content = $event,
                      rows: 18
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    unref(form).errors.content ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[12px] text-accent-ink"
                    }, toDisplayString(unref(form).errors.content), 1)) : createCommentVNode("", true)
                  ])
                ]),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode("div", { class: "adm-card space-y-4 p-4" }, [
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "st"
                      }, "Trạng thái"),
                      withDirectives(createVNode("select", {
                        id: "st",
                        "onUpdate:modelValue": ($event) => unref(form).status = $event,
                        class: "input"
                      }, [
                        createVNode("option", { value: "published" }, "Đã đăng"),
                        createVNode("option", { value: "draft" }, "Nháp"),
                        createVNode("option", { value: "hidden" }, "Ẩn")
                      ], 8, ["onUpdate:modelValue"]), [
                        [vModelSelect, unref(form).status]
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "cat"
                      }, "Chuyên mục"),
                      withDirectives(createVNode("select", {
                        id: "cat",
                        "onUpdate:modelValue": ($event) => unref(form).category_id = $event,
                        class: "input"
                      }, [
                        createVNode("option", { value: null }, "— chưa xếp —"),
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (c) => {
                          return openBlock(), createBlock("option", {
                            key: c.id,
                            value: c.id
                          }, toDisplayString(c.name), 9, ["value"]);
                        }), 128))
                      ], 8, ["onUpdate:modelValue"]), [
                        [vModelSelect, unref(form).category_id]
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "pub"
                      }, "Thời điểm đăng"),
                      withDirectives(createVNode("input", {
                        id: "pub",
                        "onUpdate:modelValue": ($event) => unref(form).published_at = $event,
                        type: "datetime-local",
                        class: "input"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).published_at]
                      ])
                    ]),
                    createVNode("label", { class: "flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).is_featured = $event,
                        type: "checkbox",
                        class: "accent-[#FE2C55]"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, unref(form).is_featured]
                      ]),
                      createTextVNode(" Tin nổi bật (hiện đầu trang chủ) ")
                    ])
                  ]),
                  createVNode("div", { class: "adm-card space-y-4 p-4" }, [
                    createVNode("p", { class: "text-[13.5px] font-bold" }, "Ảnh và nguồn"),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "img"
                      }, "Ảnh đại diện"),
                      withDirectives(createVNode("input", {
                        id: "img",
                        "onUpdate:modelValue": ($event) => unref(form).image_url = $event,
                        class: "input font-mono !text-[12px]",
                        placeholder: "https://…"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).image_url]
                      ]),
                      unref(form).image_url ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: unref(form).image_url,
                        alt: "",
                        class: "mt-1.5 aspect-[16/9] w-full rounded-lg object-cover"
                      }, null, 8, ["src"])) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2.5" }, [
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", {
                          class: "label",
                          for: "src"
                        }, "Nguồn"),
                        withDirectives(createVNode("input", {
                          id: "src",
                          "onUpdate:modelValue": ($event) => unref(form).source = $event,
                          class: "input !text-[13px]",
                          placeholder: "Kenh14"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).source]
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", {
                          class: "label",
                          for: "surl"
                        }, "Link gốc"),
                        withDirectives(createVNode("input", {
                          id: "surl",
                          "onUpdate:modelValue": ($event) => unref(form).source_url = $event,
                          class: "input font-mono !text-[12px]"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).source_url]
                        ])
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "adm-card space-y-4 p-4" }, [
                    createVNode("p", { class: "text-[13.5px] font-bold" }, "SEO"),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "seot"
                      }, [
                        createTextVNode(" Tiêu đề SEO "),
                        createVNode("span", {
                          class: "float-right font-normal tabular-nums",
                          style: { color: titleLen.value > 60 ? "var(--color-accent-ink)" : "var(--color-ink-muted)" }
                        }, toDisplayString(titleLen.value) + "/60 ", 5)
                      ]),
                      withDirectives(createVNode("input", {
                        id: "seot",
                        "onUpdate:modelValue": ($event) => unref(form).seo_title = $event,
                        class: "input !text-[13px]",
                        placeholder: unref(form).title || "Để trống = dùng tiêu đề bài"
                      }, null, 8, ["onUpdate:modelValue", "placeholder"]), [
                        [vModelText, unref(form).seo_title]
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "seod"
                      }, [
                        createTextVNode(" Mô tả SEO "),
                        createVNode("span", {
                          class: "float-right font-normal tabular-nums",
                          style: { color: descLen.value > 155 ? "var(--color-accent-ink)" : "var(--color-ink-muted)" }
                        }, toDisplayString(descLen.value) + "/155 ", 5)
                      ]),
                      withDirectives(createVNode("textarea", {
                        id: "seod",
                        "onUpdate:modelValue": ($event) => unref(form).seo_description = $event,
                        rows: "3",
                        class: "input resize-y !text-[13px]",
                        placeholder: "Để trống = dùng sapo"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).seo_description]
                      ])
                    ]),
                    createVNode("p", { class: "rounded-lg bg-surface px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted" }, " Google thường cắt tiêu đề ở khoảng 60 ký tự và mô tả ở 155. Vượt quá không bị phạt, chỉ là phần thừa không ai đọc được. ")
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$u = _sfc_main$u.setup;
_sfc_main$u.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/ArticleEdit.vue");
  return _sfc_setup$u ? _sfc_setup$u(props, ctx) : void 0;
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$u
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$t = {
  __name: "PageHeader",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "mb-5 flex flex-wrap items-end justify-between gap-3" }, _attrs))}><div class="min-w-0"><h1 class="text-[22px] font-extrabold leading-tight tracking-tight">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.subtitle) {
        _push(`<p class="mt-0.5 text-[13px] text-ink-muted">${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-wrap items-center gap-2">`);
      ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
      _push(`</div></header>`);
    };
  }
};
const _sfc_setup$t = _sfc_main$t.setup;
_sfc_main$t.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/PageHeader.vue");
  return _sfc_setup$t ? _sfc_setup$t(props, ctx) : void 0;
};
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
function fmtAgo(v) {
  if (!v) return "";
  const diff = (Date.now() - new Date(v).getTime()) / 1e3;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return fmtDate(v);
}
const fmtNumber = (n) => (n ?? 0).toLocaleString("vi-VN");
const _sfc_main$s = {
  __name: "StatTile",
  __ssrInlineRender: true,
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    hint: { type: String, default: "" },
    tone: { type: String, default: "ink" },
    // ink | accent | cyan
    icon: { type: String, default: "" }
  },
  setup(__props) {
    const TONES = {
      ink: { bg: "var(--color-surface-2)", fg: "var(--color-ink-2)" },
      accent: { bg: "var(--color-accent-soft)", fg: "var(--color-accent-ink)" },
      cyan: { bg: "color-mix(in srgb, var(--color-cyan) 12%, transparent)", fg: "var(--color-cyan)" }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "adm-card flex items-center gap-3 p-3.5" }, _attrs))}>`);
      if (__props.icon) {
        _push(`<span class="grid size-9 shrink-0 place-items-center rounded-lg" style="${ssrRenderStyle({ background: TONES[__props.tone].bg, color: TONES[__props.tone].fg })}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]" stroke-linecap="round" stroke-linejoin="round"><path${ssrRenderAttr("d", __props.icon)}></path></svg></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="min-w-0"><p class="truncate text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">${ssrInterpolate(__props.label)}</p><p class="text-[22px] font-extrabold leading-tight tabular-nums">${ssrInterpolate(typeof __props.value === "number" ? unref(fmtNumber)(__props.value) : __props.value)}</p>`);
      if (__props.hint) {
        _push(`<p class="text-[11.5px] font-semibold text-cyan">${ssrInterpolate(__props.hint)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$s = _sfc_main$s.setup;
_sfc_main$s.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/StatTile.vue");
  return _sfc_setup$s ? _sfc_setup$s(props, ctx) : void 0;
};
const _sfc_main$r = {
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: { type: String, default: "Chưa có gì ở đây" },
    hint: { type: String, default: "" },
    icon: { type: String, default: "M4 4h16v16H4zM8 9h8M8 13h5" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid place-items-center px-6 py-16 text-center" }, _attrs))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="size-11 text-ink-muted/40" stroke-linecap="round" stroke-linejoin="round"><path${ssrRenderAttr("d", __props.icon)}></path></svg><p class="mt-3.5 text-[14.5px] font-bold">${ssrInterpolate(__props.title)}</p>`);
      if (__props.hint) {
        _push(`<p class="mt-1 max-w-sm text-[13px] text-ink-muted">${ssrInterpolate(__props.hint)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-4">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$r = _sfc_main$r.setup;
_sfc_main$r.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/EmptyState.vue");
  return _sfc_setup$r ? _sfc_setup$r(props, ctx) : void 0;
};
const _sfc_main$q = {
  __name: "Switch",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<label${ssrRenderAttrs(mergeProps({
        class: ["inline-flex cursor-pointer items-center gap-2", __props.disabled && "pointer-events-none opacity-50"]
      }, _attrs))}><input type="checkbox" class="sr-only"${ssrIncludeBooleanAttr(__props.modelValue) ? " checked" : ""}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}><span class="${ssrRenderClass(["adm-switch", __props.modelValue && "adm-switch-on"])}"></span>`);
      if (__props.label) {
        _push(`<span class="text-[13px] font-medium">${ssrInterpolate(__props.label)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label>`);
    };
  }
};
const _sfc_setup$q = _sfc_main$q.setup;
_sfc_main$q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/Switch.vue");
  return _sfc_setup$q ? _sfc_setup$q(props, ctx) : void 0;
};
const _sfc_main$p = {
  __name: "Pagination",
  __ssrInlineRender: true,
  props: {
    /** Nguyên đối tượng paginator của Laravel. */
    page: { type: Object, required: true },
    /** Nhãn cho dòng "Hiển thị 1–25 trong 597 <đơn vị>". */
    unit: { type: String, default: "mục" }
  },
  setup(__props) {
    const props = __props;
    const cur = computed(() => props.page.current_page || 1);
    const last = computed(() => props.page.last_page || 1);
    const pages = computed(() => {
      const n = last.value;
      if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
      const out = /* @__PURE__ */ new Set([1, n, cur.value]);
      for (let d = 1; d <= 2; d++) {
        if (cur.value - d > 1) out.add(cur.value - d);
        if (cur.value + d < n) out.add(cur.value + d);
      }
      const sorted = [...out].sort((a, b) => a - b);
      const withGaps = [];
      sorted.forEach((p, i) => {
        if (i && p - sorted[i - 1] > 1) withGaps.push("…");
        withGaps.push(p);
      });
      return withGaps;
    });
    function url(p) {
      const base = props.page.path || (typeof window !== "undefined" ? window.location.pathname : "");
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      p === 1 ? params.delete("page") : params.set("page", p);
      const q = params.toString();
      return base + (q ? `?${q}` : "");
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (last.value > 1) {
        _push(`<nav${ssrRenderAttrs(mergeProps({
          class: "flex flex-wrap items-center justify-between gap-3",
          "aria-label": "Phân trang"
        }, _attrs))}><p class="text-[12.5px] text-ink-muted tabular-nums"> Hiển thị <strong class="font-semibold text-ink-2">${ssrInterpolate(unref(fmtNumber)(__props.page.from))}–${ssrInterpolate(unref(fmtNumber)(__props.page.to))}</strong> trong ${ssrInterpolate(unref(fmtNumber)(__props.page.total))} ${ssrInterpolate(__props.unit)}</p><div class="flex items-center gap-1">`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.page.prev_page_url ? unref(Link) : "span"), {
          href: __props.page.prev_page_url || void 0,
          "preserve-scroll": __props.page.prev_page_url ? true : void 0,
          class: ["pg", !__props.page.prev_page_url && "pg-off"],
          "aria-disabled": !__props.page.prev_page_url,
          rel: "prev"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-3.5"${_scopeId}><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"${_scopeId}></path></svg><span class="hidden sm:inline"${_scopeId}>Trước</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  class: "size-3.5"
                }, [
                  createVNode("path", {
                    d: "m15 18-6-6 6-6",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ])),
                createVNode("span", { class: "hidden sm:inline" }, "Trước")
              ];
            }
          }),
          _: 1
        }), _parent);
        _push(`<span class="px-2 text-[13px] font-semibold tabular-nums sm:hidden">${ssrInterpolate(cur.value)} / ${ssrInterpolate(last.value)}</span><!--[-->`);
        ssrRenderList(pages.value, (p, i) => {
          _push(`<!--[-->`);
          if (p === "…") {
            _push(`<span class="hidden px-1 text-[13px] text-ink-muted sm:inline">…</span>`);
          } else if (p !== cur.value) {
            _push(ssrRenderComponent(unref(Link), {
              href: url(p),
              "preserve-scroll": "",
              class: "pg hidden tabular-nums sm:inline-flex"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(p)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(p), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span class="pg pg-on hidden tabular-nums sm:inline-flex" aria-current="page">${ssrInterpolate(p)}</span>`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]-->`);
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.page.next_page_url ? unref(Link) : "span"), {
          href: __props.page.next_page_url || void 0,
          "preserve-scroll": __props.page.next_page_url ? true : void 0,
          class: ["pg", !__props.page.next_page_url && "pg-off"],
          "aria-disabled": !__props.page.next_page_url,
          rel: "next"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="hidden sm:inline"${_scopeId}>Sau</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-3.5"${_scopeId}><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"${_scopeId}></path></svg>`);
            } else {
              return [
                createVNode("span", { class: "hidden sm:inline" }, "Sau"),
                (openBlock(), createBlock("svg", {
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2.2",
                  class: "size-3.5"
                }, [
                  createVNode("path", {
                    d: "m9 6 6 6-6 6",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ]))
              ];
            }
          }),
          _: 1
        }), _parent);
        _push(`</div></nav>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$p = _sfc_main$p.setup;
_sfc_main$p.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Pagination.vue");
  return _sfc_setup$p ? _sfc_setup$p(props, ctx) : void 0;
};
const _sfc_main$o = {
  __name: "Articles",
  __ssrInlineRender: true,
  props: {
    articles: { type: Object, required: true },
    categories: { type: Array, default: () => [] },
    filters: { type: Object, default: () => ({}) },
    stats: { type: Object, default: () => ({}) }
  },
  setup(__props) {
    const props = __props;
    const f = ref({
      q: props.filters.q || "",
      status: props.filters.status || "",
      category: props.filters.category || ""
    });
    let timer;
    watch(f, (v) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        router.get(
          "/admin/articles",
          Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "")),
          { preserveState: true, replace: true }
        );
      }, 300);
    }, { deep: true });
    function toggle(a, field, value) {
      router.patch(`/admin/articles/${a.id}/doi`, { field, value }, { preserveScroll: true });
    }
    function remove(a) {
      if (confirm(`Xoá “${a.title.slice(0, 60)}…”?`)) {
        router.delete(`/admin/articles/${a.id}`, { preserveScroll: true });
      }
    }
    const STATUS = { published: "Đã đăng", draft: "Nháp", hidden: "Ẩn" };
    const STATUS_COLOR = { published: "#0A9CB0", draft: "#74747F", hidden: "#D91644" };
    const can = computed(() => usePage().props.auth?.user?.can || {});
    const TILE_ICON = {
      total: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
      published: "m5 13 4 4L19 7",
      draft: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
      today: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Tin bài · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Tin bài",
              subtitle: "Bài lấy tự động từ RSS và bài tự viết nằm chung ở đây."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (can.value["articles.edit"]) {
                    _push3(ssrRenderComponent(unref(Link), {
                      href: "/admin/articles/new",
                      class: "btn btn-primary"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_sfc_main$x, { name: "plus" }, null, _parent4, _scopeId3));
                          _push4(` Viết bài mới `);
                        } else {
                          return [
                            createVNode(_sfc_main$x, { name: "plus" }),
                            createTextVNode(" Viết bài mới ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    can.value["articles.edit"] ? (openBlock(), createBlock(unref(Link), {
                      key: 0,
                      href: "/admin/articles/new",
                      class: "btn btn-primary"
                    }, {
                      default: withCtx(() => [
                        createVNode(_sfc_main$x, { name: "plus" }),
                        createTextVNode(" Viết bài mới ")
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><!--[-->`);
            ssrRenderList({ total: "Tổng bài", published: "Đã đăng", draft: "Nháp", today: "Hôm nay" }, (label, key) => {
              _push2(ssrRenderComponent(_sfc_main$s, {
                key,
                label,
                value: __props.stats[key] ?? 0,
                icon: TILE_ICON[key],
                tone: key === "published" ? "cyan" : key === "today" ? "accent" : "ink"
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div><div class="mb-4 flex flex-wrap items-end gap-2.5"${_scopeId}><div class="min-w-[200px] flex-1 space-y-1.5"${_scopeId}><label class="label" for="q"${_scopeId}>Tìm theo tiêu đề</label><input id="q"${ssrRenderAttr("value", f.value.q)} class="input" placeholder="vd: Sơn Tùng…"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label" for="st"${_scopeId}>Trạng thái</label><select id="st" class="input !w-36"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(f.value.status) ? ssrLooseContain(f.value.status, "") : ssrLooseEqual(f.value.status, "")) ? " selected" : ""}${_scopeId}>Tất cả</option><!--[-->`);
            ssrRenderList(STATUS, (l, k) => {
              _push2(`<option${ssrRenderAttr("value", k)}${ssrIncludeBooleanAttr(Array.isArray(f.value.status) ? ssrLooseContain(f.value.status, k) : ssrLooseEqual(f.value.status, k)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(l)}</option>`);
            });
            _push2(`<!--]--></select></div><div class="space-y-1.5"${_scopeId}><label class="label" for="cat"${_scopeId}>Chuyên mục</label><select id="cat" class="input !w-40"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(f.value.category) ? ssrLooseContain(f.value.category, "") : ssrLooseEqual(f.value.category, "")) ? " selected" : ""}${_scopeId}>Tất cả</option><!--[-->`);
            ssrRenderList(__props.categories, (c) => {
              _push2(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(f.value.category) ? ssrLooseContain(f.value.category, c.id) : ssrLooseEqual(f.value.category, c.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(c.name)}</option>`);
            });
            _push2(`<!--]--></select></div></div><div class="adm-card overflow-hidden"${_scopeId}>`);
            if (__props.articles.data.length) {
              _push2(`<div class="max-h-[calc(100dvh-400px)] overflow-auto"${_scopeId}><table class="adm-table min-w-[900px]"${_scopeId}><thead${_scopeId}><tr${_scopeId}><th${_scopeId}>Tiêu đề</th><th class="w-[120px]"${_scopeId}>Chuyên mục</th><th class="w-[120px]"${_scopeId}>Trạng thái</th><th class="w-[86px]"${_scopeId}>Nổi bật</th><th class="w-[150px]"${_scopeId}>Tương tác</th><th class="w-[110px]"${_scopeId}>Đăng</th><th class="w-[106px]"${_scopeId}></th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(__props.articles.data, (a) => {
                _push2(`<tr${_scopeId}><td${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/admin/articles/${a.id}`,
                  class: "flex items-center gap-2.5"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      if (a.image_url) {
                        _push3(`<img${ssrRenderAttr("src", a.image_url)} alt="" loading="lazy" class="size-10 shrink-0 rounded-md object-cover"${_scopeId2}>`);
                      } else {
                        _push3(`<span class="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2"${_scopeId2}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4 text-ink-muted/60"${_scopeId2}><rect x="3" y="3" width="18" height="18" rx="2"${_scopeId2}></rect><circle cx="9" cy="9" r="2"${_scopeId2}></circle><path d="m21 15-5-5L5 21"${_scopeId2}></path></svg></span>`);
                      }
                      _push3(`<span class="line-clamp-2 max-w-[360px] text-[13.5px] font-semibold"${_scopeId2}>${ssrInterpolate(a.title)}</span>`);
                    } else {
                      return [
                        a.image_url ? (openBlock(), createBlock("img", {
                          key: 0,
                          src: a.image_url,
                          alt: "",
                          loading: "lazy",
                          class: "size-10 shrink-0 rounded-md object-cover"
                        }, null, 8, ["src"])) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "grid size-10 shrink-0 place-items-center rounded-md bg-surface-2"
                        }, [
                          (openBlock(), createBlock("svg", {
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "1.5",
                            class: "size-4 text-ink-muted/60"
                          }, [
                            createVNode("rect", {
                              x: "3",
                              y: "3",
                              width: "18",
                              height: "18",
                              rx: "2"
                            }),
                            createVNode("circle", {
                              cx: "9",
                              cy: "9",
                              r: "2"
                            }),
                            createVNode("path", { d: "m21 15-5-5L5 21" })
                          ]))
                        ])),
                        createVNode("span", { class: "line-clamp-2 max-w-[360px] text-[13.5px] font-semibold" }, toDisplayString(a.title), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</td><td${_scopeId}>`);
                if (a.category) {
                  _push2(`<span class="adm-chip" style="${ssrRenderStyle({
                    background: (a.category.color || "#FE2C55") + "1f",
                    color: a.category.color || "#FE2C55"
                  })}"${_scopeId}>${ssrInterpolate(a.category.name)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td${_scopeId}>`);
                if (can.value["articles.edit"]) {
                  _push2(`<select${ssrRenderAttr("value", a.status)} class="input !w-full !py-1 !text-[12.5px] font-semibold" style="${ssrRenderStyle({ color: STATUS_COLOR[a.status] })}"${_scopeId}><!--[-->`);
                  ssrRenderList(STATUS, (l, k) => {
                    _push2(`<option${ssrRenderAttr("value", k)}${_scopeId}>${ssrInterpolate(l)}</option>`);
                  });
                  _push2(`<!--]--></select>`);
                } else {
                  _push2(`<span class="adm-chip" style="${ssrRenderStyle({ background: STATUS_COLOR[a.status] + "1f", color: STATUS_COLOR[a.status] })}"${_scopeId}>${ssrInterpolate(STATUS[a.status])}</span>`);
                }
                _push2(`</td><td${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$q, {
                  "model-value": !!a.is_featured,
                  disabled: !can.value["articles.edit"],
                  "onUpdate:modelValue": ($event) => toggle(a, "is_featured", $event)
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="text-[12px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(a.views))} xem · ${ssrInterpolate(a.likes_count ?? 0)} thích <span class="block"${_scopeId}>${ssrInterpolate(a.comments_count ?? 0)} bình luận · ${ssrInterpolate(a.shares_count ?? 0)} chia sẻ</span></td><td class="text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtAgo)(a.published_at))}</td><td${_scopeId}><span class="rowacts"${_scopeId}>`);
                if (can.value["articles.edit"]) {
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    icon: "edit",
                    label: "Sửa bài",
                    as: "link",
                    href: `/admin/articles/${a.id}`
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_sfc_main$v, {
                  icon: "eye",
                  label: "Xem trên web",
                  tone: "cyan",
                  as: "a",
                  href: `/news/${a.slug}`,
                  target: "_blank"
                }, null, _parent2, _scopeId));
                if (can.value["articles.delete"]) {
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    icon: "trash",
                    label: "Xoá bài",
                    tone: "danger",
                    onClick: ($event) => remove(a)
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span></td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Không có bài nào khớp bộ lọc",
                hint: "Thử xoá từ khoá, hoặc chọn lại chuyên mục và trạng thái."
              }, null, _parent2, _scopeId));
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_sfc_main$p, {
              page: __props.articles,
              unit: "bài",
              class: "mt-4"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Tin bài",
                subtitle: "Bài lấy tự động từ RSS và bài tự viết nằm chung ở đây."
              }, {
                actions: withCtx(() => [
                  can.value["articles.edit"] ? (openBlock(), createBlock(unref(Link), {
                    key: 0,
                    href: "/admin/articles/new",
                    class: "btn btn-primary"
                  }, {
                    default: withCtx(() => [
                      createVNode(_sfc_main$x, { name: "plus" }),
                      createTextVNode(" Viết bài mới ")
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode("div", { class: "mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" }, [
                (openBlock(), createBlock(Fragment, null, renderList({ total: "Tổng bài", published: "Đã đăng", draft: "Nháp", today: "Hôm nay" }, (label, key) => {
                  return createVNode(_sfc_main$s, {
                    key,
                    label,
                    value: __props.stats[key] ?? 0,
                    icon: TILE_ICON[key],
                    tone: key === "published" ? "cyan" : key === "today" ? "accent" : "ink"
                  }, null, 8, ["label", "value", "icon", "tone"]);
                }), 64))
              ]),
              createVNode("div", { class: "mb-4 flex flex-wrap items-end gap-2.5" }, [
                createVNode("div", { class: "min-w-[200px] flex-1 space-y-1.5" }, [
                  createVNode("label", {
                    class: "label",
                    for: "q"
                  }, "Tìm theo tiêu đề"),
                  withDirectives(createVNode("input", {
                    id: "q",
                    "onUpdate:modelValue": ($event) => f.value.q = $event,
                    class: "input",
                    placeholder: "vd: Sơn Tùng…"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, f.value.q]
                  ])
                ]),
                createVNode("div", { class: "space-y-1.5" }, [
                  createVNode("label", {
                    class: "label",
                    for: "st"
                  }, "Trạng thái"),
                  withDirectives(createVNode("select", {
                    id: "st",
                    "onUpdate:modelValue": ($event) => f.value.status = $event,
                    class: "input !w-36"
                  }, [
                    createVNode("option", { value: "" }, "Tất cả"),
                    (openBlock(), createBlock(Fragment, null, renderList(STATUS, (l, k) => {
                      return createVNode("option", {
                        key: k,
                        value: k
                      }, toDisplayString(l), 9, ["value"]);
                    }), 64))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, f.value.status]
                  ])
                ]),
                createVNode("div", { class: "space-y-1.5" }, [
                  createVNode("label", {
                    class: "label",
                    for: "cat"
                  }, "Chuyên mục"),
                  withDirectives(createVNode("select", {
                    id: "cat",
                    "onUpdate:modelValue": ($event) => f.value.category = $event,
                    class: "input !w-40"
                  }, [
                    createVNode("option", { value: "" }, "Tất cả"),
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (c) => {
                      return openBlock(), createBlock("option", {
                        key: c.id,
                        value: c.id
                      }, toDisplayString(c.name), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, f.value.category]
                  ])
                ])
              ]),
              createVNode("div", { class: "adm-card overflow-hidden" }, [
                __props.articles.data.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "max-h-[calc(100dvh-400px)] overflow-auto"
                }, [
                  createVNode("table", { class: "adm-table min-w-[900px]" }, [
                    createVNode("thead", null, [
                      createVNode("tr", null, [
                        createVNode("th", null, "Tiêu đề"),
                        createVNode("th", { class: "w-[120px]" }, "Chuyên mục"),
                        createVNode("th", { class: "w-[120px]" }, "Trạng thái"),
                        createVNode("th", { class: "w-[86px]" }, "Nổi bật"),
                        createVNode("th", { class: "w-[150px]" }, "Tương tác"),
                        createVNode("th", { class: "w-[110px]" }, "Đăng"),
                        createVNode("th", { class: "w-[106px]" })
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.articles.data, (a) => {
                        return openBlock(), createBlock("tr", {
                          key: a.id
                        }, [
                          createVNode("td", null, [
                            createVNode(unref(Link), {
                              href: `/admin/articles/${a.id}`,
                              class: "flex items-center gap-2.5"
                            }, {
                              default: withCtx(() => [
                                a.image_url ? (openBlock(), createBlock("img", {
                                  key: 0,
                                  src: a.image_url,
                                  alt: "",
                                  loading: "lazy",
                                  class: "size-10 shrink-0 rounded-md object-cover"
                                }, null, 8, ["src"])) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "grid size-10 shrink-0 place-items-center rounded-md bg-surface-2"
                                }, [
                                  (openBlock(), createBlock("svg", {
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    "stroke-width": "1.5",
                                    class: "size-4 text-ink-muted/60"
                                  }, [
                                    createVNode("rect", {
                                      x: "3",
                                      y: "3",
                                      width: "18",
                                      height: "18",
                                      rx: "2"
                                    }),
                                    createVNode("circle", {
                                      cx: "9",
                                      cy: "9",
                                      r: "2"
                                    }),
                                    createVNode("path", { d: "m21 15-5-5L5 21" })
                                  ]))
                                ])),
                                createVNode("span", { class: "line-clamp-2 max-w-[360px] text-[13.5px] font-semibold" }, toDisplayString(a.title), 1)
                              ]),
                              _: 2
                            }, 1032, ["href"])
                          ]),
                          createVNode("td", null, [
                            a.category ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "adm-chip",
                              style: {
                                background: (a.category.color || "#FE2C55") + "1f",
                                color: a.category.color || "#FE2C55"
                              }
                            }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", null, [
                            can.value["articles.edit"] ? (openBlock(), createBlock("select", {
                              key: 0,
                              value: a.status,
                              class: "input !w-full !py-1 !text-[12.5px] font-semibold",
                              style: { color: STATUS_COLOR[a.status] },
                              onChange: ($event) => toggle(a, "status", $event.target.value)
                            }, [
                              (openBlock(), createBlock(Fragment, null, renderList(STATUS, (l, k) => {
                                return createVNode("option", {
                                  key: k,
                                  value: k
                                }, toDisplayString(l), 9, ["value"]);
                              }), 64))
                            ], 44, ["value", "onChange"])) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "adm-chip",
                              style: { background: STATUS_COLOR[a.status] + "1f", color: STATUS_COLOR[a.status] }
                            }, toDisplayString(STATUS[a.status]), 5))
                          ]),
                          createVNode("td", null, [
                            createVNode(_sfc_main$q, {
                              "model-value": !!a.is_featured,
                              disabled: !can.value["articles.edit"],
                              "onUpdate:modelValue": ($event) => toggle(a, "is_featured", $event)
                            }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "text-[12px] text-ink-muted tabular-nums" }, [
                            createTextVNode(toDisplayString(unref(fmtNumber)(a.views)) + " xem · " + toDisplayString(a.likes_count ?? 0) + " thích ", 1),
                            createVNode("span", { class: "block" }, toDisplayString(a.comments_count ?? 0) + " bình luận · " + toDisplayString(a.shares_count ?? 0) + " chia sẻ", 1)
                          ]),
                          createVNode("td", { class: "text-[12px] text-ink-muted" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1),
                          createVNode("td", null, [
                            createVNode("span", { class: "rowacts" }, [
                              can.value["articles.edit"] ? (openBlock(), createBlock(_sfc_main$v, {
                                key: 0,
                                icon: "edit",
                                label: "Sửa bài",
                                as: "link",
                                href: `/admin/articles/${a.id}`
                              }, null, 8, ["href"])) : createCommentVNode("", true),
                              createVNode(_sfc_main$v, {
                                icon: "eye",
                                label: "Xem trên web",
                                tone: "cyan",
                                as: "a",
                                href: `/news/${a.slug}`,
                                target: "_blank"
                              }, null, 8, ["href"]),
                              can.value["articles.delete"] ? (openBlock(), createBlock(_sfc_main$v, {
                                key: 1,
                                icon: "trash",
                                label: "Xoá bài",
                                tone: "danger",
                                onClick: ($event) => remove(a)
                              }, null, 8, ["onClick"])) : createCommentVNode("", true)
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])) : (openBlock(), createBlock(_sfc_main$r, {
                  key: 1,
                  title: "Không có bài nào khớp bộ lọc",
                  hint: "Thử xoá từ khoá, hoặc chọn lại chuyên mục và trạng thái."
                }))
              ]),
              createVNode(_sfc_main$p, {
                page: __props.articles,
                unit: "bài",
                class: "mt-4"
              }, null, 8, ["page"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Articles.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$o
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$n = {
  __name: "Categories",
  __ssrInlineRender: true,
  props: { categories: { type: Array, default: () => [] } },
  setup(__props) {
    const canEdit = computed(() => !!usePage().props.auth?.user?.can?.["categories.edit"]);
    const editing = ref(null);
    const toggle = (c, field) => router.put(`/admin/categories/${c.id}`, { ...c, [field]: !c[field] }, { preserveScroll: true });
    const blank = () => ({
      name: "",
      topic: "",
      description: "",
      color: "#FE2C55",
      sort: 0,
      is_active: true,
      in_menu: true,
      seo_title: "",
      seo_description: ""
    });
    const form = useForm(blank());
    function edit(c) {
      editing.value = c;
      Object.assign(form, c ? { ...blank(), ...c } : blank());
      form.clearErrors();
    }
    function save() {
      if (editing.value?.id) form.put(
        `/admin/categories/${editing.value.id}`,
        { onSuccess: () => editing.value = null }
      );
      else form.post("/admin/categories", { onSuccess: () => editing.value = null });
    }
    function remove(c) {
      if (confirm(`Xoá chuyên mục “${c.name}”?`)) {
        router.delete(`/admin/categories/${c.id}`, { preserveScroll: true });
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Chuyên mục · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Chuyên mục",
              subtitle: "Mỗi chuyên mục có nguồn RSS riêng; bộ lấy tin chạy theo danh sách này."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (canEdit.value) {
                    _push3(`<button class="btn btn-primary"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_sfc_main$x, { name: "plus" }, null, _parent3, _scopeId2));
                    _push3(` Thêm chuyên mục </button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    canEdit.value ? (openBlock(), createBlock("button", {
                      key: 0,
                      class: "btn btn-primary",
                      onClick: ($event) => edit(null)
                    }, [
                      createVNode(_sfc_main$x, { name: "plus" }),
                      createTextVNode(" Thêm chuyên mục ")
                    ], 8, ["onClick"])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="adm-card overflow-hidden"${_scopeId}>`);
            if (__props.categories.length) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="adm-table min-w-[860px]"${_scopeId}><thead${_scopeId}><tr${_scopeId}><th${_scopeId}>Chuyên mục</th><th class="w-[150px]"${_scopeId}>Đường dẫn</th><th class="w-[110px]"${_scopeId}>Chủ đề video</th><th class="w-[80px] text-right"${_scopeId}>Số bài</th><th class="w-[86px]"${_scopeId}>Bật</th><th class="w-[92px]"${_scopeId}>Trên menu</th><th class="w-[70px] text-right"${_scopeId}>Thứ tự</th><th class="w-[96px]"${_scopeId}></th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(__props.categories, (c) => {
                _push2(`<tr${_scopeId}><td${_scopeId}><div class="flex items-center gap-2.5"${_scopeId}><span class="h-7 w-1.5 shrink-0 rounded-full" style="${ssrRenderStyle({ background: c.color })}"${_scopeId}></span><div class="min-w-0"${_scopeId}><p class="truncate text-[13.5px] font-bold"${_scopeId}>${ssrInterpolate(c.name)}</p>`);
                if (c.description) {
                  _push2(`<p class="truncate text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(c.description)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></td><td${_scopeId}><a${ssrRenderAttr("href", `/category/${c.slug}`)} target="_blank" class="inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted hover:text-accent-ink"${_scopeId}> /${ssrInterpolate(c.slug)} `);
                _push2(ssrRenderComponent(_sfc_main$x, {
                  name: "external",
                  size: "size-3"
                }, null, _parent2, _scopeId));
                _push2(`</a></td><td${_scopeId}>`);
                if (c.topic) {
                  _push2(`<span class="adm-chip font-mono" style="${ssrRenderStyle({ "background": "var(--color-surface-2)" })}"${_scopeId}>${ssrInterpolate(c.topic)}</span>`);
                } else {
                  _push2(`<span class="text-ink-muted/40"${_scopeId}>—</span>`);
                }
                _push2(`</td><td class="text-right text-[13px] font-semibold tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(c.articles_count))}</td><td${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$q, {
                  "model-value": !!c.is_active,
                  disabled: !canEdit.value,
                  "onUpdate:modelValue": ($event) => toggle(c, "is_active")
                }, null, _parent2, _scopeId));
                _push2(`</td><td${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$q, {
                  "model-value": !!c.in_menu,
                  disabled: !canEdit.value,
                  "onUpdate:modelValue": ($event) => toggle(c, "in_menu")
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="text-right text-[13px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(c.sort)}</td><td${_scopeId}>`);
                if (canEdit.value) {
                  _push2(`<span class="rowacts"${_scopeId}>`);
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    icon: "edit",
                    label: "Sửa chuyên mục",
                    onClick: ($event) => edit(c)
                  }, null, _parent2, _scopeId));
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    icon: "trash",
                    label: "Xoá chuyên mục",
                    tone: "danger",
                    onClick: ($event) => remove(c)
                  }, null, _parent2, _scopeId));
                  _push2(`</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Chưa có chuyên mục nào",
                hint: "Thêm chuyên mục đầu tiên rồi khai báo nguồn RSS cho nó.",
                icon: "M3 7h18M3 12h18M3 17h10"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    if (canEdit.value) {
                      _push3(`<button class="btn btn-primary"${_scopeId2}>Thêm chuyên mục</button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      canEdit.value ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "btn btn-primary",
                        onClick: ($event) => edit(null)
                      }, "Thêm chuyên mục", 8, ["onClick"])) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(`</div>`);
            ssrRenderTeleport(_push2, (_push3) => {
              if (editing.value !== null) {
                _push3(`<div class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"${_scopeId}><div class="adm-card my-6 w-full max-w-lg p-5"${_scopeId}><h2 class="text-base font-extrabold"${_scopeId}>${ssrInterpolate(editing.value?.id ? "Sửa chuyên mục" : "Thêm chuyên mục")}</h2><div class="mt-4 space-y-3.5"${_scopeId}><div class="grid gap-3 sm:grid-cols-2"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Tên</label><input${ssrRenderAttr("value", unref(form).name)} class="input" placeholder="vd: Âm nhạc"${_scopeId}>`);
                if (unref(form).errors.name) {
                  _push3(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.name)}</p>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</div><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Chủ đề video (tuỳ chọn)</label><input${ssrRenderAttr("value", unref(form).topic)} class="input font-mono !text-[13px]" placeholder="bongda"${_scopeId}><p class="text-[11px] text-ink-muted"${_scopeId}>Nối với chủ đề bên dây chuyền video.</p></div></div><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Mô tả</label><input${ssrRenderAttr("value", unref(form).description)} class="input"${_scopeId}></div><div class="grid gap-3 sm:grid-cols-[auto_1fr_auto]"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Màu</label><input${ssrRenderAttr("value", unref(form).color)} type="color" class="h-9 w-14 rounded-lg border border-line"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Mã màu</label><input${ssrRenderAttr("value", unref(form).color)} class="input font-mono !text-[13px]"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Thứ tự</label><input${ssrRenderAttr("value", unref(form).sort)} type="number" class="input !w-20 tabular-nums"${_scopeId}></div></div><div class="flex gap-5"${_scopeId}><label class="flex cursor-pointer items-center gap-2 text-[13.5px]"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_active) ? ssrLooseContain(unref(form).is_active, null) : unref(form).is_active) ? " checked" : ""} type="checkbox" class="accent-[#FE2C55]"${_scopeId}> Đang bật </label><label class="flex cursor-pointer items-center gap-2 text-[13.5px]"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).in_menu) ? ssrLooseContain(unref(form).in_menu, null) : unref(form).in_menu) ? " checked" : ""} type="checkbox" class="accent-[#FE2C55]"${_scopeId}> Hiện trên menu </label></div><div class="space-y-1.5 border-t border-line pt-3.5"${_scopeId}><label class="label"${_scopeId}>Tiêu đề SEO</label><input${ssrRenderAttr("value", unref(form).seo_title)} class="input !text-[13px]"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label"${_scopeId}>Mô tả SEO</label><textarea rows="2" class="input resize-y !text-[13px]"${_scopeId}>${ssrInterpolate(unref(form).seo_description)}</textarea></div></div><div class="mt-5 flex justify-end gap-2"${_scopeId}><button class="btn"${_scopeId}>Huỷ</button><button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).name) ? " disabled" : ""}${_scopeId}> Lưu </button></div></div></div>`);
              } else {
                _push3(`<!---->`);
              }
            }, "body", false, _parent2);
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Chuyên mục",
                subtitle: "Mỗi chuyên mục có nguồn RSS riêng; bộ lấy tin chạy theo danh sách này."
              }, {
                actions: withCtx(() => [
                  canEdit.value ? (openBlock(), createBlock("button", {
                    key: 0,
                    class: "btn btn-primary",
                    onClick: ($event) => edit(null)
                  }, [
                    createVNode(_sfc_main$x, { name: "plus" }),
                    createTextVNode(" Thêm chuyên mục ")
                  ], 8, ["onClick"])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode("div", { class: "adm-card overflow-hidden" }, [
                __props.categories.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "overflow-x-auto"
                }, [
                  createVNode("table", { class: "adm-table min-w-[860px]" }, [
                    createVNode("thead", null, [
                      createVNode("tr", null, [
                        createVNode("th", null, "Chuyên mục"),
                        createVNode("th", { class: "w-[150px]" }, "Đường dẫn"),
                        createVNode("th", { class: "w-[110px]" }, "Chủ đề video"),
                        createVNode("th", { class: "w-[80px] text-right" }, "Số bài"),
                        createVNode("th", { class: "w-[86px]" }, "Bật"),
                        createVNode("th", { class: "w-[92px]" }, "Trên menu"),
                        createVNode("th", { class: "w-[70px] text-right" }, "Thứ tự"),
                        createVNode("th", { class: "w-[96px]" })
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.categories, (c) => {
                        return openBlock(), createBlock("tr", {
                          key: c.id
                        }, [
                          createVNode("td", null, [
                            createVNode("div", { class: "flex items-center gap-2.5" }, [
                              createVNode("span", {
                                class: "h-7 w-1.5 shrink-0 rounded-full",
                                style: { background: c.color }
                              }, null, 4),
                              createVNode("div", { class: "min-w-0" }, [
                                createVNode("p", { class: "truncate text-[13.5px] font-bold" }, toDisplayString(c.name), 1),
                                c.description ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "truncate text-[12px] text-ink-muted"
                                }, toDisplayString(c.description), 1)) : createCommentVNode("", true)
                              ])
                            ])
                          ]),
                          createVNode("td", null, [
                            createVNode("a", {
                              href: `/category/${c.slug}`,
                              target: "_blank",
                              class: "inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted hover:text-accent-ink"
                            }, [
                              createTextVNode(" /" + toDisplayString(c.slug) + " ", 1),
                              createVNode(_sfc_main$x, {
                                name: "external",
                                size: "size-3"
                              })
                            ], 8, ["href"])
                          ]),
                          createVNode("td", null, [
                            c.topic ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "adm-chip font-mono",
                              style: { "background": "var(--color-surface-2)" }
                            }, toDisplayString(c.topic), 1)) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "text-ink-muted/40"
                            }, "—"))
                          ]),
                          createVNode("td", { class: "text-right text-[13px] font-semibold tabular-nums" }, toDisplayString(unref(fmtNumber)(c.articles_count)), 1),
                          createVNode("td", null, [
                            createVNode(_sfc_main$q, {
                              "model-value": !!c.is_active,
                              disabled: !canEdit.value,
                              "onUpdate:modelValue": ($event) => toggle(c, "is_active")
                            }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", null, [
                            createVNode(_sfc_main$q, {
                              "model-value": !!c.in_menu,
                              disabled: !canEdit.value,
                              "onUpdate:modelValue": ($event) => toggle(c, "in_menu")
                            }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "text-right text-[13px] text-ink-muted tabular-nums" }, toDisplayString(c.sort), 1),
                          createVNode("td", null, [
                            canEdit.value ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "rowacts"
                            }, [
                              createVNode(_sfc_main$v, {
                                icon: "edit",
                                label: "Sửa chuyên mục",
                                onClick: ($event) => edit(c)
                              }, null, 8, ["onClick"]),
                              createVNode(_sfc_main$v, {
                                icon: "trash",
                                label: "Xoá chuyên mục",
                                tone: "danger",
                                onClick: ($event) => remove(c)
                              }, null, 8, ["onClick"])
                            ])) : createCommentVNode("", true)
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])) : (openBlock(), createBlock(_sfc_main$r, {
                  key: 1,
                  title: "Chưa có chuyên mục nào",
                  hint: "Thêm chuyên mục đầu tiên rồi khai báo nguồn RSS cho nó.",
                  icon: "M3 7h18M3 12h18M3 17h10"
                }, {
                  default: withCtx(() => [
                    canEdit.value ? (openBlock(), createBlock("button", {
                      key: 0,
                      class: "btn btn-primary",
                      onClick: ($event) => edit(null)
                    }, "Thêm chuyên mục", 8, ["onClick"])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }))
              ]),
              (openBlock(), createBlock(Teleport, { to: "body" }, [
                editing.value !== null ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4",
                  onClick: withModifiers(($event) => editing.value = null, ["self"])
                }, [
                  createVNode("div", { class: "adm-card my-6 w-full max-w-lg p-5" }, [
                    createVNode("h2", { class: "text-base font-extrabold" }, toDisplayString(editing.value?.id ? "Sửa chuyên mục" : "Thêm chuyên mục"), 1),
                    createVNode("div", { class: "mt-4 space-y-3.5" }, [
                      createVNode("div", { class: "grid gap-3 sm:grid-cols-2" }, [
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", { class: "label" }, "Tên"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).name = $event,
                            class: "input",
                            placeholder: "vd: Âm nhạc"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).name]
                          ]),
                          unref(form).errors.name ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "text-[12px] text-accent-ink"
                          }, toDisplayString(unref(form).errors.name), 1)) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", { class: "label" }, "Chủ đề video (tuỳ chọn)"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).topic = $event,
                            class: "input font-mono !text-[13px]",
                            placeholder: "bongda"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).topic]
                          ]),
                          createVNode("p", { class: "text-[11px] text-ink-muted" }, "Nối với chủ đề bên dây chuyền video.")
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", { class: "label" }, "Mô tả"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).description = $event,
                          class: "input"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).description]
                        ])
                      ]),
                      createVNode("div", { class: "grid gap-3 sm:grid-cols-[auto_1fr_auto]" }, [
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", { class: "label" }, "Màu"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).color = $event,
                            type: "color",
                            class: "h-9 w-14 rounded-lg border border-line"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).color]
                          ])
                        ]),
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", { class: "label" }, "Mã màu"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).color = $event,
                            class: "input font-mono !text-[13px]"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).color]
                          ])
                        ]),
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", { class: "label" }, "Thứ tự"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).sort = $event,
                            type: "number",
                            class: "input !w-20 tabular-nums"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [
                              vModelText,
                              unref(form).sort,
                              void 0,
                              { number: true }
                            ]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "flex gap-5" }, [
                        createVNode("label", { class: "flex cursor-pointer items-center gap-2 text-[13.5px]" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).is_active = $event,
                            type: "checkbox",
                            class: "accent-[#FE2C55]"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, unref(form).is_active]
                          ]),
                          createTextVNode(" Đang bật ")
                        ]),
                        createVNode("label", { class: "flex cursor-pointer items-center gap-2 text-[13.5px]" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).in_menu = $event,
                            type: "checkbox",
                            class: "accent-[#FE2C55]"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, unref(form).in_menu]
                          ]),
                          createTextVNode(" Hiện trên menu ")
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1.5 border-t border-line pt-3.5" }, [
                        createVNode("label", { class: "label" }, "Tiêu đề SEO"),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_title = $event,
                          class: "input !text-[13px]"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_title]
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", { class: "label" }, "Mô tả SEO"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => unref(form).seo_description = $event,
                          rows: "2",
                          class: "input resize-y !text-[13px]"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).seo_description]
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "mt-5 flex justify-end gap-2" }, [
                      createVNode("button", {
                        class: "btn",
                        onClick: ($event) => editing.value = null
                      }, "Huỷ", 8, ["onClick"]),
                      createVNode("button", {
                        class: "btn btn-primary",
                        disabled: unref(form).processing || !unref(form).name,
                        onClick: save
                      }, " Lưu ", 8, ["disabled"])
                    ])
                  ])
                ], 8, ["onClick"])) : createCommentVNode("", true)
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Categories.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$n
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$m = {
  __name: "Comments",
  __ssrInlineRender: true,
  props: {
    comments: { type: Object, required: true },
    filters: { type: Object, default: () => ({}) },
    stats: { type: Object, default: () => ({}) }
  },
  setup(__props) {
    const props = __props;
    const canModerate = computed(() => !!usePage().props.auth?.user?.can?.["comments.moderate"]);
    const q = ref(props.filters.q || "");
    const status = ref(props.filters.status || "");
    let timer;
    watch([q, status], () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        router.get(
          "/admin/comments",
          { q: q.value || void 0, status: status.value || void 0 },
          { preserveState: true, replace: true }
        );
      }, 300);
    });
    const STATUS = {
      visible: { label: "Hiển thị", color: "#0A9CB0" },
      hidden: { label: "Đã ẩn", color: "#74747F" },
      spam: { label: "Spam", color: "#D91644" }
    };
    const setStatus = (c, s) => router.put(`/admin/comments/${c.id}`, { status: s }, { preserveScroll: true });
    function remove(c) {
      if (!confirm("Xoá hẳn bình luận này?")) return;
      router.delete(`/admin/comments/${c.id}`, { preserveScroll: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Bình luận" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Bình luận",
              subtitle: canModerate.value ? "Ẩn, đánh dấu spam hoặc xoá hẳn. Xoá bình luận gốc là mất luôn các trả lời của nó." : "Bạn chỉ có quyền xem các bình luận."
            }, null, _parent2, _scopeId));
            _push2(`<div class="flex flex-wrap items-center gap-2.5"${_scopeId}><div class="relative min-w-[220px] flex-1 sm:max-w-xs"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$x, {
              name: "search",
              class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            }, null, _parent2, _scopeId));
            _push2(`<input${ssrRenderAttr("value", q.value)} class="input !pl-9" placeholder="Tìm trong nội dung bình luận…"${_scopeId}></div><div class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
            ssrRenderList([
              ["", "Tất cả", __props.stats.total],
              ["visible", "Hiển thị", __props.stats.visible],
              ["hidden", "Đã ẩn", __props.stats.hidden],
              ["spam", "Spam", __props.stats.spam]
            ], (f) => {
              _push2(`<button class="${ssrRenderClass(["adm-seg", status.value === f[0] && "adm-seg-on"])}"${_scopeId}>${ssrInterpolate(f[1])} <span class="rounded bg-surface-2 px-1.5 text-[11px] tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(f[2]))}</span></button>`);
            });
            _push2(`<!--]--></div></div><ul class="mt-4 space-y-2.5"${_scopeId}><!--[-->`);
            ssrRenderList(__props.comments.data, (c) => {
              _push2(`<li class="adm-card p-3.5"${_scopeId}><div class="flex gap-3"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$A, {
                user: c.user,
                size: "size-9 text-[13px]"
              }, null, _parent2, _scopeId));
              _push2(`<div class="min-w-0 flex-1"${_scopeId}><p class="flex flex-wrap items-baseline gap-x-2"${_scopeId}><span class="text-[13.5px] font-bold"${_scopeId}>${ssrInterpolate(c.user?.name || "Ẩn danh")}</span><span class="text-[11.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(c.user?.email)}</span><span class="text-[11.5px] text-ink-muted"${_scopeId}>· ${ssrInterpolate(unref(fmtAgo)(c.created_at))}</span><span class="adm-chip" style="${ssrRenderStyle({ background: STATUS[c.status]?.color + "1f", color: STATUS[c.status]?.color })}"${_scopeId}>${ssrInterpolate(STATUS[c.status]?.label)}</span>`);
              if (c.parent_id) {
                _push2(`<span class="text-[11px] text-ink-muted"${_scopeId}>· trả lời</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</p><p class="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2"${_scopeId}>${ssrInterpolate(c.body)}</p>`);
              if (c.article) {
                _push2(`<a${ssrRenderAttr("href", `/news/${c.article.slug}`)} target="_blank" class="mt-1 block truncate text-[12px] text-ink-muted hover:text-accent-ink"${_scopeId}> ↳ ${ssrInterpolate(c.article.title)}</a>`);
              } else {
                _push2(`<!---->`);
              }
              if (canModerate.value) {
                _push2(`<div class="mt-2 flex flex-wrap items-center gap-1"${_scopeId}><!--[-->`);
                ssrRenderList(STATUS, (v, k) => {
                  _push2(`<button class="cbtn" style="${ssrRenderStyle(c.status === k ? { color: v.color, background: v.color + "14" } : {})}"${_scopeId}>${ssrInterpolate(v.label)}</button>`);
                });
                _push2(`<!--]-->`);
                _push2(ssrRenderComponent(_sfc_main$v, {
                  class: "ml-auto",
                  icon: "trash",
                  label: "Xoá hẳn bình luận",
                  tone: "danger",
                  onClick: ($event) => remove(c)
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div></li>`);
            });
            _push2(`<!--]--></ul>`);
            if (!__props.comments.data.length) {
              _push2(`<div class="adm-card"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Không có bình luận nào khớp",
                hint: "Thử đổi bộ lọc trạng thái hoặc xoá từ khoá tìm kiếm.",
                icon: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$p, {
              page: __props.comments,
              unit: "bình luận",
              class: "mt-5"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Bình luận",
                subtitle: canModerate.value ? "Ẩn, đánh dấu spam hoặc xoá hẳn. Xoá bình luận gốc là mất luôn các trả lời của nó." : "Bạn chỉ có quyền xem các bình luận."
              }, null, 8, ["subtitle"]),
              createVNode("div", { class: "flex flex-wrap items-center gap-2.5" }, [
                createVNode("div", { class: "relative min-w-[220px] flex-1 sm:max-w-xs" }, [
                  createVNode(_sfc_main$x, {
                    name: "search",
                    class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  }),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => q.value = $event,
                    class: "input !pl-9",
                    placeholder: "Tìm trong nội dung bình luận…"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, q.value]
                  ])
                ]),
                createVNode("div", { class: "flex flex-wrap gap-1" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList([
                    ["", "Tất cả", __props.stats.total],
                    ["visible", "Hiển thị", __props.stats.visible],
                    ["hidden", "Đã ẩn", __props.stats.hidden],
                    ["spam", "Spam", __props.stats.spam]
                  ], (f) => {
                    return openBlock(), createBlock("button", {
                      key: f[0],
                      class: ["adm-seg", status.value === f[0] && "adm-seg-on"],
                      onClick: ($event) => status.value = f[0]
                    }, [
                      createTextVNode(toDisplayString(f[1]) + " ", 1),
                      createVNode("span", { class: "rounded bg-surface-2 px-1.5 text-[11px] tabular-nums" }, toDisplayString(unref(fmtNumber)(f[2])), 1)
                    ], 10, ["onClick"]);
                  }), 128))
                ])
              ]),
              createVNode("ul", { class: "mt-4 space-y-2.5" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(__props.comments.data, (c) => {
                  return openBlock(), createBlock("li", {
                    key: c.id,
                    class: "adm-card p-3.5"
                  }, [
                    createVNode("div", { class: "flex gap-3" }, [
                      createVNode(_sfc_main$A, {
                        user: c.user,
                        size: "size-9 text-[13px]"
                      }, null, 8, ["user"]),
                      createVNode("div", { class: "min-w-0 flex-1" }, [
                        createVNode("p", { class: "flex flex-wrap items-baseline gap-x-2" }, [
                          createVNode("span", { class: "text-[13.5px] font-bold" }, toDisplayString(c.user?.name || "Ẩn danh"), 1),
                          createVNode("span", { class: "text-[11.5px] text-ink-muted" }, toDisplayString(c.user?.email), 1),
                          createVNode("span", { class: "text-[11.5px] text-ink-muted" }, "· " + toDisplayString(unref(fmtAgo)(c.created_at)), 1),
                          createVNode("span", {
                            class: "adm-chip",
                            style: { background: STATUS[c.status]?.color + "1f", color: STATUS[c.status]?.color }
                          }, toDisplayString(STATUS[c.status]?.label), 5),
                          c.parent_id ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "text-[11px] text-ink-muted"
                          }, "· trả lời")) : createCommentVNode("", true)
                        ]),
                        createVNode("p", { class: "mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2" }, toDisplayString(c.body), 1),
                        c.article ? (openBlock(), createBlock("a", {
                          key: 0,
                          href: `/news/${c.article.slug}`,
                          target: "_blank",
                          class: "mt-1 block truncate text-[12px] text-ink-muted hover:text-accent-ink"
                        }, " ↳ " + toDisplayString(c.article.title), 9, ["href"])) : createCommentVNode("", true),
                        canModerate.value ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "mt-2 flex flex-wrap items-center gap-1"
                        }, [
                          (openBlock(), createBlock(Fragment, null, renderList(STATUS, (v, k) => {
                            return createVNode("button", {
                              key: k,
                              class: "cbtn",
                              style: c.status === k ? { color: v.color, background: v.color + "14" } : {},
                              onClick: ($event) => setStatus(c, k)
                            }, toDisplayString(v.label), 13, ["onClick"]);
                          }), 64)),
                          createVNode(_sfc_main$v, {
                            class: "ml-auto",
                            icon: "trash",
                            label: "Xoá hẳn bình luận",
                            tone: "danger",
                            onClick: ($event) => remove(c)
                          }, null, 8, ["onClick"])
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ]);
                }), 128))
              ]),
              !__props.comments.data.length ? (openBlock(), createBlock("div", {
                key: 0,
                class: "adm-card"
              }, [
                createVNode(_sfc_main$r, {
                  title: "Không có bình luận nào khớp",
                  hint: "Thử đổi bộ lọc trạng thái hoặc xoá từ khoá tìm kiếm.",
                  icon: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z"
                })
              ])) : createCommentVNode("", true),
              createVNode(_sfc_main$p, {
                page: __props.comments,
                unit: "bình luận",
                class: "mt-5"
              }, null, 8, ["page"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Comments.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$m
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$l = {
  __name: "BarChart",
  __ssrInlineRender: true,
  props: {
    data: { type: Array, required: true },
    // [{ label, value, sub? }]
    height: { type: Number, default: 150 },
    color: { type: String, default: "var(--color-accent)" },
    everyNth: { type: Number, default: 1 }
    // chỉ ghi nhãn mỗi N cột khi quá dày
  },
  setup(__props) {
    const props = __props;
    const peak = computed(() => Math.max(1, ...props.data.map((d) => d.value)));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (__props.data.length) {
        _push(`<div class="flex items-end gap-[3px]" style="${ssrRenderStyle({ height: __props.height + "px" })}"><!--[-->`);
        ssrRenderList(__props.data, (d, i) => {
          _push(`<div class="group relative flex h-full flex-1 flex-col justify-end"><span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-page group-hover:block">${ssrInterpolate(d.label)} · ${ssrInterpolate(unref(fmtNumber)(d.value))}${ssrInterpolate(d.sub ? ` · ${d.sub}` : "")}</span><div class="w-full rounded-t transition-opacity group-hover:opacity-80" style="${ssrRenderStyle({ height: `${Math.max(2, d.value / peak.value * 100)}%`, background: __props.color })}"></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.data.length) {
        _push(`<div class="mt-1.5 flex gap-[3px]"><!--[-->`);
        ssrRenderList(__props.data, (d, i) => {
          _push(`<span class="flex-1 truncate text-center text-[9.5px] text-ink-muted tabular-nums">${ssrInterpolate(i % __props.everyNth === 0 ? d.label : "")}</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Admin/BarChart.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const _sfc_main$k = {
  __name: "Dashboard",
  __ssrInlineRender: true,
  props: {
    can: { type: Object, default: () => ({}) },
    traffic: { type: Object, default: null },
    kpi: { type: Object, required: true },
    daily: { type: Array, default: () => [] },
    byCategory: { type: Array, default: () => [] },
    topArticles: { type: Array, default: () => [] },
    recentComments: { type: Array, default: () => [] }
  },
  setup(__props) {
    const props = __props;
    const can = computed(() => usePage().props.auth?.user?.can || {});
    const ICON = {
      articles: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
      views: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z",
      users: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0",
      comments: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z",
      likes: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z",
      bookmarks: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
    };
    const tiles = computed(() => [
      {
        k: "articles",
        label: "Tổng bài viết",
        tone: "accent",
        hint: `+${props.kpi.today} hôm nay`,
        need: "articles.view"
      },
      { k: "views", label: "Lượt xem", need: "articles.view" },
      { k: "users", label: "Độc giả", need: "users.view" },
      {
        k: "comments",
        label: "Bình luận",
        tone: "cyan",
        need: "comments.view",
        hint: props.kpi.pending ? `${props.kpi.pending} nghi spam` : null
      },
      { k: "likes", label: "Lượt thích", need: "articles.view" },
      { k: "bookmarks", label: "Lượt lưu", need: "articles.view" }
    ].filter((t) => !t.need || can.value[t.need]));
    const peak = computed(() => Math.max(1, ...props.daily.map((d) => d.count)));
    const dayLabel = (d) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const stale = (t) => t && (Date.now() - new Date(t).getTime()) / 36e5 > 26;
    const trafficChart = computed(() => (props.traffic?.series || []).map((s) => ({
      label: dayLabel(s.date),
      value: s.views,
      sub: `${s.visitors} khách`
    })));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Tổng quan" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Tổng quan",
              subtitle: "Sức khoẻ của website trong 14 ngày gần nhất."
            }, null, _parent2, _scopeId));
            _push2(`<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"${_scopeId}><!--[-->`);
            ssrRenderList(tiles.value, (t) => {
              _push2(ssrRenderComponent(_sfc_main$s, {
                key: t.k,
                label: t.label,
                value: __props.kpi[t.k],
                hint: t.hint || "",
                tone: t.tone || "ink",
                icon: ICON[t.k]
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
            if (__props.traffic) {
              _push2(`<section class="adm-card mt-4 p-4"${_scopeId}><div class="flex flex-wrap items-center gap-x-8 gap-y-3"${_scopeId}><div class="flex items-center gap-2.5"${_scopeId}><span class="relative flex size-2.5"${_scopeId}><span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"${_scopeId}></span><span class="relative inline-flex size-2.5 rounded-full bg-accent"${_scopeId}></span></span><div${_scopeId}><p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted"${_scopeId}>Đang đọc</p><p class="text-[20px] font-extrabold leading-tight tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.traffic.online))}</p></div></div><div class="h-9 w-px bg-line"${_scopeId}></div><div${_scopeId}><p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted"${_scopeId}>Hôm nay</p><p class="text-[20px] font-extrabold leading-tight tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.traffic.today))} <span class="text-[12px] font-semibold text-ink-muted"${_scopeId}> lượt xem · ${ssrInterpolate(unref(fmtNumber)(__props.traffic.visitors))} khách </span></p></div>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: "/admin/reports",
                class: "ml-auto text-[12.5px] font-semibold text-accent-ink hover:underline"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Báo cáo đầy đủ → `);
                  } else {
                    return [
                      createTextVNode(" Báo cáo đầy đủ → ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              if (__props.traffic.series?.length) {
                _push2(ssrRenderComponent(_sfc_main$l, {
                  class: "mt-4",
                  data: trafficChart.value,
                  height: 110,
                  "every-nth": 2
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (__props.traffic.rolledAt) {
                _push2(`<p class="mt-2 text-[11.5px] text-ink-muted"${_scopeId}> Số liệu gom 10 phút một lần — lần gần nhất ${ssrInterpolate(unref(fmtAgo)(__props.traffic.rolledAt))}. </p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</section>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="mt-4 grid gap-5 xl:grid-cols-[1.3fr_1fr]"${_scopeId}>`);
            if (can.value.articles) {
              _push2(`<section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Bài đăng 14 ngày qua</h2><p class="mt-0.5 text-[12px] text-ink-muted"${_scopeId}> Cột tụt xuống 0 nghĩa là hôm đó bộ lấy tin không chạy. </p>`);
              if (__props.daily.length) {
                _push2(`<div class="mt-4 flex h-[150px] items-end gap-1.5"${_scopeId}><!--[-->`);
                ssrRenderList(__props.daily, (d) => {
                  _push2(`<div class="group relative flex flex-1 flex-col items-center gap-1.5"${_scopeId}><span class="text-[10.5px] font-bold text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(d.count)}</span><div class="w-full rounded-t bg-accent/85 transition group-hover:bg-accent" style="${ssrRenderStyle({ height: Math.max(3, d.count / peak.value * 110) + "px" })}"${_scopeId}></div><span class="text-[10px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(dayLabel(d.date))}</span></div>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="py-10 text-center text-[13px] text-ink-muted"${_scopeId}>Chưa có dữ liệu.</p>`);
              }
              _push2(`</section>`);
            } else {
              _push2(`<!---->`);
            }
            if (can.value.articles) {
              _push2(`<section class="adm-card p-4"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Theo chuyên mục</h2>`);
              if (can.value.categories) {
                _push2(ssrRenderComponent(unref(Link), {
                  href: "/admin/categories",
                  class: "text-[12.5px] font-semibold text-accent-ink hover:underline"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Quản lý →`);
                    } else {
                      return [
                        createTextVNode("Quản lý →")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><ul class="mt-3 space-y-2.5"${_scopeId}><!--[-->`);
              ssrRenderList(__props.byCategory, (c) => {
                _push2(`<li class="flex items-center gap-2.5"${_scopeId}><span class="size-2 shrink-0 rounded-full" style="${ssrRenderStyle({ background: c.color })}"${_scopeId}></span><span class="w-[92px] shrink-0 truncate text-[13px] font-semibold"${_scopeId}>${ssrInterpolate(c.name)}</span><span class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"${_scopeId}><span class="block h-full rounded-full" style="${ssrRenderStyle({
                  background: c.color,
                  width: c.count / Math.max(1, ...__props.byCategory.map((x) => x.count)) * 100 + "%"
                })}"${_scopeId}></span></span><span class="w-10 shrink-0 text-right text-[12.5px] font-bold tabular-nums"${_scopeId}>${ssrInterpolate(c.count)}</span><span class="${ssrRenderClass([stale(c.fetched_at) ? "font-bold text-accent-ink" : "text-ink-muted", "w-[74px] shrink-0 text-right text-[11px]"])}"${_scopeId}>${ssrInterpolate(c.fetched_at ? unref(fmtAgo)(c.fetched_at) : "chưa lấy")}</span></li>`);
              });
              _push2(`<!--]--></ul></section>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="mt-4 grid gap-5 xl:grid-cols-2"${_scopeId}>`);
            if (can.value.articles) {
              _push2(`<section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Đọc nhiều nhất</h2><ol class="mt-3 divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.topArticles, (a, i) => {
                _push2(`<li class="flex items-center gap-3 py-2.5 first:pt-0"${_scopeId}><span class="w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(i + 1)}</span><a${ssrRenderAttr("href", `/news/${a.slug}`)} target="_blank" class="min-w-0 flex-1 truncate text-[13.5px] font-semibold hover:text-accent-ink"${_scopeId}>${ssrInterpolate(a.title)}</a><span class="shrink-0 text-[12px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(a.views))} xem · ${ssrInterpolate(a.likes_count)} ♥ · ${ssrInterpolate(a.comments_count)} 💬 </span></li>`);
              });
              _push2(`<!--]--></ol>`);
              if (!__props.topArticles.length) {
                _push2(`<p class="py-8 text-center text-[13px] text-ink-muted"${_scopeId}>Chưa có bài nào.</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</section>`);
            } else {
              _push2(`<!---->`);
            }
            if (can.value.comments) {
              _push2(`<section class="adm-card p-4"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Bình luận mới</h2>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: "/admin/comments",
                class: "text-[12.5px] font-semibold text-accent-ink hover:underline"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Kiểm duyệt →`);
                  } else {
                    return [
                      createTextVNode("Kiểm duyệt →")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><ul class="mt-3 divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.recentComments, (c) => {
                _push2(`<li class="py-2.5 first:pt-0"${_scopeId}><p class="flex items-baseline gap-2"${_scopeId}><span class="text-[13px] font-bold"${_scopeId}>${ssrInterpolate(c.user?.name || "Ẩn danh")}</span><span class="text-[11px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtAgo)(c.created_at))}</span></p><p class="mt-0.5 line-clamp-2 text-[13px] text-ink-2"${_scopeId}>${ssrInterpolate(c.body)}</p>`);
                if (c.article) {
                  _push2(`<a${ssrRenderAttr("href", `/news/${c.article.slug}`)} target="_blank" class="mt-0.5 block truncate text-[11.5px] text-ink-muted hover:text-accent-ink"${_scopeId}> ↳ ${ssrInterpolate(c.article.title)}</a>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul>`);
              if (!__props.recentComments.length) {
                _push2(`<p class="py-8 text-center text-[13px] text-ink-muted"${_scopeId}> Chưa có bình luận nào. </p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</section>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Tổng quan",
                subtitle: "Sức khoẻ của website trong 14 ngày gần nhất."
              }),
              createVNode("div", { class: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(tiles.value, (t) => {
                  return openBlock(), createBlock(_sfc_main$s, {
                    key: t.k,
                    label: t.label,
                    value: __props.kpi[t.k],
                    hint: t.hint || "",
                    tone: t.tone || "ink",
                    icon: ICON[t.k]
                  }, null, 8, ["label", "value", "hint", "tone", "icon"]);
                }), 128))
              ]),
              __props.traffic ? (openBlock(), createBlock("section", {
                key: 0,
                class: "adm-card mt-4 p-4"
              }, [
                createVNode("div", { class: "flex flex-wrap items-center gap-x-8 gap-y-3" }, [
                  createVNode("div", { class: "flex items-center gap-2.5" }, [
                    createVNode("span", { class: "relative flex size-2.5" }, [
                      createVNode("span", { class: "absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" }),
                      createVNode("span", { class: "relative inline-flex size-2.5 rounded-full bg-accent" })
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted" }, "Đang đọc"),
                      createVNode("p", { class: "text-[20px] font-extrabold leading-tight tabular-nums" }, toDisplayString(unref(fmtNumber)(__props.traffic.online)), 1)
                    ])
                  ]),
                  createVNode("div", { class: "h-9 w-px bg-line" }),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted" }, "Hôm nay"),
                    createVNode("p", { class: "text-[20px] font-extrabold leading-tight tabular-nums" }, [
                      createTextVNode(toDisplayString(unref(fmtNumber)(__props.traffic.today)) + " ", 1),
                      createVNode("span", { class: "text-[12px] font-semibold text-ink-muted" }, " lượt xem · " + toDisplayString(unref(fmtNumber)(__props.traffic.visitors)) + " khách ", 1)
                    ])
                  ]),
                  createVNode(unref(Link), {
                    href: "/admin/reports",
                    class: "ml-auto text-[12.5px] font-semibold text-accent-ink hover:underline"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Báo cáo đầy đủ → ")
                    ]),
                    _: 1
                  })
                ]),
                __props.traffic.series?.length ? (openBlock(), createBlock(_sfc_main$l, {
                  key: 0,
                  class: "mt-4",
                  data: trafficChart.value,
                  height: 110,
                  "every-nth": 2
                }, null, 8, ["data"])) : createCommentVNode("", true),
                __props.traffic.rolledAt ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "mt-2 text-[11.5px] text-ink-muted"
                }, " Số liệu gom 10 phút một lần — lần gần nhất " + toDisplayString(unref(fmtAgo)(__props.traffic.rolledAt)) + ". ", 1)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              createVNode("div", { class: "mt-4 grid gap-5 xl:grid-cols-[1.3fr_1fr]" }, [
                can.value.articles ? (openBlock(), createBlock("section", {
                  key: 0,
                  class: "adm-card p-4"
                }, [
                  createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Bài đăng 14 ngày qua"),
                  createVNode("p", { class: "mt-0.5 text-[12px] text-ink-muted" }, " Cột tụt xuống 0 nghĩa là hôm đó bộ lấy tin không chạy. "),
                  __props.daily.length ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mt-4 flex h-[150px] items-end gap-1.5"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.daily, (d) => {
                      return openBlock(), createBlock("div", {
                        key: d.date,
                        class: "group relative flex flex-1 flex-col items-center gap-1.5"
                      }, [
                        createVNode("span", { class: "text-[10.5px] font-bold text-ink-muted tabular-nums" }, toDisplayString(d.count), 1),
                        createVNode("div", {
                          class: "w-full rounded-t bg-accent/85 transition group-hover:bg-accent",
                          style: { height: Math.max(3, d.count / peak.value * 110) + "px" }
                        }, null, 4),
                        createVNode("span", { class: "text-[10px] text-ink-muted tabular-nums" }, toDisplayString(dayLabel(d.date)), 1)
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("p", {
                    key: 1,
                    class: "py-10 text-center text-[13px] text-ink-muted"
                  }, "Chưa có dữ liệu."))
                ])) : createCommentVNode("", true),
                can.value.articles ? (openBlock(), createBlock("section", {
                  key: 1,
                  class: "adm-card p-4"
                }, [
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Theo chuyên mục"),
                    can.value.categories ? (openBlock(), createBlock(unref(Link), {
                      key: 0,
                      href: "/admin/categories",
                      class: "text-[12.5px] font-semibold text-accent-ink hover:underline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Quản lý →")
                      ]),
                      _: 1
                    })) : createCommentVNode("", true)
                  ]),
                  createVNode("ul", { class: "mt-3 space-y-2.5" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.byCategory, (c) => {
                      return openBlock(), createBlock("li", {
                        key: c.slug,
                        class: "flex items-center gap-2.5"
                      }, [
                        createVNode("span", {
                          class: "size-2 shrink-0 rounded-full",
                          style: { background: c.color }
                        }, null, 4),
                        createVNode("span", { class: "w-[92px] shrink-0 truncate text-[13px] font-semibold" }, toDisplayString(c.name), 1),
                        createVNode("span", { class: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" }, [
                          createVNode("span", {
                            class: "block h-full rounded-full",
                            style: {
                              background: c.color,
                              width: c.count / Math.max(1, ...__props.byCategory.map((x) => x.count)) * 100 + "%"
                            }
                          }, null, 4)
                        ]),
                        createVNode("span", { class: "w-10 shrink-0 text-right text-[12.5px] font-bold tabular-nums" }, toDisplayString(c.count), 1),
                        createVNode("span", {
                          class: ["w-[74px] shrink-0 text-right text-[11px]", stale(c.fetched_at) ? "font-bold text-accent-ink" : "text-ink-muted"]
                        }, toDisplayString(c.fetched_at ? unref(fmtAgo)(c.fetched_at) : "chưa lấy"), 3)
                      ]);
                    }), 128))
                  ])
                ])) : createCommentVNode("", true)
              ]),
              createVNode("div", { class: "mt-4 grid gap-5 xl:grid-cols-2" }, [
                can.value.articles ? (openBlock(), createBlock("section", {
                  key: 0,
                  class: "adm-card p-4"
                }, [
                  createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Đọc nhiều nhất"),
                  createVNode("ol", { class: "mt-3 divide-y divide-line" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.topArticles, (a, i) => {
                      return openBlock(), createBlock("li", {
                        key: a.id,
                        class: "flex items-center gap-3 py-2.5 first:pt-0"
                      }, [
                        createVNode("span", { class: "w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums" }, toDisplayString(i + 1), 1),
                        createVNode("a", {
                          href: `/news/${a.slug}`,
                          target: "_blank",
                          class: "min-w-0 flex-1 truncate text-[13.5px] font-semibold hover:text-accent-ink"
                        }, toDisplayString(a.title), 9, ["href"]),
                        createVNode("span", { class: "shrink-0 text-[12px] text-ink-muted tabular-nums" }, toDisplayString(unref(fmtNumber)(a.views)) + " xem · " + toDisplayString(a.likes_count) + " ♥ · " + toDisplayString(a.comments_count) + " 💬 ", 1)
                      ]);
                    }), 128))
                  ]),
                  !__props.topArticles.length ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "py-8 text-center text-[13px] text-ink-muted"
                  }, "Chưa có bài nào.")) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                can.value.comments ? (openBlock(), createBlock("section", {
                  key: 1,
                  class: "adm-card p-4"
                }, [
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Bình luận mới"),
                    createVNode(unref(Link), {
                      href: "/admin/comments",
                      class: "text-[12.5px] font-semibold text-accent-ink hover:underline"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Kiểm duyệt →")
                      ]),
                      _: 1
                    })
                  ]),
                  createVNode("ul", { class: "mt-3 divide-y divide-line" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.recentComments, (c) => {
                      return openBlock(), createBlock("li", {
                        key: c.id,
                        class: "py-2.5 first:pt-0"
                      }, [
                        createVNode("p", { class: "flex items-baseline gap-2" }, [
                          createVNode("span", { class: "text-[13px] font-bold" }, toDisplayString(c.user?.name || "Ẩn danh"), 1),
                          createVNode("span", { class: "text-[11px] text-ink-muted" }, toDisplayString(unref(fmtAgo)(c.created_at)), 1)
                        ]),
                        createVNode("p", { class: "mt-0.5 line-clamp-2 text-[13px] text-ink-2" }, toDisplayString(c.body), 1),
                        c.article ? (openBlock(), createBlock("a", {
                          key: 0,
                          href: `/news/${c.article.slug}`,
                          target: "_blank",
                          class: "mt-0.5 block truncate text-[11.5px] text-ink-muted hover:text-accent-ink"
                        }, " ↳ " + toDisplayString(c.article.title), 9, ["href"])) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ]),
                  !__props.recentComments.length ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "py-8 text-center text-[13px] text-ink-muted"
                  }, " Chưa có bình luận nào. ")) : createCommentVNode("", true)
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Dashboard.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$k
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$j = {
  __name: "Pages",
  __ssrInlineRender: true,
  props: { pages: { type: Array, default: () => [] } },
  setup(__props) {
    const editing = ref(null);
    const form = useForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      is_published: true,
      in_footer: true,
      sort: 0,
      seo_title: "",
      seo_description: ""
    });
    function open(p) {
      editing.value = p || {};
      form.defaults({
        title: p?.title || "",
        slug: p?.slug || "",
        excerpt: p?.excerpt || "",
        content: p?.content || "",
        is_published: p ? !!p.is_published : true,
        in_footer: p ? !!p.in_footer : true,
        sort: p?.sort ?? 0,
        seo_title: p?.seo_title || "",
        seo_description: p?.seo_description || ""
      });
      form.reset();
      form.clearErrors();
    }
    function save() {
      const done = { preserveScroll: true, onSuccess: () => editing.value = null };
      editing.value?.id ? form.put(`/admin/pages/${editing.value.slug}`, done) : form.post("/admin/pages", done);
    }
    function remove(p) {
      if (confirm(`Xoá trang “${p.title}”?`)) {
        router.delete(`/admin/pages/${p.slug}`, { preserveScroll: true });
      }
    }
    const toggle = (p, field) => router.put(`/admin/pages/${p.slug}`, {
      ...p,
      [field]: !p[field]
    }, { preserveScroll: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Trang tĩnh · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Trang tĩnh",
              subtitle: "Giới thiệu, liên hệ, điều khoản — những trang không phải tin tức."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="btn btn-primary"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_sfc_main$x, { name: "plus" }, null, _parent3, _scopeId2));
                  _push3(` Thêm trang </button>`);
                } else {
                  return [
                    createVNode("button", {
                      class: "btn btn-primary",
                      onClick: ($event) => open(null)
                    }, [
                      createVNode(_sfc_main$x, { name: "plus" }),
                      createTextVNode(" Thêm trang ")
                    ], 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="adm-card overflow-hidden"${_scopeId}>`);
            if (__props.pages.length) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="adm-table min-w-[720px]"${_scopeId}><thead${_scopeId}><tr${_scopeId}><th${_scopeId}>Tiêu đề</th><th class="w-[150px]"${_scopeId}>Đường dẫn</th><th class="w-[92px]"${_scopeId}>Hiển thị</th><th class="w-[100px]"${_scopeId}>Chân trang</th><th class="w-[70px]"${_scopeId}>Thứ tự</th><th class="w-[110px]"${_scopeId}>Cập nhật</th><th class="w-[106px]"${_scopeId}></th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(__props.pages, (p) => {
                _push2(`<tr${_scopeId}><td${_scopeId}><p class="text-[13.5px] font-bold"${_scopeId}>${ssrInterpolate(p.title)}</p>`);
                if (p.excerpt) {
                  _push2(`<p class="mt-0.5 line-clamp-1 text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(p.excerpt)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td${_scopeId}><a${ssrRenderAttr("href", `/page/${p.slug}`)} target="_blank" class="inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted hover:text-accent-ink"${_scopeId}> /${ssrInterpolate(p.slug)} `);
                _push2(ssrRenderComponent(_sfc_main$x, {
                  name: "external",
                  size: "size-3"
                }, null, _parent2, _scopeId));
                _push2(`</a></td><td${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$q, {
                  "model-value": !!p.is_published,
                  "onUpdate:modelValue": ($event) => toggle(p, "is_published")
                }, null, _parent2, _scopeId));
                _push2(`</td><td${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$q, {
                  "model-value": !!p.in_footer,
                  "onUpdate:modelValue": ($event) => toggle(p, "in_footer")
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="text-[13px] tabular-nums"${_scopeId}>${ssrInterpolate(p.sort)}</td><td class="text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtDate)(p.updated_at))}</td><td${_scopeId}><span class="rowacts"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$v, {
                  icon: "edit",
                  label: "Sửa trang",
                  onClick: ($event) => open(p)
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_sfc_main$v, {
                  icon: "eye",
                  label: "Xem trên web",
                  tone: "cyan",
                  as: "a",
                  href: `/page/${p.slug}`,
                  target: "_blank"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_sfc_main$v, {
                  icon: "trash",
                  label: "Xoá trang",
                  tone: "danger",
                  onClick: ($event) => remove(p)
                }, null, _parent2, _scopeId));
                _push2(`</span></td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Chưa có trang tĩnh nào",
                hint: "Thêm trang Giới thiệu hoặc Liên hệ để chân trang website có nội dung."
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<button class="btn btn-primary"${_scopeId2}>Thêm trang đầu tiên</button>`);
                  } else {
                    return [
                      createVNode("button", {
                        class: "btn btn-primary",
                        onClick: ($event) => open(null)
                      }, "Thêm trang đầu tiên", 8, ["onClick"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(`</div>`);
            if (editing.value) {
              _push2(`<div class="fixed inset-0 z-50 flex justify-end bg-black/40"${_scopeId}><div class="flex h-full w-full max-w-[620px] flex-col bg-page shadow-2xl"${_scopeId}><header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5"${_scopeId}><h2 class="text-[15px] font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(editing.value.id ? "Sửa trang" : "Trang mới")}</h2><button class="btn !ml-auto !border-transparent !px-2" aria-label="Đóng"${_scopeId}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"${_scopeId}><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"${_scopeId}></path></svg></button></header><form class="flex-1 space-y-4 overflow-y-auto p-5"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="t"${_scopeId}>Tiêu đề</label><input id="t"${ssrRenderAttr("value", unref(form).title)} class="input" required maxlength="200"${_scopeId}>`);
              if (unref(form).errors.title) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.title)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="s"${_scopeId}>Đường dẫn</label><div class="flex items-center gap-1.5"${_scopeId}><span class="text-[13px] text-ink-muted"${_scopeId}>/page/</span><input id="s"${ssrRenderAttr("value", unref(form).slug)} class="input" placeholder="để trống sẽ tự sinh từ tiêu đề"${_scopeId}></div>`);
              if (unref(form).errors.slug) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.slug)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="e"${_scopeId}>Tóm tắt</label><textarea id="e" rows="2" maxlength="300" class="input resize-y !py-2"${_scopeId}>${ssrInterpolate(unref(form).excerpt)}</textarea></div><div class="space-y-1.5"${_scopeId}><label class="label" for="c"${_scopeId}>Nội dung</label><textarea id="c" rows="12" class="input resize-y !py-2 font-mono !text-[13px]" placeholder="&lt;p&gt;Chấp nhận HTML: p, h2, h3, ul, a, img…&lt;/p&gt;"${_scopeId}>${ssrInterpolate(unref(form).content)}</textarea><p class="text-[11.5px] text-ink-muted"${_scopeId}> Nội dung hiển thị bằng kiểu chữ thân bài của website. </p></div><div class="flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-3.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$q, {
                modelValue: unref(form).is_published,
                "onUpdate:modelValue": ($event) => unref(form).is_published = $event,
                label: "Hiển thị công khai"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_sfc_main$q, {
                modelValue: unref(form).in_footer,
                "onUpdate:modelValue": ($event) => unref(form).in_footer = $event,
                label: "Hiện ở chân trang"
              }, null, _parent2, _scopeId));
              _push2(`<label class="ml-auto flex items-center gap-2 text-[13px] font-medium"${_scopeId}> Thứ tự <input${ssrRenderAttr("value", unref(form).sort)} type="number" min="0" max="999" class="input !w-16 !py-1 text-center"${_scopeId}></label></div><details class="rounded-xl border border-line p-3.5"${_scopeId}><summary class="cursor-pointer text-[13px] font-bold"${_scopeId}>Tuỳ chọn SEO</summary><div class="mt-3 space-y-3"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="st"${_scopeId}>Tiêu đề SEO</label><input id="st"${ssrRenderAttr("value", unref(form).seo_title)} class="input" maxlength="200"${ssrRenderAttr("placeholder", unref(form).title)}${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label" for="sd"${_scopeId}>Mô tả SEO</label><textarea id="sd" rows="2" maxlength="300" class="input resize-y !py-2"${ssrRenderAttr("placeholder", unref(form).excerpt)}${_scopeId}>${ssrInterpolate(unref(form).seo_description)}</textarea></div></div></details></form><footer class="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3"${_scopeId}><button class="btn"${_scopeId}>Huỷ</button><button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu trang")}</button></footer></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Trang tĩnh",
                subtitle: "Giới thiệu, liên hệ, điều khoản — những trang không phải tin tức."
              }, {
                actions: withCtx(() => [
                  createVNode("button", {
                    class: "btn btn-primary",
                    onClick: ($event) => open(null)
                  }, [
                    createVNode(_sfc_main$x, { name: "plus" }),
                    createTextVNode(" Thêm trang ")
                  ], 8, ["onClick"])
                ]),
                _: 1
              }),
              createVNode("div", { class: "adm-card overflow-hidden" }, [
                __props.pages.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "overflow-x-auto"
                }, [
                  createVNode("table", { class: "adm-table min-w-[720px]" }, [
                    createVNode("thead", null, [
                      createVNode("tr", null, [
                        createVNode("th", null, "Tiêu đề"),
                        createVNode("th", { class: "w-[150px]" }, "Đường dẫn"),
                        createVNode("th", { class: "w-[92px]" }, "Hiển thị"),
                        createVNode("th", { class: "w-[100px]" }, "Chân trang"),
                        createVNode("th", { class: "w-[70px]" }, "Thứ tự"),
                        createVNode("th", { class: "w-[110px]" }, "Cập nhật"),
                        createVNode("th", { class: "w-[106px]" })
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.pages, (p) => {
                        return openBlock(), createBlock("tr", {
                          key: p.id
                        }, [
                          createVNode("td", null, [
                            createVNode("p", { class: "text-[13.5px] font-bold" }, toDisplayString(p.title), 1),
                            p.excerpt ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "mt-0.5 line-clamp-1 text-[12px] text-ink-muted"
                            }, toDisplayString(p.excerpt), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", null, [
                            createVNode("a", {
                              href: `/page/${p.slug}`,
                              target: "_blank",
                              class: "inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted hover:text-accent-ink"
                            }, [
                              createTextVNode(" /" + toDisplayString(p.slug) + " ", 1),
                              createVNode(_sfc_main$x, {
                                name: "external",
                                size: "size-3"
                              })
                            ], 8, ["href"])
                          ]),
                          createVNode("td", null, [
                            createVNode(_sfc_main$q, {
                              "model-value": !!p.is_published,
                              "onUpdate:modelValue": ($event) => toggle(p, "is_published")
                            }, null, 8, ["model-value", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", null, [
                            createVNode(_sfc_main$q, {
                              "model-value": !!p.in_footer,
                              "onUpdate:modelValue": ($event) => toggle(p, "in_footer")
                            }, null, 8, ["model-value", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "text-[13px] tabular-nums" }, toDisplayString(p.sort), 1),
                          createVNode("td", { class: "text-[12px] text-ink-muted" }, toDisplayString(unref(fmtDate)(p.updated_at)), 1),
                          createVNode("td", null, [
                            createVNode("span", { class: "rowacts" }, [
                              createVNode(_sfc_main$v, {
                                icon: "edit",
                                label: "Sửa trang",
                                onClick: ($event) => open(p)
                              }, null, 8, ["onClick"]),
                              createVNode(_sfc_main$v, {
                                icon: "eye",
                                label: "Xem trên web",
                                tone: "cyan",
                                as: "a",
                                href: `/page/${p.slug}`,
                                target: "_blank"
                              }, null, 8, ["href"]),
                              createVNode(_sfc_main$v, {
                                icon: "trash",
                                label: "Xoá trang",
                                tone: "danger",
                                onClick: ($event) => remove(p)
                              }, null, 8, ["onClick"])
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])) : (openBlock(), createBlock(_sfc_main$r, {
                  key: 1,
                  title: "Chưa có trang tĩnh nào",
                  hint: "Thêm trang Giới thiệu hoặc Liên hệ để chân trang website có nội dung."
                }, {
                  default: withCtx(() => [
                    createVNode("button", {
                      class: "btn btn-primary",
                      onClick: ($event) => open(null)
                    }, "Thêm trang đầu tiên", 8, ["onClick"])
                  ]),
                  _: 1
                }))
              ]),
              editing.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "fixed inset-0 z-50 flex justify-end bg-black/40",
                onClick: withModifiers(($event) => editing.value = null, ["self"])
              }, [
                createVNode("div", { class: "flex h-full w-full max-w-[620px] flex-col bg-page shadow-2xl" }, [
                  createVNode("header", { class: "flex h-14 shrink-0 items-center gap-3 border-b border-line px-5" }, [
                    createVNode("h2", { class: "text-[15px] font-extrabold tracking-tight" }, toDisplayString(editing.value.id ? "Sửa trang" : "Trang mới"), 1),
                    createVNode("button", {
                      class: "btn !ml-auto !border-transparent !px-2",
                      "aria-label": "Đóng",
                      onClick: ($event) => editing.value = null
                    }, [
                      (openBlock(), createBlock("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        class: "size-5"
                      }, [
                        createVNode("path", {
                          d: "M18 6 6 18M6 6l12 12",
                          "stroke-linecap": "round"
                        })
                      ]))
                    ], 8, ["onClick"])
                  ]),
                  createVNode("form", {
                    class: "flex-1 space-y-4 overflow-y-auto p-5",
                    onSubmit: withModifiers(save, ["prevent"])
                  }, [
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "t"
                      }, "Tiêu đề"),
                      withDirectives(createVNode("input", {
                        id: "t",
                        "onUpdate:modelValue": ($event) => unref(form).title = $event,
                        class: "input",
                        required: "",
                        maxlength: "200"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).title]
                      ]),
                      unref(form).errors.title ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.title), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "s"
                      }, "Đường dẫn"),
                      createVNode("div", { class: "flex items-center gap-1.5" }, [
                        createVNode("span", { class: "text-[13px] text-ink-muted" }, "/page/"),
                        withDirectives(createVNode("input", {
                          id: "s",
                          "onUpdate:modelValue": ($event) => unref(form).slug = $event,
                          class: "input",
                          placeholder: "để trống sẽ tự sinh từ tiêu đề"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).slug]
                        ])
                      ]),
                      unref(form).errors.slug ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.slug), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "e"
                      }, "Tóm tắt"),
                      withDirectives(createVNode("textarea", {
                        id: "e",
                        "onUpdate:modelValue": ($event) => unref(form).excerpt = $event,
                        rows: "2",
                        maxlength: "300",
                        class: "input resize-y !py-2"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).excerpt]
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "c"
                      }, "Nội dung"),
                      withDirectives(createVNode("textarea", {
                        id: "c",
                        "onUpdate:modelValue": ($event) => unref(form).content = $event,
                        rows: "12",
                        class: "input resize-y !py-2 font-mono !text-[13px]",
                        placeholder: "<p>Chấp nhận HTML: p, h2, h3, ul, a, img…</p>"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).content]
                      ]),
                      createVNode("p", { class: "text-[11.5px] text-ink-muted" }, " Nội dung hiển thị bằng kiểu chữ thân bài của website. ")
                    ]),
                    createVNode("div", { class: "flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-3.5" }, [
                      createVNode(_sfc_main$q, {
                        modelValue: unref(form).is_published,
                        "onUpdate:modelValue": ($event) => unref(form).is_published = $event,
                        label: "Hiển thị công khai"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_sfc_main$q, {
                        modelValue: unref(form).in_footer,
                        "onUpdate:modelValue": ($event) => unref(form).in_footer = $event,
                        label: "Hiện ở chân trang"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode("label", { class: "ml-auto flex items-center gap-2 text-[13px] font-medium" }, [
                        createTextVNode(" Thứ tự "),
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => unref(form).sort = $event,
                          type: "number",
                          min: "0",
                          max: "999",
                          class: "input !w-16 !py-1 text-center"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(form).sort,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ])
                    ]),
                    createVNode("details", { class: "rounded-xl border border-line p-3.5" }, [
                      createVNode("summary", { class: "cursor-pointer text-[13px] font-bold" }, "Tuỳ chọn SEO"),
                      createVNode("div", { class: "mt-3 space-y-3" }, [
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", {
                            class: "label",
                            for: "st"
                          }, "Tiêu đề SEO"),
                          withDirectives(createVNode("input", {
                            id: "st",
                            "onUpdate:modelValue": ($event) => unref(form).seo_title = $event,
                            class: "input",
                            maxlength: "200",
                            placeholder: unref(form).title
                          }, null, 8, ["onUpdate:modelValue", "placeholder"]), [
                            [vModelText, unref(form).seo_title]
                          ])
                        ]),
                        createVNode("div", { class: "space-y-1.5" }, [
                          createVNode("label", {
                            class: "label",
                            for: "sd"
                          }, "Mô tả SEO"),
                          withDirectives(createVNode("textarea", {
                            id: "sd",
                            "onUpdate:modelValue": ($event) => unref(form).seo_description = $event,
                            rows: "2",
                            maxlength: "300",
                            class: "input resize-y !py-2",
                            placeholder: unref(form).excerpt
                          }, null, 8, ["onUpdate:modelValue", "placeholder"]), [
                            [vModelText, unref(form).seo_description]
                          ])
                        ])
                      ])
                    ])
                  ], 32),
                  createVNode("footer", { class: "flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3" }, [
                    createVNode("button", {
                      class: "btn",
                      onClick: ($event) => editing.value = null
                    }, "Huỷ", 8, ["onClick"]),
                    createVNode("button", {
                      class: "btn btn-primary",
                      disabled: unref(form).processing,
                      onClick: save
                    }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu trang"), 9, ["disabled"])
                  ])
                ])
              ], 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Pages.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$j
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$i = {
  __name: "Reports",
  __ssrInlineRender: true,
  props: {
    range: { type: Number, default: 30 },
    ranges: { type: Array, default: () => [] },
    series: { type: Array, default: () => [] },
    totals: { type: Object, default: () => ({}) },
    previous: { type: Object, default: () => ({}) },
    today: { type: Object, default: () => ({}) },
    byDevice: { type: Array, default: () => [] },
    byReferrer: { type: Array, default: () => [] },
    byCategory: { type: Array, default: () => [] },
    byHour: { type: Array, default: () => [] },
    topArticles: { type: Array, default: () => [] },
    rolledAt: { type: String, default: null }
  },
  setup(__props) {
    const props = __props;
    const dm = (d) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const chart = computed(() => props.series.map((s) => ({
      label: dm(s.date),
      value: s.views,
      sub: `${fmtNumber(s.visitors)} khách`
    })));
    const hours = computed(() => props.byHour.map((n, h2) => ({
      label: `${String(h2).padStart(2, "0")}h`,
      value: n
    })));
    function delta(key) {
      const now = props.totals[key] ?? 0;
      const before = props.previous[key] ?? 0;
      if (!before) return null;
      return Math.round((now - before) / before * 100);
    }
    const ICON = {
      views: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z",
      visitors: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0",
      comments: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z",
      searches: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5"
    };
    const setRange = (v) => router.get("/admin/reports", { days: v }, { preserveState: true, replace: true });
    const total = (rows) => rows.reduce((a, r) => a + r.value, 0) || 1;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Báo cáo · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Báo cáo truy cập",
              subtitle: __props.rolledAt ? `Số liệu gom 10 phút một lần — lần gần nhất ${unref(fmtAgo)(__props.rolledAt)}.` : "Chưa có số liệu nào được gom. Chạy lệnh stats:rollup hoặc chờ lịch chạy."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex gap-1"${_scopeId2}><!--[-->`);
                  ssrRenderList(__props.ranges, (r) => {
                    _push3(`<button class="${ssrRenderClass(["adm-seg", __props.range === r.value && "adm-seg-on"])}"${_scopeId2}>${ssrInterpolate(r.label)}</button>`);
                  });
                  _push3(`<!--]--></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex gap-1" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.ranges, (r) => {
                        return openBlock(), createBlock("button", {
                          key: r.value,
                          class: ["adm-seg", __props.range === r.value && "adm-seg-on"],
                          onClick: ($event) => setRange(r.value)
                        }, toDisplayString(r.label), 11, ["onClick"]);
                      }), 128))
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="adm-card mb-4 flex flex-wrap items-center gap-x-8 gap-y-3 p-4"${_scopeId}><div class="flex items-center gap-2.5"${_scopeId}><span class="relative flex size-2.5"${_scopeId}><span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"${_scopeId}></span><span class="relative inline-flex size-2.5 rounded-full bg-accent"${_scopeId}></span></span><div${_scopeId}><p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted"${_scopeId}>Đang đọc</p><p class="text-[20px] font-extrabold leading-tight tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.today.online))} <span class="text-[12px] font-semibold text-ink-muted"${_scopeId}>trong 5 phút qua</span></p></div></div><div class="h-9 w-px bg-line"${_scopeId}></div><div${_scopeId}><p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted"${_scopeId}>Hôm nay</p><p class="text-[20px] font-extrabold leading-tight tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.today.views))} <span class="text-[12px] font-semibold text-ink-muted"${_scopeId}> lượt xem · ${ssrInterpolate(unref(fmtNumber)(__props.today.visitors))} khách </span></p></div></div><div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><!--[-->`);
            ssrRenderList(["views", "visitors", "comments", "searches"], (k) => {
              _push2(ssrRenderComponent(_sfc_main$s, {
                key: k,
                label: {
                  views: "Lượt xem",
                  visitors: "Khách truy cập",
                  comments: "Bình luận",
                  searches: "Lượt tìm kiếm"
                }[k],
                value: __props.totals[k] ?? 0,
                icon: ICON[k],
                tone: k === "views" ? "accent" : k === "visitors" ? "cyan" : "ink",
                hint: delta(k) === null ? "" : `${delta(k) >= 0 ? "+" : ""}${delta(k)}% so với kỳ trước`
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div><section class="adm-card mt-4 p-4"${_scopeId}><div class="mb-3 flex flex-wrap items-baseline justify-between gap-2"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Lượt xem theo ngày</h2><p class="text-[12px] text-ink-muted"${_scopeId}>Rê chuột lên cột để xem chi tiết.</p></div>`);
            if (__props.totals.views) {
              _push2(ssrRenderComponent(_sfc_main$l, {
                data: chart.value,
                height: 170,
                "every-nth": __props.range > 30 ? 7 : __props.range > 7 ? 3 : 1
              }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Chưa có lượt truy cập nào được ghi",
                hint: "Số liệu bắt đầu có từ lần chạy stats:rollup đầu tiên sau khi bật theo dõi.",
                icon: "M3 3v18h18M7 15l4-5 3 3 5-7"
              }, null, _parent2, _scopeId));
            }
            _push2(`</section><div class="mt-4 grid gap-4 xl:grid-cols-2"${_scopeId}><section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Khung giờ đọc nhiều</h2><p class="mt-0.5 text-[12px] text-ink-muted"${_scopeId}> Cộng dồn cả kỳ — dùng để chọn giờ đăng bài. </p>`);
            _push2(ssrRenderComponent(_sfc_main$l, {
              class: "mt-3",
              data: hours.value,
              height: 130,
              "every-nth": 3,
              color: "var(--color-cyan)"
            }, null, _parent2, _scopeId));
            _push2(`</section><section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Bài đọc nhiều nhất</h2>`);
            if (__props.topArticles.length) {
              _push2(`<ol class="mt-3 divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.topArticles, (a, i) => {
                _push2(`<li class="flex items-center gap-3 py-2 first:pt-0"${_scopeId}><span class="w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(i + 1)}</span><span class="min-w-0 flex-1 truncate text-[13px] font-semibold"${_scopeId}>${ssrInterpolate(a.title)}</span><span class="shrink-0 text-[12.5px] font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(a.views))}</span></li>`);
              });
              _push2(`<!--]--></ol>`);
            } else {
              _push2(`<p class="py-8 text-center text-[13px] text-ink-muted"${_scopeId}>Chưa có dữ liệu.</p>`);
            }
            _push2(`</section></div><div class="mt-4 grid gap-4 xl:grid-cols-3"${_scopeId}><!--[-->`);
            ssrRenderList([
              { title: "Thiết bị", rows: __props.byDevice, empty: "Chưa có dữ liệu." },
              { title: "Nguồn dẫn", rows: __props.byReferrer, empty: "Chưa có ai vào từ trang khác." },
              { title: "Chuyên mục được đọc", rows: __props.byCategory, empty: "Chưa có lượt đọc bài nào." }
            ], (s) => {
              _push2(`<section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(s.title)}</h2>`);
              if (s.rows.length) {
                _push2(`<ul class="mt-3 space-y-2.5"${_scopeId}><!--[-->`);
                ssrRenderList(s.rows, (r) => {
                  _push2(`<li class="flex items-center gap-2.5"${_scopeId}><span class="w-[86px] shrink-0 truncate text-[12.5px] font-semibold"${_scopeId}>${ssrInterpolate(r.label)}</span><span class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"${_scopeId}><span class="block h-full rounded-full bg-accent" style="${ssrRenderStyle({ width: r.value / total(s.rows) * 100 + "%" })}"${_scopeId}></span></span><span class="w-12 shrink-0 text-right text-[12px] font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(r.value))}</span></li>`);
                });
                _push2(`<!--]--></ul>`);
              } else {
                _push2(`<p class="py-6 text-center text-[12.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(s.empty)}</p>`);
              }
              _push2(`</section>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Báo cáo truy cập",
                subtitle: __props.rolledAt ? `Số liệu gom 10 phút một lần — lần gần nhất ${unref(fmtAgo)(__props.rolledAt)}.` : "Chưa có số liệu nào được gom. Chạy lệnh stats:rollup hoặc chờ lịch chạy."
              }, {
                actions: withCtx(() => [
                  createVNode("div", { class: "flex gap-1" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.ranges, (r) => {
                      return openBlock(), createBlock("button", {
                        key: r.value,
                        class: ["adm-seg", __props.range === r.value && "adm-seg-on"],
                        onClick: ($event) => setRange(r.value)
                      }, toDisplayString(r.label), 11, ["onClick"]);
                    }), 128))
                  ])
                ]),
                _: 1
              }, 8, ["subtitle"]),
              createVNode("div", { class: "adm-card mb-4 flex flex-wrap items-center gap-x-8 gap-y-3 p-4" }, [
                createVNode("div", { class: "flex items-center gap-2.5" }, [
                  createVNode("span", { class: "relative flex size-2.5" }, [
                    createVNode("span", { class: "absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" }),
                    createVNode("span", { class: "relative inline-flex size-2.5 rounded-full bg-accent" })
                  ]),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted" }, "Đang đọc"),
                    createVNode("p", { class: "text-[20px] font-extrabold leading-tight tabular-nums" }, [
                      createTextVNode(toDisplayString(unref(fmtNumber)(__props.today.online)) + " ", 1),
                      createVNode("span", { class: "text-[12px] font-semibold text-ink-muted" }, "trong 5 phút qua")
                    ])
                  ])
                ]),
                createVNode("div", { class: "h-9 w-px bg-line" }),
                createVNode("div", null, [
                  createVNode("p", { class: "text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted" }, "Hôm nay"),
                  createVNode("p", { class: "text-[20px] font-extrabold leading-tight tabular-nums" }, [
                    createTextVNode(toDisplayString(unref(fmtNumber)(__props.today.views)) + " ", 1),
                    createVNode("span", { class: "text-[12px] font-semibold text-ink-muted" }, " lượt xem · " + toDisplayString(unref(fmtNumber)(__props.today.visitors)) + " khách ", 1)
                  ])
                ])
              ]),
              createVNode("div", { class: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4" }, [
                (openBlock(), createBlock(Fragment, null, renderList(["views", "visitors", "comments", "searches"], (k) => {
                  return createVNode(_sfc_main$s, {
                    key: k,
                    label: {
                      views: "Lượt xem",
                      visitors: "Khách truy cập",
                      comments: "Bình luận",
                      searches: "Lượt tìm kiếm"
                    }[k],
                    value: __props.totals[k] ?? 0,
                    icon: ICON[k],
                    tone: k === "views" ? "accent" : k === "visitors" ? "cyan" : "ink",
                    hint: delta(k) === null ? "" : `${delta(k) >= 0 ? "+" : ""}${delta(k)}% so với kỳ trước`
                  }, null, 8, ["label", "value", "icon", "tone", "hint"]);
                }), 64))
              ]),
              createVNode("section", { class: "adm-card mt-4 p-4" }, [
                createVNode("div", { class: "mb-3 flex flex-wrap items-baseline justify-between gap-2" }, [
                  createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Lượt xem theo ngày"),
                  createVNode("p", { class: "text-[12px] text-ink-muted" }, "Rê chuột lên cột để xem chi tiết.")
                ]),
                __props.totals.views ? (openBlock(), createBlock(_sfc_main$l, {
                  key: 0,
                  data: chart.value,
                  height: 170,
                  "every-nth": __props.range > 30 ? 7 : __props.range > 7 ? 3 : 1
                }, null, 8, ["data", "every-nth"])) : (openBlock(), createBlock(_sfc_main$r, {
                  key: 1,
                  title: "Chưa có lượt truy cập nào được ghi",
                  hint: "Số liệu bắt đầu có từ lần chạy stats:rollup đầu tiên sau khi bật theo dõi.",
                  icon: "M3 3v18h18M7 15l4-5 3 3 5-7"
                }))
              ]),
              createVNode("div", { class: "mt-4 grid gap-4 xl:grid-cols-2" }, [
                createVNode("section", { class: "adm-card p-4" }, [
                  createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Khung giờ đọc nhiều"),
                  createVNode("p", { class: "mt-0.5 text-[12px] text-ink-muted" }, " Cộng dồn cả kỳ — dùng để chọn giờ đăng bài. "),
                  createVNode(_sfc_main$l, {
                    class: "mt-3",
                    data: hours.value,
                    height: 130,
                    "every-nth": 3,
                    color: "var(--color-cyan)"
                  }, null, 8, ["data"])
                ]),
                createVNode("section", { class: "adm-card p-4" }, [
                  createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Bài đọc nhiều nhất"),
                  __props.topArticles.length ? (openBlock(), createBlock("ol", {
                    key: 0,
                    class: "mt-3 divide-y divide-line"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.topArticles, (a, i) => {
                      return openBlock(), createBlock("li", {
                        key: a.id,
                        class: "flex items-center gap-3 py-2 first:pt-0"
                      }, [
                        createVNode("span", { class: "w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums" }, toDisplayString(i + 1), 1),
                        createVNode("span", { class: "min-w-0 flex-1 truncate text-[13px] font-semibold" }, toDisplayString(a.title), 1),
                        createVNode("span", { class: "shrink-0 text-[12.5px] font-bold tabular-nums" }, toDisplayString(unref(fmtNumber)(a.views)), 1)
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("p", {
                    key: 1,
                    class: "py-8 text-center text-[13px] text-ink-muted"
                  }, "Chưa có dữ liệu."))
                ])
              ]),
              createVNode("div", { class: "mt-4 grid gap-4 xl:grid-cols-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList([
                  { title: "Thiết bị", rows: __props.byDevice, empty: "Chưa có dữ liệu." },
                  { title: "Nguồn dẫn", rows: __props.byReferrer, empty: "Chưa có ai vào từ trang khác." },
                  { title: "Chuyên mục được đọc", rows: __props.byCategory, empty: "Chưa có lượt đọc bài nào." }
                ], (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
                    class: "adm-card p-4"
                  }, [
                    createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, toDisplayString(s.title), 1),
                    s.rows.length ? (openBlock(), createBlock("ul", {
                      key: 0,
                      class: "mt-3 space-y-2.5"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(s.rows, (r) => {
                        return openBlock(), createBlock("li", {
                          key: r.label,
                          class: "flex items-center gap-2.5"
                        }, [
                          createVNode("span", { class: "w-[86px] shrink-0 truncate text-[12.5px] font-semibold" }, toDisplayString(r.label), 1),
                          createVNode("span", { class: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" }, [
                            createVNode("span", {
                              class: "block h-full rounded-full bg-accent",
                              style: { width: r.value / total(s.rows) * 100 + "%" }
                            }, null, 4)
                          ]),
                          createVNode("span", { class: "w-12 shrink-0 text-right text-[12px] font-bold tabular-nums" }, toDisplayString(unref(fmtNumber)(r.value)), 1)
                        ]);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "py-6 text-center text-[12.5px] text-ink-muted"
                    }, toDisplayString(s.empty), 1))
                  ]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Reports.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$i
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$h = {
  __name: "Roles",
  __ssrInlineRender: true,
  props: {
    roles: { type: Array, default: () => [] },
    groups: { type: Object, default: () => ({}) },
    // { 'Nội dung': { 'articles.view': 'Xem…' } }
    super: { type: String, default: "admin" }
  },
  setup(__props) {
    const props = __props;
    const editing = ref(null);
    const form = useForm({
      slug: "",
      name: "",
      color: "#0A9CB0",
      sort: 50,
      abilities: []
    });
    const allAbilities = computed(
      () => Object.values(props.groups).flatMap((g) => Object.keys(g))
    );
    function open(r) {
      editing.value = r || {};
      form.defaults({
        slug: r?.slug || "",
        name: r?.name || "",
        color: r?.color || "#0A9CB0",
        sort: r?.sort ?? 50,
        abilities: [...r?.abilities || []]
      });
      form.reset();
      form.clearErrors();
    }
    function toggle(a) {
      form.abilities = form.abilities.includes(a) ? form.abilities.filter((x) => x !== a) : [...form.abilities, a];
    }
    function toggleGroup(keys) {
      const allOn = keys.every((k) => form.abilities.includes(k));
      form.abilities = allOn ? form.abilities.filter((k) => !keys.includes(k)) : [.../* @__PURE__ */ new Set([...form.abilities, ...keys])];
    }
    function save() {
      const done = { preserveScroll: true, onSuccess: () => editing.value = null };
      editing.value?.slug ? form.put(`/admin/roles/${editing.value.slug}`, done) : form.post("/admin/roles", done);
    }
    function remove(r) {
      if (!confirm(`Xoá vai trò “${r.name}”?`)) return;
      router.delete(`/admin/roles/${r.slug}`, { preserveScroll: true });
    }
    const isSuper = computed(() => editing.value?.slug === props.super);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Vai trò · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Vai trò và phân quyền",
              subtitle: "Quyền gắn với việc, vai trò chỉ là một gói việc."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="btn btn-primary"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_sfc_main$x, { name: "plus" }, null, _parent3, _scopeId2));
                  _push3(` Thêm vai trò </button>`);
                } else {
                  return [
                    createVNode("button", {
                      class: "btn btn-primary",
                      onClick: ($event) => open(null)
                    }, [
                      createVNode(_sfc_main$x, { name: "plus" }),
                      createTextVNode(" Thêm vai trò ")
                    ], 8, ["onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="adm-card overflow-hidden"${_scopeId}><div class="overflow-x-auto"${_scopeId}><table class="adm-table min-w-[720px]"${_scopeId}><thead${_scopeId}><tr${_scopeId}><th class="min-w-[200px]"${_scopeId}>Quyền</th><!--[-->`);
            ssrRenderList(__props.roles, (r) => {
              _push2(`<th class="w-[110px] text-center"${_scopeId}><span class="flex flex-col items-center gap-0.5"${_scopeId}><span style="${ssrRenderStyle({ color: r.color })}"${_scopeId}>${ssrInterpolate(r.name)}</span><span class="font-normal normal-case tracking-normal text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(r.users))} người </span></span></th>`);
            });
            _push2(`<!--]--></tr></thead><tbody${_scopeId}><!--[-->`);
            ssrRenderList(__props.groups, (abilities, group) => {
              _push2(`<!--[--><tr${_scopeId}><td${ssrRenderAttr("colspan", __props.roles.length + 1)} class="!bg-surface !py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted"${_scopeId}>${ssrInterpolate(group)}</td></tr><!--[-->`);
              ssrRenderList(abilities, (label, key) => {
                _push2(`<tr${_scopeId}><td${_scopeId}><p class="text-[13px] font-semibold"${_scopeId}>${ssrInterpolate(label)}</p><p class="font-mono text-[11px] text-ink-muted"${_scopeId}>${ssrInterpolate(key)}</p></td><!--[-->`);
                ssrRenderList(__props.roles, (r) => {
                  _push2(`<td class="text-center"${_scopeId}>`);
                  if (r.abilities.includes(key)) {
                    _push2(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" class="mx-auto size-4" style="${ssrRenderStyle({ color: r.color })}"${_scopeId}><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"${_scopeId}></path></svg>`);
                  } else {
                    _push2(`<span class="text-ink-muted/30"${_scopeId}>—</span>`);
                  }
                  _push2(`</td>`);
                });
                _push2(`<!--]--></tr>`);
              });
              _push2(`<!--]--><!--]-->`);
            });
            _push2(`<!--]--></tbody></table></div></div><div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"${_scopeId}><!--[-->`);
            ssrRenderList(__props.roles, (r) => {
              _push2(`<article class="adm-card p-4"${_scopeId}><div class="flex items-start gap-2.5"${_scopeId}><span class="mt-1 h-7 w-1.5 shrink-0 rounded-full" style="${ssrRenderStyle({ background: r.color })}"${_scopeId}></span><div class="min-w-0 flex-1"${_scopeId}><h2 class="flex items-center gap-1.5 truncate font-bold"${_scopeId}>${ssrInterpolate(r.name)} `);
              if (r.is_system) {
                _push2(`<span class="adm-chip" style="${ssrRenderStyle({ "background": "var(--color-surface-2)" })}"${_scopeId}>hệ thống</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</h2><p class="truncate font-mono text-[11.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(r.slug)}</p></div></div><p class="mt-3 text-[12.5px] text-ink-2 tabular-nums"${_scopeId}>${ssrInterpolate(r.abilities.length)} quyền · ${ssrInterpolate(unref(fmtNumber)(r.users))} tài khoản </p><div class="mt-3 flex gap-1.5"${_scopeId}><button class="btn flex-1 !py-1.5 !text-[13px]"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$x, {
                name: "edit",
                size: "size-3.5"
              }, null, _parent2, _scopeId));
              _push2(` Sửa </button>`);
              if (!r.is_system) {
                _push2(`<button class="btn btn-danger !py-1.5 !text-[13px]"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$x, {
                  name: "trash",
                  size: "size-3.5"
                }, null, _parent2, _scopeId));
                _push2(`</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></article>`);
            });
            _push2(`<!--]--></div>`);
            if (editing.value) {
              _push2(`<div class="fixed inset-0 z-50 flex justify-end bg-black/40"${_scopeId}><div class="flex h-full w-full max-w-[560px] flex-col bg-page shadow-2xl"${_scopeId}><header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5"${_scopeId}><h2 class="text-[15px] font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(editing.value.slug ? `Sửa vai trò “${editing.value.name}”` : "Vai trò mới")}</h2><button class="btn !ml-auto !border-transparent !px-2" aria-label="Đóng"${_scopeId}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"${_scopeId}><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"${_scopeId}></path></svg></button></header><form class="flex-1 space-y-4 overflow-y-auto p-5"${_scopeId}><div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="n"${_scopeId}>Tên hiển thị</label><input id="n"${ssrRenderAttr("value", unref(form).name)} class="input" required maxlength="60"${_scopeId}>`);
              if (unref(form).errors.name) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="c"${_scopeId}>Màu</label><input id="c"${ssrRenderAttr("value", unref(form).color)} type="color" class="input !w-14 !p-1"${_scopeId}></div><div class="space-y-1.5"${_scopeId}><label class="label" for="so"${_scopeId}>Thứ tự</label><input id="so"${ssrRenderAttr("value", unref(form).sort)} type="number" min="0" max="999" class="input !w-20 text-center"${_scopeId}></div></div>`);
              if (!editing.value.slug) {
                _push2(`<div class="space-y-1.5"${_scopeId}><label class="label" for="sl"${_scopeId}>Mã vai trò</label><input id="sl"${ssrRenderAttr("value", unref(form).slug)} class="input font-mono !text-[13px]" required maxlength="30" placeholder="vd: cong-tac-vien"${_scopeId}>`);
                if (unref(form).errors.slug) {
                  _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.slug)}</p>`);
                } else {
                  _push2(`<p class="text-[11.5px] text-ink-muted"${_scopeId}> Không đổi được sau khi tạo — đổi mã là mọi tài khoản mang vai trò đó mất quyền. </p>`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (isSuper.value) {
                _push2(`<div class="rounded-xl border px-4 py-3 text-[13px] leading-relaxed" style="${ssrRenderStyle({ "border-color": "rgba(217,22,68,.3)", "background": "rgba(217,22,68,.07)", "color": "var(--color-accent-ink)" })}"${_scopeId}> Vai trò toàn quyền luôn có mọi quyền và không sửa được danh sách bên dưới. Gỡ nhầm một ô là khoá luôn cả hệ thống, mà lúc đó không còn ai vào để gỡ lại. </div>`);
              } else {
                _push2(`<div class="space-y-4"${_scopeId}><!--[-->`);
                ssrRenderList(__props.groups, (abilities, group) => {
                  _push2(`<div class="rounded-xl border border-line p-3.5"${_scopeId}><div class="mb-2.5 flex items-center justify-between"${_scopeId}><p class="text-[12px] font-bold uppercase tracking-wide text-ink-muted"${_scopeId}>${ssrInterpolate(group)}</p><button type="button" class="cbtn"${_scopeId}> Chọn / bỏ hết </button></div><div class="space-y-2.5"${_scopeId}><!--[-->`);
                  ssrRenderList(abilities, (label, key) => {
                    _push2(`<label class="flex cursor-pointer items-start gap-2.5"${_scopeId}>`);
                    _push2(ssrRenderComponent(_sfc_main$q, {
                      "model-value": unref(form).abilities.includes(key),
                      "onUpdate:modelValue": ($event) => toggle(key)
                    }, null, _parent2, _scopeId));
                    _push2(`<span class="min-w-0"${_scopeId}><span class="block text-[13px] font-semibold leading-snug"${_scopeId}>${ssrInterpolate(label)}</span><span class="block font-mono text-[11px] text-ink-muted"${_scopeId}>${ssrInterpolate(key)}</span></span></label>`);
                  });
                  _push2(`<!--]--></div></div>`);
                });
                _push2(`<!--]--><p class="text-[12px] text-ink-muted"${_scopeId}> Vai trò không có quyền nào thì không vào được khu quản trị. </p></div>`);
              }
              _push2(`</form><footer class="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3"${_scopeId}>`);
              if (!isSuper.value) {
                _push2(`<span class="text-[12.5px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(unref(form).abilities.length)}/${ssrInterpolate(allAbilities.value.length)} quyền </span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button class="btn ml-auto"${_scopeId}>Huỷ</button><button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu vai trò")}</button></footer></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Vai trò và phân quyền",
                subtitle: "Quyền gắn với việc, vai trò chỉ là một gói việc."
              }, {
                actions: withCtx(() => [
                  createVNode("button", {
                    class: "btn btn-primary",
                    onClick: ($event) => open(null)
                  }, [
                    createVNode(_sfc_main$x, { name: "plus" }),
                    createTextVNode(" Thêm vai trò ")
                  ], 8, ["onClick"])
                ]),
                _: 1
              }),
              createVNode("div", { class: "adm-card overflow-hidden" }, [
                createVNode("div", { class: "overflow-x-auto" }, [
                  createVNode("table", { class: "adm-table min-w-[720px]" }, [
                    createVNode("thead", null, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "min-w-[200px]" }, "Quyền"),
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                          return openBlock(), createBlock("th", {
                            key: r.slug,
                            class: "w-[110px] text-center"
                          }, [
                            createVNode("span", { class: "flex flex-col items-center gap-0.5" }, [
                              createVNode("span", {
                                style: { color: r.color }
                              }, toDisplayString(r.name), 5),
                              createVNode("span", { class: "font-normal normal-case tracking-normal text-ink-muted" }, toDisplayString(unref(fmtNumber)(r.users)) + " người ", 1)
                            ])
                          ]);
                        }), 128))
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.groups, (abilities, group) => {
                        return openBlock(), createBlock(Fragment, { key: group }, [
                          createVNode("tr", null, [
                            createVNode("td", {
                              colspan: __props.roles.length + 1,
                              class: "!bg-surface !py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted"
                            }, toDisplayString(group), 9, ["colspan"])
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(abilities, (label, key) => {
                            return openBlock(), createBlock("tr", { key }, [
                              createVNode("td", null, [
                                createVNode("p", { class: "text-[13px] font-semibold" }, toDisplayString(label), 1),
                                createVNode("p", { class: "font-mono text-[11px] text-ink-muted" }, toDisplayString(key), 1)
                              ]),
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                                return openBlock(), createBlock("td", {
                                  key: r.slug,
                                  class: "text-center"
                                }, [
                                  r.abilities.includes(key) ? (openBlock(), createBlock("svg", {
                                    key: 0,
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    "stroke-width": "2.6",
                                    class: "mx-auto size-4",
                                    style: { color: r.color }
                                  }, [
                                    createVNode("path", {
                                      d: "m5 13 4 4L19 7",
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round"
                                    })
                                  ], 4)) : (openBlock(), createBlock("span", {
                                    key: 1,
                                    class: "text-ink-muted/30"
                                  }, "—"))
                                ]);
                              }), 128))
                            ]);
                          }), 128))
                        ], 64);
                      }), 128))
                    ])
                  ])
                ])
              ]),
              createVNode("div", { class: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                  return openBlock(), createBlock("article", {
                    key: r.slug,
                    class: "adm-card p-4"
                  }, [
                    createVNode("div", { class: "flex items-start gap-2.5" }, [
                      createVNode("span", {
                        class: "mt-1 h-7 w-1.5 shrink-0 rounded-full",
                        style: { background: r.color }
                      }, null, 4),
                      createVNode("div", { class: "min-w-0 flex-1" }, [
                        createVNode("h2", { class: "flex items-center gap-1.5 truncate font-bold" }, [
                          createTextVNode(toDisplayString(r.name) + " ", 1),
                          r.is_system ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "adm-chip",
                            style: { "background": "var(--color-surface-2)" }
                          }, "hệ thống")) : createCommentVNode("", true)
                        ]),
                        createVNode("p", { class: "truncate font-mono text-[11.5px] text-ink-muted" }, toDisplayString(r.slug), 1)
                      ])
                    ]),
                    createVNode("p", { class: "mt-3 text-[12.5px] text-ink-2 tabular-nums" }, toDisplayString(r.abilities.length) + " quyền · " + toDisplayString(unref(fmtNumber)(r.users)) + " tài khoản ", 1),
                    createVNode("div", { class: "mt-3 flex gap-1.5" }, [
                      createVNode("button", {
                        class: "btn flex-1 !py-1.5 !text-[13px]",
                        onClick: ($event) => open(r)
                      }, [
                        createVNode(_sfc_main$x, {
                          name: "edit",
                          size: "size-3.5"
                        }),
                        createTextVNode(" Sửa ")
                      ], 8, ["onClick"]),
                      !r.is_system ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "btn btn-danger !py-1.5 !text-[13px]",
                        onClick: ($event) => remove(r)
                      }, [
                        createVNode(_sfc_main$x, {
                          name: "trash",
                          size: "size-3.5"
                        })
                      ], 8, ["onClick"])) : createCommentVNode("", true)
                    ])
                  ]);
                }), 128))
              ]),
              editing.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "fixed inset-0 z-50 flex justify-end bg-black/40",
                onClick: withModifiers(($event) => editing.value = null, ["self"])
              }, [
                createVNode("div", { class: "flex h-full w-full max-w-[560px] flex-col bg-page shadow-2xl" }, [
                  createVNode("header", { class: "flex h-14 shrink-0 items-center gap-3 border-b border-line px-5" }, [
                    createVNode("h2", { class: "text-[15px] font-extrabold tracking-tight" }, toDisplayString(editing.value.slug ? `Sửa vai trò “${editing.value.name}”` : "Vai trò mới"), 1),
                    createVNode("button", {
                      class: "btn !ml-auto !border-transparent !px-2",
                      "aria-label": "Đóng",
                      onClick: ($event) => editing.value = null
                    }, [
                      (openBlock(), createBlock("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        class: "size-5"
                      }, [
                        createVNode("path", {
                          d: "M18 6 6 18M6 6l12 12",
                          "stroke-linecap": "round"
                        })
                      ]))
                    ], 8, ["onClick"])
                  ]),
                  createVNode("form", {
                    class: "flex-1 space-y-4 overflow-y-auto p-5",
                    onSubmit: withModifiers(save, ["prevent"])
                  }, [
                    createVNode("div", { class: "grid gap-3 sm:grid-cols-[1fr_auto_auto]" }, [
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", {
                          class: "label",
                          for: "n"
                        }, "Tên hiển thị"),
                        withDirectives(createVNode("input", {
                          id: "n",
                          "onUpdate:modelValue": ($event) => unref(form).name = $event,
                          class: "input",
                          required: "",
                          maxlength: "60"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).name]
                        ]),
                        unref(form).errors.name ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-[12px] text-accent-ink"
                        }, toDisplayString(unref(form).errors.name), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", {
                          class: "label",
                          for: "c"
                        }, "Màu"),
                        withDirectives(createVNode("input", {
                          id: "c",
                          "onUpdate:modelValue": ($event) => unref(form).color = $event,
                          type: "color",
                          class: "input !w-14 !p-1"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).color]
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", {
                          class: "label",
                          for: "so"
                        }, "Thứ tự"),
                        withDirectives(createVNode("input", {
                          id: "so",
                          "onUpdate:modelValue": ($event) => unref(form).sort = $event,
                          type: "number",
                          min: "0",
                          max: "999",
                          class: "input !w-20 text-center"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(form).sort,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ])
                    ]),
                    !editing.value.slug ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "space-y-1.5"
                    }, [
                      createVNode("label", {
                        class: "label",
                        for: "sl"
                      }, "Mã vai trò"),
                      withDirectives(createVNode("input", {
                        id: "sl",
                        "onUpdate:modelValue": ($event) => unref(form).slug = $event,
                        class: "input font-mono !text-[13px]",
                        required: "",
                        maxlength: "30",
                        placeholder: "vd: cong-tac-vien"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).slug]
                      ]),
                      unref(form).errors.slug ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.slug), 1)) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-[11.5px] text-ink-muted"
                      }, " Không đổi được sau khi tạo — đổi mã là mọi tài khoản mang vai trò đó mất quyền. "))
                    ])) : createCommentVNode("", true),
                    isSuper.value ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "rounded-xl border px-4 py-3 text-[13px] leading-relaxed",
                      style: { "border-color": "rgba(217,22,68,.3)", "background": "rgba(217,22,68,.07)", "color": "var(--color-accent-ink)" }
                    }, " Vai trò toàn quyền luôn có mọi quyền và không sửa được danh sách bên dưới. Gỡ nhầm một ô là khoá luôn cả hệ thống, mà lúc đó không còn ai vào để gỡ lại. ")) : (openBlock(), createBlock("div", {
                      key: 2,
                      class: "space-y-4"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.groups, (abilities, group) => {
                        return openBlock(), createBlock("div", {
                          key: group,
                          class: "rounded-xl border border-line p-3.5"
                        }, [
                          createVNode("div", { class: "mb-2.5 flex items-center justify-between" }, [
                            createVNode("p", { class: "text-[12px] font-bold uppercase tracking-wide text-ink-muted" }, toDisplayString(group), 1),
                            createVNode("button", {
                              type: "button",
                              class: "cbtn",
                              onClick: ($event) => toggleGroup(Object.keys(abilities))
                            }, " Chọn / bỏ hết ", 8, ["onClick"])
                          ]),
                          createVNode("div", { class: "space-y-2.5" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(abilities, (label, key) => {
                              return openBlock(), createBlock("label", {
                                key,
                                class: "flex cursor-pointer items-start gap-2.5"
                              }, [
                                createVNode(_sfc_main$q, {
                                  "model-value": unref(form).abilities.includes(key),
                                  "onUpdate:modelValue": ($event) => toggle(key)
                                }, null, 8, ["model-value", "onUpdate:modelValue"]),
                                createVNode("span", { class: "min-w-0" }, [
                                  createVNode("span", { class: "block text-[13px] font-semibold leading-snug" }, toDisplayString(label), 1),
                                  createVNode("span", { class: "block font-mono text-[11px] text-ink-muted" }, toDisplayString(key), 1)
                                ])
                              ]);
                            }), 128))
                          ])
                        ]);
                      }), 128)),
                      createVNode("p", { class: "text-[12px] text-ink-muted" }, " Vai trò không có quyền nào thì không vào được khu quản trị. ")
                    ]))
                  ], 32),
                  createVNode("footer", { class: "flex shrink-0 items-center gap-2 border-t border-line px-5 py-3" }, [
                    !isSuper.value ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-[12.5px] text-ink-muted tabular-nums"
                    }, toDisplayString(unref(form).abilities.length) + "/" + toDisplayString(allAbilities.value.length) + " quyền ", 1)) : createCommentVNode("", true),
                    createVNode("button", {
                      class: "btn ml-auto",
                      onClick: ($event) => editing.value = null
                    }, "Huỷ", 8, ["onClick"]),
                    createVNode("button", {
                      class: "btn btn-primary",
                      disabled: unref(form).processing,
                      onClick: save
                    }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu vai trò"), 9, ["disabled"])
                  ])
                ])
              ], 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Roles.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$h
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$g = {
  __name: "Settings",
  __ssrInlineRender: true,
  props: {
    settings: { type: Object, required: true },
    defaults: { type: Object, default: () => ({}) }
  },
  setup(__props) {
    const props = __props;
    const form = useForm({ ...props.settings, per_page: Number(props.settings.per_page) });
    const SECTIONS = [
      {
        title: "Nhận diện",
        hint: "Tên và mô tả này xuất hiện ở thẻ <title>, thẻ chia sẻ mạng xã hội và dữ liệu có cấu trúc cho Google.",
        fields: [
          { k: "name", label: "Tên website", type: "text", required: true },
          { k: "tagline", label: "Khẩu hiệu", type: "text" },
          {
            k: "description",
            label: "Mô tả trang chủ",
            type: "textarea",
            hint: "Google thường cắt quanh 160 ký tự."
          },
          { k: "logo", label: "Đường dẫn logo", type: "text" }
        ]
      },
      {
        title: "Hiển thị",
        fields: [
          {
            k: "per_page",
            label: "Số bài mỗi trang",
            type: "number",
            min: 6,
            max: 60,
            required: true,
            hint: "Áp dụng cho trang chuyên mục và tìm kiếm."
          },
          { k: "ga", label: "Mã Google Analytics", type: "text", placeholder: "G-XXXXXXXXXX" }
        ]
      },
      {
        title: "Liên hệ",
        fields: [
          { k: "email", label: "Email", type: "email" },
          { k: "hotline", label: "Điện thoại", type: "text" },
          { k: "address", label: "Địa chỉ", type: "text" }
        ]
      },
      {
        title: "Mạng xã hội",
        hint: "Để trống thì biểu tượng tương ứng không hiện ở chân trang.",
        fields: [
          { k: "facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/…" },
          { k: "youtube", label: "YouTube", type: "url", placeholder: "https://youtube.com/@…" },
          { k: "tiktok", label: "TikTok", type: "url", placeholder: "https://tiktok.com/@…" }
        ]
      },
      {
        title: "Chân trang",
        fields: [
          { k: "copyright", label: "Dòng bản quyền", type: "textarea" }
        ]
      }
    ];
    const changed = (k) => String(form[k] ?? "") !== String(props.settings[k] ?? "");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Cấu hình · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Cấu hình website",
              subtitle: "Những giá trị này thay cho việc phải sửa file rồi khởi động lại."
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).isDirty) ? " disabled" : ""}${_scopeId2}>${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu thay đổi")}</button>`);
                } else {
                  return [
                    createVNode("button", {
                      class: "btn btn-primary",
                      disabled: unref(form).processing || !unref(form).isDirty,
                      onClick: ($event) => unref(form).put("/admin/settings", { preserveScroll: true })
                    }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu thay đổi"), 9, ["disabled", "onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<form class="grid gap-5 xl:grid-cols-2"${_scopeId}><!--[-->`);
            ssrRenderList(SECTIONS, (s) => {
              _push2(`<section class="adm-card p-4"${_scopeId}><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(s.title)}</h2>`);
              if (s.hint) {
                _push2(`<p class="mt-0.5 text-[12px] leading-relaxed text-ink-muted"${_scopeId}>${ssrInterpolate(s.hint)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="mt-3.5 space-y-3.5"${_scopeId}><!--[-->`);
              ssrRenderList(s.fields, (f) => {
                _push2(`<div class="space-y-1.5"${_scopeId}><label class="label flex items-center gap-1.5"${ssrRenderAttr("for", f.k)}${_scopeId}>${ssrInterpolate(f.label)} `);
                if (changed(f.k)) {
                  _push2(`<span class="size-1.5 rounded-full bg-accent" title="Chưa lưu"${_scopeId}></span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</label>`);
                if (f.type === "textarea") {
                  _push2(`<textarea${ssrRenderAttr("id", f.k)} rows="2" class="input resize-y !py-2"${_scopeId}>${ssrInterpolate(unref(form)[f.k])}</textarea>`);
                } else {
                  _push2(`<input${ssrRenderAttr("id", f.k)}${ssrRenderDynamicModel(f.type, unref(form)[f.k], null)}${ssrRenderAttr("type", f.type)}${ssrRenderAttr("min", f.min)}${ssrRenderAttr("max", f.max)}${ssrIncludeBooleanAttr(f.required) ? " required" : ""}${ssrRenderAttr("placeholder", f.placeholder)} class="input"${_scopeId}>`);
                }
                if (unref(form).errors[f.k]) {
                  _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors[f.k])}</p>`);
                } else if (f.hint) {
                  _push2(`<p class="text-[11.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(f.hint)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div></section>`);
            });
            _push2(`<!--]--></form><p class="mt-5 text-[12.5px] text-ink-muted"${_scopeId}> Lưu xong, bộ nhớ đệm trang chủ và cột bên được dọn ngay — không phải chờ hết 5 phút. </p>`);
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Cấu hình website",
                subtitle: "Những giá trị này thay cho việc phải sửa file rồi khởi động lại."
              }, {
                actions: withCtx(() => [
                  createVNode("button", {
                    class: "btn btn-primary",
                    disabled: unref(form).processing || !unref(form).isDirty,
                    onClick: ($event) => unref(form).put("/admin/settings", { preserveScroll: true })
                  }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu thay đổi"), 9, ["disabled", "onClick"])
                ]),
                _: 1
              }),
              createVNode("form", {
                class: "grid gap-5 xl:grid-cols-2",
                onSubmit: withModifiers(($event) => unref(form).put("/admin/settings", { preserveScroll: true }), ["prevent"])
              }, [
                (openBlock(), createBlock(Fragment, null, renderList(SECTIONS, (s) => {
                  return createVNode("section", {
                    key: s.title,
                    class: "adm-card p-4"
                  }, [
                    createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, toDisplayString(s.title), 1),
                    s.hint ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "mt-0.5 text-[12px] leading-relaxed text-ink-muted"
                    }, toDisplayString(s.hint), 1)) : createCommentVNode("", true),
                    createVNode("div", { class: "mt-3.5 space-y-3.5" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(s.fields, (f) => {
                        return openBlock(), createBlock("div", {
                          key: f.k,
                          class: "space-y-1.5"
                        }, [
                          createVNode("label", {
                            class: "label flex items-center gap-1.5",
                            for: f.k
                          }, [
                            createTextVNode(toDisplayString(f.label) + " ", 1),
                            changed(f.k) ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "size-1.5 rounded-full bg-accent",
                              title: "Chưa lưu"
                            })) : createCommentVNode("", true)
                          ], 8, ["for"]),
                          f.type === "textarea" ? withDirectives((openBlock(), createBlock("textarea", {
                            key: 0,
                            id: f.k,
                            "onUpdate:modelValue": ($event) => unref(form)[f.k] = $event,
                            rows: "2",
                            class: "input resize-y !py-2"
                          }, null, 8, ["id", "onUpdate:modelValue"])), [
                            [vModelText, unref(form)[f.k]]
                          ]) : withDirectives((openBlock(), createBlock("input", {
                            key: 1,
                            id: f.k,
                            "onUpdate:modelValue": ($event) => unref(form)[f.k] = $event,
                            type: f.type,
                            min: f.min,
                            max: f.max,
                            required: f.required,
                            placeholder: f.placeholder,
                            class: "input"
                          }, null, 8, ["id", "onUpdate:modelValue", "type", "min", "max", "required", "placeholder"])), [
                            [vModelDynamic, unref(form)[f.k]]
                          ]),
                          unref(form).errors[f.k] ? (openBlock(), createBlock("p", {
                            key: 2,
                            class: "text-[12px] text-accent-ink"
                          }, toDisplayString(unref(form).errors[f.k]), 1)) : f.hint ? (openBlock(), createBlock("p", {
                            key: 3,
                            class: "text-[11.5px] text-ink-muted"
                          }, toDisplayString(f.hint), 1)) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])
                  ]);
                }), 64))
              ], 40, ["onSubmit"]),
              createVNode("p", { class: "mt-5 text-[12.5px] text-ink-muted" }, " Lưu xong, bộ nhớ đệm trang chủ và cột bên được dọn ngay — không phải chờ hết 5 phút. ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Settings.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$g
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$f = {
  __name: "Users",
  __ssrInlineRender: true,
  props: {
    users: { type: Object, required: true },
    filters: { type: Object, default: () => ({}) },
    roles: { type: Array, default: () => [] },
    stats: { type: Object, default: () => ({}) }
  },
  setup(__props) {
    const props = __props;
    const me = computed(() => usePage().props.auth.user);
    const canManage = computed(() => !!me.value?.can?.["users.manage"]);
    const q = ref(props.filters.q || "");
    const role = ref(props.filters.role || "");
    const verified = ref(props.filters.verified || "");
    let timer;
    watch([q, role, verified], () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        router.get("/admin/users", {
          q: q.value || void 0,
          role: role.value || void 0,
          verified: verified.value || void 0
        }, { preserveState: true, replace: true });
      }, 300);
    });
    const editing = ref(null);
    const form = useForm({ name: "", email: "", username: "", bio: "", role: "", verified: false });
    function open(u) {
      editing.value = u;
      form.defaults({
        name: u.name || "",
        email: u.email || "",
        username: u.username || "",
        bio: u.bio || "",
        role: u.role,
        verified: !!u.email_verified_at
      });
      form.reset();
      form.clearErrors();
    }
    const save = () => form.put(`/admin/users/${editing.value.id}`, {
      preserveScroll: true,
      onSuccess: () => editing.value = null
    });
    const toggleVerify = (u) => router.patch(`/admin/users/${u.id}/verify`, {}, { preserveScroll: true });
    const roleOf = (r) => props.roles.find((x) => x.value === r);
    function setRole(user, value) {
      if (value === user.role) return;
      router.put(`/admin/users/${user.id}`, { role: value }, { preserveScroll: true });
    }
    function remove(user) {
      if (!confirm(`Xoá "${user.name}"? Bình luận của họ cũng mất theo.`)) return;
      router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(Head), { title: "Người dùng · Quản trị" }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$y, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$t, {
              title: "Người dùng",
              subtitle: canManage.value ? "Đổi quyền hoặc xoá tài khoản. Luôn phải còn ít nhất một tài khoản toàn quyền." : "Bạn chỉ có quyền xem danh sách này."
            }, null, _parent2, _scopeId));
            _push2(`<div class="adm-card mb-4 flex flex-wrap gap-x-6 gap-y-2 p-3.5"${_scopeId}><!--[-->`);
            ssrRenderList(__props.roles, (r) => {
              _push2(`<div class="min-w-[150px]"${_scopeId}><p class="flex items-center gap-1.5 text-[12.5px] font-bold" style="${ssrRenderStyle({ color: r.color })}"${_scopeId}><span class="size-2 rounded-full" style="${ssrRenderStyle({ background: r.color })}"${_scopeId}></span> ${ssrInterpolate(r.label)}</p><p class="mt-0.5 text-[11.5px] leading-snug text-ink-muted"${_scopeId}>${ssrInterpolate(r.abilities.length ? `${r.abilities.length} quyền` : "Không vào khu quản trị")}</p></div>`);
            });
            _push2(`<!--]--></div><div class="mb-4 flex flex-wrap items-center gap-2.5"${_scopeId}><div class="relative min-w-[220px] flex-1 sm:max-w-xs"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$x, {
              name: "search",
              class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            }, null, _parent2, _scopeId));
            _push2(`<input${ssrRenderAttr("value", q.value)} class="input !pl-9" placeholder="Tìm theo tên hoặc email…"${_scopeId}></div><div class="flex flex-wrap gap-1"${_scopeId}><button class="${ssrRenderClass(["adm-seg", role.value === "" && "adm-seg-on"])}"${_scopeId}>Tất cả</button><!--[-->`);
            ssrRenderList(__props.roles, (r) => {
              _push2(`<button class="${ssrRenderClass(["adm-seg", role.value === r.value && "adm-seg-on"])}"${_scopeId}>${ssrInterpolate(r.label)}</button>`);
            });
            _push2(`<!--]--></div><div class="flex gap-1"${_scopeId}><!--[-->`);
            ssrRenderList([["", "Mọi trạng thái"], ["yes", "Đã xác minh"], ["no", "Chưa xác minh"]], (v) => {
              _push2(`<button class="${ssrRenderClass(["adm-seg", verified.value === v[0] && "adm-seg-on"])}"${_scopeId}>${ssrInterpolate(v[1])}</button>`);
            });
            _push2(`<!--]--></div><span class="ml-auto text-[13px] text-ink-muted tabular-nums"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.stats.verified))}/${ssrInterpolate(unref(fmtNumber)(__props.stats.total))} đã xác minh </span></div><div class="adm-card overflow-hidden"${_scopeId}>`);
            if (__props.users.data.length) {
              _push2(`<div class="max-h-[calc(100dvh-340px)] overflow-auto"${_scopeId}><table class="adm-table min-w-[800px]"${_scopeId}><thead${_scopeId}><tr${_scopeId}><th${_scopeId}>Người dùng</th><th class="w-[220px]"${_scopeId}>Hoạt động</th><th class="w-[150px]"${_scopeId}>Tham gia</th><th class="w-[130px]"${_scopeId}>Quyền</th><th class="w-[110px]"${_scopeId}>Xác minh</th><th class="w-[76px]"${_scopeId}></th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(__props.users.data, (u) => {
                _push2(`<tr${_scopeId}><td${_scopeId}><div class="flex items-center gap-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$A, {
                  user: u,
                  size: "size-9 text-[13px]"
                }, null, _parent2, _scopeId));
                _push2(`<div class="min-w-0"${_scopeId}><p class="flex items-center gap-1.5 truncate text-[13.5px] font-bold"${_scopeId}>${ssrInterpolate(u.name)} `);
                if (u.id === me.value.id) {
                  _push2(`<span class="adm-chip" style="${ssrRenderStyle({ "background": "var(--color-surface-2)" })}"${_scopeId}>bạn</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p><p class="flex items-center gap-1 truncate text-[12px] text-ink-muted"${_scopeId}>${ssrInterpolate(u.email)} `);
                if (u.email_verified_at) {
                  _push2(`<svg viewBox="0 0 24 24" fill="currentColor" class="size-3.5 shrink-0 text-cyan" title="Email đã xác minh"${_scopeId}><path d="M12 2 9.6 4.4 6.3 3.9 5.1 7 2 8.2l.5 3.3L0 14l2.5 2.5L2 19.8l3.1 1.2 1.2 3.1 3.3-.5L12 26l2.4-2.4 3.3.5 1.2-3.1 3.1-1.2-.5-3.3L24 14l-2.5-2.5.5-3.3-3.1-1.2-1.2-3.1-3.3.5z" transform="scale(.92) translate(1 -1)" opacity=".18"${_scopeId}></path><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4.2-4.2 1.7-1.7 2.5 2.5 5.1-5.1 1.7 1.7z"${_scopeId}></path></svg>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p>`);
                if (u.username) {
                  _push2(`<p class="truncate text-[11.5px] text-ink-muted"${_scopeId}>@${ssrInterpolate(u.username)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></td><td class="text-[12.5px] text-ink-2 tabular-nums"${_scopeId}>${ssrInterpolate(u.comments_count)} bình luận · ${ssrInterpolate(u.likes_count)} thích · ${ssrInterpolate(u.bookmarks_count)} lưu </td><td class="text-[12.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtDate)(u.created_at))} `);
                if (u.last_seen_at) {
                  _push2(`<span class="block text-[11px]"${_scopeId}> Vào lần cuối ${ssrInterpolate(unref(fmtAgo)(u.last_seen_at))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td${_scopeId}>`);
                if (canManage.value) {
                  _push2(`<select class="input !w-auto !py-1 !text-[12.5px] font-semibold" style="${ssrRenderStyle({ color: roleOf(u.role)?.color })}"${ssrRenderAttr("value", u.role)}${_scopeId}><!--[-->`);
                  ssrRenderList(__props.roles, (r) => {
                    _push2(`<option${ssrRenderAttr("value", r.value)}${_scopeId}>${ssrInterpolate(r.label)}</option>`);
                  });
                  _push2(`<!--]--></select>`);
                } else {
                  _push2(`<span class="adm-chip" style="${ssrRenderStyle({ background: roleOf(u.role)?.color + "1f", color: roleOf(u.role)?.color })}"${_scopeId}>${ssrInterpolate(roleOf(u.role)?.label)}</span>`);
                }
                _push2(`</td><td${_scopeId}>`);
                if (canManage.value) {
                  _push2(ssrRenderComponent(_sfc_main$q, {
                    "model-value": !!u.email_verified_at,
                    "onUpdate:modelValue": ($event) => toggleVerify(u)
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<span class="adm-chip" style="${ssrRenderStyle(u.email_verified_at ? { background: "color-mix(in srgb, var(--color-cyan) 14%, transparent)", color: "var(--color-cyan)" } : { background: "var(--color-surface-2)", color: "var(--color-ink-muted)" })}"${_scopeId}>${ssrInterpolate(u.email_verified_at ? "Đã xác minh" : "Chưa")}</span>`);
                }
                _push2(`</td><td${_scopeId}>`);
                if (canManage.value) {
                  _push2(`<span class="rowacts"${_scopeId}>`);
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    icon: "edit",
                    label: "Sửa hồ sơ",
                    onClick: ($event) => open(u)
                  }, null, _parent2, _scopeId));
                  if (u.id !== me.value.id) {
                    _push2(ssrRenderComponent(_sfc_main$v, {
                      icon: "trash",
                      label: "Xoá tài khoản",
                      tone: "danger",
                      onClick: ($event) => remove(u)
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              _push2(ssrRenderComponent(_sfc_main$r, {
                title: "Không có người dùng nào khớp",
                hint: "Thử bỏ bớt bộ lọc hoặc xoá từ khoá tìm kiếm.",
                icon: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"
              }, null, _parent2, _scopeId));
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_sfc_main$p, {
              page: __props.users,
              unit: "người dùng",
              class: "mt-4"
            }, null, _parent2, _scopeId));
            if (editing.value) {
              _push2(`<div class="fixed inset-0 z-50 flex justify-end bg-black/40"${_scopeId}><div class="flex h-full w-full max-w-[480px] flex-col bg-page shadow-2xl"${_scopeId}><header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5"${_scopeId}><h2 class="truncate text-[15px] font-extrabold tracking-tight"${_scopeId}> Sửa “${ssrInterpolate(editing.value.name)}” </h2><button class="btn !ml-auto !border-transparent !px-2" aria-label="Đóng"${_scopeId}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"${_scopeId}><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"${_scopeId}></path></svg></button></header><form class="flex-1 space-y-4 overflow-y-auto p-5"${_scopeId}><div class="space-y-1.5"${_scopeId}><label class="label" for="un"${_scopeId}>Tên hiển thị</label><input id="un"${ssrRenderAttr("value", unref(form).name)} class="input" required maxlength="60"${_scopeId}>`);
              if (unref(form).errors.name) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="ue"${_scopeId}>Email</label><input id="ue"${ssrRenderAttr("value", unref(form).email)} type="email" class="input" required${_scopeId}>`);
              if (unref(form).errors.email) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.email)}</p>`);
              } else if (unref(form).email !== editing.value.email) {
                _push2(`<p class="text-[11.5px] font-semibold text-accent-ink"${_scopeId}> Đổi email sẽ gỡ trạng thái đã xác minh — địa chỉ mới chưa ai chứng minh là có thật. </p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="uu"${_scopeId}>Tên đăng nhập</label><div class="flex items-center gap-1.5"${_scopeId}><span class="text-[13px] text-ink-muted"${_scopeId}>@</span><input id="uu"${ssrRenderAttr("value", unref(form).username)} class="input" maxlength="40" placeholder="không bắt buộc"${_scopeId}></div>`);
              if (unref(form).errors.username) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.username)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1.5"${_scopeId}><label class="label" for="ub"${_scopeId}>Giới thiệu</label><textarea id="ub" rows="3" maxlength="300" class="input resize-y !py-2"${_scopeId}>${ssrInterpolate(unref(form).bio)}</textarea></div><div class="space-y-1.5"${_scopeId}><label class="label" for="ur"${_scopeId}>Vai trò</label><select id="ur" class="input font-semibold"${_scopeId}><!--[-->`);
              ssrRenderList(__props.roles, (r) => {
                _push2(`<option${ssrRenderAttr("value", r.value)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, r.value) : ssrLooseEqual(unref(form).role, r.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(r.label)}</option>`);
              });
              _push2(`<!--]--></select>`);
              if (unref(form).errors.role) {
                _push2(`<p class="text-[12px] text-accent-ink"${_scopeId}>${ssrInterpolate(unref(form).errors.role)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="rounded-xl border border-line bg-surface p-3.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$q, {
                modelValue: unref(form).verified,
                "onUpdate:modelValue": ($event) => unref(form).verified = $event,
                label: "Email đã xác minh"
              }, null, _parent2, _scopeId));
              _push2(`<p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted"${_scopeId}> Xác minh thủ công dùng khi bạn đã liên hệ được với người này bằng cách khác. </p></div></form><footer class="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3"${_scopeId}><button class="btn"${_scopeId}>Huỷ</button><button class="btn btn-primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Đang lưu…" : "Lưu")}</button></footer></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_sfc_main$t, {
                title: "Người dùng",
                subtitle: canManage.value ? "Đổi quyền hoặc xoá tài khoản. Luôn phải còn ít nhất một tài khoản toàn quyền." : "Bạn chỉ có quyền xem danh sách này."
              }, null, 8, ["subtitle"]),
              createVNode("div", { class: "adm-card mb-4 flex flex-wrap gap-x-6 gap-y-2 p-3.5" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                  return openBlock(), createBlock("div", {
                    key: r.value,
                    class: "min-w-[150px]"
                  }, [
                    createVNode("p", {
                      class: "flex items-center gap-1.5 text-[12.5px] font-bold",
                      style: { color: r.color }
                    }, [
                      createVNode("span", {
                        class: "size-2 rounded-full",
                        style: { background: r.color }
                      }, null, 4),
                      createTextVNode(" " + toDisplayString(r.label), 1)
                    ], 4),
                    createVNode("p", { class: "mt-0.5 text-[11.5px] leading-snug text-ink-muted" }, toDisplayString(r.abilities.length ? `${r.abilities.length} quyền` : "Không vào khu quản trị"), 1)
                  ]);
                }), 128))
              ]),
              createVNode("div", { class: "mb-4 flex flex-wrap items-center gap-2.5" }, [
                createVNode("div", { class: "relative min-w-[220px] flex-1 sm:max-w-xs" }, [
                  createVNode(_sfc_main$x, {
                    name: "search",
                    class: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  }),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => q.value = $event,
                    class: "input !pl-9",
                    placeholder: "Tìm theo tên hoặc email…"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, q.value]
                  ])
                ]),
                createVNode("div", { class: "flex flex-wrap gap-1" }, [
                  createVNode("button", {
                    class: ["adm-seg", role.value === "" && "adm-seg-on"],
                    onClick: ($event) => role.value = ""
                  }, "Tất cả", 10, ["onClick"]),
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                    return openBlock(), createBlock("button", {
                      key: r.value,
                      class: ["adm-seg", role.value === r.value && "adm-seg-on"],
                      onClick: ($event) => role.value = r.value
                    }, toDisplayString(r.label), 11, ["onClick"]);
                  }), 128))
                ]),
                createVNode("div", { class: "flex gap-1" }, [
                  (openBlock(), createBlock(Fragment, null, renderList([["", "Mọi trạng thái"], ["yes", "Đã xác minh"], ["no", "Chưa xác minh"]], (v) => {
                    return createVNode("button", {
                      key: v[0],
                      class: ["adm-seg", verified.value === v[0] && "adm-seg-on"],
                      onClick: ($event) => verified.value = v[0]
                    }, toDisplayString(v[1]), 11, ["onClick"]);
                  }), 64))
                ]),
                createVNode("span", { class: "ml-auto text-[13px] text-ink-muted tabular-nums" }, toDisplayString(unref(fmtNumber)(__props.stats.verified)) + "/" + toDisplayString(unref(fmtNumber)(__props.stats.total)) + " đã xác minh ", 1)
              ]),
              createVNode("div", { class: "adm-card overflow-hidden" }, [
                __props.users.data.length ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "max-h-[calc(100dvh-340px)] overflow-auto"
                }, [
                  createVNode("table", { class: "adm-table min-w-[800px]" }, [
                    createVNode("thead", null, [
                      createVNode("tr", null, [
                        createVNode("th", null, "Người dùng"),
                        createVNode("th", { class: "w-[220px]" }, "Hoạt động"),
                        createVNode("th", { class: "w-[150px]" }, "Tham gia"),
                        createVNode("th", { class: "w-[130px]" }, "Quyền"),
                        createVNode("th", { class: "w-[110px]" }, "Xác minh"),
                        createVNode("th", { class: "w-[76px]" })
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.users.data, (u) => {
                        return openBlock(), createBlock("tr", {
                          key: u.id
                        }, [
                          createVNode("td", null, [
                            createVNode("div", { class: "flex items-center gap-3" }, [
                              createVNode(_sfc_main$A, {
                                user: u,
                                size: "size-9 text-[13px]"
                              }, null, 8, ["user"]),
                              createVNode("div", { class: "min-w-0" }, [
                                createVNode("p", { class: "flex items-center gap-1.5 truncate text-[13.5px] font-bold" }, [
                                  createTextVNode(toDisplayString(u.name) + " ", 1),
                                  u.id === me.value.id ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "adm-chip",
                                    style: { "background": "var(--color-surface-2)" }
                                  }, "bạn")) : createCommentVNode("", true)
                                ]),
                                createVNode("p", { class: "flex items-center gap-1 truncate text-[12px] text-ink-muted" }, [
                                  createTextVNode(toDisplayString(u.email) + " ", 1),
                                  u.email_verified_at ? (openBlock(), createBlock("svg", {
                                    key: 0,
                                    viewBox: "0 0 24 24",
                                    fill: "currentColor",
                                    class: "size-3.5 shrink-0 text-cyan",
                                    title: "Email đã xác minh"
                                  }, [
                                    createVNode("path", {
                                      d: "M12 2 9.6 4.4 6.3 3.9 5.1 7 2 8.2l.5 3.3L0 14l2.5 2.5L2 19.8l3.1 1.2 1.2 3.1 3.3-.5L12 26l2.4-2.4 3.3.5 1.2-3.1 3.1-1.2-.5-3.3L24 14l-2.5-2.5.5-3.3-3.1-1.2-1.2-3.1-3.3.5z",
                                      transform: "scale(.92) translate(1 -1)",
                                      opacity: ".18"
                                    }),
                                    createVNode("path", { d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4.2-4.2 1.7-1.7 2.5 2.5 5.1-5.1 1.7 1.7z" })
                                  ])) : createCommentVNode("", true)
                                ]),
                                u.username ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "truncate text-[11.5px] text-ink-muted"
                                }, "@" + toDisplayString(u.username), 1)) : createCommentVNode("", true)
                              ])
                            ])
                          ]),
                          createVNode("td", { class: "text-[12.5px] text-ink-2 tabular-nums" }, toDisplayString(u.comments_count) + " bình luận · " + toDisplayString(u.likes_count) + " thích · " + toDisplayString(u.bookmarks_count) + " lưu ", 1),
                          createVNode("td", { class: "text-[12.5px] text-ink-muted" }, [
                            createTextVNode(toDisplayString(unref(fmtDate)(u.created_at)) + " ", 1),
                            u.last_seen_at ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "block text-[11px]"
                            }, " Vào lần cuối " + toDisplayString(unref(fmtAgo)(u.last_seen_at)), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", null, [
                            canManage.value ? (openBlock(), createBlock("select", {
                              key: 0,
                              class: "input !w-auto !py-1 !text-[12.5px] font-semibold",
                              style: { color: roleOf(u.role)?.color },
                              value: u.role,
                              onChange: ($event) => setRole(u, $event.target.value)
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                                return openBlock(), createBlock("option", {
                                  key: r.value,
                                  value: r.value
                                }, toDisplayString(r.label), 9, ["value"]);
                              }), 128))
                            ], 44, ["value", "onChange"])) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "adm-chip",
                              style: { background: roleOf(u.role)?.color + "1f", color: roleOf(u.role)?.color }
                            }, toDisplayString(roleOf(u.role)?.label), 5))
                          ]),
                          createVNode("td", null, [
                            canManage.value ? (openBlock(), createBlock(_sfc_main$q, {
                              key: 0,
                              "model-value": !!u.email_verified_at,
                              "onUpdate:modelValue": ($event) => toggleVerify(u)
                            }, null, 8, ["model-value", "onUpdate:modelValue"])) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "adm-chip",
                              style: u.email_verified_at ? { background: "color-mix(in srgb, var(--color-cyan) 14%, transparent)", color: "var(--color-cyan)" } : { background: "var(--color-surface-2)", color: "var(--color-ink-muted)" }
                            }, toDisplayString(u.email_verified_at ? "Đã xác minh" : "Chưa"), 5))
                          ]),
                          createVNode("td", null, [
                            canManage.value ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "rowacts"
                            }, [
                              createVNode(_sfc_main$v, {
                                icon: "edit",
                                label: "Sửa hồ sơ",
                                onClick: ($event) => open(u)
                              }, null, 8, ["onClick"]),
                              u.id !== me.value.id ? (openBlock(), createBlock(_sfc_main$v, {
                                key: 0,
                                icon: "trash",
                                label: "Xoá tài khoản",
                                tone: "danger",
                                onClick: ($event) => remove(u)
                              }, null, 8, ["onClick"])) : createCommentVNode("", true)
                            ])) : createCommentVNode("", true)
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])) : (openBlock(), createBlock(_sfc_main$r, {
                  key: 1,
                  title: "Không có người dùng nào khớp",
                  hint: "Thử bỏ bớt bộ lọc hoặc xoá từ khoá tìm kiếm.",
                  icon: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"
                }))
              ]),
              createVNode(_sfc_main$p, {
                page: __props.users,
                unit: "người dùng",
                class: "mt-4"
              }, null, 8, ["page"]),
              editing.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "fixed inset-0 z-50 flex justify-end bg-black/40",
                onClick: withModifiers(($event) => editing.value = null, ["self"])
              }, [
                createVNode("div", { class: "flex h-full w-full max-w-[480px] flex-col bg-page shadow-2xl" }, [
                  createVNode("header", { class: "flex h-14 shrink-0 items-center gap-3 border-b border-line px-5" }, [
                    createVNode("h2", { class: "truncate text-[15px] font-extrabold tracking-tight" }, " Sửa “" + toDisplayString(editing.value.name) + "” ", 1),
                    createVNode("button", {
                      class: "btn !ml-auto !border-transparent !px-2",
                      "aria-label": "Đóng",
                      onClick: ($event) => editing.value = null
                    }, [
                      (openBlock(), createBlock("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        class: "size-5"
                      }, [
                        createVNode("path", {
                          d: "M18 6 6 18M6 6l12 12",
                          "stroke-linecap": "round"
                        })
                      ]))
                    ], 8, ["onClick"])
                  ]),
                  createVNode("form", {
                    class: "flex-1 space-y-4 overflow-y-auto p-5",
                    onSubmit: withModifiers(save, ["prevent"])
                  }, [
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "un"
                      }, "Tên hiển thị"),
                      withDirectives(createVNode("input", {
                        id: "un",
                        "onUpdate:modelValue": ($event) => unref(form).name = $event,
                        class: "input",
                        required: "",
                        maxlength: "60"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).name]
                      ]),
                      unref(form).errors.name ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.name), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "ue"
                      }, "Email"),
                      withDirectives(createVNode("input", {
                        id: "ue",
                        "onUpdate:modelValue": ($event) => unref(form).email = $event,
                        type: "email",
                        class: "input",
                        required: ""
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).email]
                      ]),
                      unref(form).errors.email ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.email), 1)) : unref(form).email !== editing.value.email ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "text-[11.5px] font-semibold text-accent-ink"
                      }, " Đổi email sẽ gỡ trạng thái đã xác minh — địa chỉ mới chưa ai chứng minh là có thật. ")) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "uu"
                      }, "Tên đăng nhập"),
                      createVNode("div", { class: "flex items-center gap-1.5" }, [
                        createVNode("span", { class: "text-[13px] text-ink-muted" }, "@"),
                        withDirectives(createVNode("input", {
                          id: "uu",
                          "onUpdate:modelValue": ($event) => unref(form).username = $event,
                          class: "input",
                          maxlength: "40",
                          placeholder: "không bắt buộc"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, unref(form).username]
                        ])
                      ]),
                      unref(form).errors.username ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.username), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "ub"
                      }, "Giới thiệu"),
                      withDirectives(createVNode("textarea", {
                        id: "ub",
                        "onUpdate:modelValue": ($event) => unref(form).bio = $event,
                        rows: "3",
                        maxlength: "300",
                        class: "input resize-y !py-2"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, unref(form).bio]
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1.5" }, [
                      createVNode("label", {
                        class: "label",
                        for: "ur"
                      }, "Vai trò"),
                      withDirectives(createVNode("select", {
                        id: "ur",
                        "onUpdate:modelValue": ($event) => unref(form).role = $event,
                        class: "input font-semibold"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (r) => {
                          return openBlock(), createBlock("option", {
                            key: r.value,
                            value: r.value
                          }, toDisplayString(r.label), 9, ["value"]);
                        }), 128))
                      ], 8, ["onUpdate:modelValue"]), [
                        [vModelSelect, unref(form).role]
                      ]),
                      unref(form).errors.role ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-[12px] text-accent-ink"
                      }, toDisplayString(unref(form).errors.role), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "rounded-xl border border-line bg-surface p-3.5" }, [
                      createVNode(_sfc_main$q, {
                        modelValue: unref(form).verified,
                        "onUpdate:modelValue": ($event) => unref(form).verified = $event,
                        label: "Email đã xác minh"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode("p", { class: "mt-1.5 text-[11.5px] leading-relaxed text-ink-muted" }, " Xác minh thủ công dùng khi bạn đã liên hệ được với người này bằng cách khác. ")
                    ])
                  ], 32),
                  createVNode("footer", { class: "flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3" }, [
                    createVNode("button", {
                      class: "btn",
                      onClick: ($event) => editing.value = null
                    }, "Huỷ", 8, ["onClick"]),
                    createVNode("button", {
                      class: "btn btn-primary",
                      disabled: unref(form).processing,
                      onClick: save
                    }, toDisplayString(unref(form).processing ? "Đang lưu…" : "Lưu"), 9, ["disabled"])
                  ])
                ])
              ], 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Users.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$f
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$e = {
  __name: "Thumb",
  __ssrInlineRender: true,
  props: {
    src: { type: String, default: "" },
    alt: { type: String, default: "" },
    ratio: { type: String, default: "aspect-[16/10]" },
    rounded: { type: String, default: "rounded-xl" },
    eager: { type: Boolean, default: false }
  },
  setup(__props) {
    const failed = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["block overflow-hidden bg-surface-2", [__props.ratio, __props.rounded]]
      }, _attrs))}>`);
      if (__props.src && !failed.value) {
        _push(`<img${ssrRenderAttr("src", __props.src)}${ssrRenderAttr("alt", __props.alt)}${ssrRenderAttr("loading", __props.eager ? "eager" : "lazy")}${ssrRenderAttr("fetchpriority", __props.eager ? "high" : "auto")} decoding="async" class="size-full object-cover transition duration-300 group-hover:scale-[1.03]">`);
      } else {
        _push(`<span class="grid size-full place-items-center text-ink-muted/40"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="size-6"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8.5" cy="10" r="1.5"></circle><path d="m21 16-5-5L5 19"></path></svg></span>`);
      }
      _push(`</span>`);
    };
  }
};
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Thumb.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const _sfc_main$d = {
  __name: "Sidebar",
  __ssrInlineRender: true,
  props: { sidebar: { type: Object, default: () => ({}) } },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (__props.sidebar.popular?.length) {
        _push(`<section class="card p-4"><h2 class="mb-3 flex items-center gap-2 text-[14px] font-extrabold tracking-tight"><span class="inline-block size-2 rounded-full bg-accent"></span> Đọc nhiều trong tuần </h2><ol class="space-y-3"><!--[-->`);
        ssrRenderList(__props.sidebar.popular, (a, i) => {
          _push(`<li>`);
          _push(ssrRenderComponent(unref(Link), {
            href: `/news/${a.slug}`,
            class: "group flex gap-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="w-5 shrink-0 text-[18px] font-extrabold leading-none text-ink-muted/50 tabular-nums"${_scopeId}>${ssrInterpolate(i + 1)}</span><span class="min-w-0 flex-1"${_scopeId}><span class="block text-[13.5px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink"${_scopeId}>${ssrInterpolate(a.title)}</span>`);
                if (a.views) {
                  _push2(`<span class="mt-0.5 block text-[11px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(a.views))} lượt xem </span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span>`);
              } else {
                return [
                  createVNode("span", { class: "w-5 shrink-0 text-[18px] font-extrabold leading-none text-ink-muted/50 tabular-nums" }, toDisplayString(i + 1), 1),
                  createVNode("span", { class: "min-w-0 flex-1" }, [
                    createVNode("span", { class: "block text-[13.5px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                    a.views ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "mt-0.5 block text-[11px] text-ink-muted"
                    }, toDisplayString(unref(fmtNumber)(a.views)) + " lượt xem ", 1)) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ol></section>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.sidebar.latest?.length) {
        _push(`<section class="card p-4"><h2 class="mb-3 text-[14px] font-extrabold tracking-tight">Mới cập nhật</h2><ul class="divide-y divide-line"><!--[-->`);
        ssrRenderList(__props.sidebar.latest, (a) => {
          _push(`<li class="py-2.5 first:pt-0 last:pb-0">`);
          _push(ssrRenderComponent(unref(Link), {
            href: `/news/${a.slug}`,
            class: "group flex gap-2.5"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$e, {
                  src: a.image_url,
                  alt: a.title,
                  ratio: "size-12 shrink-0",
                  rounded: "rounded-lg",
                  class: "shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<span class="min-w-0"${_scopeId}><span class="block text-[13px] font-semibold leading-snug clamp-2 transition group-hover:text-accent-ink"${_scopeId}>${ssrInterpolate(a.title)}</span><span class="mt-0.5 block text-[11px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span></span>`);
              } else {
                return [
                  createVNode(_sfc_main$e, {
                    src: a.image_url,
                    alt: a.title,
                    ratio: "size-12 shrink-0",
                    rounded: "rounded-lg",
                    class: "shrink-0"
                  }, null, 8, ["src", "alt"]),
                  createVNode("span", { class: "min-w-0" }, [
                    createVNode("span", { class: "block text-[13px] font-semibold leading-snug clamp-2 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                    createVNode("span", { class: "mt-0.5 block text-[11px] text-ink-muted" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.sidebar.categories?.length) {
        _push(`<section class="card p-4"><h2 class="mb-3 text-[14px] font-extrabold tracking-tight">Chuyên mục</h2><ul class="space-y-1"><!--[-->`);
        ssrRenderList(__props.sidebar.categories, (c) => {
          _push(`<li>`);
          _push(ssrRenderComponent(unref(Link), {
            href: `/category/${c.slug}`,
            class: "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold transition hover:bg-surface"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="size-2 shrink-0 rounded-full" style="${ssrRenderStyle({ background: c.color })}"${_scopeId}></span><span class="flex-1"${_scopeId}>${ssrInterpolate(c.name)}</span><span class="text-[11.5px] font-normal tabular-nums text-ink-muted"${_scopeId}>${ssrInterpolate(c.articles_count)}</span>`);
              } else {
                return [
                  createVNode("span", {
                    class: "size-2 shrink-0 rounded-full",
                    style: { background: c.color }
                  }, null, 4),
                  createVNode("span", { class: "flex-1" }, toDisplayString(c.name), 1),
                  createVNode("span", { class: "text-[11.5px] font-normal tabular-nums text-ink-muted" }, toDisplayString(c.articles_count), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="card p-4"><h2 class="text-[14px] font-extrabold tracking-tight">Theo dõi</h2><p class="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted"> Nhận tin mới qua trình đọc RSS của bạn. </p><a href="/rss.xml" class="btn mt-3 w-full !text-[13px]"><svg viewBox="0 0 24 24" fill="currentColor" class="size-4"><circle cx="6.18" cy="17.82" r="2.18"></circle><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"></path></svg> Đăng ký RSS </a></section></aside>`);
    };
  }
};
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Sidebar.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const _sfc_main$c = {
  __name: "ReactionBar",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    liked: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    variant: { type: String, default: "bar" }
    // 'bar' | 'rail'
  },
  setup(__props) {
    const props = __props;
    const page = usePage();
    computed(() => !!page.props.auth?.user);
    const liked = ref(props.liked);
    const bookmarked = ref(props.bookmarked);
    const likes = ref(props.article.likes_count || 0);
    const bookmarks = ref(props.article.bookmarks_count || 0);
    const shares = ref(props.article.shares_count || 0);
    const burst = ref(false);
    const copied = ref(false);
    const rail = computed(() => props.variant === "rail");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: rail.value ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2 border-y border-line py-3"
      }, _attrs))}><button class="${ssrRenderClass(["react", rail.value && "react-rail", liked.value && "react-on"])}"${ssrRenderAttr("aria-pressed", liked.value)}><span class="relative grid place-items-center"><svg viewBox="0 0 24 24"${ssrRenderAttr("fill", liked.value ? "currentColor" : "none")} stroke="currentColor" stroke-width="1.8" class="${ssrRenderClass([liked.value && "scale-110", "size-[18px] transition-transform"])}"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
      if (burst.value) {
        _push(`<span class="pointer-events-none absolute inset-0 -m-1.5 rounded-full border-2 border-accent burst"></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span><span class="tabular-nums">${ssrInterpolate(unref(fmtNumber)(likes.value))}</span>`);
      if (!rail.value) {
        _push(`<span class="sr-only">lượt thích</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><a href="#comments" class="${ssrRenderClass(["react", rail.value && "react-rail"])}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="tabular-nums">${ssrInterpolate(unref(fmtNumber)(__props.article.comments_count))}</span></a><button class="${ssrRenderClass(["react", rail.value && "react-rail", bookmarked.value && "react-on-cyan"])}"${ssrRenderAttr("aria-pressed", bookmarked.value)}><svg viewBox="0 0 24 24"${ssrRenderAttr("fill", bookmarked.value ? "currentColor" : "none")} stroke="currentColor" stroke-width="1.8" class="size-[18px]"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round"></path></svg><span class="tabular-nums">${ssrInterpolate(unref(fmtNumber)(bookmarks.value))}</span></button><button class="${ssrRenderClass(["react", rail.value && "react-rail"])}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round"></path></svg><span class="tabular-nums">${ssrInterpolate(unref(fmtNumber)(shares.value))}</span></button>`);
      if (copied.value) {
        _push(`<span class="text-[12px] font-semibold text-cyan" role="status">Đã chép liên kết</span>`);
      } else {
        _push(`<!---->`);
      }
      if (!rail.value) {
        _push(`<span class="ml-auto flex items-center gap-1.5 text-[12.5px] text-ink-muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg> ${ssrInterpolate(unref(fmtNumber)(__props.article.views))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ReactionBar.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = {
  __name: "Comments",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    comments: { type: Array, default: () => [] },
    likedComments: { type: Array, default: () => [] }
  },
  setup(__props) {
    const props = __props;
    const page = usePage();
    const me = computed(() => page.props.auth?.user);
    const form = useForm({ body: "", parent_id: null });
    const replyTo = ref(null);
    const openReplies = reactive({});
    const likes = reactive({});
    props.comments.forEach((c) => {
      likes[c.id] = { on: props.likedComments.includes(c.id), n: c.likes_count || 0 };
      (c.replies || []).forEach((r) => {
        likes[r.id] = { on: props.likedComments.includes(r.id), n: r.likes_count || 0 };
      });
    });
    const canManage = (c) => me.value && (me.value.id === c.user_id || me.value.is_admin);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "comments",
        class: "mt-10 scroll-mt-20"
      }, _attrs))}><h2 class="flex items-center gap-2 text-[17px] font-extrabold tracking-tight"> Bình luận <span class="rounded-full bg-surface px-2 py-0.5 text-[12px] font-bold text-ink-muted tabular-nums">${ssrInterpolate(unref(fmtNumber)(__props.article.comments_count))}</span></h2>`);
      if (me.value) {
        _push(`<form class="mt-4 flex gap-3">`);
        _push(ssrRenderComponent(_sfc_main$A, {
          user: me.value,
          size: "size-9 text-[13px]"
        }, null, _parent));
        _push(`<div class="min-w-0 flex-1">`);
        if (replyTo.value) {
          _push(`<div class="mb-2 flex items-center gap-2 text-[12.5px] text-ink-muted"><span>Đang trả lời một bình luận</span><button type="button" class="font-semibold text-accent-ink hover:underline">Huỷ</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<textarea id="comment-box" rows="3" maxlength="2000" class="input resize-y !py-2.5" placeholder="Bạn nghĩ gì về tin này?">${ssrInterpolate(unref(form).body)}</textarea>`);
        if (unref(form).errors.body) {
          _push(`<p class="mt-1 text-[12px] text-accent-ink">${ssrInterpolate(unref(form).errors.body)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-ink-muted tabular-nums">${ssrInterpolate(unref(form).body.length)}/2000</span><button class="btn btn-primary !py-1.5"${ssrIncludeBooleanAttr(unref(form).processing || unref(form).body.trim().length < 2) ? " disabled" : ""}>${ssrInterpolate(unref(form).processing ? "Đang gửi…" : "Gửi bình luận")}</button></div></div></form>`);
      } else {
        _push(`<div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5"><p class="text-[13.5px] text-ink-2">Đăng nhập để tham gia thảo luận.</p><div class="ml-auto flex gap-2">`);
        _push(ssrRenderComponent(unref(Link), {
          href: "/login",
          class: "btn !py-1.5 !text-[13px]"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Đăng nhập`);
            } else {
              return [
                createTextVNode("Đăng nhập")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(unref(Link), {
          href: "/register",
          class: "btn btn-primary !py-1.5 !text-[13px]"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Đăng ký`);
            } else {
              return [
                createTextVNode("Đăng ký")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      if (__props.comments.length) {
        _push(`<ul class="mt-6 space-y-5"><!--[-->`);
        ssrRenderList(__props.comments, (c) => {
          _push(`<li><div class="flex gap-3">`);
          _push(ssrRenderComponent(_sfc_main$A, {
            user: c.user,
            size: "size-9 text-[13px]"
          }, null, _parent));
          _push(`<div class="min-w-0 flex-1"><div class="rounded-xl rounded-tl-sm bg-surface px-3.5 py-2.5"><p class="flex flex-wrap items-baseline gap-x-2"><span class="text-[13.5px] font-bold">${ssrInterpolate(c.user?.name || "Ẩn danh")}</span><span class="text-[11.5px] text-ink-muted">${ssrInterpolate(unref(fmtAgo)(c.created_at))}</span></p><p class="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">${ssrInterpolate(c.body)}</p></div><div class="mt-1.5 flex items-center gap-1 pl-1"><button class="${ssrRenderClass([likes[c.id]?.on && "text-accent", "cbtn"])}"><svg viewBox="0 0 24 24"${ssrRenderAttr("fill", likes[c.id]?.on ? "currentColor" : "none")} stroke="currentColor" stroke-width="1.8" class="size-3.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
          if (likes[c.id]?.n) {
            _push(`<span class="tabular-nums">${ssrInterpolate(likes[c.id].n)}</span>`);
          } else {
            _push(`<span>Thích</span>`);
          }
          _push(`</button><button class="cbtn">Trả lời</button>`);
          if (canManage(c)) {
            _push(`<button class="cbtn hover:text-accent-ink">Xoá</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (c.replies?.length && !openReplies[c.id]) {
            _push(`<button class="mt-2 pl-1 text-[12.5px] font-semibold text-accent-ink hover:underline"> Xem ${ssrInterpolate(c.replies.length)} trả lời </button>`);
          } else {
            _push(`<!---->`);
          }
          if (openReplies[c.id]) {
            _push(`<ul class="mt-3 space-y-3 border-l-2 border-line pl-3"><!--[-->`);
            ssrRenderList(c.replies, (r) => {
              _push(`<li class="flex gap-2.5">`);
              _push(ssrRenderComponent(_sfc_main$A, {
                user: r.user,
                size: "size-7 text-[11px]"
              }, null, _parent));
              _push(`<div class="min-w-0 flex-1"><div class="rounded-xl rounded-tl-sm bg-surface px-3 py-2"><p class="flex flex-wrap items-baseline gap-x-2"><span class="text-[12.5px] font-bold">${ssrInterpolate(r.user?.name || "Ẩn danh")}</span><span class="text-[11px] text-ink-muted">${ssrInterpolate(unref(fmtAgo)(r.created_at))}</span></p><p class="mt-0.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">${ssrInterpolate(r.body)}</p></div><div class="mt-1 flex items-center gap-1 pl-1"><button class="${ssrRenderClass([likes[r.id]?.on && "text-accent", "cbtn"])}"><svg viewBox="0 0 24 24"${ssrRenderAttr("fill", likes[r.id]?.on ? "currentColor" : "none")} stroke="currentColor" stroke-width="1.8" class="size-3.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
              if (likes[r.id]?.n) {
                _push(`<span class="tabular-nums">${ssrInterpolate(likes[r.id].n)}</span>`);
              } else {
                _push(`<span>Thích</span>`);
              }
              _push(`</button><button class="cbtn">Trả lời</button>`);
              if (canManage(r)) {
                _push(`<button class="cbtn hover:text-accent-ink">Xoá</button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div></li>`);
            });
            _push(`<!--]--></ul>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<p class="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-[13.5px] text-ink-muted"> Chưa có bình luận nào. Hãy là người đầu tiên. </p>`);
      }
      _push(`</section>`);
    };
  }
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Comments.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const _sfc_main$a = {
  __name: "Article",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    related: { type: Array, default: () => [] },
    comments: { type: Array, default: () => [] },
    state: { type: Object, default: () => ({}) },
    sidebar: { type: Object, default: () => ({}) },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    const body = ref(null);
    const progress = ref(0);
    function onScroll() {
      const el = body.value;
      if (!el) return;
      const top = el.offsetTop;
      const done = window.scrollY + window.innerHeight * 0.75 - top;
      progress.value = Math.min(100, Math.max(0, done / el.offsetHeight * 100));
    }
    onMounted(() => {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="sticky top-[57px] z-30 h-[3px] bg-transparent" aria-hidden="true"${_scopeId}><div class="h-full bg-accent transition-[width] duration-150" style="${ssrRenderStyle({ width: progress.value + "%" })}"${_scopeId}></div></div><div class="wrap"${_scopeId}><nav class="mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted" aria-label="Đường dẫn"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Link), {
              href: "/",
              class: "hover:text-ink"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Trang chủ`);
                } else {
                  return [
                    createTextVNode("Trang chủ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (__props.article.category) {
              _push2(`<!--[--><span${_scopeId}>/</span>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: `/category/${__props.article.category.slug}`,
                class: "hover:text-ink"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(__props.article.category.name)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(__props.article.category.name), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</nav><div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"${_scopeId}><article class="relative"${_scopeId}><h1 class="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]"${_scopeId}>${ssrInterpolate(__props.article.title)}</h1><div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted"${_scopeId}>`);
            if (__props.article.category) {
              _push2(`<span class="rounded px-2 py-0.5 font-semibold" style="${ssrRenderStyle({
                background: (__props.article.category.color || "#FE2C55") + "1f",
                color: __props.article.category.color || "#FE2C55"
              })}"${_scopeId}>${ssrInterpolate(__props.article.category.name)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.published_at) {
              _push2(`<time${ssrRenderAttr("datetime", __props.article.published_at)}${_scopeId}>${ssrInterpolate(unref(fmtDate)(__props.article.published_at))} · ${ssrInterpolate(unref(fmtAgo)(__props.article.published_at))}</time>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.reading_minutes) {
              _push2(`<span${_scopeId}>· ${ssrInterpolate(__props.article.reading_minutes)} phút đọc</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.views) {
              _push2(`<span${_scopeId}>· ${ssrInterpolate(unref(fmtNumber)(__props.article.views))} lượt xem</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.article.image_url) {
              _push2(`<figure class="mt-5"${_scopeId}><img${ssrRenderAttr("src", __props.article.image_url)}${ssrRenderAttr("alt", __props.article.title)} class="w-full rounded-xl object-cover" fetchpriority="high" decoding="async"${_scopeId}>`);
              if (__props.article.source) {
                _push2(`<figcaption class="mt-1.5 text-[12px] text-ink-muted"${_scopeId}> Ảnh: ${ssrInterpolate(__props.article.source)}</figcaption>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</figure>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$c, {
              class: "mt-5",
              article: __props.article,
              liked: !!__props.state.liked,
              bookmarked: !!__props.state.bookmarked
            }, null, _parent2, _scopeId));
            _push2(`<div${_scopeId}>`);
            if (__props.article.excerpt) {
              _push2(`<p class="mt-5 text-[17px] font-semibold leading-relaxed text-ink-2"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.content) {
              _push2(`<div class="prose-vi mt-5"${_scopeId}>${__props.article.content ?? ""}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="pointer-events-none absolute -left-20 top-0 hidden h-full 2xl:block"${_scopeId}><div class="pointer-events-auto sticky top-24"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$c, {
              variant: "rail",
              article: __props.article,
              liked: !!__props.state.liked,
              bookmarked: !!__props.state.bookmarked
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
            if (!__props.article.content && __props.article.source_url) {
              _push2(`<aside class="mt-6 rounded-xl border border-line bg-surface p-4"${_scopeId}><p class="text-[13.5px] leading-relaxed text-ink-2"${_scopeId}> Đây là bản tóm tắt. Đọc toàn văn tại <strong${_scopeId}>${ssrInterpolate(__props.article.source)}</strong>: </p><a${ssrRenderAttr("href", __props.article.source_url)} target="_blank" rel="noopener nofollow" class="btn btn-primary mt-3"${_scopeId}> Đọc bài gốc <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4"${_scopeId}><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"${_scopeId}></path></svg></a></aside>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.source_url && __props.article.content) {
              _push2(`<p class="mt-6 text-[13px] text-ink-muted"${_scopeId}> Nguồn: <a${ssrRenderAttr("href", __props.article.source_url)} target="_blank" rel="noopener nofollow" class="text-accent-ink underline"${_scopeId}>${ssrInterpolate(__props.article.source)}</a></p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$c, {
              class: "mt-6",
              article: __props.article,
              liked: !!__props.state.liked,
              bookmarked: !!__props.state.bookmarked
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_sfc_main$b, {
              article: __props.article,
              comments: __props.comments,
              "liked-comments": __props.state.likedComments || []
            }, null, _parent2, _scopeId));
            _push2(`</article><div class="space-y-6"${_scopeId}>`);
            if (__props.related.length) {
              _push2(`<aside class="card p-4"${_scopeId}><h2 class="mb-3 text-[14px] font-extrabold tracking-tight"${_scopeId}>Tin liên quan</h2><ul class="divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.related, (a) => {
                _push2(`<li class="py-3 first:pt-0"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/news/${a.slug}`,
                  class: "group flex gap-3"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$e, {
                        src: a.image_url,
                        alt: a.title,
                        ratio: "size-[58px]",
                        rounded: "rounded-lg",
                        class: "shrink-0"
                      }, null, _parent3, _scopeId2));
                      _push3(`<span class="min-w-0"${_scopeId2}><span class="block text-[13.5px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink"${_scopeId2}>${ssrInterpolate(a.title)}</span><span class="mt-1 block text-[11px] text-ink-muted"${_scopeId2}>${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span></span>`);
                    } else {
                      return [
                        createVNode(_sfc_main$e, {
                          src: a.image_url,
                          alt: a.title,
                          ratio: "size-[58px]",
                          rounded: "rounded-lg",
                          class: "shrink-0"
                        }, null, 8, ["src", "alt"]),
                        createVNode("span", { class: "min-w-0" }, [
                          createVNode("span", { class: "block text-[13.5px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                          createVNode("span", { class: "mt-1 block text-[11px] text-ink-muted" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></aside>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$d, { sidebar: __props.sidebar }, null, _parent2, _scopeId));
            _push2(`</div></div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "sticky top-[57px] z-30 h-[3px] bg-transparent",
                "aria-hidden": "true"
              }, [
                createVNode("div", {
                  class: "h-full bg-accent transition-[width] duration-150",
                  style: { width: progress.value + "%" }
                }, null, 4)
              ]),
              createVNode("div", { class: "wrap" }, [
                createVNode("nav", {
                  class: "mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted",
                  "aria-label": "Đường dẫn"
                }, [
                  createVNode(unref(Link), {
                    href: "/",
                    class: "hover:text-ink"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Trang chủ")
                    ]),
                    _: 1
                  }),
                  __props.article.category ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createVNode("span", null, "/"),
                    createVNode(unref(Link), {
                      href: `/category/${__props.article.category.slug}`,
                      class: "hover:text-ink"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(__props.article.category.name), 1)
                      ]),
                      _: 1
                    }, 8, ["href"])
                  ], 64)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" }, [
                  createVNode("article", { class: "relative" }, [
                    createVNode("h1", { class: "text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]" }, toDisplayString(__props.article.title), 1),
                    createVNode("div", { class: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted" }, [
                      __props.article.category ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "rounded px-2 py-0.5 font-semibold",
                        style: {
                          background: (__props.article.category.color || "#FE2C55") + "1f",
                          color: __props.article.category.color || "#FE2C55"
                        }
                      }, toDisplayString(__props.article.category.name), 5)) : createCommentVNode("", true),
                      __props.article.published_at ? (openBlock(), createBlock("time", {
                        key: 1,
                        datetime: __props.article.published_at
                      }, toDisplayString(unref(fmtDate)(__props.article.published_at)) + " · " + toDisplayString(unref(fmtAgo)(__props.article.published_at)), 9, ["datetime"])) : createCommentVNode("", true),
                      __props.article.reading_minutes ? (openBlock(), createBlock("span", { key: 2 }, "· " + toDisplayString(__props.article.reading_minutes) + " phút đọc", 1)) : createCommentVNode("", true),
                      __props.article.views ? (openBlock(), createBlock("span", { key: 3 }, "· " + toDisplayString(unref(fmtNumber)(__props.article.views)) + " lượt xem", 1)) : createCommentVNode("", true)
                    ]),
                    __props.article.image_url ? (openBlock(), createBlock("figure", {
                      key: 0,
                      class: "mt-5"
                    }, [
                      createVNode("img", {
                        src: __props.article.image_url,
                        alt: __props.article.title,
                        class: "w-full rounded-xl object-cover",
                        fetchpriority: "high",
                        decoding: "async"
                      }, null, 8, ["src", "alt"]),
                      __props.article.source ? (openBlock(), createBlock("figcaption", {
                        key: 0,
                        class: "mt-1.5 text-[12px] text-ink-muted"
                      }, " Ảnh: " + toDisplayString(__props.article.source), 1)) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true),
                    createVNode(_sfc_main$c, {
                      class: "mt-5",
                      article: __props.article,
                      liked: !!__props.state.liked,
                      bookmarked: !!__props.state.bookmarked
                    }, null, 8, ["article", "liked", "bookmarked"]),
                    createVNode("div", {
                      ref_key: "body",
                      ref: body
                    }, [
                      __props.article.excerpt ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "mt-5 text-[17px] font-semibold leading-relaxed text-ink-2"
                      }, toDisplayString(__props.article.excerpt), 1)) : createCommentVNode("", true),
                      __props.article.content ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "prose-vi mt-5",
                        innerHTML: __props.article.content
                      }, null, 8, ["innerHTML"])) : createCommentVNode("", true)
                    ], 512),
                    createVNode("div", { class: "pointer-events-none absolute -left-20 top-0 hidden h-full 2xl:block" }, [
                      createVNode("div", { class: "pointer-events-auto sticky top-24" }, [
                        createVNode(_sfc_main$c, {
                          variant: "rail",
                          article: __props.article,
                          liked: !!__props.state.liked,
                          bookmarked: !!__props.state.bookmarked
                        }, null, 8, ["article", "liked", "bookmarked"])
                      ])
                    ]),
                    !__props.article.content && __props.article.source_url ? (openBlock(), createBlock("aside", {
                      key: 1,
                      class: "mt-6 rounded-xl border border-line bg-surface p-4"
                    }, [
                      createVNode("p", { class: "text-[13.5px] leading-relaxed text-ink-2" }, [
                        createTextVNode(" Đây là bản tóm tắt. Đọc toàn văn tại "),
                        createVNode("strong", null, toDisplayString(__props.article.source), 1),
                        createTextVNode(": ")
                      ]),
                      createVNode("a", {
                        href: __props.article.source_url,
                        target: "_blank",
                        rel: "noopener nofollow",
                        class: "btn btn-primary mt-3"
                      }, [
                        createTextVNode(" Đọc bài gốc "),
                        (openBlock(), createBlock("svg", {
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          "stroke-width": "2",
                          class: "size-4"
                        }, [
                          createVNode("path", {
                            d: "M7 17 17 7M9 7h8v8",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round"
                          })
                        ]))
                      ], 8, ["href"])
                    ])) : createCommentVNode("", true),
                    __props.article.source_url && __props.article.content ? (openBlock(), createBlock("p", {
                      key: 2,
                      class: "mt-6 text-[13px] text-ink-muted"
                    }, [
                      createTextVNode(" Nguồn: "),
                      createVNode("a", {
                        href: __props.article.source_url,
                        target: "_blank",
                        rel: "noopener nofollow",
                        class: "text-accent-ink underline"
                      }, toDisplayString(__props.article.source), 9, ["href"])
                    ])) : createCommentVNode("", true),
                    createVNode(_sfc_main$c, {
                      class: "mt-6",
                      article: __props.article,
                      liked: !!__props.state.liked,
                      bookmarked: !!__props.state.bookmarked
                    }, null, 8, ["article", "liked", "bookmarked"]),
                    createVNode(_sfc_main$b, {
                      article: __props.article,
                      comments: __props.comments,
                      "liked-comments": __props.state.likedComments || []
                    }, null, 8, ["article", "comments", "liked-comments"])
                  ]),
                  createVNode("div", { class: "space-y-6" }, [
                    __props.related.length ? (openBlock(), createBlock("aside", {
                      key: 0,
                      class: "card p-4"
                    }, [
                      createVNode("h2", { class: "mb-3 text-[14px] font-extrabold tracking-tight" }, "Tin liên quan"),
                      createVNode("ul", { class: "divide-y divide-line" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.related, (a) => {
                          return openBlock(), createBlock("li", {
                            key: a.id,
                            class: "py-3 first:pt-0"
                          }, [
                            createVNode(unref(Link), {
                              href: `/news/${a.slug}`,
                              class: "group flex gap-3"
                            }, {
                              default: withCtx(() => [
                                createVNode(_sfc_main$e, {
                                  src: a.image_url,
                                  alt: a.title,
                                  ratio: "size-[58px]",
                                  rounded: "rounded-lg",
                                  class: "shrink-0"
                                }, null, 8, ["src", "alt"]),
                                createVNode("span", { class: "min-w-0" }, [
                                  createVNode("span", { class: "block text-[13.5px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                                  createVNode("span", { class: "mt-1 block text-[11px] text-ink-muted" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1)
                                ])
                              ]),
                              _: 2
                            }, 1032, ["href"])
                          ]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode(_sfc_main$d, { sidebar: __props.sidebar }, null, 8, ["sidebar"])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Article.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$a
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$9 = {
  __name: "Login",
  __ssrInlineRender: true,
  props: { intended: { type: String, default: null } },
  setup(__props) {
    const site = computed(() => usePage().props.site || {});
    const props = __props;
    const form = useForm({ email: "", password: "", remember: true, next: props.intended });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, {
        seo: {
          title: "Đăng nhập",
          description: "Đăng nhập để bình luận và lưu bài.",
          noindex: true,
          canonical: "",
          image: "",
          type: "website",
          siteName: site.value.name,
          locale: "vi_VN"
        }
      }, null, _parent));
      _push(`<div class="grid min-h-dvh place-items-center p-6"><div class="w-full max-w-[370px]"><div class="mb-6 flex items-center gap-3"><img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-10 rounded-xl"><div><p class="text-lg font-extrabold tracking-tight">${ssrInterpolate(site.value.name)}</p><p class="text-xs text-ink-muted">Đăng nhập để bình luận và lưu bài</p></div></div><form class="card space-y-4 p-5"><div class="space-y-1.5"><label class="label" for="email">Email</label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" class="input" required autocomplete="username">`);
      if (unref(form).errors.email) {
        _push(`<p class="text-[12px] text-accent-ink">${ssrInterpolate(unref(form).errors.email)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="label" for="pw">Mật khẩu</label><input id="pw"${ssrRenderAttr("value", unref(form).password)} type="password" class="input" required autocomplete="current-password"></div><button class="btn btn-primary w-full"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>${ssrInterpolate(unref(form).processing ? "Đang vào…" : "Đăng nhập")}</button></form><p class="mt-5 text-center text-[13px] text-ink-muted"> Chưa có tài khoản? `);
      _push(ssrRenderComponent(unref(Link), {
        href: "/register",
        class: "font-semibold text-accent-ink hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Đăng ký`);
          } else {
            return [
              createTextVNode("Đăng ký")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div><!--]-->`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Login.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$9
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$8 = {
  __name: "Register",
  __ssrInlineRender: true,
  setup(__props) {
    const site = computed(() => usePage().props.site || {});
    const form = useForm({ name: "", email: "", password: "", password_confirmation: "" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, {
        seo: {
          title: "Đăng ký",
          description: "Tạo tài khoản để bình luận, lưu bài và theo dõi tin.",
          noindex: true,
          canonical: "",
          image: "",
          type: "website",
          siteName: site.value.name,
          locale: "vi_VN"
        }
      }, null, _parent));
      _push(`<div class="grid min-h-dvh lg:grid-cols-2"><div class="hidden flex-col justify-center p-10 lg:flex" style="${ssrRenderStyle({ "background": "linear-gradient(140deg, #FE2C55 0%, #8B5CF6 55%, #25F4EE 100%)" })}"><img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-12 rounded-xl"><h2 class="mt-6 max-w-sm text-[32px] font-extrabold leading-tight tracking-tight text-white"> Tin tức của bạn, theo cách của bạn </h2><ul class="mt-6 max-w-sm space-y-3 text-[14px] text-white/90"><!--[-->`);
      ssrRenderList([
        "Lưu bài để đọc sau, trên mọi thiết bị",
        "Bình luận và trao đổi với người đọc khác",
        "Thích bài hay để nó lên mục Đọc nhiều"
      ], (t) => {
        _push(`<li class="flex gap-2.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-0.5 size-4 shrink-0"><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round"></path></svg> ${ssrInterpolate(t)}</li>`);
      });
      _push(`<!--]--></ul></div><div class="grid place-items-center p-6"><div class="w-full max-w-[380px]">`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/",
        class: "mb-6 flex items-center gap-2.5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", site.value.logo)} alt="" class="size-9 rounded-xl lg:hidden"${_scopeId}><span class="text-lg font-extrabold tracking-tight"${_scopeId}>Tạo tài khoản</span>`);
          } else {
            return [
              createVNode("img", {
                src: site.value.logo,
                alt: "",
                class: "size-9 rounded-xl lg:hidden"
              }, null, 8, ["src"]),
              createVNode("span", { class: "text-lg font-extrabold tracking-tight" }, "Tạo tài khoản")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="space-y-4"><div class="space-y-1.5"><label class="label" for="n">Tên hiển thị</label><input id="n"${ssrRenderAttr("value", unref(form).name)} class="input" required autocomplete="name">`);
      if (unref(form).errors.name) {
        _push(`<p class="text-[12px] text-accent-ink">${ssrInterpolate(unref(form).errors.name)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="label" for="e">Email</label><input id="e"${ssrRenderAttr("value", unref(form).email)} type="email" class="input" required autocomplete="email">`);
      if (unref(form).errors.email) {
        _push(`<p class="text-[12px] text-accent-ink">${ssrInterpolate(unref(form).errors.email)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="label" for="p">Mật khẩu</label><input id="p"${ssrRenderAttr("value", unref(form).password)} type="password" class="input" required minlength="8" autocomplete="new-password">`);
      if (unref(form).errors.password) {
        _push(`<p class="text-[12px] text-accent-ink">${ssrInterpolate(unref(form).errors.password)}</p>`);
      } else {
        _push(`<p class="text-[11.5px] text-ink-muted">Ít nhất 8 ký tự.</p>`);
      }
      _push(`</div><div class="space-y-1.5"><label class="label" for="p2">Nhập lại mật khẩu</label><input id="p2"${ssrRenderAttr("value", unref(form).password_confirmation)} type="password" class="input" required autocomplete="new-password"></div><button class="btn btn-primary w-full"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>${ssrInterpolate(unref(form).processing ? "Đang tạo…" : "Đăng ký")}</button></form><p class="mt-5 text-center text-[13px] text-ink-muted"> Đã có tài khoản? `);
      _push(ssrRenderComponent(unref(Link), {
        href: "/login",
        class: "font-semibold text-accent-ink hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Đăng nhập`);
          } else {
            return [
              createTextVNode("Đăng nhập")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div></div><!--]-->`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Register.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$8
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$7 = {
  __name: "Bookmarks",
  __ssrInlineRender: true,
  props: {
    bookmarks: { type: Object, required: true },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    function unsave(slug) {
      router.post(`/news/${slug}/save`, {}, { preserveScroll: true });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap"${_scopeId}><header class="mb-6 flex flex-wrap items-end justify-between gap-3"${_scopeId}><div${_scopeId}><h1 class="text-[26px] font-extrabold tracking-tight"${_scopeId}>Bài đã lưu</h1><p class="mt-1 text-[13.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(unref(fmtNumber)(__props.bookmarks.total))} bài bạn để dành đọc sau. </p></div></header>`);
            if (__props.bookmarks.data.length) {
              _push2(`<ul class="grid gap-4 sm:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.bookmarks.data, (b) => {
                _push2(`<li class="card group flex gap-3.5 p-3 transition hover:border-ink-muted/40"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/news/${b.article.slug}`,
                  class: "shrink-0"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$e, {
                        src: b.article.image_url,
                        alt: b.article.title,
                        ratio: "h-[86px] w-[120px]",
                        rounded: "rounded-lg"
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_sfc_main$e, {
                          src: b.article.image_url,
                          alt: b.article.title,
                          ratio: "h-[86px] w-[120px]",
                          rounded: "rounded-lg"
                        }, null, 8, ["src", "alt"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<div class="flex min-w-0 flex-1 flex-col"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/news/${b.article.slug}`,
                  class: "min-w-0"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      if (b.article.category) {
                        _push3(`<span class="text-[11px] font-bold uppercase tracking-wide" style="${ssrRenderStyle({ color: b.article.category.color || "#FE2C55" })}"${_scopeId2}>${ssrInterpolate(b.article.category.name)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<p class="mt-0.5 text-[14px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink"${_scopeId2}>${ssrInterpolate(b.article.title)}</p>`);
                    } else {
                      return [
                        b.article.category ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-[11px] font-bold uppercase tracking-wide",
                          style: { color: b.article.category.color || "#FE2C55" }
                        }, toDisplayString(b.article.category.name), 5)) : createCommentVNode("", true),
                        createVNode("p", { class: "mt-0.5 text-[14px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(b.article.title), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<div class="mt-auto flex items-center gap-2 pt-2 text-[11.5px] text-ink-muted"${_scopeId}><span${_scopeId}>Lưu ${ssrInterpolate(unref(fmtAgo)(b.created_at))}</span><button class="ml-auto cbtn hover:text-accent-ink"${_scopeId}> Bỏ lưu </button></div></div></li>`);
              });
              _push2(`<!--]--></ul>`);
            } else {
              _push2(`<div class="card grid place-items-center px-6 py-16 text-center"${_scopeId}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" class="size-12 text-ink-muted/50"${_scopeId}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round"${_scopeId}></path></svg><p class="mt-4 text-[15px] font-bold"${_scopeId}>Chưa lưu bài nào</p><p class="mt-1 max-w-sm text-[13.5px] text-ink-muted"${_scopeId}> Bấm biểu tượng dấu trang ở bài viết để để dành đọc sau. </p>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: "/",
                class: "btn btn-primary mt-5"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Xem tin mới`);
                  } else {
                    return [
                      createTextVNode("Xem tin mới")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            }
            _push2(ssrRenderComponent(_sfc_main$p, {
              page: __props.bookmarks,
              unit: "bài đã lưu",
              class: "mt-8"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "wrap" }, [
                createVNode("header", { class: "mb-6 flex flex-wrap items-end justify-between gap-3" }, [
                  createVNode("div", null, [
                    createVNode("h1", { class: "text-[26px] font-extrabold tracking-tight" }, "Bài đã lưu"),
                    createVNode("p", { class: "mt-1 text-[13.5px] text-ink-muted" }, toDisplayString(unref(fmtNumber)(__props.bookmarks.total)) + " bài bạn để dành đọc sau. ", 1)
                  ])
                ]),
                __props.bookmarks.data.length ? (openBlock(), createBlock("ul", {
                  key: 0,
                  class: "grid gap-4 sm:grid-cols-2"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.bookmarks.data, (b) => {
                    return openBlock(), createBlock("li", {
                      key: b.id,
                      class: "card group flex gap-3.5 p-3 transition hover:border-ink-muted/40"
                    }, [
                      createVNode(unref(Link), {
                        href: `/news/${b.article.slug}`,
                        class: "shrink-0"
                      }, {
                        default: withCtx(() => [
                          createVNode(_sfc_main$e, {
                            src: b.article.image_url,
                            alt: b.article.title,
                            ratio: "h-[86px] w-[120px]",
                            rounded: "rounded-lg"
                          }, null, 8, ["src", "alt"])
                        ]),
                        _: 2
                      }, 1032, ["href"]),
                      createVNode("div", { class: "flex min-w-0 flex-1 flex-col" }, [
                        createVNode(unref(Link), {
                          href: `/news/${b.article.slug}`,
                          class: "min-w-0"
                        }, {
                          default: withCtx(() => [
                            b.article.category ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-[11px] font-bold uppercase tracking-wide",
                              style: { color: b.article.category.color || "#FE2C55" }
                            }, toDisplayString(b.article.category.name), 5)) : createCommentVNode("", true),
                            createVNode("p", { class: "mt-0.5 text-[14px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(b.article.title), 1)
                          ]),
                          _: 2
                        }, 1032, ["href"]),
                        createVNode("div", { class: "mt-auto flex items-center gap-2 pt-2 text-[11.5px] text-ink-muted" }, [
                          createVNode("span", null, "Lưu " + toDisplayString(unref(fmtAgo)(b.created_at)), 1),
                          createVNode("button", {
                            class: "ml-auto cbtn hover:text-accent-ink",
                            onClick: ($event) => unsave(b.article.slug)
                          }, " Bỏ lưu ", 8, ["onClick"])
                        ])
                      ])
                    ]);
                  }), 128))
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "card grid place-items-center px-6 py-16 text-center"
                }, [
                  (openBlock(), createBlock("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1.3",
                    class: "size-12 text-ink-muted/50"
                  }, [
                    createVNode("path", {
                      d: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
                      "stroke-linejoin": "round"
                    })
                  ])),
                  createVNode("p", { class: "mt-4 text-[15px] font-bold" }, "Chưa lưu bài nào"),
                  createVNode("p", { class: "mt-1 max-w-sm text-[13.5px] text-ink-muted" }, " Bấm biểu tượng dấu trang ở bài viết để để dành đọc sau. "),
                  createVNode(unref(Link), {
                    href: "/",
                    class: "btn btn-primary mt-5"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Xem tin mới")
                    ]),
                    _: 1
                  })
                ])),
                createVNode(_sfc_main$p, {
                  page: __props.bookmarks,
                  unit: "bài đã lưu",
                  class: "mt-8"
                }, null, 8, ["page"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Bookmarks.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$7
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$6 = {
  __name: "Stats",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    /** Ẩn thích/bình luận/chia sẻ khi bằng 0 — hàng toàn số 0 nhìn rất buồn.
     *  Riêng lượt xem thì luôn hiện: bài nào cũng có người mở, và đó là con số
     *  người đọc trông vào đầu tiên để biết tin có đáng đọc không. */
    hideZero: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const ICONS = {
      views: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z",
      likes: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z",
      comments: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z",
      shares: "M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"
    };
    const items = computed(() => {
      const a = props.article;
      const raw = [
        { k: "views", n: a.views ?? 0, label: "lượt xem" },
        { k: "likes", n: a.likes_count ?? 0, label: "lượt thích" },
        { k: "comments", n: a.comments_count ?? 0, label: "bình luận" },
        { k: "shares", n: a.shares_count ?? 0, label: "lượt chia sẻ" }
      ];
      return props.hideZero ? raw.filter((x) => x.k === "views" || x.n > 0) : raw;
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (items.value.length) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2.5 text-[11.5px] text-ink-muted" }, _attrs))}><!--[-->`);
        ssrRenderList(items.value, (s) => {
          _push(`<span class="flex items-center gap-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="size-[13px]" stroke-linecap="round" stroke-linejoin="round">`);
          if (s.k === "views") {
            _push(`<circle cx="12" cy="12" r="3"></circle>`);
          } else {
            _push(`<!---->`);
          }
          if (s.k === "shares") {
            _push(`<!--[--><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`<path${ssrRenderAttr("d", ICONS[s.k])}></path></svg><span class="tabular-nums">${ssrInterpolate(unref(fmtNumber)(s.n))}</span><span class="sr-only">${ssrInterpolate(s.label)}</span></span>`);
        });
        _push(`<!--]--></span>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Stats.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = {
  __name: "ArticleCard",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    size: { type: String, default: "md" },
    // sm | md | lg
    showExcerpt: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "group" }, _attrs))}>`);
      _push(ssrRenderComponent(unref(Link), {
        href: `/news/${__props.article.slug}`,
        class: "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$e, {
              src: __props.article.image_url,
              alt: __props.article.title,
              ratio: __props.size === "lg" ? "aspect-[16/9]" : "aspect-[16/10]"
            }, null, _parent2, _scopeId));
            _push2(`<h3 class="${ssrRenderClass([{
              "text-[20px] leading-tight": __props.size === "lg",
              "text-[15px]": __props.size === "md",
              "text-[13.5px]": __props.size === "sm"
            }, "mt-2.5 font-bold leading-snug clamp-3 transition group-hover:text-accent-ink"])}"${_scopeId}>${ssrInterpolate(__props.article.title)}</h3>`);
            if (__props.showExcerpt && __props.article.excerpt) {
              _push2(`<p class="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted clamp-2"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted"${_scopeId}>`);
            if (__props.article.category) {
              _push2(`<span class="rounded px-1.5 py-0.5 font-semibold" style="${ssrRenderStyle({
                background: (__props.article.category.color || "#FE2C55") + "1f",
                color: __props.article.category.color || "#FE2C55"
              })}"${_scopeId}>${ssrInterpolate(__props.article.category.name)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.source) {
              _push2(`<span${_scopeId}>${ssrInterpolate(__props.article.source)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.published_at) {
              _push2(`<span${_scopeId}>·</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.article.published_at) {
              _push2(`<time${ssrRenderAttr("datetime", __props.article.published_at)}${_scopeId}>${ssrInterpolate(unref(fmtAgo)(__props.article.published_at))}</time>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$6, {
              article: __props.article,
              class: "ml-0.5"
            }, null, _parent2, _scopeId));
            _push2(`</p>`);
          } else {
            return [
              createVNode(_sfc_main$e, {
                src: __props.article.image_url,
                alt: __props.article.title,
                ratio: __props.size === "lg" ? "aspect-[16/9]" : "aspect-[16/10]"
              }, null, 8, ["src", "alt", "ratio"]),
              createVNode("h3", {
                class: ["mt-2.5 font-bold leading-snug clamp-3 transition group-hover:text-accent-ink", {
                  "text-[20px] leading-tight": __props.size === "lg",
                  "text-[15px]": __props.size === "md",
                  "text-[13.5px]": __props.size === "sm"
                }]
              }, toDisplayString(__props.article.title), 3),
              __props.showExcerpt && __props.article.excerpt ? (openBlock(), createBlock("p", {
                key: 0,
                class: "mt-1.5 text-[13.5px] leading-relaxed text-ink-muted clamp-2"
              }, toDisplayString(__props.article.excerpt), 1)) : createCommentVNode("", true),
              createVNode("p", { class: "mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted" }, [
                __props.article.category ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "rounded px-1.5 py-0.5 font-semibold",
                  style: {
                    background: (__props.article.category.color || "#FE2C55") + "1f",
                    color: __props.article.category.color || "#FE2C55"
                  }
                }, toDisplayString(__props.article.category.name), 5)) : createCommentVNode("", true),
                __props.article.source ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(__props.article.source), 1)) : createCommentVNode("", true),
                __props.article.published_at ? (openBlock(), createBlock("span", { key: 2 }, "·")) : createCommentVNode("", true),
                __props.article.published_at ? (openBlock(), createBlock("time", {
                  key: 3,
                  datetime: __props.article.published_at
                }, toDisplayString(unref(fmtAgo)(__props.article.published_at)), 9, ["datetime"])) : createCommentVNode("", true),
                createVNode(_sfc_main$6, {
                  article: __props.article,
                  class: "ml-0.5"
                }, null, 8, ["article"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</article>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ArticleCard.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {
  __name: "Category",
  __ssrInlineRender: true,
  props: {
    category: { type: Object, required: true },
    articles: { type: Object, required: true },
    sidebar: { type: Object, default: () => ({}) },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap"${_scopeId}><header class="mb-6 border-b border-line pb-5"${_scopeId}><div class="flex items-center gap-2.5"${_scopeId}><span class="h-6 w-1.5 rounded-full" style="${ssrRenderStyle({ background: __props.category.color })}"${_scopeId}></span><h1 class="text-2xl font-extrabold tracking-tight"${_scopeId}>${ssrInterpolate(__props.category.name)}</h1></div>`);
            if (__props.category.description) {
              _push2(`<p class="mt-2 max-w-2xl text-[14px] text-ink-muted"${_scopeId}>${ssrInterpolate(__props.category.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="mt-1 text-[12.5px] text-ink-muted"${_scopeId}>${ssrInterpolate(__props.articles.total)} tin</p></header><div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"${_scopeId}><div${_scopeId}>`);
            if (__props.articles.data.length) {
              _push2(`<div class="grid gap-x-5 gap-y-7 sm:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.articles.data, (a) => {
                _push2(ssrRenderComponent(_sfc_main$5, {
                  key: a.id,
                  article: a,
                  "show-excerpt": ""
                }, null, _parent2, _scopeId));
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<p class="py-20 text-center text-ink-muted"${_scopeId}>Chuyên mục này chưa có tin.</p>`);
            }
            _push2(ssrRenderComponent(_sfc_main$p, {
              page: __props.articles,
              unit: "tin",
              class: "mt-8"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_sfc_main$d, { sidebar: __props.sidebar }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "wrap" }, [
                createVNode("header", { class: "mb-6 border-b border-line pb-5" }, [
                  createVNode("div", { class: "flex items-center gap-2.5" }, [
                    createVNode("span", {
                      class: "h-6 w-1.5 rounded-full",
                      style: { background: __props.category.color }
                    }, null, 4),
                    createVNode("h1", { class: "text-2xl font-extrabold tracking-tight" }, toDisplayString(__props.category.name), 1)
                  ]),
                  __props.category.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "mt-2 max-w-2xl text-[14px] text-ink-muted"
                  }, toDisplayString(__props.category.description), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-1 text-[12.5px] text-ink-muted" }, toDisplayString(__props.articles.total) + " tin", 1)
                ]),
                createVNode("div", { class: "grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]" }, [
                  createVNode("div", null, [
                    __props.articles.data.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "grid gap-x-5 gap-y-7 sm:grid-cols-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.articles.data, (a) => {
                        return openBlock(), createBlock(_sfc_main$5, {
                          key: a.id,
                          article: a,
                          "show-excerpt": ""
                        }, null, 8, ["article"]);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "py-20 text-center text-ink-muted"
                    }, "Chuyên mục này chưa có tin.")),
                    createVNode(_sfc_main$p, {
                      page: __props.articles,
                      unit: "tin",
                      class: "mt-8"
                    }, null, 8, ["page"])
                  ]),
                  createVNode(_sfc_main$d, { sidebar: __props.sidebar }, null, 8, ["sidebar"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Category.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$4
}, Symbol.toStringTag, { value: "Module" }));
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$3 = {
  __name: "HeroSlider",
  __ssrInlineRender: true,
  props: {
    slides: { type: Array, default: () => [] },
    interval: { type: Number, default: 6e3 }
  },
  setup(__props) {
    const props = __props;
    const i = ref(0);
    const paused = ref(false);
    const n = computed(() => props.slides.length);
    let timer = null;
    function restart() {
      clearInterval(timer);
      if (n.value < 2) return;
      timer = setInterval(() => {
        if (!paused.value) i.value = (i.value + 1) % n.value;
      }, props.interval);
    }
    onMounted(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) restart();
    });
    onUnmounted(() => clearInterval(timer));
    return (_ctx, _push, _parent, _attrs) => {
      if (n.value) {
        _push(`<section${ssrRenderAttrs(mergeProps({
          class: "relative h-full overflow-hidden rounded-2xl bg-ink",
          "aria-roledescription": "băng chuyền",
          "aria-label": "Tin nổi bật"
        }, _attrs))} data-v-fe1163ec><div class="flex h-full transition-transform duration-500 ease-out" style="${ssrRenderStyle({ transform: `translateX(-${i.value * 100}%)` })}" data-v-fe1163ec><!--[-->`);
        ssrRenderList(__props.slides, (a, k) => {
          _push(`<article class="relative h-full w-full shrink-0"${ssrRenderAttr("aria-hidden", k !== i.value)} data-v-fe1163ec>`);
          _push(ssrRenderComponent(unref(Link), {
            href: `/news/${a.slug}`,
            class: "block h-full"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="aspect-[16/10] w-full lg:aspect-auto lg:h-full" data-v-fe1163ec${_scopeId}>`);
                if (a.image_url) {
                  _push2(`<img${ssrRenderAttr("src", a.image_url)}${ssrRenderAttr("alt", a.title)} class="size-full object-cover"${ssrRenderAttr("loading", k === 0 ? "eager" : "lazy")}${ssrRenderAttr("fetchpriority", k === 0 ? "high" : "auto")} decoding="async" data-v-fe1163ec${_scopeId}>`);
                } else {
                  _push2(`<div class="size-full bg-surface-2" data-v-fe1163ec${_scopeId}></div>`);
                }
                _push2(`</div><div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" data-v-fe1163ec${_scopeId}></div><div class="absolute inset-x-0 bottom-0 p-4 sm:p-5" data-v-fe1163ec${_scopeId}><div class="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-white/85" data-v-fe1163ec${_scopeId}>`);
                if (a.category) {
                  _push2(`<span class="rounded px-2 py-0.5 font-bold text-white" style="${ssrRenderStyle({ background: a.category.color || "#FE2C55" })}" data-v-fe1163ec${_scopeId}>${ssrInterpolate(a.category.name)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (a.source) {
                  _push2(`<span data-v-fe1163ec${_scopeId}>${ssrInterpolate(a.source)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (a.published_at) {
                  _push2(`<span data-v-fe1163ec${_scopeId}>· ${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><h2 class="mt-2 max-w-2xl text-[19px] font-extrabold leading-tight tracking-tight text-white clamp-3 sm:text-[24px]" data-v-fe1163ec${_scopeId}>${ssrInterpolate(a.title)}</h2>`);
                if (a.excerpt) {
                  _push2(`<p class="mt-1.5 hidden max-w-xl text-[13px] leading-relaxed text-white/80 clamp-2 sm:block" data-v-fe1163ec${_scopeId}>${ssrInterpolate(a.excerpt)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "aspect-[16/10] w-full lg:aspect-auto lg:h-full" }, [
                    a.image_url ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: a.image_url,
                      alt: a.title,
                      class: "size-full object-cover",
                      loading: k === 0 ? "eager" : "lazy",
                      fetchpriority: k === 0 ? "high" : "auto",
                      decoding: "async"
                    }, null, 8, ["src", "alt", "loading", "fetchpriority"])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "size-full bg-surface-2"
                    }))
                  ]),
                  createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" }),
                  createVNode("div", { class: "absolute inset-x-0 bottom-0 p-4 sm:p-5" }, [
                    createVNode("div", { class: "flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-white/85" }, [
                      a.category ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "rounded px-2 py-0.5 font-bold text-white",
                        style: { background: a.category.color || "#FE2C55" }
                      }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true),
                      a.source ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(a.source), 1)) : createCommentVNode("", true),
                      a.published_at ? (openBlock(), createBlock("span", { key: 2 }, "· " + toDisplayString(unref(fmtAgo)(a.published_at)), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("h2", { class: "mt-2 max-w-2xl text-[19px] font-extrabold leading-tight tracking-tight text-white clamp-3 sm:text-[24px]" }, toDisplayString(a.title), 1),
                    a.excerpt ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "mt-1.5 hidden max-w-xl text-[13px] leading-relaxed text-white/80 clamp-2 sm:block"
                    }, toDisplayString(a.excerpt), 1)) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</article>`);
        });
        _push(`<!--]--></div>`);
        if (n.value > 1) {
          _push(`<button class="nav-arrow left-3" aria-label="Tin trước" data-v-fe1163ec><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-5" data-v-fe1163ec><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" data-v-fe1163ec></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        if (n.value > 1) {
          _push(`<button class="nav-arrow right-3" aria-label="Tin sau" data-v-fe1163ec><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-5" data-v-fe1163ec><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" data-v-fe1163ec></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        if (n.value > 1) {
          _push(`<div class="absolute right-4 top-4 flex gap-1.5" data-v-fe1163ec><!--[-->`);
          ssrRenderList(__props.slides, (a, k) => {
            _push(`<button class="${ssrRenderClass([k === i.value ? "w-6 bg-accent" : "w-1.5 bg-white/50 hover:bg-white/80", "h-1.5 rounded-full transition-all"])}"${ssrRenderAttr("aria-label", `Tin ${k + 1}`)}${ssrRenderAttr("aria-current", k === i.value)} data-v-fe1163ec></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/HeroSlider.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const HeroSlider = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-fe1163ec"]]);
const _sfc_main$2 = {
  __name: "Home",
  __ssrInlineRender: true,
  props: {
    slider: { type: Array, default: () => [] },
    headlines: { type: Array, default: () => [] },
    latest: { type: Array, default: () => [] },
    blocks: { type: Array, default: () => [] },
    sidebar: { type: Object, default: () => ({}) },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap space-y-10"${_scopeId}><section class="grid gap-x-7 gap-y-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]"${_scopeId}>`);
            _push2(ssrRenderComponent(HeroSlider, { slides: __props.slider }, null, _parent2, _scopeId));
            if (__props.headlines.length) {
              _push2(`<aside class="min-w-0"${_scopeId}><div class="mb-2.5 flex items-center gap-2"${_scopeId}><span class="size-2 rounded-full bg-accent"${_scopeId}></span><h2 class="text-[14px] font-extrabold tracking-tight"${_scopeId}>Tin nổi bật</h2></div><ul class="divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.headlines, (a) => {
                _push2(`<li class="py-2.5 first:pt-0"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/news/${a.slug}`,
                  class: "group block"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<span class="block text-[14.5px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink"${_scopeId2}>${ssrInterpolate(a.title)}</span><span class="mt-1 flex items-center gap-2 text-[11.5px] text-ink-muted"${_scopeId2}>`);
                      if (a.category) {
                        _push3(`<span class="shrink-0 rounded px-1.5 py-0.5 font-semibold" style="${ssrRenderStyle({
                          background: (a.category.color || "#FE2C55") + "1f",
                          color: a.category.color || "#FE2C55"
                        })}"${_scopeId2}>${ssrInterpolate(a.category.name)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<span class="truncate"${_scopeId2}>${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span></span>`);
                    } else {
                      return [
                        createVNode("span", { class: "block text-[14.5px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                        createVNode("span", { class: "mt-1 flex items-center gap-2 text-[11.5px] text-ink-muted" }, [
                          a.category ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "shrink-0 rounded px-1.5 py-0.5 font-semibold",
                            style: {
                              background: (a.category.color || "#FE2C55") + "1f",
                              color: a.category.color || "#FE2C55"
                            }
                          }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true),
                          createVNode("span", { class: "truncate" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></aside>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</section><div class="grid gap-x-7 gap-y-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]"${_scopeId}><div class="min-w-0 space-y-10"${_scopeId}>`);
            if (__props.latest.length) {
              _push2(`<section aria-labelledby="moi-nhat"${_scopeId}><div class="mb-4 flex items-center gap-3"${_scopeId}><h2 id="moi-nhat" class="text-lg font-extrabold tracking-tight"${_scopeId}>Mới nhất</h2><span class="h-px flex-1 bg-line"${_scopeId}></span></div><ul class="divide-y divide-line"${_scopeId}><!--[-->`);
              ssrRenderList(__props.latest, (a) => {
                _push2(`<li class="py-3.5 first:pt-0"${_scopeId}>`);
                _push2(ssrRenderComponent(unref(Link), {
                  href: `/news/${a.slug}`,
                  class: "group flex gap-3.5"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$e, {
                        src: a.image_url,
                        alt: a.title,
                        ratio: "h-[72px] w-[108px] sm:h-[84px] sm:w-[126px]",
                        rounded: "rounded-lg",
                        class: "shrink-0"
                      }, null, _parent3, _scopeId2));
                      _push3(`<span class="min-w-0 flex-1"${_scopeId2}><span class="block text-[15px] font-bold leading-snug clamp-2 transition group-hover:text-accent-ink sm:text-[16px]"${_scopeId2}>${ssrInterpolate(a.title)}</span>`);
                      if (a.excerpt) {
                        _push3(`<span class="mt-1 hidden text-[13px] leading-relaxed text-ink-muted clamp-2 sm:block"${_scopeId2}>${ssrInterpolate(a.excerpt)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<span class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted"${_scopeId2}>`);
                      if (a.category) {
                        _push3(`<span class="rounded px-1.5 py-0.5 font-semibold" style="${ssrRenderStyle({
                          background: (a.category.color || "#FE2C55") + "1f",
                          color: a.category.color || "#FE2C55"
                        })}"${_scopeId2}>${ssrInterpolate(a.category.name)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      if (a.source) {
                        _push3(`<span${_scopeId2}>${ssrInterpolate(a.source)}</span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<span${_scopeId2}>· ${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span>`);
                      _push3(ssrRenderComponent(_sfc_main$6, {
                        article: a,
                        class: "ml-1"
                      }, null, _parent3, _scopeId2));
                      _push3(`</span></span>`);
                    } else {
                      return [
                        createVNode(_sfc_main$e, {
                          src: a.image_url,
                          alt: a.title,
                          ratio: "h-[72px] w-[108px] sm:h-[84px] sm:w-[126px]",
                          rounded: "rounded-lg",
                          class: "shrink-0"
                        }, null, 8, ["src", "alt"]),
                        createVNode("span", { class: "min-w-0 flex-1" }, [
                          createVNode("span", { class: "block text-[15px] font-bold leading-snug clamp-2 transition group-hover:text-accent-ink sm:text-[16px]" }, toDisplayString(a.title), 1),
                          a.excerpt ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "mt-1 hidden text-[13px] leading-relaxed text-ink-muted clamp-2 sm:block"
                          }, toDisplayString(a.excerpt), 1)) : createCommentVNode("", true),
                          createVNode("span", { class: "mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted" }, [
                            a.category ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "rounded px-1.5 py-0.5 font-semibold",
                              style: {
                                background: (a.category.color || "#FE2C55") + "1f",
                                color: a.category.color || "#FE2C55"
                              }
                            }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true),
                            a.source ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(a.source), 1)) : createCommentVNode("", true),
                            createVNode("span", null, "· " + toDisplayString(unref(fmtAgo)(a.published_at)), 1),
                            createVNode(_sfc_main$6, {
                              article: a,
                              class: "ml-1"
                            }, null, 8, ["article"])
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</li>`);
              });
              _push2(`<!--]--></ul></section>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(__props.blocks, (b) => {
              _push2(`<section${_scopeId}><div class="mb-4 flex items-center gap-3"${_scopeId}><h2 class="text-lg font-extrabold tracking-tight"${_scopeId}>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: `/category/${b.category.slug}`,
                class: "hover:text-accent-ink"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(b.category.name)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(b.category.name), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</h2><span class="h-1.5 w-1.5 rounded-full" style="${ssrRenderStyle({ background: b.category.color })}"${_scopeId}></span><span class="h-px flex-1 bg-line"${_scopeId}></span>`);
              _push2(ssrRenderComponent(unref(Link), {
                href: `/category/${b.category.slug}`,
                class: "shrink-0 text-[13px] font-semibold text-ink-muted hover:text-ink"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Xem tất cả → `);
                  } else {
                    return [
                      createTextVNode(" Xem tất cả → ")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div><div class="grid gap-x-6 gap-y-5 md:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(b.articles, (a) => {
                _push2(ssrRenderComponent(unref(Link), {
                  key: a.id,
                  href: `/news/${a.slug}`,
                  class: "group flex gap-3"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$e, {
                        src: a.image_url,
                        alt: a.title,
                        ratio: "h-[64px] w-[96px]",
                        rounded: "rounded-lg",
                        class: "shrink-0"
                      }, null, _parent3, _scopeId2));
                      _push3(`<span class="min-w-0 flex-1"${_scopeId2}><span class="block text-[14px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink"${_scopeId2}>${ssrInterpolate(a.title)}</span><span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted"${_scopeId2}><span${_scopeId2}>${ssrInterpolate(a.source)} · ${ssrInterpolate(unref(fmtAgo)(a.published_at))}</span>`);
                      _push3(ssrRenderComponent(_sfc_main$6, { article: a }, null, _parent3, _scopeId2));
                      _push3(`</span></span>`);
                    } else {
                      return [
                        createVNode(_sfc_main$e, {
                          src: a.image_url,
                          alt: a.title,
                          ratio: "h-[64px] w-[96px]",
                          rounded: "rounded-lg",
                          class: "shrink-0"
                        }, null, 8, ["src", "alt"]),
                        createVNode("span", { class: "min-w-0 flex-1" }, [
                          createVNode("span", { class: "block text-[14px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                          createVNode("span", { class: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted" }, [
                            createVNode("span", null, toDisplayString(a.source) + " · " + toDisplayString(unref(fmtAgo)(a.published_at)), 1),
                            createVNode(_sfc_main$6, { article: a }, null, 8, ["article"])
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]--></div></section>`);
            });
            _push2(`<!--]--></div><div class="min-w-0 lg:sticky lg:top-[72px] lg:self-start"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$d, { sidebar: __props.sidebar }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
            if (!__props.slider.length && !__props.latest.length && !__props.blocks.length) {
              _push2(`<p class="py-20 text-center text-ink-muted"${_scopeId}> Chưa có tin nào. Chạy dây chuyền để lấy tin về. </p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "wrap space-y-10" }, [
                createVNode("section", { class: "grid gap-x-7 gap-y-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]" }, [
                  createVNode(HeroSlider, { slides: __props.slider }, null, 8, ["slides"]),
                  __props.headlines.length ? (openBlock(), createBlock("aside", {
                    key: 0,
                    class: "min-w-0"
                  }, [
                    createVNode("div", { class: "mb-2.5 flex items-center gap-2" }, [
                      createVNode("span", { class: "size-2 rounded-full bg-accent" }),
                      createVNode("h2", { class: "text-[14px] font-extrabold tracking-tight" }, "Tin nổi bật")
                    ]),
                    createVNode("ul", { class: "divide-y divide-line" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.headlines, (a) => {
                        return openBlock(), createBlock("li", {
                          key: a.id,
                          class: "py-2.5 first:pt-0"
                        }, [
                          createVNode(unref(Link), {
                            href: `/news/${a.slug}`,
                            class: "group block"
                          }, {
                            default: withCtx(() => [
                              createVNode("span", { class: "block text-[14.5px] font-bold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                              createVNode("span", { class: "mt-1 flex items-center gap-2 text-[11.5px] text-ink-muted" }, [
                                a.category ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "shrink-0 rounded px-1.5 py-0.5 font-semibold",
                                  style: {
                                    background: (a.category.color || "#FE2C55") + "1f",
                                    color: a.category.color || "#FE2C55"
                                  }
                                }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true),
                                createVNode("span", { class: "truncate" }, toDisplayString(unref(fmtAgo)(a.published_at)), 1)
                              ])
                            ]),
                            _: 2
                          }, 1032, ["href"])
                        ]);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "grid gap-x-7 gap-y-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]" }, [
                  createVNode("div", { class: "min-w-0 space-y-10" }, [
                    __props.latest.length ? (openBlock(), createBlock("section", {
                      key: 0,
                      "aria-labelledby": "moi-nhat"
                    }, [
                      createVNode("div", { class: "mb-4 flex items-center gap-3" }, [
                        createVNode("h2", {
                          id: "moi-nhat",
                          class: "text-lg font-extrabold tracking-tight"
                        }, "Mới nhất"),
                        createVNode("span", { class: "h-px flex-1 bg-line" })
                      ]),
                      createVNode("ul", { class: "divide-y divide-line" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(__props.latest, (a) => {
                          return openBlock(), createBlock("li", {
                            key: a.id,
                            class: "py-3.5 first:pt-0"
                          }, [
                            createVNode(unref(Link), {
                              href: `/news/${a.slug}`,
                              class: "group flex gap-3.5"
                            }, {
                              default: withCtx(() => [
                                createVNode(_sfc_main$e, {
                                  src: a.image_url,
                                  alt: a.title,
                                  ratio: "h-[72px] w-[108px] sm:h-[84px] sm:w-[126px]",
                                  rounded: "rounded-lg",
                                  class: "shrink-0"
                                }, null, 8, ["src", "alt"]),
                                createVNode("span", { class: "min-w-0 flex-1" }, [
                                  createVNode("span", { class: "block text-[15px] font-bold leading-snug clamp-2 transition group-hover:text-accent-ink sm:text-[16px]" }, toDisplayString(a.title), 1),
                                  a.excerpt ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "mt-1 hidden text-[13px] leading-relaxed text-ink-muted clamp-2 sm:block"
                                  }, toDisplayString(a.excerpt), 1)) : createCommentVNode("", true),
                                  createVNode("span", { class: "mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted" }, [
                                    a.category ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "rounded px-1.5 py-0.5 font-semibold",
                                      style: {
                                        background: (a.category.color || "#FE2C55") + "1f",
                                        color: a.category.color || "#FE2C55"
                                      }
                                    }, toDisplayString(a.category.name), 5)) : createCommentVNode("", true),
                                    a.source ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(a.source), 1)) : createCommentVNode("", true),
                                    createVNode("span", null, "· " + toDisplayString(unref(fmtAgo)(a.published_at)), 1),
                                    createVNode(_sfc_main$6, {
                                      article: a,
                                      class: "ml-1"
                                    }, null, 8, ["article"])
                                  ])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["href"])
                          ]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true),
                    (openBlock(true), createBlock(Fragment, null, renderList(__props.blocks, (b) => {
                      return openBlock(), createBlock("section", {
                        key: b.category.slug
                      }, [
                        createVNode("div", { class: "mb-4 flex items-center gap-3" }, [
                          createVNode("h2", { class: "text-lg font-extrabold tracking-tight" }, [
                            createVNode(unref(Link), {
                              href: `/category/${b.category.slug}`,
                              class: "hover:text-accent-ink"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(b.category.name), 1)
                              ]),
                              _: 2
                            }, 1032, ["href"])
                          ]),
                          createVNode("span", {
                            class: "h-1.5 w-1.5 rounded-full",
                            style: { background: b.category.color }
                          }, null, 4),
                          createVNode("span", { class: "h-px flex-1 bg-line" }),
                          createVNode(unref(Link), {
                            href: `/category/${b.category.slug}`,
                            class: "shrink-0 text-[13px] font-semibold text-ink-muted hover:text-ink"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Xem tất cả → ")
                            ]),
                            _: 1
                          }, 8, ["href"])
                        ]),
                        createVNode("div", { class: "grid gap-x-6 gap-y-5 md:grid-cols-2" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(b.articles, (a) => {
                            return openBlock(), createBlock(unref(Link), {
                              key: a.id,
                              href: `/news/${a.slug}`,
                              class: "group flex gap-3"
                            }, {
                              default: withCtx(() => [
                                createVNode(_sfc_main$e, {
                                  src: a.image_url,
                                  alt: a.title,
                                  ratio: "h-[64px] w-[96px]",
                                  rounded: "rounded-lg",
                                  class: "shrink-0"
                                }, null, 8, ["src", "alt"]),
                                createVNode("span", { class: "min-w-0 flex-1" }, [
                                  createVNode("span", { class: "block text-[14px] font-semibold leading-snug clamp-3 transition group-hover:text-accent-ink" }, toDisplayString(a.title), 1),
                                  createVNode("span", { class: "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted" }, [
                                    createVNode("span", null, toDisplayString(a.source) + " · " + toDisplayString(unref(fmtAgo)(a.published_at)), 1),
                                    createVNode(_sfc_main$6, { article: a }, null, 8, ["article"])
                                  ])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["href"]);
                          }), 128))
                        ])
                      ]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "min-w-0 lg:sticky lg:top-[72px] lg:self-start" }, [
                    createVNode(_sfc_main$d, { sidebar: __props.sidebar }, null, 8, ["sidebar"])
                  ])
                ]),
                !__props.slider.length && !__props.latest.length && !__props.blocks.length ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "py-20 text-center text-ink-muted"
                }, " Chưa có tin nào. Chạy dây chuyền để lấy tin về. ")) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Home.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$2
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$1 = {
  __name: "Page",
  __ssrInlineRender: true,
  props: {
    page: { type: Object, required: true },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap max-w-[760px]"${_scopeId}><nav class="mb-4 flex items-center gap-1.5 text-[12.5px] text-ink-muted" aria-label="Đường dẫn"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Link), {
              href: "/",
              class: "hover:text-ink"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Trang chủ`);
                } else {
                  return [
                    createTextVNode("Trang chủ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<span${_scopeId}>/</span><span class="text-ink-2"${_scopeId}>${ssrInterpolate(__props.page.title)}</span></nav><h1 class="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]"${_scopeId}>${ssrInterpolate(__props.page.title)}</h1>`);
            if (__props.page.excerpt) {
              _push2(`<p class="mt-3 text-[16px] leading-relaxed text-ink-2"${_scopeId}>${ssrInterpolate(__props.page.excerpt)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.page.content) {
              _push2(`<div class="prose-vi mt-6"${_scopeId}>${__props.page.content ?? ""}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="mt-10 border-t border-line pt-4 text-[12.5px] text-ink-muted"${_scopeId}> Cập nhật lần cuối ${ssrInterpolate(unref(fmtDate)(__props.page.updated_at))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "wrap max-w-[760px]" }, [
                createVNode("nav", {
                  class: "mb-4 flex items-center gap-1.5 text-[12.5px] text-ink-muted",
                  "aria-label": "Đường dẫn"
                }, [
                  createVNode(unref(Link), {
                    href: "/",
                    class: "hover:text-ink"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Trang chủ")
                    ]),
                    _: 1
                  }),
                  createVNode("span", null, "/"),
                  createVNode("span", { class: "text-ink-2" }, toDisplayString(__props.page.title), 1)
                ]),
                createVNode("h1", { class: "text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]" }, toDisplayString(__props.page.title), 1),
                __props.page.excerpt ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-3 text-[16px] leading-relaxed text-ink-2"
                }, toDisplayString(__props.page.excerpt), 1)) : createCommentVNode("", true),
                __props.page.content ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "prose-vi mt-6",
                  innerHTML: __props.page.content
                }, null, 8, ["innerHTML"])) : createCommentVNode("", true),
                createVNode("p", { class: "mt-10 border-t border-line pt-4 text-[12.5px] text-ink-muted" }, " Cập nhật lần cuối " + toDisplayString(unref(fmtDate)(__props.page.updated_at)), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$1
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main = {
  __name: "Search",
  __ssrInlineRender: true,
  props: {
    term: { type: String, default: "" },
    articles: { type: Object, required: true },
    sidebar: { type: Object, default: () => ({}) },
    seo: { type: Object, required: true }
  },
  setup(__props) {
    const props = __props;
    const q = ref(props.term);
    const submit = () => router.get("/search", { q: q.value.trim() }, { preserveState: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$B, { seo: __props.seo }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$C, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="wrap"${_scopeId}><form class="mx-auto max-w-xl"${_scopeId}><label class="label mb-1.5" for="sq"${_scopeId}>Tìm tin</label><div class="flex gap-2"${_scopeId}><input id="sq"${ssrRenderAttr("value", q.value)} class="input" placeholder="vd: Sơn Tùng, Messi, V-League…" autofocus${_scopeId}><button class="btn btn-primary shrink-0"${_scopeId}>Tìm</button></div></form>`);
            if (__props.term) {
              _push2(`<div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"${_scopeId}><div${_scopeId}><p class="mb-4 text-[14px] text-ink-muted"${_scopeId}><strong class="text-ink"${_scopeId}>${ssrInterpolate(__props.articles.total)}</strong> kết quả cho “${ssrInterpolate(__props.term)}” </p>`);
              if (__props.articles.data.length) {
                _push2(`<div class="grid gap-x-5 gap-y-7 sm:grid-cols-2"${_scopeId}><!--[-->`);
                ssrRenderList(__props.articles.data, (a) => {
                  _push2(ssrRenderComponent(_sfc_main$5, {
                    key: a.id,
                    article: a,
                    "show-excerpt": ""
                  }, null, _parent2, _scopeId));
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<p class="py-16 text-center text-ink-muted"${_scopeId}> Không tìm thấy tin nào. Thử từ khoá ngắn hơn hoặc bỏ dấu. </p>`);
              }
              _push2(ssrRenderComponent(_sfc_main$p, {
                page: __props.articles,
                unit: "kết quả",
                class: "mt-8"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
              _push2(ssrRenderComponent(_sfc_main$d, { sidebar: __props.sidebar }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "wrap" }, [
                createVNode("form", {
                  class: "mx-auto max-w-xl",
                  onSubmit: withModifiers(submit, ["prevent"])
                }, [
                  createVNode("label", {
                    class: "label mb-1.5",
                    for: "sq"
                  }, "Tìm tin"),
                  createVNode("div", { class: "flex gap-2" }, [
                    withDirectives(createVNode("input", {
                      id: "sq",
                      "onUpdate:modelValue": ($event) => q.value = $event,
                      class: "input",
                      placeholder: "vd: Sơn Tùng, Messi, V-League…",
                      autofocus: ""
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, q.value]
                    ]),
                    createVNode("button", { class: "btn btn-primary shrink-0" }, "Tìm")
                  ])
                ], 32),
                __props.term ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
                }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "mb-4 text-[14px] text-ink-muted" }, [
                      createVNode("strong", { class: "text-ink" }, toDisplayString(__props.articles.total), 1),
                      createTextVNode(" kết quả cho “" + toDisplayString(__props.term) + "” ", 1)
                    ]),
                    __props.articles.data.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "grid gap-x-5 gap-y-7 sm:grid-cols-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(__props.articles.data, (a) => {
                        return openBlock(), createBlock(_sfc_main$5, {
                          key: a.id,
                          article: a,
                          "show-excerpt": ""
                        }, null, 8, ["article"]);
                      }), 128))
                    ])) : (openBlock(), createBlock("p", {
                      key: 1,
                      class: "py-16 text-center text-ink-muted"
                    }, " Không tìm thấy tin nào. Thử từ khoá ngắn hơn hoặc bỏ dấu. ")),
                    createVNode(_sfc_main$p, {
                      page: __props.articles,
                      unit: "kết quả",
                      class: "mt-8"
                    }, null, 8, ["page"])
                  ]),
                  createVNode(_sfc_main$d, { sidebar: __props.sidebar }, null, 8, ["sidebar"])
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __vite_glob_0_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main
}, Symbol.toStringTag, { value: "Module" }));
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => title,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Account.vue": __vite_glob_0_0, "./Pages/Admin/ArticleEdit.vue": __vite_glob_0_1, "./Pages/Admin/Articles.vue": __vite_glob_0_2, "./Pages/Admin/Categories.vue": __vite_glob_0_3, "./Pages/Admin/Comments.vue": __vite_glob_0_4, "./Pages/Admin/Dashboard.vue": __vite_glob_0_5, "./Pages/Admin/Pages.vue": __vite_glob_0_6, "./Pages/Admin/Reports.vue": __vite_glob_0_7, "./Pages/Admin/Roles.vue": __vite_glob_0_8, "./Pages/Admin/Settings.vue": __vite_glob_0_9, "./Pages/Admin/Users.vue": __vite_glob_0_10, "./Pages/Article.vue": __vite_glob_0_11, "./Pages/Auth/Login.vue": __vite_glob_0_12, "./Pages/Auth/Register.vue": __vite_glob_0_13, "./Pages/Bookmarks.vue": __vite_glob_0_14, "./Pages/Category.vue": __vite_glob_0_15, "./Pages/Home.vue": __vite_glob_0_16, "./Pages/Page.vue": __vite_glob_0_17, "./Pages/Search.vue": __vite_glob_0_18 });
      return pages[`./Pages/${name}.vue`];
    },
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin);
    }
  })
);
