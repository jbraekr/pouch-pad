console.log('sourcelink');


AFRAME.registerComponent('dev-info', {
  tick: function (time, timeDelta) {
    var c = document.getElementsByTagName('a-camera')[0];
    var pc = c.getAttribute('position').y;

    this.el.setAttribute('text', 'value', `cam.y: ${pc.toPrecision(3)} `);
  }
});


AFRAME.registerComponent('fix-cam', {
  tick: function (time, timeDelta) {
    this.el.setAttribute('position', 'y', 1.6);
  }
});


AFRAME.registerComponent('inspect-immediate', {
  init: function () {
    this.el.addEventListener('loaded', function () {
      setTimeout(() => {
        console.log("inspecting");
        this.components.inspector.injectInspector();
      },
        1 * 1000);
    });
  }
});
