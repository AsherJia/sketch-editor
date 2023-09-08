#version 100

attribute vec2 a_position;
attribute vec2 a_texCoords;
varying vec2 v_texCoords;
attribute float a_opacity;
varying float v_opacity;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_texCoords = a_texCoords;
  v_opacity = a_opacity;
}
