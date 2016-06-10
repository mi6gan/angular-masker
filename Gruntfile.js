module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            angularmasker: {
                files: {
                    'dist/angular-masker.js': ['src/angular-masker.js']
                }
            }
        },
        uglify: {
            angularmasker: {
                options: {
                    report: 'min',
                    mangle: false,
                    sourceMap: true
                },
                files: {
                    'dist/angular-masker.min.js': ['dist/angular-masker.js']
                }
            }
        },
        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['browserify', 'uglify']
            },
            src: {
                files: ['src/**'],
                tasks: ['browserify', 'uglify']
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['browserify', 'uglify']);
};
