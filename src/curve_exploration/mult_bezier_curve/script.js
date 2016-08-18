(function(app) {


  // feature config

  var ENABLE_TRACKBALL_CTRL = true;

  // declare main threejs objects

  var clock
    , scene
    , stats
    , camera
    , renderer
    , gui
    ;

  // Arrays to hold Waveform & Guide 3D Object Groups
  var waveforms  = new Array(3)
    , waveguides = new Array(3)
    , wavecurves = [

      [ // WAVEFORM 1

        [ // CURVE GROUP A

          // BEZIER CURVE A-1

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -45, 1,  -10 ), // start point
            new THREE.Vector3( -35, 15, -10 ), // control point 1
            new THREE.Vector3( -25, 15, -10 ), // control point 2
            new THREE.Vector3( -15, 1,  -10 )  // end point
          ),

          // BEZIER CURVE A-2

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -15, 1,  -10 ),  // start point
            new THREE.Vector3( -5,  15, -10 ),  // control point 1
            new THREE.Vector3(  5,  15, -10 ),  // control point 2
            new THREE.Vector3( 15,  1,  -10 )   // end point
          ),

          // BEZIER CURVE A-3

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( 15, 1, -10 ),   // start point
            new THREE.Vector3( 25, 15, -10 ),  // control point 1
            new THREE.Vector3( 35, 15, -10 ),  // control point 2
            new THREE.Vector3( 45, 1, -10 )    // end point
          )
        ],
        [ // CURVE GROUP B

          // BEZIER CURVE B-1

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -45, 1,  0 ), // start point
            new THREE.Vector3( -35, 15, 0 ), // control point 1
            new THREE.Vector3( -25, 15, 0 ), // control point 2
            new THREE.Vector3( -15, 1,  0 )  // end point
          ),

          // BEZIER CURVE B-2

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -15, 1,  0 ),  // start point
            new THREE.Vector3( -5,  15, 0 ),  // control point 1
            new THREE.Vector3(  5,  15, 0 ),  // control point 2
            new THREE.Vector3( 15,  1,  0 )   // end point
          ),

          // BEZIER CURVE B-2

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( 15, 1,  0 ),   // start point
            new THREE.Vector3( 25, 15, 0 ),  // control point 1
            new THREE.Vector3( 35, 15, 0 ),  // control point 2
            new THREE.Vector3( 45, 1,  0 )    // end point
          )
        ],
        [ // CURVE GROUP 1-A

          // BEZIER CURVE C-1

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -45, 1,  10 ), // start point
            new THREE.Vector3( -35, 15, 10 ), // control point 1
            new THREE.Vector3( -25, 15, 10 ), // control point 2
            new THREE.Vector3( -15, 1,  10 )  // end point
          ),

          // BEZIER CURVE C-2

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( -15, 1,  10 ),  // start point
            new THREE.Vector3( -5,  15, 10 ),  // control point 1
            new THREE.Vector3(  5,  15, 10 ),  // control point 2
            new THREE.Vector3( 15,  1,  10 )   // end point
          ),

          // BEZIER CURVE C-3

          new THREE.CubicBezierCurve3 (

            new THREE.Vector3( 15, 1, 10 ),   // start point
            new THREE.Vector3( 25, 15, 10 ),  // control point 1
            new THREE.Vector3( 35, 15, 10 ),  // control point 2
            new THREE.Vector3( 45, 1, 10 )    // end point
          )
        ],
      ],
    ]
    ;

  var zoom = 0
    , zoomInc = 0.01
    , origin  = new THREE.Vector3(0, 0, 0)
    ;

  // declare lighting

  var ambientLight
    , spotLight
    ;

  // declare controls

  var cameraZoomCtrl
    , cameraXCtrl
    , cameraYCtrl
    , cameraZCtrl
    , trackBallCtrl
    , cameraTransYCtrl
    , startFov = 60
    ;

  // declare curve variables

  var bezierCurve
    , bezierCtrlPts = []
    //, bezierCurveGeometry = new THREE.Geometry()
    //, bezierCurveMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )

    , ctrlPointGuideMaterial
    , ctrlPointLineMaterial
    ;

  var bezierGuide1Geometry = new THREE.Geometry()
    , bezierGuide2Geometry = new THREE.Geometry()
    , bezierGuideMaterial  = new THREE.LineBasicMaterial( { color : 0x00ffff } )
    , bezierGuide1
    , bezierGuide2
    ;

  var curvePoints = [ //vect3 array to hold bezier curve points
      new THREE.Vector3( -20, 1, 0 ), //starting point
    	new THREE.Vector3( -10, 15, 0 ), //first ctrl pt
    	new THREE.Vector3( 10, 15, 0 ), //second ctrl pt
    	new THREE.Vector3( 20, 1, 0 ) // ending point
    ]
    , step = 0.1
    ;

  var lastAnimationTime = 0
    , animationDelaySec = .1
    , radius = 10
    , step = 0.1
    , angles = [0,359,89,90]
    ;

  var controls = new function() {

    // ui control properties
    // camera controls
    this.cameraZoom = 0;
    this.cameraX    = 0;
    this.cameraY    = 78;
    this.cameraZ    = 88;
    this.showGuides = true;
  };

  /* SETUP
    ------------------------------ */

  app.setup = function() {

    clock = new THREE.Clock();
    stats = app.initStats();

    // 1. Create a scene to hold all the objects objects, such as the cameras, lights, and geometries.
    scene = new THREE.Scene();

    // 2. Create the camera, and define what we are looking at
    camera = new THREE.PerspectiveCamera(startFov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set( controls.cameraX, controls.cameraY, controls.cameraZ );
    camera.fov = startFov;

    // 3. Create a render and set the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.cullFace = false;

    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);

    for(var i = 0; i < waveforms.length; i++) {

      // instantiate groups as empty container objects
      waveforms[i] = new THREE.Object3D();
      waveguides[i] = new THREE.Object3D();

      // assign names to each group
      waveforms[i].name = 'waveform' + (i+1);
      waveguides[i].name = 'waveguide' + (i+1);
    }

    // 4. Add lights to the scene
    app.addLights();
    app.initGrid();
    app.initControls();

    // 5. Create bezier curve
    app.createBezierWaveforms();
  }

  app.initGrid = function() {
    var size = 50;
    var step = 5;
    var gridHelper = new THREE.GridHelper( size, step );
    scene.add( gridHelper );
  };

  app.createPoint = function() {
    var geometry = new THREE.SphereGeometry( .3, 32, 32 ); //radius, segments, rings
    var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var sphere = new THREE.Mesh( geometry, material );
    return sphere;
  };

  app.generateBezierCurves = function() {

  };

  app.createBezierWaveforms = function() {

    var numWavePlanes = 1
      , numPointsX    = 4
      , numPointsZ    = 4
      , xSpace = 10
      , zSpace = 10
      , xStart = 0
      , zStart = 0
      ;

    for(var thisPlane = 0; thisPlane < numWavePlanes; thisPlane++) {
      var thisCurveNetwork = new THREE.Object3D() //empty container group
        , z = zStart
        ;

      for(var zPoint = 0; zPoint < numPointsZ; zPoint++) {
        var x = xStart; //resets with each waveform x-row

        for(var xPoint = 0; xPoint < numPointsX; xPoint++) {

          //generate a bezier curve
          var bezierCurve = new THREE.CubicBezierCurve3 (
            new THREE.Vector3( x, 10, z ),   // start point
            new THREE.Vector3( x += xSpace, 15, z ),  // control point 1
            new THREE.Vector3( x += xSpace, 15, z ),  // control point 2
            new THREE.Vector3( x += xSpace, 10, z )    // end point
          );

          // create a new geometry from the curve
          var bezierCurveGeometry = new THREE.Geometry();
          bezierCurveGeometry.vertices = bezierCurve.getPoints(50);
          var bezierCurveMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )

          // create a 3D object from the curve geometry
          var bezierLineObject = new THREE.Line(bezierCurveGeometry, bezierCurveMaterial);

          // add the curve to the curve network
          thisCurveNetwork.add(bezierLineObject);

        }
        z += zSpace;
      }

      // finally add the curve network to the waveforms array
      waveforms[thisPlane] = thisCurveNetwork;

      waveforms[thisPlane].position.x -= ((numPointsX * 3) * xSpace)/2;
      waveforms[thisPlane].position.z -= ((numPointsZ - 1) * zSpace)/2;

      scene.add(waveforms[thisPlane]);
    }


    // define the bezier curve
    // bezierCurve = new THREE.CubicBezierCurve3(
    // 	curvePoints[0], //starting point
    // 	curvePoints[1], //first ctrl pt
    // 	curvePoints[2], //second ctrl pt
    // 	curvePoints[3] // ending point
    // );

    // create the geometry, choose number of divisions for smoothness
    //bezierCurveGeometry.vertices = bezierCurve.getPoints( 50 );

    // instantiate the curve (Object3d) to add to the scene
    //bezierCurveObj = new THREE.Line( bezierCurveGeometry, bezierCurveMaterial );

    // add curve to the scene
    //scene.add(bezierCurveObj);



    // draw control point guide references
    // curvePoints.forEach(function(p, i) {
    //   var point = app.createPoint();
    //   point.position.x = p.x;
    //   point.position.y = p.y;
    //
    //   waveguides[0].add(point);
    //   bezierCtrlPts.push(point);
    //
    //   if(i < 2) {
    //     bezierGuide1Geometry.vertices.push(point.position);
    //   } else {
    //     bezierGuide2Geometry.vertices.push(point.position);
    //   }
    // });
    //
    // bezierGuide1 = new THREE.Line( bezierGuide1Geometry, bezierGuideMaterial );
    // bezierGuide2 = new THREE.Line( bezierGuide2Geometry, bezierGuideMaterial );
    //
    // bezierGuide1.name = "guide1";
    // bezierGuide2.name = "guide2";
    //
    // // add bezier guides to waveguide group
    // waveguides[0].add(bezierGuide1);
    // waveguides[0].add(bezierGuide2);
    //
    // scene.add(waveguides[0]);
    // //scene.add(bezierGuide2);
    //
    //
    // console.log(0, bezierCtrlPts[0]);
  };

  app.updateBezierCurve = function() {
    return;
    // iterate bezier curve and update vertex positions and translate on y axis

    var i = 0;
    for(var vertex in bezierCurve) {
      if(bezierCurve.hasOwnProperty(vertex)) {
        bezierCurve[vertex].y = radius * Math.sin( angles[i] += step );
        bezierCtrlPts[i++].position.y = bezierCurve[vertex].y;
      }
    }

    // get updated bezier vertices
    var bezierVertices = bezierCurve.getPoints(50);

    bezierCurveObj.geometry.vertices.forEach(function(vertex, i) {
       vertex.y = bezierVertices[i].y;
    });

    // in order to animate the vertices of the shapes we need to indicate each time
    bezierCurveObj.geometry.verticesNeedUpdate = true;
    bezierGuide1.geometry.verticesNeedUpdate = true;
    bezierGuide2.geometry.verticesNeedUpdate = true;

    // hide or show waveguides
    if(!controls.showGuides) {
      hideWaveGuides();
    } else {
      showWaveGuides();
    }
  }

  app.loop = function() {

    stats.update();
    var delta = clock.getDelta();
    var time = clock.getElapsedTime() * 0.5;

    if(clock.getElapsedTime() - lastAnimationTime > animationDelaySec) {
      lastAnimationTime = clock.getElapsedTime();
      //console.log('scheduled event');
      //app.updateBezierCurve();
    }

    // camera.position.set( startPosition.x, startPosition.y, startPosition.z );
    // camera.fov = startFov;
    //   camera.position.y = startPosition.y + Math.sin( time ) * 50.0;
    // camera.position.y = startPosition.y + Math.cos( time * 2.0 ) * 20.0 + 10.0;

    if(ENABLE_TRACKBALL_CTRL) {
      trackBallCtrl.update(delta);
    }
    //renderer.clear();

    renderer.render(scene, camera);

    // render using requestAnimationFrame
    requestAnimationFrame(app.loop);
  }

  app.addLights = function() {
    ambientLight = new THREE.AmbientLight(0x383838);
    scene.add(ambientLight);

    // add spotlight for the shadows
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(300, 300, 300);
    spotLight.intensity = 1;
    scene.add(spotLight);
  }

  /**
   * Initialize Stats
   */

  app.initStats = function() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $("#Stats-output").append(stats.domElement);

    return stats;
  }

  /**
   * Initialize GUI & Controls
   */

  app.initControls = function() {

    gui = new dat.GUI();

    cameraXCtrl     = gui.add(controls, 'cameraX',    0, 100);
    cameraYCtrl     = gui.add(controls, 'cameraY',    0, 100);
    cameraZCtrl     = gui.add(controls, 'cameraZ',    0, 100);
    cameraZoomCtrl  = gui.add(controls, 'cameraZoom', 0, .99);
    showGuidesCtrl  = gui.add(controls, 'showGuides');

    // register event handlers
    cameraZoomCtrl.onChange(onCameraZoom);
    cameraXCtrl.onChange(onCameraX);
    cameraYCtrl.onChange(onCameraY);
    cameraZCtrl.onChange(onCameraZ);

    if(ENABLE_TRACKBALL_CTRL) {
      trackBallCtrl = new THREE.TrackballControls(camera, renderer.domElement);

      trackBallCtrl.rotateSpeed = 1.0;
      trackBallCtrl.zoomSpeed = 1.0;
      trackBallCtrl.panSpeed = 1.0;

      // trackBallCtrl.noZoom=false;
      // trackBallCtrl.noPan=false;
      trackBallCtrl.staticMoving = true;
      // trackBallCtrl.dynamicDampingFactor=0.3;
    }
  }

  // gui event handlers

  function onCameraX(v) {
    camera.position.x = v;
    camera.lookAt(origin);
    camera.updateProjectionMatrix();
  }

  function onCameraY(v) {
    camera.position.y = v;
    //camera.lookAt(origin);
    camera.updateProjectionMatrix();
  }

  function onCameraZ(v) {
    camera.position.z = v;
    camera.lookAt(origin);
    camera.updateProjectionMatrix();
  }

  function onCameraZoom(zoom) {
    camera.fov = startFov - (startFov * zoom);
    camera.updateProjectionMatrix();
  }

  /**
   * showWaveGuides
   */

  function showWaveGuides() {
    waveguides.forEach(function(group) {
     group.visible = true;
    });
  }

  /**
   * hideWaveGuides
   */

  function hideWaveGuides() {
    waveguides.forEach(function(group) {
      group.visible = false;
    });
  }

})(APP);
