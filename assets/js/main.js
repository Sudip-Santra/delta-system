// Mobile nav toggle
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// FAQ accordion (one open at a time)
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const wasOpen = item.classList.contains("open");
    item.parentElement.querySelectorAll(".faq-item.open").forEach((el) => {
      el.classList.remove("open");
      el.querySelector(".faq-q").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// Contact form -> Netlify Forms (submissions show in the Netlify dashboard)
const form = document.querySelector("#contact-form");
if (form) {
  const status = form.querySelector(".form-status");
  const submit = form.querySelector(".btn-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "Sending…";
    submit.disabled = true;
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error("Something went wrong.");
      status.classList.add("ok");
      status.textContent = "Thanks for submitting! We'll get back to you soon.";
      form.reset();
    } catch (err) {
      status.classList.add("err");
      status.textContent = err.message + " You can also email contact@deltasystem.in.";
    } finally {
      submit.disabled = false;
    }
  });
}

// Alpha videos (Wix format): colour in the top half, transparency mask in the bottom half.
// Combined with WebGL into a transparent canvas; the still image stays if anything fails.
document.querySelectorAll("img[data-alpha-video]").forEach((img) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
  if (!gl) return;
  const video = Object.assign(document.createElement("video"), { src: img.dataset.alphaVideo, muted: true, loop: true, playsInline: true });

  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 uv; void main() { uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }"));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, "precision mediump float; uniform sampler2D t; varying vec2 uv;" +
    "void main() { vec3 c = texture2D(t, vec2(uv.x, uv.y * .5)).rgb; float a = texture2D(t, vec2(uv.x, .5 + uv.y * .5)).r; gl_FragColor = vec4(c * a, a); }"));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
    gl.texParameteri(gl.TEXTURE_2D, k, v);

  const draw = () => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!canvas.isConnected) img.replaceWith(canvas); // swap in after the first real frame
    video.requestVideoFrameCallback ? video.requestVideoFrameCallback(draw) : requestAnimationFrame(draw);
  };
  video.addEventListener("loadeddata", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight / 2;
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }, { once: true });
  video.play().catch(() => {});
});
