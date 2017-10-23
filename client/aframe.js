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
    var p = this.el.getAttribute('position');
    if (p.y != 1.6)
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
      evt.detail.el.addEventListener('componentchanged', function (evt) {
        logEvt('evt componentchanged', evt);
      });
    });
    this.el.addEventListener('child-detached', function (evt) {
      logEvt('evt child-detached', evt);
    });
  }
});

AFRAME.registerComponent('track', {
  init: function () {
    this.el.addEventListener('componentchanged', function (evt) {
      evt.detail.target.flushToDOM();
      console.log('evt componentchanged', [evt, evt.path], evt.detail.target);
    });
  }
});

function logEvt(s, evt) {
  console.log(s, [evt, evt.path], evt.detail.el);
}
