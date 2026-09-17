(function () {
  "use strict";

  // Mobile nav toggle
  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
      });
    });
  }

  // Duplicate marquee tracks so the loop is seamless
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    var clone = track.innerHTML;
    track.innerHTML = clone + clone;
  });

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    btn.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (i) {
        i.classList.remove("open");
      });
      if (!wasOpen) item.classList.add("open");
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  // Contact form: submits to our own /api/contact endpoint, which relays to GoHighLevel server-side
  var form = document.getElementById("leadForm");
  var formCard = document.getElementById("contactForm");
  var successMsg = document.getElementById("formSuccess");
  var errorMsg = document.getElementById("formError");
  var errorText = document.getElementById("formErrorText");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnHTML = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";
      }
      errorMsg.classList.remove("show");

      var payload = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        company: form.company.value.trim(),
        volume: form.volume.value
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Request failed with status " + res.status);
          }
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          successMsg.classList.add("show");
          formCard.classList.add("submitted");
        })
        .catch(function () {
          errorText.textContent =
            "Something went wrong sending your request. Please try again, or email us directly.";
          errorMsg.classList.add("show");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
        });
    });
  }
})();
