#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
float PI = 3.141592653589793238;

uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vEyeVector;
varying vec3 vBary;

vec2 hash22(vec2 p){
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
	p3 += dot(p3, p3.yzx+19.19);
	return fract((p3.xx+p3.yz)*p3.zy);
}

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

	vec3 X = dFdx(vNormal);
	vec3 Y = dFdy(vNormal);
	vec3 normal=normalize(cross(X,Y));
	float diffuse = dot(normal, vec3(1.0));
	vec2 randUV = hash22(vec2(floor(diffuse*5.0)));

	vec2 newUv = randUV * gl_FragCoord.xy/vec2(1000.0);

	vec3 refracted = refract(vEyeVector, normal, 1./3.);
	newUv += refracted.xy * 0.2;

	vec4 t = texture2D(uTexture, newUv);

	float width = 2.0;
	vec3 d = fwidth(vBary);
	vec3 s = smoothstep( d * (width + 0.5), d * (width - 0.5), vBary);
	float line = max(s.x, max(s.y, s.z));


	// gl_FragColor = vec4(diffuse,diffuse, diffuse,1.);
	// gl_FragColor = vec4(diffuse*5.0,diffuse*5.0, diffuse*5.0,1.);
	// gl_FragColor = vec4(floor(diffuse*5.0), floor(diffuse*5.0), floor(diffuse*5.0),1.);
	// gl_FragColor = vec4(randUV.x, randUV.x, randUV.x,1.);
	// gl_FragColor = vec4(randUV, 0.0,1.);
	// gl_FragColor = t;
	gl_FragColor = vec4(line,line, line, 1.0);
	// gl_FragColor = vec4(d, 1.0);
}