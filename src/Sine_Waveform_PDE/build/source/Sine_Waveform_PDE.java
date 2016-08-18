import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class Sine_Waveform_PDE extends PApplet {

int NUM_POINTS = 4;
int SPACING = 300;
int ANGLE_OFFSET = 90;
int mode = 1;

int radius = 50;
float inc = 2;

int size = 100;

float angles[];

PVector points[] = new PVector[NUM_POINTS];
PVector lastPoints[] = new PVector[NUM_POINTS];
PVector bzPt1, bzPt2, bzCtrlPt1, bzCtrlPt2;

public void setup() {

  size(1200, 800);

  bzPt1 = new PVector();
  bzPt2 = new PVector();
  bzCtrlPt1 = new PVector();
  bzCtrlPt2 = new PVector();

  float startAngle = 0;
  angles = new float[NUM_POINTS];
  for(int p = 0; p < NUM_POINTS; p++) {
    angles[p] = startAngle += ANGLE_OFFSET;
    points[p] = new PVector(0,0);
    lastPoints[p] = new PVector(0,0);
  }

  noFill();
}

public void draw() {

  background(255);

  noFill();

  line(width/2, 0, width/2, height);

  for(int p = 0; p < NUM_POINTS; p++) {

    lastPoints[p] = points[p];
    lastPoints[p] = points[p];

    points[p].x = (width/2 + p * SPACING) - ( SPACING * (NUM_POINTS/2)) + (SPACING/2);
    points[p].y = height/2 + sin( radians(angles[p])) * radius;

  //  println(points[p].y);

    ellipse(points[p].x, points[p].y, size, size);

    angles[p]+=inc;
  }


  for(int p = 0; p < NUM_POINTS - 1; p++) {

    bzPt1 = points[p];
    bzPt2 = points[p+1];

    switch(mode) {
      case 0:
        bzCtrlPt1.x = lerp( points[p].x, points[p+1].x, .25f );
        bzCtrlPt1.y = lerp( points[p].y, points[p+1].y, .25f );

        bzCtrlPt2.x = lerp( points[p].x, points[p+1].x, .75f );
        bzCtrlPt2.y = lerp( points[p].y, points[p+1].y, .75f );
        break;
      case 1:
        bzCtrlPt1.x = lerp( points[p].x, points[p+1].x, .25f );
        //bzCtrlPt1.y = lerp( points[p].y, points[p+1].y, .25 );
        bzCtrlPt1.y = height/2 + sin( radians( angles[p] + ANGLE_OFFSET/2 )) * radius;

        bzCtrlPt2.x = lerp( points[p].x, points[p+1].x, .75f );
        bzCtrlPt2.y = height/2 + sin( radians( angles[p+1] - ANGLE_OFFSET/2 )) * radius;
    }

   noFill();
   bezier(
    bzPt1.x,
    bzPt1.y,
    bzCtrlPt1.x,
    bzCtrlPt1.y,
    bzCtrlPt2.x,
    bzCtrlPt2.y,
    bzPt2.x,
    bzPt2.y
    );

    fill(255);
    ellipse(bzPt1.x, bzPt1.y, 10, 10);
    ellipse(bzCtrlPt1.x, bzCtrlPt1.y, 10, 10);
    ellipse(bzCtrlPt2.x, bzCtrlPt2.y, 10, 10);

    if(p == NUM_POINTS-2) {
      ellipse(bzPt2.x, bzPt2.y, 10, 10);
    }

  }

  //ellipse(width/2, height/2 + y, 100, 100);

  //angle1+=inc;
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "Sine_Waveform_PDE" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
