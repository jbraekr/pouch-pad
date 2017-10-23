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
      }
        , 2 * 1000);
    });
  }
});

AFRAME.registerComponent('track-changes', {
  init: function () {
    this.el.addEventListener('child-attached', function (evt) {
      logEvt('evt child-attached', evt);
    });
    this.el.addEventListener('child-detached', function (evt) {
      logEvt('evt child-detached', evt);
    });
  }
});

function logEvt(s, evt) {
  console.log(s, evt, evt.path, evt.detail.el);

}
