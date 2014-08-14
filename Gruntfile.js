module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['sonant.js', 'example-songs/4k-synth.js'],
            options: {
                es3: true, // ie 7 compatibility
                eqeqeq: true, // no == or !=
                immed: true, // forces () around directly called functions
                forin: true, // makes it harder to use for in
                latedef: "nofunc", // makes it impossible to use a variable before it is declared
                newcap: true, // force capitalized constructors
                strict: true, // enforce strict mode
                trailing: true, // trailing whitespaces are ugly
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('default', ['test']);

};
