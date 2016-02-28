module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	grunt.initConfig({
		htmlmin: { // Task
			dist: { // Target
				options: { // Target options
					removeComments: true,
					collapseWhitespace: true
				},
				files: { // Dictionary of files
					'dist/index.html': 'src/index.html'
				}
			}
		},

		postcss: {
			options: {
				map: true, // inline sourcemaps

				processors: [require('pixrem')(), require('autoprefixer')({
					browsers: 'last 2 versions'
				}), require('cssnano')()]
			},
			dist: {
				src: 'src/css/style.css',
				dest: 'dist/css/style.css'
			}
		},

		uglify: {
			my_target: {
				files: [{
					expand: true,
					cwd: 'src',
					src: 'js/*.js',
					dest: 'dist/'
				}]
			}
		},

		imagemin: { // Task
			dynamic: { // Another target
				options: { // Target options
					optimizationLevel: 3
				},
				files: [{
					expand: true, // Enable dynamic expansion
					cwd: 'src/', // Src matches are relative to this path
					src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
					dest: 'dist/' // Destination path prefix
				}]
			}
		}
	});

	grunt.registerTask('default', ['htmlmin', 'postcss', 'uglify', 'imagemin']);
};
