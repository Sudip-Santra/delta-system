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
