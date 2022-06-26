float PI = 3.141592653589793238;

attribute vec3 aBary;

uniform float time;
uniform vec2 pixels;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vNormalFollow;
varying vec3 vEyeVector;
varying vec3 vBary;
void main() {
  vUv = uv;
  vBary = aBary;
  vNormal = normal;
  vNormalFollow = normalize(normalMatrix * normal); // Follow the camera normal

  vec3 newPosition = position;
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vEyeVector = normalize(worldPosition.xyz - cameraPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}