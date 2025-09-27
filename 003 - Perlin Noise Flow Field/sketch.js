let cols, rows;
let scale = 20;
let inc = 0.1;
let zoff = 0;
let particles = [];
let flowfield = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    cols = floor(width / scale);
    rows = floor(height / scale);

    flowfield = new Array(cols * rows);

    for (let i = 0; i < 200; i++) {
        particles[i] = new Particle();
    }

    background(0);
}
//try
function draw() {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
            let v = p5.Vector.fromAngle(angle);
            v.setMag(1);
            flowfield[x + y * cols] = v;
            xoff += inc;
        }
        yoff += inc;
    }
    zoff += 0.003;

    for (let i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
    }
}

// Particle class
class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxspeed = 2;
        this.prevPos = this.pos.copy();
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    show() {
        stroke(255, 50);
        strokeWeight(1);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.prevPos = this.pos.copy();
    }

    edges() {
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = height;
        this.prevPos = this.pos.copy();
    }

    follow(vectors) {
        let x = floor(this.pos.x / scale);
        let y = floor(this.pos.y / scale);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    }
}
