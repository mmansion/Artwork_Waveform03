// template 16x9

PFont h1,h2,h3;

int w  = 800;
int h  = 450;
int bg = 255;
int inc = 1;
int link  = 400;

int r;
int offCent = 30;

PVector p1, p2, p3;
PVector p4, p5;

int a, b, c, d, e, f; // edges
float A, B, C; // angles

PVector input, constraint, output;
int base = h - 50;

void settings() {
  size(w, h);
  
  c = link/2; //set fixed hypotenuse length
  
  r = c - 1;
  
  p1 = new PVector(w/2 - offCent, base);
  p2 = new PVector(w/2, base - 300);
  p3 = new PVector(w/2, base);
  p4 = new PVector();
  p5 = new PVector();
}

void setup() {
  noFill();
  
  h1 = createFont("ProximaNova-Regular-24.vlw", 24);
  h2 = createFont("ProximaNova-Regular-24.vlw", 18);
  h3 = createFont("ProximaNova-Regular-24.vlw", 12); 
}

void draw() {
  background(bg);
  noFill();
  strokeWeight(1);
  drawGuides();
  stroke(0);
  
  // update edges (note: c stays constant)
  
  b = int(abs(p1.x - p3.x));
  
  // pythagorean to solve for edge a
  a = int(sqrt( (sq(c) - sq(b)) ));
  
  d = a; // edge lengths mirrored
  e = b;
  f = c;
  
  // update points
  
  p2.y = base - a;
  
  p4.x = p2.x + b;
  p4.y = p2.y - a;
  p5.x = p2.x + b;
  p5.y = p2.y;
  
  /* draw edges
  -----------------------------------*/
  stroke(255,150, 0);
  
  // (edge a) opposite
  line(p2.x, p2.y, p3.x, p3.y);
  
  // (edge b)
  line(p1.x, p1.y, p3.x, p3.y);
  
  // (edge e) 
  line(p2.x, p2.y, p5.x, p5.y);
  
  // (edge d)
  line(p4.x, p4.y, p5.x, p5.y);
  
  strokeWeight(2);
  stroke(0);
  
  // (edge c) hypotenuse
  line(p1.x, p1.y, p2.x, p2.y);
  
  // (edge f) hypotenuse 2 
  line(p2.x, p2.y, p4.x, p4.y);
  
  // draw points
  
  fill(255,0,0);
  drawPoint(p1);
  
  fill(0,0,255);
  drawPoint(p2);
  
  fill(0,255,0);
  drawPoint(p4);
  
  fill(255);
  strokeWeight(1);
  drawPoint(p3);
  drawPoint(p5);
  
  noFill();
  //forces numerator to be treated as float 
  // which in turn promotes denominator to float, 
  // and a float-division is performed instead of an int-division.
  A = asin(float(a) / c);

  arc(p1.x, p1.y, 50, 50, radians(360) - A, radians(360));
  
  textFont(h3);

  fill(100);
  stroke(0);
  
  text("A: " + int(degrees(A)), p1.x + 25, p1.y - 10);
  text("b: " + b, w/2  - (abs(p1.x - p3.x) / 2), base + 20);
  text("a: " + a, w/2  + 10, base - (a/2) );
  text("c: " + c, (p1.x + p2.x) / 2 - 50, (p1.y + p2.y) / 2);
  
  text("d: " + a, w/2  + e + 10, p2.y - (d/2) );
  text("e: " + e, w/2  + (abs(p2.x - p5.x) / 2), p2.y + 20);
  text("c: " + c, (p2.x + p4.x) / 2 - 50, (p2.y + p4.y) / 2);

  text("p1", p1.x - 20, p1.y - 10);
  text("p2", p2.x - 20, p2.y - 10);
  text("p3", p3.x + 10, p3.y);
  text("p4", p4.x + 10, p4.y);
  text("p5", p5.x + 10, p5.y);
  
  // now change the input (driving point)
  changeInput(p1);
}

void drawGuides() {
 stroke(0, 255, 255);
 line(0, h/2, w, h/2);
 line(w/2, 0, w/2, h);
 //base line
 line(0, base, w, base);
}

void changeInput(PVector i) {
  if(i.x > w/2 - offCent || i.x < w/2 - r) {
    inc *= -1;
  }
  i.x += inc;
}

void drawPoint(PVector p) {
  ellipse(p.x, p.y, 10, 10);
}