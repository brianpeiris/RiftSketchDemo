var flockingBehavior = function (
  boid, world
) {
  var closestBoids = [];

  var getLookAtQuaternion = function (otherBoid) {
    var q = new t3.Quaternion();
    q.copy(boid.obj.quaternion);
    var m1 = new t3.Matrix4();
    m1.lookAt(
      otherBoid.obj.position,
      boid.obj.position,
      boid.obj.up);
    q.setFromRotationMatrix(m1);
    return q;
  };

  var separate = function (otherBoid) {
    if (
      otherBoid.obj.position.distanceTo(
        boid.obj.position) < 0.1
    ) { return; }
    var q = getLookAtQuaternion(
      otherBoid);
    q.conjugate();
    boid.obj.quaternion.slerp(
      q, 0.01
    );
  };

  var align = function (otherBoid) {
    boid.obj.quaternion.slerp(
      otherBoid.obj.quaternion, 0.05
    );
  };

  var adhere = function (otherBoid) {
    if (
      otherBoid.obj.position.distanceTo(
        boid.obj.position) > 0.2
    ) { return; }
    var q = getLookAtQuaternion(otherBoid);
    boid.obj.quaternion.slerp(
      q, 0.01
    );
  };

  world.boids.forEach(function (otherBoid) {
    if (
      otherBoid.obj.position.distanceTo(
        boid.obj.position) < 0.5
    ) {
      separate(otherBoid);
      align(otherBoid);
      adhere(otherBoid);
    }
  });
};

var randomRotationBehavior = function (boid) {
  boid.obj.rotateOnAxis(
    new t3.Vector3(1, 0, 0),
    (Math.random() - 0.5) / 5
  );
  boid.obj.rotateOnAxis(
    new t3.Vector3(0, 1, 0),
    (Math.random() - 0.5) / 5
  );
  boid.obj.rotateOnAxis(
    new t3.Vector3(0, 0, 1),
    (Math.random() - 0.5) / 5
  );
};

var moveBehavior = function (boid) {
  boid.obj.translateZ(0.01);
};
