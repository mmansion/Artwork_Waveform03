(function(app) {


  // feature config

  var ENABLE_TRACKBALL_CTRL = true;

  // declare main threejs objects

  var clock
    , scene
    , stats
    , camera
    , gui
    , renderer
    , texture
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
    ;

  var startPosition = {
      x : 0,
      y : 8.7,
      z : 50
    }
    , startFov = 60
    ;

  // declare curve variables

  var bezierCurve
    , bezierCtrlPts = []
    , bezierCurveGeometry = new THREE.Geometry()
    , bezierCurveMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )

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

  app.setup = function() {

    clock = new THREE.Clock();
    stats = app.initStats();

    // 1. Create a scene to hold all the objects objects, such as the cameras, lights, and geometries.
    scene = new THREE.Scene();

    // 2. Create the camera, and define what we are looking at
    camera = new THREE.PerspectiveCamera(startFov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set( startPosition.x, startPosition.y, startPosition.z );
    camera.fov = startFov;

    // 3. Create a render and set the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.cullFace = false;

    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);

    // 4. Add lights to the scene
    app.addLights();
    app.initGrid();
    app.initControls();

    // 5. Create bezier curve
    app.createBezierCurve();
  }

  app.initGrid = function() {
    var size = 50;
    var step = 5;
    var gridHelper = new THREE.GridHelper( size, step );
    scene.add( gridHelper );
  };

  app.createPoint = function() {
    var geometry = new THREE.SphereGeometry( .5, 32, 32 ); //radius, segments, rings
    var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
    var sphere = new THREE.Mesh( geometry, material );
    return sphere;
  };

  app.createBezierCurve = function() {

    /*
    CubicBezierCurve3( v0, v1, v2, v3 )

    v0 – The starting point
    v1 – The first control point
    v2 – The second control point
    v3 – The ending point
    */

    // define the bezier curve
    bezierCurve = new THREE.CubicBezierCurve3(
    	curvePoints[0], //starting point
    	curvePoints[1], //first ctrl pt
    	curvePoints[2], //second ctrl pt
    	curvePoints[3] // ending point
    );

    // create the geometry, choose number of divisions for smoothness
    bezierCurveGeometry.vertices = bezierCurve.getPoints( 50 );

    // instantiate the curve (Object3d) to add to the scene
    bezierCurveObj = new THREE.Line( bezierCurveGeometry, bezierCurveMaterial );

    // add curve to the scene
    scene.add(bezierCurveObj);

    // draw control point guide references
    curvePoints.forEach(function(p, i) {

      var point = app.createPoint();
      point.position.x = p.x;
      point.position.y = p.y;

      scene.add(point);
      bezierCtrlPts.push(point);

      if(i < 2) {
        bezierGuide1Geometry.vertices.push(point.position);
      } else {
        bezierGuide2Geometry.vertices.push(point.position);
      }
    });

    bezierGuide1 = new THREE.Line( bezierGuide1Geometry, bezierGuideMaterial );
    bezierGuide2 = new THREE.Line( bezierGuide2Geometry, bezierGuideMaterial );

    scene.add(bezierGuide1);
    scene.add(bezierGuide2);


    console.log(0, bezierCtrlPts[0]);
  };

  app.drawGuides = function() {

  };



  app.updateBezierCurve = function() {

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
  }

  app.animateBezierCurve = function() {

    updateBezierCurve();

    // for ( var i = 0, l = bezierCurveObj.vertices.length; i < l; i ++ ) {
  	// 	bezierCurveObj.vertices[ i ].y = 35 * Math.sin( i / 5 + ( time + i ) / 7 );
  	// }
  	// mesh.geometry.verticesNeedUpdate = true;
  };

  app.loop = function() {

    stats.update();
    var delta = clock.getDelta();
    var time = clock.getElapsedTime() * 0.5;

    if(clock.getElapsedTime() - lastAnimationTime > animationDelaySec) {
      lastAnimationTime = clock.getElapsedTime();
      //console.log('scheduled event');
      app.updateBezierCurve();
    }

    //camera.position.set( startPosition.x, startPosition.y, startPosition.z );
    //camera.fov = startFov;
      //camera.position.y = startPosition.y + Math.sin( time ) * 50.0;
    //camera.position.y = startPosition.y + Math.cos( time * 2.0 ) * 20.0 + 10.0;

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

    cameraXCtrl       = gui.add(new function() { this.x = 1 }, 'x', 0, 100);
    cameraYCtrl       = gui.add(new function() { this.y = 1 }, 'y', 0, 100);
    cameraZCtrl       = gui.add(new function() { this.z = 1 }, 'z', 0, 100);
    cameraZoomCtrl    = gui.add(new function() { this.zoom = zoomInc}, 'zoom', 0, .99);

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


})(APP);
