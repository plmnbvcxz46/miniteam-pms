(function () {
  var shell = document.getElementById("shell");
  var links = Array.prototype.slice.call(document.querySelectorAll(".grp a"));
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var names = {};
  var built = {
    overview: 1,
    board: 1,
    gantt: 1,
    reports: 1,
    team: 1,
    docs: 1,
    members: 1,
    system: 1,
    task: 1,
  };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = "overview",
    prevView = "board",
    curTask = "t139",
    pageState = "ok",
    vol = "std",
    lastDrag = false;
  var TID = {
    补全接口文档: "t139",
    权限模块联调: "t142",
    甘特图组件: "t137",
    菜单接口: "t144",
    "答辩 PPT": "t135",
    "答辩 PPT 第二版": "t135",
    按钮权限: "t148",
    按钮权限指令: "t148",
    接口文档: "t139",
    数据库表设计: "t131",
    周会纪要: "t146",
    部署脚本: "t150",
    需求分析: "t129",
    登录接口: "t128",
  };

  /* ---------- issues: today + read-only snapshots ---------- */
  var issues = [
    {
      no: 32,
      date: "2026 年 10 月 22 日 周四",
      short: "10.22 周四",
      at: 3.5,
      day: 3,
      head: "接口文档逾期两天，两项任务因此受阻",
      f: [18, 24, 1, 38],
      todo: [
        ["stuck", "补全接口文档", "逾期", "late"],
        ["on", "权限模块联调", "今天"],
        ["on", "甘特图组件", "周四"],
        ["", "菜单接口", "下周三"],
      ],
    },
    {
      no: 31,
      date: "2026 年 10 月 21 日 周三",
      short: "10.21 周三",
      at: 2.5,
      day: 2,
      head: "接口文档逾期一天，菜单接口开工推迟",
      f: [17, 25, 1, 39],
      todo: [
        ["stuck", "补全接口文档", "逾期", "late"],
        ["on", "权限模块联调", "周四"],
        ["on", "答辩 PPT", "周五"],
      ],
    },
    {
      no: 30,
      date: "2026 年 10 月 20 日 周二",
      short: "10.20 周二",
      at: 1.5,
      day: 1,
      head: "后端开发按计划推进，本周暂无逾期",
      f: [16, 26, 0, 40],
      todo: [
        ["on", "补全接口文档", "今天"],
        ["on", "权限模块联调", "周四"],
        ["", "甘特图组件", "周三"],
      ],
    },
    {
      no: 29,
      date: "2026 年 10 月 19 日 周一",
      short: "10.19 周一",
      at: 0.5,
      day: 0,
      head: "数据库设计完成，关键路径进入后端开发",
      f: [15, 27, 0, 41],
      todo: [
        ["on", "补全接口文档", "周二"],
        ["", "权限模块联调", "周三"],
      ],
    },
  ];
  var shown = 0;

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function renderIssue(i) {
    var d = issues[i];
    shown = i;
    var hp = d.head.split("，");
    document.getElementById("ov-headline").innerHTML =
      hp.length > 1
        ? "<span>" +
          hp[0] +
          "，</span><span>" +
          hp.slice(1).join("，") +
          "</span>"
        : "<span>" + d.head + "</span>";
    renderOvExtra(d, i);
    document.getElementById("f-done").textContent = d.f[0];
    document.getElementById("f-left").textContent = d.f[1];
    document.getElementById("f-late").textContent = pad2(d.f[2]);
    document.getElementById("f-days").textContent = d.f[3];
    document.getElementById("f-late-box").classList.toggle("alert", d.f[2] > 0);
    var tt = document.getElementById("tl-today");
    tt.hidden = d.at < 0;
    tt.style.setProperty("--at", d.at);
    Array.prototype.forEach.call(
      document.querySelectorAll("#tl-days span"),
      function (s, k) {
        s.classList.toggle("on", k === d.day);
      },
    );
    document.getElementById("todo-title").textContent =
      i === 0 ? "今日待办" : "当日待办";
    var todo = d.todo.concat(i === 0 && vol === "full" ? EXTRA_TODO : []);
    document.getElementById("todo").innerHTML =
      todo
        .slice(0, 5)
        .map(function (t) {
          return (
            '<div class="item"' +
            (TID[t[1]] ? ' data-t="' + TID[t[1]] + '" tabindex="0"' : "") +
            '><i class="key ' +
            t[0] +
            '"></i><b>' +
            t[1] +
            '</b><small class="' +
            (t[3] || (t[2] === "今天" ? "now" : "")) +
            '">' +
            t[2] +
            "</small></div>"
          );
        })
        .join("") +
      (todo.length > 5
        ? '<div class="item more" data-go="board" tabindex="0"><i class="key"></i><b>还有 ' +
          (todo.length - 5) +
          " 项，去任务页</b></div>"
        : "");
    document.getElementById("issue-no").textContent = "第 " + d.no + " 期" + "";
    document.getElementById("issue-date").textContent = d.date;
    document.getElementById("issue-btn").classList.toggle("past", i > 0);
    document.getElementById("back").hidden = i === 0;
    renderList();
    document.body.classList.toggle("past", i > 0);
    links.forEach(function (a) {
      var k = a.getAttribute("data-view");
      if (k === "members" || k === "system") {
        if (i) a.setAttribute("aria-disabled", "true");
        else a.removeAttribute("aria-disabled");
      }
    });
    if (typeof applyGantt === "function" && window.__snapReady) {
      applyGantt(i);
      applyBoard(i);
      renderReports(i);
      applyTeam(i);
      renderDocs();
    }
  }
  function renderList() {
    document.getElementById("issue-list").innerHTML = issues
      .map(function (d, i) {
        return (
          '<button type="button" data-i="' +
          i +
          '"' +
          (i === shown ? ' aria-current="true"' : "") +
          '><span class="no">第 ' +
          d.no +
          ' 期</span><span class="hd">' +
          d.head +
          '</span><span class="dt">' +
          (i ? d.short : d.short + "　今天") +
          "</span></button>"
        );
      })
      .join("");
  }
  /* overview extras: hero, progress, critical path follow the shown issue */
  var HERO = [
    {
      n: "+02",
      sub: "天 · 预测完成<br>10.28 → 10.30",
      tags: [
        ["t144", "菜单接口"],
        ["t148", "按钮权限"],
      ],
      risk: true,
      go: ["t139", "查看受阻任务"],
      late: "补全接口文档 · 2 天",
      cp: 2,
      date: "10.30",
    },
    {
      n: "+01",
      sub: "天 · 预测完成<br>10.28 → 10.29",
      tags: [["t144", "菜单接口"]],
      risk: true,
      go: ["t139", "查看受阻任务"],
      late: "补全接口文档 · 1 天",
      cp: 1,
      date: "10.29",
    },
    {
      n: "00",
      sub: "天 · 按计划<br>预测 10.28",
      tags: [],
      risk: false,
      go: ["", "查看任务看板"],
      late: "暂无逾期",
      cp: 0,
      date: "10.28",
    },
    {
      n: "00",
      sub: "天 · 按计划<br>预测 10.28",
      tags: [],
      risk: false,
      go: ["", "查看任务看板"],
      late: "暂无逾期",
      cp: 0,
      date: "10.28",
    },
  ];
  function renderOvExtra(d, i) {
    var h = HERO[i],
      tot = d.f[0] + d.f[1],
      pct = Math.round((d.f[0] / tot) * 100);
    document.getElementById("ov-kicker").textContent =
      "第 " + d.no + " 期 · 2026." + d.short + " · 第 05/10 周";
    document.getElementById("ov-deck").textContent =
      "计划 · 追踪 · 交付 — " +
      (i ? "当天 " : "今天 ") +
      d.f[0] +
      " 项已完成，" +
      d.f[1] +
      " 项待推进，" +
      (d.f[2] ? d.f[2] + " 项逾期。" : "没有逾期。");
    document.getElementById("f-done-s").textContent = "共 " + tot + " 项";
    document.getElementById("f-late-s").textContent = h.late;
    document.getElementById("ov-hero").classList.toggle("calm", !h.risk);
    document.getElementById("hero-n").textContent = h.n;
    document.getElementById("hero-sub").innerHTML = h.sub;
    document.getElementById("hero-tags").innerHTML = h.tags
      .map(function (t) {
        return '<span data-t="' + t[0] + '">' + t[1] + "</span>";
      })
      .join("");
    var go = document.getElementById("hero-go"),
      hl = document.getElementById("ov-headline");
    if (h.go[0]) {
      go.setAttribute("data-t", h.go[0]);
      go.removeAttribute("data-go");
    } else {
      go.removeAttribute("data-t");
      go.setAttribute("data-go", "board");
    }
    go.firstChild.textContent = h.go[1] + " ";
    if (h.risk) {
      hl.setAttribute("data-t", "t139");
      hl.removeAttribute("data-go");
    } else {
      hl.removeAttribute("data-t");
      hl.setAttribute("data-go", "gantt");
    }
    document.getElementById("pg-n").innerHTML = pct + "<em>%</em>";
    var pa = document.getElementById("pg-a");
    pa.style.width = pct + "%";
    pa.textContent = d.f[0];
    document.getElementById("pg-b").textContent = d.f[1];
    document.getElementById("pg-la").textContent = d.f[0];
    document.getElementById("pg-lb").textContent = d.f[1];
    document.getElementById("cp-over").hidden = !h.cp;
    var cn = document.getElementById("cp-over-n");
    cn.textContent = "+" + h.cp;
    cn.hidden = !h.cp;
    var cd = document.getElementById("cp-date");
    cd.textContent = h.date;
    cd.classList.toggle("ok", !h.cp);
    document.getElementById("cp-l").innerHTML = h.cp
      ? "计划 10.28<br>预测"
      : "计划 10.28<br>按计划";
    var tn =
      d.todo.length +
      (i === 0 &&
      vol === "full" &&
      typeof EXTRA_TODO !== "undefined" &&
      EXTRA_TODO
        ? EXTRA_TODO.length
        : 0);
    document.getElementById("todo-n").textContent = pad2(tn);
  }
  var pop = document.getElementById("issues"),
    ibtn = document.getElementById("issue-btn");
  function closePop() {
    pop.hidden = true;
    ibtn.setAttribute("aria-expanded", "false");
  }
  ibtn.addEventListener("click", function (e) {
    e.stopPropagation();
    pop.hidden = !pop.hidden;
    ibtn.setAttribute("aria-expanded", pop.hidden ? "false" : "true");
  });
  document.getElementById("issue-list").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    closePop();
    renderIssue(+b.getAttribute("data-i"));
    show(current === "members" || current === "system" ? "overview" : current);
  });
  document.getElementById("back").addEventListener("click", function () {
    renderIssue(0);
    show(current);
  });
  document.addEventListener("click", function (e) {
    if (!pop.hidden && !pop.contains(e.target)) closePop();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePop();
  });

  /* ---------- masthead mode ---------- */
  function masthead(mode) {
    var sys = mode === "system";
    document.getElementById("mh-project").hidden = sys;
    document.getElementById("mh-system").hidden = !sys;
    document.getElementById("issue-wrap").style.visibility = sys
      ? "hidden"
      : "";
    document.getElementById("mid-weeks").hidden = sys;
    document.getElementById("mid-subtabs").hidden = !sys;
  }

  function replay(v) {
    v.classList.remove("enter");
    void v.offsetWidth;
    v.classList.add("enter");
  }

  function show(key) {
    var viewKey = built[key] ? key : names[key] ? "empty" : "overview";
    if (viewKey === "overview" && !built[key]) key = "overview";
    current = key;
    masthead(key === "system" ? "system" : "project");
    views.forEach(function (v) {
      var on = v.getAttribute("data-view") === viewKey;
      v.hidden = !on;
      v.classList.remove("enter");
      if (on) {
        void v.offsetWidth;
        v.classList.add("enter");
      }
    });
    links.forEach(function (a) {
      if (a.getAttribute("data-view") === (key === "task" ? "board" : key))
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (viewKey === "gantt") requestAnimationFrame(drawDeps);
    if (typeof applyState === "function") applyState();
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (a.getAttribute("data-view") === "system") {
        openSettings("people");
        return;
      }
      if (ovOpen) closeSettings();
      try {
        history.replaceState(null, "", a.getAttribute("href"));
      } catch (err) {}
      show(a.getAttribute("data-view"));
    });
  });

  /* ---------- scale to fit ---------- */
  function fit() {
    var w = window.innerWidth,
      h = window.innerHeight;
    if (w < 1100) {
      shell.style.zoom = "";
      shell.style.height = "";
      shell.style.minHeight = "";
      return;
    }
    var z = Math.max(0.8, Math.min(w / 1440, h / 800, 1.6));
    shell.style.zoom = z;
    shell.style.setProperty("--iz", (1 / z).toFixed(4));
    shell.style.minHeight = Math.floor(h / z) + "px";
    shell.style.height = Math.floor(h / z) + "px";
  }

  /* ---------- gantt dependency lines ---------- */
  /* growth: one time front sweeps left to right; everything is drawn when the front reaches it */
  /* the time front itself eases (fast start, settles at the end); each bar is linear inside its own slice,
     so the speed changes smoothly from bar to bar instead of every bar braking on its own */
  var GT = 1.4,
    GN = 16;
  function at(days) {
    var p = Math.max(0, Math.min(1, days / GN));
    return GT * (1 - Math.pow(1 - p, 1 / 2.2));
  }
  function setGrowth() {
    document.querySelectorAll(".g-bar").forEach(function (el) {
      var m = (el.style.gridColumn || "").match(/(\d+)\s*\/\s*(\d+)/);
      if (!m) return;
      var a = +m[1] - 1,
        b = +m[2] - 1;
      el.style.setProperty("--d", at(a).toFixed(3) + "s");
      el.style.setProperty("--dur", (at(b) - at(a)).toFixed(3) + "s");
    });
    document.querySelectorAll(".g-line[data-at]").forEach(function (el) {
      el.style.setProperty(
        "--d",
        at(+el.getAttribute("data-at")).toFixed(3) + "s",
      );
    });
  }
  setGrowth();
  var depSpec = [
    ["A", "B", false],
    ["B", "C", false],
    ["Cend", "E", false],
    ["A", "D", false],
    ["Dend", "E", true],
  ];
  function drawDeps(play) {
    var svg = document.getElementById("deps"),
      body = svg.parentNode;
    if (!body.offsetParent) return;
    var z = parseFloat(shell.style.zoom) || 1,
      b = body.getBoundingClientRect();
    function box(id) {
      var r = body
        .querySelector('[data-id="' + id + '"]')
        .getBoundingClientRect();
      return {
        l: (r.left - b.left) / z,
        r: (r.right - b.left) / z,
        m: (r.top + r.height / 2 - b.top) / z,
        t: (r.top - b.top) / z,
      };
    }
    var w = b.width / z,
      h = b.height / z;
    var nameW =
      parseFloat(
        getComputedStyle(body.parentNode).getPropertyValue("--name"),
      ) || 190;
    var colW = (w - nameW) / 16;
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    var animate = play !== false && !reduce;
    svg.innerHTML = depSpec
      .map(function (d) {
        var p = box(d[0]),
          q = box(d[1]);
        var x1 = p.r,
          y1 = p.m,
          xa = Math.max(x1 + 10, q.l + 10),
          y2 = q.t - 1;
        var d0 = (x1 - nameW) / colW,
          d1 = (xa - nameW) / colW,
          t0 = at(d0),
          dur = at(d1) - t0 + 0.06;
        var st = animate
          ? ' style="stroke-dasharray:1;stroke-dashoffset:1;animation:stroke ' +
            dur.toFixed(3) +
            "s linear " +
            t0.toFixed(3) +
            's forwards"'
          : "";
        var hd = animate
          ? ' style="opacity:0;animation:rise .05s linear ' +
            (t0 + dur).toFixed(3) +
            's forwards"'
          : "";
        return (
          '<path pathLength="1" class="' +
          (d[2] ? "free" : "") +
          '" d="M' +
          x1 +
          " " +
          y1 +
          " H" +
          xa +
          " V" +
          y2 +
          '"' +
          st +
          '></path><path class="head" d="M' +
          xa +
          " " +
          y2 +
          ' l-4 -7 h8 z"' +
          hd +
          "></path>"
        );
      })
      .join("");
    svg.onanimationend = function (e) {
      if (e.target.classList.contains("free"))
        e.target.removeAttribute("style");
    };
  }

  /* ---------- reports ---------- */
  var wkAxisDone = false;
  function renderReports(i) {
    var NS = 55,
      T = 1.1,
      U2 = T / NS; /* time front: whole chart grows in T seconds */
    var X = function (d) {
        return 50 + d * (740 / NS);
      },
      Y = function (v) {
        return 214 - v * (196 / 42);
      };
    var svg = document.getElementById("burn"),
      out = [],
      mid = 0;
    function line(cls, pts, d0, d1) {
      var id = "m" + mid++,
        dpath =
          "M" +
          pts
            .map(function (p) {
              return X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1);
            })
            .join(" L");
      out.push(
        '<mask id="' +
          id +
          '" maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="262"><path class="mk" pathLength="1" d="' +
          dpath +
          '" style="--d:' +
          (d0 * U2).toFixed(3) +
          "s;--dur:" +
          ((d1 - d0) * U2).toFixed(3) +
          's"></path></mask>',
      );
      out.push(
        '<path class="' +
          cls +
          '" d="' +
          dpath +
          '" mask="url(#' +
          id +
          ')"></path>',
      );
    }
    [0, 21, 42].forEach(function (v) {
      out.push(
        '<line class="grid" x1="50" x2="790" y1="' +
          Y(v) +
          '" y2="' +
          Y(v) +
          '"></line>',
      );
      out.push(
        '<text class="t m" x="40" y="' +
          (Y(v) + 4) +
          '" text-anchor="end">' +
          v +
          "</text>",
      );
    });
    out.push(
      '<path class="axis" d="M50 ' + Y(42) + " V" + Y(0) + ' H790"></path>',
    );
    [
      "9.21",
      "9.28",
      "10.5",
      "10.12",
      "10.19",
      "10.26",
      "11.2",
      "11.9",
      "11.16",
      "11.23",
      "",
    ].forEach(function (l, i) {
      var x = X(i * 5);
      out.push(
        '<line class="axis" x1="' +
          x +
          '" x2="' +
          x +
          '" y1="' +
          Y(0) +
          '" y2="' +
          (Y(0) + 5) +
          '"></line>',
      );
      out.push(
        '<text class="t m" x="' +
          x +
          '" y="' +
          (Y(0) + 20) +
          '" text-anchor="middle">' +
          l +
          "</text>",
      );
    });
    line(
      "plan",
      [
        [0, 42],
        [50, 0],
      ],
      0,
      50,
    );
    var D = [23, 22, 21, 20][i],
      PE = [52, 51, 50, 50][i];
    var VAL = {
        0: 42,
        5: 39,
        10: 35,
        15: 30,
        20: 26,
        21: 25,
        22: 25,
        23: 24,
      },
      V = VAL[D];
    var act = [
      [0, 42],
      [5, 39],
      [10, 35],
      [15, 30],
      [20, 26],
      [21, 25],
      [22, 25],
      [23, 24],
    ].filter(function (p) {
      return p[0] <= D;
    });
    line("actual", act, 0, D);
    line(
      PE > 50 ? "pred" : "pred ok",
      [
        [D, V],
        [PE, 0],
      ],
      D,
      PE,
    );
    out.push(
      '<g class="now-g"><line class="now" x1="' +
        X(D) +
        '" x2="' +
        X(D) +
        '" y1="' +
        (Y(42) - 4) +
        '" y2="' +
        Y(0) +
        '"></line></g>',
    );
    out.push(
      '<text class="t sig" x="' +
        (X(D) + 6) +
        '" y="' +
        (Y(42) + 2) +
        '">' +
        (i ? md(ISSUE_DATE[i]) : "今天") +
        "</text>",
    );
    out.push(
      '<text class="t" x="' +
        X(D) +
        '" y="' +
        (Y(V) - 12) +
        '" text-anchor="middle">' +
        V +
        "</text>",
    );
    out.push(
      '<line class="axis" x1="' +
        X(50) +
        '" x2="' +
        X(50) +
        '" y1="' +
        (Y(0) - 8) +
        '" y2="' +
        Y(0) +
        '"></line>',
    );
    out.push(
      '<text class="t" x="' +
        (X(50) - 4) +
        '" y="' +
        (Y(0) + 40) +
        '" text-anchor="end">计划 11.27</text>',
    );
    out.push(
      '<line class="axis" x1="' +
        X(50) +
        '" x2="' +
        X(50) +
        '" y1="' +
        Y(0) +
        '" y2="' +
        (Y(0) + 28) +
        '" style="stroke-dasharray:3 3"></line>',
    );
    if (PE > 50) {
      out.push(
        '<line class="pred" style="stroke-dasharray:none;stroke-width:3" x1="' +
          X(PE) +
          '" x2="' +
          X(PE) +
          '" y1="' +
          (Y(0) - 10) +
          '" y2="' +
          (Y(0) + 28) +
          '"></line>',
      );
      out.push(
        '<text class="t sig" x="' +
          (X(PE) + 6) +
          '" y="' +
          (Y(0) + 40) +
          '">预测 ' +
          { 51: "11.30", 52: "12.1" }[PE] +
          "</text>",
      );
    }
    out.push(
      '<text class="t m" x="' + X(9) + '" y="' + (Y(28) - 0) + '">计划</text>',
    );
    out.push(
      '<text class="t" x="' + X(13) + '" y="' + (Y(36) - 6) + '">实际</text>',
    );
    svg.innerHTML = out.join("");

    var people = [
        ["测试经理 A", 46],
        ["普通员工 A", 38],
        ["普通员工 B", 32],
        ["普通员工 C", 24],
      ],
      MAX = 50,
      CAP = 40;
    document.getElementById("load").innerHTML =
      people
        .map(function (p) {
          var main = Math.min(p[1], CAP),
            over = Math.max(0, p[1] - CAP);
          return (
            '<div class="lrow"><b>' +
            p[0] +
            '</b><div class="track"><span class="fill" style="width:' +
            (main / MAX) * 100 +
            "%;--dur:" +
            ((main / MAX) * 0.6).toFixed(2) +
            's"></span>' +
            (over
              ? '<span class="over" style="left:' +
                (CAP / MAX) * 100 +
                "%;width:" +
                (over / MAX) * 100 +
                "%;--d2:" +
                ((CAP / MAX) * 0.6).toFixed(2) +
                "s;--dur2:" +
                ((over / MAX) * 0.6).toFixed(2) +
                's"></span>'
              : "") +
            '<span class="cap"></span></div><span class="v' +
            (over ? " late" : "") +
            '">' +
            p[1] +
            "</span></div>"
          );
        })
        .join("") +
      '<div class="axisrow"><span></span><span><i style="left:0">0</i><i style="left:80%">上限 40</i></span><span></span></div>';

    var wk = [3, 4, 6, 5, [2, 1, 1, 0][i], null, null, null, null, null],
      wmax = 7;
    document.getElementById("weekly").innerHTML = wk
      .map(function (v, i) {
        var cls = v === null ? "none" : i === 4 ? "now" : "done";
        return (
          '<div class="wk">' +
          (v === null ? "" : "<span>" + v + "</span>") +
          '<span class="bar ' +
          cls +
          '" style="--h:' +
          ((v || 0) / wmax) * 100 +
          "%;--d:" +
          (i * 0.07).toFixed(2) +
          's"></span></div>'
        );
      })
      .join("");
    if (!wkAxisDone)
      document.getElementById("weekly").insertAdjacentHTML(
        "afterend",
        '<div class="wk-ax">' +
          [
            "9.21",
            "9.28",
            "10.5",
            "10.12",
            "10.19",
            "10.26",
            "11.2",
            "11.9",
            "11.16",
            "11.23",
          ]
            .map(function (l) {
              return "<span>" + l + "</span>";
            })
            .join("") +
          "</div>",
      );

    wkAxisDone = true;
    var dev = [
        ["A 需求分析", 3, 3, 0, ""],
        ["B 数据库设计", 2, 2, 0, ""],
        ["C 后端开发", 5, 5, [2, 1, 0, 0][i], ""],
        ["D 前端开发", 4, 4, 0, "free"],
        ["E 联调测试", 3, 3, 0, ""],
      ],
      DM = 8,
      DU = 0.09;
    document.getElementById("dev").innerHTML = dev
      .map(function (d) {
        var w = function (n) {
          return (n / DM) * 100 + "%";
        };
        return (
          '<div class="drow"><span>' +
          d[0] +
          '</span><div class="dbars">' +
          '<span class="p" style="width:' +
          w(d[1]) +
          ";--dur:" +
          d[1] * DU +
          's"></span>' +
          '<span class="a ' +
          d[4] +
          '" style="width:' +
          w(d[2]) +
          ";--dur:" +
          d[2] * DU +
          's"></span>' +
          (d[3]
            ? '<span class="o" style="left:' +
              w(d[2]) +
              ";width:" +
              w(d[3]) +
              ";--d:" +
              d[2] * DU +
              "s;--dur:" +
              d[3] * DU +
              's"></span>'
            : "") +
          '</div><span class="v' +
          (d[3] ? " late" : "") +
          '">' +
          (d[3] ? "+" + d[3] : "0") +
          "</span></div>"
        );
      })
      .join("");
    var PEd = {
        52: ["12.1", "晚 4 天"],
        51: ["11.30", "晚 3 天"],
        50: ["11.27", "按计划"],
      }[PE],
      ff = issues[i].f;
    document.getElementById("rp-hero").classList.toggle("calm", PE <= 50);
    document.getElementById("rp-n").textContent = PEd[0];
    document.getElementById("rp-sub").innerHTML =
      "计划 11.27 · " +
      PEd[1] +
      "<br>按当前燃尽速度推算，剩余 " +
      ff[1] +
      " 项";
    document.getElementById("rp-kicker").textContent =
      "第 05/10 周 · 已完成 " +
      ff[0] +
      " / " +
      (ff[0] + ff[1]) +
      " 项 · 剩余 " +
      ff[1] +
      " 项";
  }
  renderReports(0);

  /* ---------- team ---------- */
  var threads = [
    {
      t: "接口文档字段命名统一",
      task: "补全接口文档",
      state: "stuck",
      note: "逾期 2 天",
      n: 5,
      at: "10:41",
      unread: true,
      msgs: [
        [
          "测试经理 A",
          "10-21 16:20",
          "接口文档还差菜单和权限两部分。字段命名先统一成小驼峰，和若依返回的 <em>menuId</em>、<em>parentId</em> 保持一致。",
        ],
        [
          "普通员工 B",
          "10-21 17:05",
          "前端这边已经按小驼峰写了，菜单树用的是 <em>children</em>，文档里也请写成这个名字。",
        ],
        [
          "普通员工 A",
          "10-22 09:18",
          "权限部分卡在按钮级权限标识的格式上，<em>project:task:move</em> 这种三段式可以吗？",
        ],
        [
          "测试经理 A",
          "10-22 09:30",
          "可以，就用三段式。这个任务我先移到阻塞，今天下午一起过一遍。",
        ],
        ["普通员工 A", "10-22 10:41", "好的，下午两点前我把菜单部分补上。"],
      ],
    },
    {
      t: "甘特图依赖线怎么画",
      task: "甘特图组件",
      state: "on",
      note: "进行中",
      n: 3,
      at: "昨天",
      unread: false,
      msgs: [
        [
          "普通员工 B",
          "10-21 10:02",
          "依赖线打算用 SVG 按任务条的实际位置生成，ECharts 的自定义系列不好做描边动画。",
        ],
        [
          "测试经理 A",
          "10-21 10:30",
          "同意，动画要跟着时间轴生长，分叉同时画，汇合同时到。",
        ],
        ["普通员工 B", "10-21 11:12", "明白，我按工作日换算延迟。"],
      ],
    },
    {
      t: "周五彩排时间",
      task: "答辩 PPT",
      state: "on",
      note: "进行中",
      n: 4,
      at: "昨天",
      unread: false,
      msgs: [
        [
          "普通员工 C",
          "10-21 14:00",
          "周五下午三点彩排可以吗？教室我已经问过了。",
        ],
        ["测试经理 A", "10-21 14:12", "可以。每人讲五分钟，演示放最后。"],
        [
          "普通员工 A",
          "10-21 14:40",
          "演示用 Chrome，记得提前把缩放设成 100%。",
        ],
        ["普通员工 C", "10-21 15:02", "收到，我把顺序写进 PPT 最后一页。"],
      ],
    },
    {
      t: "菜单接口要不要分页",
      task: "菜单接口",
      state: "",
      note: "待开始",
      n: 2,
      at: "10-20",
      unread: false,
      msgs: [
        [
          "普通员工 A",
          "10-20 16:10",
          "菜单数据量很小，我倾向于不分页，一次返回整棵树。",
        ],
        ["普通员工 B", "10-20 16:30", "不分页可以，前端直接渲染树。"],
      ],
    },
    {
      t: "数据库表设计评审",
      task: "数据库表设计",
      state: "done",
      note: "已完成",
      n: 6,
      at: "10-17",
      unread: false,
      closed: true,
      msgs: [["测试经理 A", "10-17 09:00", "评审意见都已处理，讨论结束。"]],
    },
  ];
  var cur = 0;
  function renderThreads() {
    document.getElementById("threads").innerHTML = threads
      .map(function (t, i) {
        var v = visibleMsgs(t);
        if (!v.length) return "";
        var last = v[v.length - 1][1],
          shown =
            last === "刚刚"
              ? "刚刚"
              : num(last) === issueCut
                ? last.split(" ")[1]
                : num(last) === issueCut - 1
                  ? "昨天"
                  : last.split(" ")[0].replace("-", ".");
        return (
          '<button type="button" class="thr' +
          (t.unread && !issueIdx ? " unread" : "") +
          (t.closed ? " closed" : "") +
          '" data-i="' +
          i +
          '"' +
          (i === cur ? ' aria-current="true"' : "") +
          "><b>" +
          t.t +
          "</b><small><span>" +
          t.task +
          "</span><span>" +
          v.length +
          " 条 · " +
          shown +
          "</span></small></button>"
        );
      })
      .join("");
    document.getElementById("th-count").textContent = pad2(
      threads.filter(function (t) {
        return visibleMsgs(t).length;
      }).length,
    );
    if (typeof feedData !== "undefined" && feedData) {
      var todayN = feedData.filter(function (f) {
        return num(f[0]) === issueCut;
      }).length;
      document.getElementById("tm-kicker").textContent =
        +document.getElementById("th-count").textContent +
        " 个讨论 · " +
        (issueIdx ? "当天 " : "今天 ") +
        todayN +
        " 条动态" +
        (threads[0].state === "stuck" ? " · 1 个关联逾期" : "");
    }
  }
  function renderThread() {
    var t = threads[cur];
    document.getElementById("th-title").textContent = t.t;
    document.getElementById("th-meta").innerHTML =
      '<i class="key ' +
      t.state +
      '"></i>关联任务 <b class="lnk"' +
      (TID[t.task] ? ' data-t="' + TID[t.task] + '"' : "") +
      ">" +
      t.task +
      '</b><span class="' +
      (t.state === "stuck" ? "late" : "") +
      '">' +
      t.note +
      "</span>";
    document
      .getElementById("th-meta")
      .classList.toggle("risk", t.state === "stuck");
    var box = document.getElementById("msgs");
    box.innerHTML = visibleMsgs(t)
      .map(function (m) {
        return (
          '<article class="msg"><header><b>' +
          m[0] +
          "</b><time>" +
          when(m[1], issueCut) +
          "</time></header><p>" +
          m[2] +
          "</p></article>"
        );
      })
      .join("");
    box.scrollTop = box.scrollHeight;
  }
  document.getElementById("threads").addEventListener("click", function (e) {
    var b = e.target.closest(".thr");
    if (!b) return;
    cur = +b.getAttribute("data-i");
    threads[cur].unread = false;
    renderThreads();
    renderThread();
  });
  document.getElementById("reply").addEventListener("submit", function (e) {
    e.preventDefault();
    var ta = document.getElementById("reply-text"),
      v = ta.value.trim();
    if (!v) return;
    var esc = v.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
    threads[cur].msgs.push(["测试经理 A", "刚刚", esc]);
    threads[cur].n++;
    threads[cur].at = "刚刚";
    ta.value = "";
    renderThreads();
    renderThread();
  });
  document
    .getElementById("reply-text")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
        document.getElementById("reply").requestSubmit();
    });

  /* ---------- docs ---------- */
  var docs = [
    {
      n: "需求规格说明书",
      tid: "t129",
      final: true,
      task: "A 需求分析",
      v: "v1.2",
      who: "测试经理 A",
      up: "10.16",
      st: "定稿",
      due: "10.16",
      hist: [
        ["v1.2", "10.16", "测试经理 A", "补充非功能需求"],
        ["v1.1", "10.15", "测试经理 A", "评审后修改用例"],
        ["v1.0", "10.14", "测试经理 A", "初稿"],
      ],
    },
    {
      n: "数据库设计说明书",
      tid: "t131",
      final: true,
      task: "B 数据库设计",
      v: "v1.1",
      who: "普通员工 B",
      up: "10.17",
      st: "定稿",
      due: "10.18",
      hist: [
        ["v1.1", "10.17", "普通员工 B", "按评审意见调整索引"],
        ["v1.0", "10.16", "普通员工 B", "初稿"],
      ],
    },
    {
      n: "接口文档",
      tid: "t139",
      task: "C 后端开发",
      v: "v0.6",
      who: "普通员工 A",
      up: "10.18",
      st: "逾期 2 天",
      late: true,
      due: "10.20",
      hist: [
        ["v0.6", "10.18", "普通员工 A", "补充登录接口"],
        ["v0.5", "10.16", "普通员工 A", "新增菜单接口草稿"],
        ["v0.4", "10.15", "普通员工 A", "统一返回格式"],
        ["v0.3", "10.14", "普通员工 A", "用户接口"],
      ],
    },
    {
      n: "前端组件说明",
      tid: "t137",
      task: "D 前端开发",
      v: "v0.3",
      who: "测试经理 A",
      up: "10.21",
      st: "修订中",
      due: "10.27",
      hist: [
        ["v0.3", "10.21", "测试经理 A", "新增甘特图组件说明"],
        ["v0.2", "10.19", "测试经理 A", "看板拖拽"],
        ["v0.1", "10.17", "测试经理 A", "初稿"],
      ],
    },
    {
      n: "测试计划",
      tid: "t150",
      task: "E 联调测试",
      v: "v0.1",
      who: "普通员工 C",
      up: "10.20",
      st: "修订中",
      due: "10.30",
      hist: [["v0.1", "10.20", "普通员工 C", "初稿"]],
    },
    {
      n: "开题报告",
      final: true,
      task: "—",
      v: "v2.0",
      who: "测试经理 A",
      up: "9.28",
      st: "定稿",
      due: "9.28",
      hist: [
        ["v2.0", "9.28", "测试经理 A", "按老师意见修改"],
        ["v1.0", "9.25", "测试经理 A", "初稿"],
      ],
    },
    {
      n: "周会纪要 10.19",
      tid: "t146",
      final: true,
      task: "—",
      v: "v1.0",
      who: "普通员工 C",
      up: "10.19",
      st: "定稿",
      due: "10.19",
      hist: [["v1.0", "10.19", "普通员工 C", "会议记录"]],
    },
  ];
  var dsel = 2,
    DSPAN = 21;
  function dday(str) {
    var p = str.split("."),
      m = +p[0],
      d = +p[1];
    return m === 9 ? d - 42 : m === 10 ? d - 12 : d + 19;
  }
  function dpc(n) {
    return ((Math.max(0, Math.min(DSPAN, n)) / DSPAN) * 100).toFixed(2) + "%";
  }
  function seg(cls, x0, x1) {
    return (
      '<i class="' +
      cls +
      '" style="left:' +
      dpc(x0) +
      ";width:calc(" +
      dpc(x1) +
      " - " +
      dpc(x0) +
      ')"></i>'
    );
  }
  function renderDocs() {
    var view = docs.map(docAt),
      today = dday(md(issueCut));
    if (!view[dsel])
      dsel = view.findIndex(function (x) {
        return x;
      });
    document.getElementById("dx-axis").innerHTML = ["10.12", "10.19", "10.26"]
      .map(function (l) {
        return '<span style="left:' + dpc(dday(l)) + '">' + l + "</span>";
      })
      .join("");
    var on = [],
      fin = [];
    view.forEach(function (d, i) {
      if (d) (d.st === "定稿" ? fin : on).push([d, i]);
    });
    document.getElementById("dc-on").textContent = on.length;
    document.getElementById("dc-fin").textContent = fin.length;
    document.getElementById("docs").innerHTML = on
      .map(function (p, k) {
        var d = p[0],
          i = p[1],
          vd = d.hist.map(function (h) {
            return dday(h[1]);
          }),
          first = Math.max(0, Math.min.apply(null, vd)),
          due = dday(d.due);
        var t = '<i class="now" style="left:' + dpc(today + 0.5) + '"></i>';
        t +=
          '<i class="cap" style="left:' +
          dpc(due + 1) +
          '"></i><i class="duelb' +
          (d.late ? " late" : "") +
          '" style="left:' +
          dpc(due + 1) +
          '">截止 ' +
          d.due +
          "</i>";
        t += seg("b on", first, d.late ? due + 1 : today + 1);
        if (d.late) t += seg("b over", due + 1, today + 1);
        return (
          '<button type="button" class="dr" role="option" data-i="' +
          i +
          '" style="--i:' +
          k +
          '" aria-selected="' +
          (i === dsel) +
          '">' +
          '<span class="dn"><b>' +
          d.n +
          "</b><small>" +
          d.task +
          " · " +
          d.who +
          "</small></span>" +
          '<span class="trk" aria-hidden="true">' +
          t +
          "</span>" +
          '<span class="dv">' +
          d.v +
          "</span>" +
          '<span class="ds' +
          (d.late ? " late" : " draft") +
          '">' +
          d.st +
          "</span></button>"
        );
      })
      .join("");
    document.getElementById("docs-fin").innerHTML = fin
      .map(function (p, k) {
        var d = p[0],
          i = p[1];
        return (
          '<button type="button" class="df" role="option" data-i="' +
          i +
          '" style="--i:' +
          k +
          '" aria-selected="' +
          (i === dsel) +
          '">' +
          '<span class="dn"><b>' +
          d.n +
          "</b><small>" +
          (d.task === "—" ? "项目文档" : d.task) +
          " · " +
          d.who +
          "</small></span>" +
          '<span class="fv"><b>' +
          d.v +
          "</b><small>" +
          d.up +
          " 定稿</small></span></button>"
        );
      })
      .join("");
    var d = view[dsel];
    document.getElementById("doc-title").textContent = d.n;
    document.getElementById("doc-facts").innerHTML =
      "<dt>关联任务</dt><dd>" +
      (d.tid
        ? '<span class="lnk" data-t="' + d.tid + '">' + d.task + "</span>"
        : d.task) +
      "</dd><dt>负责人</dt><dd>" +
      d.who +
      "</dd><dt>截止</dt><dd>" +
      d.due +
      "</dd><dt>状态</dt><dd" +
      (d.late ? ' class="late"' : "") +
      ">" +
      d.st +
      "</dd>";
    document.getElementById("doc-hist").innerHTML = d.hist
      .map(function (h) {
        return (
          '<div class="hv"><b>' +
          h[0] +
          "</b><span>" +
          h[3] +
          "</span><small>" +
          h[1] +
          " · " +
          h[2] +
          "</small></div>"
        );
      })
      .join("");
    var lateN = d.late ? parseInt(d.st.replace(/\D+/g, ""), 10) : 0;
    document.getElementById("doc-hero").classList.toggle("late", !!d.late);
    document.getElementById("dh-n").textContent = d.late ? pad2(lateN) : d.v;
    document.getElementById("dh-sub").innerHTML = d.late
      ? "天 逾期<br>截止 " + d.due
      : d.st === "定稿"
        ? "定稿<br>" + d.up
        : d.st + "<br>截止 " + d.due;
    document.getElementById("doc-hn").textContent =
      "共 " + d.hist.length + " 版";
    var lateDocs = on.filter(function (p) {
      return p[0].late;
    }).length;
    document.getElementById("dc-kicker").textContent =
      "修订中 " +
      on.length +
      " 份 · 定稿 " +
      fin.length +
      " 份 · " +
      (lateDocs ? lateDocs + " 份逾期" : "没有逾期");
  }
  document.getElementById("view-docs").addEventListener("click", function (e) {
    var b = e.target.closest(".dr,.df");
    if (!b) return;
    dsel = +b.getAttribute("data-i");
    renderDocs();
    var again = document.querySelector('#view-docs [data-i="' + dsel + '"]');
    if (again && e.detail === 0) again.focus();
  });

  /* ---------- members ---------- */
  var PERMS = [
    ["编辑任务", "新建、修改任务，拖动看板卡片"],
    ["调整排期", "修改工期和依赖，重算关键路径"],
    ["编辑文档", "上传新版本，修改文档状态"],
    ["管理成员", "邀请成员，修改本页的权限"],
  ];
  var crew = [
    ["测试经理 A", "项目经理", "pm_a", 4, 46, [1, 1, 1, 1], true],
    ["普通员工 A", "后端开发", "dev_a", 5, 38, [1, 0, 1, 0]],
    ["普通员工 B", "前端开发", "dev_b", 3, 32, [1, 0, 1, 0]],
    ["普通员工 C", "测试", "qa_c", 3, 24, [1, 0, 0, 0]],
  ];
  function renderCrew() {
    var h =
      '<div class="c-lb c-tools top"><label class="field" for="mq"><span class="sr">搜索成员</span><input id="mq" type="search" placeholder="姓名或账号"></label></div>';
    h += crew
      .map(function (m, c) {
        return (
          '<div class="c-who top' +
          (m[4] > 40 ? " hot" : "") +
          '" style="--c:' +
          (c + 1) +
          '"><b>' +
          m[0] +
          "</b><span>" +
          m[1] +
          "<em> · " +
          m[2] +
          "</em></span></div>"
        );
      })
      .join("");
    h +=
      '<div class="c-lb"><b>本周工时</b><small>单位：小时，虚线为上限 40</small></div>';
    h += crew
      .map(function (m, c) {
        var main = Math.min(m[4], 40),
          over = Math.max(0, m[4] - 40);
        return (
          '<div class="c-load" style="--c:' +
          (c + 1) +
          '"><span class="big' +
          (over ? " late" : "") +
          '">' +
          m[4] +
          '</span><div class="track" aria-label="' +
          m[4] +
          ' 小时，上限 40"><span class="fill" style="width:' +
          (main / 50) * 100 +
          "%;--dur:" +
          ((main / 50) * 0.6).toFixed(2) +
          's"></span>' +
          (over
            ? '<span class="over" style="left:80%;width:' +
              (over / 50) * 100 +
              "%;--d2:.48s;--dur2:" +
              ((over / 50) * 0.6).toFixed(2) +
              's"></span>'
            : "") +
          '<span class="cap"></span></div></div>'
        );
      })
      .join("");
    h += '<div class="c-lb"><b>负责任务</b></div>';
    h += crew
      .map(function (m, c) {
        return (
          '<div class="c-n" style="--c:' +
          (c + 1) +
          '">' +
          m[3] +
          "<small>项</small></div>"
        );
      })
      .join("");
    PERMS.forEach(function (p, k) {
      h +=
        '<div class="c-lb"><b>' +
        p[0] +
        "</b><small>" +
        p[1] +
        "</small></div>";
      h += crew
        .map(function (m, c) {
          var on = !!m[5][k];
          return (
            '<div class="c-p' +
            (k === PERMS.length - 1 ? " last" : "") +
            '" style="--c:' +
            (c + 1) +
            '"><button class="pm" type="button" data-m="' +
            c +
            '" data-k="' +
            k +
            '" aria-pressed="' +
            on +
            '"' +
            (m[6] ? ' disabled title="项目经理的权限不可修改"' : "") +
            ' aria-label="' +
            m[0] +
            " " +
            p[0] +
            '"><i></i>' +
            (on ? "有" : "无") +
            "</button></div>"
          );
        })
        .join("");
    });
    var ovr = crew.filter(function (m) {
      return m[4] > 40;
    }).length;
    document.getElementById("mb-kicker").textContent =
      crew.length +
      " 名成员 · " +
      (ovr ? "本周 " + ovr + " 人超出工时上限" : "本周没有人超出工时上限");
    document.getElementById("crew").innerHTML = h;
  }
  renderCrew();
  document.getElementById("crew").addEventListener("click", function (e) {
    var b = e.target.closest(".pm");
    if (!b || b.disabled) return;
    var m = crew[+b.getAttribute("data-m")],
      k = +b.getAttribute("data-k"),
      on = !m[5][k];
    m[5][k] = on ? 1 : 0;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.lastChild.textContent = on ? "有" : "无";
    document
      .getElementById("perm-log")
      .insertAdjacentHTML(
        "afterbegin",
        '<div class="hv"><b>刚刚</b><span>测试经理 A ' +
          (on ? "授予 " : "收回 ") +
          m[0] +
          " " +
          PERMS[k][0] +
          "</span></div>",
      );
  });

  /* ---------- system: dictionary ---------- */
  var dict = {
    task_status: [
      "任务状态",
      [
        ["待开始", "todo", 1, '<i class="key"></i>描边'],
        ["进行中", "doing", 2, '<i class="key on"></i>实心'],
        ["阻塞", "blocked", 3, '<i class="key stuck"></i>斜纹'],
        ["已完成", "done", 4, '<i class="key done"></i>细线'],
      ],
    ],
    task_priority: [
      "任务优先级",
      [
        ["高", "high", 1, "得分 ≥ 70"],
        ["中", "medium", 2, "得分 40–69"],
        ["低", "low", 3, "得分 < 40"],
      ],
    ],
    doc_status: [
      "文档状态",
      [
        ["修订中", "draft", 1, "—"],
        ["定稿", "final", 2, "—"],
        ["逾期", "overdue", 3, "橙字"],
      ],
    ],
    project_role: [
      "项目角色",
      [
        ["项目经理", "pm", 1, "—"],
        ["后端开发", "backend", 2, "—"],
        ["前端开发", "frontend", 3, "—"],
        ["测试", "qa", 4, "—"],
      ],
    ],
  };
  function renderDict(k) {
    document.querySelectorAll("#dict-types tbody tr").forEach(function (tr) {
      tr.toggleAttribute("aria-selected", tr.getAttribute("data-k") === k);
      if (tr.getAttribute("data-k") === k)
        tr.setAttribute("aria-selected", "true");
    });
    document.getElementById("dict-name").textContent = dict[k][0];
    document.getElementById("dict-data").innerHTML = dict[k][1]
      .map(function (r) {
        return (
          "<tr><td>" +
          r[0] +
          "</td><td><code>" +
          r[1] +
          "</code></td><td>" +
          r[2] +
          '</td><td><span class="sw">' +
          r[3] +
          "</span></td></tr>"
        );
      })
      .join("");
  }
  document.getElementById("dict-types").addEventListener("click", function (e) {
    var tr = e.target.closest("tr[data-k]");
    if (tr) renderDict(tr.getAttribute("data-k"));
  });
  renderDict("task_status");

  /* ---------- issue snapshots across pages ---------- */
  var ISSUE_DATE = [1022, 1021, 1020, 1019];
  function md(n) {
    return Math.floor(n / 100) + "." + (n % 100);
  }

  /* gantt */
  var GDATES = [
    "10.12",
    "10.13",
    "10.14",
    "10.15",
    "10.16",
    "10.19",
    "10.20",
    "10.21",
    "10.22",
    "10.23",
    "10.26",
    "10.27",
    "10.28",
    "10.29",
    "10.30",
    "11.2",
  ];
  function lineLeft(el, at) {
    el.setAttribute("data-at", at);
    el.style.left =
      "calc(var(--name) + (100% - var(--name)) * " + at + " / 16)";
  }
  function applyGantt(i) {
    var over = [2, 1, 0, 0][i],
      today = [8.5, 7.5, 6.5, 5.5][i];
    var cend = document.querySelector('[data-id="Cend"]'),
      ghost = document.getElementById("g-ghost"),
      e = document.querySelector('[data-id="E"]');
    cend.hidden = !over;
    cend.style.gridColumn = "11 / " + (11 + Math.max(over, 1));
    cend.title = "预计多用 " + over + " 天";
    ghost.hidden = !over;
    e.style.gridColumn = 11 + over + " / " + (14 + over);
    e.textContent = over ? "预测" : "计划";
    var t = document.getElementById("gl-today");
    lineLeft(t, today);
    t.querySelector(".g-flag").textContent = i
      ? GDATES[Math.floor(today)]
      : "今天";
    var p = document.getElementById("gl-pred");
    p.hidden = !over;
    lineLeft(p, 13 + over);
    p.querySelector(".g-flag").textContent = "预测 " + GDATES[12 + over];
    document.querySelectorAll(".g-head .d").forEach(function (d, k) {
      d.classList.toggle("today", k === Math.floor(today));
    });
    var gd = document.getElementById("gp-d");
    gd.textContent = GDATES[12 + over];
    gd.classList.toggle("ok", !over);
    document.getElementById("gp-l").innerHTML =
      "本阶段预测<br>计划 10.28 · " + (over ? "晚 " + over + " 天" : "按计划");
    document.getElementById("cpm-sum").innerHTML =
      "关键路径 A → B → C → E　·　总工期 13　·　" +
      (over ? "C 预计超期 <em>+" + over + "</em>" : "按计划");
    depSpec = [
      ["A", "B", false],
      ["B", "C", false],
      [over ? "Cend" : "C", "E", false],
      ["A", "D", false],
      ["Dend", "E", true],
    ];
    setGrowth();
  }

  /* board */
  var COLS = ["todo", "doing", "blocked", "done"],
    liveBoard = null;
  var snapBoard = {
    1: {
      lay: [
        ["t148", "t144", "t146", "t150"],
        ["t142", "t137", "t135"],
        ["t139"],
        ["t131", "t129", "t128"],
      ],
      meta: {
        t139: '<span class="late">逾期 1 天</span>',
        t142: "10.22",
      },
    },
    2: {
      lay: [
        ["t142", "t148", "t144", "t146", "t150"],
        ["t139", "t137", "t135"],
        [],
        ["t131", "t129", "t128"],
      ],
      meta: { t139: "今天截止", t142: "10.22" },
    },
    3: {
      lay: [
        ["t142", "t148", "t144", "t135", "t146", "t150"],
        ["t139", "t137"],
        [],
        ["t131", "t129", "t128"],
      ],
      meta: { t139: "10.20", t142: "10.22" },
    },
  };
  document.querySelectorAll(".card").forEach(function (c) {
    var m = c.querySelector(".meta span:last-child");
    c.dataset.meta = m.outerHTML;
  });
  function layOut(lay, meta) {
    var drops = document.querySelectorAll("#board .drop");
    lay.forEach(function (ids, k) {
      ids.forEach(function (id) {
        var c = document.getElementById(id);
        c.style.animation = "";
        drops[k].appendChild(c);
      });
    });
    document.querySelectorAll(".card").forEach(function (c) {
      var m = c.querySelector(".meta span:last-child");
      m.outerHTML =
        meta && meta[c.id] ? "<span>" + meta[c.id] + "</span>" : c.dataset.meta;
    });
    recount();
  }
  function applyBoard(i) {
    if (i && !liveBoard)
      liveBoard = Array.prototype.map.call(
        document.querySelectorAll("#board .drop"),
        function (d) {
          return Array.prototype.map.call(
            d.querySelectorAll(".card"),
            function (c) {
              return c.id;
            },
          );
        },
      );
    if (i) layOut(snapBoard[i].lay, snapBoard[i].meta);
    else if (liveBoard) {
      layOut(liveBoard, null);
      liveBoard = null;
    }
  }

  /* team */
  function num(s) {
    var m = s.match(/(\d+)-(\d+)/);
    return m ? +m[1] * 100 + +m[2] : 9999;
  }
  function when(s, cut) {
    var n = num(s),
      hm = s.split(" ")[1] || "";
    if (n === 9999) return s;
    if (n === cut) return hm;
    if (n === cut - 1) return "昨天 " + hm;
    return s.replace("-", ".");
  }
  var threadState = {
    0: [
      ["stuck", "逾期 2 天"],
      ["stuck", "逾期 1 天"],
      ["on", "今天截止"],
      ["on", "进行中"],
    ],
  };
  var feedData = [
    ["10-22 10:52", "普通员工 B 把 <b>甘特图组件</b> 的进度更新为 60%"],
    ["10-22 10:41", "普通员工 A 回复了 <b>接口文档字段命名统一</b>"],
    ["10-22 09:30", "测试经理 A 把 <b>补全接口文档</b> 移到阻塞"],
    ["10-21 18:02", "普通员工 C 上传了 <b>答辩 PPT 第二版</b>"],
    ["10-21 15:20", "测试经理 A 新建任务 <b>部署脚本</b>"],
    ["10-21 09:12", "普通员工 B 完成了 <b>数据库表设计</b> 的评审修改"],
    ["10-20 17:40", "普通员工 C 上传了 <b>测试计划</b> v0.1"],
    ["10-20 16:10", "普通员工 A 发起讨论 <b>菜单接口要不要分页</b>"],
    ["10-19 18:30", "普通员工 C 上传了 <b>周会纪要 10.19</b>"],
    ["10-19 10:05", "测试经理 A 把 <b>补全接口文档</b> 移到进行中"],
  ];
  var issueCut = 1022,
    issueIdx = 0;
  function visibleMsgs(t) {
    return t.msgs.filter(function (m) {
      return num(m[1]) <= issueCut;
    });
  }
  function applyTeam(i) {
    issueIdx = i;
    issueCut = ISSUE_DATE[i];
    var st = threadState[0][i];
    threads[0].state = st[0];
    threads[0].note = st[1];
    if (!visibleMsgs(threads[cur]).length)
      cur = threads.findIndex(function (t) {
        return visibleMsgs(t).length;
      });
    renderThreads();
    renderThread();
    document.getElementById("feed").innerHTML = feedData
      .filter(function (f) {
        return num(f[0]) <= issueCut;
      })
      .map(function (f) {
        return (
          '<div class="ev"><time>' +
          when(f[0], issueCut) +
          "</time><p>" +
          f[1] +
          "</p></div>"
        );
      })
      .join("");
    document.getElementById("fd-count").textContent = pad2(
      feedData.filter(function (f) {
        return num(f[0]) <= issueCut;
      }).length,
    );
  }

  /* docs */
  function dnum(s) {
    var p = s.split(".");
    return +p[0] * 100 + +p[1];
  }
  function docAt(d) {
    var h = d.hist.filter(function (x) {
      return dnum(x[1]) <= issueCut;
    });
    if (!h.length) return null;
    var st = d.st,
      late = false;
    if (!d.final) {
      var due = dnum(d.due);
      if (issueCut > due) {
        st = "逾期 " + (issueCut - due) + " 天";
        late = true;
      } else if (issueCut === due) st = "今天截止";
      else st = "修订中";
    }
    return {
      n: d.n,
      task: d.task,
      tid: d.tid,
      who: d.who,
      due: d.due,
      v: h[0][0],
      up: h[0][1],
      st: st,
      late: late,
      hist: h,
    };
  }

  /* ---------- settings: one content, four containers ---------- */
  var wide = false,
    scheme = "drawer",
    bd = "dots";
  var src = document.getElementById("ss-src"),
    sections = Array.prototype.slice.call(src.querySelectorAll(".ss"));
  var ov = document.getElementById("ov"),
    ovHost = document.getElementById("ov-host"),
    sysHost = document.getElementById("sys-host");
  var ovOpen = false,
    curSec = "me";
  /* index & tabs */
  var groups = [];
  sections.forEach(function (s) {
    var g = s.getAttribute("data-g");
    if (groups.indexOf(g) < 0) groups.push(g);
  });
  document.getElementById("ov-index").innerHTML = groups
    .map(function (g, k) {
      return (
        '<nav class="grp' +
        (k === groups.length - 1 ? " admin" : "") +
        '" aria-label="' +
        g +
        '">' +
        sections
          .filter(function (s) {
            return s.getAttribute("data-g") === g;
          })
          .map(function (s) {
            return (
              '<a data-sec="' +
              s.getAttribute("data-sub") +
              '" tabindex="0">' +
              s.getAttribute("data-name") +
              "</a>"
            );
          })
          .join("") +
        "</nav>"
      );
    })
    .join("");
  document.getElementById("ov-tabs").innerHTML = sections
    .map(function (s, k) {
      var sep =
        k && s.getAttribute("data-g") !== sections[k - 1].getAttribute("data-g")
          ? '<i class="tsep" aria-hidden="true"></i>'
          : "";
      return (
        sep +
        '<a data-sec="' +
        s.getAttribute("data-sub") +
        '" tabindex="0">' +
        s.getAttribute("data-name") +
        "</a>"
      );
    })
    .join("");
  document.getElementById("mid-subtabs").innerHTML = sections
    .map(function (s) {
      return (
        '<a href="#sys" data-sec="' +
        s.getAttribute("data-sub") +
        '">' +
        s
          .getAttribute("data-name")
          .replace("与权限", "")
          .replace("系统", "")
          .replace("刊物规则", "项目") +
        "</a>"
      );
    })
    .join("");

  function mark(sec) {
    curSec = sec;
    document.querySelectorAll("[data-sec]").forEach(function (a) {
      if (a.getAttribute("data-sec") === sec)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    sections.forEach(function (s) {
      s.classList.toggle("on", s.getAttribute("data-sub") === sec);
    });
  }
  function place() {
    var host = scheme === "a" ? sysHost : ovHost;
    sections.forEach(function (s) {
      host.appendChild(s);
    });
  }
  function sheetBox() {
    var z = parseFloat(shell.style.zoom) || 1,
      s = shell.getBoundingClientRect();
    var idx = document.getElementById("index").getBoundingClientRect(),
      mh = document.getElementById("masthead").getBoundingClientRect();
    ov.style.left = (idx.right - s.left) / z + "px";
    ov.style.top = (mh.bottom - s.top) / z + 16 + "px";
  }
  function openSettings(sec) {
    sec = sec || curSec;
    if (scheme === "a") {
      place();
      show("system");
      goSec(sec);
      return;
    }
    place();
    ov.className = "ov " + scheme + " opening" + (wide ? " wide" : "");
    var bdEl = document.getElementById("ov-bd");
    bdEl.className = "ov-bd opening";
    bdEl.hidden = false;
    shell.classList.remove(
      "bd-gray",
      "bd-paper",
      "bd-ink",
      "bd-dots",
      "bd-dim",
    );
    shell.classList.add("dim", "bd-" + bd);
    ov.hidden = false;
    ovOpen = true;
    ov.style.paddingTop = "";
    goSec(sec);
    document.getElementById("ov-close").focus({ preventScroll: true });
  }
  function closeSettings() {
    ov.hidden = true;
    ovOpen = false;
    document.getElementById("ov-bd").hidden = true;
    shell.classList.remove("dim");
  }
  document.getElementById("ov-bd").addEventListener("click", closeSettings);
  function goSec(sec) {
    mark(sec);
    var el = document.getElementById("ss-" + sec);
    if (scheme === "a") {
      sysHost.scrollTop = 0;
      sections.forEach(function (s) {
        s.hidden = s !== el;
      });
      replay(document.getElementById("view-system"));
    } else if (scheme === "drawer") {
      sections.forEach(function (s) {
        s.hidden = s !== el;
      });
      ovHost.scrollTop = 0;
    } else {
      sections.forEach(function (s) {
        s.hidden = false;
      });
      ovHost.scrollTop = el.offsetTop - ovHost.offsetTop - 24;
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-sec]");
    if (!a) return;
    e.preventDefault();
    goSec(a.getAttribute("data-sec"));
  });
  document.addEventListener("keydown", function (e) {
    var a = e.target.closest && e.target.closest("[data-sec]");
    if (a && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      goSec(a.getAttribute("data-sec"));
    }
    if (e.key === "Escape" && ovOpen) closeSettings();
    if (e.key === "Escape" && typeof closeForm === "function") closeForm();
  });
  /* scroll-spy for the long page */
  ovHost.addEventListener("scroll", function () {
    if (scheme === "drawer") return;
    var top = ovHost.getBoundingClientRect().top,
      best = sections[0];
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top - top < 120) best = s;
    });
    if (best.getAttribute("data-sub") !== curSec)
      mark(best.getAttribute("data-sub"));
  });
  document.getElementById("ov-close").addEventListener("click", closeSettings);
  document.getElementById("me-btn").addEventListener("click", function () {
    openSettings("me");
  });

  /* two-cell toggles */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".sw2 button");
    if (!b) return;
    b.parentNode.querySelectorAll("button").forEach(function (x) {
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    if (b.parentNode.id === "sw-calm")
      document.body.classList.toggle("calm", b.textContent === "开");
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".days7 .perm, #matrix .pm, .roles .perm");
    if (!b || b.disabled) return;
    b.setAttribute(
      "aria-pressed",
      b.getAttribute("aria-pressed") === "true" ? "false" : "true",
    );
  });

  /* people */
  var people = [
    [
      "第 8 组",
      [
        ["测试经理 A", "pm_a", "项目经理", true],
        ["普通员工 A", "dev_a", "开发", true],
        ["普通员工 B", "dev_b", "开发", true],
        ["普通员工 C", "qa_c", "测试", true],
      ],
    ],
    [
      "未分组",
      [
        ["系统管理员", "admin", "超级管理员", true],
        ["访客", "guest", "只读", false],
      ],
    ],
  ];
  var psel = "pm_a",
    ROLES = ["超级管理员", "项目经理", "开发", "测试", "只读"];
  function renderPeople() {
    document.getElementById("roster").innerHTML = people
      .map(function (g) {
        return (
          '<div class="dept"><h3><span>' +
          g[0] +
          "</span><span>" +
          g[1].length +
          " 人</span></h3>" +
          g[1]
            .map(function (p) {
              return (
                '<button type="button" class="pp' +
                (p[3] ? "" : " off") +
                '" data-acc="' +
                p[1] +
                '"' +
                (p[1] === psel ? ' aria-current="true"' : "") +
                "><span>" +
                p[0] +
                "</span><code>" +
                p[1] +
                "</code></button>"
              );
            })
            .join("") +
          "</div>"
        );
      })
      .join("");
    var p, dept;
    people.forEach(function (g) {
      g[1].forEach(function (x) {
        if (x[1] === psel) {
          p = x;
          dept = g[0];
        }
      });
    });
    document.getElementById("person").innerHTML =
      '<h3 class="who-h">' +
      p[0] +
      '</h3><div class="rows">' +
      '<div class="srow"><span class="lb">账号</span><div><code>' +
      p[1] +
      "</code></div></div>" +
      '<div class="srow"><span class="lb">部门</span><div>' +
      dept +
      "</div></div>" +
      '<div class="srow top"><span class="lb">角色</span><div class="roles">' +
      ROLES.map(function (r) {
        return (
          '<label><button class="perm" type="button" aria-pressed="' +
          (r === p[2]) +
          '" aria-label="' +
          r +
          '"></button>' +
          r +
          "</label>"
        );
      }).join("") +
      "</div></div>" +
      '<div class="srow"><span class="lb">状态</span><div><span class="sw2" role="group" aria-label="账号状态"><button type="button" aria-pressed="' +
      p[3] +
      '">启用</button><button type="button" aria-pressed="' +
      !p[3] +
      '">停用</button></span></div></div>' +
      '</div><div class="acts"><button class="btn" type="button">重置密码</button><button class="btn risk" type="button">删除账号</button></div>';
  }
  document.getElementById("roster").addEventListener("click", function (e) {
    var b = e.target.closest(".pp");
    if (b) {
      psel = b.getAttribute("data-acc");
      renderPeople();
    }
  });
  renderPeople();

  /* role × menu matrix */
  var M = [
    ["项目", null, "grp", [1, 1, 1, 1, 1]],
    ["概览", "project:overview:view", "l1", [1, 1, 1, 1, 1]],
    ["任务", "project:task:list", "l1", [1, 1, 1, 1, 1]],
    ["移动任务", "project:task:move", "l2", [1, 1, 1, 1, 0]],
    ["进度", "project:schedule:view", "l1", [1, 1, 1, 1, 1]],
    ["调整排期", "project:schedule:edit", "l2", [1, 1, 0, 0, 0]],
    ["统计报表", "project:report:view", "l1", [1, 1, 1, 1, 1]],
    ["协作", null, "grp", [1, 1, 1, 1, 1]],
    ["团队协作", "collab:thread:list", "l1", [1, 1, 1, 1, 1]],
    ["文档", "collab:doc:list", "l1", [1, 1, 1, 1, 1]],
    ["上传文档", "collab:doc:upload", "l2", [1, 1, 1, 1, 0]],
    ["成员与权限", "project:member:list", "l1", [1, 1, 0, 0, 0]],
    ["管理", null, "grp", [1, 0, 0, 0, 0]],
    ["系统管理", "system:view", "l1", [1, 0, 0, 0, 0]],
  ];
  document.querySelector("#matrix tbody").innerHTML = M.map(function (r) {
    return (
      '<tr class="' +
      (r[2] === "grp" ? "mg" : "") +
      '"><td class="' +
      (r[2] === "grp" ? "" : r[2]) +
      '">' +
      r[0] +
      "</td><td>" +
      (r[1] ? "<code>" + r[1] + "</code>" : "") +
      "</td>" +
      r[3]
        .map(function (v, k) {
          return (
            '<td class="p"><button class="pm" type="button" aria-pressed="' +
            !!v +
            '"' +
            (k === 0 ? " disabled" : "") +
            ' aria-label="' +
            ROLES[k] +
            " " +
            r[0] +
            '"><i></i></button></td>'
          );
        })
        .join("") +
      "</tr>"
    );
  }).join("");

  place();

  /* ---------- board drag ---------- */
  function recount() {
    document.querySelectorAll(".col").forEach(function (col) {
      col.querySelector(".count").textContent =
        col.querySelectorAll(".card").length;
    });
    var risk = document.querySelectorAll(".col.blocked .card").length,
      rc = document.getElementById("risk-count");
    rc.textContent = risk;
    rc.hidden = !risk;
    var all = document.querySelectorAll("#board .card").length,
      crit = document.querySelectorAll(
        "#board .col:not(.done) .card.crit",
      ).length;
    document.getElementById("bd-kicker").textContent =
      "共 " +
      all +
      " 项 · " +
      (risk ? risk + " 项阻塞" : "没有阻塞") +
      " · " +
      crit +
      " 项在关键路径";
    renderBby();
    if (typeof applyFilter === "function") applyFilter();
  }
  function renderBby() {
    var box = document.getElementById("blocked-by");
    if (typeof T === "undefined" || !T) return;
    var seen = {},
      rows = [];
    document.querySelectorAll(".col.blocked .card").forEach(function (c) {
      var x = T[c.id];
      if (!x) return;
      x.nxt.forEach(function (n) {
        if (seen[n] || !T[n] || stOf(n) === "done") return;
        seen[n] = 1;
        rows.push(
          '<div class="r" data-t="' +
            n +
            '"><b>' +
            T[n].t +
            "</b><span>" +
            T[n].due +
            "</span></div>",
        );
      });
    });
    box.innerHTML = rows.length
      ? '<span class="k">// 因此受阻</span>' + rows.join("")
      : "";
  }
  var drag = null;
  function zoomOf() {
    return parseFloat(shell.style.zoom) || 1;
  }
  document
    .getElementById("board")
    .addEventListener("pointerdown", function (e) {
      var card = e.target.closest(".card");
      if (!card || e.button !== 0 || shown) return;
      drag = {
        card: card,
        x0: e.clientX,
        y0: e.clientY,
        started: false,
        home: card.parentNode,
        next: card.nextSibling,
      };
    });
  function startDrag(e) {
    var c = drag.card,
      z = zoomOf(),
      r = c.getBoundingClientRect();
    var ph = document.createElement("div");
    ph.className = "ph";
    ph.style.height = r.height / z + "px";
    c.parentNode.insertBefore(ph, c);
    drag.ph = ph;
    drag.offX = (e.clientX - r.left) / z;
    drag.offY = (e.clientY - r.top) / z;
    c.style.width = r.width / z + "px";
    c.style.animation = "none";
    c.classList.add("lifted", "floating");
    shell.appendChild(c);
    drag.started = true;
    document.body.classList.add("dragging");
  }
  function moveDrag(e) {
    var c = drag.card,
      z = zoomOf(),
      s = shell.getBoundingClientRect();
    c.style.left = (e.clientX - s.left) / z - drag.offX + "px";
    c.style.top = (e.clientY - s.top) / z - drag.offY + "px";
    var el = document.elementFromPoint(e.clientX, e.clientY),
      drop = el && el.closest(".drop");
    if (!drop) return;
    var before = null;
    Array.prototype.some.call(drop.querySelectorAll(".card"), function (k) {
      var kr = k.getBoundingClientRect();
      if (e.clientY < kr.top + kr.height / 2) {
        before = k;
        return true;
      }
      return false;
    });
    if (before !== drag.ph && drag.ph.nextSibling !== before)
      drop.insertBefore(drag.ph, before);
    else if (!before && drag.ph.parentNode !== drop) drop.appendChild(drag.ph);
  }
  function endDrag(cancel) {
    if (!drag) return;
    if (drag.started) {
      var c = drag.card;
      c.classList.remove("lifted", "floating");
      c.style.left = c.style.top = c.style.width = "";
      if (cancel) {
        drag.home.insertBefore(c, drag.next);
        drag.ph.remove();
      } else drag.ph.replaceWith(c);
      document.body.classList.remove("dragging");
      recount();
    }
    lastDrag = !!(drag && drag.started);
    drag = null;
  }
  document.addEventListener("pointermove", function (e) {
    if (!drag) return;
    if (!drag.started) {
      if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) < 5)
        return;
      startDrag(e);
    }
    moveDrag(e);
  });
  document.addEventListener("pointerup", function () {
    endDrag(false);
  });
  document.addEventListener("pointercancel", function () {
    endDrag(true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drag) endDrag(true);
  });
  recount();

  function index(sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });
  }
  index("#masthead .weeks span");
  index("#view-overview .tl .bar");
  index("#board .card");
  document.querySelectorAll(".tbl tbody").forEach(function (tb) {
    Array.prototype.forEach.call(tb.rows, function (tr, i) {
      tr.style.setProperty("--i", i);
    });
  });
  index(".grp");

  /* ================= tasks: detail page ================= */
  var PH = {
    A: "A 需求分析",
    B: "B 数据库设计",
    C: "C 后端开发",
    D: "D 前端开发",
    E: "E 联调测试",
  };
  var ST = {
    todo: ["待开始", ""],
    doing: ["进行中", "on"],
    blocked: ["阻塞", "stuck"],
    done: ["已完成", "done"],
  };
  var T = {
    t139: {
      t: "补全接口文档",
      ph: "C",
      who: "普通员工 A",
      p: 91,
      s: "10.14",
      due: "10.20",
      est: 5,
      crit: true,
      dep: ["t131"],
      nxt: ["t144", "t148"],
      doc: [2],
      th: 0,
      desc: "补齐菜单和权限两部分的接口说明。字段统一用小驼峰，和若依返回的 menuId、parentId 一致；按钮权限标识用 project:task:move 这样的三段式。",
      log: [
        ["10.22 09:30", "测试经理 A 把任务移到阻塞"],
        ["10.22 09:18", "普通员工 A 在讨论里问权限标识格式"],
        ["10.21 00:00", "任务逾期"],
        ["10.19 10:05", "测试经理 A 把任务移到进行中"],
        ["10.18 16:40", "普通员工 A 上传接口文档 v0.6"],
        ["10.14 09:00", "测试经理 A 创建任务"],
      ],
    },
    t142: {
      t: "权限模块联调",
      ph: "C",
      who: "测试经理 A",
      p: 86,
      s: "10.19",
      due: "10.22",
      est: 4,
      crit: true,
      dep: ["t128"],
      nxt: ["t148"],
      doc: [2],
      th: null,
      desc: "前后端联调菜单权限和角色权限，确认按钮级权限在看板拖动、调整排期两处生效。",
      log: [
        ["10.22 08:50", "测试经理 A 更新进度为 70%"],
        ["10.19 09:00", "测试经理 A 开始任务"],
      ],
    },
    t137: {
      t: "甘特图组件",
      ph: "D",
      who: "普通员工 B",
      p: 74,
      s: "10.20",
      due: "10.23",
      est: 4,
      crit: false,
      dep: ["t131"],
      nxt: [],
      doc: [3],
      th: 1,
      desc: "按工作日画任务条，依赖线用 SVG 按任务条实际位置生成，动画跟着时间轴生长。",
      log: [
        ["10.22 10:52", "普通员工 B 更新进度为 60%"],
        ["10.21 10:02", "普通员工 B 发起讨论 甘特图依赖线怎么画"],
        ["10.20 09:00", "普通员工 B 开始任务"],
      ],
    },
    t135: {
      t: "答辩 PPT 第二版",
      ph: null,
      who: "普通员工 C",
      p: 55,
      s: "10.21",
      due: "10.24",
      est: 3,
      crit: false,
      dep: [],
      nxt: [],
      doc: [],
      th: 2,
      desc: "按老师中期意见调整结构，演示放在最后，每人讲五分钟。",
      log: [
        ["10.21 18:02", "普通员工 C 上传答辩 PPT 第二版"],
        ["10.21 14:00", "普通员工 C 发起讨论 周五彩排时间"],
      ],
    },
    t148: {
      t: "按钮权限指令",
      ph: "D",
      who: "测试经理 A",
      p: 72,
      s: "10.24",
      due: "10.27",
      est: 2,
      crit: false,
      dep: ["t139", "t142"],
      nxt: [],
      doc: [],
      th: null,
      desc: "前端 v-hasPermi 指令按三段式标识隐藏无权限的按钮。等接口文档定下权限标识格式后开始。",
      log: [["10.20 15:00", "测试经理 A 创建任务"]],
    },
    t144: {
      t: "菜单接口",
      ph: "C",
      who: "普通员工 A",
      p: 68,
      s: "10.23",
      due: "10.28",
      est: 3,
      crit: true,
      dep: ["t139"],
      nxt: [],
      doc: [2],
      th: 3,
      desc: "一次返回整棵菜单树，不分页。字段名以接口文档为准。",
      log: [
        ["10.20 16:10", "普通员工 A 发起讨论 菜单接口要不要分页"],
        ["10.19 11:00", "测试经理 A 创建任务"],
      ],
    },
    t146: {
      t: "周会纪要",
      ph: null,
      who: "普通员工 C",
      p: 31,
      s: "10.22",
      due: "10.22",
      est: 1,
      crit: false,
      dep: [],
      nxt: [],
      doc: [6],
      th: null,
      desc: "记录本周周会结论并上传到文档。",
      log: [["10.19 18:30", "普通员工 C 上传周会纪要 10.19"]],
    },
    t150: {
      t: "部署脚本",
      ph: "E",
      who: "未分配",
      p: 24,
      s: "10.29",
      due: "11.02",
      est: 2,
      crit: false,
      dep: [],
      nxt: [],
      doc: [4],
      th: null,
      desc: "一键打包前后端并部署到学校服务器。",
      log: [["10.21 15:20", "测试经理 A 新建任务"]],
    },
    t131: {
      t: "数据库表设计",
      ph: "B",
      who: "普通员工 B",
      p: 0,
      s: "10.15",
      due: "10.17",
      est: 2,
      crit: true,
      dep: ["t129"],
      nxt: ["t139", "t137"],
      doc: [1],
      th: 4,
      desc: "项目、任务、依赖、文档版本、讨论五张核心表，沿用若依的用户和权限表。",
      log: [
        ["10.17 09:00", "测试经理 A 结束评审讨论"],
        ["10.17 08:40", "普通员工 B 完成任务"],
      ],
    },
    t129: {
      t: "需求分析",
      ph: "A",
      who: "测试经理 A",
      p: 0,
      s: "10.12",
      due: "10.16",
      est: 3,
      crit: true,
      dep: [],
      nxt: ["t131"],
      doc: [0],
      th: null,
      desc: "整理用例和非功能需求，形成需求规格说明书。",
      log: [["10.16 17:00", "测试经理 A 完成任务"]],
    },
    t128: {
      t: "登录接口",
      ph: "C",
      who: "普通员工 A",
      p: 0,
      s: "10.16",
      due: "10.18",
      est: 2,
      crit: false,
      dep: [],
      nxt: ["t142"],
      doc: [2],
      th: null,
      desc: "沿用若依登录，加登录失败锁定。",
      log: [["10.18 15:00", "普通员工 A 完成任务"]],
    },
  };
  var COLKEY = ["todo", "doing", "blocked", "done"];
  setTimeout(renderBby, 0);
  function stOf(id) {
    var c = document.getElementById(id);
    if (!c) return "todo";
    var cols = Array.prototype.slice.call(
      document.querySelectorAll("#board .col"),
    );
    return COLKEY[cols.indexOf(c.closest(".col"))] || "todo";
  }
  function lateDays(id) {
    var x = T[id],
      st = stOf(id),
      today = dday(md(issueCut));
    return st === "done" ? 0 : Math.max(0, today - dday(x.due));
  }
  function lvl(p) {
    return p >= 70 ? "高" : p >= 40 ? "中" : "低";
  }
  function depRow(id) {
    var x = T[id];
    if (!x) return "";
    var st = stOf(id),
      late = lateDays(id);
    return (
      '<button type="button" class="dep" data-t="' +
      id +
      '"><i class="key ' +
      ST[st][1] +
      '"></i><b>' +
      x.t +
      "</b><small>" +
      x.who +
      '</small><span class="s' +
      (late ? " late" : "") +
      '">' +
      (late ? "逾期 " + late + " 天" : ST[st][0]) +
      "</span></button>"
    );
  }
  function renderTask() {
    var id = curTask,
      x = T[id];
    if (!x) return;
    var st = stOf(id),
      late = lateDays(id),
      today = dday(md(issueCut)),
      s0 = Math.max(0, dday(x.s)),
      due = dday(x.due);
    var used = 0;
    if (st === "done") used = x.est;
    else if (st !== "todo")
      for (var dd = s0; dd <= today; dd++) if (dd % 7 < 5) used++;
    document.getElementById("tk-crumb").textContent =
      "任务 / " + (x.ph ? PH[x.ph] : "未归入阶段");
    document.getElementById("tk-title").textContent = x.t;
    document.getElementById("tk-status").innerHTML = COLKEY.map(function (k) {
      return (
        '<button type="button" data-st2="' +
        k +
        '" aria-pressed="' +
        (k === st) +
        '"' +
        (shown ? " disabled" : "") +
        '><i class="key ' +
        ST[k][1] +
        '"></i>' +
        ST[k][0] +
        "</button>"
      );
    }).join("");
    document.getElementById("tk-meta").innerHTML =
      '<span class="st"><i class="key ' +
      ST[st][1] +
      '"></i>' +
      ST[st][0] +
      "</span>" +
      (late ? '<span class="late">逾期 ' + late + " 天</span>" : "") +
      "<span>负责人 " +
      x.who +
      "</span>" +
      (st !== "done"
        ? "<span>优先级 " + lvl(x.p) + " · " + x.p + "</span>"
        : "") +
      (x.crit ? '<span class="crit">在关键路径上</span>' : "");
    var blockedNext = x.nxt.filter(function (n) {
      return stOf(n) !== "done";
    }).length;
    var figs = [
      ["计划工期", x.est, "工作日", false],
      ["已用", used, "工作日", false],
      ["截止", x.due, "", late > 0],
      ["等它的任务", blockedNext, "项", false],
    ];
    document.getElementById("tk-figs").innerHTML = figs
      .map(function (f) {
        return (
          '<div class="figure' +
          (f[3] ? " alert" : "") +
          '"><div class="lbl">' +
          f[0] +
          '</div><div class="num">' +
          f[1] +
          (f[2] ? "<small>" + f[2] + "</small>" : "") +
          "</div></div>"
        );
      })
      .join("");
    var t =
      '<i class="now" style="left:' +
      dpc(today + 0.5) +
      '"></i><i class="cap" style="left:' +
      dpc(due + 1) +
      '"></i><i class="duelb' +
      (late ? " late" : "") +
      '" style="left:' +
      dpc(due + 1) +
      '">截止 ' +
      x.due +
      "</i>";
    if (st === "done") t += seg("b done", s0, due + 1);
    else if (st === "todo") t += seg("b todo", s0, due + 1);
    else {
      t += seg("b on", s0, late ? due + 1 : today + 1);
      if (late) t += seg("b over", due + 1, today + 1);
    }
    document.getElementById("tk-time").innerHTML =
      '<div class="dx-axis">' +
      ["10.12", "10.19", "10.26"]
        .map(function (l) {
          return '<span style="left:' + dpc(dday(l)) + '">' + l + "</span>";
        })
        .join("") +
      '</div><div class="trk tt-trk">' +
      t +
      "</div>";
    document.getElementById("tk-deps").innerHTML =
      '<div class="dep-h">前置任务，做完它们才能开始</div>' +
      (x.dep.length
        ? x.dep.map(depRow).join("")
        : '<div class="dep-none">没有前置任务</div>') +
      '<div class="dep-h">后续任务，在等这项完成</div>' +
      (x.nxt.length
        ? x.nxt.map(depRow).join("")
        : '<div class="dep-none">没有后续任务</div>');
    document.getElementById("tk-desc").textContent = x.desc;
    var links = x.doc
      .map(function (k) {
        var d = docAt(docs[k]);
        if (!d) return "";
        return (
          '<button type="button" class="dep" data-go="docs" data-doc="' +
          k +
          '"><span class="tag">文档</span><b>' +
          d.n +
          "</b><small>" +
          d.v +
          '</small><span class="s' +
          (d.late ? " late" : "") +
          '">' +
          d.st +
          "</span></button>"
        );
      })
      .join("");
    if (x.th !== null && threads[x.th])
      links +=
        '<button type="button" class="dep" data-go="team" data-th="' +
        x.th +
        '"><span class="tag">讨论</span><b>' +
        threads[x.th].t +
        "</b><small>" +
        visibleMsgs(threads[x.th]).length +
        ' 条</small><span class="s"></span></button>';
    document.getElementById("tk-links").innerHTML =
      links || '<div class="dep-none">还没有关联的文档或讨论</div>';
    document.getElementById("tk-log").innerHTML = x.log
      .filter(function (l) {
        return dnum(l[0].split(" ")[0]) <= issueCut;
      })
      .map(function (l) {
        return (
          '<div class="ev"><time>' +
          when(l[0].replace(".", "-"), issueCut) +
          "</time><p>" +
          l[1] +
          "</p></div>"
        );
      })
      .join("");
  }
  function openTask(id) {
    if (!T[id]) return;
    if (current !== "task") prevView = current;
    curTask = id;
    if (ovOpen) closeSettings();
    closeForm();
    renderTask();
    show("task");
  }
  function goView(v) {
    if (ovOpen) closeSettings();
    closeForm();
    show(v);
  }
  document.getElementById("tk-back").addEventListener("click", function () {
    goView(prevView || "board");
  });
  document.getElementById("tk-status").addEventListener("click", function (e) {
    var b = e.target.closest("[data-st2]");
    if (!b || b.disabled) return;
    var k = b.getAttribute("data-st2"),
      card = document.getElementById(curTask);
    var drop = document.querySelectorAll("#board .drop")[COLKEY.indexOf(k)];
    if (card && drop) {
      drop.insertBefore(card, drop.firstChild);
      recount();
    }
    T[curTask].log.unshift([
      md(issueCut) + " " + "刚刚",
      "测试经理 A 把任务移到" + ST[k][0],
    ]);
    renderTask();
  });
  document.getElementById("tk-edit").addEventListener("click", function () {
    openForm("edit");
  });
  /* every cross-page jump goes through these two attributes */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-t],[data-go],[data-form]");
    if (!el || el.closest("#lab")) return;
    if (el.hasAttribute("data-form")) {
      openForm(el.getAttribute("data-form"));
      return;
    }
    if (el.hasAttribute("data-t")) {
      if (el.getAttribute("data-t")) openTask(el.getAttribute("data-t"));
      return;
    }
    var v = el.getAttribute("data-go");
    if (v === "docs" && el.hasAttribute("data-doc")) {
      dsel = +el.getAttribute("data-doc");
      renderDocs();
    }
    if (v === "team" && el.hasAttribute("data-th")) {
      cur = +el.getAttribute("data-th");
      renderThreads();
      renderThread();
    }
    goView(v);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var el =
      e.target.closest &&
      e.target.closest(".item[data-t],.item[data-go],.headline[data-t]");
    if (el) el.click();
  });
  document.getElementById("board").addEventListener("click", function (e) {
    var c = e.target.closest(".card");
    if (!c) return;
    if (lastDrag) {
      lastDrag = false;
      return;
    }
    openTask(c.id);
  });
  /* overview and gantt entry points */
  document.getElementById("ov-headline").setAttribute("data-t", "t139");
  document.querySelectorAll("#view-overview .tl .bar").forEach(function (b) {
    var id = TID[b.textContent.trim()];
    if (id) b.setAttribute("data-t", id);
  });
  ["t129", "t131", "t139", "t137", "t150"].forEach(function (id, k) {
    var n = document.querySelectorAll(".g-row .name")[k];
    if (n) n.setAttribute("data-t", id);
  });

  /* ================= form drawer ================= */
  var fx = document.getElementById("fx"),
    fxForm = document.getElementById("fx-form"),
    fxKind = null,
    fxOpen = false,
    newId = 0;
  function chips(name, opts, on, multi) {
    return (
      '<div class="chips" data-name="' +
      name +
      '"' +
      (multi ? ' data-multi="1"' : "") +
      ">" +
      opts
        .map(function (o) {
          var v = Array.isArray(o) ? o[0] : o,
            l = Array.isArray(o) ? o[1] : o;
          return (
            '<button type="button" data-v="' +
            v +
            '" aria-pressed="' +
            (multi ? on.indexOf(v) >= 0 : v === on) +
            '">' +
            l +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  function row(label, body, req, cls, hint) {
    return (
      '<div class="fr' +
      (cls ? " " + cls : "") +
      '"><span class="lb">' +
      label +
      (req ? "<b>*</b>" : "") +
      "</span><div>" +
      body +
      "</div>" +
      (hint ? '<div class="hint">' + hint + "</div>" : "") +
      "</div>"
    );
  }
  var PEOPLE = [
    "测试经理 A",
    "普通员工 A",
    "普通员工 B",
    "普通员工 C",
    "未分配",
  ];
  function openTasks() {
    return Object.keys(T)
      .filter(function (k) {
        return stOf(k) !== "done";
      })
      .map(function (k) {
        return [k, T[k].t];
      });
  }
  function formHTML(kind) {
    if (kind === "task" || kind === "edit") {
      var x =
        kind === "edit"
          ? T[curTask]
          : {
              t: "",
              ph: "C",
              who: "未分配",
              est: 2,
              s: "10.23",
              dep: [],
              desc: "",
            };
      return (
        row(
          "任务名称",
          '<input class="u" id="f-name" value="' +
            x.t +
            '" placeholder="写清楚交付什么，例如 菜单接口">',
          true,
        ) +
        row(
          "所属阶段",
          chips(
            "ph",
            [
              ["A", "A 需求"],
              ["B", "B 数据库"],
              ["C", "C 后端"],
              ["D", "D 前端"],
              ["E", "E 联调"],
            ],
            x.ph || "",
          ),
        ) +
        row("负责人", chips("who", PEOPLE, x.who)) +
        row(
          "排期",
          '<div class="inl">从<input class="u n" id="f-start" value="' +
            x.s +
            '">开始，做<input class="u n" id="f-est" value="' +
            x.est +
            '" inputmode="numeric">个工作日</div>',
          true,
          "",
          "截止日按工作日自动推算，跳过周末和节假日",
        ) +
        row(
          "前置任务",
          chips(
            "dep",
            openTasks().filter(function (o) {
              return o[0] !== curTask || kind !== "edit";
            }),
            x.dep,
            true,
          ),
          false,
          "top",
          "选了前置任务，关键路径和预测完工会重新计算",
        ) +
        row(
          "说明",
          '<textarea class="u" id="f-desc" placeholder="验收标准、注意事项">' +
            (x.desc || "") +
            "</textarea>",
          false,
          "top",
        ) +
        '<div class="fx-acts"><button class="btn primary" type="submit">' +
        (kind === "edit" ? "保存" : "创建任务") +
        '</button><button class="btn" type="button" data-close>取消</button><span class="note">优先级按截止日和后续任务数自动算</span></div>'
      );
    }
    if (kind === "doc") {
      return (
        '<label class="dz" id="f-dz"><b>把文件拖到这里，或点此选择</b><small>Word、PDF、Markdown，单个不超过 20 MB</small><input type="file" id="f-file"></label>' +
        row(
          "上传到",
          chips(
            "doc",
            [["new", "新文档"]].concat(
              docs
                .map(function (d, k) {
                  return [String(k), d.n];
                })
                .filter(function (o, k) {
                  return !docs[k].final;
                }),
            ),
            String(
              dsel === undefined
                ? "new"
                : docs[dsel] && !docs[dsel].final
                  ? dsel
                  : "new",
            ),
          ),
          true,
          "top",
          "选已有文档会存成新版本，版本号自动加一",
        ) +
        row(
          "版本说明",
          '<input class="u" id="f-note" placeholder="这一版改了什么，例如 补充菜单接口">',
          true,
        ) +
        row("关联任务", chips("task", openTasks(), "t139"), false, "top") +
        '<div class="fx-acts"><button class="btn primary" type="submit">上传</button><button class="btn" type="button" data-close>取消</button></div>'
      );
    }
    if (kind === "project") {
      return (
        row(
          "项目名称",
          '<input class="u" id="f-pname" placeholder="例如 测试项目 小程序">',
          true,
          "",
          "会显示在报头上，建议 12 个字以内",
        ) +
        row(
          "周期",
          '<div class="inl">从<input class="u n" id="f-ps" value="10.26">到<input class="u n" id="f-pe" value="12.20"></div>',
          true,
          "",
          "日报按工作日出版，每周一期进度格",
        ) +
        row(
          "成员",
          chips("pm", PEOPLE.slice(0, 4), ["测试经理 A"], true),
          false,
          "top",
          "你会自动成为项目经理，其他人收到邀请后加入",
        ) +
        '<div class="fx-acts"><button class="btn primary" type="submit">创建项目</button><button class="btn" type="button" data-close>取消</button></div>'
      );
    }
    if (kind === "member") {
      return (
        row(
          "账号",
          '<input class="u" id="f-acc" placeholder="若依账号或邮箱">',
          true,
          "",
          "对方第一次登录时会被要求改密码",
        ) +
        row(
          "显示名",
          '<input class="u" id="f-who" placeholder="例如 普通员工 D">',
          true,
        ) +
        row(
          "项目角色",
          chips("role", ["后端开发", "前端开发", "测试", "只读"], "后端开发"),
        ) +
        row(
          "初始权限",
          '<div class="pms">' +
            PERMS.map(function (p, k) {
              return (
                '<button class="pm" type="button" data-k="' +
                k +
                '" aria-pressed="' +
                (k === 0) +
                '"><i></i>' +
                p[0] +
                "</button>"
              );
            }).join("") +
            "</div>",
          false,
          "top",
          "加入后可以在成员页随时修改",
        ) +
        '<div class="fx-acts"><button class="btn primary" type="submit">发送邀请</button><button class="btn" type="button" data-close>取消</button></div>'
      );
    }
    return "";
  }
  var FXT = {
    task: "新建任务",
    edit: "编辑任务",
    doc: "上传文档",
    member: "邀请成员",
    project: "新建项目",
  };
  /* ================= project switcher ================= */
  var projects = [
      {
        n: "测试项目 App",
        no: "第 32 期",
        st: '<span class="late">1 项逾期</span> · 4 人 · 11.29 结束',
        mode: "main",
      },
      {
        n: "测试项目 Web",
        no: "第 3 期",
        st: "刚开始，还没有任务 · 2 人",
        mode: "new",
      },
      {
        n: "毕业设计选题系统",
        no: "已归档",
        st: "9.20 结束 · 只能查看",
        mode: "arch",
      },
    ],
    curProj = 0,
    projMode = "main";
  var projPop = document.getElementById("projs"),
    projBtn = document.getElementById("mh-project");
  function renderProjs() {
    document.getElementById("proj-list").innerHTML = projects
      .map(function (p, k) {
        return (
          '<button type="button" data-proj="' +
          k +
          '"' +
          (k === curProj ? ' aria-current="true"' : "") +
          (p.mode === "arch" ? ' class="arch"' : "") +
          '><span class="no">' +
          p.no +
          '</span><span class="hd">' +
          p.n +
          '</span><span class="dt">' +
          p.st +
          "</span></button>"
        );
      })
      .join("");
  }
  function switchProj(k) {
    curProj = k;
    projMode = projects[k].mode;
    document.getElementById("proj-name").textContent = projects[k].n;
    document.getElementById("issue-no").textContent =
      projects[k].mode === "main"
        ? "第 " + issues[shown].no + " 期"
        : projects[k].no;
    document.getElementById("mid-weeks").style.visibility =
      projects[k].mode === "main" ? "" : "hidden";
    document.getElementById("risk-count").style.visibility =
      projects[k].mode === "main" ? "" : "hidden";
    projPop.hidden = true;
    projBtn.setAttribute("aria-expanded", "false");
    renderProjs();
    goView(current === "task" ? "board" : current);
  }
  projBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    renderProjs();
    projPop.hidden = !projPop.hidden;
    projBtn.setAttribute("aria-expanded", projPop.hidden ? "false" : "true");
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-proj]");
    if (b) {
      switchProj(+b.getAttribute("data-proj"));
      return;
    }
    if (!projPop.hidden && !projPop.contains(e.target)) {
      projPop.hidden = true;
      projBtn.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !projPop.hidden) {
      projPop.hidden = true;
      projBtn.setAttribute("aria-expanded", "false");
      projBtn.focus();
    }
  });
  function openForm(kind) {
    if (shown && kind !== "member" && kind !== "project") return;
    if (ovOpen) closeSettings();
    var pp = document.getElementById("projs");
    if (pp) pp.hidden = true;
    fxKind = kind;
    document.getElementById("fx-title").textContent = FXT[kind];
    fxForm.innerHTML = formHTML(kind);
    fx.hidden = false;
    fxOpen = true;
    var bd = document.getElementById("fx-bd");
    bd.hidden = false;
    bd.className = "ov-bd opening";
    fx.classList.add("opening");
    shell.classList.remove(
      "bd-gray",
      "bd-paper",
      "bd-ink",
      "bd-dots",
      "bd-dim",
    );
    shell.classList.add("dim", "bd-dim");
    var first = fxForm.querySelector("input.u");
    if (first) first.focus({ preventScroll: true });
  }
  function closeForm() {
    if (!fxOpen) return;
    fx.hidden = true;
    fxOpen = false;
    document.getElementById("fx-bd").hidden = true;
    if (!ovOpen) shell.classList.remove("dim");
  }
  document.getElementById("fx-close").addEventListener("click", closeForm);
  document.getElementById("fx-bd").addEventListener("click", closeForm);
  fxForm.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) {
      closeForm();
      return;
    }
    var b = e.target.closest(".chips button");
    if (b) {
      var g = b.parentNode;
      if (g.hasAttribute("data-multi"))
        b.setAttribute(
          "aria-pressed",
          b.getAttribute("aria-pressed") === "true" ? "false" : "true",
        );
      else
        g.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
      return;
    }
    var pm = e.target.closest(".pm");
    if (pm)
      pm.setAttribute(
        "aria-pressed",
        pm.getAttribute("aria-pressed") === "true" ? "false" : "true",
      );
  });
  fxForm.addEventListener("dragover", function (e) {
    var z = e.target.closest(".dz");
    if (z) {
      e.preventDefault();
      z.classList.add("over");
    }
  });
  fxForm.addEventListener("dragleave", function (e) {
    var z = e.target.closest(".dz");
    if (z) z.classList.remove("over");
  });
  fxForm.addEventListener("drop", function (e) {
    var z = e.target.closest(".dz");
    if (!z) return;
    e.preventDefault();
    z.classList.remove("over");
    var f = e.dataTransfer.files[0];
    if (f) z.querySelector("b").textContent = f.name;
  });
  fxForm.addEventListener("change", function (e) {
    if (e.target.id === "f-file" && e.target.files[0])
      document.querySelector("#f-dz b").textContent = e.target.files[0].name;
  });
  function pick(name) {
    var g = fxForm.querySelector('.chips[data-name="' + name + '"]');
    if (!g) return null;
    var on = Array.prototype.filter
      .call(g.querySelectorAll("button"), function (b) {
        return b.getAttribute("aria-pressed") === "true";
      })
      .map(function (b) {
        return b.getAttribute("data-v");
      });
    return g.hasAttribute("data-multi") ? on : on[0] || null;
  }
  function need(input, msg) {
    var r = input.closest(".fr"),
      old = r.querySelector(".err");
    if (old) old.remove();
    if (input.value.trim()) return true;
    r.insertAdjacentHTML("beforeend", '<div class="err">' + msg + "</div>");
    input.focus();
    return false;
  }
  fxForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (fxKind === "task" || fxKind === "edit") {
      var name = document.getElementById("f-name");
      if (!need(name, "填写任务名称后才能保存")) return;
      var est = Math.max(
          1,
          parseInt(document.getElementById("f-est").value, 10) || 1,
        ),
        start = document.getElementById("f-start").value.trim() || "10.23";
      var dueN = dday(start) + Math.ceil((est * 7) / 5) - 1,
        due = dueN >= 20 ? "11." + (dueN - 19) : "10." + (dueN + 12);
      var data = {
        t: name.value.trim(),
        ph: pick("ph"),
        who: pick("who") || "未分配",
        s: start,
        due: due,
        est: est,
        dep: pick("dep") || [],
        desc: document.getElementById("f-desc").value.trim() || "还没有说明。",
      };
      if (fxKind === "edit") {
        var x = T[curTask];
        Object.keys(data).forEach(function (k) {
          x[k] = data[k];
        });
        var c = document.getElementById(curTask);
        if (c) {
          c.querySelector(".title").textContent = x.t;
          c.querySelector(".meta span").textContent = x.who;
        }
        x.log.unshift([md(issueCut) + " 刚刚", "测试经理 A 修改了任务"]);
        closeForm();
        renderTask();
        return;
      }
      var id = "n" + ++newId;
      data.p = 50 + data.dep.length * 10;
      data.crit = false;
      data.nxt = [];
      data.doc = [];
      data.th = null;
      data.log = [[md(issueCut) + " 刚刚", "测试经理 A 创建任务"]];
      T[id] = data;
      data.dep.forEach(function (d) {
        if (T[d]) T[d].nxt.push(id);
      });
      var lv = lvl(data.p),
        cls = data.p >= 70 ? "p-h" : data.p >= 40 ? "p-m" : "p-l";
      var drop = document.querySelector("#board .drop");
      drop.insertAdjacentHTML(
        "afterbegin",
        '<article class="card fresh" id="' +
          id +
          '"><div class="top"><span class="tag">T-新</span><span class="score ' +
          cls +
          '">' +
          lv +
          "<small>" +
          data.p +
          '</small></span></div><span class="title">' +
          data.t.replace(/[<>&]/g, "") +
          '</span><div class="meta"><span>' +
          data.who +
          "</span><span>" +
          due +
          "</span></div></article>",
      );
      var nc = document.getElementById(id);
      nc.dataset.meta = nc.querySelector(".meta span:last-child").outerHTML;
      recount();
      closeForm();
      goView("board");
      setTimeout(function () {
        nc.classList.remove("fresh");
      }, 2400);
    }
    if (fxKind === "doc") {
      var note = document.getElementById("f-note");
      if (!need(note, "写一句版本说明，组员才知道改了什么")) return;
      var target = pick("doc");
      if (target === "new" || target === null) {
        docs.push({
          n: document
            .querySelector("#f-dz b")
            .textContent.replace(/^把文件.*$/, "未命名文档")
            .replace(/\.[^.]+$/, ""),
          tid: pick("task"),
          task: T[pick("task")] ? PH[T[pick("task")].ph] || "—" : "—",
          who: "测试经理 A",
          due: "10.30",
          st: "修订中",
          hist: [["v0.1", md(issueCut), "测试经理 A", note.value.trim()]],
        });
        dsel = docs.length - 1;
      } else {
        var d = docs[+target],
          last = d.hist[0][0].replace("v", "").split(".");
        d.hist.unshift([
          "v" + last[0] + "." + (+last[1] + 1),
          md(issueCut),
          "测试经理 A",
          note.value.trim(),
        ]);
        d.final = false;
        dsel = +target;
      }
      renderDocs();
      closeForm();
      goView("docs");
    }
    if (fxKind === "project") {
      var pn = document.getElementById("f-pname");
      if (!need(pn, "给项目起个名字")) return;
      var who = (pick("pm") || []).length;
      projects.splice(projects.length - 1, 0, {
        n: pn.value.trim(),
        no: "第 1 期",
        st:
          "刚创建 · " +
          Math.max(1, who) +
          " 人 · " +
          document.getElementById("f-pe").value.trim() +
          " 结束",
        mode: "new",
      });
      closeForm();
      switchProj(projects.length - 2);
      return;
    }
    if (fxKind === "member") {
      var acc = document.getElementById("f-acc"),
        who = document.getElementById("f-who");
      if (
        !need(acc, "填写对方的账号或邮箱") ||
        !need(who, "填写一个组员能认出来的名字")
      )
        return;
      var pms = Array.prototype.map.call(
        fxForm.querySelectorAll(".pms .pm"),
        function (b) {
          return b.getAttribute("aria-pressed") === "true" ? 1 : 0;
        },
      );
      crew.push([
        who.value.trim(),
        pick("role") || "只读",
        acc.value.trim(),
        0,
        0,
        pms,
      ]);
      renderCrew();
      document
        .getElementById("perm-log")
        .insertAdjacentHTML(
          "afterbegin",
          '<div class="hv"><b>刚刚</b><span>测试经理 A 邀请 ' +
            who.value.trim() +
            " 加入项目</span></div>",
        );
      closeForm();
      goView("members");
    }
  });
  document
    .querySelector("#view-docs .toolbar .btn.primary")
    .setAttribute("data-form", "doc");
  document.getElementById("crew").addEventListener("click", function (e) {
    if (e.target.closest(".c-tools .btn")) openForm("member");
  });

  /* ================= page states (demo switch) ================= */
  var EMPTY = {
    overview: [
      "项目刚创建，还没有可以报道的事",
      "先在任务页建几项任务、填上工期，明天早上的日报就会有内容。",
      "task",
      "新建任务",
    ],
    board: [
      "还没有任务",
      "新建第一项任务，指定负责人和工期，看板会按状态分成四列。",
      "task",
      "新建任务",
    ],
    task: [
      "这项任务已经被删除",
      "可能是项目经理刚刚删除了它。回到看板看看现在的任务。",
      "board",
      "回到看板",
    ],
    gantt: [
      "还没有排期",
      "给任务填上工期和前置任务后，这里会画出关键路径和预测完工日期。",
      "board",
      "去任务页",
    ],
    reports: [
      "数据还不够画图",
      "燃尽图从第一项任务完成那天开始累计，工时从本周第一次更新进度开始统计。",
      "",
      "",
    ],
    team: [
      "还没有讨论",
      "在任务详情里发起讨论，讨论会自动关联到那项任务。",
      "board",
      "去任务页",
    ],
    docs: [
      "还没有文档",
      "上传第一份文档并关联到任务，之后每次上传同名文档都会存成新版本。",
      "doc",
      "上传文档",
    ],
    members: [
      "项目里只有你一个人",
      "邀请组员加入，再按分工给他们编辑任务、调整排期这些权限。",
      "member",
      "邀请成员",
    ],
    system: ["", "", "", ""],
  };
  var VNAME = {
    overview: "日报",
    board: "任务",
    task: "任务",
    gantt: "排期",
    reports: "统计",
    team: "讨论",
    docs: "文档",
    members: "成员",
    system: "设置",
  };
  function applyState() {
    var ps = document.getElementById("pstate");
    var stt =
      projMode === "main" ? pageState : projMode === "new" ? "empty" : "arch";
    if (stt === "ok" || current === "system") {
      ps.hidden = true;
      return;
    }
    views.forEach(function (v) {
      v.hidden = true;
    });
    var e = EMPTY[current] || EMPTY.board,
      h = "";
    if (stt === "empty") {
      h =
        '<div class="eyebrow">' +
        VNAME[current] +
        "</div><h2>" +
        e[0] +
        "</h2><p>" +
        e[1] +
        "</p>" +
        (e[2]
          ? '<div class="acts"><button class="btn primary" type="button" ' +
            (e[2] === "board"
              ? 'data-go="board"'
              : 'data-form="' + e[2] + '"') +
            ">" +
            e[3] +
            "</button></div>"
          : "");
    } else if (stt === "arch") {
      h =
        '<div class="eyebrow">' +
        VNAME[current] +
        '</div><h2>这个项目已在 9 月 20 日归档</h2><p>归档的项目只能查看，任务、排期和文档都不能再改。要继续推进，请项目经理在设置的刊物规则里取消归档。</p><div class="acts"><button class="btn primary" type="button" data-proj="0">回到测试项目 App</button></div>';
    } else if (stt === "loading") {
      h =
        '<div class="eyebrow">' +
        VNAME[current] +
        '</div><h2>正在载入第 32 期</h2><div class="strip" aria-hidden="true">' +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
          .map(function (k) {
            return '<span style="--k:' + k + '"></span>';
          })
          .join("") +
        "</div><p>一般一两秒就好。</p>" +
        '<div class="ghost" aria-hidden="true">' +
        [0, 1, 2, 3]
          .map(function (k) {
            return '<i style="--k:' + k + '"></i>';
          })
          .join("") +
        "</div>";
    } else {
      h =
        '<div class="eyebrow">' +
        VNAME[current] +
        "没能载入</div><h2>服务器 10 秒没有响应</h2><p>可能是网络断了，或者后端正在重启。已经填写的内容还在，重试不会丢失。如果一直失败，把这条信息发给项目经理：请求 /project/" +
        current +
        '/list 超时。</p><div class="acts"><button class="btn primary" type="button" id="ps-retry">重试</button></div>';
    }
    ps.className = "pstate" + (stt === "error" ? " err" : "");
    ps.innerHTML = h + '<div class="double bottom"><i></i><i></i></div>';
    ps.hidden = false;
  }
  document.getElementById("pstate").addEventListener("click", function (e) {
    if (e.target.id === "ps-retry") setState("ok");
  });
  function setState(st) {
    pageState = st;
    document.querySelectorAll("#lab [data-st]").forEach(function (b) {
      b.setAttribute(
        "aria-pressed",
        b.getAttribute("data-st") === st ? "true" : "false",
      );
    });
    show(current);
  }

  /* ================= heavy data ================= */
  var EXTRA_TODO = [
    ["on", "接口自动化测试脚本", "周一"],
    ["", "甘特图拖拽调整工期", "下周五"],
    ["stuck", "部署环境申请", "逾期", "late"],
    ["", "登录失败锁定", "下周四"],
  ];
  var EXTRA_CREW = [
    ["普通员工 D", "前端开发", "dev_d", 4, 36, [1, 0, 1, 0]],
    ["普通员工 E", "后端开发", "dev_e", 2, 18, [1, 0, 1, 0]],
    ["普通员工 F", "测试（兼文档）", "qa_f", 3, 41, [1, 0, 1, 0]],
    ["实习生 G", "界面设计", "ui_g", 1, 12, [0, 0, 1, 0]],
  ];
  var EXTRA_DOCS = [
    {
      n: "权限设计说明（按钮级权限标识与菜单树字段对照表）",
      task: "C 后端开发",
      who: "普通员工 E",
      st: "修订中",
      due: "10.23",
      hist: [
        ["v0.2", "10.21", "普通员工 E", "补字段对照"],
        ["v0.1", "10.19", "普通员工 E", "初稿"],
      ],
    },
    {
      n: "部署手册",
      task: "E 联调测试",
      who: "普通员工 F",
      st: "修订中",
      due: "10.21",
      hist: [["v0.1", "10.18", "普通员工 F", "初稿"]],
    },
    {
      n: "界面规范",
      task: "D 前端开发",
      who: "实习生 G",
      st: "修订中",
      due: "10.29",
      hist: [
        ["v0.4", "10.22", "实习生 G", "补颜色"],
        ["v0.1", "10.13", "实习生 G", "初稿"],
      ],
    },
    {
      n: "周会纪要 10.12",
      final: true,
      task: "—",
      who: "普通员工 C",
      st: "定稿",
      due: "10.12",
      hist: [["v1.0", "10.12", "普通员工 C", "会议记录"]],
    },
    {
      n: "周会纪要 10.5",
      final: true,
      task: "—",
      who: "普通员工 C",
      st: "定稿",
      due: "10.5",
      hist: [["v1.0", "10.5", "普通员工 C", "会议记录"]],
    },
    {
      n: "技术选型说明",
      final: true,
      task: "—",
      who: "测试经理 A",
      st: "定稿",
      due: "9.30",
      hist: [["v1.1", "9.30", "测试经理 A", "改用若依前后端分离版"]],
    },
    {
      n: "中期检查报告",
      final: true,
      task: "—",
      who: "测试经理 A",
      st: "定稿",
      due: "10.9",
      hist: [["v1.0", "10.9", "测试经理 A", "提交版"]],
    },
    {
      n: "风险登记表",
      final: true,
      task: "—",
      who: "测试经理 A",
      st: "定稿",
      due: "10.15",
      hist: [["v1.2", "10.15", "测试经理 A", "新增服务器账号风险"]],
    },
  ];
  var EXTRA_CARDS = [
    [
      0,
      "菜单树懒加载与权限过滤（前端路由守卫部分）",
      "普通员工 D",
      52,
      "10.29",
    ],
    [0, "甘特图拖拽调整工期", "普通员工 B", 77, "10.31"],
    [0, "登录失败锁定", "普通员工 E", 45, "10.30"],
    [0, "导出周报为 PDF", "普通员工 F", 28, "11.04"],
    [0, "界面走查", "实习生 G", 22, "11.05"],
    [1, "接口自动化测试脚本", "普通员工 F", 60, "10.26"],
    [1, "文档版本对比", "普通员工 D", 48, "10.27"],
    [1, "首页加载优化", "普通员工 E", 35, "10.28"],
    [
      2,
      "部署环境申请（等学校服务器账号）",
      "普通员工 F",
      80,
      '<span class="late">逾期 1 天</span>',
    ],
    [3, "项目初始化", "测试经理 A", 0, "10.13"],
    [3, "若依代码生成", "普通员工 E", 0, "10.14"],
    [3, "需求评审", "测试经理 A", 0, "10.15"],
  ];
  var EXTRA_TL = [
    ["普通员工 D", [["on", 0, 57, "菜单树懒加载"]]],
    [
      "普通员工 E",
      [
        ["on", 14, 43, "登录失败锁定"],
        ["next", 60, 26, "首页加载"],
      ],
    ],
    [
      "普通员工 F",
      [
        ["stuck", 0, 43, "部署环境申请"],
        ["on", 43, 43, "接口自动化测试"],
      ],
    ],
    ["实习生 G", [["next", 43, 43, "界面走查"]]],
  ];
  var baseCrew = crew.length,
    baseDocs = docs.length;
  function setVol(v) {
    vol = v;
    document.querySelectorAll("#lab [data-vol]").forEach(function (b) {
      b.setAttribute(
        "aria-pressed",
        b.getAttribute("data-vol") === v ? "true" : "false",
      );
    });
    document.querySelectorAll(".xtra").forEach(function (el) {
      el.remove();
    });
    crew.length = baseCrew;
    docs.length = baseDocs;
    if (v === "full") {
      EXTRA_CREW.forEach(function (m) {
        crew.push(m.slice());
      });
      EXTRA_DOCS.forEach(function (d) {
        docs.push(d);
      });
      var drops = document.querySelectorAll("#board .drop");
      EXTRA_CARDS.forEach(function (c, k) {
        var lvC = c[3] >= 70 ? "p-h" : c[3] >= 40 ? "p-m" : "p-l";
        drops[c[0]].insertAdjacentHTML(
          "beforeend",
          '<article class="card xtra" id="x' +
            k +
            '"><div class="top"><span class="tag">T-' +
            (201 + k) +
            "</span>" +
            (c[0] === 3
              ? ""
              : '<span class="score ' +
                lvC +
                '">' +
                lvl(c[3]) +
                "<small>" +
                c[3] +
                "</small></span>") +
            '</div><span class="title">' +
            c[1] +
            '</span><div class="meta"><span>' +
            c[2] +
            "</span><span>" +
            c[4] +
            "</span></div></article>",
        );
        var el = document.getElementById("x" + k);
        el.dataset.meta = el.querySelector(".meta span:last-child").outerHTML;
      });
      var rows = document.querySelector("#view-overview .tl .rows");
      EXTRA_TL.forEach(function (r) {
        rows.insertAdjacentHTML(
          "beforeend",
          '<div class="row xtra"><span class="who">' +
            r[0] +
            '</span><div class="lane">' +
            r[1]
              .map(function (b) {
                return (
                  '<div class="bar ' +
                  b[0] +
                  '" style="left:' +
                  b[1] +
                  "%;width:" +
                  b[2] +
                  '%">' +
                  (b[0] === "stuck" ? "<span>" + b[3] + "</span>" : b[3]) +
                  "</div>"
                );
              })
              .join("") +
            "</div></div>",
        );
      });
    }
    document.getElementById("crew").style.gridTemplateColumns =
      "230px repeat(" + crew.length + ", minmax(160px, 1fr))";
    renderCrew();
    renderDocs();
    recount();
    renderIssue(shown);
    show(current);
  }
  document.getElementById("lab").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-st")) setState(b.getAttribute("data-st"));
    if (b.hasAttribute("data-vol")) setVol(b.getAttribute("data-vol"));
    if (b.id === "lab-t")
      setLabMin(!document.getElementById("lab").classList.contains("min"));
  });
  function setLabMin(m) {
    var lab = document.getElementById("lab"),
      t = document.getElementById("lab-t");
    lab.classList.toggle("min", m);
    t.textContent = m ? "演示" : "收起";
    t.setAttribute("aria-expanded", m ? "false" : "true");
    try {
      localStorage.setItem("lab-min", m ? "1" : "0");
    } catch (err) {}
  }
  try {
    if (localStorage.getItem("lab-min") === "1") setLabMin(true);
  } catch (err) {}

  /* view-head controls: past issues, segmented toggles, board filter */
  document.querySelectorAll(".open-issues").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      ibtn.click();
    });
  });
  var bdFilter = "all";
  function applyFilter(f) {
    if (f) bdFilter = f;
    document.querySelectorAll("#board .card").forEach(function (c) {
      var who = (c.querySelector(".meta span") || {}).textContent;
      c.classList.toggle(
        "dimmed",
        bdFilter === "mine"
          ? who !== "测试经理 A"
          : bdFilter === "crit"
            ? !c.classList.contains("crit")
            : false,
      );
    });
  }
  document.querySelectorAll(".seg").forEach(function (g) {
    g.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      g.querySelectorAll("button").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      if (g.id === "bd-filter") applyFilter(b.getAttribute("data-f"));
    });
  });

  window.addEventListener("resize", function () {
    fit();
    if (!document.getElementById("view-gantt").hidden) drawDeps(false);
  });
  fit();
  document.getElementById("masthead").classList.add("first");
  window.__snapReady = true;
  renderIssue(0);
  var start = (location.hash || "").replace("#", "");
  if (start === "sys") start = "overview";
  show(built[start] || names[start] ? start : "overview");
  if (location.hash === "#sys") openSettings("people");
})();
