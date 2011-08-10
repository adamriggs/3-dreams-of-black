var distortingShaderWireSource = {

	'distortingShaderWire' : {

		uniforms: {
            "aspect": { type: "f", value: 0 },
			"sheet": { type: "t", value: 0, texture: null },
            "mouseXY": { type: "v2", value: new THREE.Vector2() },
            "tileOffsetX": { type: "v2", value: new THREE.Vector2() }
		},

		vertexShader: [

            "uniform vec2 mouseXY;",
            "uniform float aspect;",

            "varying vec2 vUv;",
            "varying vec2 vUvPoly;",
            "varying vec3 pos;",
            "varying vec3 posPoly;",
            "varying vec4 viewPos;",
            "varying vec4 viewPosPoly;",
            "varying vec2 projPos;",
            "varying vec2 projPosPoly;",
            "varying float distance;",
            "varying float distancePoly;",


			"void main() {",
				"vUv = uv;",
				"vUv = uv;",
                "vUvPoly = uv+vec2(normal.x,normal.y);",

                "viewPos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "viewPosPoly = projectionMatrix * modelViewMatrix * vec4( position-vec3(-normal.x,normal.y,0.), 1.0 );",

                "projPos = vec2(aspect,1.)*vec2(viewPos.x/viewPos.z,viewPos.y/viewPos.z);",
                "projPosPoly = vec2(aspect,1.)*vec2(viewPosPoly.x/viewPosPoly.z,viewPosPoly.y/viewPosPoly.z);",

                "distance = max(0.,1.0-length(projPos-vec2(mouseXY.x, mouseXY.y)));",

                "float distFade = normal.z*0.8+0.8;",

                "distancePoly = max(0.,distFade-length(projPosPoly-vec2(mouseXY.x, mouseXY.y)));",

                "viewPos.xy = viewPos.xy + normalize(projPos-vec2(mouseXY.x, mouseXY.y))*0.6*pow(distance,1.)*(viewPos.z/10.);",
                "gl_Position = viewPos;",
			"}"

		].join("\n"),

		fragmentShader: [
            "uniform sampler2D sheet;",
            "uniform vec2 tileOffsetX;",

            "uniform vec2 mouseXY;",
            "varying vec2 vUv;",
            "varying vec2 vUvPoly;",
            "varying vec3 pos;",
            "varying vec3 posPoly;",
            "varying vec4 viewPos;",
            "varying vec4 viewPosPoly;",
            "varying vec2 projPos;",
            "varying vec2 projPosPoly;",

            "varying float distance;",
            "varying float distancePoly;",

			"void main() {",
                "vec4 cPoly = texture2D( sheet, vec2( vUvPoly.x, vUvPoly.y ) );",
                "if ((distancePoly)>0.8 && cPoly.a>0.) cPoly = vec4(1.,1.,1.,distancePoly/16.); ",
                "else cPoly = vec4(1.,1.,1.,0.); ",
                "gl_FragColor = cPoly;",
			"}"

		].join("\n")

	}

};