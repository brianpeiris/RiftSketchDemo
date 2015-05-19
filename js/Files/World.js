var t3 = THREE;

var light = new t3.PointLight();
light.position.set(0, 1, 0);
scene.add(light);

scene.add(new t3.AmbientLight(0xaaaaaa));

var world = {
  boids: []
};
var numBoids = 10;

var positions = [
  new t3.Vector3(0.00, 1.60, -1.60),
  new t3.Vector3(0.10, 1.50, -1.60),
  new t3.Vector3(0.70, 1.80, -1.80),
  new t3.Vector3(0.40, 1.60, -1.60),
  new t3.Vector3(-0.40, 1.30, -2.00),
  new t3.Vector3(0.00, 1.30, -1.20),
  new t3.Vector3(-0.20, 1.20, -1.60),
  new t3.Vector3(0.00, 1.40, -2.60),
  new t3.Vector3(0.00, 1.60, -2.60),
  new t3.Vector3(0.60, 1.20, -1.60)
];

for (var i = 0; i < numBoids; i++) {
  var boid =  new Boid(world);
  boid.obj.position.copy(positions[i]);
  boid.visual.material.color.setHSL(i / 10, 1, 0.5);
  world.boids.push(boid);
}

return function () {
  scene.remove.apply(
    scene, scene.children.filter(
      function (x) {return x.name === 'line';}
    )
  );
  for (var i = 0; i < numBoids; i++) {
    var boid = world.boids[i];
    boid.step();
  }
};

