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

    var SEPARATION = 0.9;

    boid.obj.quaternion.slerp(
      q, SEPARATION
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

var moveBehavior = function (boid) {
  // boid.obj.translateZ(0.001);
};
