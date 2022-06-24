const PostProcessing = {
  uniforms: {
    'tDiffuse': {value: null},
    'resolution': {value: null},
    'pixelSize': {value: 1},
    'uTime': {value: 0},
  },
  vertexShader:
/* glsl */
`
  varying highp vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`,
  fragmentShader:
/* glsl */
`
  uniform sampler2D tDiffuse;
  uniform float pixelSize;
  uniform vec2 resolution;
  uniform float uTime;

  varying highp vec2 vUv;

  // from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  void main(){

    // black and white

    // rgb shift

    // noise
    float val = hash(vUv + uTime)*0.3;

    vec2 dxy = pixelSize / resolution;
    vec2 coord = dxy * floor( vUv / dxy );
    gl_FragColor = texture2D(tDiffuse, vUv);
    gl_FragColor = vec4(vec3(val), 1.0);
  }`
};

export { PostProcessing };

