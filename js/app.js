import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { PostProcessing } from "./postprocessing.js";


import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
import texture from "../img/uv.jpg";



export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.count = 0;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );


    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 15);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.initpost();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  initpost() {
    this.renderScene = new RenderPass( this.scene, this.camera );

    this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.9, 0.85 );

    this.custom_pass = new ShaderPass( PostProcessing );


    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( this.renderScene );
    this.composer.addPass( this.bloomPass );
    this.composer.addPass( this.custom_pass );
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0.6,
      uShiftVal: 1.0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 6, 0.01);
    this.gui.add(this.settings, "uShiftVal", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    this.camera.updateProjectionMatrix();


  }

  addObjects() {
    let that = this;
    let t = new THREE.TextureLoader().load(texture);
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: t },
        progress: { value: 0.6 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    

    
    this.geometry = new THREE.IcosahedronGeometry(2, 1);
    this.geometryBuffer = new THREE.IcosahedronBufferGeometry(2, 1);

    let geo_count = this.geometryBuffer.attributes.position.count;
    const bary = new Float32Array(geo_count* 3); // XYZ
    for (let i = 0; i < geo_count/3; i++) {
      // bary.push(0, 0, 1,  0, 1, 0,  1, 0, 0);
      let i9 = i * 9;
      bary[i9 + 0] = 1;
      bary[i9 + 1] = 0;
      bary[i9 + 2] = 0;
      bary[i9 + 3] = 0;
      bary[i9 + 4] = 1;
      bary[i9 + 5] = 0;
      bary[i9 + 6] = 0;
      bary[i9 + 7] = 0;
      bary[i9 + 8] = 1;
    }
    this.geometryBuffer.setAttribute('aBary', new THREE.BufferAttribute(bary, 3));
    // console.log(this.geometryBuffer.attributes.aBary.array);

    this.mesh = new THREE.Mesh(this.geometryBuffer,this.material)
    this.scene.add(this.mesh)

  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;

    this.mesh.rotation.y  = this.time/100;
    this.mesh.rotation.x  = this.time/30;
    this.custom_pass.uniforms.uTime.value = this.time;
    this.custom_pass.uniforms.uShiftVal.value = this.settings.uShiftVal;

    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render(this.scene, this.camera);

  }
}

new Sketch({
  dom: document.getElementById("container")
});
