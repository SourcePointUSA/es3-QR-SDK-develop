function _typeof(e) {
  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              "function" == typeof Symbol &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? "symbol"
              : typeof e;
          }),
    _typeof(e)
  );
}
!(function () {
  var e = !1,
    t = null,
    n = window.console || {
      log: function () {
        return !0;
      },
      error: function () {
        document.write(v);
      },
    };
  "undefined" == typeof _sp_ && n.error("_sp_ - object undefined");
  var r,
    o,
    a,
    s = "2.0.0",
    c = "nativeqr",
    i = Q("consentUUID"),
    p = Q("sp_su"),
    d = Q("authId") || _sp_.config.authId,
    u = Math.floor(1e6 * Math.random()),
    g = (_sp_.config.baseEndpoint, _sp_.config.propertyHref),
    l = _sp_.config.propertyId,
    f = _sp_.config.accountId,
    m = _sp_.config.consentLanguage || "EN",
    _ = _sp_.config.isSPA,
    y = (_sp_.config.isJSONp, _sp_.config.baseEndpoint.replace(/\/+$/, "")),
    S = Q("consentDate_" + l),
    h = X("euconsent-v2_" + l),
    I = X("consentStatus_" + l) || null,
    C = X("localState_" + l);
  (r = y + "/wrapper/v2/meta-data"),
    (o = {
      hasCsp: "true",
      accountId: f,
      env: "prod",
      metadata: '{"gdpr":{}}',
      propertyId: l,
      scriptVersion: s,
      scriptType: c,
    }),
    (a = JSON.parse(j(H(r, o)))),
    F("metaData_" + l, (D = a));
  var D = X("metaData_" + l),
    w = D.gdpr.applies,
    O = X("vendorGrants_" + l),
    R = X("nonKeyedLocalState_" + l),
    N = X("consentedPurposes_" + l),
    J = _sp_.config.messageDiv,
    T = _sp_.config.pmDiv,
    U = _sp_.config.pmId,
    b =
      ((U =
        "undefined" != typeof _sp_ && _sp_.config && _sp_.config.pmId
          ? _sp_.config.pmId
          : 1196474),
      !(
        "undefined" == typeof _sp_ ||
        !_sp_.config ||
        !0 !== _sp_.config.buildMessageComponents
      )),
    M = null,
    A = null,
    V = ((C = null), !1);
  null == i && k("consentUUID", (i = q()), 365),
    null == d && k("authId", (d = q()), 365),
    window.JSON ||
      (window.JSON = {
        stringify: function (e) {
          var t = _typeof(e);
          if ("object" != t || null === e)
            return "string" == t && (e = '"' + e + '"'), String(e);
          var n,
            r,
            o = [],
            a = e && e.constructor == Array;
          for (n in e)
            "string" == (t = _typeof((r = e[n])))
              ? (r = '"' + r + '"')
              : "object" == t && null !== r && (r = JSON.stringify(r)),
              o.push((a ? "" : '"' + n + '":') + String(r));
          return (a ? "[" : "{") + String(o) + (a ? "]" : "}");
        },
      }),
    "function" != typeof JSON.parse &&
      (JSON.parse = function (e) {
        try {
          return new Function("return " + e)();
        } catch (e) {
          throw new SyntaxError("JSON.parse: ungültiges JSON-Format");
        }
      }),
    (window._sp_.config.events = window._sp_.config.events || {});
  var L = function (e, t) {
    var n = window._sp_.config.events[e];
    "function" == typeof n && n.apply(null, t || []);
  };
  function x() {
    L("onConsentReady", [i, h, O, I, N]);
  }
  function E(e) {
    var t = document.getElementById(e);
    t && (t.style.display = "block");
  }
  function P(e) {
    var t = document.getElementById(e);
    t && (t.style.display = "none");
  }
  function j(e) {
    var t = new XMLHttpRequest();
    return t.open("GET", e, !1), t.send(null), t.responseText;
  }
  function B(e, t) {
    var n = "object" === _typeof(e) && e instanceof Date ? e : new Date(e),
      r = "object" === _typeof(t) && t instanceof Date ? t : new Date(t),
      o = n.getTime(),
      a = r.getTime();
    return o < a ? -1 : o > a ? 1 : 0;
  }
  function H(e, t) {
    var n = e + "?",
      r = [];
    for (var o in t)
      t.hasOwnProperty(o) &&
        r.push(encodeURIComponent(o) + "=" + encodeURIComponent(t[o]));
    return n + r.join("&");
  }
  function q() {
    for (
      var e, t = "0123456789abcdef".split(""), n = [], r = Math.random, o = 0;
      o < 36;
      o++
    )
      8 === o || 13 === o || 18 === o || 23 === o
        ? (n[o] = "-")
        : 14 === o
        ? (n[o] = "4")
        : ((e = 0 | (16 * r())), (n[o] = t[19 === o ? (3 & e) | 8 : e]));
    return n.join("");
  }
  function k(e, t, n) {
    var r = "";
    if (n) {
      var o = new Date();
      o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3),
        (r = "; expires=" + o.toUTCString());
    }
    document.cookie = e + "=" + encodeURIComponent(t) + r + "; path=/";
  }
  function K() {
    if (
      (n.log("startGetMessages"),
      (o = !1),
      null === I ||
        !I.consentedAll ||
        (null !== S &&
          (1 === B(D.gdpr.legalBasisChangeDate, S) &&
            ((I.legalBasisChanges = !0), (o = !0)),
          1 === B(D.gdpr.additionsChangeDate, S) &&
            ((I.vendorListAdditions = !0), (o = !0))),
        o))
    ) {
      n.log("notconsentedTOAll requesting message");
      var t =
          y +
          "/wrapper/v2/messages" +
          "?hasCsp=true&env=prod&body=" +
          G({
            accountId: f,
            campaignEnv: "prod",
            campaigns: {
              gdpr: { consentStatus: I, hasLocalData: e, targetingParams: {} },
            },
            clientMMSOrigin: y,
            hasCSP: !0,
            includeData: {
              localState: { type: "string" },
              actions: { type: "RecordString" },
              cookies: { type: "RecordString" },
            },
            propertyHref: g,
            propertyId: l,
            authId: d,
          }) +
          "&localState=" +
          G(C) +
          "&metadata=" +
          G(D) +
          "&nonKeyedLocalState=" +
          G(R) +
          "&ch=" +
          u +
          "&scriptVersion=" +
          s +
          "&scriptType=" +
          c,
        r = JSON.parse(j(t));
      (C = r.localState),
        F("localState_" + l, JSON.parse(r.localState)),
        (R = r.nonKeyedLocalState),
        F("nonKeyedLocalState_" + l, JSON.parse(r.nonKeyedLocalState)),
        !(function (e) {
          if (e.campaigns && Array.isArray(e.campaigns))
            for (var t = 0; t < e.campaigns.length; t++) {
              var n = e.campaigns[t];
              if (n.message && n.message.message_json)
                return (
                  (A = n.messageMetaData),
                  (M = n.messageMetaData.messageId),
                  n.message.message_json
                );
            }
          return !1;
        })(r)
          ? x()
          : E(J);
    } else x();
    var o;
    !(function () {
      if (
        ((function (e) {
          if (!p) {
            var t = Math.random();
            (p = t < e), k("sp_su", JSON.stringify(p), 365);
          }
        })(D.gdpr.sampleRate),
        "true" === p)
      ) {
        var e = {
          gdpr: {
            applies: !0,
            consentStatus: I,
            accountId: f,
            euconsent: h,
            mmsDomain: y,
            propertyId: l,
            siteId: l,
            pubData: {},
            uuid: i,
            sampleRate: D.gdpr.sampleRate,
            withSiteActions: !0,
          },
        };
        A &&
          ((e.gdpr.categoryId = A.categoryId),
          (e.gdpr.subCategoryId = A.subCategoryId),
          (e.gdpr.msgId = A.messageId),
          (e.gdpr.prtnUUID = A.prtnUUID));
        var t = Y(
          y +
            "/wrapper/v2/pv-data?hasCsp=true&env=prod&ch=" +
            u +
            "&scriptVersion=" +
            s +
            "&scriptType=" +
            c
        );
        (t.onreadystatechange = function () {
          if (4 === t.readyState && 200 === t.status)
            JSON.parse(t.responseText);
          else n.error("error:", t.responseText);
        }),
          t.send(JSON.stringify(e));
      }
    })();
  }
  function G(e) {
    return "string" == typeof e
      ? encodeURIComponent(e)
      : encodeURIComponent(JSON.stringify(e));
  }
  function F(e, t) {
    if (void 0 !== window.localStorage)
      try {
        window.localStorage.setItem(e, JSON.stringify(t));
      } catch (n) {
        k(e, JSON.stringify(t), 365);
      }
    else k(e, JSON.stringify(t), 365);
  }
  function X(e) {
    if (void 0 === window.localStorage)
      return JSON.parse(decodeURIComponent(Q(e)));
    try {
      return JSON.parse(window.localStorage.getItem(e));
    } catch (t) {
      return JSON.parse(decodeURIComponent(Q(e)));
    }
  }
  function Q(e) {
    for (var t = document.cookie.split(";"), n = 0; n < t.length; n++) {
      var r = t[n].trim();
      if (0 === r.indexOf(e + "="))
        return r.substring((e + "=").length, r.length);
    }
    return null;
  }
  function $(e) {
    document.cookie = e + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  function z(e) {
    if (void 0 !== window.localStorage)
      try {
        window.localStorage.removeItem(e);
      } catch (t) {
        $(e);
      }
    else $(e);
  }
  function W(e, t, n, r, o, a) {
    (I = e),
      F("consentStatus_" + l, e),
      (i = t),
      k("consentUUID", t, 365),
      (consentDate = n),
      k("consentDate_" + l, n, 365),
      (h = r),
      F("euconsent-v2_" + l, r),
      F("vendorGrants_" + l, o),
      (O = o),
      F("consentedPurposes_" + l, a),
      (N = a),
      x();
  }
  function Y(e) {
    var t = new XMLHttpRequest();
    return (
      t.open("POST", e, !1),
      t.setRequestHeader("accept", "*/*"),
      t.setRequestHeader("accept-language", "de,en;q=0.9"),
      t.setRequestHeader("content-type", "application/json"),
      t
    );
  }
  function Z() {
    return (
      _sp_.config.qrUrl +
      encodeURIComponent(
        _sp_.config.pmUrl +
          "?authid=" +
          d +
          "&consentlanguage=" +
          m +
          "&propertyid=" +
          l +
          "&propertyhref=" +
          g +
          "&accountid=" +
          f +
          "&pmid=" +
          U
      )
    );
  }
  function ee() {
    return JSON.parse(
      j(
        y +
          "/consent/tcfv2/vendor-list/categories?siteId=" +
          l +
          "&consentLanguage=" +
          m
      )
    );
  }
  function te() {
    return "true" === p;
  }
  (_sp_.executeMessaging = function () {
    P(T), P(J), K(), n.log("Messaging executed!");
  }),
    (_sp_.loadPrivacyManagerModal = function () {
      E(T), P(J);
    }),
    (_sp_.acceptAll = function () {
      P(T),
        P(J),
        (function () {
          var e = _sp_.config.baseEndpoint + "/wrapper/v2/choice/consent-all",
            r = {
              hasCsp: "true",
              authId: d,
              accountId: f,
              env: "prod",
              includeCustomVendorsRes: "true",
              metadata: JSON.stringify(D),
              propertyId: l,
              withSiteActions: "true",
              ch: u,
              scriptVersion: s,
              scriptType: c,
            },
            o = [];
          for (var a in r)
            r.hasOwnProperty(a) &&
              o.push(encodeURIComponent(a) + "=" + encodeURIComponent(r[a]));
          var p = j(e + "?" + o.join("&"));
          (function (e) {
            e.gdpr.consentStatus.granularStatus,
              (t = e.gdpr.consentAllRef),
              (w = e.gdpr.gdprApplies),
              (h = e.gdpr.euconsent),
              (N = e.gdpr.categories);
            var r =
                y +
                "/wrapper/v2/choice/gdpr/11?hasCsp=true&env=prod&ch=" +
                u +
                "&scriptVersion=" +
                s +
                "&scriptType=" +
                c,
              o = {
                accountId: f,
                applies: w,
                authId: d,
                messageId: M,
                mmsDomain: y,
                propertyId: l,
                pubData: {},
                includeData: {
                  actions: { type: "RecordString" },
                  customVendorsResponse: { type: "RecordString" },
                },
                uuid: i,
                sampleRate: D.gdpr.sampleRate,
                sendPVData: te(),
                consentAllRef: t,
                granularStatus: I,
                vendorListId: e.gdpr.vendorListId,
              },
              a = Y(r);
            (a.onreadystatechange = function () {
              if (4 === a.readyState && 200 === a.status) {
                var t = JSON.parse(a.responseText);
                W(
                  e.gdpr.consentStatus,
                  t.uuid,
                  t.dateCreated,
                  h,
                  e.gdpr.grants,
                  N
                );
              } else n.error("error:", a.responseText);
            }),
              a.send(JSON.stringify(o));
          })(JSON.parse(p)),
            P(J);
        })();
    }),
    (_sp_.continue = function () {
      var e, t, r, o;
      P(T),
        P(J),
        (e = y + "/consent/tcfv2/consent/v3/" + l + "/li-only"),
        (t = JSON.parse(j(e))),
        (r = Y(
          y +
            "/wrapper/v2/choice/gdpr/1?hasCsp=true&env=prod&ch=" +
            u +
            "&scriptVersion=" +
            s +
            "&scriptType=" +
            c
        )),
        (o = {
          accountId: f,
          applies: w,
          authId: d,
          messageId: M,
          mmsDomain: y,
          propertyId: l,
          pubData: {},
          includeData: {
            actions: { type: "RecordString" },
            customVendorsResponse: { type: "RecordString" },
          },
          uuid: i,
          sampleRate: D.gdpr.sampleRate,
          sendPVData: te(),
          pmSaveAndExitVariables: t,
        }),
        (r.onreadystatechange = function () {
          if (4 === r.readyState && 200 === r.status) {
            var e = JSON.parse(r.responseText);
            W(
              e.consentStatus,
              e.uuid,
              e.dateCreated,
              e.euconsent,
              e.grants,
              e.categories
            );
          } else n.error("error:", r.responseText);
        }),
        r.send(JSON.stringify(o));
    }),
    (_sp_.reject = function () {
      P(T),
        P(J),
        (function () {
          var e = y + "/wrapper/v2/choice/reject-all",
            r = {
              hasCsp: "true",
              authId: d,
              accountId: f,
              env: "prod",
              includeCustomVendorsRes: "true",
              metadata: JSON.stringify(D),
              propertyId: l,
              withSiteActions: "true",
              ch: u,
              scriptVersion: s,
              scriptType: c,
            },
            o = [];
          for (var a in r)
            r.hasOwnProperty(a) &&
              o.push(encodeURIComponent(a) + "=" + encodeURIComponent(r[a]));
          var p = j(e + "?" + o.join("&"));
          (function (e) {
            e.gdpr.consentStatus.granularStatus,
              (t = e.gdpr.consentAllRef),
              (w = e.gdpr.gdprApplies);
            var r = Y(
                y +
                  "/wrapper/v2/choice/gdpr/13?hasCsp=true&env=prod&ch=" +
                  u +
                  "&scriptVersion=" +
                  s +
                  "&scriptType=" +
                  c
              ),
              o = {
                accountId: f,
                applies: w,
                authId: d,
                messageId: M,
                mmsDomain: y,
                propertyId: l,
                pubData: {},
                includeData: {
                  actions: { type: "RecordString" },
                  customVendorsResponse: { type: "RecordString" },
                },
                uuid: i,
                sampleRate: D.gdpr.sampleRate,
                sendPVData: te(),
              };
            (r.onreadystatechange = function () {
              if (4 === r.readyState && 200 === r.status) {
                var e = JSON.parse(r.responseText);
                W(
                  e.consentStatus,
                  e.uuid,
                  e.dateCreated,
                  e.euconsent,
                  e.grants,
                  e.categories
                );
              } else n.error("error:", r.responseText);
            }),
              r.send(JSON.stringify(o));
          })(JSON.parse(p)),
            P(J);
        })();
    }),
    (_sp_.consentStatus = function () {
      return I;
    }),
    (_sp_.getTcString = function () {
      return h;
    }),
    (_sp_.getQrCodeUrl = function () {
      return Z();
    }),
    (_sp_.getMessageData = function () {
      return ee();
    }),
    (_sp_.clearUserData = function () {
      return (
        $("authId"),
        $("consentUUID"),
        z("metaData_" + l),
        $("consentDate_" + l),
        z("consentStatus_" + l),
        z("euconsent-v2_" + l),
        z("localState_" + l),
        z("nonKeyedLocalState_" + l),
        z("vendorGrants_" + l),
        $("sp_su"),
        !0
      );
    }),
    (_sp_.updateConsentStatus = function () {
      P(T),
        P(J),
        (function () {
          if (null === I || !I.consentedAll) {
            var t = y + "/wrapper/v2/consent-status",
              n = {
                hasCsp: "true",
                accountId: f,
                env: "prod",
                localState: C,
                nonKeyedLocalState: R,
                metadata: JSON.stringify(D),
                propertyId: l,
                withSiteActions: "true",
                authId: d,
                ch: u,
                scriptVersion: s,
                scriptType: c,
              },
              r = JSON.parse(j(H(t, n)));
            void 0 !== _typeof(r.consentStatusData.gdpr) &&
              ((e = !0),
              W(
                r.consentStatusData.gdpr.consentStatus,
                r.consentStatusData.gdpr.consentUUID,
                r.consentStatusData.gdpr.dateCreated,
                r.consentStatusData.gdpr.euconsent,
                r.consentStatusData.gdpr.grants,
                r.consentStatusData.gdpr.categories
              ));
          }
        })(),
        K();
    }),
    _ || _sp_.executeMessaging(),
    V ||
      (function () {
        if (b) {
          var e = ee();
          !(function (e) {
            var t = document.getElementById(_sp_.config.qrId);
            if (t) {
              var n = new Date().getTime(),
                r = -1 === e.indexOf("?") ? "?" : "&";
              t.src = e + r + "t=" + n;
            }
          })(Z());
          for (
            var t = document.getElementsByClassName("all_vendor_count"), r = 0;
            r < t.length;
            r++
          )
            t[r].innerHTML = e.allVendorCount;
          var o = document.getElementsByClassName("iab_vendor_count");
          for (r = 0; r < o.length; r++) o[r].innerHTML = e.iabVendorCount;
          var a = document.getElementById("stack_template");
          if (!a)
            return void n.error("Template with ID 'stack_template' not found.");
          for (
            var s = a.innerHTML,
              c = document.getElementsByClassName("sp_stacks"),
              i = document.getElementsByClassName("sp_purposes"),
              p = document.createDocumentFragment(),
              d = document.createDocumentFragment(),
              u = 0;
            u < e.categories.length;
            u++
          ) {
            var g = e.categories[u],
              l = s;
            l = l
              .replace("{name}", g.name || "")
              .replace("{description}", g.description || "");
            var f = document.createElement("div");
            for (f.innerHTML = l; f.firstChild; )
              "IAB_STACK" === g.type
                ? p.appendChild(f.firstChild)
                : "IAB_PURPOSE" === g.type && d.appendChild(f.firstChild);
          }
          for (var m = 0; m < c.length; m++) c[m].appendChild(p.cloneNode(!0));
          for (m = 0; m < i.length; m++) i[m].appendChild(d.cloneNode(!0));
          (V = !0), L("onMessageComposed");
        }
      })();
})();
