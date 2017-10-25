console.log('\nsourcelink\n');

AFRAME.registerComponent('dev-info', {
  tick: function (time, timeDelta) {
    var c = document.getElementsByTagName('a-camera')[0];
    var pc = c.getAttribute('position').y;

    this.el.setAttribute('text', 'value', `cam.y: ${pc.toPrecision(3)}\nnet: ${main.net}`);
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

AFRAME.registerComponent('track-add-remove', {
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
  schema: {
    not: { type: 'string', default: '' }
  },
  init: function () {
    var my = this;
    this.el.addEventListener('componentchanged', function (evt) {
      evt.detail.target.flushToDOM();
      //console.log('evt componentchanged', [evt, evt.path], evt.detail.target);
      if (my.data.not !== evt.detail.name) {
        //console.log("track", [evt], my, my.data, evt.detail.name, evt.detail.target);
        pushPouch();
      }
    });
  }
});

function logEvt(s, evt) {
  //console.log(s, [evt, evt.path], evt.detail.el);
  pushPouch();
}
