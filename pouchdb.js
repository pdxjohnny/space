//    PouchDB 3.1.0
//
//    (c) 2012-2014 Dale Harvey and the PouchDB team
//    PouchDB may be freely distributed under the Apache license, version 2.0.
//    For all details and documentation:
//    http://pouchdb.com
! function(e) {
  if ("object" == typeof exports) module.exports = e();
  else if ("function" == typeof define && define.amd) define(e);
  else {
    var t;
    "undefined" != typeof window ? t = window : "undefined" != typeof global ? t = global : "undefined" != typeof self && (t = self), t.PouchDB = e()
  }
}(function() {
  var define, module, exports;
  return function e(t, n, r) {
    function o(s, a) {
      if (!n[s]) {
        if (!t[s]) {
          var u = "function" == typeof require && require;
          if (!a && u) return u(s, !0);
          if (i) return i(s, !0);
          throw new Error("Cannot find module '" + s + "'")
        }
        var c = n[s] = {
          exports: {}
        };
        t[s][0].call(c.exports, function(e) {
          var n = t[s][1][e];
          return o(n ? n : e)
        }, c, c.exports, e, t, n, r)
      }
      return n[s].exports
    }
    for (var i = "function" == typeof require && require, s = 0; s < r.length; s++) o(r[s]);
    return o
  }({
    1: [function(e, t) {
      "use strict";

      function n(e, t) {
        for (var n = 0; n < e.length; n++)
          if (t(e[n], n) === !0) return e[n];
        return !1
      }

      function r(e) {
        return function(t, n) {
          t || n[0] && n[0].error ? e(t || n[0]) : e(null, n.length ? n[0] : n)
        }
      }

      function o(e) {
        var t = {},
          n = [];
        return u.traverseRevTree(e, function(e, r, o, i) {
          var s = r + "-" + o;
          return e && (t[s] = 0), void 0 !== i && n.push({
            from: i,
            to: s
          }), s
        }), n.reverse(), n.forEach(function(e) {
          t[e.from] = void 0 === t[e.from] ? 1 + t[e.to] : Math.min(t[e.from], 1 + t[e.to])
        }), t
      }

      function i(e, t, n) {
        var r = "limit" in t ? t.keys.slice(t.skip, t.limit + t.skip) : t.skip > 0 ? t.keys.slice(t.skip) : t.keys;
        if (t.descending && r.reverse(), !r.length) return e._allDocs({
          limit: 0
        }, n);
        var o = {
          offset: t.skip
        };
        return p.all(r.map(function(n) {
          var r = a.extend(!0, {
            key: n,
            deleted: "ok"
          }, t);
          return ["limit", "skip", "keys"].forEach(function(e) {
            delete r[e]
          }), new p(function(t, i) {
            e._allDocs(r, function(e, r) {
              return e ? i(e) : (o.total_rows = r.total_rows, void t(r.rows[0] || {
                key: n,
                error: "not_found"
              }))
            })
          })
        })).then(function(e) {
          return o.rows = e, o
        })
      }

      function s() {
        var e = this;
        l.call(this), e.autoCompact = function(t) {
          return e.auto_compaction && "http" !== e.type() ? function(n, r) {
            if (n) t(n);
            else {
              var o = r.length,
                i = function() {
                  o--, o || t(null, r)
                };
              if (!r.length) return t(null, r);
              r.forEach(function(t) {
                t.ok && t.id ? e.compactDocument(t.id, 0, i) : i()
              })
            }
          } : t
        };
        var t, n = 0,
          r = ["change", "delete", "create", "update"];
        this.on("newListener", function(o) {
          if (~r.indexOf(o)) {
            if (n) return void n++;
            n++;
            var i = 0;
            t = this.changes({
              conflicts: !0,
              include_docs: !0,
              continuous: !0,
              since: "now",
              onChange: function(t) {
                t.seq <= i || (i = t.seq, e.emit("change", t), t.doc._deleted ? e.emit("delete", t) : "1" === t.doc._rev.split("-")[0] ? e.emit("create", t) : e.emit("update", t))
              }
            })
          }
        }), this.on("removeListener", function(e) {
          ~r.indexOf(e) && (n--, n || t.cancel())
        })
      }
      var a = e("./utils"),
        u = e("./merge"),
        c = e("./deps/errors"),
        l = e("events").EventEmitter,
        f = e("./deps/upsert"),
        d = e("./changes"),
        p = a.Promise;
      a.inherits(s, l), t.exports = s, s.prototype.post = a.adapterFun("post", function(e, t, n) {
        return "function" == typeof t && (n = t, t = {}), "object" != typeof e || Array.isArray(e) ? n(c.NOT_AN_OBJECT) : void this.bulkDocs({
          docs: [e]
        }, t, this.autoCompact(r(n)))
      }), s.prototype.put = a.adapterFun("put", a.getArguments(function(e) {
        var t, n, o, i, s = e.shift(),
          u = "_id" in s;
        if ("object" != typeof s || Array.isArray(s)) return (i = e.pop())(c.NOT_AN_OBJECT);
        for (s = a.clone(s);;)
          if (t = e.shift(), n = typeof t, "string" !== n || u ? "string" !== n || !u || "_rev" in s ? "object" === n ? o = t : "function" === n && (i = t) : s._rev = t : (s._id = t, u = !0), !e.length) break;
        o = o || {};
        var l = a.invalidIdError(s._id);
        return l ? i(l) : a.isLocalId(s._id) && "function" == typeof this._putLocal ? s._deleted ? this._removeLocal(s, i) : this._putLocal(s, i) : void this.bulkDocs({
          docs: [s]
        }, o, this.autoCompact(r(i)))
      })), s.prototype.putAttachment = a.adapterFun("putAttachment", function(e, t, n, r, o, i) {
        function s(e) {
          return e._attachments = e._attachments || {}, e._attachments[t] = {
            content_type: o,
            data: r
          }, a.put(e)
        }
        var a = this;
        return "function" == typeof o && (i = o, o = r, r = n, n = null), "undefined" == typeof o && (o = r, r = n, n = null), a.get(e).then(function(e) {
          if (e._rev !== n) throw c.REV_CONFLICT;
          return s(e)
        }, function(t) {
          if (t.error === c.MISSING_DOC.error) return s({
            _id: e
          });
          throw t
        })
      }), s.prototype.removeAttachment = a.adapterFun("removeAttachment", function(e, t, n, r) {
        var o = this;
        o.get(e, function(e, i) {
          return e ? void r(e) : i._rev !== n ? void r(c.REV_CONFLICT) : i._attachments ? (delete i._attachments[t], 0 === Object.keys(i._attachments).length && delete i._attachments, void o.put(i, r)) : r()
        })
      }), s.prototype.remove = a.adapterFun("remove", function(e, t, n, o) {
        var i;
        "string" == typeof t ? (i = {
          _id: e,
          _rev: t
        }, "function" == typeof n && (o = n, n = {})) : (i = e, "function" == typeof t ? (o = t, n = {}) : (o = n, n = t)), n = a.clone(n || {}), n.was_delete = !0;
        var s = {
          _id: i._id,
          _rev: i._rev || n.rev
        };
        return s._deleted = !0, a.isLocalId(s._id) && "function" == typeof this._removeLocal ? this._removeLocal(i, o) : void this.bulkDocs({
          docs: [s]
        }, n, r(o))
      }), s.prototype.revsDiff = a.adapterFun("revsDiff", function(e, t, n) {
        function r(e, t) {
          c.has(e) || c.set(e, {
            missing: []
          }), c.get(e).missing.push(t)
        }

        function o(t, n) {
          var o = e[t].slice(0);
          u.traverseRevTree(n, function(e, n, i, s, a) {
            var u = n + "-" + i,
              c = o.indexOf(u); - 1 !== c && (o.splice(c, 1), "available" !== a.status && r(t, u))
          }), o.forEach(function(e) {
            r(t, e)
          })
        }
        "function" == typeof t && (n = t, t = {}), t = a.clone(t);
        var i = Object.keys(e);
        if (!i.length) return n(null, {});
        var s = 0,
          c = new a.Map;
        i.map(function(t) {
          this._getRevisionTree(t, function(r, a) {
            if (r && 404 === r.status && "missing" === r.message) c.set(t, {
              missing: e[t]
            });
            else {
              if (r) return n(r);
              o(t, a)
            }
            if (++s === i.length) {
              var u = {};
              return c.forEach(function(e, t) {
                u[t] = e
              }), n(null, u)
            }
          })
        }, this)
      }), s.prototype.compactDocument = a.adapterFun("compactDocument", function(e, t, n) {
        var r = this;
        this._getRevisionTree(e, function(i, s) {
          if (i) return n(i);
          var a = o(s),
            c = [],
            l = [];
          Object.keys(a).forEach(function(e) {
            a[e] > t && c.push(e)
          }), u.traverseRevTree(s, function(e, t, n, r, o) {
            var i = t + "-" + n;
            "available" === o.status && -1 !== c.indexOf(i) && l.push(i)
          }), r._doCompaction(e, l, n)
        })
      }), s.prototype.compact = a.adapterFun("compact", function(e, t) {
        "function" == typeof e && (t = e, e = {});
        var n = this;
        e = a.clone(e || {}), n.get("_local/compaction")["catch"](function() {
          return !1
        }).then(function(r) {
          return "function" == typeof n._compact ? (r && r.last_seq && (e.last_seq = r.last_seq), n._compact(e, t)) : void 0
        })
      }), s.prototype._compact = function(e, t) {
        function n() {
          f(c, "_local/compaction", function(e) {
            return !e.last_seq || e.last_seq < i ? (e.last_seq = i, e) : !1
          }, t)
        }

        function r() {
          a--, !a && s && n()
        }

        function o(e) {
          a++, c.compactDocument(e.id, 0).then(r, t)
        }
        var i, s = !1,
          a = 0,
          u = {
            returnDocs: !1
          },
          c = this;
        e.last_seq && (u.since = e.last_seq), c.changes(u).on("change", o).on("complete", function(e) {
          s = !0, i = e.last_seq, a || n()
        }).on("error", t)
      }, s.prototype.get = a.adapterFun("get", function(e, t, r) {
        function o() {
          var n = [],
            o = i.length;
          return o ? void i.forEach(function(i) {
            s.get(e, {
              rev: i,
              revs: t.revs,
              attachments: t.attachments
            }, function(e, t) {
              n.push(e ? {
                missing: i
              } : {
                ok: t
              }), o--, o || r(null, n)
            })
          }) : r(null, n)
        }
        if ("function" == typeof t && (r = t, t = {}), "string" != typeof e) return r(c.INVALID_ID);
        if (a.isLocalId(e) && "function" == typeof this._getLocal) return this._getLocal(e, r);
        var i = [],
          s = this;
        if (!t.open_revs) return this._get(e, t, function(e, o) {
          if (t = a.clone(t), e) return r(e);
          var i = o.doc;
          if (!i) return r(new Error("no doc!"));
          var c = o.metadata,
            l = o.ctx;
          if (t.conflicts) {
            var f = u.collectConflicts(c);
            f.length && (i._conflicts = f)
          }
          if (t.revs || t.revs_info) {
            var d = u.rootToLeaf(c.rev_tree),
              p = n(d, function(e) {
                return -1 !== e.ids.map(function(e) {
                  return e.id
                }).indexOf(i._rev.split("-")[1])
              }),
              h = p.ids.map(function(e) {
                return e.id
              }).indexOf(i._rev.split("-")[1]) + 1,
              v = p.ids.length - h;
            if (p.ids.splice(h, v), p.ids.reverse(), t.revs && (i._revisions = {
                start: p.pos + p.ids.length - 1,
                ids: p.ids.map(function(e) {
                  return e.id
                })
              }), t.revs_info) {
              var m = p.pos + p.ids.length;
              i._revs_info = p.ids.map(function(e) {
                return m--, {
                  rev: m + "-" + e.id,
                  status: e.opts.status
                }
              })
            }
          }
          if (t.local_seq && (i._local_seq = o.metadata.seq), t.attachments && i._attachments) {
            var _ = i._attachments,
              g = Object.keys(_).length;
            if (0 === g) return r(null, i);
            Object.keys(_).forEach(function(e) {
              this._getAttachment(_[e], {
                encode: !0,
                ctx: l
              }, function(t, n) {
                var o = i._attachments[e];
                o.data = n, delete o.stub, delete o.length, --g || r(null, i)
              })
            }, s)
          } else {
            if (i._attachments)
              for (var y in i._attachments) i._attachments.hasOwnProperty(y) && (i._attachments[y].stub = !0);
            r(null, i)
          }
        });
        if ("all" === t.open_revs) this._getRevisionTree(e, function(e, t) {
          e && (t = []), i = u.collectLeaves(t).map(function(e) {
            return e.rev
          }), o()
        });
        else {
          if (!Array.isArray(t.open_revs)) return r(c.error(c.UNKNOWN_ERROR, "function_clause"));
          i = t.open_revs;
          for (var l = 0; l < i.length; l++) {
            var f = i[l];
            if ("string" != typeof f || !/^\d+-/.test(f)) return r(c.error(c.BAD_REQUEST, "Invalid rev format"))
          }
          o()
        }
      }), s.prototype.getAttachment = a.adapterFun("getAttachment", function(e, t, n, r) {
        var o = this;
        n instanceof Function && (r = n, n = {}), n = a.clone(n), this._get(e, n, function(e, i) {
          return e ? r(e) : i.doc._attachments && i.doc._attachments[t] ? (n.ctx = i.ctx, void o._getAttachment(i.doc._attachments[t], n, r)) : r(c.MISSING_DOC)
        })
      }), s.prototype.allDocs = a.adapterFun("allDocs", function(e, t) {
        if ("function" == typeof e && (t = e, e = {}), e = a.clone(e), e.skip = "undefined" != typeof e.skip ? e.skip : 0, "keys" in e) {
          if (!Array.isArray(e.keys)) return t(new TypeError("options.keys must be an array"));
          var n = ["startkey", "endkey", "key"].filter(function(t) {
            return t in e
          })[0];
          if (n) return void t(c.error(c.QUERY_PARSE_ERROR, "Query parameter `" + n + "` is not compatible with multi-get"));
          if ("http" !== this.type()) return i(this, e, t)
        }
        return this._allDocs(e, t)
      }), s.prototype.changes = function(e, t) {
        return "function" == typeof e && (t = e, e = {}), new d(this, e, t)
      }, s.prototype.close = a.adapterFun("close", function(e) {
        return this._closed = !0, this._close(e)
      }), s.prototype.info = a.adapterFun("info", function(e) {
        var t = this;
        this._info(function(n, r) {
          return n ? e(n) : (r.db_name = r.db_name || t._db_name, r.auto_compaction = !(!t._auto_compaction || "http" === t.type()), void e(null, r))
        })
      }), s.prototype.id = a.adapterFun("id", function(e) {
        return this._id(e)
      }), s.prototype.type = function() {
        return "function" == typeof this._type ? this._type() : this.adapter
      }, s.prototype.bulkDocs = a.adapterFun("bulkDocs", function(e, t, n) {
        if ("function" == typeof t && (n = t, t = {}), t = a.clone(t), Array.isArray(e) && (e = {
            docs: e
          }), !e || !e.docs || !Array.isArray(e.docs)) return n(c.MISSING_BULK_DOCS);
        for (var r = 0; r < e.docs.length; ++r)
          if ("object" != typeof e.docs[r] || Array.isArray(e.docs[r])) return n(c.NOT_AN_OBJECT);
        return e = a.clone(e), "new_edits" in t || (t.new_edits = "new_edits" in e ? e.new_edits : !0), t.new_edits || "http" === this.type() || e.docs.sort(function(e, t) {
          var n = a.compare(e._id, t._id);
          if (0 !== n) return n;
          var r = e._revisions ? e._revisions.start : 0,
            o = t._revisions ? t._revisions.start : 0;
          return a.compare(r, o)
        }), this._bulkDocs(e, t, this.autoCompact(function(e, r) {
          return e ? n(e) : (t.new_edits || (r = r.filter(function(e) {
            return e.error
          })), void n(null, r))
        }))
      }), s.prototype.registerDependentDatabase = a.adapterFun("registerDependentDatabase", function(e, t) {
        function n(t) {
          return t.dependentDbs = t.dependentDbs || {}, t.dependentDbs[e] ? !1 : (t.dependentDbs[e] = !0, t)
        }
        var r = {};
        this.__opts.db && (r.db = this.__opts.db), this._adapter && (r.adapter = this._adapter);
        var o = new this.constructor(e, r);
        f(this, "_local/_pouch_dependentDbs", n, function(e) {
          return e ? t(e) : t(null, {
            db: o
          })
        })
      })
    }, {
      "./changes": 6,
      "./deps/errors": 12,
      "./deps/upsert": 16,
      "./merge": 21,
      "./utils": 26,
      events: 30
    }],
    2: [function(e, t) {
      (function(n) {
        "use strict";

        function r(e) {
          return /^_(design|local)/.test(e) ? e : encodeURIComponent(e)
        }

        function o(e) {
          return e._attachments && Object.keys(e._attachments) ? l.Promise.all(Object.keys(e._attachments).map(function(t) {
            var r = e._attachments[t];
            if (r.data && "string" != typeof r.data) {
              if (void 0 === typeof n || n.browser) return new l.Promise(function(e) {
                l.readAsBinaryString(r.data, function(t) {
                  r.data = l.btoa(t), e()
                })
              });
              r.data = r.data.toString("base64")
            }
          })) : l.Promise.resolve()
        }

        function i(e, t) {
          if (/http(s?):/.test(e)) {
            var n = l.parseUri(e);
            n.remote = !0, (n.user || n.password) && (n.auth = {
              username: n.user,
              password: n.password
            });
            var r = n.path.replace(/(^\/|\/$)/g, "").split("/");
            if (n.db = r.pop(), n.path = r.join("/"), t = t || {}, t = l.clone(t), n.headers = t.headers || {}, t.auth || n.auth) {
              var o = t.auth || n.auth,
                i = l.btoa(o.username + ":" + o.password);
              n.headers.Authorization = "Basic " + i
            }
            return t.headers && (n.headers = t.headers), n
          }
          return {
            host: "",
            path: "/",
            db: e,
            auth: !1
          }
        }

        function s(e, t) {
          return a(e, e.db + "/" + t)
        }

        function a(e, t) {
          if (e.remote) {
            var n = e.path ? "/" : "";
            return e.protocol + "://" + e.host + ":" + e.port + "/" + e.path + n + t
          }
          return "/" + t
        }

        function u(e, t) {
          function n(e, t) {
            return l.ajax(l.extend({}, v, e), t)
          }

          function u(e) {
            return e.split("/").map(encodeURIComponent).join("/")
          }
          var d = this;
          d.getHost = e.getHost ? e.getHost : i;
          var p = d.getHost(e.name, e),
            h = s(p, "");
          d.getUrl = function() {
            return h
          }, d.getHeaders = function() {
            return l.clone(p.headers)
          };
          var v = e.ajax || {};
          e = l.clone(e);
          var m = function() {
            n({
              headers: p.headers,
              method: "PUT",
              url: h
            }, function(e) {
              e && 401 === e.status ? n({
                headers: p.headers,
                method: "HEAD",
                url: h
              }, function(e) {
                e ? t(e) : t(null, d)
              }) : e && 412 !== e.status ? t(e) : t(null, d)
            })
          };
          e.skipSetup || n({
            headers: p.headers,
            method: "GET",
            url: h
          }, function(e) {
            e ? 404 === e.status ? (l.explain404("PouchDB is just detecting if the remote DB exists."), m()) : t(e) : t(null, d)
          }), d.type = function() {
            return "http"
          }, d.id = l.adapterFun("id", function(e) {
            n({
              headers: p.headers,
              method: "GET",
              url: a(p, "")
            }, function(t, n) {
              var r = n && n.uuid ? n.uuid + p.db : s(p, "");
              e(null, r)
            })
          }), d.request = l.adapterFun("request", function(e, t) {
            e.headers = p.headers, e.url = s(p, e.url), n(e, t)
          }), d.compact = l.adapterFun("compact", function(e, t) {
            "function" == typeof e && (t = e, e = {}), e = l.clone(e), n({
              headers: p.headers,
              url: s(p, "_compact"),
              method: "POST"
            }, function() {
              function n() {
                d.info(function(r, o) {
                  o.compact_running ? setTimeout(n, e.interval || 200) : t()
                })
              }
              "function" == typeof t && n()
            })
          }), d._info = function(e) {
            n({
              headers: p.headers,
              method: "GET",
              url: s(p, "")
            }, function(t, n) {
              t ? e(t) : (n.host = s(p, ""), e(null, n))
            })
          }, d.get = l.adapterFun("get", function(e, t, o) {
            "function" == typeof t && (o = t, t = {}), t = l.clone(t), void 0 === t.auto_encode && (t.auto_encode = !0);
            var i = [];
            t.revs && i.push("revs=true"), t.revs_info && i.push("revs_info=true"), t.local_seq && i.push("local_seq=true"), t.open_revs && ("all" !== t.open_revs && (t.open_revs = JSON.stringify(t.open_revs)), i.push("open_revs=" + t.open_revs)), t.attachments && i.push("attachments=true"), t.rev && i.push("rev=" + t.rev), t.conflicts && i.push("conflicts=" + t.conflicts), i = i.join("&"), i = "" === i ? "" : "?" + i, t.auto_encode && (e = r(e));
            var a = {
                headers: p.headers,
                method: "GET",
                url: s(p, e + i)
              },
              u = e.split("/");
            (u.length > 1 && "_design" !== u[0] && "_local" !== u[0] || u.length > 2 && "_design" === u[0] && "_local" !== u[0]) && (a.binary = !0), n(a, function(e, t, n) {
              return e ? o(e) : void o(null, t, n)
            })
          }), d.remove = l.adapterFun("remove", function(e, t, o, i) {
            var a;
            "string" == typeof t ? (a = {
              _id: e,
              _rev: t
            }, "function" == typeof o && (i = o, o = {})) : (a = e, "function" == typeof t ? (i = t, o = {}) : (i = o, o = t));
            var u = a._rev || o.rev;
            n({
              headers: p.headers,
              method: "DELETE",
              url: s(p, r(a._id)) + "?rev=" + u
            }, i)
          }), d.getAttachment = l.adapterFun("getAttachment", function(e, t, n, o) {
            "function" == typeof n && (o = n, n = {}), n = l.clone(n), void 0 === n.auto_encode && (n.auto_encode = !0), n.auto_encode && (e = r(e)), n.auto_encode = !1, d.get(e + "/" + u(t), n, o)
          }), d.removeAttachment = l.adapterFun("removeAttachment", function(e, t, o, i) {
            var a = s(p, r(e) + "/" + u(t)) + "?rev=" + o;
            n({
              headers: p.headers,
              method: "DELETE",
              url: a
            }, i)
          }), d.putAttachment = l.adapterFun("putAttachment", function(e, t, o, i, a, c) {
            "function" == typeof a && (c = a, a = i, i = o, o = null), "undefined" == typeof a && (a = i, i = o, o = null);
            var d = r(e) + "/" + u(t),
              h = s(p, d);
            if (o && (h += "?rev=" + o), "string" == typeof i) try {
              i = l.atob(i)
            } catch (v) {
              return c(l.extend({}, f.BAD_ARG, {
                reason: "Attachments need to be base64 encoded"
              }))
            }
            var m = {
              headers: l.clone(p.headers),
              method: "PUT",
              url: h,
              processData: !1,
              body: i,
              timeout: 6e4
            };
            m.headers["Content-Type"] = a, n(m, c)
          }), d.put = l.adapterFun("put", l.getArguments(function(e) {
            var t, i, a, u = e.shift(),
              c = "_id" in u,
              d = e.pop();
            return "object" != typeof u || Array.isArray(u) ? d(f.NOT_AN_OBJECT) : (u = l.clone(u), void o(u).then(function() {
              for (;;)
                if (t = e.shift(), i = typeof t, "string" !== i || c ? "string" !== i || !c || "_rev" in u ? "object" === i && (a = l.clone(t)) : u._rev = t : (u._id = t, c = !0), !e.length) break;
              a = a || {};
              var o = l.invalidIdError(u._id);
              if (o) throw o;
              var f = [];
              a && "undefined" != typeof a.new_edits && f.push("new_edits=" + a.new_edits), f = f.join("&"), "" !== f && (f = "?" + f), n({
                headers: p.headers,
                method: "PUT",
                url: s(p, r(u._id)) + f,
                body: u
              }, function(e, t) {
                return e ? d(e) : (t.ok = !0, void d(null, t))
              })
            })["catch"](d))
          })), d.post = l.adapterFun("post", function(e, t, n) {
            return "function" == typeof t && (n = t, t = {}), t = l.clone(t), "object" != typeof e ? n(f.NOT_AN_OBJECT) : ("_id" in e || (e._id = l.uuid()), void d.put(e, t, function(e, t) {
              return e ? n(e) : (t.ok = !0, void n(null, t))
            }))
          }), d._bulkDocs = function(e, t, r) {
            "undefined" != typeof t.new_edits && (e.new_edits = t.new_edits), l.Promise.all(e.docs.map(o)).then(function() {
              n({
                headers: p.headers,
                method: "POST",
                url: s(p, "_bulk_docs"),
                body: e
              }, function(e, t) {
                return e ? r(e) : (t.forEach(function(e) {
                  e.ok = !0
                }), void r(null, t))
              })
            })["catch"](r)
          }, d.allDocs = l.adapterFun("allDocs", function(e, t) {
            "function" == typeof e && (t = e, e = {}), e = l.clone(e);
            var r, o = [],
              i = "GET";
            if (e.conflicts && o.push("conflicts=true"), e.descending && o.push("descending=true"), e.include_docs && o.push("include_docs=true"), e.key && o.push("key=" + encodeURIComponent(JSON.stringify(e.key))), e.startkey && o.push("startkey=" + encodeURIComponent(JSON.stringify(e.startkey))), e.endkey && o.push("endkey=" + encodeURIComponent(JSON.stringify(e.endkey))), "undefined" != typeof e.inclusive_end && o.push("inclusive_end=" + !!e.inclusive_end), "undefined" != typeof e.limit && o.push("limit=" + e.limit), "undefined" != typeof e.skip && o.push("skip=" + e.skip), o = o.join("&"), "" !== o && (o = "?" + o), "undefined" != typeof e.keys) {
              var a = 2e3,
                u = "keys=" + encodeURIComponent(JSON.stringify(e.keys));
              u.length + o.length + 1 <= a ? o += (-1 !== o.indexOf("?") ? "&" : "?") + u : (i = "POST", r = JSON.stringify({
                keys: e.keys
              }))
            }
            n({
              headers: p.headers,
              method: i,
              url: s(p, "_all_docs" + o),
              body: r
            }, t)
          }), d._changes = function(e) {
            var t = "batch_size" in e ? e.batch_size : c;
            e = l.clone(e), e.timeout = e.timeout || 3e4;
            var r = {
                timeout: e.timeout - 5e3
              },
              o = "undefined" != typeof e.limit ? e.limit : !1;
            0 === o && (o = 1);
            var i;
            i = "returnDocs" in e ? e.returnDocs : !0;
            var a = o;
            if (e.style && (r.style = e.style), (e.include_docs || e.filter && "function" == typeof e.filter) && (r.include_docs = !0), e.continuous && (r.feed = "longpoll"), e.conflicts && (r.conflicts = !0), e.descending && (r.descending = !0), e.filter && "string" == typeof e.filter && (r.filter = e.filter, "_view" === e.filter && e.view && "string" == typeof e.view && (r.view = e.view)), e.query_params && "object" == typeof e.query_params)
              for (var u in e.query_params) e.query_params.hasOwnProperty(u) && (r[u] = e.query_params[u]);
            if (e.continuous && d._useSSE) return d.sse(e, r, i);
            var h, v, m = function(i, u) {
                if (!e.aborted) {
                  r.since = i, e.descending ? o && (r.limit = a) : r.limit = !o || a > t ? t : a;
                  var c = "?" + Object.keys(r).map(function(e) {
                      return e + "=" + r[e]
                    }).join("&"),
                    l = {
                      headers: p.headers,
                      method: "GET",
                      url: s(p, "_changes" + c),
                      timeout: e.timeout
                    };
                  v = i, e.aborted || (h = n(l, u))
                }
              },
              _ = 10,
              g = 0,
              y = {
                results: []
              },
              b = function(n, r) {
                if (!e.aborted) {
                  var s = 0;
                  if (r && r.results) {
                    s = r.results.length, y.last_seq = r.last_seq;
                    var u = {};
                    u.query = e.query_params, r.results = r.results.filter(function(t) {
                      a--;
                      var n = l.filterChange(e)(t);
                      return n && (i && y.results.push(t), l.call(e.onChange, t)), n
                    })
                  } else if (n) return e.aborted = !0, void l.call(e.complete, n);
                  r && r.last_seq && (v = r.last_seq);
                  var c = o && 0 >= a || r && t > s || e.descending;
                  if ((!e.continuous || o && 0 >= a) && c) l.call(e.complete, null, y);
                  else {
                    n ? g += 1 : g = 0;
                    var d = 1 << g,
                      p = _ * d,
                      h = e.maximumWait || 3e4;
                    if (p > h) return void l.call(e.complete, n || f.UNKNOWN_ERROR);
                    setTimeout(function() {
                      m(v, b)
                    }, p)
                  }
                }
              };
            return m(e.since || 0, b), {
              cancel: function() {
                e.aborted = !0, h && h.abort()
              }
            }
          }, d.sse = function(e, t, n) {
            function r(t) {
              var r = JSON.parse(t.data);
              n && c.results.push(r), c.last_seq = r.seq, l.call(e.onChange, r)
            }

            function o(t) {
              return u.removeEventListener("message", r, !1), h === !1 ? (d._useSSE = !1, void(f = d._changes(e))) : (u.close(), void l.call(e.complete, t))
            }
            t.feed = "eventsource", t.since = e.since || 0, t.limit = e.limit, delete t.timeout;
            var i = "?" + Object.keys(t).map(function(e) {
                return e + "=" + t[e]
              }).join("&"),
              a = s(p, "_changes" + i),
              u = new EventSource(a),
              c = {
                results: [],
                last_seq: !1
              },
              f = !1,
              h = !1;
            return u.addEventListener("message", r, !1), u.onopen = function() {
              h = !0
            }, u.onerror = o, {
              cancel: function() {
                return f ? f.cancel() : (u.removeEventListener("message", r, !1), void u.close())
              }
            }
          }, d._useSSE = !1, d.revsDiff = l.adapterFun("revsDiff", function(e, t, r) {
            "function" == typeof t && (r = t, t = {}), n({
              headers: p.headers,
              method: "POST",
              url: s(p, "_revs_diff"),
              body: JSON.stringify(e)
            }, r)
          }), d._close = function(e) {
            e()
          }, d.destroy = l.adapterFun("destroy", function(e) {
            n({
              url: s(p, ""),
              method: "DELETE",
              headers: p.headers
            }, function(t, n) {
              t ? (d.emit("error", t), e(t)) : (d.emit("destroyed"), e(null, n))
            })
          })
        }
        var c = 25,
          l = e("../utils"),
          f = e("../deps/errors");
        u.destroy = l.toPromise(function(e, t, n) {
          var r = i(e, t);
          t = t || {}, "function" == typeof t && (n = t, t = {}), t = l.clone(t), t.headers = r.headers, t.method = "DELETE", t.url = s(r, "");
          var o = t.ajax || {};
          t = l.extend({}, t, o), l.ajax(t, n)
        }), u.valid = function() {
          return !0
        }, t.exports = u
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
    }, {
      "../deps/errors": 12,
      "../utils": 26,
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31
    }],
    3: [function(e, t) {
      (function(n, r) {
        "use strict";

        function o(e, t, n) {
          try {
            e.apply(t, n)
          } catch (r) {
            window.PouchDB && window.PouchDB.emit("error", r)
          }
        }

        function i() {
          if (!_.running && _.queue.length) {
            _.running = !0;
            var e = _.queue.shift();
            e.action(function(t, r) {
              o(e.callback, this, [t, r]), _.running = !1, n.nextTick(i)
            })
          }
        }

        function s(e) {
          return function(t) {
            var n = t.target && t.target.error && t.target.error.name || t.target;
            e(h.error(h.IDB_ERROR, n, t.type))
          }
        }

        function a(e, t, n) {
          var r = {
            data: v.stringify(e)
          };
          return r.winningRev = t, r.deletedOrLocal = n ? "1" : "0", r.id = e.id, r
        }

        function u(e) {
          if (!e) return null;
          if (!e.data) return e;
          var t = v.parse(e.data);
          return t.winningRev = e.winningRev, t.deletedOrLocal = "1" === e.deletedOrLocal, t
        }

        function c(e, t) {
          var n = this;
          _.queue.push({
            action: function(t) {
              l(n, e, t)
            },
            callback: t
          }), i()
        }

        function l(e, t, o) {
          function i(e) {
            var t = e.createObjectStore(E, {
              keyPath: "id"
            });
            t.createIndex("seq", "seq", {
              unique: !0
            }), e.createObjectStore(S, {
              autoIncrement: !0
            }).createIndex("_doc_id_rev", "_doc_id_rev", {
              unique: !0
            }), e.createObjectStore(k, {
              keyPath: "digest"
            }), e.createObjectStore(x, {
              keyPath: "id",
              autoIncrement: !1
            }), e.createObjectStore(A), t.createIndex("deletedOrLocal", "deletedOrLocal", {
              unique: !1
            }), e.createObjectStore(T, {
              keyPath: "_id"
            }).createIndex("_doc_id_rev", "_doc_id_rev", {
              unique: !0
            });
            var n = e.createObjectStore(q, {
              autoIncrement: !0
            });
            n.createIndex("seq", "seq"), n.createIndex("digestSeq", "digestSeq", {
              unique: !0
            })
          }

          function l(e, t) {
            var n = e.objectStore(E);
            n.createIndex("deletedOrLocal", "deletedOrLocal", {
              unique: !1
            }), n.openCursor().onsuccess = function(e) {
              var r = e.target.result;
              if (r) {
                var o = r.value,
                  i = d.isDeleted(o);
                o.deletedOrLocal = i ? "1" : "0", n.put(o), r["continue"]()
              } else t()
            }
          }

          function f(e) {
            e.createObjectStore(T, {
              keyPath: "_id"
            }).createIndex("_doc_id_rev", "_doc_id_rev", {
              unique: !0
            })
          }

          function v(e, t) {
            var n = e.objectStore(T),
              o = e.objectStore(E),
              i = e.objectStore(S),
              s = o.openCursor();
            s.onsuccess = function(e) {
              var s = e.target.result;
              if (s) {
                var a = s.value,
                  u = a.id,
                  c = d.isLocalId(u),
                  l = p.winningRev(a);
                if (c) {
                  var f = u + "::" + l,
                    h = u + "::",
                    v = u + "::~",
                    m = i.index("_doc_id_rev"),
                    _ = r.IDBKeyRange.bound(h, v, !1, !1),
                    g = m.openCursor(_);
                  g.onsuccess = function(e) {
                    if (g = e.target.result) {
                      var t = g.value;
                      t._doc_id_rev === f && n.put(t), i["delete"](g.primaryKey), g["continue"]()
                    } else o["delete"](s.primaryKey), s["continue"]()
                  }
                } else s["continue"]()
              } else t && t()
            }
          }

          function _(e) {
            var t = e.createObjectStore(q, {
              autoIncrement: !0
            });
            t.createIndex("seq", "seq"), t.createIndex("digestSeq", "digestSeq", {
              unique: !0
            })
          }

          function g(e) {
            var t = e.objectStore(S),
              n = e.objectStore(k),
              r = e.objectStore(q),
              o = n.count();
            o.onsuccess = function(e) {
              var n = e.target.result;
              n && (t.openCursor().onsuccess = function(e) {
                var t = e.target.result;
                if (t) {
                  for (var n = t.value, o = t.primaryKey, i = Object.keys(n._attachments || {}), s = {}, a = 0; a < i.length; a++) {
                    var u = n._attachments[i[a]];
                    s[u.digest] = !0
                  }
                  var c = Object.keys(s);
                  for (a = 0; a < c.length; a++) {
                    var l = c[a];
                    r.put({
                      seq: o,
                      digestSeq: l + "::" + o
                    })
                  }
                  t["continue"]()
                }
              })
            }
          }

          function y(e, t, n) {
            var o = "startkey" in t ? t.startkey : !1,
              i = "endkey" in t ? t.endkey : !1,
              s = "key" in t ? t.key : !1,
              a = t.skip || 0,
              c = "number" == typeof t.limit ? t.limit : -1,
              l = t.inclusive_end !== !1,
              f = "descending" in t && t.descending ? "prev" : null,
              v = !1;
            f && o && i && (v = i, i = !1);
            var m = null;
            try {
              o && i ? m = r.IDBKeyRange.bound(o, i, !1, !l) : o ? m = f ? r.IDBKeyRange.upperBound(o) : r.IDBKeyRange.lowerBound(o) : i ? m = f ? r.IDBKeyRange.lowerBound(i, !l) : r.IDBKeyRange.upperBound(i, !l) : s && (m = r.IDBKeyRange.only(s))
            } catch (_) {
              return "DataError" === _.name && 0 === _.code ? n(null, {
                total_rows: e,
                offset: t.skip,
                rows: []
              }) : n(h.error(h.IDB_ERROR, _.name, _.message))
            }
            var g = C.transaction([E, S], "readonly");
            g.oncomplete = function() {
              n(null, {
                total_rows: e,
                offset: t.skip,
                rows: w
              })
            };
            var y = g.objectStore(E),
              b = f ? y.openCursor(m, f) : y.openCursor(m),
              w = [];
            b.onsuccess = function(e) {
              function n(e, n) {
                var o = {
                  id: e.id,
                  key: e.id,
                  value: {
                    rev: i
                  }
                };
                if (t.include_docs) {
                  o.doc = n, o.doc._rev = i, o.doc._doc_id_rev && delete o.doc._doc_id_rev, t.conflicts && (o.doc._conflicts = p.collectConflicts(e));
                  for (var s in o.doc._attachments) o.doc._attachments.hasOwnProperty(s) && (o.doc._attachments[s].stub = !0)
                }
                var u = d.isDeleted(e, i);
                if ("ok" === t.deleted) u && (o.value.deleted = !0, o.doc = null), w.push(o);
                else if (!u && a-- <= 0) {
                  if (v) {
                    if (l && o.key < v) return;
                    if (!l && o.key <= v) return
                  }
                  if (w.push(o), 0 === --c) return
                }
                r["continue"]()
              }
              if (e.target.result) {
                var r = e.target.result,
                  o = u(r.value),
                  i = o.winningRev || p.winningRev(o);
                if (t.include_docs) {
                  var s = g.objectStore(S).index("_doc_id_rev"),
                    f = o.id + "::" + i;
                  s.get(f).onsuccess = function(e) {
                    n(u(r.value), e.target.result)
                  }
                } else n(o)
              }
            }
          }

          function b(e) {
            if (-1 !== D) return e(null, D);
            var t, n = C.transaction([E], "readonly"),
              o = n.objectStore(E).index("deletedOrLocal");
            o.count(r.IDBKeyRange.only("0")).onsuccess = function(e) {
              t = e.target.result
            }, n.onerror = s(e), n.oncomplete = function() {
              D = t, e(null, D)
            }
          }
          var w = 4,
            E = "document-store",
            S = "by-sequence",
            k = "attach-store",
            q = "attach-seq-store",
            x = "meta-store",
            T = "local-store",
            A = "detect-blob-support",
            O = t.name,
            L = null,
            I = null,
            R = !1,
            C = null,
            D = -1;
          e.type = function() {
            return "idb"
          }, e._id = d.toPromise(function(e) {
            e(null, I)
          }), e._bulkDocs = function(t, n, r) {
            function o() {
              if (N.length) {
                var t = new d.Map;
                N.forEach(function(n, r) {
                  if (n._id && d.isLocalId(n._id)) return void e[n._deleted ? "_removeLocal" : "_putLocal"](n, {
                    ctx: F
                  }, function(e) {
                    B[r] = e ? e : {}
                  });
                  var o = n.metadata.id;
                  t.has(o) ? t.get(o).push([n, r]) : t.set(o, [
                    [n, r]
                  ])
                }), t.forEach(function(e, t) {
                  function n() {
                    ++o < e.length && r()
                  }

                  function r() {
                    var r = e[o],
                      i = r[0],
                      s = r[1];
                    M.has(t) ? y(M.get(t), i, s, n) : b(i, s, n)
                  }
                  var o = 0;
                  r()
                })
              }
            }

            function i(e) {
              function t() {
                ++n === N.length && e()
              }
              if (!N.length) return e();
              var n = 0;
              N.forEach(function(e) {
                if (e._id && d.isLocalId(e._id)) return t();
                var n = e.metadata.id,
                  r = F.objectStore(E).get(n);
                r.onsuccess = function(e) {
                  var r = u(e.target.result);
                  r && M.set(n, r), t()
                }
              })
            }

            function l() {
              if (!P) {
                var e = B.map(function(e) {
                  if (e._bulk_seq) delete e._bulk_seq;
                  else if (!Object.keys(e).length) return {
                    ok: !0
                  };
                  if (e.error) return e;
                  var t = e.metadata,
                    n = p.winningRev(t);
                  return {
                    ok: !0,
                    id: t.id,
                    rev: n
                  }
                });
                c.Changes.notify(O), D = -1, r(null, e)
              }
            }

            function f(e, t) {
              if (e.stub) return t();
              if ("string" == typeof e.data) {
                var n;
                try {
                  n = atob(e.data)
                } catch (o) {
                  var i = h.error(h.BAD_ARG, "Attachments need to be base64 encoded");
                  return r(i)
                }
                var s;
                if (L) {
                  var a = e.content_type;
                  n = d.fixBinary(n), s = n.byteLength, e.data = d.createBlob([n], {
                    type: a
                  })
                } else s = n.length;
                return void d.MD5(n).then(function(n) {
                  e.digest = "md5-" + n, e.length = s, t()
                })
              }
              d.readAsBinaryString(e.data, function(n) {
                L || (e.data = btoa(n)), d.MD5(n).then(function(r) {
                  e.digest = "md5-" + r, e.length = n.length, t()
                })
              })
            }

            function v(e, t) {
              var n = F.objectStore([k]).get(e);
              n.onsuccess = function(n) {
                if (n.target.result) t();
                else {
                  var r = new Error("unknown stub attachment with digest " + e);
                  r.status = 412, t(r)
                }
              }
            }

            function m(e) {
              function t() {
                ++o === n.length && e(r)
              }
              var n = [];
              if (N.forEach(function(e) {
                  e.data && e.data._attachments && Object.keys(e.data._attachments).forEach(function(t) {
                    var r = e.data._attachments[t];
                    r.stub && n.push(r.digest)
                  })
                }), !n.length) return e();
              var r, o = 0;
              n.forEach(function(e) {
                v(e, function(e) {
                  e && !r && (r = e), t()
                })
              })
            }

            function _(e) {
              function t() {
                n++, N.length === n && e()
              }
              if (!N.length) return e();
              var n = 0;
              N.forEach(function(e) {
                function n() {
                  o++, o === r.length && t()
                }
                var r = e.data && e.data._attachments ? Object.keys(e.data._attachments) : [];
                if (!r.length) return t();
                var o = 0;
                for (var i in e.data._attachments) e.data._attachments.hasOwnProperty(i) && f(e.data._attachments[i], n)
              })
            }

            function g(e, t, n, r, o) {
              function i(e) {
                l || (e ? (l = e, r(l)) : f === m.length && c())
              }

              function s(e) {
                f++, i(e)
              }

              function u(t, n) {
                function r() {
                  ++i === s.length && n()
                }

                function o(n) {
                  var o = e.data._attachments[n].digest,
                    i = F.objectStore(q).put({
                      seq: t,
                      digestSeq: o + "::" + t
                    });
                  i.onsuccess = r, i.onerror = function(e) {
                    e.preventDefault(), e.stopPropagation(), r()
                  }
                }
                var i = 0,
                  s = Object.keys(e.data._attachments || {});
                if (!s.length) return n();
                for (var a = 0; a < s.length; a++) o(s[a])
              }

              function c() {
                function i(i) {
                  var s = e.metadata,
                    c = i.target.result;
                  s.seq = c, delete s.rev;
                  var l = a(s, t, n),
                    f = F.objectStore(E).put(l);
                  f.onsuccess = function() {
                    delete s.deletedOrLocal, delete s.winningRev, B[o] = e, M.set(e.metadata.id, e.metadata), u(c, function() {
                      d.call(r)
                    })
                  }
                }
                e.data._doc_id_rev = v;
                var s = F.objectStore(S),
                  c = s.index("_doc_id_rev"),
                  l = s.put(e.data);
                l.onsuccess = i, l.onerror = function(t) {
                  t.preventDefault(), t.stopPropagation();
                  var n = c.getKey(e.data._doc_id_rev);
                  n.onsuccess = function(t) {
                    var n = s.put(e.data, t.target.result);
                    n.onsuccess = i
                  }
                }
              }
              var l = null,
                f = 0,
                p = e.data._id = e.metadata.id,
                h = e.data._rev = e.metadata.rev,
                v = p + "::" + h;
              n && (e.data._deleted = !0);
              var m = e.data._attachments ? Object.keys(e.data._attachments) : [];
              for (var _ in e.data._attachments)
                if (e.data._attachments[_].stub) f++, i();
                else {
                  var g = e.data._attachments[_].data;
                  delete e.data._attachments[_].data;
                  var y = e.data._attachments[_].digest;
                  A(y, g, s)
                }
              m.length || c()
            }

            function y(e, t, n, r) {
              if (d.revExists(e, t.metadata.rev)) return B[n] = t, void r();
              var o = p.merge(e.rev_tree, t.metadata.rev_tree[0], 1e3),
                i = d.isDeleted(e),
                s = d.isDeleted(t.metadata),
                a = i && s && I || !i && I && "new_leaf" !== o.conflicts || i && !s && "new_branch" === o.conflicts;
              if (a) return B[n] = w(h.REV_CONFLICT, t._bulk_seq), r();
              t.metadata.rev_tree = o.tree;
              var u = p.winningRev(t.metadata);
              s = d.isDeleted(t.metadata, u), g(t, u, s, r, n)
            }

            function b(e, t, r) {
              var o = p.winningRev(e.metadata),
                i = d.isDeleted(e.metadata, o);
              return "was_delete" in n && i ? (B[t] = h.MISSING_DOC, r()) : void g(e, o, i, r, t)
            }

            function w(e, t) {
              return e._bulk_seq = t, e
            }

            function A(e, t, n) {
              var r = F.objectStore(k);
              r.get(e).onsuccess = function(o) {
                var i = o.target.result;
                if (i) return d.call(n);
                var s = {
                  digest: e,
                  body: t
                };
                r.put(s).onsuccess = function() {
                  d.call(n)
                }
              }
            }
            var I = n.new_edits,
              R = t.docs,
              N = R.map(function(e, t) {
                if (e._id && d.isLocalId(e._id)) return e;
                var n = d.parseDoc(e, I);
                return n._bulk_seq = t, n
              }),
              j = N.filter(function(e) {
                return e.error
              });
            if (j.length) return r(j[0]);
            var F, B = new Array(N.length),
              M = new d.Map,
              P = !1;
            _(function() {
              var e = [E, S, k, x, T, q];
              F = C.transaction(e, "readwrite"), F.onerror = s(r), F.ontimeout = s(r), F.oncomplete = l, m(function(e) {
                return e ? (P = !0, r(e)) : void i(o)
              })
            })
          }, e._get = function(e, t, n) {
            function r() {
              n(s, {
                doc: o,
                metadata: i,
                ctx: a
              })
            }
            var o, i, s, a;
            t = d.clone(t), a = t.ctx ? t.ctx : C.transaction([E, S, k], "readonly"), a.objectStore(E).get(e).onsuccess = function(e) {
              if (i = u(e.target.result), !i) return s = h.MISSING_DOC, r();
              if (d.isDeleted(i) && !t.rev) return s = h.error(h.MISSING_DOC, "deleted"), r();
              var n = a.objectStore(S),
                c = t.rev || i.winningRev || p.winningRev(i),
                l = i.id + "::" + c;
              n.index("_doc_id_rev").get(l).onsuccess = function(e) {
                return o = e.target.result, o && o._doc_id_rev && delete o._doc_id_rev, o ? void r() : (s = h.MISSING_DOC, r())
              }
            }
          }, e._getAttachment = function(e, t, n) {
            var r;
            t = d.clone(t), r = t.ctx ? t.ctx : C.transaction([E, S, k], "readonly");
            var o = e.digest,
              i = e.content_type;
            r.objectStore(k).get(o).onsuccess = function(e) {
              var r = e.target.result.body;
              t.encode ? r ? "string" != typeof r ? d.readAsBinaryString(r, function(e) {
                n(null, btoa(e))
              }) : n(null, r) : n(null, "") : r ? "string" != typeof r ? n(null, r) : (r = d.fixBinary(atob(r)), n(null, d.createBlob([r], {
                type: i
              }))) : n(null, d.createBlob([""], {
                type: i
              }))
            }
          }, e._allDocs = function(e, t) {
            b(function(n, r) {
              return n ? t(n) : 0 === e.limit ? t(null, {
                total_rows: r,
                offset: e.skip,
                rows: []
              }) : void y(r, e, t)
            })
          }, e._info = function(e) {
            b(function(t, n) {
              if (t) return e(t);
              if (null === C) {
                var r = new Error("db isn't open");
                return r.id = "idbNull", e(r)
              }
              var o = 0,
                i = C.transaction([S], "readonly");
              i.objectStore(S).openCursor(null, "prev").onsuccess = function(e) {
                var t = e.target.result;
                o = t ? t.key : 0
              }, i.oncomplete = function() {
                e(null, {
                  doc_count: n,
                  update_seq: o
                })
              }
            })
          }, e._changes = function(t) {
            function n() {
              v = C.transaction([E, S], "readonly"), v.oncomplete = i;
              var e;
              e = a ? v.objectStore(S).openCursor(r.IDBKeyRange.lowerBound(t.since, !0), a) : v.objectStore(S).openCursor(r.IDBKeyRange.lowerBound(t.since, !0)), e.onsuccess = o, e.onerror = onerror
            }

            function o(e) {
              var n = e.target.result;
              if (n) {
                var r = n.value;
                if (t.doc_ids && -1 === t.doc_ids.indexOf(r._id)) return n["continue"]();
                var o = v.objectStore(E);
                o.get(r._id).onsuccess = function(e) {
                  var o = u(e.target.result);
                  l < o.seq && (l = o.seq);
                  var i = o.winningRev || p.winningRev(o);
                  if (r._rev !== i) return n["continue"]();
                  delete r._doc_id_rev;
                  var s = t.processChange(r, o, t);
                  s.seq = n.key, g(s) && (_++, h && m.push(s), t.onChange(s)), _ !== f && n["continue"]()
                }
              }
            }

            function i() {
              t.continuous || t.complete(null, {
                results: m,
                last_seq: l
              })
            }
            if (t = d.clone(t), t.continuous) {
              var s = O + ":" + d.uuid();
              return c.Changes.addListener(O, s, e, t), c.Changes.notify(O), {
                cancel: function() {
                  c.Changes.removeListener(O, s)
                }
              }
            }
            var a = t.descending ? "prev" : null,
              l = 0;
            t.since = t.since && !a ? t.since : 0;
            var f = "limit" in t ? t.limit : -1;
            0 === f && (f = 1);
            var h;
            h = "returnDocs" in t ? t.returnDocs : !0;
            var v, m = [],
              _ = 0,
              g = d.filterChange(t);
            n()
          }, e._close = function(e) {
            return null === C ? e(h.NOT_OPEN) : (C.close(), delete m[O], C = null, void e())
          }, e._getRevisionTree = function(e, t) {
            var n = C.transaction([E], "readonly"),
              r = n.objectStore(E).get(e);
            r.onsuccess = function(e) {
              var n = u(e.target.result);
              n ? t(null, n.rev_tree) : t(h.MISSING_DOC)
            }
          }, e._doCompaction = function(e, t, n) {
            function o() {
              v.length && v.forEach(function(e) {
                var t = h.index("digestSeq").count(r.IDBKeyRange.bound(e + "::", e + "::￿", !1, !1));
                t.onsuccess = function(t) {
                  var n = t.target.result;
                  n || f["delete"](e)
                }
              })
            }
            var i = C.transaction([E, S, k, q], "readwrite"),
              c = i.objectStore(E),
              l = i.objectStore(S),
              f = i.objectStore(k),
              h = i.objectStore(q),
              v = [];
            c.get(e).onsuccess = function(n) {
              var s = u(n.target.result);
              p.traverseRevTree(s.rev_tree, function(e, n, r, o, i) {
                var s = n + "-" + r; - 1 !== t.indexOf(s) && (i.status = "missing")
              });
              var c = t.length;
              t.forEach(function(t) {
                var n = l.index("_doc_id_rev"),
                  u = e + "::" + t;
                n.getKey(u).onsuccess = function(e) {
                  var t = e.target.result;
                  if ("number" == typeof t) {
                    l["delete"](t);
                    var n = h.index("seq").openCursor(r.IDBKeyRange.only(t));
                    n.onsuccess = function(e) {
                      var t = e.target.result;
                      if (t) {
                        var n = t.value.digestSeq.split("::")[0];
                        v.push(n), h["delete"](t.primaryKey), t["continue"]()
                      } else if (c--, !c) {
                        var r = s.winningRev || p.winningRev(s),
                          u = s.deletedOrLocal;
                        i.objectStore(E).put(a(s, r, u)), o()
                      }
                    }
                  }
                }
              })
            }, i.onerror = s(n), i.oncomplete = function() {
              d.call(n)
            }
          }, e._getLocal = function(e, t) {
            var n = C.transaction([T], "readonly"),
              r = n.objectStore(T).get(e);
            r.onerror = s(t), r.onsuccess = function(e) {
              var n = e.target.result;
              n ? (delete n._doc_id_rev, t(null, n)) : t(h.MISSING_DOC)
            }
          }, e._putLocal = function(e, t, n) {
            "function" == typeof t && (n = t, t = {}), delete e._revisions;
            var r = e._rev,
              o = e._id;
            e._rev = r ? "0-" + (parseInt(r.split("-")[1], 10) + 1) : "0-1", e._doc_id_rev = o + "::" + e._rev;
            var i, a = t.ctx;
            a || (a = C.transaction([T], "readwrite"), a.onerror = s(n), a.oncomplete = function() {
              i && n(null, i)
            });
            var u, c = a.objectStore(T);
            if (r) {
              var l = c.index("_doc_id_rev"),
                f = o + "::" + r;
              u = l.get(f), u.onsuccess = function(r) {
                if (r.target.result) {
                  var o = c.put(e);
                  o.onsuccess = function() {
                    i = {
                      ok: !0,
                      id: e._id,
                      rev: e._rev
                    }, t.ctx && n(null, i)
                  }
                } else n(h.REV_CONFLICT)
              }
            } else u = c.get(o), u.onsuccess = function(r) {
              if (r.target.result) n(h.REV_CONFLICT);
              else {
                var o = c.put(e);
                o.onsuccess = function() {
                  i = {
                    ok: !0,
                    id: e._id,
                    rev: e._rev
                  }, t.ctx && n(null, i)
                }
              }
            }
          }, e._removeLocal = function(e, t) {
            var n, r = C.transaction([T], "readwrite");
            r.oncomplete = function() {
              n && t(null, n)
            };
            var o = e._id + "::" + e._rev,
              i = r.objectStore(T),
              a = i.index("_doc_id_rev"),
              u = a.get(o);
            u.onerror = s(t), u.onsuccess = function(e) {
              var r = e.target.result;
              if (r) {
                var s = a.getKey(o);
                s.onsuccess = function(e) {
                  var t = e.target.result;
                  i["delete"](t), n = {
                    ok: !0,
                    id: r._id,
                    rev: "0-0"
                  }
                }
              } else t(h.MISSING_DOC)
            }
          };
          var N = m[O];
          if (N) return C = N.idb, L = N.blobSupport, I = N.instanceId, R = N.idStored, void n.nextTick(function() {
            o(null, e)
          });
          var j = r.indexedDB.open(O, w);
          "openReqList" in c || (c.openReqList = {}), c.openReqList[O] = j, j.onupgradeneeded = function(e) {
            var t = e.target.result;
            if (e.oldVersion < 1) return void i(t);
            var n = e.currentTarget.transaction;
            e.oldVersion < 4 && (_(t), e.oldVersion < 3 ? (f(t), e.oldVersion < 2 ? l(n, function() {
              v(n, function() {
                g(n)
              })
            }) : v(n, function() {
              g(n)
            })) : g(n))
          }, j.onsuccess = function(t) {
            C = t.target.result, C.onversionchange = function() {
              C.close(), delete m[O]
            }, C.onabort = function() {
              C.close(), delete m[O]
            };
            var n = C.transaction([x, A], "readwrite"),
              r = n.objectStore(x).get(x);
            r.onsuccess = function(t) {
              var r = function() {
                  null !== L && R && (m[O] = {
                    idb: C,
                    blobSupport: L,
                    instanceId: I,
                    idStored: R,
                    loaded: !0
                  }, o(null, e))
                },
                i = t.target.result || {
                  id: x
                };
              O + "_id" in i ? (I = i[O + "_id"], R = !0, r()) : (I = d.uuid(), i[O + "_id"] = I, n.objectStore(x).put(i).onsuccess = function() {
                R = !0, r()
              });
              try {
                var s = d.createBlob([""], {
                  type: "image/png"
                });
                n.objectStore(A).put(s, "key"), n.oncomplete = function() {
                  n = C.transaction([x, A], "readwrite");
                  var e = n.objectStore(A).get("key");
                  e.onsuccess = function(e) {
                    var t = e.target.result,
                      n = URL.createObjectURL(t);
                    d.ajax({
                      url: n,
                      cache: !0,
                      binary: !0
                    }, function(e, t) {
                      e && 405 === e.status ? L = !0 : (L = !(!t || "image/png" !== t.type), e && 404 === e.status && d.explain404("PouchDB is just detecting blob URL support.")), URL.revokeObjectURL(n), r()
                    })
                  }
                }
              } catch (a) {
                L = !1, r()
              }
            }
          }, j.onerror = s(o)
        }

        function f(e, t, n) {
          "openReqList" in c || (c.openReqList = {}), c.Changes.removeAllListeners(e), c.openReqList[e] && c.openReqList[e].result && c.openReqList[e].result.close();
          var o = r.indexedDB.deleteDatabase(e);
          o.onsuccess = function() {
            c.openReqList[e] && (c.openReqList[e] = null), d.hasLocalStorage() && e in r.localStorage && delete r.localStorage[e], delete m[e], n(null, {
              ok: !0
            })
          }, o.onerror = s(n)
        }
        var d = e("../utils"),
          p = e("../merge"),
          h = e("../deps/errors"),
          v = e("vuvuzela"),
          m = {},
          _ = {
            running: !1,
            queue: []
          };
        c.valid = function() {
          var e = "undefined" != typeof openDatabase && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
          return !e && r.indexedDB && r.IDBKeyRange
        }, c.destroy = d.toPromise(function(e, t, n) {
          _.queue.push({
            action: function(n) {
              f(e, t, n)
            },
            callback: n
          }), i()
        }), c.Changes = new d.Changes, t.exports = c
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"), "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "../deps/errors": 12,
      "../merge": 21,
      "../utils": 26,
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      vuvuzela: 61
    }],
    4: [function(e, t) {
      t.exports = ["idb", "websql"]
    }, {}],
    5: [function(e, t) {
      (function(n) {
        "use strict";

        function r(e) {
          return "'" + e + "'"
        }

        function o(e) {
          return e.replace(/\u0002/g, "").replace(/\u0001/g, "").replace(/\u0000/g, "")
        }

        function i(e) {
          return e.replace(/\u0001\u0001/g, "\x00").replace(/\u0001\u0002/g, "").replace(/\u0002\u0002/g, "")
        }

        function s(e, t, n, r, o) {
          return "SELECT " + e + " FROM " + ("string" == typeof t ? t : t.join(" JOIN ")) + (n ? " ON " + n : "") + (r ? " WHERE " + ("string" == typeof r ? r : r.join(" AND ")) : "") + (o ? " ORDER BY " + o : "")
        }

        function a(e) {
          return function(t) {
            var n = t && t.constructor.toString().match(/function ([^\(]+)/),
              r = n && n[1] || t.type,
              o = t.target || t.message;
            e(h.error(h.WSQ_ERROR, o, r))
          }
        }

        function u(e) {
          return delete e._id, delete e._rev, JSON.stringify(e)
        }

        function c(e, t, n) {
          return e = JSON.parse(e), e._id = t, e._rev = n, e
        }

        function l(e) {
          if ("size" in e) return 1e6 * e.size;
          var t = /Android/.test(window.navigator.userAgent);
          return t ? 5e6 : 1
        }

        function f(e, t) {
          function r() {
            d.hasLocalStorage() && (n.localStorage["_pouch__websqldb_" + K] = !0), t(null, J)
          }

          function _(e, t) {
            e.executeSql(O), e.executeSql("ALTER TABLE " + E + " ADD COLUMN deleted TINYINT(1) DEFAULT 0", [], function() {
              e.executeSql(T), e.executeSql("ALTER TABLE " + w + " ADD COLUMN local TINYINT(1) DEFAULT 0", [], function() {
                e.executeSql("CREATE INDEX IF NOT EXISTS 'doc-store-local-idx' ON " + w + " (local, id)");
                var n = "SELECT " + w + ".winningseq AS seq, " + w + ".json AS metadata FROM " + E + " JOIN " + w + " ON " + E + ".seq = " + w + ".winningseq";
                e.executeSql(n, [], function(e, n) {
                  for (var r = [], o = [], i = 0; i < n.rows.length; i++) {
                    var s = n.rows.item(i),
                      a = s.seq,
                      u = JSON.parse(s.metadata);
                    d.isDeleted(u) && r.push(a), d.isLocalId(u.id) && o.push(u.id)
                  }
                  e.executeSql("UPDATE " + w + "SET local = 1 WHERE id IN (" + o.map(function() {
                    return "?"
                  }).join(",") + ")", o, function() {
                    e.executeSql("UPDATE " + E + " SET deleted = 1 WHERE seq IN (" + r.map(function() {
                      return "?"
                    }).join(",") + ")", r, t)
                  })
                })
              })
            })
          }

          function D(e, t) {
            var n = "CREATE TABLE IF NOT EXISTS " + k + " (id UNIQUE, rev, json)";
            e.executeSql(n, [], function() {
              var n = "SELECT " + w + ".id AS id, " + E + ".json AS data FROM " + E + " JOIN " + w + " ON " + E + ".seq = " + w + ".winningseq WHERE local = 1";
              e.executeSql(n, [], function(e, n) {
                function r() {
                  if (!o.length) return t(e);
                  var n = o.shift(),
                    i = JSON.parse(n.data)._rev;
                  e.executeSql("INSERT INTO " + k + " (id, rev, json) VALUES (?,?,?)", [n.id, i, n.data], function(e) {
                    e.executeSql("DELETE FROM " + w + " WHERE id=?", [n.id], function(e) {
                      e.executeSql("DELETE FROM " + E + " WHERE seq=?", [n.seq], function() {
                        r()
                      })
                    })
                  })
                }
                for (var o = [], i = 0; i < n.rows.length; i++) o.push(n.rows.item(i));
                r()
              })
            })
          }

          function N(e, t) {
            function n(n) {
              function r() {
                if (!n.length) return t(e);
                var o = n.shift(),
                  i = m(o.hex, H),
                  s = i.lastIndexOf("::"),
                  a = i.substring(0, s),
                  u = i.substring(s + 2),
                  c = "UPDATE " + E + " SET doc_id=?, rev=? WHERE doc_id_rev=?";
                e.executeSql(c, [a, u, i], function() {
                  r()
                })
              }
              r()
            }
            var r = "ALTER TABLE " + E + " ADD COLUMN doc_id";
            e.executeSql(r, [], function(e) {
              var t = "ALTER TABLE " + E + " ADD COLUMN rev";
              e.executeSql(t, [], function(e) {
                e.executeSql(A, [], function(e) {
                  var t = "SELECT hex(doc_id_rev) as hex FROM " + E;
                  e.executeSql(t, [], function(e, t) {
                    for (var r = [], o = 0; o < t.rows.length; o++) r.push(t.rows.item(o));
                    n(r)
                  })
                })
              })
            })
          }

          function j(e, t) {
            function n(e) {
              var n = "SELECT COUNT(*) AS cnt FROM " + S;
              e.executeSql(n, [], function(e, n) {
                function r() {
                  var n = s(C + ", " + w + ".id AS id", [w, E], R, null, w + ".id ");
                  n += " LIMIT " + a + " OFFSET " + i, i += a, e.executeSql(n, [], function(e, n) {
                    function o(e, t) {
                      var n = i[e] = i[e] || []; - 1 === n.indexOf(t) && n.push(t)
                    }
                    if (!n.rows.length) return t(e);
                    for (var i = {}, s = 0; s < n.rows.length; s++)
                      for (var a = n.rows.item(s), u = c(a.data, a.id, a.rev), l = Object.keys(u._attachments || {}), f = 0; f < l.length; f++) {
                        var d = u._attachments[l[f]];
                        o(d.digest, a.seq)
                      }
                    var p = [];
                    if (Object.keys(i).forEach(function(e) {
                        var t = i[e];
                        t.forEach(function(t) {
                          p.push([e, t])
                        })
                      }), !p.length) return r();
                    var h = 0;
                    p.forEach(function(t) {
                      var n = "INSERT INTO " + x + " (digest, seq) VALUES (?,?)";
                      e.executeSql(n, t, function() {
                        ++h === p.length && r()
                      })
                    })
                  })
                }
                var o = n.rows.item(0).cnt;
                if (!o) return t(e);
                var i = 0,
                  a = 10;
                r()
              })
            }
            var r = "CREATE TABLE IF NOT EXISTS " + x + " (digest, seq INTEGER)";
            e.executeSql(r, [], function(e) {
              e.executeSql(I, [], function(e) {
                e.executeSql(L, [], n)
              })
            })
          }

          function F(e, t) {
            var n = "ALTER TABLE " + S + " ADD COLUMN escaped TINYINT(1) DEFAULT 0";
            e.executeSql(n, [], t)
          }

          function B(e, t) {
            e.executeSql('SELECT HEX("a") AS hex', [], function(e, n) {
              var r = n.rows.item(0).hex;
              H = 2 === r.length ? "UTF-8" : "UTF-16", t()
            })
          }

          function M() {
            for (; X.length > 0;) {
              var e = X.pop();
              e(null, W)
            }
          }

          function P(e, t) {
            if (0 === t) {
              var n = "CREATE TABLE IF NOT EXISTS " + q + " (dbid, db_version INTEGER)",
                r = "CREATE TABLE IF NOT EXISTS " + S + " (digest UNIQUE, escaped TINYINT(1), body BLOB)",
                o = "CREATE TABLE IF NOT EXISTS " + x + " (digest, seq INTEGER)",
                i = "CREATE TABLE IF NOT EXISTS " + w + " (id unique, json, winningseq)",
                s = "CREATE TABLE IF NOT EXISTS " + E + " (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, json, deleted TINYINT(1), doc_id, rev)",
                a = "CREATE TABLE IF NOT EXISTS " + k + " (id UNIQUE, rev, json)";
              e.executeSql(r), e.executeSql(a), e.executeSql(o, [], function() {
                e.executeSql(L), e.executeSql(I)
              }), e.executeSql(i, [], function() {
                e.executeSql(O), e.executeSql(s, [], function() {
                  e.executeSql(T), e.executeSql(A), e.executeSql(n, [], function() {
                    var t = "INSERT INTO " + q + " (db_version, dbid) VALUES (?,?)";
                    W = d.uuid();
                    var n = [b, W];
                    e.executeSql(t, n, function() {
                      M()
                    })
                  })
                })
              })
            } else {
              var u = function() {
                  var n = b > t;
                  n && e.executeSql("UPDATE " + q + " SET db_version = " + b);
                  var r = "SELECT dbid FROM " + q;
                  e.executeSql(r, [], function(e, t) {
                    W = t.rows.item(0).dbid, M()
                  })
                },
                c = [_, D, N, j, F, u],
                l = t,
                f = function(e) {
                  c[l - 1](e, f), l++
                };
              f(e)
            }
          }

          function U() {
            Y.transaction(function(e) {
              B(e, function() {
                G(e)
              })
            }, a(t), r)
          }

          function G(e) {
            var t = "SELECT sql FROM sqlite_master WHERE tbl_name = " + q;
            e.executeSql(t, [], function(e, t) {
              t.rows.length ? /db_version/.test(t.rows.item(0).sql) ? e.executeSql("SELECT db_version FROM " + q, [], function(e, t) {
                var n = t.rows.item(0).db_version;
                P(e, n)
              }) : e.executeSql("ALTER TABLE " + q + " ADD COLUMN db_version INTEGER", [], function() {
                P(e, 1)
              }) : P(e, 0)
            })
          }

          function V(e, t) {
            if (-1 !== Q) return t(Q);
            var n = s("COUNT(" + w + ".id) AS 'num'", [w, E], R, E + ".deleted=0");
            e.executeSql(n, [], function(e, n) {
              Q = n.rows.item(0).num, t(Q)
            })
          }
          var H, J = this,
            W = null,
            K = e.name,
            z = l(e),
            X = [],
            Q = -1,
            Y = g(K, y, K, z);
          return Y ? ("function" != typeof Y.readTransaction && (Y.readTransaction = Y.transaction), d.isCordova() && "undefined" != typeof n ? n.addEventListener(K + "_pouch", function $() {
            n.removeEventListener(K + "_pouch", $, !1), U()
          }, !1) : U(), J.type = function() {
            return "websql"
          }, J._id = d.toPromise(function(e) {
            e(null, W)
          }), J._info = function(e) {
            Y.readTransaction(function(t) {
              V(t, function(n) {
                var r = "SELECT MAX(seq) AS seq FROM " + E;
                t.executeSql(r, [], function(t, r) {
                  var o = r.rows.item(0).seq || 0;
                  e(null, {
                    doc_count: n,
                    update_seq: o
                  })
                })
              })
            }, a(e))
          }, J._bulkDocs = function(e, t, n) {
            function r() {
              var e = D.map(function(e) {
                if (e._bulk_seq) delete e._bulk_seq;
                else if (!Object.keys(e).length) return {
                  ok: !0
                };
                if (e.error) return e;
                var t = e.metadata,
                  n = p.winningRev(t);
                return {
                  ok: !0,
                  id: t.id,
                  rev: n
                }
              });
              f.Changes.notify(K), n(null, e)
            }

            function i(e, t) {
              var n = "SELECT count(*) as cnt FROM " + S + " WHERE digest=?";
              C.executeSql(n, [e], function(n, r) {
                if (0 === r.rows.item(0).cnt) {
                  var o = new Error("unknown stub attachment with digest " + e);
                  o.status = 412, t(o)
                } else t()
              })
            }

            function c(e) {
              function t() {
                ++o === n.length && e(r)
              }
              var n = [];
              if (I.forEach(function(e) {
                  e.data && e.data._attachments && Object.keys(e.data._attachments).forEach(function(t) {
                    var r = e.data._attachments[t];
                    r.stub && n.push(r.digest)
                  })
                }), !n.length) return e();
              var r, o = 0;
              n.forEach(function(e) {
                i(e, function(e) {
                  e && !r && (r = e), t()
                })
              })
            }

            function l(e, t) {
              if (e.stub) return t();
              if ("string" == typeof e.data) {
                try {
                  e.data = atob(e.data)
                } catch (r) {
                  var o = h.error(h.BAD_ARG, "Attachments need to be base64 encoded");
                  return n(o)
                }
                var i = d.fixBinary(e.data);
                e.data = d.createBlob([i], {
                  type: e.content_type
                })
              }
              d.readAsBinaryString(e.data, function(n) {
                e.data = n, d.MD5(n).then(function(r) {
                  e.digest = "md5-" + r, e.length = n.length, t()
                })
              })
            }

            function m(e) {
              function t() {
                n++, I.length === n && e()
              }
              if (!I.length) return e();
              var n = 0;
              I.forEach(function(e) {
                function n() {
                  o++, o === r.length && t()
                }
                var r = e.data && e.data._attachments ? Object.keys(e.data._attachments) : [],
                  o = 0;
                if (!r.length) return t();
                for (var i in e.data._attachments) e.data._attachments.hasOwnProperty(i) && l(e.data._attachments[i], n)
              })
            }

            function _(e, t, n, r, o, i) {
              function a() {
                function t(e, t) {
                  function n() {
                    return ++i === s.length && t(), !1
                  }

                  function o(t) {
                    var o = "INSERT INTO " + x + " (digest, seq) VALUES (?,?)",
                      i = [r._attachments[t].digest, e];
                    C.executeSql(o, i, n, n)
                  }
                  var i = 0,
                    s = Object.keys(r._attachments || {});
                  if (!s.length) return t();
                  for (var a = 0; a < s.length; a++) o(s[a])
                }
                var r = e.data,
                  o = n ? 1 : 0,
                  i = r._id,
                  a = r._rev,
                  c = u(r),
                  l = "INSERT INTO " + E + " (doc_id, rev, json, deleted) VALUES (?, ?, ?, ?);",
                  d = [i, a, c, o];
                C.executeSql(l, d, function(e, n) {
                  var r = n.insertId;
                  t(r, function() {
                    f(e, r)
                  })
                }, function() {
                  var e = s("seq", E, null, "doc_id=? AND rev=?");
                  return C.executeSql(e, [i, a], function(e, n) {
                    var r = n.rows.item(0).seq,
                      s = "UPDATE " + E + " SET json=?, deleted=? WHERE doc_id=? AND rev=?;",
                      u = [c, o, i, a];
                    e.executeSql(s, u, function(e) {
                      t(r, function() {
                        f(e, r)
                      })
                    })
                  }), !1
                })
              }

              function c(e) {
                d || (e ? (d = e, r(d)) : p === h.length && a())
              }

              function l(e) {
                p++, c(e)
              }

              function f(n, s) {
                e.metadata.seq = s, delete e.metadata.rev;
                var a = o ? "UPDATE " + w + " SET json=?, winningseq=(SELECT seq FROM " + E + " WHERE doc_id=" + w + ".id AND rev=?) WHERE id=?" : "INSERT INTO " + w + " (id, winningseq, json) VALUES (?, ?, ?);",
                  u = v.stringify(e.metadata),
                  c = e.metadata.id,
                  l = o ? [u, t, c] : [c, s, u];
                n.executeSql(a, l, function() {
                  D[i] = e, N.set(c, e.metadata), r()
                })
              }
              var d = null,
                p = 0;
              e.data._id = e.metadata.id, e.data._rev = e.metadata.rev, n && (e.data._deleted = !0);
              var h = e.data._attachments ? Object.keys(e.data._attachments) : [];
              for (var m in e.data._attachments)
                if (e.data._attachments[m].stub) p++, c();
                else {
                  var _ = e.data._attachments[m].data;
                  delete e.data._attachments[m].data;
                  var g = e.data._attachments[m].digest;
                  A(g, _, l)
                }
              h.length || a()
            }

            function g(e, t, n, r) {
              if (d.revExists(e, t.metadata.rev)) return D[n] = t, void r();
              var o = p.merge(e.rev_tree, t.metadata.rev_tree[0], 1e3),
                i = d.isDeleted(e),
                s = d.isDeleted(t.metadata),
                a = i && s && O || !i && O && "new_leaf" !== o.conflicts || i && !s && "new_branch" === o.conflicts;
              if (a) return D[n] = T(h.REV_CONFLICT, t._bulk_seq), r();
              t.metadata.rev_tree = o.tree;
              var u = p.winningRev(t.metadata);
              s = d.isDeleted(t.metadata, u), _(t, u, s, r, !0, n)
            }

            function y(e, n, r) {
              var o = p.winningRev(e.metadata),
                i = d.isDeleted(e.metadata, o);
              return "was_delete" in t && i ? (D[n] = h.MISSING_DOC, r()) : void _(e, o, i, r, !1, n)
            }

            function b() {
              ++j === I.length && r()
            }

            function k() {
              if (!I.length) return r();
              var e = new d.Map;
              I.forEach(function(t, n) {
                if (t._id && d.isLocalId(t._id)) return void J[t._deleted ? "_removeLocal" : "_putLocal"](t, {
                  ctx: C
                }, function(e) {
                  D[n] = e ? e : {}, b()
                });
                var r = t.metadata.id;
                e.has(r) ? e.get(r).push([t, n]) : e.set(r, [
                  [t, n]
                ])
              }), e.forEach(function(e, t) {
                function n() {
                  b(), ++o < e.length && r()
                }

                function r() {
                  var r = e[o],
                    i = r[0],
                    s = r[1];
                  N.has(t) ? g(N.get(t), i, s, n) : y(i, s, n)
                }
                var o = 0;
                r()
              })
            }

            function q(e) {
              function t() {
                ++n === I.length && e()
              }
              if (!I.length) return e();
              var n = 0;
              I.forEach(function(e) {
                if (e._id && d.isLocalId(e._id)) return t();
                var n = e.metadata.id;
                C.executeSql("SELECT json FROM " + w + " WHERE id = ?", [n], function(e, r) {
                  if (r.rows.length) {
                    var o = v.parse(r.rows.item(0).json);
                    N.set(n, o)
                  }
                  t()
                })
              })
            }

            function T(e, t) {
              return e._bulk_seq = t, e
            }

            function A(e, t, n) {
              var r = "SELECT digest FROM " + S + " WHERE digest=?";
              C.executeSql(r, [e], function(i, s) {
                return s.rows.length ? n() : (r = "INSERT INTO " + S + " (digest, body, escaped) VALUES (?,?,1)", void i.executeSql(r, [e, o(t)], function() {
                  n()
                }, function() {
                  return n(), !1
                }))
              })
            }
            var O = t.new_edits,
              L = e.docs,
              I = L.map(function(e, t) {
                if (e._id && d.isLocalId(e._id)) return e;
                var n = d.parseDoc(e, O);
                return n._bulk_seq = t, n
              }),
              R = I.filter(function(e) {
                return e.error
              });
            if (R.length) return n(R[0]);
            var C, D = new Array(I.length),
              N = new d.Map,
              j = 0;
            m(function() {
              Y.transaction(function(e) {
                C = e, c(function(e) {
                  return e ? n(e) : void q(k)
                })
              }, a(n), function() {
                Q = -1
              })
            })
          }, J._get = function(e, t, n) {
            function r() {
              n(a, {
                doc: o,
                metadata: i,
                ctx: f
              })
            }
            t = d.clone(t);
            var o, i, a;
            if (!t.ctx) return void Y.readTransaction(function(r) {
              t.ctx = r, J._get(e, t, n)
            });
            var u, l, f = t.ctx;
            t.rev ? (u = s(C, [w, E], w + ".id=" + E + ".doc_id", [E + ".doc_id=?", E + ".rev=?"]), l = [e, t.rev]) : (u = s(C, [w, E], R, w + ".id=?"), l = [e]), f.executeSql(u, l, function(e, n) {
              if (!n.rows.length) return a = h.MISSING_DOC, r();
              var s = n.rows.item(0);
              return i = v.parse(s.metadata), s.deleted && !t.rev ? (a = h.error(h.MISSING_DOC, "deleted"), r()) : (o = c(s.data, i.id, s.rev), void r())
            })
          }, J._allDocs = function(e, t) {
            var n, r = [],
              o = "startkey" in e ? e.startkey : !1,
              i = "endkey" in e ? e.endkey : !1,
              u = "key" in e ? e.key : !1,
              l = "descending" in e ? e.descending : !1,
              f = "limit" in e ? e.limit : -1,
              d = "skip" in e ? e.skip : 0,
              h = e.inclusive_end !== !1,
              m = [],
              _ = [];
            if (u !== !1) _.push(w + ".id = ?"), m.push(u);
            else if (o !== !1 || i !== !1) {
              if (o !== !1 && (_.push(w + ".id " + (l ? "<=" : ">=") + " ?"), m.push(o)), i !== !1) {
                var g = l ? ">" : "<";
                h && (g += "="), _.push(w + ".id " + g + " ?"), m.push(i)
              }
              u !== !1 && (_.push(w + ".id = ?"), m.push(u))
            }
            "ok" !== e.deleted && _.push(E + ".deleted = 0"), Y.readTransaction(function(t) {
              V(t, function(o) {
                if (n = o, 0 !== f) {
                  var i = s(C, [w, E], R, _, w + ".id " + (l ? "DESC" : "ASC"));
                  i += " LIMIT " + f + " OFFSET " + d, t.executeSql(i, m, function(t, n) {
                    for (var o = 0, i = n.rows.length; i > o; o++) {
                      var s = n.rows.item(o),
                        a = v.parse(s.metadata),
                        u = c(s.data, a.id, s.rev),
                        l = u._rev,
                        f = {
                          id: a.id,
                          key: a.id,
                          value: {
                            rev: l
                          }
                        };
                      if (e.include_docs) {
                        f.doc = u, f.doc._rev = l, e.conflicts && (f.doc._conflicts = p.collectConflicts(a));
                        for (var d in f.doc._attachments) f.doc._attachments.hasOwnProperty(d) && (f.doc._attachments[d].stub = !0)
                      }
                      if (s.deleted) {
                        if ("ok" !== e.deleted) continue;
                        f.value.deleted = !0, f.doc = null
                      }
                      r.push(f)
                    }
                  })
                }
              })
            }, a(t), function() {
              t(null, {
                total_rows: n,
                offset: e.skip,
                rows: r
              })
            })
          }, J._changes = function(e) {
            function t() {
              var t = [w + ".winningseq > " + e.since],
                n = [];
              e.doc_ids && (t.push(w + ".id IN (" + e.doc_ids.map(function() {
                return "?"
              }).join(",") + ")"), n = e.doc_ids);
              var l = s(C, [w, E], R, t, w + ".winningseq " + (r ? "DESC" : "ASC")),
                f = d.filterChange(e);
              e.view || e.filter || (l += " LIMIT " + o), Y.readTransaction(function(t) {
                t.executeSql(l, n, function(t, n) {
                  for (var r = 0, s = 0, l = n.rows.length; l > s; s++) {
                    var d = n.rows.item(s),
                      p = v.parse(d.metadata);
                    r < d.seq && (r = d.seq);
                    var h = c(d.data, p.id, d.rev),
                      m = e.processChange(h, p, e);
                    if (m.seq = d.seq, f(m) && (u++, i && a.push(m), e.onChange(m)), u === o) break
                  }
                  e.continuous || e.complete(null, {
                    results: a,
                    last_seq: r
                  })
                })
              })
            }
            if (e = d.clone(e), e.continuous) {
              var n = K + ":" + d.uuid();
              return f.Changes.addListener(K, n, J, e), f.Changes.notify(K), {
                cancel: function() {
                  f.Changes.removeListener(K, n)
                }
              }
            }
            var r = e.descending;
            e.since = e.since && !r ? e.since : 0;
            var o = "limit" in e ? e.limit : -1;
            0 === o && (o = 1);
            var i;
            i = "returnDocs" in e ? e.returnDocs : !0;
            var a = [],
              u = 0;
            t()
          }, J._close = function(e) {
            e()
          }, J._getAttachment = function(e, t, n) {
            var r, o = t.ctx,
              s = e.digest,
              a = e.content_type,
              u = "SELECT escaped, CASE WHEN escaped = 1 THEN body ELSE HEX(body) END AS body FROM " + S + " WHERE digest=?";
            o.executeSql(u, [s], function(e, o) {
              var s = o.rows.item(0),
                u = s.escaped ? i(s.body) : m(s.body, H);
              t.encode ? r = btoa(u) : (u = d.fixBinary(u), r = d.createBlob([u], {
                type: a
              })), n(null, r)
            })
          }, J._getRevisionTree = function(e, t) {
            Y.readTransaction(function(n) {
              var r = "SELECT json AS metadata FROM " + w + " WHERE id = ?";
              n.executeSql(r, [e], function(e, n) {
                if (n.rows.length) {
                  var r = v.parse(n.rows.item(0).metadata);
                  t(null, r.rev_tree)
                } else t(h.MISSING_DOC)
              })
            })
          }, J._doCompaction = function(e, t, n) {
            return t.length ? void Y.transaction(function(n) {
              var r = "SELECT json AS metadata FROM " + w + " WHERE id = ?";
              n.executeSql(r, [e], function(n, r) {
                var o = v.parse(r.rows.item(0).metadata);
                p.traverseRevTree(o.rev_tree, function(e, n, r, o, i) {
                  var s = n + "-" + r; - 1 !== t.indexOf(s) && (i.status = "missing")
                });
                var i = "UPDATE " + w + " SET json = ? WHERE id = ?";
                n.executeSql(i, [v.stringify(o), e])
              }), t.forEach(function(t) {
                var r = "SELECT seq FROM " + E + " WHERE doc_id=? AND rev=?";
                n.executeSql(r, [e, t], function(e, t) {
                  if (t.rows.length) {
                    var n = t.rows.item(0).seq,
                      r = "SELECT a1.digest AS digest FROM " + x + " a1 JOIN " + x + " a2 ON a1.digest=a2.digest WHERE a1.seq=? GROUP BY a1.digest HAVING COUNT(*) = 1";
                    e.executeSql(r, [n], function(e, t) {
                      for (var r = [], o = 0; o < t.rows.length; o++) r.push(t.rows.item(o).digest);
                      e.executeSql("DELETE FROM " + E + " WHERE seq=?", [n]), e.executeSql("DELETE FROM " + x + " WHERE seq=?", [n]), r.forEach(function(t) {
                        e.executeSql("DELETE FROM " + x + " WHERE digest=?", [t]), e.executeSql("DELETE FROM " + S + " WHERE digest=?", [t])
                      })
                    })
                  }
                })
              })
            }, a(n), function() {
              n()
            }) : n()
          }, J._getLocal = function(e, t) {
            Y.readTransaction(function(n) {
              var r = "SELECT json, rev FROM " + k + " WHERE id=?";
              n.executeSql(r, [e], function(n, r) {
                if (r.rows.length) {
                  var o = r.rows.item(0),
                    i = c(o.json, e, o.rev);
                  t(null, i)
                } else t(h.MISSING_DOC)
              })
            })
          }, J._putLocal = function(e, t, n) {
            function r(e) {
              var r, a;
              i ? (r = "UPDATE " + k + " SET rev=?, json=? WHERE id=? AND rev=?", a = [o, l, s, i]) : (r = "INSERT INTO " + k + " (id, rev, json) VALUES (?,?,?)", a = [s, o, l]), e.executeSql(r, a, function(e, r) {
                r.rowsAffected ? (c = {
                  ok: !0,
                  id: s,
                  rev: o
                }, t.ctx && n(null, c)) : n(h.REV_CONFLICT)
              }, function() {
                return n(h.REV_CONFLICT), !1
              })
            }
            "function" == typeof t && (n = t, t = {}), delete e._revisions;
            var o, i = e._rev,
              s = e._id;
            o = e._rev = i ? "0-" + (parseInt(i.split("-")[1], 10) + 1) : "0-1";
            var c, l = u(e);
            t.ctx ? r(t.ctx) : Y.transaction(function(e) {
              r(e)
            }, a(n), function() {
              c && n(null, c)
            })
          }, void(J._removeLocal = function(e, t) {
            var n;
            Y.transaction(function(r) {
              var o = "DELETE FROM " + k + " WHERE id=? AND rev=?",
                i = [e._id, e._rev];
              r.executeSql(o, i, function(r, o) {
                return o.rowsAffected ? void(n = {
                  ok: !0,
                  id: e._id,
                  rev: "0-0"
                }) : t(h.REV_CONFLICT)
              })
            }, a(t), function() {
              t(null, n)
            })
          })) : t(h.UNKNOWN_ERROR)
        }
        var d = e("../utils"),
          p = e("../merge"),
          h = e("../deps/errors"),
          v = e("vuvuzela"),
          m = e("../deps/parse-hex"),
          _ = {},
          g = d.getArguments(function(e) {
            if ("undefined" != typeof n) {
              if (n.navigator && n.navigator.sqlitePlugin && n.navigator.sqlitePlugin.openDatabase) return navigator.sqlitePlugin.openDatabase.apply(navigator.sqlitePlugin, e);
              if (n.sqlitePlugin && n.sqlitePlugin.openDatabase) return n.sqlitePlugin.openDatabase.apply(n.sqlitePlugin, e);
              var t = _[e[0]];
              return t || (t = _[e[0]] = n.openDatabase.apply(n, e)), t
            }
          }),
          y = 1,
          b = 6,
          w = r("document-store"),
          E = r("by-sequence"),
          S = r("attach-store"),
          k = r("local-store"),
          q = r("metadata-store"),
          x = r("attach-seq-store"),
          T = "CREATE INDEX IF NOT EXISTS 'by-seq-deleted-idx' ON " + E + " (seq, deleted)",
          A = "CREATE UNIQUE INDEX IF NOT EXISTS 'by-seq-doc-id-rev' ON " + E + " (doc_id, rev)",
          O = "CREATE INDEX IF NOT EXISTS 'doc-winningseq-idx' ON " + w + " (winningseq)",
          L = "CREATE INDEX IF NOT EXISTS 'attach-seq-seq-idx' ON " + x + " (seq)",
          I = "CREATE UNIQUE INDEX IF NOT EXISTS 'attach-seq-digest-idx' ON " + x + " (digest, seq)",
          R = E + ".seq = " + w + ".winningseq",
          C = E + ".seq AS seq, " + E + ".deleted AS deleted, " + E + ".json AS data, " + E + ".rev AS rev, " + w + ".json AS metadata";
        f.valid = function() {
          if ("undefined" != typeof n) {
            if (n.navigator && n.navigator.sqlitePlugin && n.navigator.sqlitePlugin.openDatabase) return !0;
            if (n.sqlitePlugin && n.sqlitePlugin.openDatabase) return !0;
            if (n.openDatabase) return !0
          }
          return !1
        }, f.destroy = d.toPromise(function(e, t, r) {
          f.Changes.removeAllListeners(e);
          var o = l(t),
            i = g(e, y, e, o);
          i.transaction(function(e) {
            var t = [w, E, S, q, k, x];
            t.forEach(function(t) {
              e.executeSql("DROP TABLE IF EXISTS " + t, [])
            })
          }, a(r), function() {
            d.hasLocalStorage() && (delete n.localStorage["_pouch__websqldb_" + e], delete n.localStorage[e]), r(null, {
              ok: !0
            })
          })
        }), f.Changes = new d.Changes, t.exports = f
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "../deps/errors": 12,
      "../deps/parse-hex": 14,
      "../merge": 21,
      "../utils": 26,
      vuvuzela: 61
    }],
    6: [function(e, t) {
      "use strict";

      function n(e, t, n) {
        function r() {
          i.cancel()
        }
        a.call(this);
        var i = this;
        this.db = e, t = t ? o.clone(t) : {};
        var s = n || t.complete || function() {},
          u = t.complete = o.once(function(t, n) {
            t ? i.emit("error", t) : i.emit("complete", n), i.removeAllListeners(), e.removeListener("destroyed", r)
          });
        s && (i.on("complete", function(e) {
          s(null, e)
        }), i.on("error", function(e) {
          s(e)
        }));
        var c = t.onChange;
        c && i.on("change", c), e.once("destroyed", r), t.onChange = function(e) {
          t.isCancelled || (i.emit("change", e), i.startSeq && i.startSeq <= e.seq && (i.emit("uptodate"), i.startSeq = !1), e.deleted ? i.emit("delete", e) : 1 === e.changes.length && "1-" === e.changes[0].rev.slice(0, 2) ? i.emit("create", e) : i.emit("update", e))
        };
        var l = new o.Promise(function(e, n) {
          t.complete = function(t, r) {
            t ? n(t) : e(r)
          }
        });
        i.once("cancel", function() {
          c && i.removeListener("change", c), t.complete(null, {
            status: "cancelled"
          })
        }), this.then = l.then.bind(l), this["catch"] = l["catch"].bind(l), this.then(function(e) {
          u(null, e)
        }, u), e.taskqueue.isReady ? i.doChanges(t) : e.taskqueue.addTask(function() {
          i.isCancelled ? i.emit("cancel") : i.doChanges(t)
        })
      }

      function r(e, t, n) {
        var r = [{
          rev: e._rev
        }];
        "all_docs" === n.style && (r = i.collectLeaves(t.rev_tree).map(function(e) {
          return {
            rev: e.rev
          }
        }));
        var s = {
          id: t.id,
          changes: r,
          doc: e
        };
        return o.isDeleted(t, e._rev) && (s.deleted = !0), n.conflicts && (s.doc._conflicts = i.collectConflicts(t), s.doc._conflicts.length || delete s.doc._conflicts), s
      }
      var o = e("./utils"),
        i = e("./merge"),
        s = e("./deps/errors"),
        a = e("events").EventEmitter,
        u = e("./evalFilter"),
        c = e("./evalView");
      t.exports = n, o.inherits(n, a), n.prototype.cancel = function() {
        this.isCancelled = !0, this.db.taskqueue.isReady && this.emit("cancel")
      }, n.prototype.doChanges = function(e) {
        var t = this,
          n = e.complete;
        if (e = o.clone(e), "live" in e && !("continuous" in e) && (e.continuous = e.live), e.processChange = r, "latest" === e.since && (e.since = "now"), e.since || (e.since = 0), "now" === e.since) return void this.db.info().then(function(r) {
          return t.isCancelled ? void n(null, {
            status: "cancelled"
          }) : (e.since = r.update_seq - 1, void t.doChanges(e))
        }, n);
        if (e.continuous && "now" !== e.since && this.db.info().then(function(e) {
            t.startSeq = e.update_seq - 1
          }, function(e) {
            if ("idbNull" !== e.id) throw e
          }), "http" !== this.db.type() && e.filter && "string" == typeof e.filter) return this.filterChanges(e);
        "descending" in e || (e.descending = !1), e.limit = 0 === e.limit ? 1 : e.limit, e.complete = n;
        var i = this.db._changes(e);
        if (i && "function" == typeof i.cancel) {
          var s = t.cancel;
          t.cancel = o.getArguments(function(e) {
            i.cancel(), s.apply(this, e)
          })
        }
      }, n.prototype.filterChanges = function(e) {
        var t = this,
          n = e.complete;
        if ("_view" === e.filter) {
          if (!e.view || "string" != typeof e.view) {
            var r = new Error("`view` filter parameter is not provided.");
            return r.status = s.BAD_REQUEST.status, r.name = s.BAD_REQUEST.name, r.error = !0, void n(r)
          }
          var o = e.view.split("/");
          this.db.get("_design/" + o[0], function(r, i) {
            if (t.isCancelled) return void n(null, {
              status: "cancelled"
            });
            if (r) return void n(r);
            if (i && i.views && i.views[o[1]]) {
              var a = c(i.views[o[1]].map);
              return e.filter = a, void t.doChanges(e)
            }
            var u = i.views ? "missing json key: " + o[1] : "missing json key: views";
            r || (r = new Error(u), r.status = s.MISSING_DOC.status, r.name = s.MISSING_DOC.name, r.error = !0), n(r)
          })
        } else {
          var i = e.filter.split("/");
          this.db.get("_design/" + i[0], function(r, o) {
            if (t.isCancelled) return void n(null, {
              status: "cancelled"
            });
            if (r) return void n(r);
            if (o && o.filters && o.filters[i[1]]) {
              var a = u(o.filters[i[1]]);
              return e.filter = a, void t.doChanges(e)
            }
            var c = o && o.filters ? "missing json key: " + i[1] : "missing json key: filters";
            return r || (r = new Error(c), r.status = s.MISSING_DOC.status, r.name = s.MISSING_DOC.name, r.error = !0), void n(r)
          })
        }
      }
    }, {
      "./deps/errors": 12,
      "./evalFilter": 18,
      "./evalView": 19,
      "./merge": 21,
      "./utils": 26,
      events: 30
    }],
    7: [function(e, t) {
      "use strict";

      function n(e, t, n, r) {
        return e.get(t)["catch"](function(n) {
          if (404 === n.status) return "http" === e.type() && o.explain404("PouchDB is just checking if a remote checkpoint exists."), {
            _id: t
          };
          throw n
        }).then(function(t) {
          return r.cancelled ? void 0 : (t.last_seq = n, e.put(t))
        })
      }

      function r(e, t, n, r) {
        this.src = e, this.target = t, this.id = n, this.returnValue = r
      }
      var o = e("./utils");
      r.prototype.writeCheckpoint = function(e) {
        var t = this;
        return this.updateTarget(e).then(function() {
          return t.updateSource(e)
        })
      }, r.prototype.updateTarget = function(e) {
        return n(this.target, this.id, e, this.returnValue)
      }, r.prototype.updateSource = function(e) {
        var t = this;
        return this.readOnlySource ? o.Promise.resolve(!0) : n(this.src, this.id, e, this.returnValue)["catch"](function(e) {
          var n = "number" == typeof e.status && 4 === Math.floor(e.status / 100);
          if (n) return t.readOnlySource = !0, !0;
          throw e
        })
      }, r.prototype.getCheckpoint = function() {
        var e = this;
        return e.target.get(e.id).then(function(t) {
          return e.src.get(e.id).then(function(e) {
            return t.last_seq === e.last_seq ? e.last_seq : 0
          }, function(n) {
            if (404 === n.status && t.last_seq) return e.src.put({
              _id: e.id,
              last_seq: 0
            }).then(function() {
              return 0
            }, function(n) {
              return 401 === n.status ? (e.readOnlySource = !0, t.last_seq) : 0
            });
            throw n
          })
        })["catch"](function(e) {
          if (404 !== e.status) throw e;
          return 0
        })
      }, t.exports = r
    }, {
      "./utils": 26
    }],
    8: [function(e, t) {
      (function(n) {
        "use strict";

        function r(e) {
          e && n.debug && console.error(e)
        }

        function o(e, t, n) {
          if (!(this instanceof o)) return new o(e, t, n);
          var c = this;
          ("function" == typeof t || "undefined" == typeof t) && (n = t, t = {}), e && "object" == typeof e && (t = e, e = void 0), "undefined" == typeof n && (n = r), t = t || {}, this.__opts = t;
          var l = n;
          c.auto_compaction = t.auto_compaction, c.prefix = o.prefix, i.call(c), c.taskqueue = new a;
          var f = new u(function(r, i) {
            n = function(e, t) {
              return e ? i(e) : (delete t.then, void r(t))
            }, t = s.clone(t);
            var a, u, l = t.name || e;
            return function() {
              try {
                if ("string" != typeof l) throw u = new Error("Missing/invalid DB name"), u.code = 400, u;
                if (a = o.parseAdapter(l, t), t.originalName = l, t.name = a.name, t.prefix && "http" !== a.adapter && "https" !== a.adapter && (t.name = t.prefix + t.name), t.adapter = t.adapter || a.adapter, c._adapter = t.adapter, c._db_name = l, !o.adapters[t.adapter]) throw u = new Error("Adapter is missing"), u.code = 404, u;
                if (!o.adapters[t.adapter].valid()) throw u = new Error("Invalid Adapter"), u.code = 404, u
              } catch (e) {
                c.taskqueue.fail(e), c.changes = s.toPromise(function(t) {
                  t.complete && t.complete(e)
                })
              }
            }(), u ? i(u) : (c.adapter = t.adapter, c.replicate = {}, c.replicate.from = function(e, t, n) {
              return c.constructor.replicate(e, c, t, n)
            }, c.replicate.to = function(e, t, n) {
              return c.constructor.replicate(c, e, t, n)
            }, c.sync = function(e, t, n) {
              return c.constructor.sync(c, e, t, n)
            }, c.replicate.sync = c.sync, c.destroy = s.adapterFun("destroy", function(e) {
              var t = this;
              t.info(function(n, r) {
                return n ? e(n) : void t.constructor.destroy(r.db_name, e)
              })
            }), o.adapters[t.adapter].call(c, t, function(e) {
              function r(e) {
                "destroyed" === e && (c.emit("destroyed"), o.removeListener(l, r))
              }
              return e ? void(n && (c.taskqueue.fail(e), n(e))) : (o.on(l, r), c.emit("created", c), o.emit("created", t.originalName), c.taskqueue.ready(c), void n(null, c))
            }), t.skipSetup && c.taskqueue.ready(c), void(s.isCordova() && cordova.fireWindowEvent(t.name + "_pouch", {})))
          });
          f.then(function(e) {
            l(null, e)
          }, l), c.then = f.then.bind(f), c["catch"] = f["catch"].bind(f)
        }
        var i = e("./adapter"),
          s = e("./utils"),
          a = e("./taskqueue"),
          u = s.Promise;
        s.inherits(o, i), t.exports = o
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "./adapter": 1,
      "./taskqueue": 25,
      "./utils": 26
    }],
    9: [function(e, t) {
      "use strict";

      function n(e, t) {
        function n(t, n, r) {
          if (e.binary || e.json || !e.processData || "string" == typeof t) {
            if (!e.binary && e.json && "string" == typeof t) try {
              t = JSON.parse(t)
            } catch (o) {
              return r(o)
            }
          } else t = JSON.stringify(t);
          Array.isArray(t) && (t = t.map(function(e) {
            var t;
            return e.ok ? e : e.error && "conflict" === e.error ? (t = i.REV_CONFLICT, t.id = e.id, t) : e.error && "forbidden" === e.error ? (t = i.FORBIDDEN, t.id = e.id, t.reason = e.reason, t) : e.missing ? (t = i.MISSING_DOC, t.missing = e.missing, t) : e
          })), r(null, t, n)
        }

        function a(e, t) {
          var n, r, o, s;
          try {
            n = JSON.parse(e.responseText);
            for (s in i)
              if (i.hasOwnProperty(s) && i[s].name === n.error) {
                o = i[s];
                break
              }
            o || (o = i.UNKNOWN_ERROR, e.status && (o.status = e.status), e.statusText && (e.name = e.statusText)), r = i.error(o, n.reason)
          } catch (a) {
            for (var s in i)
              if (i.hasOwnProperty(s) && i[s].status === e.status) {
                o = i[s];
                break
              }
            o || (o = i.UNKNOWN_ERROR, e.status && (o.status = e.status), e.statusText && (e.name = e.statusText)), r = i.error(o)
          }
          e.withCredentials && 0 === e.status && (r.status = 405, r.statusText = "Method Not Allowed"), t(r)
        }
        var u = !1,
          c = s.getArguments(function(e) {
            u || (t.apply(this, e), u = !0)
          });
        "function" == typeof e && (c = e, e = {}), e = s.clone(e);
        var l = {
          method: "GET",
          headers: {},
          json: !0,
          processData: !0,
          timeout: 1e4,
          cache: !1
        };
        if (e = s.extend(!0, l, e), "GET" === e.method && !e.cache) {
          var f = -1 !== e.url.indexOf("?");
          e.url += (f ? "&" : "?") + "_nonce=" + s.uuid(16)
        }
        var d, p;
        p = e.xhr ? new e.xhr : new XMLHttpRequest, p.open(e.method, e.url), p.withCredentials = !0, e.json && (e.headers.Accept = "application/json", e.headers["Content-Type"] = e.headers["Content-Type"] || "application/json", e.body && e.processData && "string" != typeof e.body && (e.body = JSON.stringify(e.body))), e.binary && (p.responseType = "arraybuffer");
        var h = function(e, t, n) {
          var r = "";
          if (n) {
            var o = new Date;
            o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3), r = "; expires=" + o.toGMTString()
          }
          document.cookie = e + "=" + t + r + "; path=/"
        };
        for (var v in e.headers)
          if ("Cookie" === v) {
            var m = e.headers[v].split("=");
            h(m[0], m[1], 10)
          } else p.setRequestHeader(v, e.headers[v]);
        "body" in e || (e.body = null);
        var _ = function() {
          u || (p.abort(), a(p, c))
        };
        return p.onreadystatechange = function() {
          if (4 === p.readyState && !u)
            if (clearTimeout(d), p.status >= 200 && p.status < 300) {
              var t;
              t = e.binary ? o([p.response || ""], {
                type: p.getResponseHeader("Content-Type")
              }) : p.responseText, n(t, p, c)
            } else a(p, c)
        }, e.timeout > 0 && (d = setTimeout(_, e.timeout), p.onprogress = function() {
          clearTimeout(d), d = setTimeout(_, e.timeout)
        }, "undefined" == typeof r && (r = -1 !== Object.keys(p).indexOf("upload")), r && (p.upload.onprogress = p.onprogress)), e.body && e.body instanceof Blob ? s.readAsBinaryString(e.body, function(e) {
          p.send(s.fixBinary(e))
        }) : p.send(e.body), {
          abort: _
        }
      }
      var r, o = e("./blob.js"),
        i = e("./errors"),
        s = e("../utils");
      t.exports = n
    }, {
      "../utils": 26,
      "./blob.js": 10,
      "./errors": 12
    }],
    10: [function(e, t) {
      (function(e) {
        "use strict";

        function n(t, n) {
          t = t || [], n = n || {};
          try {
            return new Blob(t, n)
          } catch (r) {
            if ("TypeError" !== r.name) throw r;
            for (var o = e.BlobBuilder || e.MSBlobBuilder || e.MozBlobBuilder || e.WebKitBlobBuilder, i = new o, s = 0; s < t.length; s += 1) i.append(t[s]);
            return i.getBlob(n.type)
          }
        }
        t.exports = n
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    11: [function(e, t, n) {
      "use strict";

      function r() {
        this.store = {}
      }

      function o() {
        this.store = new r
      }
      n.Map = r, n.Set = o, r.prototype.mangle = function(e) {
        if ("string" != typeof e) throw new TypeError("key must be a string but Got " + e);
        return "$" + e
      }, r.prototype.unmangle = function(e) {
        return e.substring(1)
      }, r.prototype.get = function(e) {
        var t = this.mangle(e);
        return t in this.store ? this.store[t] : void 0
      }, r.prototype.set = function(e, t) {
        var n = this.mangle(e);
        return this.store[n] = t, !0
      }, r.prototype.has = function(e) {
        var t = this.mangle(e);
        return t in this.store
      }, r.prototype["delete"] = function(e) {
        var t = this.mangle(e);
        return t in this.store ? (delete this.store[t], !0) : !1
      }, r.prototype.forEach = function(e) {
        var t = this,
          n = Object.keys(t.store);
        n.forEach(function(n) {
          var r = t.store[n];
          n = t.unmangle(n), e(r, n)
        })
      }, o.prototype.add = function(e) {
        return this.store.set(e, !0)
      }, o.prototype.has = function(e) {
        return this.store.has(e)
      }, o.prototype["delete"] = function(e) {
        return this.store["delete"](e)
      }
    }, {}],
    12: [function(e, t, n) {
      "use strict";

      function r(e) {
        this.status = e.status, this.name = e.error, this.message = e.reason, this.error = !0
      }
      r.prototype__proto__ = Error.prototype, r.prototype.toString = function() {
        return JSON.stringify({
          status: this.status,
          name: this.name,
          message: this.message
        })
      }, n.UNAUTHORIZED = new r({
        status: 401,
        error: "unauthorized",
        reason: "Name or password is incorrect."
      }), n.MISSING_BULK_DOCS = new r({
        status: 400,
        error: "bad_request",
        reason: "Missing JSON list of 'docs'"
      }), n.MISSING_DOC = new r({
        status: 404,
        error: "not_found",
        reason: "missing"
      }), n.REV_CONFLICT = new r({
        status: 409,
        error: "conflict",
        reason: "Document update conflict"
      }), n.INVALID_ID = new r({
        status: 400,
        error: "invalid_id",
        reason: "_id field must contain a string"
      }), n.MISSING_ID = new r({
        status: 412,
        error: "missing_id",
        reason: "_id is required for puts"
      }), n.RESERVED_ID = new r({
        status: 400,
        error: "bad_request",
        reason: "Only reserved document ids may start with underscore."
      }), n.NOT_OPEN = new r({
        status: 412,
        error: "precondition_failed",
        reason: "Database not open"
      }), n.UNKNOWN_ERROR = new r({
        status: 500,
        error: "unknown_error",
        reason: "Database encountered an unknown error"
      }), n.BAD_ARG = new r({
        status: 500,
        error: "badarg",
        reason: "Some query argument is invalid"
      }), n.INVALID_REQUEST = new r({
        status: 400,
        error: "invalid_request",
        reason: "Request was invalid"
      }), n.QUERY_PARSE_ERROR = new r({
        status: 400,
        error: "query_parse_error",
        reason: "Some query parameter is invalid"
      }), n.DOC_VALIDATION = new r({
        status: 500,
        error: "doc_validation",
        reason: "Bad special document member"
      }), n.BAD_REQUEST = new r({
        status: 400,
        error: "bad_request",
        reason: "Something wrong with the request"
      }), n.NOT_AN_OBJECT = new r({
        status: 400,
        error: "bad_request",
        reason: "Document must be a JSON object"
      }), n.DB_MISSING = new r({
        status: 404,
        error: "not_found",
        reason: "Database not found"
      }), n.IDB_ERROR = new r({
        status: 500,
        error: "indexed_db_went_bad",
        reason: "unknown"
      }), n.WSQ_ERROR = new r({
        status: 500,
        error: "web_sql_went_bad",
        reason: "unknown"
      }), n.LDB_ERROR = new r({
        status: 500,
        error: "levelDB_went_went_bad",
        reason: "unknown"
      }), n.FORBIDDEN = new r({
        status: 403,
        error: "forbidden",
        reason: "Forbidden by design doc validate_doc_update function"
      }), n.error = function(e, t, n) {
        function r() {
          this.message = t, n && (this.name = n)
        }
        return r.prototype = e, new r(t)
      }
    }, {}],
    13: [function(e, t) {
      (function(n, r) {
        "use strict";

        function o(e, t, n) {
          if ("function" == typeof e.slice) return t ? n ? e.slice(t, n) : e.slice(t) : e.slice();
          t = Math.floor(t || 0), n = Math.floor(n || 0);
          var r = e.byteLength;
          if (t = 0 > t ? Math.max(t + r, 0) : Math.min(r, t), n = 0 > n ? Math.max(n + r, 0) : Math.min(r, n), 0 >= n - t) return new ArrayBuffer(0);
          var o = new ArrayBuffer(n - t),
            i = new Uint8Array(o),
            s = new Uint8Array(e, t, n - t);
          return i.set(s), o
        }

        function i(e) {
          var t = [255 & e, e >>> 8 & 255, e >>> 16 & 255, e >>> 24 & 255];
          return t.map(function(e) {
            return String.fromCharCode(e)
          }).join("")
        }

        function s(e) {
          for (var t = "", n = 0; n < e.length; n++) t += i(e[n]);
          return r.btoa(t)
        }
        var a = e("crypto"),
          u = e("spark-md5"),
          c = r.setImmediate || r.setTimeout,
          l = 32768;
        t.exports = function(e, t) {
          function r(e, t, n, r) {
            d ? e.appendBinary(t.substring(n, r)) : e.append(o(t, n, r))
          }

          function i() {
            var n = m * h,
              o = n + h;
            if (n + h >= e.size && (o = e.size), m++, v > m) r(_, e, n, o), c(i);
            else {
              r(_, e, n, o);
              var a = _.end(!0),
                u = s(a);
              t(null, u), _.destroy()
            }
          }
          if (!n.browser) {
            var f = a.createHash("md5").update(e).digest("base64");
            return void t(null, f)
          }
          var d = "string" == typeof e,
            p = d ? e.length : e.byteLength,
            h = Math.min(l, p),
            v = Math.ceil(p / h),
            m = 0,
            _ = d ? new u : new u.ArrayBuffer;
          i()
        }
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"), "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      crypto: 29,
      "spark-md5": 60
    }],
    14: [function(e, t) {
      "use strict";

      function n(e) {
        return decodeURIComponent(window.escape(e))
      }

      function r(e) {
        return 65 > e ? e - 48 : e - 55
      }

      function o(e, t, n) {
        for (var o = ""; n > t;) o += String.fromCharCode(r(e.charCodeAt(t++)) << 4 | r(e.charCodeAt(t++)));
        return o
      }

      function i(e, t, n) {
        for (var o = ""; n > t;) o += String.fromCharCode(r(e.charCodeAt(t + 2)) << 12 | r(e.charCodeAt(t + 3)) << 8 | r(e.charCodeAt(t)) << 4 | r(e.charCodeAt(t + 1))), t += 4;
        return o
      }

      function s(e, t) {
        return "UTF-8" === t ? n(o(e, 0, e.length)) : i(e, 0, e.length)
      }
      t.exports = s
    }, {}],
    15: [function(e, t) {
      "use strict";

      function n(e) {
        for (var t = r, n = t.parser[t.strictMode ? "strict" : "loose"].exec(e), o = {}, i = 14; i--;) {
          var s = t.key[i],
            a = n[i] || "",
            u = -1 !== ["user", "password"].indexOf(s);
          o[s] = u ? decodeURIComponent(a) : a
        }
        return o[t.q.name] = {}, o[t.key[12]].replace(t.q.parser, function(e, n, r) {
          n && (o[t.q.name][n] = r)
        }), o
      }
      var r = {
        strictMode: !1,
        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q: {
          name: "queryKey",
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };
      t.exports = n
    }, {}],
    16: [function(e, t) {
      "use strict";

      function n(e, t, n) {
        return new o(function(o, i) {
          return t && "object" == typeof t && (t = t._id), "string" != typeof t ? i(new Error("doc id is required")) : void e.get(t, function(s, a) {
            if (s) return 404 !== s.status ? i(s) : o(r(e, n({
              _id: t
            }), n));
            var u = n(a);
            return u ? void o(r(e, u, n)) : o(a)
          })
        })
      }

      function r(e, t, r) {
        return e.put(t)["catch"](function(o) {
          if (409 !== o.status) throw o;
          return n(e, t, r)
        })
      }
      var o = e("../utils").Promise;
      t.exports = function(e, t, r, o) {
        return "function" != typeof o ? n(e, t, r) : void n(e, t, r).then(function(e) {
          o(null, e)
        }, o)
      }
    }, {
      "../utils": 26
    }],
    17: [function(e, t) {
      "use strict";

      function n(e) {
        return 0 | Math.random() * e
      }

      function r(e, t) {
        t = t || o.length;
        var r = "",
          i = -1;
        if (e) {
          for (; ++i < e;) r += o[n(t)];
          return r
        }
        for (; ++i < 36;) switch (i) {
          case 8:
          case 13:
          case 18:
          case 23:
            r += "-";
            break;
          case 19:
            r += o[3 & n(16) | 8];
            break;
          default:
            r += o[n(16)]
        }
        return r
      }
      var o = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
      t.exports = r
    }, {}],
    18: [function(_dereq_, module, exports) {
      "use strict";

      function evalFilter(input) {
        return eval(["(function () { return ", input, " })()"].join(""))
      }
      module.exports = evalFilter
    }, {}],
    19: [function(_dereq_, module, exports) {
      "use strict";

      function evalView(input) {
        return eval(["(function () {", "  return function (doc) {", "    var emitted = false;", "    var emit = function (a, b) {", "      emitted = true;", "    };", "    var view = " + input + ";", "    view(doc);", "    if (emitted) {", "      return true;", "    }", "  }", "})()"].join("\n"))
      }
      module.exports = evalView
    }, {}],
    20: [function(e, t) {
      (function(n) {
        "use strict";
        var r = e("./setup");
        t.exports = r, r.ajax = e("./deps/ajax"), r.extend = e("pouchdb-extend"), r.utils = e("./utils"), r.Errors = e("./deps/errors"), r.replicate = e("./replicate").replicate, r.sync = e("./sync"), r.version = e("./version");
        var o = e("./adapters/http");
        if (r.adapter("http", o), r.adapter("https", o), r.adapter("idb", e("./adapters/idb")), r.adapter("websql", e("./adapters/websql")), r.plugin(e("pouchdb-mapreduce")), !n.browser) {
          var i = e("./adapters/leveldb");
          r.adapter("ldb", i), r.adapter("leveldb", i)
        }
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
    }, {
      "./adapters/http": 2,
      "./adapters/idb": 3,
      "./adapters/leveldb": 29,
      "./adapters/websql": 5,
      "./deps/ajax": 9,
      "./deps/errors": 12,
      "./replicate": 22,
      "./setup": 23,
      "./sync": 24,
      "./utils": 26,
      "./version": 27,
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      "pouchdb-extend": 51,
      "pouchdb-mapreduce": 54
    }],
    21: [function(e, t) {
      "use strict";

      function n(e) {
        for (var t, n = e.shift(), r = [n.id, n.opts, []], o = r; e.length;) n = e.shift(), t = [n.id, n.opts, []], o[2].push(t), o = t;
        return r
      }

      function r(e, t) {
        for (var n = [{
            tree1: e,
            tree2: t
          }], r = !1; n.length > 0;) {
          var o = n.pop(),
            i = o.tree1,
            s = o.tree2;
          (i[1].status || s[1].status) && (i[1].status = "available" === i[1].status || "available" === s[1].status ? "available" : "missing");
          for (var a = 0; a < s[2].length; a++)
            if (i[2][0]) {
              for (var u = !1, c = 0; c < i[2].length; c++) i[2][c][0] === s[2][a][0] && (n.push({
                tree1: i[2][c],
                tree2: s[2][a]
              }), u = !0);
              u || (r = "new_branch", i[2].push(s[2][a]), i[2].sort())
            } else r = "new_leaf", i[2][0] = s[2][a]
        }
        return {
          conflicts: r,
          tree: e
        }
      }

      function o(e, t, n) {
        var o, i = [],
          s = !1,
          a = !1;
        return e.length ? (e.forEach(function(e) {
          if (e.pos === t.pos && e.ids[0] === t.ids[0]) o = r(e.ids, t.ids), i.push({
            pos: e.pos,
            ids: o.tree
          }), s = s || o.conflicts, a = !0;
          else if (n !== !0) {
            var u = e.pos < t.pos ? e : t,
              c = e.pos < t.pos ? t : e,
              l = c.pos - u.pos,
              f = [],
              d = [];
            for (d.push({
                ids: u.ids,
                diff: l,
                parent: null,
                parentIdx: null
              }); d.length > 0;) {
              var p = d.pop();
              0 !== p.diff ? p.ids && p.ids[2].forEach(function(e, t) {
                d.push({
                  ids: e,
                  diff: p.diff - 1,
                  parent: p.ids,
                  parentIdx: t
                })
              }) : p.ids[0] === c.ids[0] && f.push(p)
            }
            var h = f[0];
            h ? (o = r(h.ids, c.ids), h.parent[2][h.parentIdx] = o.tree, i.push({
              pos: u.pos,
              ids: u.ids
            }), s = s || o.conflicts, a = !0) : i.push(e)
          } else i.push(e)
        }), a || i.push(t), i.sort(function(e, t) {
          return e.pos - t.pos
        }), {
          tree: i,
          conflicts: s || "internal_node"
        }) : {
          tree: [t],
          conflicts: "new_leaf"
        }
      }

      function i(e, t) {
        var r = a.rootToLeaf(e).map(function(e) {
          var r = e.ids.slice(-t);
          return {
            pos: e.pos + (e.ids.length - r.length),
            ids: n(r)
          }
        });
        return r.reduce(function(e, t) {
          return o(e, t, !0).tree
        }, [r.shift()])
      }
      var s = e("pouchdb-extend"),
        a = {};
      a.merge = function(e, t, n) {
        e = s(!0, [], e), t = s(!0, {}, t);
        var r = o(e, t);
        return {
          tree: i(r.tree, n),
          conflicts: r.conflicts
        }
      }, a.winningRev = function(e) {
        var t = [];
        return a.traverseRevTree(e.rev_tree, function(e, n, r, o, i) {
          e && t.push({
            pos: n,
            id: r,
            deleted: !!i.deleted
          })
        }), t.sort(function(e, t) {
          return e.deleted !== t.deleted ? e.deleted > t.deleted ? 1 : -1 : e.pos !== t.pos ? t.pos - e.pos : e.id < t.id ? 1 : -1
        }), t[0].pos + "-" + t[0].id
      }, a.traverseRevTree = function(e, t) {
        for (var n, r = e.slice(); n = r.pop();)
          for (var o = n.pos, i = n.ids, s = i[2], a = t(0 === s.length, o, i[0], n.ctx, i[1]), u = 0, c = s.length; c > u; u++) r.push({
            pos: o + 1,
            ids: s[u],
            ctx: a
          })
      }, a.collectLeaves = function(e) {
        var t = [];
        return a.traverseRevTree(e, function(e, n, r, o, i) {
          e && t.unshift({
            rev: n + "-" + r,
            pos: n,
            opts: i
          })
        }), t.sort(function(e, t) {
          return t.pos - e.pos
        }), t.map(function(e) {
          delete e.pos
        }), t
      }, a.collectConflicts = function(e) {
        var t = a.winningRev(e),
          n = a.collectLeaves(e.rev_tree),
          r = [];
        return n.forEach(function(e) {
          e.rev === t || e.opts.deleted || r.push(e.rev)
        }), r
      }, a.rootToLeaf = function(e) {
        var t = [];
        return a.traverseRevTree(e, function(e, n, r, o, i) {
          if (o = o ? o.slice(0) : [], o.push({
              id: r,
              opts: i
            }), e) {
            var s = n + 1 - o.length;
            t.unshift({
              pos: s,
              ids: o
            })
          }
          return o
        }), t
      }, t.exports = a
    }, {
      "pouchdb-extend": 51
    }],
    22: [function(e, t, n) {
      "use strict";

      function r(e, t) {
        e = parseInt(e, 10), t = parseInt(t, 10), e !== e && (e = 0), t !== t || e >= t ? t = (e || 1) << 1 : t += 1;
        var n = Math.random(),
          r = t - e;
        return ~~(r * n + e)
      }

      function o(e) {
        var t = 0;
        return e || (t = 2e3), r(e, t)
      }

      function i(e, t, n, r, i, s, a) {
        return r.retry === !1 ? (i.emit("error", a), void i.removeAllListeners()) : (r.default_back_off = r.default_back_off || 0, r.retries = r.retries || 0, "function" != typeof r.back_off_function && (r.back_off_function = o), r.retries++, r.max_retries && r.retries > r.max_retries ? (i.emit("error", new Error("tried " + r.retries + " times but replication failed")), void i.removeAllListeners()) : (i.emit("requestError", a), "active" === i.state && (i.emit("syncStopped"), i.state = "stopped", i.once("syncRestarted", function() {
          r.current_back_off = r.default_back_off
        })), r.current_back_off = r.current_back_off || r.default_back_off, r.current_back_off = r.back_off_function(r.current_back_off), void setTimeout(function() {
          u(e, t, n, r, i)
        }, r.current_back_off)))
      }

      function s() {
        d.call(this), this.cancelled = !1, this.state = "pending";
        var e = this,
          t = new f.Promise(function(t, n) {
            e.once("complete", t), e.once("error", n)
          });
        e.then = function(e, n) {
          return t.then(e, n)
        }, e["catch"] = function(e) {
          return t["catch"](e)
        }, e["catch"](function() {})
      }

      function a(e, t, n) {
        var r = n.filter ? n.filter.toString() : "";
        return e.id().then(function(e) {
          return t.id().then(function(t) {
            var o = e + t + r + JSON.stringify(n.query_params) + n.doc_ids;
            return f.MD5(o).then(function(e) {
              return e = e.replace(/\//g, ".").replace(/\+/g, "_"), "_local/" + e
            })
          })
        })
      }

      function u(e, t, n, r, o, s) {
        function a() {
          if (0 !== x.docs.length) {
            var e = x.docs;
            return n.bulkDocs({
              docs: e
            }, {
              new_edits: !1
            }).then(function(e) {
              if (B.cancelled) throw b(), new Error("cancelled");
              var t = [];
              e.forEach(function(e) {
                if (e.error) {
                  s.doc_write_failures++;
                  var n = new Error(e.reason || e.message || "Unknown reason");
                  n.name = e.name || e.error, t.push(n)
                }
              }), s.errors = s.errors.concat(t), s.docs_written += x.docs.length - t.length;
              var n = t.filter(function(e) {
                return "unauthorized" !== e.name && "forbidden" !== e.name
              });
              if (n.length > 0) {
                var r = new Error("bulkDocs error");
                throw r.other_errors = t, y("target.bulkDocs failed to write docs", r), new Error("bulkWrite partial failure")
              }
            }, function(t) {
              throw s.doc_write_failures += e.length, t
            })
          }
        }

        function u() {
          for (var e = x.diffs, n = Object.keys(e)[0], r = e[n].missing, o = [], i = 0; i < r.length; i += h) o.push(r.slice(i, Math.min(r.length, i + h)));
          return f.Promise.all(o.map(function(r) {
            return t.get(n, {
              revs: !0,
              open_revs: r,
              attachments: !0
            }).then(function(t) {
              t.forEach(function(e) {
                return B.cancelled ? b() : void(e.ok && (s.docs_read++, x.pendingRevs++, x.docs.push(e.ok)))
              }), delete e[n]
            })
          }))
        }

        function c() {
          return Object.keys(x.diffs).length > 0 ? u().then(c) : f.Promise.resolve()
        }

        function l() {
          var e = Object.keys(x.diffs).filter(function(e) {
            var t = x.diffs[e].missing;
            return 1 === t.length && "1-" === t[0].slice(0, 2)
          });
          return t.allDocs({
            keys: e,
            include_docs: !0
          }).then(function(e) {
            if (B.cancelled) throw b(), new Error("cancelled");
            e.rows.forEach(function(e) {
              !e.doc || e.deleted || "1-" !== e.value.rev.slice(0, 2) || e.doc._attachments && 0 !== Object.keys(e.doc._attachments).length || (s.docs_read++, x.pendingRevs++, x.docs.push(e.doc), delete x.diffs[e.id])
            })
          })
        }

        function d() {
          return l().then(c)
        }

        function v() {
          return O = !0, M.writeCheckpoint(x.seq).then(function() {
            if (O = !1, B.cancelled) throw b(), new Error("cancelled");
            s.last_seq = R = x.seq, o.emit("change", f.clone(s)), x = void 0, k()
          })["catch"](function(e) {
            throw O = !1, y("writeCheckpoint completed with error", e), e
          })
        }

        function m() {
          var e = {};
          return x.changes.forEach(function(t) {
            e[t.id] = t.changes.map(function(e) {
              return e.rev
            })
          }), n.revsDiff(e).then(function(e) {
            if (B.cancelled) throw b(), new Error("cancelled");
            x.diffs = e, x.pendingRevs = 0
          })
        }

        function _() {
          if (!B.cancelled && !x) {
            if (0 === T.length) return void g(!0);
            x = T.shift(), m().then(d).then(a).then(v).then(_)["catch"](function(e) {
              y("batch processing terminated with error", e)
            })
          }
        }

        function g(e) {
          return 0 === A.changes.length ? void(0 !== T.length || x || ((C && P.live || L) && o.emit("uptodate", f.clone(s)), L && b())) : void((e || L || A.changes.length >= D) && (T.push(A), A = {
            seq: 0,
            changes: [],
            docs: []
          }, _()))
        }

        function y(e, t) {
          I || (s.ok = !1, s.status = "aborting", s.errors.push(t), T = [], A = {
            seq: 0,
            changes: [],
            docs: []
          }, b())
        }

        function b() {
          if (!(I || B.cancelled && (s.status = "cancelled", O))) {
            s.status = s.status || "complete", s.end_time = new Date, s.last_seq = R, I = B.cancelled = !0;
            var a = s.errors.filter(function(e) {
              return "unauthorized" !== e.name && "forbidden" !== e.name
            });
            if (a.length > 0) {
              var u = s.errors.pop();
              s.errors.length > 0 && (u.other_errors = s.errors), u.result = s, i(e, t, n, r, o, s, u)
            } else o.emit("complete", s), o.removeAllListeners()
          }
        }

        function w(e) {
          return B.cancelled ? b() : (0 !== A.changes.length || 0 !== T.length || x || o.emit("outofdate", f.clone(s)), A.seq = e.seq, A.changes.push(e), void g(0 === T.length))
        }

        function E(e) {
          return j = !1, B.cancelled ? b() : (P.since < e.last_seq ? (P.since = e.last_seq, k()) : C ? (P.live = !0, k()) : L = !0, void g(!0))
        }

        function S(e) {
          return j = !1, B.cancelled ? b() : void y("changes rejected", e)
        }

        function k() {
          function e() {
            r.cancel()
          }

          function n() {
            o.removeListener("cancel", e)
          }
          if (!j && !L && T.length < N) {
            j = !0, o.once("cancel", e);
            var r = t.changes(P).on("change", w);
            r.then(n, n), r.then(E)["catch"](S)
          }
        }

        function q() {
          M.getCheckpoint().then(function(e) {
            R = e, P = {
              since: R,
              limit: D,
              batch_size: D,
              style: "all_docs",
              doc_ids: F,
              returnDocs: !1
            }, r.filter && (P.filter = r.filter), r.query_params && (P.query_params = r.query_params), k()
          })["catch"](function(e) {
            y("getCheckpoint rejected with ", e)
          })
        }
        var x, T = [],
          A = {
            seq: 0,
            changes: [],
            docs: []
          },
          O = !1,
          L = !1,
          I = !1,
          R = 0,
          C = r.continuous || r.live || !1,
          D = r.batch_size || 100,
          N = r.batches_limit || 10,
          j = !1,
          F = r.doc_ids,
          B = {
            cancelled: !1
          },
          M = new p(t, n, e, B);
        s = s || {
          ok: !0,
          start_time: new Date,
          docs_read: 0,
          docs_written: 0,
          doc_write_failures: 0,
          errors: []
        };
        var P = {};
        o.ready(t, n), o.once("cancel", b), "function" == typeof r.onChange && o.on("change", r.onChange), "function" == typeof r.complete && (o.once("error", r.complete), o.once("complete", function(e) {
          r.complete(null, e)
        })), "undefined" == typeof r.since ? q() : (O = !0, M.writeCheckpoint(r.since).then(function() {
          return O = !1, B.cancelled ? void b() : (R = r.since, void q())
        })["catch"](function(e) {
          throw O = !1, y("writeCheckpoint completed with error", e), e
        }))
      }

      function c(e, t) {
        var n = t.PouchConstructor;
        return "string" == typeof e ? new n(e) : e.then ? e : f.Promise.resolve(e)
      }

      function l(e, t, n, r) {
        "function" == typeof n && (r = n, n = {}), "undefined" == typeof n && (n = {}), n.complete || (n.complete = r || function() {}), n = f.clone(n), n.continuous = n.continuous || n.live, n.retry = n.retry || !1, n.PouchConstructor = n.PouchConstructor || this;
        var o = new s(n);
        return c(e, n).then(function(e) {
          return c(t, n).then(function(t) {
            return a(e, t, n).then(function(r) {
              u(r, e, t, n, o)
            })
          })
        })["catch"](function(e) {
          o.emit("error", e), n.complete(e)
        }), o
      }
      var f = e("./utils"),
        d = e("events").EventEmitter,
        p = e("./checkpointer"),
        h = 50;
      f.inherits(s, d), s.prototype.cancel = function() {
        this.cancelled = !0, this.state = "cancelled", this.emit("cancel")
      }, s.prototype.ready = function(e, t) {
        function n() {
          o.cancel()
        }

        function r() {
          e.removeListener("destroyed", n), t.removeListener("destroyed", n)
        }
        var o = this;
        this.once("change", function() {
          "pending" === this.state ? (o.state = "active", o.emit("syncStarted")) : "stopped" === o.state && (o.state = "active", o.emit("syncRestarted"))
        }), e.once("destroyed", n), t.once("destroyed", n), this.then(r, r)
      }, n.toPouch = c, n.replicate = l
    }, {
      "./checkpointer": 7,
      "./utils": 26,
      events: 30
    }],
    23: [function(e, t) {
      (function(n) {
        "use strict";
        var r = e("./constructor"),
          o = e("./utils"),
          i = o.Promise,
          s = e("events").EventEmitter;
        r.adapters = {}, r.preferredAdapters = e("./adapters/preferredAdapters.js"), r.prefix = "_pouch_";
        var a = new s,
          u = ["on", "addListener", "emit", "listeners", "once", "removeAllListeners", "removeListener", "setMaxListeners"];
        u.forEach(function(e) {
          r[e] = a[e].bind(a)
        }), r.setMaxListeners(0), r.parseAdapter = function(e, t) {
          var i, s, a = e.match(/([a-z\-]*):\/\/(.*)/);
          if (a) {
            if (e = /http(s?)/.test(a[1]) ? a[1] + "://" + a[2] : a[2], i = a[1], !r.adapters[i].valid()) throw "Invalid adapter";
            return {
              name: e,
              adapter: a[1]
            }
          }
          var u = "idb" in r.adapters && "websql" in r.adapters && o.hasLocalStorage() && n.localStorage["_pouch__websqldb_" + r.prefix + e];
          if ("undefined" != typeof t && t.db) s = "leveldb";
          else
            for (var c = 0; c < r.preferredAdapters.length; ++c)
              if (s = r.preferredAdapters[c], s in r.adapters) {
                if (u && "idb" === s) continue;
                break
              } if (i = r.adapters[s], s && i) {
            var l = "use_prefix" in i ? i.use_prefix : !0;
            return {
              name: l ? r.prefix + e : e,
              adapter: s
            }
          }
          throw "No valid adapter found"
        }, r.destroy = o.toPromise(function(e, t, n) {
          function s() {
            c.destroy(d, t, function(t, o) {
              t ? n(t) : (r.emit("destroyed", e), r.emit(e, "destroyed"), n(null, o || {
                ok: !0
              }))
            })
          }("function" == typeof t || "undefined" == typeof t) && (n = t, t = {}), e && "object" == typeof e && (t = e, e = void 0);
          var a = r.parseAdapter(t.name || e, t),
            u = a.name,
            c = r.adapters[a.adapter],
            l = "use_prefix" in c ? c.use_prefix : !0,
            f = l ? u.replace(new RegExp("^" + r.prefix), "") : u,
            d = ("http" === a.adapter || "https" === a.adapter ? "" : t.prefix || "") + u,
            p = o.extend(!0, {}, t, {
              adapter: a.adapter
            });
          new r(f, p, function(e, u) {
            return e ? n(e) : void u.get("_local/_pouch_dependentDbs", function(e, u) {
              if (e) return 404 !== e.status ? n(e) : s();
              var c = u.dependentDbs,
                f = Object.keys(c).map(function(e) {
                  var n = l ? e.replace(new RegExp("^" + r.prefix), "") : e,
                    i = o.extend(!0, t, {
                      adapter: a.adapter
                    });
                  return r.destroy(n, i)
                });
              i.all(f).then(s, function(e) {
                n(e)
              })
            })
          })
        }), r.allDbs = o.toPromise(function(e) {
          var t = new Error("allDbs method removed");
          t.stats = "400", e(t)
        }), r.adapter = function(e, t) {
          t.valid() && (r.adapters[e] = t)
        }, r.plugin = function(e) {
          Object.keys(e).forEach(function(t) {
            r.prototype[t] = e[t]
          })
        }, r.defaults = function(e) {
          function t(t, n, i) {
            ("function" == typeof n || "undefined" == typeof n) && (i = n, n = {}), t && "object" == typeof t && (n = t, t = void 0), n = o.extend(!0, {}, e, n), r.call(this, t, n, i)
          }
          return o.inherits(t, r), t.destroy = o.toPromise(function(t, n, i) {
            return ("function" == typeof n || "undefined" == typeof n) && (i = n, n = {}), t && "object" == typeof t && (n = t, t = void 0), n = o.extend(!0, {}, e, n), r.destroy(t, n, i)
          }), u.forEach(function(e) {
            t[e] = a[e].bind(a)
          }), t.setMaxListeners(0), t.preferredAdapters = r.preferredAdapters.slice(), Object.keys(r).forEach(function(e) {
            e in t || (t[e] = r[e])
          }), t
        }, t.exports = r
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "./adapters/preferredAdapters.js": 4,
      "./constructor": 8,
      "./utils": 26,
      events: 30
    }],
    24: [function(e, t) {
      "use strict";

      function n(e, t, n, s) {
        return "function" == typeof n && (s = n, n = {}), "undefined" == typeof n && (n = {}), n = o.clone(n), n.PouchConstructor = n.PouchConstructor || this, e = i.toPouch(e, n), t = i.toPouch(t, n), new r(e, t, n, s)
      }

      function r(e, t, n, r) {
        function i(e) {
          p || (p = !0, l.emit("cancel", e))
        }

        function a(e) {
          l.emit("change", {
            direction: "pull",
            change: e
          })
        }

        function u(e) {
          l.emit("change", {
            direction: "push",
            change: e
          })
        }

        function c(e) {
          return function(t, n) {
            var r = "change" === t && (n === a || n === u),
              o = "cancel" === t && n === i,
              s = t in h && n === h[t];
            (r || o || s) && (t in v || (v[t] = {}), v[t][e] = !0, 2 === Object.keys(v[t]).length && l.removeAllListeners(t))
          }
        }
        var l = this;
        this.canceled = !1;
        var f, d;
        "onChange" in n && (f = n.onChange, delete n.onChange), "function" != typeof r || n.complete ? "complete" in n && (d = n.complete, delete n.complete) : d = r, this.push = s(e, t, n), this.pull = s(t, e, n);
        var p = !1,
          h = {},
          v = {};
        this.on("newListener", function(e) {
          "change" === e ? (l.pull.on("change", a), l.push.on("change", u)) : "cancel" === e ? (l.pull.on("cancel", i), l.push.on("cancel", i)) : "error" === e || "removeListener" === e || "complete" === e || e in h || (h[e] = function(t) {
            l.emit(e, t)
          }, l.pull.on(e, h[e]), l.push.on(e, h[e]))
        }), this.on("removeListener", function(e) {
          "change" === e ? (l.pull.removeListener("change", a), l.push.removeListener("change", u)) : "cancel" === e ? (l.pull.removeListener("cancel", i), l.push.removeListener("cancel", i)) : e in h && "function" == typeof h[e] && (l.pull.removeListener(e, h[e]), l.push.removeListener(e, h[e]), delete h[e])
        }), this.pull.on("removeListener", c("pull")), this.push.on("removeListener", c("push"));
        var m = o.Promise.all([this.push, this.pull]).then(function(e) {
          var t = {
            push: e[0],
            pull: e[1]
          };
          return l.emit("complete", t), d && d(null, t), l.removeAllListeners(), t
        }, function(e) {
          throw l.cancel(), l.emit("error", e), d && d(e), l.removeAllListeners(), e
        });
        this.then = function(e, t) {
          return m.then(e, t)
        }, this["catch"] = function(e) {
          return m["catch"](e)
        }
      }
      var o = e("./utils"),
        i = e("./replicate"),
        s = i.replicate,
        a = e("events").EventEmitter;
      o.inherits(r, a), t.exports = n, r.prototype.cancel = function() {
        this.canceled || (this.canceled = !0, this.push.cancel(), this.pull.cancel())
      }
    }, {
      "./replicate": 22,
      "./utils": 26,
      events: 30
    }],
    25: [function(e, t) {
      "use strict";

      function n() {
        this.isReady = !1, this.failed = !1, this.queue = []
      }
      t.exports = n, n.prototype.execute = function() {
        var e, t;
        if (this.failed)
          for (; e = this.queue.shift();) "function" != typeof e ? (t = e.parameters[e.parameters.length - 1], "function" == typeof t ? t(this.failed) : "changes" === e.name && "function" == typeof t.complete && t.complete(this.failed)) : e(this.failed);
        else if (this.isReady)
          for (; e = this.queue.shift();) "function" == typeof e ? e() : e.task = this.db[e.name].apply(this.db, e.parameters)
      }, n.prototype.fail = function(e) {
        this.failed = e, this.execute()
      }, n.prototype.ready = function(e) {
        return this.failed ? !1 : 0 === arguments.length ? this.isReady : (this.isReady = e ? !0 : !1, this.db = e, void this.execute())
      }, n.prototype.addTask = function(e, t) {
        if ("function" != typeof e) {
          var n = {
            name: e,
            parameters: t
          };
          return this.queue.push(n), this.failed && this.execute(), n
        }
        this.queue.push(e), this.failed && this.execute()
      }
    }, {}],
    26: [function(e, t, n) {
      (function(t, r) {
        function o(e) {
          var t = {};
          return e.forEach(function(e) {
            t[e] = !0
          }), t
        }

        function i() {
          return "undefined" != typeof chrome && "undefined" != typeof chrome.storage && "undefined" != typeof chrome.storage.local
        }

        function s() {
          if (!(this instanceof s)) return new s;
          var e = this;
          l.call(this), this.isChrome = i(), this.listeners = {}, this.hasLocal = !1, this.isChrome || (this.hasLocal = n.hasLocalStorage()), this.isChrome ? chrome.storage.onChanged.addListener(function(t) {
            null != t.db_name && e.emit(t.dbName.newValue)
          }) : this.hasLocal && (r.addEventListener ? r.addEventListener("storage", function(t) {
            e.emit(t.key)
          }) : r.attachEvent("storage", function(t) {
            e.emit(t.key)
          }))
        }
        var a = e("./merge");
        n.extend = e("pouchdb-extend"), n.ajax = e("./deps/ajax"), n.createBlob = e("./deps/blob"), n.uuid = e("./deps/uuid"), n.getArguments = e("argsarray");
        var u = e("./deps/buffer"),
          c = e("./deps/errors"),
          l = e("events").EventEmitter,
          f = e("./deps/collections");
        n.Map = f.Map, n.Set = f.Set, n.Promise = "function" == typeof r.Promise ? r.Promise : e("bluebird");
        var d = n.Promise,
          p = o(["_id", "_rev", "_attachments", "_deleted", "_revisions", "_revs_info", "_conflicts", "_deleted_conflicts", "_local_seq", "_rev_tree", "_replication_id", "_replication_state", "_replication_state_time", "_replication_state_reason", "_replication_stats"]),
          h = o(["_attachments", "_replication_id", "_replication_state", "_replication_state_time", "_replication_state_reason", "_replication_stats"]);
        n.lastIndexOf = function(e, t) {
          for (var n = e.length - 1; n >= 0; n--)
            if (e.charAt(n) === t) return n;
          return -1
        }, n.clone = function(e) {
          return n.extend(!0, {}, e)
        }, n.inherits = e("inherits"), n.invalidIdError = function(e) {
          var t;
          if (e ? "string" != typeof e ? (t = new TypeError(c.INVALID_ID.message), t.status = 400) : /^_/.test(e) && !/^_(design|local)/.test(e) && (t = new TypeError(c.RESERVED_ID.message), t.status = 400) : (t = new TypeError(c.MISSING_ID.message), t.status = 412), t) throw t
        }, n.call = n.getArguments(function(e) {
          if (e.length) {
            var t = e.shift();
            "function" == typeof t && t.apply(this, e)
          }
        }), n.isLocalId = function(e) {
          return /^_local/.test(e)
        }, n.isDeleted = function(e, t) {
          t || (t = a.winningRev(e));
          var n = t.indexOf("-"); - 1 !== n && (t = t.substring(n + 1));
          var r = !1;
          return a.traverseRevTree(e.rev_tree, function(e, n, o, i, s) {
            o === t && (r = !!s.deleted)
          }), r
        }, n.revExists = function(e, t) {
          var n = !1;
          return a.traverseRevTree(e.rev_tree, function(e, r, o) {
            r + "-" + o === t && (n = !0)
          }), n
        }, n.filterChange = function(e) {
          return function(t) {
            var n = {},
              r = e.filter && "function" == typeof e.filter;
            if (n.query = e.query_params, e.filter && r && !e.filter.call(this, t.doc, n)) return !1;
            if (e.doc_ids && -1 === e.doc_ids.indexOf(t.id)) return !1;
            if (e.include_docs)
              for (var o in t.doc._attachments) t.doc._attachments.hasOwnProperty(o) && (t.doc._attachments[o].stub = !0);
            else delete t.doc;
            return !0
          }
        }, n.parseDoc = function(e, t) {
          var r, o, i, s, a = {
            status: "available"
          };
          if (e._deleted && (a.deleted = !0), t)
            if (e._id || (e._id = n.uuid()), o = n.uuid(32, 16).toLowerCase(), e._rev) {
              if (i = /^(\d+)-(.+)$/.exec(e._rev), !i) {
                var u = new TypeError("invalid value for property '_rev'");
                u.status = 400
              }
              e._rev_tree = [{
                pos: parseInt(i[1], 10),
                ids: [i[2], {
                    status: "missing"
                  },
                  [
                    [o, a, []]
                  ]
                ]
              }], r = parseInt(i[1], 10) + 1
            } else e._rev_tree = [{
              pos: 1,
              ids: [o, a, []]
            }], r = 1;
          else if (e._revisions && (e._rev_tree = [{
              pos: e._revisions.start - e._revisions.ids.length + 1,
              ids: e._revisions.ids.reduce(function(e, t) {
                return null === e ? [t, a, []] : [t, {
                    status: "missing"
                  },
                  [e]
                ]
              }, null)
            }], r = e._revisions.start, o = e._revisions.ids[0]), !e._rev_tree) {
            if (i = /^(\d+)-(.+)$/.exec(e._rev), !i) throw s = new TypeError(c.BAD_ARG.message), s.status = c.BAD_ARG.status, s;
            r = parseInt(i[1], 10), o = i[2], e._rev_tree = [{
              pos: parseInt(i[1], 10),
              ids: [i[2], a, []]
            }]
          }
          n.invalidIdError(e._id), e._rev = [r, o].join("-");
          var l = {
            metadata: {},
            data: {}
          };
          for (var f in e)
            if (e.hasOwnProperty(f)) {
              var d = "_" === f[0];
              if (d && !p[f]) throw s = new Error(c.DOC_VALIDATION.message + ": " + f), s.status = c.DOC_VALIDATION.status, s;
              d && !h[f] ? l.metadata[f.slice(1)] = e[f] : l.data[f] = e[f]
            }
          return l
        }, n.isCordova = function() {
          return "undefined" != typeof cordova || "undefined" != typeof PhoneGap || "undefined" != typeof phonegap
        }, n.hasLocalStorage = function() {
          if (i()) return !1;
          try {
            return r.localStorage
          } catch (e) {
            return !1
          }
        }, n.Changes = s, n.inherits(s, l), s.prototype.addListener = function(e, t, r, o) {
          function i() {
            r.changes({
              include_docs: o.include_docs,
              conflicts: o.conflicts,
              continuous: !1,
              descending: !1,
              filter: o.filter,
              view: o.view,
              since: o.since,
              query_params: o.query_params,
              onChange: function(e) {
                e.seq > o.since && !o.cancelled && (o.since = e.seq, n.call(o.onChange, e))
              }
            })
          }
          this.listeners[t] || (this.listeners[t] = i, this.on(e, i))
        }, s.prototype.removeListener = function(e, t) {
          t in this.listeners && l.prototype.removeListener.call(this, e, this.listeners[t])
        }, s.prototype.notifyLocalWindows = function(e) {
          this.isChrome ? chrome.storage.local.set({
            dbName: e
          }) : this.hasLocal && (localStorage[e] = "a" === localStorage[e] ? "b" : "a")
        }, s.prototype.notify = function(e) {
          this.emit(e), this.notifyLocalWindows(e)
        }, n.atob = t.browser && "atob" in r ? function(e) {
          return atob(e)
        } : function(e) {
          var t = new u(e, "base64");
          if (t.toString("base64") !== e) throw "Cannot base64 encode full string";
          return t.toString("binary")
        }, n.btoa = t.browser && "btoa" in r ? function(e) {
          return btoa(e)
        } : function(e) {
          return new u(e, "binary").toString("base64")
        }, n.fixBinary = function(e) {
          if (!t.browser) return e;
          for (var n = e.length, r = new ArrayBuffer(n), o = new Uint8Array(r), i = 0; n > i; i++) o[i] = e.charCodeAt(i);
          return r
        }, n.readAsBinaryString = function(e, t) {
          var r = new FileReader,
            o = "function" == typeof r.readAsBinaryString;
          r.onloadend = function(e) {
            var r = e.target.result || "";
            return o ? t(r) : void t(n.arrayBufferToBinaryString(r))
          }, o ? r.readAsBinaryString(e) : r.readAsArrayBuffer(e)
        }, n.once = function(e) {
          var t = !1;
          return n.getArguments(function(n) {
            if (t) throw new Error("once called  more than once");
            t = !0, e.apply(this, n)
          })
        }, n.toPromise = function(e) {
          return n.getArguments(function(r) {
            var o, i = this,
              s = "function" == typeof r[r.length - 1] ? r.pop() : !1;
            s && (o = function(e, n) {
              t.nextTick(function() {
                s(e, n)
              })
            });
            var a = new d(function(t, o) {
              var s;
              try {
                var a = n.once(function(e, n) {
                  e ? o(e) : t(n)
                });
                r.push(a), s = e.apply(i, r), s && "function" == typeof s.then && t(s)
              } catch (u) {
                o(u)
              }
            });
            return o && a.then(function(e) {
              o(null, e)
            }, o), a.cancel = function() {
              return this
            }, a
          })
        }, n.adapterFun = function(e, t) {
          return n.toPromise(n.getArguments(function(r) {
            if (this._closed) return d.reject(new Error("database is closed"));
            var o = this;
            return this.taskqueue.isReady ? t.apply(this, r) : new n.Promise(function(t, n) {
              o.taskqueue.addTask(function(i) {
                i ? n(i) : t(o[e].apply(o, r))
              })
            })
          }))
        }, n.arrayBufferToBinaryString = function(e) {
          for (var t = "", n = new Uint8Array(e), r = n.byteLength, o = 0; r > o; o++) t += String.fromCharCode(n[o]);
          return t
        }, n.cancellableFun = function(e, t, r) {
          r = r ? n.clone(!0, {}, r) : {};
          var o = new l,
            i = r.complete || function() {},
            s = r.complete = n.once(function(e, t) {
              e ? i(e) : (o.emit("end", t), i(null, t)), o.removeAllListeners()
            }),
            a = r.onChange || function() {},
            u = 0;
          t.on("destroyed", function() {
            o.removeAllListeners()
          }), r.onChange = function(e) {
            a(e), e.seq <= u || (u = e.seq, o.emit("change", e), e.deleted ? o.emit("delete", e) : 1 === e.changes.length && "1-" === e.changes[0].rev.slice(0, 1) ? o.emit("create", e) : o.emit("update", e))
          };
          var c = new d(function(e, t) {
            r.complete = function(n, r) {
              n ? t(n) : e(r)
            }
          });
          return c.then(function(e) {
            s(null, e)
          }, s), c.cancel = function() {
            c.isCancelled = !0, t.taskqueue.isReady && r.complete(null, {
              status: "cancelled"
            })
          }, t.taskqueue.isReady ? e(t, r, c) : t.taskqueue.addTask(function() {
            c.isCancelled ? r.complete(null, {
              status: "cancelled"
            }) : e(t, r, c)
          }), c.on = o.on.bind(o), c.once = o.once.bind(o), c.addListener = o.addListener.bind(o), c.removeListener = o.removeListener.bind(o), c.removeAllListeners = o.removeAllListeners.bind(o), c.setMaxListeners = o.setMaxListeners.bind(o), c.listeners = o.listeners.bind(o), c.emit = o.emit.bind(o), c
        }, n.MD5 = n.toPromise(e("./deps/md5")), n.explain404 = function(e) {
          t.browser && "console" in r && "info" in console && console.info("The above 404 is totally normal. " + e + "\n♥ the PouchDB team")
        }, n.parseUri = e("./deps/parse-uri"), n.compare = function(e, t) {
          return t > e ? -1 : e > t ? 1 : 0
        }
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"), "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "./deps/ajax": 9,
      "./deps/blob": 10,
      "./deps/buffer": 29,
      "./deps/collections": 11,
      "./deps/errors": 12,
      "./deps/md5": 13,
      "./deps/parse-uri": 15,
      "./deps/uuid": 17,
      "./merge": 21,
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      argsarray: 28,
      bluebird: 36,
      events: 30,
      inherits: 32,
      "pouchdb-extend": 51
    }],
    27: [function(e, t) {
      t.exports = "3.1.0"
    }, {}],
    28: [function(e, t) {
      "use strict";

      function n(e) {
        return function() {
          var t = arguments.length;
          if (t) {
            for (var n = [], r = -1; ++r < t;) n[r] = arguments[r];
            return e.call(this, n)
          }
          return e.call(this, [])
        }
      }
      t.exports = n
    }, {}],
    29: [function() {}, {}],
    30: [function(e, t) {
      function n() {
        this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
      }

      function r(e) {
        return "function" == typeof e
      }

      function o(e) {
        return "number" == typeof e
      }

      function i(e) {
        return "object" == typeof e && null !== e
      }

      function s(e) {
        return void 0 === e
      }
      t.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function(e) {
        if (!o(e) || 0 > e || isNaN(e)) throw TypeError("n must be a positive number");
        return this._maxListeners = e, this
      }, n.prototype.emit = function(e) {
        var t, n, o, a, u, c;
        if (this._events || (this._events = {}), "error" === e && (!this._events.error || i(this._events.error) && !this._events.error.length)) {
          if (t = arguments[1], t instanceof Error) throw t;
          throw TypeError('Uncaught, unspecified "error" event.')
        }
        if (n = this._events[e], s(n)) return !1;
        if (r(n)) switch (arguments.length) {
          case 1:
            n.call(this);
            break;
          case 2:
            n.call(this, arguments[1]);
            break;
          case 3:
            n.call(this, arguments[1], arguments[2]);
            break;
          default:
            for (o = arguments.length, a = new Array(o - 1), u = 1; o > u; u++) a[u - 1] = arguments[u];
            n.apply(this, a)
        } else if (i(n)) {
          for (o = arguments.length, a = new Array(o - 1), u = 1; o > u; u++) a[u - 1] = arguments[u];
          for (c = n.slice(), o = c.length, u = 0; o > u; u++) c[u].apply(this, a)
        }
        return !0
      }, n.prototype.addListener = function(e, t) {
        var o;
        if (!r(t)) throw TypeError("listener must be a function");
        if (this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, r(t.listener) ? t.listener : t), this._events[e] ? i(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, i(this._events[e]) && !this._events[e].warned) {
          var o;
          o = s(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, o && o > 0 && this._events[e].length > o && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), "function" == typeof console.trace && console.trace())
        }
        return this
      }, n.prototype.on = n.prototype.addListener, n.prototype.once = function(e, t) {
        function n() {
          this.removeListener(e, n), o || (o = !0, t.apply(this, arguments))
        }
        if (!r(t)) throw TypeError("listener must be a function");
        var o = !1;
        return n.listener = t, this.on(e, n), this
      }, n.prototype.removeListener = function(e, t) {
        var n, o, s, a;
        if (!r(t)) throw TypeError("listener must be a function");
        if (!this._events || !this._events[e]) return this;
        if (n = this._events[e], s = n.length, o = -1, n === t || r(n.listener) && n.listener === t) delete this._events[e], this._events.removeListener && this.emit("removeListener", e, t);
        else if (i(n)) {
          for (a = s; a-- > 0;)
            if (n[a] === t || n[a].listener && n[a].listener === t) {
              o = a;
              break
            }
          if (0 > o) return this;
          1 === n.length ? (n.length = 0, delete this._events[e]) : n.splice(o, 1), this._events.removeListener && this.emit("removeListener", e, t)
        }
        return this
      }, n.prototype.removeAllListeners = function(e) {
        var t, n;
        if (!this._events) return this;
        if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
        if (0 === arguments.length) {
          for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
          return this.removeAllListeners("removeListener"), this._events = {}, this
        }
        if (n = this._events[e], r(n)) this.removeListener(e, n);
        else
          for (; n.length;) this.removeListener(e, n[n.length - 1]);
        return delete this._events[e], this
      }, n.prototype.listeners = function(e) {
        var t;
        return t = this._events && this._events[e] ? r(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
      }, n.listenerCount = function(e, t) {
        var n;
        return n = e._events && e._events[t] ? r(e._events[t]) ? 1 : e._events[t].length : 0
      }
    }, {}],
    31: [function(e, t) {
      var n = t.exports = {};
      n.nextTick = function() {
        var e = "undefined" != typeof window && window.setImmediate,
          t = "undefined" != typeof window && window.postMessage && window.addEventListener;
        if (e) return function(e) {
          return window.setImmediate(e)
        };
        if (t) {
          var n = [];
          return window.addEventListener("message", function(e) {
              var t = e.source;
              if ((t === window || null === t) && "process-tick" === e.data && (e.stopPropagation(), n.length > 0)) {
                var r = n.shift();
                r()
              }
            }, !0),
            function(e) {
              n.push(e), window.postMessage("process-tick", "*")
            }
        }
        return function(e) {
          setTimeout(e, 0)
        }
      }(), n.title = "browser", n.browser = !0, n.env = {}, n.argv = [], n.binding = function() {
        throw new Error("process.binding is not supported")
      }, n.cwd = function() {
        return "/"
      }, n.chdir = function() {
        throw new Error("process.chdir is not supported")
      }
    }, {}],
    32: [function(e, t) {
      t.exports = "function" == typeof Object.create ? function(e, t) {
        e.super_ = t, e.prototype = Object.create(t.prototype, {
          constructor: {
            value: e,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        })
      } : function(e, t) {
        e.super_ = t;
        var n = function() {};
        n.prototype = t.prototype, e.prototype = new n, e.prototype.constructor = e
      }
    }, {}],
    33: [function(e, t) {
      "use strict";

      function n() {}
      t.exports = n
    }, {}],
    34: [function(e, t) {
      "use strict";

      function n(e) {
        function t(e, t) {
          function r(e) {
            c[t] = e, ++l === n & !u && (u = !0, a.resolve(d, c))
          }
          i(e).then(r, function(e) {
            u || (u = !0, a.reject(d, e))
          })
        }
        if ("[object Array]" !== Object.prototype.toString.call(e)) return o(new TypeError("must be an array"));
        var n = e.length,
          u = !1;
        if (!n) return i([]);
        for (var c = new Array(n), l = 0, f = -1, d = new r(s); ++f < n;) t(e[f], f);
        return d
      }
      var r = e("./promise"),
        o = e("./reject"),
        i = e("./resolve"),
        s = e("./INTERNAL"),
        a = e("./handlers");
      t.exports = n
    }, {
      "./INTERNAL": 33,
      "./handlers": 35,
      "./promise": 37,
      "./reject": 40,
      "./resolve": 41
    }],
    35: [function(e, t, n) {
      "use strict";

      function r(e) {
        var t = e && e.then;
        return e && "object" == typeof e && "function" == typeof t ? function() {
          t.apply(e, arguments)
        } : void 0
      }
      var o = e("./tryCatch"),
        i = e("./resolveThenable"),
        s = e("./states");
      n.resolve = function(e, t) {
        var a = o(r, t);
        if ("error" === a.status) return n.reject(e, a.value);
        var u = a.value;
        if (u) i.safely(e, u);
        else {
          e.state = s.FULFILLED, e.outcome = t;
          for (var c = -1, l = e.queue.length; ++c < l;) e.queue[c].callFulfilled(t)
        }
        return e
      }, n.reject = function(e, t) {
        e.state = s.REJECTED, e.outcome = t;
        for (var n = -1, r = e.queue.length; ++n < r;) e.queue[n].callRejected(t);
        return e
      }
    }, {
      "./resolveThenable": 42,
      "./states": 43,
      "./tryCatch": 44
    }],
    36: [function(e, t, n) {
      t.exports = n = e("./promise"), n.resolve = e("./resolve"), n.reject = e("./reject"), n.all = e("./all"), n.race = e("./race")
    }, {
      "./all": 34,
      "./promise": 37,
      "./race": 39,
      "./reject": 40,
      "./resolve": 41
    }],
    37: [function(e, t) {
      "use strict";

      function n(e) {
        if (!(this instanceof n)) return new n(e);
        if ("function" != typeof e) throw new TypeError("reslover must be a function");
        this.state = s.PENDING, this.queue = [], this.outcome = void 0, e !== o && i.safely(this, e)
      }
      var r = e("./unwrap"),
        o = e("./INTERNAL"),
        i = e("./resolveThenable"),
        s = e("./states"),
        a = e("./queueItem");
      t.exports = n, n.prototype["catch"] = function(e) {
        return this.then(null, e)
      }, n.prototype.then = function(e, t) {
        if ("function" != typeof e && this.state === s.FULFILLED || "function" != typeof t && this.state === s.REJECTED) return this;
        var i = new n(o);
        if (this.state !== s.PENDING) {
          var u = this.state === s.FULFILLED ? e : t;
          r(i, u, this.outcome)
        } else this.queue.push(new a(i, e, t));
        return i
      }
    }, {
      "./INTERNAL": 33,
      "./queueItem": 38,
      "./resolveThenable": 42,
      "./states": 43,
      "./unwrap": 45
    }],
    38: [function(e, t) {
      "use strict";

      function n(e, t, n) {
        this.promise = e, "function" == typeof t && (this.onFulfilled = t, this.callFulfilled = this.otherCallFulfilled), "function" == typeof n && (this.onRejected = n, this.callRejected = this.otherCallRejected)
      }
      var r = e("./handlers"),
        o = e("./unwrap");
      t.exports = n, n.prototype.callFulfilled = function(e) {
        r.resolve(this.promise, e)
      }, n.prototype.otherCallFulfilled = function(e) {
        o(this.promise, this.onFulfilled, e)
      }, n.prototype.callRejected = function(e) {
        r.reject(this.promise, e)
      }, n.prototype.otherCallRejected = function(e) {
        o(this.promise, this.onRejected, e)
      }
    }, {
      "./handlers": 35,
      "./unwrap": 45
    }],
    39: [function(e, t) {
      "use strict";

      function n(e) {
        function t(e) {
          i(e).then(function(e) {
            u || (u = !0, a.resolve(l, e))
          }, function(e) {
            u || (u = !0, a.reject(l, e))
          })
        }
        if ("[object Array]" !== Object.prototype.toString.call(e)) return o(new TypeError("must be an array"));
        var n = e.length,
          u = !1;
        if (!n) return i([]);
        for (var c = -1, l = new r(s); ++c < n;) t(e[c]);
        return l
      }
      var r = e("./promise"),
        o = e("./reject"),
        i = e("./resolve"),
        s = e("./INTERNAL"),
        a = e("./handlers");
      t.exports = n
    }, {
      "./INTERNAL": 33,
      "./handlers": 35,
      "./promise": 37,
      "./reject": 40,
      "./resolve": 41
    }],
    40: [function(e, t) {
      "use strict";

      function n(e) {
        var t = new r(o);
        return i.reject(t, e)
      }
      var r = e("./promise"),
        o = e("./INTERNAL"),
        i = e("./handlers");
      t.exports = n
    }, {
      "./INTERNAL": 33,
      "./handlers": 35,
      "./promise": 37
    }],
    41: [function(e, t) {
      "use strict";

      function n(e) {
        if (e) return e instanceof r ? e : i.resolve(new r(o), e);
        var t = typeof e;
        switch (t) {
          case "boolean":
            return s;
          case "undefined":
            return u;
          case "object":
            return a;
          case "number":
            return c;
          case "string":
            return l
        }
      }
      var r = e("./promise"),
        o = e("./INTERNAL"),
        i = e("./handlers");
      t.exports = n;
      var s = i.resolve(new r(o), !1),
        a = i.resolve(new r(o), null),
        u = i.resolve(new r(o), void 0),
        c = i.resolve(new r(o), 0),
        l = i.resolve(new r(o), "")
    }, {
      "./INTERNAL": 33,
      "./handlers": 35,
      "./promise": 37
    }],
    42: [function(e, t, n) {
      "use strict";

      function r(e, t) {
        function n(t) {
          a || (a = !0, o.reject(e, t))
        }

        function r(t) {
          a || (a = !0, o.resolve(e, t))
        }

        function s() {
          t(r, n)
        }
        var a = !1,
          u = i(s);
        "error" === u.status && n(u.value)
      }
      var o = e("./handlers"),
        i = e("./tryCatch");
      n.safely = r
    }, {
      "./handlers": 35,
      "./tryCatch": 44
    }],
    43: [function(e, t, n) {
      n.REJECTED = ["REJECTED"], n.FULFILLED = ["FULFILLED"], n.PENDING = ["PENDING"]
    }, {}],
    44: [function(e, t) {
      "use strict";

      function n(e, t) {
        var n = {};
        try {
          n.value = e(t), n.status = "success"
        } catch (r) {
          n.status = "error", n.value = r
        }
        return n
      }
      t.exports = n
    }, {}],
    45: [function(e, t) {
      "use strict";

      function n(e, t, n) {
        r(function() {
          var r;
          try {
            r = t(n)
          } catch (i) {
            return o.reject(e, i)
          }
          r === e ? o.reject(e, new TypeError("Cannot resolve promise with itself")) : o.resolve(e, r)
        })
      }
      var r = e("immediate"),
        o = e("./handlers");
      t.exports = n
    }, {
      "./handlers": 35,
      immediate: 46
    }],
    46: [function(e, t) {
      "use strict";

      function n() {
        o = !0;
        for (var e, t, n = a.length; n;) {
          for (t = a, a = [], e = -1; ++e < n;) t[e]();
          n = a.length
        }
        o = !1
      }

      function r(e) {
        1 !== a.push(e) || o || i()
      }
      for (var o, i, s = [e("./nextTick"), e("./mutation.js"), e("./messageChannel"), e("./stateChange"), e("./timeout")], a = [], u = -1, c = s.length; ++u < c;)
        if (s[u] && s[u].test && s[u].test()) {
          i = s[u].install(n);
          break
        }
      t.exports = r
    }, {
      "./messageChannel": 47,
      "./mutation.js": 48,
      "./nextTick": 29,
      "./stateChange": 49,
      "./timeout": 50
    }],
    47: [function(e, t, n) {
      (function(e) {
        "use strict";
        n.test = function() {
          return e.setImmediate ? !1 : "undefined" != typeof e.MessageChannel
        }, n.install = function(t) {
          var n = new e.MessageChannel;
          return n.port1.onmessage = t,
            function() {
              n.port2.postMessage(0)
            }
        }
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    48: [function(e, t, n) {
      (function(e) {
        "use strict";
        var t = e.MutationObserver || e.WebKitMutationObserver;
        n.test = function() {
          return t
        }, n.install = function(n) {
          var r = 0,
            o = new t(n),
            i = e.document.createTextNode("");
          return o.observe(i, {
              characterData: !0
            }),
            function() {
              i.data = r = ++r % 2
            }
        }
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    49: [function(e, t, n) {
      (function(e) {
        "use strict";
        n.test = function() {
          return "document" in e && "onreadystatechange" in e.document.createElement("script")
        }, n.install = function(t) {
          return function() {
            var n = e.document.createElement("script");
            return n.onreadystatechange = function() {
              t(), n.onreadystatechange = null, n.parentNode.removeChild(n), n = null
            }, e.document.documentElement.appendChild(n), t
          }
        }
      }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    50: [function(e, t, n) {
      "use strict";
      n.test = function() {
        return !0
      }, n.install = function(e) {
        return function() {
          setTimeout(e, 0)
        }
      }
    }, {}],
    51: [function(e, t) {
      "use strict";

      function n(e) {
        return null === e ? String(e) : "object" == typeof e || "function" == typeof e ? u[d.call(e)] || "object" : typeof e
      }

      function r(e) {
        return null !== e && e === e.window
      }

      function o(e) {
        if (!e || "object" !== n(e) || e.nodeType || r(e)) return !1;
        try {
          if (e.constructor && !p.call(e, "constructor") && !p.call(e.constructor.prototype, "isPrototypeOf")) return !1
        } catch (t) {
          return !1
        }
        var o;
        for (o in e);
        return void 0 === o || p.call(e, o)
      }

      function i(e) {
        return "function" === n(e)
      }

      function s() {
        for (var e = [], t = -1, n = arguments.length, r = new Array(n); ++t < n;) r[t] = arguments[t];
        var o = {};
        e.push({
          args: r,
          result: {
            container: o,
            key: "key"
          }
        });
        for (var i; i = e.pop();) a(e, i.args, i.result);
        return o.key
      }

      function a(e, t, n) {
        var r, s, a, u, c, l, f, d = t[0] || {},
          p = 1,
          v = t.length,
          m = !1,
          _ = /\d+/;
        for ("boolean" == typeof d && (m = d, d = t[1] || {}, p = 2), "object" == typeof d || i(d) || (d = {}), v === p && (d = this, --p); v > p; p++)
          if (null != (r = t[p])) {
            f = h(r);
            for (s in r)
              if (!(s in Object.prototype)) {
                if (f && !_.test(s)) continue;
                if (a = d[s], u = r[s], d === u) continue;
                m && u && (o(u) || (c = h(u))) ? (c ? (c = !1, l = a && h(a) ? a : []) : l = a && o(a) ? a : {}, e.push({
                  args: [m, l, u],
                  result: {
                    container: d,
                    key: s
                  }
                })) : void 0 !== u && (h(r) && i(u) || (d[s] = u))
              }
          }
        n.container[n.key] = d
      }
      for (var u = {}, c = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"], l = 0; l < c.length; l++) {
        var f = c[l];
        u["[object " + f + "]"] = f.toLowerCase()
      }
      var d = u.toString,
        p = u.hasOwnProperty,
        h = Array.isArray || function(e) {
          return "array" === n(e)
        };
      t.exports = s
    }, {}],
    52: [function(e, t) {
      "use strict";
      var n = e("./upsert"),
        r = e("./utils"),
        o = r.Promise;
      t.exports = function(e) {
        var t = e.db,
          i = e.viewName,
          s = e.map,
          a = e.reduce,
          u = e.temporary,
          c = s.toString() + (a && a.toString()) + "undefined";
        if (!u && t._cachedViews) {
          var l = t._cachedViews[c];
          if (l) return o.resolve(l)
        }
        return t.info().then(function(e) {
          function o(e) {
            e.views = e.views || {};
            var t = i; - 1 === t.indexOf("/") && (t = i + "/" + i);
            var n = e.views[t] = e.views[t] || {};
            if (!n[l]) return n[l] = !0, e
          }
          var l = e.db_name + "-mrview-" + (u ? "temp" : r.MD5(c));
          return n(t, "_local/mrviews", o).then(function() {
            return t.registerDependentDatabase(l).then(function(e) {
              var n = e.db;
              n.auto_compaction = !0;
              var r = {
                name: l,
                db: n,
                sourceDB: t,
                adapter: t.adapter,
                mapFun: s,
                reduceFun: a
              };
              return r.db.get("_local/lastSeq")["catch"](function(e) {
                if (404 !== e.status) throw e
              }).then(function(e) {
                return r.seq = e ? e.seq : 0, u || (t._cachedViews = t._cachedViews || {}, t._cachedViews[c] = r, r.db.on("destroyed", function() {
                  delete t._cachedViews[c]
                })), r
              })
            })
          })
        })
      }
    }, {
      "./upsert": 58,
      "./utils": 59
    }],
    53: [function(_dereq_, module, exports) {
      "use strict";
      module.exports = function(func, emit, sum, log, isArray, toJSON) {
        return eval("'use strict'; (" + func.replace(/;\s*$/, "") + ");")
      }
    }, {}],
    54: [function(e, t, n) {
      (function(t) {
        "use strict";

        function r(e) {
          return -1 === e.indexOf("/") ? [e, e] : e.split("/")
        }

        function o(e, t, n) {
          try {
            return {
              output: t.apply(null, n)
            }
          } catch (r) {
            return e.emit("error", r), {
              error: r
            }
          }
        }

        function i(e, t) {
          var n = S(e.key, t.key);
          return 0 !== n ? n : S(e.value, t.value)
        }

        function s(e, t, n) {
          return n = n || 0, "number" == typeof t ? e.slice(n, t + n) : n > 0 ? e.slice(n) : e
        }

        function a(e) {
          var t = new Error("builtin " + e + " function requires map values to be numbers or number arrays");
          return t.name = "invalid_value", t.status = 500, t
        }

        function u(e) {
          for (var t = 0, n = 0, r = e.length; r > n; n++) {
            var o = e[n];
            if ("number" != typeof o) {
              if (!Array.isArray(o)) throw a("_sum");
              t = "number" == typeof t ? [t] : t;
              for (var i = 0, s = o.length; s > i; i++) {
                var u = o[i];
                if ("number" != typeof u) throw a("_sum");
                "undefined" == typeof t[i] ? t.push(u) : t[i] += u
              }
            } else "number" == typeof t ? t += o : t[0] += o
          }
          return t
        }

        function c(e, t, n, r) {
          var o = t[e];
          "undefined" != typeof o && (r && (o = encodeURIComponent(JSON.stringify(o))), n.push(e + "=" + o))
        }

        function l(e, t) {
          var n = e.descending ? "endkey" : "startkey",
            r = e.descending ? "startkey" : "endkey";
          if ("undefined" != typeof e[n] && "undefined" != typeof e[r] && S(e[n], e[r]) > 0) throw new g("No rows can match your key range, reverse your start_key and end_key or set {descending : true}");
          if (t.reduce && e.reduce !== !1) {
            if (e.include_docs) throw new g("{include_docs:true} is invalid for reduce");
            if (e.keys && e.keys.length > 1 && !e.group && !e.group_level) throw new g("Multi-key fetches for reduce views must use {group: true}")
          }
          if (e.group_level) {
            if ("number" != typeof e.group_level) throw new g('Invalid value for integer: "' + e.group_level + '"');
            if (e.group_level < 0) throw new g('Invalid value for positive integer: "' + e.group_level + '"')
          }
        }

        function f(e, t, n) {
          var o, i = [],
            s = "GET";
          if (c("reduce", n, i), c("include_docs", n, i), c("limit", n, i), c("descending", n, i), c("group", n, i), c("group_level", n, i), c("skip", n, i), c("stale", n, i), c("conflicts", n, i), c("startkey", n, i, !0), c("endkey", n, i, !0), c("inclusive_end", n, i), c("key", n, i, !0), i = i.join("&"), i = "" === i ? "" : "?" + i, "undefined" != typeof n.keys) {
            var a = 2e3,
              u = "keys=" + encodeURIComponent(JSON.stringify(n.keys));
            u.length + i.length + 1 <= a ? i += ("?" === i[0] ? "&" : "?") + u : (s = "POST", "string" == typeof t ? o = JSON.stringify({
              keys: n.keys
            }) : t.keys = n.keys)
          }
          if ("string" == typeof t) {
            var l = r(t);
            return e.request({
              method: s,
              url: "_design/" + l[0] + "/_view/" + l[1] + i,
              body: o
            })
          }
          return o = o || {}, Object.keys(t).forEach(function(e) {
            o[e] = Array.isArray(t[e]) ? t[e] : t[e].toString()
          }), e.request({
            method: "POST",
            url: "_temp_view" + i,
            body: o
          })
        }

        function d(e) {
          return function(t) {
            if (404 === t.status) return e;
            throw t
          }
        }

        function p(e, t, n) {
          var r = "_local/doc_" + e;
          return t.db.get(r)["catch"](d({
            _id: r,
            keys: []
          })).then(function(r) {
            return O.resolve().then(function() {
              return r.keys.length ? t.db.allDocs({
                keys: r.keys,
                include_docs: !0
              }) : {
                rows: []
              }
            }).then(function(t) {
              var o = t.rows.map(function(e) {
                  return e.doc
                }).filter(function(e) {
                  return e
                }),
                i = n[e],
                s = {};
              o.forEach(function(e) {
                if (s[e._id] = !0, e._deleted = !i[e._id], !e._deleted) {
                  var t = i[e._id];
                  "value" in t && (e.value = t.value)
                }
              });
              var a = Object.keys(i);
              return a.forEach(function(e) {
                if (!s[e]) {
                  var t = {
                      _id: e
                    },
                    n = i[e];
                  "value" in n && (t.value = n.value), o.push(t)
                }
              }), r.keys = A.uniq(a.concat(r.keys)), o.splice(0, 0, r), o
            })
          })
        }

        function h(e, t, n) {
          var r = "_local/lastSeq";
          return e.db.get(r)["catch"](d({
            _id: r,
            seq: 0
          })).then(function(r) {
            var o = Object.keys(t);
            return O.all(o.map(function(n) {
              return p(n, e, t)
            })).then(function(t) {
              var o = [];
              return t.forEach(function(e) {
                o = o.concat(e)
              }), r.seq = n, o.push(r), e.db.bulkDocs({
                docs: o
              })
            })
          })
        }

        function v(e, t, n) {
          0 === n.group_level && delete n.group_level;
          var r, i = n.group || n.group_level;
          r = C[e.reduceFun] ? C[e.reduceFun] : T(e.reduceFun.toString(), null, u, b, Array.isArray, JSON.parse);
          var a = [],
            c = n.group_level;
          t.forEach(function(e) {
            var t = a[a.length - 1],
              n = i ? e.key : null;
            return i && Array.isArray(n) && "number" == typeof c && (n = n.length > c ? n.slice(0, c) : n), t && 0 === S(t.key[0][0], n) ? (t.key.push([n, e.id]), void t.value.push(e.value)) : void a.push({
              key: [
                [n, e.id]
              ],
              value: [e.value]
            })
          });
          for (var l = 0, f = a.length; f > l; l++) {
            var d = a[l],
              p = o(e.sourceDB, r, [d.key, d.value, !1]);
            d.value = p.error ? null : p.output, d.key = d.key[0][0]
          }
          return {
            rows: s(a, n.limit, n.skip)
          }
        }

        function m(e) {
          return e.request({
            method: "POST",
            url: "_view_cleanup"
          })
        }

        function _(e, n, o) {
          if ("http" === e.type()) return f(e, n, o);
          if ("string" != typeof n) {
            l(o, n);
            var i = {
              db: e,
              viewName: "temp_view/temp_view",
              map: n.map,
              reduce: n.reduce,
              temporary: !0
            };
            return I.add(function() {
              return x(i).then(function(e) {
                function t() {
                  return e.db.destroy()
                }
                return A.fin(D(e).then(function() {
                  return N(e, o)
                }), t)
              })
            }), I.finish()
          }
          var s = n,
            a = r(s),
            u = a[0],
            c = a[1];
          return e.get("_design/" + u).then(function(n) {
            var r = n.views && n.views[c];
            if (!r || "string" != typeof r.map) throw new y("ddoc " + u + " has no view named " + c);
            l(o, r);
            var i = {
              db: e,
              viewName: s,
              map: r.map,
              reduce: r.reduce
            };
            return x(i).then(function(e) {
              return "ok" === o.stale || "update_after" === o.stale ? ("update_after" === o.stale && t.nextTick(function() {
                D(e)
              }), N(e, o)) : D(e).then(function() {
                return N(e, o)
              })
            })
          })
        }

        function g(e) {
          this.status = 400, this.name = "query_parse_error", this.message = e, this.error = !0;
          try {
            Error.captureStackTrace(this, g)
          } catch (t) {}
        }

        function y(e) {
          this.status = 404, this.name = "not_found", this.message = e, this.error = !0;
          try {
            Error.captureStackTrace(this, y)
          } catch (t) {}
        }
        var b, w = e("pouchdb-collate"),
          E = e("./taskqueue"),
          S = w.collate,
          k = w.toIndexableString,
          q = w.normalizeKey,
          x = e("./create-view"),
          T = e("./evalfunc");
        b = "undefined" != typeof console && "function" == typeof console.log ? Function.prototype.bind.call(console.log, console) : function() {};
        var A = e("./utils"),
          O = A.Promise,
          L = new E,
          I = new E,
          R = 50,
          C = {
            _sum: function(e, t) {
              return u(t)
            },
            _count: function(e, t) {
              return t.length
            },
            _stats: function(e, t) {
              function n(e) {
                for (var t = 0, n = 0, r = e.length; r > n; n++) {
                  var o = e[n];
                  t += o * o
                }
                return t
              }
              return {
                sum: u(t),
                min: Math.min.apply(null, t),
                max: Math.max.apply(null, t),
                count: t.length,
                sumsqr: n(t)
              }
            }
          },
          D = A.sequentialize(L, function(e) {
            function t(e, t) {
              var n = {
                id: s._id,
                key: q(e)
              };
              "undefined" != typeof t && null !== t && (n.value = q(t)), r.push(n)
            }

            function n(t, n) {
              return function() {
                return h(e, t, n)
              }
            }
            var r, s, a;
            if ("function" == typeof e.mapFun && 2 === e.mapFun.length) {
              var c = e.mapFun;
              a = function(e) {
                return c(e, t)
              }
            } else a = T(e.mapFun.toString(), t, u, b, Array.isArray, JSON.parse);
            var l = e.seq || 0,
              f = new E;
            return new O(function(t, u) {
              function c() {
                f.finish().then(function() {
                  e.seq = l, t()
                })
              }

              function d() {
                function t(e) {
                  u(e)
                }
                e.sourceDB.changes({
                  conflicts: !0,
                  include_docs: !0,
                  since: l,
                  limit: R
                }).on("complete", function(t) {
                  var u = t.results;
                  if (!u.length) return c();
                  for (var p = {}, h = 0, v = u.length; v > h; h++) {
                    var m = u[h];
                    if ("_" !== m.doc._id[0]) {
                      r = [], s = m.doc, s._deleted || o(e.sourceDB, a, [s]), r.sort(i);
                      for (var _, g = {}, y = 0, b = r.length; b > y; y++) {
                        var w = r[y],
                          E = [w.key, w.id];
                        w.key === _ && E.push(y);
                        var S = k(E);
                        g[S] = w, _ = w.key
                      }
                      p[m.doc._id] = g
                    }
                    l = m.seq
                  }
                  return f.add(n(p, l)), u.length < R ? c() : d()
                }).on("error", t)
              }
              d()
            })
          }),
          N = A.sequentialize(L, function(e, t) {
            function n(t) {
              return t.include_docs = !0, e.db.allDocs(t).then(function(e) {
                return o = e.total_rows, e.rows.map(function(e) {
                  if ("value" in e.doc && "object" == typeof e.doc.value && null !== e.doc.value) {
                    var t = Object.keys(e.doc.value).sort(),
                      n = ["id", "key", "value"];
                    if (!(n > t || t > n)) return e.doc.value
                  }
                  var r = w.parseIndexableString(e.doc._id);
                  return {
                    key: r[0],
                    id: r[1],
                    value: "value" in e.doc ? e.doc.value : null
                  }
                })
              })
            }

            function r(n) {
              var r;
              if (r = i ? v(e, n, t) : {
                  total_rows: o,
                  offset: s,
                  rows: n
                }, t.include_docs) {
                var a = n.map(function(n) {
                  var r = n.value,
                    o = r && "object" == typeof r && r._id || n.id;
                  return e.sourceDB.get(o, {
                    conflicts: t.conflicts
                  }).then(function(e) {
                    n.doc = e
                  }, function() {})
                });
                return O.all(a).then(function() {
                  return r
                })
              }
              return r
            }
            var o, i = e.reduceFun && t.reduce !== !1,
              s = t.skip || 0;
            "undefined" == typeof t.keys || t.keys.length || (t.limit = 0, delete t.keys);
            var a = function(e) {
              return e.reduce(function(e, t) {
                return e.concat(t)
              })
            };
            if ("undefined" != typeof t.keys) {
              var u = t.keys,
                c = u.map(function(e) {
                  var t = {
                    startkey: k([e]),
                    endkey: k([e, {}])
                  };
                  return n(t)
                });
              return O.all(c).then(a).then(r)
            }
            var l = {
              descending: t.descending
            };
            if ("undefined" != typeof t.startkey && (l.startkey = k(t.descending ? [t.startkey, {}] : [t.startkey])), "undefined" != typeof t.endkey) {
              var f = t.inclusive_end !== !1;
              t.descending && (f = !f), l.endkey = k(f ? [t.endkey, {}] : [t.endkey])
            }
            if ("undefined" != typeof t.key) {
              var d = k([t.key]),
                p = k([t.key, {}]);
              l.descending ? (l.endkey = d, l.startkey = p) : (l.startkey = d, l.endkey = p)
            }
            return i || ("number" == typeof t.limit && (l.limit = t.limit), l.skip = s), n(l).then(r)
          }),
          j = A.sequentialize(L, function(e) {
            return e.get("_local/mrviews").then(function(t) {
              var n = {};
              Object.keys(t.views).forEach(function(e) {
                var t = r(e),
                  o = "_design/" + t[0],
                  i = t[1];
                n[o] = n[o] || {}, n[o][i] = !0
              });
              var o = {
                keys: Object.keys(n),
                include_docs: !0
              };
              return e.allDocs(o).then(function(r) {
                var o = {};
                r.rows.forEach(function(e) {
                  var r = e.key.substring(8);
                  Object.keys(n[e.key]).forEach(function(n) {
                    var i = r + "/" + n;
                    t.views[i] || (i = n);
                    var s = Object.keys(t.views[i]),
                      a = e.doc && e.doc.views && e.doc.views[n];
                    s.forEach(function(e) {
                      o[e] = o[e] || a
                    })
                  })
                });
                var i = Object.keys(o).filter(function(e) {
                    return !o[e]
                  }),
                  s = i.map(function(t) {
                    return e.constructor.destroy(t, {
                      adapter: e.adapter
                    })
                  });
                return O.all(s).then(function() {
                  return {
                    ok: !0
                  }
                })
              })
            }, d({
              ok: !0
            }))
          });
        n.viewCleanup = A.callbackify(function() {
          var e = this;
          return "http" === e.type() ? m(e) : j(e)
        }), n.query = function(e, t, n) {
          "function" == typeof t && (n = t, t = {}), t = A.extend(!0, {}, t), "function" == typeof e && (e = {
            map: e
          });
          var r = this,
            o = O.resolve().then(function() {
              return _(r, e, t)
            });
          return A.promisedCallback(o, n), o
        }, A.inherits(g, Error), A.inherits(y, Error)
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
    }, {
      "./create-view": 52,
      "./evalfunc": 53,
      "./taskqueue": 57,
      "./utils": 59,
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      "pouchdb-collate": 55
    }],
    55: [function(e, t, n) {
      "use strict";

      function r(e) {
        if (null !== e) switch (typeof e) {
          case "boolean":
            return e ? 1 : 0;
          case "number":
            return l(e);
          case "string":
            return e.replace(/\u0002/g, "").replace(/\u0001/g, "").replace(/\u0000/g, "");
          case "object":
            var t = Array.isArray(e),
              r = t ? e : Object.keys(e),
              o = -1,
              i = r.length,
              s = "";
            if (t)
              for (; ++o < i;) s += n.toIndexableString(r[o]);
            else
              for (; ++o < i;) {
                var a = r[o];
                s += n.toIndexableString(a) + n.toIndexableString(e[a])
              }
            return s
        }
        return ""
      }

      function o(e, t) {
        var n, r = t,
          o = "1" === e[t];
        if (o) n = 0, t++;
        else {
          var i = "0" === e[t];
          t++;
          var s = "",
            a = e.substring(t, t + d),
            u = parseInt(a, 10) + f;
          for (i && (u = -u), t += d;;) {
            var c = e[t];
            if ("\x00" === c) break;
            s += c, t++
          }
          s = s.split("."), n = 1 === s.length ? parseInt(s, 10) : parseFloat(s[0] + "." + s[1]), i && (n -= 10), 0 !== u && (n = parseFloat(n + "e" + u))
        }
        return {
          num: n,
          length: t - r
        }
      }

      function i(e, t) {
        var n = e.pop();
        if (t.length) {
          var r = t[t.length - 1];
          n === r.element && (t.pop(), r = t[t.length - 1]);
          var o = r.element,
            i = r.index;
          if (Array.isArray(o)) o.push(n);
          else if (i === e.length - 2) {
            var s = e.pop();
            o[s] = n
          } else e.push(n)
        }
      }

      function s(e, t) {
        for (var r = Math.min(e.length, t.length), o = 0; r > o; o++) {
          var i = n.collate(e[o], t[o]);
          if (0 !== i) return i
        }
        return e.length === t.length ? 0 : e.length > t.length ? 1 : -1
      }

      function a(e, t) {
        return e === t ? 0 : e > t ? 1 : -1
      }

      function u(e, t) {
        for (var r = Object.keys(e), o = Object.keys(t), i = Math.min(r.length, o.length), s = 0; i > s; s++) {
          var a = n.collate(r[s], o[s]);
          if (0 !== a) return a;
          if (a = n.collate(e[r[s]], t[o[s]]), 0 !== a) return a
        }
        return r.length === o.length ? 0 : r.length > o.length ? 1 : -1
      }

      function c(e) {
        var t = ["boolean", "number", "string", "object"],
          n = t.indexOf(typeof e);
        return ~n ? null === e ? 1 : Array.isArray(e) ? 5 : 3 > n ? n + 2 : n + 3 : Array.isArray(e) ? 5 : void 0
      }

      function l(e) {
        if (0 === e) return "1";
        var t = e.toExponential().split(/e\+?/),
          n = parseInt(t[1], 10),
          r = 0 > e,
          o = r ? "0" : "2",
          i = (r ? -n : n) - f,
          s = h.padLeft(i.toString(), "0", d);
        o += p + s;
        var a = Math.abs(parseFloat(t[0]));
        r && (a = 10 - a);
        var u = a.toFixed(20);
        return u = u.replace(/\.?0+$/, ""), o += p + u
      }
      var f = -324,
        d = 3,
        p = "",
        h = e("./utils");
      n.collate = function(e, t) {
        if (e === t) return 0;
        e = n.normalizeKey(e), t = n.normalizeKey(t);
        var r = c(e),
          o = c(t);
        if (r - o !== 0) return r - o;
        if (null === e) return 0;
        switch (typeof e) {
          case "number":
            return e - t;
          case "boolean":
            return e === t ? 0 : t > e ? -1 : 1;
          case "string":
            return a(e, t)
        }
        return Array.isArray(e) ? s(e, t) : u(e, t)
      }, n.normalizeKey = function(e) {
        switch (typeof e) {
          case "undefined":
            return null;
          case "number":
            return 1 / 0 === e || e === -1 / 0 || isNaN(e) ? null : e;
          case "object":
            var t = e;
            if (Array.isArray(e)) {
              var r = e.length;
              e = new Array(r);
              for (var o = 0; r > o; o++) e[o] = n.normalizeKey(t[o])
            } else {
              if (e instanceof Date) return e.toJSON();
              if (null !== e) {
                e = {};
                for (var i in t)
                  if (t.hasOwnProperty(i)) {
                    var s = t[i];
                    "undefined" != typeof s && (e[i] = n.normalizeKey(s))
                  }
              }
            }
        }
        return e
      }, n.toIndexableString = function(e) {
        var t = "\x00";
        return e = n.normalizeKey(e), c(e) + p + r(e) + t
      }, n.parseIndexableString = function(e) {
        for (var t = [], n = [], r = 0;;) {
          var s = e[r++];
          if ("\x00" !== s) switch (s) {
            case "1":
              t.push(null);
              break;
            case "2":
              t.push("1" === e[r]), r++;
              break;
            case "3":
              var a = o(e, r);
              t.push(a.num), r += a.length;
              break;
            case "4":
              for (var u = "";;) {
                var c = e[r];
                if ("\x00" === c) break;
                u += c, r++
              }
              u = u.replace(/\u0001\u0001/g, "\x00").replace(/\u0001\u0002/g, "").replace(/\u0002\u0002/g, ""), t.push(u);
              break;
            case "5":
              var l = {
                element: [],
                index: t.length
              };
              t.push(l.element), n.push(l);
              break;
            case "6":
              var f = {
                element: {},
                index: t.length
              };
              t.push(f.element), n.push(f);
              break;
            default:
              throw new Error("bad collationIndex or unexpectedly reached end of input: " + s)
          } else {
            if (1 === t.length) return t.pop();
            i(t, n)
          }
        }
      }
    }, {
      "./utils": 56
    }],
    56: [function(e, t, n) {
      "use strict";

      function r(e, t, n) {
        for (var r = "", o = n - e.length; r.length < o;) r += t;
        return r
      }
      n.padLeft = function(e, t, n) {
        var o = r(e, t, n);
        return o + e
      }, n.padRight = function(e, t, n) {
        var o = r(e, t, n);
        return e + o
      }, n.stringLexCompare = function(e, t) {
        var n, r = e.length,
          o = t.length;
        for (n = 0; r > n; n++) {
          if (n === o) return 1;
          var i = e.charAt(n),
            s = t.charAt(n);
          if (i !== s) return s > i ? -1 : 1
        }
        return o > r ? -1 : 0
      }, n.intToDecimalForm = function(e) {
        var t = 0 > e,
          n = "";
        do {
          var r = t ? -Math.ceil(e % 10) : Math.floor(e % 10);
          n = r + n, e = t ? Math.ceil(e / 10) : Math.floor(e / 10)
        } while (e);
        return t && "0" !== n && (n = "-" + n), n
      }
    }, {}],
    57: [function(e, t) {
      "use strict";

      function n() {
        this.promise = new r(function(e) {
          e()
        })
      }
      var r = e("./utils").Promise;
      n.prototype.add = function(e) {
        return this.promise = this.promise["catch"](function() {}).then(function() {
          return e()
        }), this.promise
      }, n.prototype.finish = function() {
        return this.promise
      }, t.exports = n
    }, {
      "./utils": 59
    }],
    58: [function(e, t) {
      "use strict";

      function n(e, t, n) {
        return new o(function(o, i) {
          return t && "object" == typeof t && (t = t._id), "string" != typeof t ? i(new Error("doc id is required")) : void e.get(t, function(s, a) {
            if (s) return 404 !== s.status ? i(s) : o(r(e, n({
              _id: t
            }), n));
            var u = n(a);
            return u ? void o(r(e, u, n)) : o(a)
          })
        })
      }

      function r(e, t, r) {
        return e.put(t)["catch"](function(o) {
          if (409 !== o.status) throw o;
          return n(e, t, r)
        })
      }
      var o = e("./utils").Promise;
      t.exports = n
    }, {
      "./utils": 59
    }],
    59: [function(e, t, n) {
      (function(t, r) {
        "use strict";
        n.Promise = "function" == typeof r.Promise ? r.Promise : e("lie"), n.uniq = function(e) {
          var t = {};
          return e.forEach(function(e) {
            t[e] = !0
          }), Object.keys(t)
        }, n.inherits = e("inherits"), n.extend = e("pouchdb-extend");
        var o = e("argsarray");
        n.promisedCallback = function(e, n) {
          return n && e.then(function(e) {
            t.nextTick(function() {
              n(null, e)
            })
          }, function(e) {
            t.nextTick(function() {
              n(e)
            })
          }), e
        }, n.callbackify = function(e) {
          return o(function(t) {
            var r = t.pop(),
              o = e.apply(this, t);
            return "function" == typeof r && n.promisedCallback(o, r), o
          })
        }, n.fin = function(e, t) {
          return e.then(function(e) {
            var n = t();
            return "function" == typeof n.then ? n.then(function() {
              return e
            }) : e
          }, function(e) {
            var n = t();
            if ("function" == typeof n.then) return n.then(function() {
              throw e
            });
            throw e
          })
        }, n.sequentialize = function(e, t) {
          return function() {
            var n = arguments,
              r = this;
            return e.add(function() {
              return t.apply(r, n)
            })
          }
        };
        var i = e("crypto"),
          s = e("spark-md5");
        n.MD5 = function(e) {
          return t.browser ? s.hash(e) : i.createHash("md5").update(e).digest("hex")
        }
      }).call(this, e("/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"), "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
      "/Users/daleharvey/src/pouchdb/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js": 31,
      argsarray: 28,
      crypto: 29,
      inherits: 32,
      lie: 36,
      "pouchdb-extend": 51,
      "spark-md5": 60
    }],
    60: [function(e, t, n) {
      ! function(e) {
        if ("object" == typeof n) t.exports = e();
        else if ("function" == typeof define && define.amd) define(e);
        else {
          var r;
          try {
            r = window
          } catch (o) {
            r = self
          }
          r.SparkMD5 = e()
        }
      }(function() {
        "use strict";
        var e = function(e, t) {
            return e + t & 4294967295
          },
          t = function(t, n, r, o, i, s) {
            return n = e(e(n, t), e(o, s)), e(n << i | n >>> 32 - i, r)
          },
          n = function(e, n, r, o, i, s, a) {
            return t(n & r | ~n & o, e, n, i, s, a)
          },
          r = function(e, n, r, o, i, s, a) {
            return t(n & o | r & ~o, e, n, i, s, a)
          },
          o = function(e, n, r, o, i, s, a) {
            return t(n ^ r ^ o, e, n, i, s, a)
          },
          i = function(e, n, r, o, i, s, a) {
            return t(r ^ (n | ~o), e, n, i, s, a)
          },
          s = function(t, s) {
            var a = t[0],
              u = t[1],
              c = t[2],
              l = t[3];
            a = n(a, u, c, l, s[0], 7, -680876936), l = n(l, a, u, c, s[1], 12, -389564586), c = n(c, l, a, u, s[2], 17, 606105819), u = n(u, c, l, a, s[3], 22, -1044525330), a = n(a, u, c, l, s[4], 7, -176418897), l = n(l, a, u, c, s[5], 12, 1200080426), c = n(c, l, a, u, s[6], 17, -1473231341), u = n(u, c, l, a, s[7], 22, -45705983), a = n(a, u, c, l, s[8], 7, 1770035416), l = n(l, a, u, c, s[9], 12, -1958414417), c = n(c, l, a, u, s[10], 17, -42063), u = n(u, c, l, a, s[11], 22, -1990404162), a = n(a, u, c, l, s[12], 7, 1804603682), l = n(l, a, u, c, s[13], 12, -40341101), c = n(c, l, a, u, s[14], 17, -1502002290), u = n(u, c, l, a, s[15], 22, 1236535329), a = r(a, u, c, l, s[1], 5, -165796510), l = r(l, a, u, c, s[6], 9, -1069501632), c = r(c, l, a, u, s[11], 14, 643717713), u = r(u, c, l, a, s[0], 20, -373897302), a = r(a, u, c, l, s[5], 5, -701558691), l = r(l, a, u, c, s[10], 9, 38016083), c = r(c, l, a, u, s[15], 14, -660478335), u = r(u, c, l, a, s[4], 20, -405537848), a = r(a, u, c, l, s[9], 5, 568446438), l = r(l, a, u, c, s[14], 9, -1019803690), c = r(c, l, a, u, s[3], 14, -187363961), u = r(u, c, l, a, s[8], 20, 1163531501), a = r(a, u, c, l, s[13], 5, -1444681467), l = r(l, a, u, c, s[2], 9, -51403784), c = r(c, l, a, u, s[7], 14, 1735328473), u = r(u, c, l, a, s[12], 20, -1926607734), a = o(a, u, c, l, s[5], 4, -378558), l = o(l, a, u, c, s[8], 11, -2022574463), c = o(c, l, a, u, s[11], 16, 1839030562), u = o(u, c, l, a, s[14], 23, -35309556), a = o(a, u, c, l, s[1], 4, -1530992060), l = o(l, a, u, c, s[4], 11, 1272893353), c = o(c, l, a, u, s[7], 16, -155497632), u = o(u, c, l, a, s[10], 23, -1094730640), a = o(a, u, c, l, s[13], 4, 681279174), l = o(l, a, u, c, s[0], 11, -358537222), c = o(c, l, a, u, s[3], 16, -722521979), u = o(u, c, l, a, s[6], 23, 76029189), a = o(a, u, c, l, s[9], 4, -640364487), l = o(l, a, u, c, s[12], 11, -421815835), c = o(c, l, a, u, s[15], 16, 530742520), u = o(u, c, l, a, s[2], 23, -995338651), a = i(a, u, c, l, s[0], 6, -198630844), l = i(l, a, u, c, s[7], 10, 1126891415), c = i(c, l, a, u, s[14], 15, -1416354905), u = i(u, c, l, a, s[5], 21, -57434055), a = i(a, u, c, l, s[12], 6, 1700485571), l = i(l, a, u, c, s[3], 10, -1894986606), c = i(c, l, a, u, s[10], 15, -1051523), u = i(u, c, l, a, s[1], 21, -2054922799), a = i(a, u, c, l, s[8], 6, 1873313359), l = i(l, a, u, c, s[15], 10, -30611744), c = i(c, l, a, u, s[6], 15, -1560198380), u = i(u, c, l, a, s[13], 21, 1309151649), a = i(a, u, c, l, s[4], 6, -145523070), l = i(l, a, u, c, s[11], 10, -1120210379), c = i(c, l, a, u, s[2], 15, 718787259), u = i(u, c, l, a, s[9], 21, -343485551), t[0] = e(a, t[0]), t[1] = e(u, t[1]), t[2] = e(c, t[2]), t[3] = e(l, t[3])
          },
          a = function(e) {
            var t, n = [];
            for (t = 0; 64 > t; t += 4) n[t >> 2] = e.charCodeAt(t) + (e.charCodeAt(t + 1) << 8) + (e.charCodeAt(t + 2) << 16) + (e.charCodeAt(t + 3) << 24);
            return n
          },
          u = function(e) {
            var t, n = [];
            for (t = 0; 64 > t; t += 4) n[t >> 2] = e[t] + (e[t + 1] << 8) + (e[t + 2] << 16) + (e[t + 3] << 24);
            return n
          },
          c = function(e) {
            var t, n, r, o, i, u, c = e.length,
              l = [1732584193, -271733879, -1732584194, 271733878];
            for (t = 64; c >= t; t += 64) s(l, a(e.substring(t - 64, t)));
            for (e = e.substring(t - 64), n = e.length, r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], t = 0; n > t; t += 1) r[t >> 2] |= e.charCodeAt(t) << (t % 4 << 3);
            if (r[t >> 2] |= 128 << (t % 4 << 3), t > 55)
              for (s(l, r), t = 0; 16 > t; t += 1) r[t] = 0;
            return o = 8 * c, o = o.toString(16).match(/(.*?)(.{0,8})$/), i = parseInt(o[2], 16), u = parseInt(o[1], 16) || 0, r[14] = i, r[15] = u, s(l, r), l
          },
          l = function(e) {
            var t, n, r, o, i, a, c = e.length,
              l = [1732584193, -271733879, -1732584194, 271733878];
            for (t = 64; c >= t; t += 64) s(l, u(e.subarray(t - 64, t)));
            for (e = c > t - 64 ? e.subarray(t - 64) : new Uint8Array(0), n = e.length, r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], t = 0; n > t; t += 1) r[t >> 2] |= e[t] << (t % 4 << 3);
            if (r[t >> 2] |= 128 << (t % 4 << 3), t > 55)
              for (s(l, r), t = 0; 16 > t; t += 1) r[t] = 0;
            return o = 8 * c, o = o.toString(16).match(/(.*?)(.{0,8})$/), i = parseInt(o[2], 16), a = parseInt(o[1], 16) || 0, r[14] = i, r[15] = a, s(l, r), l
          },
          f = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"],
          d = function(e) {
            var t, n = "";
            for (t = 0; 4 > t; t += 1) n += f[e >> 8 * t + 4 & 15] + f[e >> 8 * t & 15];
            return n
          },
          p = function(e) {
            var t;
            for (t = 0; t < e.length; t += 1) e[t] = d(e[t]);
            return e.join("")
          },
          h = function(e) {
            return p(c(e))
          },
          v = function() {
            this.reset()
          };
        return "5d41402abc4b2a76b9719d911017c592" !== h("hello") && (e = function(e, t) {
          var n = (65535 & e) + (65535 & t),
            r = (e >> 16) + (t >> 16) + (n >> 16);
          return r << 16 | 65535 & n
        }), v.prototype.append = function(e) {
          return /[\u0080-\uFFFF]/.test(e) && (e = unescape(encodeURIComponent(e))), this.appendBinary(e), this
        }, v.prototype.appendBinary = function(e) {
          this._buff += e, this._length += e.length;
          var t, n = this._buff.length;
          for (t = 64; n >= t; t += 64) s(this._state, a(this._buff.substring(t - 64, t)));
          return this._buff = this._buff.substr(t - 64), this
        }, v.prototype.end = function(e) {
          var t, n, r = this._buff,
            o = r.length,
            i = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (t = 0; o > t; t += 1) i[t >> 2] |= r.charCodeAt(t) << (t % 4 << 3);
          return this._finish(i, o), n = e ? this._state : p(this._state), this.reset(), n
        }, v.prototype._finish = function(e, t) {
          var n, r, o, i = t;
          if (e[i >> 2] |= 128 << (i % 4 << 3), i > 55)
            for (s(this._state, e), i = 0; 16 > i; i += 1) e[i] = 0;
          n = 8 * this._length, n = n.toString(16).match(/(.*?)(.{0,8})$/), r = parseInt(n[2], 16), o = parseInt(n[1], 16) || 0, e[14] = r, e[15] = o, s(this._state, e)
        }, v.prototype.reset = function() {
          return this._buff = "", this._length = 0, this._state = [1732584193, -271733879, -1732584194, 271733878], this
        }, v.prototype.destroy = function() {
          delete this._state, delete this._buff, delete this._length
        }, v.hash = function(e, t) {
          /[\u0080-\uFFFF]/.test(e) && (e = unescape(encodeURIComponent(e)));
          var n = c(e);
          return t ? n : p(n)
        }, v.hashBinary = function(e, t) {
          var n = c(e);
          return t ? n : p(n)
        }, v.ArrayBuffer = function() {
          this.reset()
        }, v.ArrayBuffer.prototype.append = function(e) {
          var t, n = this._concatArrayBuffer(this._buff, e),
            r = n.length;
          for (this._length += e.byteLength, t = 64; r >= t; t += 64) s(this._state, u(n.subarray(t - 64, t)));
          return this._buff = r > t - 64 ? n.subarray(t - 64) : new Uint8Array(0), this
        }, v.ArrayBuffer.prototype.end = function(e) {
          var t, n, r = this._buff,
            o = r.length,
            i = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (t = 0; o > t; t += 1) i[t >> 2] |= r[t] << (t % 4 << 3);
          return this._finish(i, o), n = e ? this._state : p(this._state), this.reset(), n
        }, v.ArrayBuffer.prototype._finish = v.prototype._finish, v.ArrayBuffer.prototype.reset = function() {
          return this._buff = new Uint8Array(0), this._length = 0, this._state = [1732584193, -271733879, -1732584194, 271733878], this
        }, v.ArrayBuffer.prototype.destroy = v.prototype.destroy, v.ArrayBuffer.prototype._concatArrayBuffer = function(e, t) {
          var n = e.length,
            r = new Uint8Array(n + t.byteLength);
          return r.set(e), r.set(new Uint8Array(t), n), r
        }, v.ArrayBuffer.hash = function(e, t) {
          var n = l(new Uint8Array(e));
          return t ? n : p(n)
        }, v
      })
    }, {}],
    61: [function(e, t, n) {
      "use strict";

      function r(e, t, n) {
        var r = n[n.length - 1];
        e === r.element && (n.pop(), r = n[n.length - 1]);
        var o = r.element,
          i = r.index;
        if (Array.isArray(o)) o.push(e);
        else if (i === t.length - 2) {
          var s = t.pop();
          o[s] = e
        } else t.push(e)
      }
      n.stringify = function(e) {
        var t = [];
        t.push({
          obj: e
        });
        for (var n, r, o, i, s, a, u, c, l, f, d, p = ""; n = t.pop();)
          if (r = n.obj, o = n.prefix || "", i = n.val || "", p += o, i) p += i;
          else if ("object" != typeof r) p += "undefined" == typeof r ? null : JSON.stringify(r);
        else if (null === r) p += "null";
        else if (Array.isArray(r)) {
          for (t.push({
              val: "]"
            }), s = r.length - 1; s >= 0; s--) a = 0 === s ? "" : ",", t.push({
            obj: r[s],
            prefix: a
          });
          t.push({
            val: "["
          })
        } else {
          u = [];
          for (c in r) r.hasOwnProperty(c) && u.push(c);
          for (t.push({
              val: "}"
            }), s = u.length - 1; s >= 0; s--) l = u[s], f = r[l], d = s > 0 ? "," : "", d += JSON.stringify(l) + ":", t.push({
            obj: f,
            prefix: d
          });
          t.push({
            val: "{"
          })
        }
        return p
      }, n.parse = function(e) {
        for (var t, n, o, i, s, a, u, c, l, f = [], d = [], p = 0;;)
          if (t = e[p++], "}" !== t && "]" !== t && "undefined" != typeof t) switch (t) {
            case " ":
            case "	":
            case "\n":
            case ":":
            case ",":
              break;
            case "n":
              p += 3, r(null, f, d);
              break;
            case "t":
              p += 3, r(!0, f, d);
              break;
            case "f":
              p += 4, r(!1, f, d);
              break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "-":
              for (n = "", p--;;) {
                if (o = e[p++], !/[\d\.\-e\+]/.test(o)) {
                  p--;
                  break
                }
                n += o
              }
              r(parseFloat(n), f, d);
              break;
            case '"':
              for (i = "", s = void 0, a = 0;;) {
                if (u = e[p++], '"' === u && ("\\" !== s || a % 2 !== 1)) break;
                i += u, s = u, "\\" === s ? a++ : a = 0
              }
              r(JSON.parse('"' + i + '"'), f, d);
              break;
            case "[":
              c = {
                element: [],
                index: f.length
              }, f.push(c.element), d.push(c);
              break;
            case "{":
              l = {
                element: {},
                index: f.length
              }, f.push(l.element), d.push(l);
              break;
            default:
              throw new Error("unexpectedly reached end of input: " + t)
          } else {
            if (1 === f.length) return f.pop();
            r(f.pop(), f, d)
          }
      }
    }, {}]
  }, {}, [20])(20)
});