/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Scene = function() {
	
	// call super
	
	THREE.Object3D.call( this );

	// vars

	this.objects = [];
	this.lights  = [];
	this.sounds  = [];
	this.fog     = null;

};

THREE.Scene.prototype             = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;
THREE.Scene.prototype.supr        = THREE.Object3D.prototype;

/*
 * Add Child
 */

THREE.Scene.prototype.addChild = function( child ) {

	this.supr.addChild.call( this, child );
	this.addChildRecurse( child );

}

THREE.Scene.prototype.addChildRecurse = function( child ) {
	
	if( child instanceof THREE.Light ) {
			
		if( this.lights.indexOf( child ) === -1 )
			this.lights.push( child );	

	} else if( child instanceof THREE.Sound3D ) {
		
		if( this.sounds.indexOf( child ) === -1 )
			this.sounds.push( child );

	} else if( !( child instanceof THREE.Camera || child instanceof THREE.Bone ) ) {
		
		if( this.objects.indexOf( child ) === -1 )
			this.objects.push( child );
	}
	

	for( var c = 0; c < child.children.length; c++ )
		this.addChildRecurse( child.children[ c ] );
}


/*
 * Remove Child
 */

THREE.Scene.prototype.removeChild = function( child ) {

	this.supr.removeChild.call( this, child );
	this.removeChildRecurse( child );

}

THREE.Scene.prototype.removeChildRecurse = function( child ) {
	
	if( child instanceof THREE.Light ) {
		
		var i = this.lights.indexOf( child );
		
		if( i !== -1 )
			this.lights.splice( i, 1 );

	} else if( child instanceof THREE.Sound3D ) {
		
		var i = this.sounds.indexOf( child );
		
		if( i !== -1 )
			this.sounds.splice( i, 1 );

	} else if( !( child instanceof THREE.Camera || child instanceof THREE.Bone ) ) {
		
		var i = this.objects.indexOf( child );
		
		if( i !== -1 )
			this.objects.splice( i, 1 );
	}
	
	for( var c = 0; c < child.children.length; c++ )
		this.removeChildRecurse( child.children[ c ] );

}



/*
 * Backward Compatibility
 */

THREE.Scene.prototype.addObject    = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeObject = THREE.Scene.prototype.removeChild;
THREE.Scene.prototype.addLight     = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeLight  = THREE.Scene.prototype.removeChild;
 