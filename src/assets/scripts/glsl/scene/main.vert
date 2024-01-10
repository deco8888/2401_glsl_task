uniform float uPointSize;

void main() {

	#include <begin_vertex>

	#include <project_vertex>

	gl_PointSize = uPointSize;

}