var t3 = THREE;

var light = new t3.PointLight();
light.position.set(0, 1, 0);
scene.add(light);

scene.add(new t3.AmbientLight(0xaaaaaa));

var world = {
  boids: []
};
var numBoids = 50;

for (var i = 0; i < numBoids; i++) {
  var boid =  new Boid(world);
  world.boids.push(boid);
}

return function () {
  scene.remove.apply(
    scene, scene.children.filter(
function (x) {return x.name === 'line';}
));
  for (var i = 0; i < numBoids; i++) {
    var boid = world.boids[i];
    boid.step();
  }
};

