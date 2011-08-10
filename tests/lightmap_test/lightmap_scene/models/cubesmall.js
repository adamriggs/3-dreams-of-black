/*
 * File generated with unity3d-to-webgl exporter
 *
 * vertices: 24
 * faces: 12
 *
 * How to implement skining: 
 * skinWeights = 4 values per vertes such as a+b+c=d = 1
 * skinIndices = from each wieght, an indice to the joint (bone) it references
 * joints = and index + local position & rotation (root relative to model - usually 0,0)
 */

var model = {

	'materials': [{
	"a_dbg_color" : 0x818181,
	"a_dbg_index" : 0, 
	"a_dbg_name" : "metal_clr"
	}],

	'vertices': [-3.8924,0,0.5776,-9.2984,0,0.5776,-3.8924,5.4061,0.5776,-9.2984,5.4061,0.5776,-3.8924,5.4061,-4.8285,-9.2984,5.4061,-4.8285,-3.8924,0,-4.8285,-9.2984,0,-4.8285,-3.8924,5.4061,0.5776,-9.2984,5.4061,0.5776,-3.8924,5.4061,-4.8285,-9.2984,5.4061,-4.8285,-3.8924,0,-4.8285,-9.2984,0,0.5776,-9.2984,0,-4.8285,-3.8924,0,0.5776,-9.2984,0,0.5776,-9.2984,5.4061,-4.8285,-9.2984,0,-4.8285,-9.2984,5.4061,0.5776,-3.8924,0,-4.8285,-3.8924,5.4061,0.5776,-3.8924,0,0.5776,-3.8924,5.4061,-4.8285],
	'normals': [0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,-1,0,0,-1,0,1,0,0,1,0,0,0,-1,0,0,-1,0,-1,0,0,-1,0,0,-1,0,0,-1,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0],

	'uvs': [0.0019,0.002,0.3314,0.002,0.0019,0.3315,0.3314,0.3315,0.3387,0.3315,0.6682,0.3315,0.6177,0.6647,0.9471,0.6647,0.3387,0.002,0.6682,0.002,0.6177,0.3353,0.9471,0.3353,0.2824,0.3353,0.6118,0.6647,0.6118,0.3353,0.2824,0.6647,0.0019,0.6685,0.3314,0.998,0.3314,0.6685,0.0019,0.998,0.3387,0.6685,0.6682,0.998,0.6682,0.6685,0.3387,0.998],
	'uvs2': [0.002,0.834,0.121,0.834,0.002,0.9531,0.121,0.9531,0.5089,0.9531,0.628,0.9531,0.6356,0.9531,0.7546,0.9531,0.5089,0.834,0.628,0.834,0.6356,0.834,0.7546,0.834,0.3822,0.834,0.5013,0.9531,0.5013,0.834,0.3822,0.9531,0.1289,0.834,0.2479,0.9531,0.2479,0.834,0.1289,0.9531,0.2556,0.834,0.3746,0.9531,0.3746,0.834,0.2556,0.9531],

	'triangles': [],
	'triangles_n': [],
	'triangles_uv': [],
	'triangles_n_uv': [1,0,3,0,1,0,3,1,0,3,3,0,2,0,3,0,2,3,0,2,9,8,5,0,9,8,5,9,8,5,5,8,4,0,5,8,4,5,8,4,11,10,7,0,11,10,7,11,10,7,7,10,6,0,7,10,6,7,10,6,14,12,13,0,14,12,13,14,12,13,13,12,15,0,13,12,15,13,12,15,18,16,17,0,18,16,17,18,16,17,17,16,19,0,17,16,19,17,16,19,22,20,21,0,22,20,21,22,20,21,21,20,23,0,21,20,23,21,20,23],

	'quads': [],
	'quads_n': [],
	'quads_uv': [],
	'quads_n_uv': [],

	'end': (new Date).getTime()

}

postMessage( model );