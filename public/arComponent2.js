import { tapPlaceComponent } from "./tap-place";

AFRAME.registerComponent("animator", {
  init() {
    this.el.addEventListener("click", () => {
      this.el.setAttribute("animation-mixer", "clip: *");
    });
  },
});

AFRAME.registerComponent("tap-place", tapPlaceComponent);
