var t3 = THREE;

var light = new t3.PointLight();
light.position.set(0, 1, 0);
scene.add(light);

scene.add(new t3.AmbientLight(0xaaaaaa));

var world = {
  boids: []
};

var NUM_BOIDS = 5;

for (var i = 0; i < NUM_BOIDS; i++) {
  var boid =  new Boid(world);
  world.boids.push(boid);
}

return function () {
  for (var i = 0; i < NUM_BOIDS; i++) {
    var boid = world.boids[i];
    boid.step();
  }
};

