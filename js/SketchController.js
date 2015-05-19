define([
  'firebase',
  'jquery',
  'leap',
  'leapjsplugins',
  'lodash',
  'kibo',

  'js/RiftSandbox',
  'js/File',
  'js/Sketch',

  'text!js/Files/Behaviors.js',
  'text!js/Files/Boid.js',
  'text!js/Files/World.js'
],
function (
  Firebase,
  $,
  Leap,
  leapjsplugins,
  _,
  Kibo,

  RiftSandbox,
  File,
  Sketch,

  Behaviors,
  Boid,
  World
) {
  'use strict';
  var SketchController = function() {
    var mode = window.location.search;

    var setupVideoPassthrough = function () {
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia(
        {video: true},
        function (stream) {
          var monitor = document.getElementById('monitor');
          monitor.src = window.URL.createObjectURL(stream);
        },
        function () {
          // video pass-through is optional.
        }
      );
    };
    // setupVideoPassthrough();

    this.executeCode = function () {
      var code = this.sketch.getCode();
      if (!this.riftSandbox) { return; }
      this.riftSandbox.clearScene();
      var _sketchLoop;
      this.riftSandbox.setInfo('');
      try {
        /* jshint -W054 */
        var _sketchFunc = new Function(
          'scene', 'camera',
          '"use strict";\n' + code
        );
        /* jshint +W054 */
        _sketchLoop = _sketchFunc(
          this.riftSandbox.scene, this.riftSandbox.cameraPivot);
      }
      catch (err) {
        this.riftSandbox.setInfo(err.toString());
      }
      if (_sketchLoop) {
        this.sketchLoop = _sketchLoop;
      }
    };

    var setupDomTextArea = function (file) {
      var domTextArea = $('<textarea>').
        appendTo('body').
        on('keyup', function (e) {
          var contents = e.target.value;
          if (contents === file.contents) { return; }
          file.contents = contents;
          // this.executeCode();
        }.bind(this)).
        on('keydown', function (e) {
          // e.stopPropagation();
        }).
        val(file.contents).
        get(0);
      this.bindKeyboardShortcuts(domTextArea, file);
      return domTextArea;
    }.bind(this);

    var setupSketch = function () {
      this.sketch = new Sketch('', [
        new File('Behaviors', Behaviors),
        new File('Boid', Boid),
        new File('World', World)
      ]);
      this.domTextAreas = this.sketch.files.map(setupDomTextArea);
      this.currentDomTextArea = this.domTextAreas[0];
      this.currentFile = this.sketch.files[0];
      this.executeCode();
    }.bind(this);

    var mousePos = {x: 0, y: 0};
    window.addEventListener(
      'mousemove',
      function (e) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
      },
      false
    );

    this.sketchLoop = function () {};

    this.mainLoop = function () {
      window.requestAnimationFrame( this.mainLoop.bind(this) );

      // Apply movement
      // if (this.deviceManager.sensorDevice && this.riftSandbox.vrMode) {
      //   this.riftSandbox.setHmdPositionRotation(
      //     this.deviceManager.sensorDevice.getState());
      // }
      // else {
      //   this.riftSandbox.setRotation({
      //     y: mousePos.x / window.innerWidth * Math.PI * 2
      //   });
      // }
      // this.riftSandbox.setBaseRotation();
      // this.riftSandbox.updateCameraPositionRotation();

      try {
        this.sketchLoop();
      }
      catch (err) {
        this.riftSandbox.setInfo(err.toString());
      }

      this.riftSandbox.render();
    };

    var spinNumberAndKeepSelection = function (direction, amount) {
      var start = this.currentDomTextArea.selectionStart;
      this.currentFile.spinNumberAt(start, direction, amount);
      this.currentDomTextArea.value = this.currentFile.contents;
      this.executeCode();
      this.currentDomTextArea.selectionStart = (
        this.currentDomTextArea.selectionEnd = start);
    }.bind(this);

    var offsetNumberAndKeepSelection = function (offset) {
      var start = this.currentDomTextArea.selectionStart;
      this.currentFile.offsetOriginalNumber(offset);
      this.currentDomTextArea.value = this.currentFile.contents;
      this.executeCode();
      this.currentDomTextArea.selectionStart = (
        this.currentDomTextArea.selectionEnd = start);
    }.bind(this);

    this.handStart = this.handCurrent = null;
    this.modifierPressed = this.shiftPressed = false;

    var getShortcut = function (key) {
      key = key || '';
      return ['alt shift ' + key, 'ctrl shift ' + key];
    };

    this.is_editor_visible = true;
    this.toggleTextArea = function () {
      this.is_editor_visible = !this.is_editor_visible;
      this.riftSandbox.toggleTextArea(this.is_editor_visible);
    };
    this.bindKeyboardShortcuts = function (domTextArea, file) {
      var kibo = new Kibo(domTextArea);
      kibo.down(getShortcut('z'), function () {
        this.riftSandbox.controls.zeroSensor();
        return false;
      }.bind(this));
      kibo.down(getShortcut('e'), function () {
        this.toggleTextArea();
        return false;
      }.bind(this));
      kibo.down(getShortcut('u'), function () {
        spinNumberAndKeepSelection(-1, 10);
        return false;
      });
      kibo.down(getShortcut('i'), function () {
        spinNumberAndKeepSelection(1, 10);
        return false;
      });
      kibo.down(getShortcut('j'), function () {
        spinNumberAndKeepSelection(-1, 1);
        return false;
      });
      kibo.down(getShortcut('k'), function () {
        spinNumberAndKeepSelection(1, 1);
        return false;
      });
      kibo.down(getShortcut('n'), function () {
        spinNumberAndKeepSelection(-1, 0.1);
        return false;
      });
      kibo.down(getShortcut('m'), function () {
        spinNumberAndKeepSelection(1, 0.1);
        return false;
      });
      var getNext = function (arr, item) {
        return arr[((arr.indexOf(item) + 1) % arr.length)];
      };
      kibo.down(getShortcut('right'), function () {
        this.currentFile = getNext(this.sketch.files, this.currentFile);
        this.currentDomTextArea = getNext(
          this.domTextAreas, this.currentDomTextArea);
        // this.currentDomTextArea.focus();
        return false;
      }.bind(this));

      var MOVEMENT_RATE = 0.01;
      var ROTATION_RATE = 0.01;

      kibo.down('w', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(MOVEMENT_RATE);
        }
      }.bind(this));
      kibo.up('w', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(0);
        }
      }.bind(this));

      kibo.down('s', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(-MOVEMENT_RATE);
        }
      }.bind(this));
      kibo.up('s', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(0);
        }
      }.bind(this));

      kibo.down('a', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y += ROTATION_RATE;
        }
      }.bind(this));
      kibo.down('d', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y -= ROTATION_RATE;
        }
      }.bind(this));

      kibo.down('q', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y += Math.PI / 4;
        }
      }.bind(this));
      kibo.down('e', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y -= Math.PI / 4;
        }
      }.bind(this));

      kibo.down(getShortcut(), function () {
        if (this.shiftPressed) { return false; }
        this.shiftPressed = true;
        return false;
      }.bind(this));
      kibo.up('shift', function () {
        this.shiftPressed = false;
        return false;
      }.bind(this));

      kibo.down(getShortcut(), function () {
        if (this.modifierPressed) { return false; }
        var start = this.currentDomTextArea.selectionStart;
        file.recordOriginalNumberAt(start);
        this.modifierPressed = true;
        return false;
      }.bind(this));
      kibo.up(getShortcut(), function () {
        this.modifierPressed = false;
        return false;
      }.bind(this));
    }.bind(this);

    var toggleVrMode = function () {
      if (
        !(document.mozFullScreenElement || document.webkitFullScreenElement) &&
        this.riftSandbox.vrMode
      ) {
        this.isInfullscreen = false;
        this.riftSandbox.toggleVrMode();
      }
      else {
        this.isInfullscreen = true;
      }
    }.bind(this);
    document.addEventListener('mozfullscreenchange', toggleVrMode, false);
    document.addEventListener('webkitfullscreenchange', toggleVrMode, false);
    $(function () {
      $('body').on('click', function () {
        // this.currentDomTextArea.focus();
      }.bind(this));
      setupSketch();
      this.riftSandbox = new RiftSandbox(
        window.innerWidth, window.innerHeight, this.domTextAreas,
        function (err) {
          this.seemsUnsupported = !!err;
        }.bind(this)
      );

      if (!mode) {
        Leap.loop({}, function (frame) {
          var h0 = frame.hands[0]
          var h1 = frame.hands[1]
          if (
            frame.hands.length > 1 &&
            h0.grabStrength > 0.8 &&
            h1.grabStrength > 0.8
          ) {
            var v0 = new THREE.Vector3();
            v0.set.apply(v0, h0.palmPosition)
            var v1 = new THREE.Vector3();
            v1.set.apply(v1, h1.palmPosition)
            var dist = v0.distanceTo(v1);
            if (this.handStart) {
              var factor = 1;
              var offset = Math.round((dist - this.handStart) / factor * 1000) / 1000;
              offsetNumberAndKeepSelection(offset);
            }
            else {
              this.handStart = dist;
              var start = this.currentDomTextArea.selectionStart;
              this.currentFile.recordOriginalNumberAt(start);
            }
          }
          else {
            this.handStart = null;
          }
        }.bind(this));

        Leap.loopController.use('transform', {
          vr: true,
          effectiveParent: this.riftSandbox.camera
        });
        Leap.loopController.use('boneHand', {
          scene: this.riftSandbox.scene
        });
      }

      this.riftSandbox.interceptScene();

      this.executeCode();

      if (mode) {
        this.toggleTextArea();
      }

      window.addEventListener(
        'resize',
        this.riftSandbox.resize.bind(this.riftSandbox),
        false
      );

      var kibo = new Kibo(this.domTextArea);
      kibo.down(getShortcut('v'), function () {
        this.riftSandbox.toggleVrMode();
        this.riftSandbox.vrManager.toggleVRMode();
        return false;
      }.bind(this));

      this.riftSandbox.resize();

      this.mainLoop();
    }.bind(this));
  };
  return SketchController;
});

