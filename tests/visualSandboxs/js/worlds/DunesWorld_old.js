var DunesWorld = function ( shared ) {

	var that = this;

	var ENABLE_LENSFLARES = true;

	this.scene = new THREE.Scene();
	this.scene.collisions = new THREE.CollisionSystem();

	// Fog

	this.scene.fog = new THREE.FogExp2( 0xffffff, 0.000275 );
	this.scene.fog.color.setHSV( 0.576,  0.382,  0.9  );

	// Lights

	this.ambient = new THREE.AmbientLight( 0x221100 );
	this.ambient.color.setHSV( 0, 0, 0.1 );
	this.scene.addLight( this.ambient );

	this.directionalLight1 = new THREE.DirectionalLight( 0xffeedd );
	this.directionalLight1.position.set( 0.8085776615544399,  0.30962281305702444,  -0.500335766130914 );
	this.directionalLight1.color.setHSV( 0.08823529411764706,  0,  1 );
	this.scene.addLight( this.directionalLight1 );

	this.directionalLight2 = new THREE.DirectionalLight( 0xffeedd );
	this.directionalLight2.position.set( 0.09386404300915006,  0.9829903100365339,  0.15785940518149455 );
	this.directionalLight2.color.setHSV( 0,  0,  0.8647058823529412 );
	this.scene.addLight( this.directionalLight2 );
	
	// Lens flares

	if ( ENABLE_LENSFLARES ) {

		this.lensFlare = null;
		this.lensFlareRotate = null;

		var flaresPosition = new THREE.Vector3( 0, 0, -15000 );
		var sx = 70, sy = 292;
		initLensFlares( that, flaresPosition, sx, sy );		

	}
	
	// Dunes specific settings

	var	scale = 0.15;
	var TILE_SIZE = 30000 * scale;
	
	// Camera front facing direction vector

	var dirVec = new THREE.Vector3();
	
	// Camera roll parameters
	
	var startRoll = Math.PI, deltaRoll = 0, rollAngle = Math.PI, rollSpeed = Math.PI,
		startSpeed, deltaSpeed = 0, speedInside = -90, speedOutside = 90;
	
	this.liftSpeed = 250;
	this.startLift = 0.29,
	this.endLift   = 0.375;

	// Tiles

	var randomAdded = 0;
	var tiles = [ [], [], [] ]; // 9x9 grid
	var lastx, lastz;

	// static tiles

	var walkPosition, prairiePosition, cityPosition;
	var sceneWalk, scenePrairie, sceneCity;


	// reference cube

	var cube = new THREE.Cube( 100, 100, 100 );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	that.refCube = new THREE.Mesh( cube, material );
	that.refCube.visible = false;
	that.scene.addObject( that.refCube );

	// islands influence spheres

	var colorHighlight = new THREE.Color( 0xffaa00 );
	var colorNormal = new THREE.Color( 0x666666 );

	shared.influenceSpheres = [ 
		
		{ name: "prairie", center: new THREE.Vector3( -824, 2665, 4336 ), radius: 800, state: 0, type: 0 },
		{ name: "city",    center: new THREE.Vector3( -760, 2476, 9622 ), radius: 800, state: 0, type: 0 },
		
		{ name: "prairiePortal", center: new THREE.Vector3( -824, 2365, 4336 ), radius: 200, state: 0, type: 1, destination: "prairie" },
		{ name: "cityPortal",    center: new THREE.Vector3( -760, 2476, 9622 ), radius: 200, state: 0, type: 1, destination: "city" }
		
	];

	var showSpheres = true;
	
	if ( showSpheres ) {
	
		var sphere = new THREE.Sphere( 1, 64, 32 );
		var sprite = THREE.ImageUtils.loadTexture( "files/textures/circle-outline.png" );

		for ( var i = 0; i < shared.influenceSpheres.length; i ++ ) {
			
			var s = shared.influenceSpheres[ i ];
			
			if ( s.type == 1 ) {
			
				var radius = s.radius;
				var center = s.center;
			
				//var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
				//var sphereObject = new THREE.Mesh( sphere, wireMaterial );
				
				var particleMaterial = new THREE.ParticleBasicMaterial( { size: 5, color:0xff7700, map: sprite, transparent: true } );
				var sphereObject = new THREE.ParticleSystem( sphere, particleMaterial );
				sphereObject.sortParticles = true;
				
				sphereObject.name = s.name;
				
				sphereObject.position.copy( center );
				sphereObject.scale.set( radius, radius, radius );
				
				s.mesh = sphereObject;
				
				that.scene.addObject( sphereObject );
				
			}

		}

	}
	
	// Mesh

	var loader = new THREE.SceneLoader();

	loader.onLoadStart = function () { shared.signals.loadItemAdded.dispatch() };
	loader.onLoadComplete = function () { shared.signals.loadItemCompleted.dispatch() };

	function addDunesPart( scene, position ) {

		scene.scale.x = scene.scale.y = scene.scale.z = scale;
		scene.position = position;
		scene.updateMatrix();

		makeSceneStatic( scene );
		markColliders( scene );
		
		that.scene.addChild( scene );
		
		if ( scene.collisions ) {
		
			that.scene.collisions.merge( scene.collisions );

		}

	};

	function addClouds( geo, n ) {
		
		var i, x, y, z, cs,
			cloudMesh, cloudMaterial = new THREE.MeshFaceMaterial();
		
		for( i = 0; i < n; i ++ ) {
		
			cloudMesh = new THREE.Mesh( geo, cloudMaterial );
			x = 25000 * ( 0.5 - Math.random() );
			y = 4000 + 3000 * ( 0.5 - Math.random() );
			z = 25000 * ( 0.5 - Math.random() );
			cloudMesh.position.set( x, y, z );
			
			cs = scale * ( 1 + 0.5 * Math.random() );
			cloudMesh.scale.set( cs, cs, cs );
			
			cloudMesh.rotation.y = 0.5 * Math.random();
			
			cloudMesh.matrixAutoUpdate = false;
			cloudMesh.updateMatrix();
			
			that.scene.addChild( cloudMesh );

		}
		
	};
	
	function walkLoaded( result ) {

		sceneWalk = result.scene;
		walkPosition = new THREE.Vector3( 0, 0, 0 * TILE_SIZE );
		sceneWalk.rotation.z = Math.PI;
		addDunesPart( sceneWalk, walkPosition );

	};

	function prairieLoaded( result ) {

		scenePrairie = result.scene;
		prairiePosition = new THREE.Vector3( 0, 0, 1 * TILE_SIZE );
		addDunesPart( scenePrairie, prairiePosition );

	};

	function cityLoaded( result ) {

		sceneCity = result.scene;
		cityPosition = new THREE.Vector3( 0, 0, 2 * TILE_SIZE );
		showHierarchyNotColliders( sceneCity, false );
		addDunesPart( sceneCity, cityPosition );

	};

	function randomLoaded( result ) {

		var x = ( randomAdded % 3 );
		var z = Math.floor( randomAdded / 3 );
		//console.log( x + " - " + z );

		result.scene.rotation.z = getRandomRotation();

		if ( x == 1 && ( z == 1 || z == 2 ) ) {

			showHierarchyNotColliders( result.scene, false );

		}

		addDunesPart( result.scene, new THREE.Vector3((x-1)*TILE_SIZE, 0, (z-1)*TILE_SIZE) );

		tiles[z][x] = result.scene;
		++randomAdded;

	};
	
	function showHierarchyNotColliders( scene, visible ) {

		THREE.SceneUtils.traverseHierarchy( scene, function( node ) { 
			
			if ( ! node.__isCollider ) {

				node.visible = visible; 

			}
			
		} );
		
	};

	function markColliders( scene ) {

		THREE.SceneUtils.traverseHierarchy( scene, function( node ) { 
			
			var colliders = scene.collisions.colliders;

			for( var i = 0; i < colliders.length; i++ ) {
				
				if ( colliders[ i ].mesh == node ) {
				
					node.__isCollider = true; 

				}

			}
			
		} );
		
	};

	// static parts

	loader.load( "files/models/dunes/D_tile_walk.js", walkLoaded );
	loader.load( "files/models/dunes/D_tile_prairie.js", prairieLoaded );
	loader.load( "files/models/dunes/D_tile_city.js", cityLoaded );

	// random parts

	loader.load( "files/models/dunes/D_tile_1.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_2.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_3.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_4.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_1.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_2.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_3.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_4.js", randomLoaded );
	loader.load( "files/models/dunes/D_tile_1.js", randomLoaded );

	// clouds
	
	var jloader = new THREE.JSONLoader();
	
	jloader.onLoadStart = function () { shared.signals.loadItemAdded.dispatch() };
	jloader.onLoadComplete = function () { shared.signals.loadItemCompleted.dispatch() };
	
	jloader.load( { model: 'files/models/Cloud1_.js', callback: function( geo ) { addClouds( geo, 50 ); } } );
	jloader.load( { model: 'files/models/Cloud2_.js', callback: function( geo ) { addClouds( geo, 50 ); } } );
	
	function getRandomRotation () {

		return Math.round( Math.random() * 4 ) * ( Math.PI / 2 );

	};

	function updateTiles ( z, x ) {
	
		var difz = lastz - z;
		var difx = lastx - x;
	
		if ( isNaN(difz) || isNaN(difx) ) {

			return;

		}

		var t0, t1, t2;

		// z
		
		if ( difz < 0 ) {

			//console.log("z0");

			var row = tiles.shift();

			t0 = row[0];
			t1 = row[1];
			t2 = row[2];

			showHideStaticTiles(t0.position, false);
			showHideStaticTiles(t1.position, false);
			showHideStaticTiles(t2.position, false);

			t0.position.z = (z+1)*TILE_SIZE;
			t1.position.z = (z+1)*TILE_SIZE;
			t2.position.z = (z+1)*TILE_SIZE;
	
			tiles.push(row);

		} else if ( difz > 0 ) {

			//console.log("z1");

			var row = tiles.pop(); 

			t0 = row[0];
			t1 = row[1];
			t2 = row[2];

			showHideStaticTiles(t0.position, false);
			showHideStaticTiles(t1.position, false);
			showHideStaticTiles(t2.position, false);

			t0.position.z = (z-1)*TILE_SIZE;
			t1.position.z = (z-1)*TILE_SIZE;
			t2.position.z = (z-1)*TILE_SIZE;

			tiles.unshift(row);

		}

		// x
		
		if ( difx < 0 ) {

			//console.log("x0");

			t0 = tiles[0].shift();
			t1 = tiles[1].shift();
			t2 = tiles[2].shift();

			showHideStaticTiles(t0.position, false);
			showHideStaticTiles(t1.position, false);
			showHideStaticTiles(t2.position, false);

			t0.position.x = (x+1)*TILE_SIZE;
			t1.position.x = (x+1)*TILE_SIZE;
			t2.position.x = (x+1)*TILE_SIZE;

			tiles[0].push(t0);
			tiles[1].push(t1);
			tiles[2].push(t2);
		
		} else if ( difx > 0 ) {

			//console.log("x1");

			t0 = tiles[0].pop();
			t1 = tiles[1].pop();
			t2 = tiles[2].pop();

			showHideStaticTiles(t0.position, false);
			showHideStaticTiles(t1.position, false);
			showHideStaticTiles(t2.position, false);

			t0.position.x = (x-1)*TILE_SIZE;
			t1.position.x = (x-1)*TILE_SIZE;
			t2.position.x = (x-1)*TILE_SIZE;

			tiles[0].unshift(t0);
			tiles[1].unshift(t1);
			tiles[2].unshift(t2);
		
		}

		t0.rotation.z = getRandomRotation();
		t1.rotation.z = getRandomRotation();
		t2.rotation.z = getRandomRotation();

		showHierarchyNotColliders( t0, true );
		showHierarchyNotColliders( t1, true );
		showHierarchyNotColliders( t2, true );

		var visible0 = showHideStaticTiles(t0.position, true);
		var visible1 = showHideStaticTiles(t1.position, true);
		var visible2 = showHideStaticTiles(t2.position, true);

		// temp, since visible don�t seem to effect scenes

		if ( visible0 ) {

			showHierarchyNotColliders( t0, false );

		}

		if ( visible1 ) {

			showHierarchyNotColliders( t1, false );

		}

		if ( visible2 ) {

			showHierarchyNotColliders( t2, false );

		}

		t0.updateMatrix();
		t1.updateMatrix();
		t2.updateMatrix();

	};

	// for the static tiles

	function showHideStaticTiles ( position, show ) {

		if ( position.x == walkPosition.x && position.z == walkPosition.z ) {

			showHierarchyNotColliders( sceneWalk, show );
			sceneWalk.updateMatrix();
			return true;

		}

		if ( position.x == prairiePosition.x && position.z == prairiePosition.z ) {

			showHierarchyNotColliders( scenePrairie, show );
			scenePrairie.updateMatrix();
			return true;

		}

		if ( position.x == cityPosition.x && position.z == cityPosition.z ) {

			showHierarchyNotColliders( sceneCity, show );
			sceneCity.updateMatrix();
			return true;

		}

	};

	function checkInfluenceSpheres( camera, deltaSec, portalsActive ) {

		var i, d, influenceSphere;
		
		var currentPosition = camera.matrixWorld.getPosition();

		// domElement.innerHTML = currentPosition.x.toFixed( 2 ) + " " + currentPosition.y.toFixed( 2 ) + " " + currentPosition.z.toFixed( 2 );
		
		for( i = 0; i < shared.influenceSpheres.length; i ++ ) {
			
			influenceSphere = shared.influenceSpheres[ i ];
			
			d = influenceSphere.center.distanceTo( currentPosition );
			
			if( d < influenceSphere.radius ) {
				
				if ( influenceSphere.mesh ) 
					influenceSphere.mesh.materials[ 0 ].color = colorHighlight;
				
				// flip sphere
				
				if ( influenceSphere.type == 0 ) {
					
					// entering
					
					if ( influenceSphere.state == 0 ) {
						
						influenceSphere.state = 1;
						
						startRoll = camera.roll;
						deltaRoll = rollAngle;
						
						deltaSpeed = speedInside;

						this.liftSpeed = 0;
						
						//console.log( "entered [" + influenceSphere.name + "]" );

					}
					
				// portal

				} else if ( influenceSphere.type == 1 ) {
					
					console.log( "entered portal [" + influenceSphere.name + "]" );
					
					if ( portalsActive ) {
					
						shared.signals.startexploration.dispatch( influenceSphere.destination );
						
					}

				}
				
			} else {
				
				if ( influenceSphere.mesh ) 
					influenceSphere.mesh.materials[ 0 ].color = colorNormal;
				
				// flip sphere
				
				if ( influenceSphere.type == 0 ) {
				
					// leaving
					
					if ( influenceSphere.state == 1 ) {
						
						influenceSphere.state = 0;
						
						startRoll = camera.roll;
						deltaRoll = rollAngle;
						
						deltaSpeed = speedOutside;
						
						//console.log( " left [" + influenceSphere.name + "]" );

					}
					
				}

			}
			
		}
		
		if ( deltaRoll > 0 ) {
			
			deltaRoll -= deltaSec * rollSpeed;
			camera.roll = startRoll + ( rollAngle - deltaRoll );
			
			camera.movementSpeed += deltaSpeed * deltaSec;

		} else {
			
			camera.roll = startRoll + rollAngle;

		}

	};
	
	this.update = function ( delta, camera, portalsActive ) {



		// check if we are close to islands
		
		checkInfluenceSpheres( camera, delta / 1000, portalsActive );
		
		// for the moment RollCamera doesn't have straightforward way to get orientation yet
		// so we attach child in front of it to get direction vector

		var front = shared.frontCube.matrixWorld.getPosition();
		var current = camera.matrixWorld.getPosition();

		dirVec.sub( front, current );
		dirVec.normalize();
		
		//console.log( dirVec.x, dirVec.y, dirVec.z );
		//console.log( current.x, current.y, current.z );
		
		var z = Math.round( ( camera.position.z  + 2000 * dirVec.z ) / TILE_SIZE );
		var x = Math.round( ( camera.position.x  + 2000 * dirVec.x ) / TILE_SIZE );
		
		//that.refCube.position.x = camera.position.x + Math.cos( camera.theta ) * 2000;
		//that.refCube.position.z = camera.position.z + Math.sin( camera.theta ) * 2000;
		//that.refCube.position.y = camera.position.y;

		//var z = Math.round( that.refCube.position.z / TILE_SIZE );
		//var x = Math.round( that.refCube.position.x / TILE_SIZE );

		//var z = Math.round( camera.position.z / TILE_SIZE );
		//var x = Math.round( camera.position.x / TILE_SIZE );

		// did we change?

		if ( z != lastz || x != lastx ) {

			updateTiles( z, x );

		}

		lastz = z;
		lastx = x;

	};

	//loader.load( "files/models/dunes/D_tile_city/D_tile_city.js", addDunesPart );



/*	var loader = new THREE.JSONLoader();

	loader.onLoadStart = function () { shared.signals.loadItemAdded.dispatch() };
	loader.onLoadComplete = function () { shared.signals.loadItemCompleted.dispatch() };

	function addDunesPart( geo ) {
		
		var mesh = new THREE.Mesh( geo, new THREE.MeshFaceMaterial() );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;

		that.scene.addObject( mesh );
		
		preInitModel( geo, shared.renderer, that.scene, mesh );

	};
	
	loader.load( { model: 'files/models/dunes/dunes_1.js', callback: addDunesPart } );
	loader.load( { model: 'files/models/dunes/dunes_2.js', callback: addDunesPart } );
	loader.load( { model: 'files/models/dunes/dunes_3.js', callback: addDunesPart } );
	loader.load( { model: 'files/models/dunes/dunes_4.js', callback: addDunesPart } );
	loader.load( { model: 'files/models/dunes/dunes_5.js', callback: addDunesPart } );
*/
	/*

	// Ground

	var tiles = [];

	var image = document.createElement( 'img' );

	image.onload = function () {

		var canvas = document.createElement( 'canvas' );
		canvas.width = this.width;
		canvas.height = this.height;

		var context = canvas.getContext( '2d' );
		context.drawImage( this, 0, 0 );

		var data = context.getImageData( 0, 0, this.width, this.height ).data;

		var geometry = new Plane( TILE_SIZE, TILE_SIZE, this.width - 1, this.height - 1 );

		for ( var i = 0, j = 0; i < data.length; i += 4, j ++ ) {

			geometry.vertices[ j ].position.x += Math.random() * data[ i ];
			geometry.vertices[ j ].position.y += Math.random() * data[ i ];
			geometry.vertices[ j ].position.z = data[ i ];

		}

		geometry.computeFaceNormals();

		var material = new THREE.MeshLambertMaterial( 0xff0000 );

		for ( var i = 0; i < 10; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );
			mesh.rotation.x = - 90 * Math.PI / 180;
			mesh.scale.z = 2;
			that.scene.addObject( mesh );

			tiles.push( mesh );

		}

	};

	image.src = 'files/textures/DunesHeightmap.png';

	*/

	/*

	// Ground

	events.loadItemAdd.dispatch();

	var loader = new THREE.Loader();
	loader.loadAscii( { model: 'files/models/dunes/Desert_GroundPlane.js', texture_path: 'files/models/prairie_v3/', callback: function( geometry ) {

		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

		for ( var i = 0; i < 10; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.x = Math.random() * 100000 - 50000;
			mesh.position.z	 = Math.random() * 100000 - 50000;

			mesh.rotation.y = Math.random() * 180 * Math.PI / 180;

			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;

			that.scene.addObject( mesh );

		}

		events.loadItemComplete.dispatch();

	} } );

	// Rocks

	events.loadItemAdd.dispatch();

	var loader = new THREE.Loader();
	loader.loadAscii( { model: 'files/models/dunes/Desert_GroundRocks.js', texture_path: 'files/models/prairie_v3/', callback: function( geometry ) {

		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

		for ( var i = 0; i < 10; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.x = Math.random() * 100000 - 50000;
			mesh.position.z	 = Math.random() * 100000 - 50000;

			mesh.rotation.y = Math.random() * 180 * Math.PI / 180;

			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;

			that.scene.addObject( mesh );

		}

		events.loadItemComplete.dispatch();

	} } );

	*/

	/*

	// Clouds

	var loader = new THREE.Loader();
	loader.loadAscii( { model: 'files/models/part3/cloud.js', callback: function( geometry ) {

		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, opacity: 0.15, blending: THREE.AdditiveBlending } );

		for ( var i = 0; i < 20; i ++ ) {

			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.x = Math.random() * 60000 - 30000;
			mesh.position.y = Math.random() * 10000 + 20000;
			mesh.position.z	 = Math.random() * 60000 - 30000;

			mesh.rotation.y = Math.random() * 180 * Math.PI / 180;

			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 20 + 1;

			mesh.doubleSided = true;

			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;

			that.scene.addObject( mesh );

		}

	} } );

	*/

/*	this.update = function ( camera ) {

		var z = Math.round( camera.position.z / TILE_SIZE );
		var x = Math.round( camera.position.x / TILE_SIZE );

		

		tiles[ 0 ].position.x = ( x - 1 ) * TILE_SIZE;
		tiles[ 0 ].position.z = ( z - 1 ) * TILE_SIZE;

		tiles[ 1 ].position.x = ( x ) * TILE_SIZE;
		tiles[ 1 ].position.z = ( z - 1 ) * TILE_SIZE;

		tiles[ 2 ].position.x = ( x + 1 ) * TILE_SIZE;
		tiles[ 2 ].position.z = ( z - 1 ) * TILE_SIZE;

		tiles[ 3 ].position.x = ( x - 1 ) * TILE_SIZE;
		tiles[ 3 ].position.z = ( z ) * TILE_SIZE;

		tiles[ 4 ].position.x = ( x ) * TILE_SIZE;
		tiles[ 4 ].position.z = ( z ) * TILE_SIZE;

		tiles[ 5 ].position.x = ( x + 1 ) * TILE_SIZE;
		tiles[ 5 ].position.z = ( z ) * TILE_SIZE;

		tiles[ 6 ].position.x = ( x - 1 ) * TILE_SIZE;
		tiles[ 6 ].position.z = ( z + 1 ) * TILE_SIZE;

		tiles[ 7 ].position.x = ( x ) * TILE_SIZE;
		tiles[ 7 ].position.z = ( z + 1 ) * TILE_SIZE;

		tiles[ 8 ].position.x = ( x + 1 ) * TILE_SIZE;
		tiles[ 8 ].position.z = ( z + 1 ) * TILE_SIZE;

		

	}*/

}
