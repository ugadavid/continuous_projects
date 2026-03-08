class SpriteViewer {
  constructor(el) {

    
    this.hideTimer = null;
    // On crée un wrapper externe pour gérer le style sans toucher au viewer
    this.frame = document.createElement("div");
    this.frame.className = "sprite-frame";
    


    // On insère le viewer original dans le wrapper
    el.parentNode.insertBefore(this.frame, el);
    this.frame.appendChild(el);

    this.el = el; // le viewer reste le viewer

    this.name = el.dataset.sprite;
    this.frame.dataset.title = this.name;

    this.displaySize = parseInt(el.dataset.size) || 100;
    this.delaySeconds = parseFloat(el.dataset.delay) || 1;
    this.delay = this.delaySeconds * 1000;
    this.cols = 10;
    this.total = 100;
    this.index = 0;
    this.interval = null;
    this.isPlaying = true;
    this.mode = this.el.dataset.mode || "auto"; // auto | hover | manual
    this.isMini = this.el.dataset.mini === "true";

    this.img = new Image();
    this.img.src = `sprites/${this.name}.png`;
    this.img.onload = () => this.init();
  }

  init() {
    this.cellW = this.img.width / this.cols;
    this.cellH = this.img.height / this.cols;

    this.el.classList.add("sprite-viewer");
    this.el.style.width = `${this.displaySize}px`;
    this.el.style.height = `${this.displaySize}px`;
    this.el.style.backgroundImage = `url(${this.img.src})`;
    this.el.style.backgroundSize = `${this.displaySize * this.cols}px ${this.displaySize * this.cols}px`;

    this.show(0);
    if (this.mode !== "hover") {
      this.start();
    }

    if (this.mode === "hover") {
      this.el.addEventListener("mousemove", (e) => this.handleHover(e));
    }

    // Toggle UI on click
    this.el.addEventListener("click", (e) => {
      if (e.target.closest(".sprite-overlay")) return; // clic sur contrôle = pas toggle
      this.el.classList.toggle("show-controls");

      if (this.el.classList.contains("show-controls")) {
        this.startAutoHide();
      }      

    });

    

  if (!this.isMini) {
    // Add overlay
    this.createControls();
    //  Sprite Selector
    this.createSpriteSelectorButton();
  }

    
  }


  createSpriteSelectorButton() {
    const wrapper = document.createElement("div");
    wrapper.className = "sprite-extras";

    const btn = document.createElement("button");
    btn.textContent = "🎨 Changer de sprite";
    btn.style.marginTop = "10px";
    btn.style.display = "block";
    btn.style.fontSize = "14px";
    btn.style.cursor = "pointer";

    //this.el.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", () => {
      if (!this.selectorContainer) {
        this.createSpriteSelectorGrid();
      } else {
        this.selectorContainer.classList.toggle("visible");
      }
    });

    wrapper.appendChild(btn);
    this.el.appendChild(wrapper);
  }

  createSpriteSelectorGrid() {
    this.selectorContainer = document.createElement("div");
    this.selectorContainer.className = "sprite-selector-grid";

    fetch("sprites-list.json")
      .then(res => res.json())
      .then(list => {
        list.forEach(item => {
          const div = document.createElement("div");
          div.className = "sprite-thumbnail";
          div.title = item.label;

          const mini = document.createElement("div");
          mini.className = "sprite-viewer";
          mini.dataset.sprite = item.name;
          mini.dataset.size = 64;
          mini.dataset.delay = 1;
          mini.dataset.mode = "auto";
          mini.dataset.mini = "true";

          div.appendChild(mini);
          const label = document.createElement("p");
          label.textContent = item.label;
          label.style.margin = "4px 0 0";
          label.style.fontSize = "11px";
          label.style.color = "#ddd";
          div.appendChild(label);

          this.selectorContainer.appendChild(div);

          div.addEventListener("click", () => {
            this.changeSprite(item.name);

            // 👇 Fermer la galerie
            if (this.selectorContainer) {
              this.selectorContainer.classList.remove("visible");
            }
          });
        });

        //this.el.parentNode.insertBefore(this.selectorContainer, this.el.nextSibling);
        this.el.appendChild(this.selectorContainer);
        this.selectorContainer.classList.add("visible");
        // Initialiser les mini sprite viewers
        initSpriteViewersIn(this.selectorContainer);
      });
  }

  changeSprite(name) {
    this.stop();
    this.el.style.backgroundImage = `url(sprites/${name}.png)`;
    this.name = name;
    this.index = 0;
    this.frame.dataset.title = name;


    // --- NEW: highlight du sprite actif ---
    if (this.selectorContainer) {
      this.selectorContainer.querySelectorAll(".sprite-thumbnail")
        .forEach(div => div.classList.remove("selected"));

      const activeThumb = this.selectorContainer.querySelector(
        `[data-sprite="${name}"]`
      )?.parentNode;

      if (activeThumb) activeThumb.classList.add("selected");
    }
  }




  setMode(mode) {
    this.mode = mode;

    // Arrête tout
    this.stop();

    if (mode === "auto") {
      this.start();
      this.el.removeEventListener("mousemove", this._hoverHandler);
    } else if (mode === "hover") {
      this._hoverHandler = (e) => this.handleHover(e);
      this.el.addEventListener("mousemove", this._hoverHandler);
    } else if (mode === "manual") {
      this.el.removeEventListener("mousemove", this._hoverHandler);
    }
  }



  handleHover(e) {
    const rect = this.el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / this.displaySize;
    const frame = Math.floor(ratio * this.total);
    this.index = Math.max(0, Math.min(this.total - 1, frame));
    this.show(this.index);
  }

  createControls() {
    const overlay = document.createElement("div");
    overlay.className = "sprite-overlay";

    // ← Prev
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "←";
    btnPrev.onclick = () => this.prev();

    // ▶️ Pause/Play
    const btnPause = document.createElement("button");
    btnPause.textContent = "⏸️";
    btnPause.onclick = () => {
      this.togglePlay();
      btnPause.textContent = this.isPlaying ? "⏸️" : "▶️";
    };

    // → Next
    const btnNext = document.createElement("button");
    btnNext.textContent = "→";
    btnNext.onclick = () => this.next();

    // ⏱️ Vitesse
    const selectSpeed = document.createElement("select");
    [0.2, 0.5, 1, 1.5, 2, 3].forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = `${s}s`;
      if (s === this.delaySeconds) opt.selected = true;
      selectSpeed.appendChild(opt);
    });
    selectSpeed.onchange = () => {
      const newSpeed = parseFloat(selectSpeed.value);
      this.setSpeed(newSpeed);
    };
    const selectMode = document.createElement("select");
    ["auto", "manual", "hover"].forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
      if (m === this.mode) opt.selected = true;
      selectMode.appendChild(opt);
    });
    selectMode.onchange = () => this.setMode(selectMode.value);

    

    overlay.appendChild(selectMode);
    overlay.appendChild(btnPrev);
    overlay.appendChild(btnPause);
    overlay.appendChild(btnNext);
    overlay.appendChild(selectSpeed);

    this.el.appendChild(overlay);


    // Relancer le timer dès interaction
[btnPrev, btnPause, btnNext, selectSpeed].forEach(control => {
  control.addEventListener("click", (e) => {
    e.stopPropagation(); // pour ne pas trigger le toggle
    this.startAutoHide();
  });
});
  }

  show(i) {
    const x = -(i % this.cols) * this.displaySize;
    const y = -Math.floor(i / this.cols) * this.displaySize;
    this.el.style.backgroundPosition = `${x}px ${y}px`;
  }

  next() {
    this.index = (this.index + 1) % this.total;
    this.show(this.index);
  }

  prev() {
    this.index = (this.index - 1 + this.total) % this.total;
    this.show(this.index);
  }

  start() {
    this.stop();
    this.interval = setInterval(() => this.next(), this.delay);
    this.isPlaying = true;
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.isPlaying = false;
  }

  togglePlay() {
    this.isPlaying ? this.stop() : this.start();
  }

  setSpeed(seconds) {
    this.delaySeconds = seconds;
    this.delay = seconds * 1000;
    if (this.isPlaying) this.start();
  }

  startAutoHide() {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.el.classList.remove("show-controls");
    }, 5000);
  }

}






const spriteViewers = [];

document.addEventListener("DOMContentLoaded", () => {
  const els = document.querySelectorAll("[data-sprite]");
  els.forEach(el => {
    const viewer = new SpriteViewer(el);
    spriteViewers.push(viewer);
  });

  // Clavier global
  document.addEventListener("keydown", (e) => {
    const viewer = spriteViewers[0];
    if (!viewer) return;
    switch (e.key) {
      case "ArrowRight": viewer.next(); break;
      case "ArrowLeft": viewer.prev(); break;
      case " ": e.preventDefault(); viewer.togglePlay(); break;
    }
  });

  document.addEventListener("click", (e) => {
  spriteViewers.forEach(viewer => {
    // Fermer overlay contrôles
    if (!viewer.el.contains(e.target)) {
      viewer.el.classList.remove("show-controls");
    }
    // Fermer galerie sprite si visible
    if (viewer.selectorContainer && !viewer.el.contains(e.target)) {
      viewer.selectorContainer.classList.remove("visible");
    }
  });
});


});



function initSpriteViewersIn(container) {
  container.querySelectorAll("[data-sprite]").forEach(el => {
    new SpriteViewer(el);
  });
}
