const PostProcessing = {
  uniforms: {
    'tDiffuse': {value: null},
    'uShiftVal': {value: 0},
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
  uniform float uShiftVal;

  varying highp vec2 vUv;

  // from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  void main(){
    vec2 shift = vec2(0.01, 0.01) * uShiftVal;
    vec4 t1= texture2D(tDiffuse, vUv + shift);
    vec4 t2= texture2D(tDiffuse, vUv);
    vec4 t3= texture2D(tDiffuse, vUv - shift);

    // black and white
    vec3 color1 = vec3((t1.r + t1.g + t1.b) / 5.0);
    vec3 color2 = vec3((t2.r + t2.g + t2.b) / 5.0);
    vec3 color3 = vec3((t3.r + t3.g + t3.b) / 5.0);

    // rgb shift
    vec3 shift_color = vec3(color1.x , color2.y, color3.z);

    // noise
    float val = hash(vUv + uTime)*0.3;

    vec2 dxy = pixelSize / resolution;
    vec2 coord = dxy * floor( vUv / dxy );
    // gl_FragColor = texture2D(tDiffuse, vUv);
    gl_FragColor = vec4(shift_color, 1.0);
  }`
};

export { PostProcessing };

